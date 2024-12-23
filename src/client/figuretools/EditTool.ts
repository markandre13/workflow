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

import { FigureEditor, EditorPointerEvent, Operation } from "../figureeditor"
import { Tool } from "./Tool"
import { Path } from "../figures/Path"
import { pointMinusPoint, pointPlusPoint, mirrorPoint, distancePointToPoint, pointMultiplyNumber } from "shared/geometry"
import { Point } from "shared/geometry/Point"
import { Matrix } from "shared/geometry/Matrix"
import { figure } from "shared/workflow"
import { EditorKeyboardEvent } from "client/figureeditor/EditorKeyboardEvent"
const AnchorType = figure.AnchorType

export enum EditToolState {
    NONE,
    DRAG_ANCHOR
}

enum AnchorElement {
    BACKWARD_HANDLE,
    ANCHOR,
    FORWARD_HANDLE
}

// Anchor wraps the somewhat tedious data structure of figure.Path's anchors
// modifications will happen on 'outline' and are then copied to 'figure' by
// calling apply()
class Anchor {
    tool: EditTool
    editor: PathEditor
    figure: Path
    outline: Path

    _selected: boolean
    anchorElement!: AnchorElement

    // pointers into figure/outlines types and values array
    idxType: number
    idxValue: number

    // SVG elements managed by this class
    private svgAnchor: SVGRectElement
    private svgBackwardLine?: SVGLineElement
    private svgBackwardHandle?: SVGCircleElement
    private svgForwardLine?: SVGLineElement
    private svgForwardHandle?: SVGCircleElement

    constructor(tool: EditTool, editor: PathEditor, figure: Path, outline: Path, idxType: number, idxValue: number) {
        this.tool = tool
        this.editor = editor
        this.figure = figure
        this.outline = outline
        this._selected = false
        this.idxType = idxType
        this.idxValue = idxValue

        // HOW TO DO THIS:
        // o each EditToolEditor (PathEditor) manages one figure hence
        // o each EditToolEditor is going to maintain two matrices, one
        //   for screen2figure, one for figure2screen. in case the figure
        //   is part of a group/groups, those are included
        // o now we just need a nice API to handle this
        // o add group/ungroup to be able to write a complete test!
        //   (also, edit usually goes inside the group)
        this.svgAnchor = editor.createAnchor(this.pos)
        this.svgAnchor.style.cursor = `url(${Tool.cursorPath}edit-anchor.svg) 1 1, crosshair`
        this.svgAnchor.onpointerenter = () => {
            editor.insideAnchor = this
            this.anchorElement = AnchorElement.ANCHOR
        }
        this.svgAnchor.onpointerleave = () => {
            editor.insideAnchor = undefined
            this.anchorElement = AnchorElement.ANCHOR
        }
        this.editor.editor.decoration.appendChild(this.svgAnchor)
    }

    destructor() {
        this.editor.editor.decoration.removeChild(this.svgAnchor)
        this.hideBackwardHandle()
        this.hideForwardHandle()
    }

    get selected(): boolean {
        return this._selected
    }

    set selected(selected: boolean) {
        this._selected = selected
        if (this.svgAnchor) {
            if (this._selected) {
                this.svgAnchor.setAttributeNS("", "fill", "rgb(79,128,255)")
            } else {
                this.svgAnchor.setAttributeNS("", "fill", "#fff")
            }
        }
    }

    setHandles(backwardHandle: boolean, forwardHandle: boolean) {
        if (backwardHandle)
            this.showBackwardHandle()
        else
            this.hideBackwardHandle()
        if (forwardHandle)
            this.showForwardHandle()
        else
            this.hideForwardHandle()
    }

    updateHandles() {
        if (this.svgBackwardHandle)
            this.showBackwardHandle()
        if (this.svgForwardHandle)
            this.showForwardHandle()
    }

