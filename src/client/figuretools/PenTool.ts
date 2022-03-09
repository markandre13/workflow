/*
 *  workflow - A collaborative real-time white- and kanban board
 *  Copyright (C) 2018-2022 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// Quick orientation for myself before going to work:

// Similar tools:
// Curvature Tool (Shift+~): draw lines first, then bend them (isograph picking a curve?)
// how about combining this with the pen tool by moving add/remove anchor elsewhere?

// Pencil Tool (N): Freehand with fixed width (Icon: isograph/radiograph & winding line)
// Paintbrush Tool (B): Freehand with variable width (Icon: brush/nib)
// pencil, brush, nib, ... should all be the same tool, but with different configuration,
// similar to manga studio/cell studio paint, icon/cursor would be a nib, which might be
// confusion to illustrator users but it would be more realistic

// Blob Tool (Shift B): Like the marker tool I came up with (Icon: marker)

// Testing: I want visual unit tests for this!!!

import { Tool } from "./Tool"
import { Figure } from "../figures/Figure"
import { FigureEditor, EditorPointerEvent, Operation } from "../figureeditor"
import { Path } from "../figures/Path"
import { distancePointToPoint, pointMinusPoint, pointPlusPoint, pointMultiplyNumber } from "shared/geometry"
import { Rectangle } from "shared/geometry/Rectangle"
import { Point } from "shared/geometry/Point"

import { figure } from "shared/workflow"
import { EditorKeyboardEvent } from "client/figureeditor/EditorKeyboardEvent"

// FIXME: cursor: remove white border from tip and set center one pixel above tip
// FIXME: cursor: white surrounding for ready, edge, ...
// FIXME: use (document|body).onmousemove for mouse event outside browser
//        or https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture

enum Cursor {
    DEFAULT,
    READY,
    ACTIVE,
    DIRECT
    // CORNER, // this is a handle cursor
    // ADD_ANCHOR, // position dependent
    // DELETE_ANCHOR, // this is a handle cursor
    // CONTINUE, // this is a handle cursor
    // CLOSE // this is a handle cursor
}

export enum State {
    READY,

    DOWN_ADD_FIRST_ANCHOR,
    DOWN_DRAG_FIRST_ANCHOR,

    ACTIVE,
    DOWN_ADD_ANCHOR,
    DOWN_DRAG_ANCHOR,
    DOWN_DRAG_EDGE,
    DOWN_DRAG_LINE,

    DOWN_CLOSE_EDGE,
    DRAG_CLOSE_EDGE,

    DOWN_CLOSE_CURVE,
    DRAG_CLOSE_CURVE
}

enum Handle {
    PREVIOUS_FORWARD,
    CURRENT_BACKWARD,
    CURRENT_FORWARD,
    NEXT_BACKWARD
}

function mirrorPoint(center: Point, point: Point) {
    return pointMinusPoint(center, pointMinusPoint(point, center))
}

export class PenTool extends Tool {
    state = State.READY

    svg?: SVGElement
    _outline?: Path // the outline during editing
    figure?: Path // the figure we create

    anchors: SVGRectElement[] = []
    _handlePos = new Array<Point>(4)
    _handles = new Array<SVGCircleElement>(4)
    lines = new Array<SVGLineElement>(4)

    constructor() {
        super()
    }

    override activate(editor: FigureEditor) {
        Tool.selection.clear() // FIXME: when a path is selected, we must be able to continue editing
        this.setCursor(editor, Cursor.READY)
        Tool.setHint(`technical pen: <pointer>down</pointer>: add anchor, <pointer>drag</pointer>: smooth anchor, <alt/>+<pointer>drag</pointer>: sharp anchor`)
    }

    override deactivate(editor: FigureEditor) {
        this.clear(editor)
        this.setCursor(editor, Cursor.DEFAULT)
    }

    override keydown(event: EditorKeyboardEvent): void {
        switch (this.state) {
            case State.DOWN_DRAG_ANCHOR:
                switch (event.value) {
                    case "Alt":
                        this.state = State.DOWN_DRAG_EDGE
                        break
                    case "Control":
                        // this.state = State.DOWN_DRAG_LINE
                        break
                } break
        }
    }

    override keyup(event: EditorKeyboardEvent): void {
        switch (this.state) {
            case State.DOWN_DRAG_EDGE:
                switch (event.value) {
                    case "Alt": {
                        this.state = State.DOWN_DRAG_ANCHOR
                        const anchor = event.editor.mouseDownAt!
                        const forwardHandle = this.getHandlePos(Handle.CURRENT_FORWARD)
                        const backwardHandle = mirrorPoint(anchor, forwardHandle)
                        this._outline!.updateSymmetric(backwardHandle)
                        this.updateSVG(event.editor)
                        // this.updateHandle(Handle.CURRENT_FORWARD, anchor, forwardHandle)
                        this.updateHandle(Handle.CURRENT_BACKWARD, anchor, backwardHandle)
                        // this._outline!.changeSmoothAngleAngleToSymmetric()
                    } break
                    case "Control":
                        // this.state = State.DOWN_DRAG_LINE
                        break
                } break
        }
    }

    override pointerEvent(event: EditorPointerEvent) {
        // if (!this.wasMove || event.type !== "mousemove") {
        //     console.log(`PenTool.mouseEvent(): state=${State[this.state]}, type=${event.type}`)
        // }
        // console.log(this.figure?.toInternalString())

        switch (this.state) {
            case State.READY:
                switch (event.type) {
                    case "down":
                        this.prepareEditor(event)
                        this.setCursor(event.editor, Cursor.DIRECT)
                        this.state = State.DOWN_ADD_FIRST_ANCHOR
                        this.addAnchor(event)
                        this._outline!.addEdge(event)
                        this.updateSVG(event.editor)
                        this.figure!.addEdge(event)
                        break
                } break
            case State.DOWN_ADD_FIRST_ANCHOR:
                switch (event.type) {
                    case "move": {
                        if (distancePointToPoint(event.editor.mouseDownAt!, event) > Figure.DRAG_START_DISTANCE) {
                            this.state = State.DOWN_DRAG_FIRST_ANCHOR
                            const anchor = event.editor.mouseDownAt!
                            const forwardHandle = event
                            const backwardHandle = mirrorPoint(anchor, forwardHandle)
                            this.updateHandle(Handle.CURRENT_FORWARD, anchor, forwardHandle)
                            this.updateHandle(Handle.CURRENT_BACKWARD, anchor, backwardHandle)
                        }
                    } break
                    case "up": {
                        this.setCursor(event.editor, Cursor.ACTIVE)
                        this.state = State.ACTIVE
                    } break
                } break
            case State.DOWN_DRAG_FIRST_ANCHOR:
                switch (event.type) {
                    case "move": {
                        const anchor = event.editor.mouseDownAt!
                        const forwardHandle = event
                        const backwardHandle = mirrorPoint(anchor, forwardHandle)
                        this.updateHandle(Handle.CURRENT_FORWARD, anchor, forwardHandle)
                        this.updateHandle(Handle.CURRENT_BACKWARD, anchor, backwardHandle)
                    } break
                    case "up": {
                        this.setCursor(event.editor, Cursor.ACTIVE)
                        this.state = State.ACTIVE
                        const forwardHandle = event
                        this._outline!.changeEdgeToEdgeAngle(forwardHandle)
                        this.figure!.changeEdgeToEdgeAngle(forwardHandle)
                    } break
                } break
            case State.ACTIVE:
                switch (event.type) {
                    case "down":
                        if (this.isFirstAnchor(event)) {
                            this.setCursor(event.editor, Cursor.DIRECT)
                            switch (this._outline!.types[0]) {
                                case figure.AnchorType.ANCHOR_EDGE:
                                    this.state = State.DOWN_CLOSE_EDGE
                                    // FIXME: add a dummy point into the test to be able to check the handles
                                    break
                                case figure.AnchorType.ANCHOR_EDGE_ANGLE:
                                    this.state = State.DOWN_CLOSE_CURVE
                                    const anchor = { x: this._outline!.values[0], y: this._outline!.values[1] }
                                    const forwardHandle = { x: this._outline!.values[2], y: this._outline!.values[3] }
                                    this.updateHandle(Handle.CURRENT_FORWARD, anchor, forwardHandle)
                                    this.updateHandle(Handle.CURRENT_BACKWARD)
                                    break
                                default:
                                    throw Error(`PenTool: mousedown at state ACTIVE unexpected 1st anchor of type ${figure.AnchorType[this._outline!.types[0]]}`)
                            }
                            this._outline!.addClose()
                            this.updateSVG(event.editor)
                        } else {
                            this.setCursor(event.editor, Cursor.DIRECT)
                            this.state = State.DOWN_ADD_ANCHOR
                            this.addAnchor(event)
                            this._outline!.addEdge(event)
                            this.updateSVG(event.editor)
                            this.figure!.addEdge(event)
                            this.switchHandle(Handle.CURRENT_FORWARD, Handle.PREVIOUS_FORWARD)
                            this.updateHandle(Handle.CURRENT_BACKWARD)
                        }
                } break
            case State.DOWN_ADD_ANCHOR:
                switch (event.type) {
                    case "move": {
                        if (distancePointToPoint(event.editor.mouseDownAt!, event) > Figure.DRAG_START_DISTANCE) {
                            this.state = State.DOWN_DRAG_ANCHOR
                            const anchor = event.editor.mouseDownAt!
                            const forwardHandle = event
                            const backwardHandle = mirrorPoint(anchor, forwardHandle)
                            this._outline!.changeEdgeToSymmetric(backwardHandle)
                            this.updateSVG(event.editor)
                            this.updateHandle(Handle.CURRENT_FORWARD, anchor, forwardHandle)
                            this.updateHandle(Handle.CURRENT_BACKWARD, anchor, backwardHandle)
                        }
                    } break
                    case "up": {
                        this.setCursor(event.editor, Cursor.ACTIVE)
                        this.state = State.ACTIVE
                        event.editor.model!.modified.trigger({
                            operation: Operation.UPDATE_FIGURES,
                            figures: [this.figure!.id]
                        })
                    } break
                } break
            case State.DOWN_DRAG_ANCHOR:
                switch (event.type) {
                    case "move": {
                        const anchor = event.editor.mouseDownAt!
                        const forwardHandle = event
                        const backwardHandle = mirrorPoint(anchor, forwardHandle)
                        this._outline!.updateSymmetric(backwardHandle)
                        this.updateSVG(event.editor)
                        this.updateHandle(Handle.CURRENT_FORWARD, anchor, forwardHandle)
                        this.updateHandle(Handle.CURRENT_BACKWARD, anchor, backwardHandle)
                    } break
                    case "up": {
                        this.setCursor(event.editor, Cursor.ACTIVE)
                        this.state = State.ACTIVE
                        const anchor = event.editor.mouseDownAt!
                        const forwardHandle = event
                        const backwardHandle = mirrorPoint(anchor, forwardHandle)
                        this._outline!.updateSymmetric(backwardHandle)
                        this.updateSVG(event.editor)
                        this.figure!.changeEdgeToSymmetric(backwardHandle)
                        event.editor.model!.modified.trigger({
                            operation: Operation.UPDATE_FIGURES,
                            figures: [this.figure!.id]
                        })
                    } break
                } break
            case State.DOWN_DRAG_EDGE:
                switch (event.type) {
                    case "move": {
                        const anchor = event.editor.mouseDownAt!
                        const forwardHandle = event
                        this.updateHandle(Handle.CURRENT_FORWARD, anchor, forwardHandle)
                    } break
                    case "up": {
                        this.state = State.ACTIVE
                        this.setCursor(event.editor, Cursor.ACTIVE)
                        const backwardHandle = this.getHandlePos(Handle.CURRENT_BACKWARD)
                        const forwardHandle = event
                        this._outline!.changeSymmetricToSmoothAngleAngle(forwardHandle)
                        this.figure!.changeEdgeToSmoothAngleAngle(backwardHandle, forwardHandle)
                        event.editor.model!.modified.trigger({
                            operation: Operation.UPDATE_FIGURES,
                            figures: [this.figure!.id]
                        })
                    }break
                } break
            case State.DOWN_CLOSE_EDGE:
                switch (event.type) {
                    case "move":
                        if (distancePointToPoint(event.editor.mouseDownAt!, event) > Figure.DRAG_START_DISTANCE) {
                            this.state = State.DRAG_CLOSE_EDGE
                            const anchor = event.editor.mouseDownAt!
                            const forwardHandle = event
                            const backwardHandle = mirrorPoint(anchor, forwardHandle)
                            this.updateHandle(Handle.CURRENT_BACKWARD, anchor, backwardHandle)
                            this._outline!.changeEdgeToAngleEdge(0, backwardHandle)
                            this.updateSVG(event.editor)
                        }
                        break
                    case "up":
                        this.state = State.READY
                        this.setCursor(event.editor, Cursor.READY)
                        this.figure!.addClose()
                        event.editor.model!.modified.trigger({
                            operation: Operation.UPDATE_FIGURES,
                            figures: [this.figure!.id]
                        })
                        break
                } break
            case State.DRAG_CLOSE_EDGE:
                switch (event.type) {
                    case "move": {
                        const anchor = event.editor.mouseDownAt!
                        const forwardHandle = event
                        const backwardHandle = mirrorPoint(anchor, forwardHandle)
                        this.updateHandle(Handle.CURRENT_BACKWARD, anchor, backwardHandle)
                        this._outline!.updateAngleEdge(0, backwardHandle)
                        this.updateSVG(event.editor)
                    } break
                    case "up": {
                        this.setCursor(event.editor, Cursor.READY)
                        this.state = State.READY
                        const anchor = event.editor.mouseDownAt!
                        const forwardHandle = event
                        const backwardHandle = mirrorPoint(anchor, forwardHandle)
                        this.updateHandle(Handle.CURRENT_BACKWARD, anchor, backwardHandle)
                        this._outline!.updateAngleEdge(0, backwardHandle)
                        this.updateSVG(event.editor)
                        this.figure!.addClose()
                        this.figure!.changeEdgeToAngleEdge(0, backwardHandle)
                        event.editor.model!.modified.trigger({
                            operation: Operation.UPDATE_FIGURES,
                            figures: [this.figure!.id]
                        })
                    } break
                } break
            case State.DOWN_CLOSE_CURVE:
                switch (event.type) {
                    case "move":
                        if (distancePointToPoint(event.editor.mouseDownAt!, event) > Figure.DRAG_START_DISTANCE) {
                            this.state = State.DRAG_CLOSE_CURVE
                            const virtualforwardHandle = event
                            const anchor = { x: this.figure!.values[0], y: this.figure!.values[1] }
                            let forwardHandle = { x: this.figure!.values[2], y: this.figure!.values[3] }
                            const backwardHandle = mirrorPoint(anchor, virtualforwardHandle)
                            const d0 = distancePointToPoint(anchor, backwardHandle)
                            const d1 = distancePointToPoint(anchor, forwardHandle)
                            const d = pointMultiplyNumber(pointMinusPoint(virtualforwardHandle, anchor), d1 / d0)
                            forwardHandle = pointPlusPoint(anchor, d)
                            this.updateHandle(Handle.CURRENT_FORWARD, anchor, forwardHandle)
                            this.updateHandle(Handle.CURRENT_BACKWARD, anchor, backwardHandle)
                            this._outline!.changeEdgeAngleToSmooth(0,
                                backwardHandle,
                                forwardHandle
                            )
                            this.updateSVG(event.editor)
                        }
                        break
                    case "up":
                        this.state = State.READY
                        this.setCursor(event.editor, Cursor.READY)
                        this.figure!.addClose()
                        event.editor.model!.modified.trigger({
                            operation: Operation.UPDATE_FIGURES,
                            figures: [this.figure!.id]
                        })
                        break
                } break
            case State.DRAG_CLOSE_CURVE:
                switch (event.type) {
                    case "move": {
                        const virtualforwardHandle = event
                        const anchor = { x: this.figure!.values[0], y: this.figure!.values[1] }
                        let forwardHandle = { x: this.figure!.values[2], y: this.figure!.values[3] }
                        const backwardHandle = mirrorPoint(anchor, virtualforwardHandle)
                        const d0 = distancePointToPoint(anchor, backwardHandle)
                        const d1 = distancePointToPoint(anchor, forwardHandle)
                        const d = pointMultiplyNumber(pointMinusPoint(virtualforwardHandle, anchor), d1 / d0)
                        forwardHandle = pointPlusPoint(anchor, d)
                        this.updateHandle(Handle.CURRENT_FORWARD, anchor, forwardHandle)
                        this.updateHandle(Handle.CURRENT_BACKWARD, anchor, backwardHandle)
                        this._outline!.updateSmooth(0,
                            backwardHandle,
                            forwardHandle
                        )
                        this.updateSVG(event.editor)
                    } break
                    case "up": {
                        this.setCursor(event.editor, Cursor.READY)
                        this.state = State.READY
                        const virtualforwardHandle = event
                        const anchor = { x: this.figure!.values[0], y: this.figure!.values[1] }
                        let forwardHandle = { x: this.figure!.values[2], y: this.figure!.values[3] }
                        const backwardHandle = mirrorPoint(anchor, virtualforwardHandle)
                        const d0 = distancePointToPoint(anchor, backwardHandle)
                        const d1 = distancePointToPoint(anchor, forwardHandle)
                        const d = pointMultiplyNumber(pointMinusPoint(virtualforwardHandle, anchor), d1 / d0)
                        forwardHandle = pointPlusPoint(anchor, d)
                        this.updateHandle(Handle.CURRENT_FORWARD, anchor, forwardHandle)
                        this.updateHandle(Handle.CURRENT_BACKWARD, anchor, backwardHandle)
                        this._outline!.updateSmooth(0, backwardHandle, forwardHandle)
                        this.figure!.addClose()
                        this.figure!.changeEdgeAngleToSmooth(0, backwardHandle, forwardHandle)
                        event.editor.model!.modified.trigger({
                            operation: Operation.UPDATE_FIGURES,
                            figures: [this.figure!.id]
                        })
                    } break
                } break
        }
    }

    protected prepareEditor(event: EditorPointerEvent) {
        this.clear(event.editor)
        Tool.selection.clear()

        this.decoration = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.decoration.id = "pen-tool-decoration"
        this.updateBoundary() // FIXME: side effect
        event.editor.decorationOverlay.appendChild(this.decoration)

        this._outline = new Path()
        this.svg = this._outline.getPath().createSVG()
        this.setOutlineColors(this.svg)
        this.decoration.appendChild(this.svg)

        this.figure = new Path() // FIXME: won't work in client/server mode
        if (event.editor.strokeAndFillModel) {
            this.figure.stroke = event.editor.strokeAndFillModel.stroke
            this.figure.fill = event.editor.strokeAndFillModel.fill
        }
        event.editor.addFigure(this.figure)
    }

    clear(editor: FigureEditor) {
        this.state = State.READY
        this.anchors = []
        this._handles = new Array<SVGCircleElement>(4)
        this.lines = new Array<SVGLineElement>(4)
        if (this.decoration) {
            editor.decorationOverlay.removeChild(this.decoration)
        }
        this.decoration = undefined
        this._outline = undefined
        this.svg = undefined
    }

    setCursor(editor: FigureEditor, cursor: Cursor) {
        switch (cursor) {
            case Cursor.DEFAULT:
                editor.svgView.style.cursor = ""
                break
            case Cursor.READY:
                editor.svgView.style.cursor = `url(${Tool.cursorPath}pen-ready.svg) 5 1, crosshair`
                break
            case Cursor.ACTIVE:
                editor.svgView.style.cursor = `url(${Tool.cursorPath}pen-active.svg) 5 1, crosshair`
                break
            case Cursor.DIRECT:
                editor.svgView.style.cursor = `url(${Tool.cursorPath}edit-cursor.svg) 1 1, crosshair`
                break
        }
    }

    createAnchor(p: Point) {
        let x = p.x - Figure.HANDLE_RANGE / 2.0
        let y = p.y - Figure.HANDLE_RANGE / 2.0
        x = Math.round(x - 0.5) + 0.5
        y = Math.round(y - 0.5) + 0.5

        let anchor = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        anchor.setAttributeNS("", "x", `${x}`)
        anchor.setAttributeNS("", "y", `${y}`)
        anchor.setAttributeNS("", "width", `${Figure.HANDLE_RANGE}`)
        anchor.setAttributeNS("", "height", `${Figure.HANDLE_RANGE}`)
        anchor.setAttributeNS("", "stroke", "rgb(79,128,255)")
        anchor.setAttributeNS("", "fill", "#fff")
        return anchor
    }

    addAnchor(p: Point) {
        if (this.anchors.length > 1) {
            this.anchors[this.anchors.length - 1].style.cursor = ""
        }
        const anchor = this.createAnchor(p)
        if (this.anchors.length === 0) {
            anchor.style.cursor = `url(${Tool.cursorPath}pen-close.svg) 5 1, crosshair`
        } else {
            anchor.style.cursor = `url(${Tool.cursorPath}pen-edge.svg) 5 1, crosshair`
        }
        this.decoration!.appendChild(anchor)
        this.anchors.push(anchor)
    }

    isFirstAnchor(p: Point) {
        if (this.anchors.length === 0)
            return false
        const first = this.anchors[0]
        const rect = new Rectangle(
            Number.parseFloat(first.getAttributeNS(null, "x")!),
            Number.parseFloat(first.getAttributeNS(null, "y")!),
            Number.parseFloat(first.getAttributeNS(null, "width")!),
            Number.parseFloat(first.getAttributeNS(null, "height")!)
        )
        return rect.inside(p)
    }

    isLastAnchor(p: Point) {
        if (this.anchors.length === 0)
            return false
        const last = this.anchors[this.anchors.length - 1]
        const rect = new Rectangle(
            Number.parseFloat(last.getAttributeNS(null, "x")!),
            Number.parseFloat(last.getAttributeNS(null, "y")!),
            Number.parseFloat(last.getAttributeNS(null, "width")!),
            Number.parseFloat(last.getAttributeNS(null, "height")!)
        )
        return rect.inside(p)
    }

    // use updateHandle
    private _createHandle(p: Point) {
        const x = Math.round(p.x - 0.5) + 0.5
        const y = Math.round(p.y - 0.5) + 0.5

        const handle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        handle.setAttributeNS("", "cx", `${x}`)
        handle.setAttributeNS("", "cy", `${y}`)
        handle.setAttributeNS("", "r", `${Figure.HANDLE_RANGE / 2.0}`)
        handle.setAttributeNS("", "stroke", `rgb(79,128,255)`)
        handle.setAttributeNS("", "fill", `rgb(79,128,255)`)
        return handle
    }

    updateHandle(idx: Handle): void
    updateHandle(idx: Handle, anchorPos: Point, handlePos: Point): void
    updateHandle(idx: Handle, anchorPos?: Point, handlePos?: Point): void {
        if (anchorPos === undefined) {
            if (this._handles[idx] !== undefined) {
                this._handles[idx].style.display = "none"
                this.lines[idx].style.display = "none"
            }
            return
        }
        if (handlePos === undefined)
            throw Error("yikes")

        this._handlePos[idx] = handlePos
        if (this._handles[idx] === undefined) {
            this._handles[idx] = this._createHandle(handlePos)
            this.decoration!.appendChild(this._handles[idx])
            this.lines[idx] = this.createLine(anchorPos, handlePos)
            this.decoration!.appendChild(this.lines[idx])
        } else {
            this._handles[idx].style.display = ""
            this.lines[idx].style.display = ""
            const x = Math.round(handlePos.x - 0.5) + 0.5
            const y = Math.round(handlePos.y - 0.5) + 0.5
            this._handles[idx].setAttributeNS("", "cx", `${x}`)
            this._handles[idx].setAttributeNS("", "cy", `${y}`)
            this.lines[idx].setAttributeNS("", "x1", `${anchorPos.x}`)
            this.lines[idx].setAttributeNS("", "y1", `${anchorPos.y}`)
            this.lines[idx].setAttributeNS("", "x2", `${handlePos.x}`)
            this.lines[idx].setAttributeNS("", "y2", `${handlePos.y}`)
        }
    }
    switchHandle(idxOld: Handle, idxNew: Handle) {
        [
            this._handles[idxOld],
            this._handles[idxNew],
            this.lines[idxOld],
            this.lines[idxNew],
            this._handlePos[idxOld],
            this._handlePos[idxNew]
        ] = [
                this._handles[idxNew],
                this._handles[idxOld],
                this.lines[idxNew],
                this.lines[idxOld],
                this._handlePos[idxNew],
                this._handlePos[idxOld]
            ]
        this.updateHandle(idxOld)
    }
    getHandlePos(idx: Handle): Point {
        return this._handlePos[idx]
    }

    createLine(p0: Point, p1: Point) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
        line.setAttributeNS("", "x1", `${p0.x}`)
        line.setAttributeNS("", "y1", `${p0.y}`)
        line.setAttributeNS("", "x2", `${p1.x}`)
        line.setAttributeNS("", "y2", `${p1.y}`)
        line.setAttributeNS("", "stroke", `rgb(79,128,255)`)
        return line
    }

    updateSVG(editor: FigureEditor) {
        // this.svg!.setAttributeNS("", "d", this._outline!.getPath().toString())
        this._outline!.getPath().updateSVG(editor.decorationOverlay, this.svg as SVGPathElement)
    }
}
