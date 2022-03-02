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
import { EditorMouseEvent, Operation } from "../figureeditor"
import { Path as RawPath } from "../paths/Path"
import { Path } from "../figures/Path"
import { distancePointToPoint, pointMinusPoint, pointPlusPoint, pointMultiplyNumber } from "shared/geometry"
import { Rectangle } from "shared/geometry/Rectangle"
import { Point } from "shared/geometry/Point"

import { figure } from "shared/workflow"

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
    DOWN_POINT,
    DOWN_CURVE,
    UP_CURVE,
    DOWN_CURVE_POINT,
    DOWN_CURVE_CURVE,
    UP_X_CURVE,

    UP_POINT,
    DOWN_POINT_POINT,
    DOWN_POINT_CURVE,

    DOWN_CURVE_CLOSE,
    DOWN_CURVE_CLOSE_CURVE
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
    path?: RawPath // the outline during editing
    figure?: Path // the figure we create

    anchors: SVGRectElement[] = []
    _handles = new Array<SVGCircleElement>(4)
    lines = new Array<SVGLineElement>(4)

    edgeHandle?: Point

    constructor() {
        super()
    }

    override activate(event: EditorMouseEvent) {
        Tool.selection.clear()
        this.setCursor(event, Cursor.READY)
    }

    override deactivate(event: EditorMouseEvent) {
        this.clear(event)
        this.setCursor(event, Cursor.DEFAULT)
    }

    wasMove = false

    override mouseEvent(event: EditorMouseEvent) {
        if (!this.wasMove || event.type !== "mousemove") {
            // console.log(`PenTool.mouseEvent(): state=${State[this.state]}, type=${event.type}`)
        }
        this.wasMove = event.type === "mousemove"
        // console.log(this.figure?.toInternalString())

        switch (this.state) {
            case State.READY:
                switch (event.type) {
                    case "mousedown":
                        this.setCursor(event, Cursor.DIRECT)
                        this.prepareEditor(event)
                        // start with a single anchor rectangle [] where the pointer went down
                        this.addAnchor(event)
                        this.path!.move(event)
                        this.figure!.addEdge(event)
                        this.state = State.DOWN_POINT
                        break
                } break

            case State.DOWN_POINT:
                switch (event.type) {
                    case "mousemove": {
                        if (distancePointToPoint(event.editor.mouseDownAt!, event) > Figure.DRAG_START_DISTANCE) {
                            const anchor = event.editor.mouseDownAt!
                            const forwardHandle = event
                            const backwardHandle = mirrorPoint(anchor, forwardHandle)
                            this.updateHandle(Handle.PREVIOUS_FORWARD, anchor, forwardHandle)
                            this.updateHandle(Handle.CURRENT_BACKWARD, anchor, backwardHandle)
                            this.path!.curve(event, new Point(), new Point())
                            this.state = State.DOWN_CURVE
                        }
                    } break
                    case "mouseup":
                        this.setCursor(event, Cursor.ACTIVE)
                        this.state = State.UP_POINT
                        break
                } break

            case State.DOWN_CURVE:
                switch (event.type) {
                    case "mousemove": {
                        const anchor = event.editor.mouseDownAt!
                        const forwardHandle = event
                        const backwardHandle = mirrorPoint(anchor, forwardHandle)
                        this.updateHandle(Handle.PREVIOUS_FORWARD, anchor, forwardHandle)
                        this.updateHandle(Handle.CURRENT_BACKWARD, anchor, backwardHandle)
                        const path = this.path!
                        const segment = path.data[path.data.length - 1]
                        if (segment.type !== 'C') {
                            throw Error("yikes")
                        }
                        segment.values[0] = event.x
                        segment.values[1] = event.y
                    } break
                    case "mouseup": {
                        this.state = State.UP_CURVE
                        const path = this.path!
                        const segment = path.data[path.data.length - 1]!
                        if (segment.type !== 'C') {
                            throw Error("yikes")
                        }
                        this.figure!.changeEdgeToEdgeAngle(event)
                        this.setCursor(event, Cursor.ACTIVE)
                    } break
                } break

            case State.UP_CURVE:
                switch (event.type) {
                    case "mousedown": {
                        this.setCursor(event, Cursor.DIRECT)
                        this.addAnchor(event)
                        this.updateHandle(Handle.CURRENT_BACKWARD)
                        const path = this.path!
                        const segment = path.data[path.data.length - 1]
                        if (segment.type !== 'C') {
                            throw Error("yikes")
                        }
                        segment.values[2] = segment.values[4] = event.x
                        segment.values[3] = segment.values[5] = event.y
                        this.updateSVG(event)
                        this.state = State.DOWN_CURVE_POINT
                    } break
                } break

            case State.DOWN_CURVE_POINT:
                switch (event.type) {
                    case "mousemove": {
                        if (distancePointToPoint(event.editor.mouseDownAt!, event) > Figure.DRAG_START_DISTANCE) {
                            const anchor = event.editor.mouseDownAt!
                            const forwardHandle = event
                            const backwardHandle = mirrorPoint(anchor, forwardHandle)
                            this.updateHandle(Handle.CURRENT_FORWARD, anchor, forwardHandle)
                            this.updateHandle(Handle.CURRENT_BACKWARD, anchor, backwardHandle)
                            const path = this.path!
                            const segment = path.data[path.data.length - 1]
                            if (segment.type !== 'C') {
                                throw Error("yikes")
                            }
                            segment.values[2] = backwardHandle.x
                            segment.values[3] = backwardHandle.y
                            this.updateSVG(event)
                            this.state = State.DOWN_CURVE_CURVE
                        }
                    } break
                    case "mouseup": {
                        this.setCursor(event, Cursor.ACTIVE)
                        const path = this.path!
                        const segment = path.data[path.data.length - 1]
                        if (segment.type !== 'C') {
                            throw Error("yikes")
                        }
                        if (this.figure!.types[this.figure!.types.length - 1] === figure.AnchorType.ANCHOR_ANGLE_EDGE) {
                            this.figure!.changeAngleEdgeToSymmetric()
                            this.figure!.addEdge(
                                { x: segment.values[4], y: segment.values[5] }
                            )
                        } else {
                            this.figure!.addAngleEdge(
                                { x: segment.values[2], y: segment.values[3] },
                                { x: segment.values[4], y: segment.values[5] }
                            )
                        }
                        event.editor.model?.modified.trigger({
                            operation: Operation.UPDATE_FIGURES,
                            figures: [this.figure!.id]
                        })
                        this.state = State.UP_POINT
                    } break
                } break

            case State.DOWN_CURVE_CURVE:
                switch (event.type) {
                    case "mousemove": {
                        const anchor = event.editor.mouseDownAt!
                        const forwardHandle = event
                        const backwardHandle = mirrorPoint(anchor, forwardHandle)
                        this.updateHandle(Handle.CURRENT_FORWARD, anchor, forwardHandle)
                        this.updateHandle(Handle.CURRENT_BACKWARD, anchor, backwardHandle)
                        const path = this.path!
                        const segment = path.data[path.data.length - 1]
                        if (segment.type !== 'C') {
                            throw Error("yikes")
                        }
                        segment.values[2] = backwardHandle.x
                        segment.values[3] = backwardHandle.y
                        this.updateSVG(event)
                    } break

                    case "mouseup": {
                        this.setCursor(event, Cursor.ACTIVE)
                        const path = this.path!
                        const segment = path.data[path.data.length - 1]
                        if (segment.type !== 'C') {
                            throw Error("yikes")
                        }
                        this.figure!.changeAngleEdgeToSymmetric()
                        this.figure!.addAngleEdge(
                            { x: segment.values[2], y: segment.values[3] },
                            { x: segment.values[4], y: segment.values[5] }
                        )
                        event.editor.model?.modified.trigger({
                            operation: Operation.UPDATE_FIGURES,
                            figures: [this.figure!.id]
                        })

                        this.state = State.UP_X_CURVE
                    } break
                } break

            case State.UP_X_CURVE:
                switch (event.type) {
                    case "mousedown": {
                        this.setCursor(event, Cursor.DIRECT)
                        const path = this.path!
                        const segment = path.data[path.data.length - 1]
                        if (segment.type !== 'C') {
                            throw Error("yikes")
                        }
                        let h0 = { x: segment.values[2], y: segment.values[3] }
                        const a0 = { x: segment.values[4], y: segment.values[5] }
                        h0 = mirrorPoint(a0, h0)
                        if (this.isFirstAnchor(event)) {
                            this.state = State.DOWN_CURVE_CLOSE
                            this.path!.curve(h0, event, event)
                            this.updateSVG(event)
                            break
                        }

                        this.updateHandle(Handle.PREVIOUS_FORWARD, a0, h0)
                        this.updateHandle(Handle.CURRENT_BACKWARD)
                        this.updateHandle(Handle.CURRENT_FORWARD)

                        this.addAnchor(event)
                        this.path!.curve(h0, event, event)
                        this.updateSVG(event)
                        this.state = State.DOWN_CURVE_POINT
                    } break
                } break

            case State.UP_POINT:
                switch (event.type) {
                    case "mousedown":
                        this.setCursor(event, Cursor.DIRECT)
                        this.addAnchor(event)
                        this.path!.line(event)
                        this.updateSVG(event)
                        this.state = State.DOWN_POINT_POINT
                        break
                } break

            case State.DOWN_POINT_POINT:
                switch (event.type) {
                    case "mousemove": {
                        if (distancePointToPoint(event.editor.mouseDownAt!, event) > Figure.DRAG_START_DISTANCE) {
                            const path = this.path!
                            const segment = path.data[path.data.length - 1]
                            if (segment.type !== 'L') {
                                throw Error("yikes")
                            }
                            const segment0 = path.data[path.data.length - 2]
                            let curveStartPoint
                            switch (segment0.type) {
                                case 'M':
                                case 'L':
                                    curveStartPoint = { x: segment0.values[0], y: segment0.values[1] }
                                    break
                                case 'C':
                                    curveStartPoint = { x: segment0.values[4], y: segment0.values[5] }
                                    break
                                default:
                                    throw Error("yikes")
                            }
                            const anchor = event.editor.mouseDownAt!
                            const forwardHandle = event
                            const backwardHandle = mirrorPoint(anchor, forwardHandle)
                            segment.type = 'C'
                            segment.values = [
                                curveStartPoint.x, curveStartPoint.y,
                                backwardHandle.x, backwardHandle.y,
                                anchor.x, anchor.y
                            ]
                            this.updateSVG(event)
                            this.updateHandle(Handle.PREVIOUS_FORWARD, anchor, forwardHandle)
                            this.updateHandle(Handle.CURRENT_BACKWARD, anchor, backwardHandle)
                            this.state = State.DOWN_POINT_CURVE
                        }
                    } break
                    case "mouseup": {
                        this.setCursor(event, Cursor.ACTIVE)
                        const path = this.path!
                        const segment = path.data[path.data.length - 1]
                        if (segment.type !== 'L') {
                            throw Error("yikes")
                        }
                        // this.figure!.line(
                        //     { x: segment.values[0], y: segment.values[1] },
                        // )
                        this.figure!.addEdge({ x: segment.values[0], y: segment.values[1] })
                        event.editor.model?.modified.trigger({
                            operation: Operation.UPDATE_FIGURES,
                            figures: [this.figure!.id]
                        })

                        this.state = State.UP_POINT
                    } break
                } break

            case State.DOWN_POINT_CURVE:
                switch (event.type) {
                    case "mouseup": {
                        this.setCursor(event, Cursor.ACTIVE)
                        const path = this.path!
                        const segment = path.data[path.data.length - 1]
                        if (segment.type !== 'C') {
                            throw Error("yikes")
                        }
                        this.figure?.addAngleEdge(
                            { x: segment.values[2], y: segment.values[3] },
                            { x: segment.values[4], y: segment.values[5] }
                        )
                        event.editor.model?.modified.trigger({
                            operation: Operation.UPDATE_FIGURES,
                            figures: [this.figure!.id]
                        })
                        this.state = State.UP_X_CURVE
                    } break
                    case "mousemove": {
                        const path = this.path!
                        const segment = path.data[path.data.length - 1] // FIXME: why not have a current segment variable?
                        if (segment.type !== 'C') {
                            throw Error("yikes")
                        }
                        const anchor = event.editor.mouseDownAt!
                        const forwardHandle = event
                        const backwardHandle = mirrorPoint(anchor, forwardHandle)
                        segment.values[2] = backwardHandle.x
                        segment.values[3] = backwardHandle.y
                        this.updateSVG(event)
                        this.updateHandle(Handle.PREVIOUS_FORWARD, anchor, forwardHandle)
                        this.updateHandle(Handle.CURRENT_BACKWARD, anchor, backwardHandle)
                    } break
                } break

            case State.DOWN_CURVE_CLOSE:
                switch (event.type) {
                    case "mouseup":
                        this.state = State.READY
                        this.setCursor(event, Cursor.READY)
                        this.figure!.changeAngleEdgeToSymmetric()
                        this.figure!.addClose()
                        event.editor.model?.modified.trigger({
                            operation: Operation.UPDATE_FIGURES,
                            figures: [this.figure!.id]
                        })
                        break
                    case "mousemove":
                        if (distancePointToPoint(event.editor.mouseDownAt!, event) > Figure.DRAG_START_DISTANCE) {
                            this.state = State.DOWN_CURVE_CLOSE_CURVE
                            if (this.figure!.types[0] !== figure.AnchorType.ANCHOR_EDGE_ANGLE) {
                                throw Error("yikes")
                            }
                            const virtualforwardHandle = event
                            const anchor = {x: this.figure!.values[0], y: this.figure!.values[1]}
                            let forwardHandle = {x: this.figure!.values[2], y: this.figure!.values[3]}
                            const backwardHandle = mirrorPoint(anchor, virtualforwardHandle)
                            const d0 = distancePointToPoint(anchor, backwardHandle)
                            const d1 = distancePointToPoint(anchor, forwardHandle)

                            const d = pointMultiplyNumber(pointMinusPoint(virtualforwardHandle, anchor), d1/d0)
                            forwardHandle = pointPlusPoint(anchor, d)

                            const path = this.path!
                            const segmentHead = path.data[1]
                            const segmentTail = path.data[path.data.length - 1]
                            if (segmentHead.type !== 'C') {
                                throw Error("yikes")
                            }
                            if (segmentTail.type !== 'C') {
                                throw Error("yikes")
                            }
                            segmentHead.values[0] = forwardHandle.x
                            segmentHead.values[1] = forwardHandle.y
                            segmentTail.values[2] = backwardHandle.x
                            segmentTail.values[3] = backwardHandle.y

                            const v0 = path.data[path.data.length - 2].values!
                            const v2 = segmentHead.values

                            this.updateSVG(event)
                            this.updateHandle(Handle.PREVIOUS_FORWARD,
                                {x: v0[v0.length-2], y: v0[v0.length-1]},
                                {x: segmentTail.values[0], y: segmentTail.values[1]}
                            )
                            this.updateHandle(Handle.CURRENT_BACKWARD, anchor, backwardHandle)
                            this.updateHandle(Handle.CURRENT_FORWARD, anchor, forwardHandle)
                            this.updateHandle(Handle.NEXT_BACKWARD,
                                {x: v2[v2.length-2], y: v2[v2.length-1]},
                                {x: v2[v2.length-4], y: v2[v2.length-3]}
                            )
                        }
                        break
                } break
            case State.DOWN_CURVE_CLOSE_CURVE:
                switch (event.type) {
                    case "mousemove": {
                        if (this.figure!.types[0] !== figure.AnchorType.ANCHOR_EDGE_ANGLE) {
                            throw Error("yikes")
                        }
                        const virtualforwardHandle = event
                        const anchor = {x: this.figure!.values[0], y: this.figure!.values[1]}
                        let forwardHandle = {x: this.figure!.values[2], y: this.figure!.values[3]}
                        const backwardHandle = mirrorPoint(anchor, virtualforwardHandle)
                        const d0 = distancePointToPoint(anchor, backwardHandle)
                        const d1 = distancePointToPoint(anchor, forwardHandle)

                        const d = pointMultiplyNumber(pointMinusPoint(virtualforwardHandle, anchor), d1/d0)
                        forwardHandle = pointPlusPoint(anchor, d)

                        const path = this.path!
                        const segmentHead = path.data[1]
                        const segmentTail = path.data[path.data.length - 1]
                        if (segmentHead.type !== 'C') {
                            throw Error("yikes")
                        }
                        if (segmentTail.type !== 'C') {
                            throw Error("yikes")
                        }
                        segmentHead.values[0] = forwardHandle.x
                        segmentHead.values[1] = forwardHandle.y
                        segmentTail.values[2] = backwardHandle.x
                        segmentTail.values[3] = backwardHandle.y

                        const v0 = path.data[path.data.length - 2].values!
                        const v2 = segmentHead.values

                        this.updateSVG(event)
                        this.updateHandle(Handle.PREVIOUS_FORWARD,
                            {x: v0[v0.length-2], y: v0[v0.length-1]},
                            {x: segmentTail.values[0], y: segmentTail.values[1]}
                        )
                        this.updateHandle(Handle.CURRENT_BACKWARD, anchor, backwardHandle)
                        this.updateHandle(Handle.CURRENT_FORWARD, anchor, forwardHandle)
                        this.updateHandle(Handle.NEXT_BACKWARD,
                            {x: v2[v2.length-2], y: v2[v2.length-1]},
                            {x: v2[v2.length-4], y: v2[v2.length-3]}
                        )
                    } break
                    case "mouseup": {
                        this.state = State.READY
                        this.setCursor(event, Cursor.READY)
                        const path = this.path!
                        const segmentHead = path.data[1]
                        const segmentTail = path.data[path.data.length - 1]
                        this.figure!.changeAngleEdgeToSymmetric()
                        this.figure!.changeEdgeAngleToSmooth(0,
                            {x: segmentTail.values![2], y:segmentTail.values![3]},
                            {x: segmentHead.values![0], y:segmentHead.values![1]}
                        )
                        this.figure!.addClose()
                        event.editor.model?.modified.trigger({
                            operation: Operation.UPDATE_FIGURES,
                            figures: [this.figure!.id]
                        })
                    } break   
                }
        }
    }

    protected prepareEditor(event: EditorMouseEvent) {
        this.clear(event)

        this.decoration = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.decoration.id = "pen-tool-decoration"
        this.updateBoundary() // FIXME: side effect
        event.editor.decorationOverlay.appendChild(this.decoration)

        this.path = new RawPath()
        this.svg = this.path.createSVG()
        this.setOutlineColors(this.svg)
        this.decoration.appendChild(this.svg)

        this.figure = new Path() // FIXME: won't work in client/server mode
        if (event.editor.strokeAndFillModel) {
            this.figure.stroke = event.editor.strokeAndFillModel.stroke
            this.figure.fill = event.editor.strokeAndFillModel.fill
        }
        event.editor.addFigure(this.figure)
    }

    clear(event: EditorMouseEvent) {
        this.state = State.READY
        this.anchors = []
        this._handles = new Array<SVGCircleElement>(4)
        this.lines = new Array<SVGLineElement>(4)
        if (this.decoration) {
            event.editor.decorationOverlay.removeChild(this.decoration)
        }
        this.decoration = undefined
        this.path = undefined
        this.svg = undefined
    }

    setCursor(event: EditorMouseEvent, cursor: Cursor) {
        switch (cursor) {
            case Cursor.DEFAULT:
                event.editor.svgView.style.cursor = ""
                break
            case Cursor.READY:
                event.editor.svgView.style.cursor = `url(${Tool.cursorPath}pen-ready.svg) 5 1, crosshair`
                break
            case Cursor.ACTIVE:
                event.editor.svgView.style.cursor = `url(${Tool.cursorPath}pen-active.svg) 5 1, crosshair`
                break
            case Cursor.DIRECT:
                event.editor.svgView.style.cursor = `url(${Tool.cursorPath}direct-selection-cursor.svg) 1 1, crosshair`
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

    createLine(p0: Point, p1: Point) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
        line.setAttributeNS("", "x1", `${p0.x}`)
        line.setAttributeNS("", "y1", `${p0.y}`)
        line.setAttributeNS("", "x2", `${p1.x}`)
        line.setAttributeNS("", "y2", `${p1.y}`)
        line.setAttributeNS("", "stroke", `rgb(79,128,255)`)
        return line
    }

    updateSVG(event: EditorMouseEvent) {
        this.path?.updateSVG(event.editor.decorationOverlay, this.svg as SVGPathElement)
    }
}