    showBackwardHandle() {
        switch (this.outline.types[this.idxType]) {
            case AnchorType.ANCHOR_EDGE:
            case AnchorType.ANCHOR_EDGE_ANGLE:
            case AnchorType.CLOSE:
                this.hideBackwardHandle()
                return
            case AnchorType.ANCHOR_ANGLE_EDGE:
            case AnchorType.ANCHOR_SYMMETRIC:
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
            case AnchorType.ANCHOR_ANGLE_ANGLE:
                const pos = { x: this.outline.values[this.idxValue], y: this.outline.values[this.idxValue + 1] }
                if (this.svgBackwardHandle) {
                    this.editor.updateLine(this.pos, pos, this.svgBackwardLine!)
                    this.editor.updateHandle(pos, this.svgBackwardHandle)
                } else {
                    this.svgBackwardLine = this.editor.createLine(this.pos, pos)
                    this.editor.editor.outline.appendChild(this.svgBackwardLine)
                    this.svgBackwardHandle = this.editor.createHandle(pos)
                    this.editor.editor.decoration.appendChild(this.svgBackwardHandle)
                    this.svgBackwardHandle.onpointerenter = () => {
                        this.editor.insideAnchor = this
                        this.anchorElement = AnchorElement.BACKWARD_HANDLE
                    }
                    this.svgBackwardHandle.onpointerleave = () => {
                        this.editor.insideAnchor = undefined
                        this.anchorElement = AnchorElement.BACKWARD_HANDLE
                    }
                    this.svgBackwardHandle.style.cursor = `url(${Tool.cursorPath}edit-handle.svg) 1 1, crosshair`
                }
        }
    }

    hideBackwardHandle() {
        if (this.svgBackwardHandle) {
            this.editor.editor.outline.removeChild(this.svgBackwardLine!)
            this.editor.editor.decoration.removeChild(this.svgBackwardHandle)
            this.svgBackwardHandle = undefined
            this.svgBackwardLine = undefined
        }
    }

    showForwardHandle() {
        let anchor, pos
        switch (this.outline.types[this.idxType]) {
            case AnchorType.ANCHOR_EDGE:
            case AnchorType.ANCHOR_ANGLE_EDGE:
            case AnchorType.CLOSE:
                this.hideForwardHandle()
                return
            case AnchorType.ANCHOR_EDGE_ANGLE:
                anchor = { x: this.outline.values[this.idxValue], y: this.outline.values[this.idxValue + 1] }
                pos = { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
                break
            case AnchorType.ANCHOR_SYMMETRIC:
                const backwardHandle = { x: this.outline.values[this.idxValue], y: this.outline.values[this.idxValue + 1] }
                anchor = { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
                pos = mirrorPoint(anchor, backwardHandle)
                break
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
            case AnchorType.ANCHOR_ANGLE_ANGLE:
                anchor = { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
                pos = { x: this.outline.values[this.idxValue + 4], y: this.outline.values[this.idxValue + 5] }
        }

        if (this.svgForwardHandle) {
            this.editor.updateLine(anchor, pos, this.svgForwardLine!)
            this.editor.updateHandle(pos, this.svgForwardHandle)
        } else {
            this.svgForwardLine = this.editor.createLine(anchor, pos)
            this.editor.editor.outline.appendChild(this.svgForwardLine)
            this.svgForwardHandle = this.editor.createHandle(pos)
            this.editor.editor.decoration.appendChild(this.svgForwardHandle)
            this.svgForwardHandle.onpointerenter = () => {
                this.editor.insideAnchor = this
                this.anchorElement = AnchorElement.FORWARD_HANDLE
            }
            this.svgForwardHandle.onpointerleave = () => {
                this.editor.insideAnchor = undefined
                this.anchorElement = AnchorElement.FORWARD_HANDLE
            }
            this.svgForwardHandle.style.cursor = `url(${Tool.cursorPath}edit-handle.svg) 1 1, crosshair`
        }
    }

    hideForwardHandle() {
        if (this.svgForwardHandle) {
            this.editor.editor.outline.removeChild(this.svgForwardLine!)
            this.editor.editor.decoration.removeChild(this.svgForwardHandle)
            this.svgForwardHandle = undefined
            this.svgForwardLine = undefined
        }
    }

    get length(): number {
        return this.lengthOfType(this.figure.types[this.idxType])
    }

    public lengthOfType(type: figure.AnchorType) {
        switch (type) {
            case AnchorType.ANCHOR_EDGE:
                return 2
            case AnchorType.ANCHOR_EDGE_ANGLE:
            case AnchorType.ANCHOR_ANGLE_EDGE:
            case AnchorType.ANCHOR_SYMMETRIC:
                return 4
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
            case AnchorType.ANCHOR_ANGLE_ANGLE:
                return 6
            case AnchorType.CLOSE:
                return 0
        }
    }

    get pos(): Point {
        switch (this.outline.types[this.idxType]) {
            case AnchorType.ANCHOR_EDGE:
            case AnchorType.ANCHOR_EDGE_ANGLE:
                return { x: this.outline.values[this.idxValue], y: this.outline.values[this.idxValue + 1] }
            case AnchorType.ANCHOR_ANGLE_EDGE:
            case AnchorType.ANCHOR_SYMMETRIC:
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
            case AnchorType.ANCHOR_ANGLE_ANGLE:
                return { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
            case AnchorType.CLOSE:
                throw Error(`anchor type CLOSE has no position to get`)
        }
    }

    moveTo(point: Point) {
        switch (this.anchorElement) {
            case AnchorElement.ANCHOR:
                this.pos = point
                break
            case AnchorElement.BACKWARD_HANDLE:
                this.backwardHandle = point
                break
            case AnchorElement.FORWARD_HANDLE:
                this.forwardHandle = point
                break
        }
    }

    set pos(point: Point) {
        switch (this.outline.types[this.idxType]) {
            case AnchorType.ANCHOR_EDGE: {
                this.outline.values[this.idxValue] = point.x
                this.outline.values[this.idxValue + 1] = point.y
            } break
            case AnchorType.ANCHOR_EDGE_ANGLE: {
                const anchor = { x: this.outline.values[this.idxValue], y: this.outline.values[this.idxValue + 1] }
                let backwardHandle = { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
                backwardHandle = pointPlusPoint(point, pointMinusPoint(backwardHandle, anchor))
                this.outline.values[this.idxValue] = point.x
                this.outline.values[this.idxValue + 1] = point.y
                this.outline.values[this.idxValue + 2] = backwardHandle.x
                this.outline.values[this.idxValue + 3] = backwardHandle.y
            } break
            case AnchorType.ANCHOR_ANGLE_EDGE:
            case AnchorType.ANCHOR_SYMMETRIC: {
                let forwardHandle = { x: this.outline.values[this.idxValue], y: this.outline.values[this.idxValue + 1] }
                const anchor = { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
                forwardHandle = pointPlusPoint(point, pointMinusPoint(forwardHandle, anchor))
                this.outline.values[this.idxValue] = forwardHandle.x
                this.outline.values[this.idxValue + 1] = forwardHandle.y
                this.outline.values[this.idxValue + 2] = point.x
                this.outline.values[this.idxValue + 3] = point.y
            } break
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
            case AnchorType.ANCHOR_ANGLE_ANGLE: {
                let forwardHandle = { x: this.outline.values[this.idxValue], y: this.outline.values[this.idxValue + 1] }
                const anchor = { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
                let backwardHandle = { x: this.outline.values[this.idxValue + 4], y: this.outline.values[this.idxValue + 5] }
                backwardHandle = pointPlusPoint(point, pointMinusPoint(backwardHandle, anchor))
                forwardHandle = pointPlusPoint(point, pointMinusPoint(forwardHandle, anchor))
                this.outline.values[this.idxValue] = forwardHandle.x
                this.outline.values[this.idxValue + 1] = forwardHandle.y
                this.outline.values[this.idxValue + 2] = point.x
                this.outline.values[this.idxValue + 3] = point.y
                this.outline.values[this.idxValue + 4] = backwardHandle.x
                this.outline.values[this.idxValue + 5] = backwardHandle.y
            } break
            case AnchorType.CLOSE:
                throw Error(`anchor type CLOSE has no position to set`)
        }

        this.editor.updateAnchor(point, this.svgAnchor)
        this.updateHandles()

        const path = this.outline.getPath()
        if (this.figure.matrix)
            path.transform(this.figure.matrix)
        path.updateSVG(this.editor.editor.outline, this.editor.outlineSVG)
    }

    set backwardHandle(point: Point) {
        switch (this.outline.types[this.idxType]) {
            case AnchorType.ANCHOR_EDGE:
                throw Error("anchor type EDGE has no backward handle to set")
            case AnchorType.ANCHOR_EDGE_ANGLE:
                throw Error("anchor type EDGE_ANGLE has no backward handle to set")
            case AnchorType.CLOSE:
                throw Error(`anchor type CLOSE has no backward handle to set`)
            case AnchorType.ANCHOR_ANGLE_EDGE:
            case AnchorType.ANCHOR_SYMMETRIC:
            case AnchorType.ANCHOR_ANGLE_ANGLE: {
                this.outline.values[this.idxValue] = point.x
                this.outline.values[this.idxValue + 1] = point.y
            } break
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE: {
                const backwardHandle = point
                const anchor = { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
                let forwardHandle = { x: this.outline.values[this.idxValue + 4], y: this.outline.values[this.idxValue + 5] }
                const back = distancePointToPoint(anchor, backwardHandle)
                const forward = distancePointToPoint(anchor, forwardHandle)
                const d = pointMultiplyNumber(pointMinusPoint(backwardHandle, anchor), forward / back)
                forwardHandle = pointMinusPoint(anchor, d)
                this.outline.values[this.idxValue] = backwardHandle.x
                this.outline.values[this.idxValue + 1] = backwardHandle.y
                this.outline.values[this.idxValue + 4] = forwardHandle.x
                this.outline.values[this.idxValue + 5] = forwardHandle.y
            } break
        }

        this.updateHandles()
        const path = this.outline.getPath()
        if (this.figure.matrix)
            path.transform(this.figure.matrix)
        path.updateSVG(this.editor.editor.outline, this.editor.outlineSVG)
    }

    set forwardHandle(point: Point) {
        switch (this.outline.types[this.idxType]) {
            case AnchorType.ANCHOR_EDGE:
                throw Error("anchor type EDGE has no forward handle to set")
            case AnchorType.ANCHOR_ANGLE_EDGE:
                throw Error("anchor type ANGLE_EDGE has no forward handle to set")
            case AnchorType.CLOSE:
                throw Error(`anchor type CLOSE has no forward handle to set`)
            case AnchorType.ANCHOR_EDGE_ANGLE: {
                this.outline.values[this.idxValue + 2] = point.x
                this.outline.values[this.idxValue + 3] = point.y
            } break
            case AnchorType.ANCHOR_SYMMETRIC: {
                const anchor = { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
                const forwardHandle = point
                const backwardHandle = mirrorPoint(anchor, forwardHandle)
                this.outline.values[this.idxValue] = backwardHandle.x
                this.outline.values[this.idxValue + 1] = backwardHandle.y
            } break
            case AnchorType.ANCHOR_ANGLE_ANGLE: {
                this.outline.values[this.idxValue + 4] = point.x
                this.outline.values[this.idxValue + 5] = point.y
            } break
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE: {
                let backwardHandle = { x: this.outline.values[this.idxValue], y: this.outline.values[this.idxValue + 1] }
                const anchor = { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
                let forwardHandle = point
                const back = distancePointToPoint(anchor, backwardHandle)
                const forward = distancePointToPoint(anchor, forwardHandle)
                const d = pointMultiplyNumber(pointMinusPoint(forwardHandle, anchor), back / forward)
                backwardHandle = pointMinusPoint(anchor, d)
                this.outline.values[this.idxValue] = backwardHandle.x
                this.outline.values[this.idxValue + 1] = backwardHandle.y
                this.outline.values[this.idxValue + 4] = forwardHandle.x
                this.outline.values[this.idxValue + 5] = forwardHandle.y
            } break
        }

        this.updateHandles()
        const path = this.outline.getPath()
        if (this.figure.matrix)
            path.transform(this.figure.matrix)
        path.updateSVG(this.editor.editor.outline, this.editor.outlineSVG)
    }

    apply() {
        this.copyAnchorFromTo(this.outline, this.figure)
    }

    revert() {
        this.copyAnchorFromTo(this.figure, this.outline)
    }

    protected copyAnchorFromTo(source: Path, destination: Path) {
        const oldLength = this.lengthOfType(destination.types[this.idxType])
        const newLength = this.lengthOfType(source.types[this.idxType])
        if (oldLength !== newLength) {
            if (oldLength < newLength) {
                destination.values.splice(this.idxValue, 0, ...new Array(newLength - oldLength).fill(0))
            } else {
                destination.values.splice(this.idxValue, oldLength - newLength)
            }
        }
        const end = this.idxValue + newLength
        for (let i = this.idxValue; i < end; ++i) {
            destination.values[i] = source.values[i]
        }
        destination.types[this.idxType] = source.types[this.idxType]
    }
}

abstract class EditToolEditor {
    figureToScreen?: Matrix
    screenToFigure?: Matrix

    destructor(): void { }
    pointerEvent(event: EditorPointerEvent): boolean { return false }
    keyEvent(event: EditorKeyboardEvent): boolean { return false }

    createAnchor(p: Point) {
        return Tool.createAnchor(this.figureToScreen, p)
    }

    updateAnchor(p: Point, svg: SVGRectElement) {
        return Tool.updateAnchor(this.figureToScreen, p, svg)
    }

    createHandle(p: Point) {
        return Tool.createHandle(this.figureToScreen, p)
    }

    updateHandle(p: Point, svg: SVGCircleElement) {
        return Tool.updateHandle(this.figureToScreen, p, svg)
    }

    createLine(p0: Point, p1: Point) {
        return Tool.createLine(this.figureToScreen, p0, p1)
    }

    updateLine(p0: Point, p1: Point, svg: SVGLineElement) {
        return Tool.updateLine(this.figureToScreen, p0, p1, svg)
    }
}

export class PathEditor extends EditToolEditor {
    anchors: Anchor[] = []
    currentAnchor?: Anchor
    insideAnchor?: Anchor
    path: Path
    outline: Path
    editor: FigureEditor
    tool: EditTool

    outlineSVG: SVGPathElement

    constructor(editor: FigureEditor, tool: EditTool, path: Path) {
        super()
        this.path = path
        this.editor = editor
        this.tool = tool

        if (path.matrix) {
            this.figureToScreen = path.matrix
            this.screenToFigure = new Matrix(path.matrix).invert()
        }

        // create outline
        const outline = path.clone()
        this.outline = outline
        const outlinePath = outline.getPath()
        if (path.matrix !== undefined)
            outlinePath.transform(path.matrix)
        this.outlineSVG = outlinePath.createSVG()
        this.tool.setOutlineColors(this.outlineSVG)
        this.editor.outline.appendChild(this.outlineSVG)

        // create anchors
        this.createAnchors()
    }

    override destructor(): void {
        this.anchors.forEach(anchor => {
            anchor.destructor()
        })
        this.anchors.length = 0
        this.editor.outline.removeChild(this.outlineSVG)
    }

    // TODO: this is copied from figure.Path.getPath(), which is covered by tests
    // plan is to create a function which is suitable for both use cases...
    // hm... changes become too many, might want to have a complete new set of tests
    override pointerEvent(event: EditorPointerEvent): boolean {
        if (this.screenToFigure) {
            let newEvent = Object.assign({}, event)
            const pos = this.screenToFigure.transformPoint(event)
            newEvent.x = pos.x
            newEvent.y = pos.y
            event = newEvent
        }

        if (event.type === "down" && this.insideAnchor) {
            this.currentAnchor = this.insideAnchor
            if (event.altKey) {
                switch (this.currentAnchor.anchorElement) {
                    case AnchorElement.ANCHOR:
                        this.removeBothHandles(this.currentAnchor)
                        break
                    case AnchorElement.BACKWARD_HANDLE:
                        this.removeBackwardHandle(this.currentAnchor)
                        break
                    case AnchorElement.FORWARD_HANDLE:
                        this.removeForwardHandle(this.currentAnchor)
                        break
                }
                return true
            }

            event.editor.scrollView.style.cursor = `url(${Tool.cursorPath}edit-cursor.svg) 1 1, crosshair`
            this.selectAnchor(event)
            this.updateHandles()

            return true
        }
        if (this.currentAnchor !== undefined) {
            switch (event.type) {
                case "move":
                    this.currentAnchor.moveTo(event)
                    break
                case "up":
                    this.currentAnchor.apply()
                    event.editor.model!.signal.emit({
                        operation: Operation.UPDATE_FIGURES,
                        figures: [this.currentAnchor!.figure.id]
                    })
                    this.currentAnchor = undefined
                    this.updateHandles()
                    break
            }
            return true
        }
        return false
    }

    override keyEvent(event: EditorKeyboardEvent): boolean {
        if (!this.currentAnchor) // only set when mouse is pressed
            return false
        switch (event.type) {
            case "down":
                if (event.value === "Alt") {
                    this.changeToAngleAngle(this.currentAnchor)
                }
                break
            case "up":
                if (event.value === "Alt") {
                    this.revert(this.currentAnchor)
                    this.currentAnchor.moveTo(event.editor.pointerNowAt!)
                }
                break
        }
        return true
    }

    private selectAnchor(event: EditorPointerEvent) {
        if (!this.insideAnchor || !this.currentAnchor) {
            throw Error("yikes")
        }
        if (this.insideAnchor.anchorElement === AnchorElement.ANCHOR) {
            if (event.shiftKey) {
                this.currentAnchor.selected = !this.currentAnchor.selected
            } else {
                this.anchors.forEach(anchor => anchor.selected = false)
                this.currentAnchor.selected = true
            }
        }
    }

    private updateHandles() {
        // show/hide handles
        for (let i = 0; i < this.anchors.length; ++i) {
            let backwardHandle = false
            let forwardHandle = false
            if (this.anchors[i] === this.currentAnchor) {
                backwardHandle = true
                forwardHandle = true
            } else if (this.anchors[i].selected) {
                if (i > 0) {
                    backwardHandle = true
                }
                if (i < this.anchors.length - 1) {
                    forwardHandle = true
                }
            } else {
                if (i > 0 && this.anchors[i - 1].selected) {
                    backwardHandle = true
                }
                if (i + 1 < this.anchors.length && this.anchors[i + 1].selected) {
                    forwardHandle = true
                }
            }
            this.anchors[i].setHandles(backwardHandle, forwardHandle)
        }
    }

    // TODO: add unit test
    changeToAngleAngle(anchor: Anchor) {
        switch (this.outline.types[anchor.idxType]) {
            case AnchorType.ANCHOR_SYMMETRIC: {
                this.outline.types[anchor.idxType] = AnchorType.ANCHOR_ANGLE_ANGLE
                const h0 = { x: this.outline.values[anchor.idxValue], y: this.outline.values[anchor.idxValue + 1] }
                const a = { x: this.outline.values[anchor.idxValue + 2], y: this.outline.values[anchor.idxValue + 3] }
                const h1 = mirrorPoint(a, h0)
                this.outline.values.splice(anchor.idxValue + 4, 0, h1.x, h1.y)
                this.updateAnchors()
            } break
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE: {
                this.outline.types[anchor.idxType] = AnchorType.ANCHOR_ANGLE_ANGLE
            } break
            default:
                throw Error("yikes")
        }
    }

    // TODO: add unit test!
    removeBackwardHandle(anchor: Anchor) {
        switch (this.outline.types[anchor.idxType]) {
            case AnchorType.ANCHOR_ANGLE_EDGE:
                this.outline.types[anchor.idxType] = AnchorType.ANCHOR_EDGE
                this.outline.values.splice(anchor.idxValue, 2)
                break
            case AnchorType.ANCHOR_SYMMETRIC: {
                this.outline.types[anchor.idxType] = AnchorType.ANCHOR_EDGE_ANGLE
                const h0 = { x: this.outline.values[anchor.idxValue], y: this.outline.values[anchor.idxValue + 1] }
                const a = { x: this.outline.values[anchor.idxValue + 2], y: this.outline.values[anchor.idxValue + 3] }
                const h1 = mirrorPoint(a, h0)
                this.outline.values[anchor.idxValue] = a.x
                this.outline.values[anchor.idxValue + 1] = a.y
                this.outline.values[anchor.idxValue + 2] = h1.x
                this.outline.values[anchor.idxValue + 3] = h1.y
            } break
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
            case AnchorType.ANCHOR_ANGLE_ANGLE:
                this.outline.types[anchor.idxType] = AnchorType.ANCHOR_EDGE_ANGLE
                this.outline.values.splice(anchor.idxValue, 2)
                break
        }
        const path = this.outline.getPath()
        if (this.path.matrix)
            path.transform(this.path.matrix)
        path.updateSVG(this.editor.outline, this.outlineSVG)

        this.currentAnchor!.apply()
        this.updateAnchors()
    }

    // TODO: add unit test!
    removeForwardHandle(anchor: Anchor) {
        switch (this.outline.types[anchor.idxType]) {
            case AnchorType.ANCHOR_EDGE_ANGLE:
                this.outline.types[anchor.idxType] = AnchorType.ANCHOR_EDGE
                this.outline.values.splice(anchor.idxValue + 2, 2)
                break
            case AnchorType.ANCHOR_SYMMETRIC:
                this.outline.types[anchor.idxType] = AnchorType.ANCHOR_ANGLE_EDGE
                break
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
            case AnchorType.ANCHOR_ANGLE_ANGLE:
                this.outline.types[anchor.idxType] = AnchorType.ANCHOR_ANGLE_EDGE
                this.outline.values.splice(anchor.idxValue + 4, 2)
                break
        }
        const path = this.outline.getPath()
        if (this.path.matrix)
            path.transform(this.path.matrix)
        path.updateSVG(this.editor.outline, this.outlineSVG)

        this.currentAnchor!.apply()
        this.updateAnchors()
    }

    // TODO: add unit test!
    removeBothHandles(anchor: Anchor) {
        switch (this.outline.types[anchor.idxType]) {
            case AnchorType.ANCHOR_EDGE_ANGLE:
                this.outline.values.splice(anchor.idxValue + 2, 2)
                break
            case AnchorType.ANCHOR_ANGLE_EDGE:
            case AnchorType.ANCHOR_SYMMETRIC:
                this.outline.values.splice(anchor.idxValue, 2)
                break
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
            case AnchorType.ANCHOR_ANGLE_ANGLE:
                this.outline.values[anchor.idxValue] = this.outline.values[anchor.idxValue + 2]
                this.outline.values[anchor.idxValue + 1] = this.outline.values[anchor.idxValue + 3]
                this.outline.values.splice(anchor.idxValue + 2, 4)
                break
        }
        this.outline.types[anchor.idxType] = AnchorType.ANCHOR_EDGE
        const path = this.outline.getPath()
        if (this.path.matrix)
            path.transform(this.path.matrix)
        path.updateSVG(this.editor.outline, this.outlineSVG)

        this.currentAnchor!.apply()
        this.updateAnchors()
    }

    revert(anchor: Anchor) {
        anchor.revert()
        this.updateAnchors()
    }

    protected createAnchors() {
        let idxValue = 0
        for (let idxType = 0; idxType < this.path.types.length; ++idxType) {
            if (this.path.types[idxType] !== AnchorType.CLOSE) {
                const anchor = new Anchor(this.tool, this, this.path, this.outline, idxType, idxValue)
                idxValue += anchor.length
                this.anchors.push(anchor)
            }
        }
    }

    protected updateAnchors() {
        let idxAnchor = 0, idxValue = 0
        for (let idxType = 0; idxType < this.outline.types.length; ++idxType) {
            const type = this.outline.types[idxType]
            if (type !== AnchorType.CLOSE) {
                const anchor = this.anchors[idxAnchor++]
                const length = anchor.lengthOfType(type)
                anchor.idxValue = idxValue
                idxValue += length
            }
        }
    }
}

export class EditTool extends Tool {
    state: EditToolState
    constructor() {
        super()
        this.debug = false
        this.state = EditToolState.NONE
    }

    override activate(editor: FigureEditor) {
        Tool.setHint(`edit tool: under construction, use pointer with <ctrl/> to smooth or with <alt/> to sharpen edges`)
        editor.svgView.style.cursor = `url(${Tool.cursorPath}edit.svg) 1 1, crosshair`
        Tool.selection.modified.add(() => {
            this.updateSelection(editor)
        }, this)
        Tool.selection.modified.emit()
    }

    override deactivate(editor: FigureEditor) {
        editor.svgView.style.cursor = "default"
        this.removeEditors(editor)
        Tool.selection.modified.remove(this)
        editor.outline.innerHTML = ""
        editor.decoration.innerHTML = ""
    }

    override pointerEvent(event: EditorPointerEvent): void {
        for (let i = 0; i < this.editors.length; ++i) {
            if (this.editors[i].pointerEvent(event)) {
                return
            }
        }

        switch (this.state) {
            case EditToolState.NONE:
                switch (event.type) {
                    case "down": {
                        let figure = event.editor.selectedLayer!.findFigureAt(event)
                        if (figure === undefined) {
                            if (!event.shiftKey) {
                                Tool.selection.clear()
                            }
                            // this.state = ArrangeToolState.DRAG_MARQUEE
                            return
                        }

                        if (Tool.selection.has(figure)) {
                            if (event.shiftKey) {
                                Tool.selection.remove(figure)
                            }
                            return
                        }

                        if (event.shiftKey) {
                            Tool.selection.add(figure)
                        } else {
                            Tool.selection.set(figure)
                        }
                    } break
                } break
        }
    }

    override keyEvent(event: EditorKeyboardEvent): void {
        for (let i = 0; i < this.editors.length; ++i) {
            if (this.editors[i].keyEvent(event)) {
                return
            }
        }
    }

    editors: EditToolEditor[] = []

    updateSelection(editor: FigureEditor) {
        this.removeEditors(editor)
        this.addEditors(editor)
    }

    removeEditors(editor: FigureEditor) {
        this.editors.forEach(editor => {
            editor.destructor()
        })
        this.editors.length = 0
    }

    addEditors(editor: FigureEditor) {
        Tool.selection.selection.forEach(figure => {
            // TODO: move into figure.Path, etc. once this works
            if (figure instanceof Path) {
                this.editors.push(new PathEditor(editor, this, figure))
            }
        })
    }
}
