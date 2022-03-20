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

/*
converting between anchor types in affinity designer:

             anchor            handle
opt+click    remove handles    remove this handle
ctrl+click   smooth            smooth
opt+drag                       sharp
ctrl+drag                      symmetric while pressed (affinity only)
                               we could use this to switch to symmetric permanently,
                               ctrl+click on the anchor can then switch back to smooth
space+drag                     move anchor (affinity & illustrator)

symmetric is not stored, it's always smooth (both in illustrator and affinity designer)
tool hint changes depending what the cursor hovers on
we could also change the cursor depending on what key is pressed?

add/remove anchor?
affinity:
o select anchor, hit delete/backspace to remove anchor
o click on curve to add anchor

cursor
o we could fill the edit cursor to indicate the grab?

a method to indicate the anchor type?
*/

import { FigureEditor, EditorPointerEvent, Operation } from "../figureeditor"
import { Tool } from "./Tool"
import { Figure } from "../figures/Figure"
import { Path } from "../figures/Path"
import { pointMinusPoint, pointPlusPoint, mirrorPoint, distancePointToPoint, pointMultiplyNumber } from "shared/geometry"
import { Point } from "shared/geometry/Point"
import { Matrix } from "shared/geometry/Matrix"
import { figure } from "shared/workflow"
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
        this.tool.decoration!.appendChild(this.svgAnchor)
    }

    destructor() {
        this.tool.decoration!.removeChild(this.svgAnchor)
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
        switch (this.figure.types[this.idxType]) {
            case AnchorType.ANCHOR_EDGE:
            case AnchorType.ANCHOR_EDGE_ANGLE:
            case AnchorType.CLOSE:
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
                    this.tool.outline!.appendChild(this.svgBackwardLine)
                    this.svgBackwardHandle = this.editor.createHandle(pos)
                    this.tool.decoration!.appendChild(this.svgBackwardHandle)
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
            this.tool.outline!.removeChild(this.svgBackwardLine!)
            this.tool.decoration!.removeChild(this.svgBackwardHandle)
            this.svgBackwardHandle = undefined
            this.svgBackwardLine = undefined
        }
    }

    showForwardHandle() {
        let anchor, pos
        switch (this.figure.types[this.idxType]) {
            case AnchorType.ANCHOR_EDGE:
            case AnchorType.ANCHOR_ANGLE_EDGE:
            case AnchorType.CLOSE:
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
            this.tool.outline!.appendChild(this.svgForwardLine)
            this.svgForwardHandle = this.editor.createHandle(pos)
            this.tool.decoration!.appendChild(this.svgForwardHandle)
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
            this.tool.outline!.removeChild(this.svgForwardLine!)
            this.tool.decoration!.removeChild(this.svgForwardHandle)
            this.svgForwardHandle = undefined
            this.svgForwardLine = undefined
        }
    }

    get length(): number {
        switch (this.figure.types[this.idxType]) {
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
        path.updateSVG(this.tool.outline!, this.editor.outlineSVG)
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
        path.updateSVG(this.tool.outline!, this.editor.outlineSVG)
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
        path.updateSVG(this.tool.outline!, this.editor.outlineSVG)
    }

    apply() {
        const end = this.idxValue + this.length
        for (let i = this.idxValue; i < end; ++i) {
            this.figure.values[i] = this.outline.values[i]
        }
    }
}

abstract class EditToolEditor {
    figureToScreen?: Matrix
    screenToFigure?: Matrix

    destructor(): void { }
    pointerEvent(event: EditorPointerEvent): boolean {
        return false
    }

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
        const outlinePath = outline.getPath()
        if (path.matrix !== undefined)
            outlinePath.transform(path.matrix)
        this.outlineSVG = outlinePath.createSVG()
        this.tool.setOutlineColors(this.outlineSVG)
        this.tool.outline!.appendChild(this.outlineSVG)

        // create anchors
        let idxValue = 0
        for (let idxType = 0; idxType < path.types.length; ++idxType) {
            if (path.types[idxType] !== AnchorType.CLOSE) {
                const anchor = new Anchor(tool, this, path, outline, idxType, idxValue)
                idxValue += anchor.length
                this.anchors.push(anchor)
            }
        }
    }

    override destructor(): void {
        this.anchors.forEach(anchor => {
            anchor.destructor()
        })
        this.anchors.length = 0
        this.tool.outline!.removeChild(this.outlineSVG)
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
                    event.editor.model!.modified.trigger({
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
            if (this.anchors[i].selected || this.anchors[i] === this.currentAnchor) {
                backwardHandle = true
                forwardHandle = true
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
}

export class EditTool extends Tool {
    state: EditToolState
    constructor() {
        super()
        this.debug = false
        this.state = EditToolState.NONE
    }

    override activate(editor: FigureEditor) {
        Tool.setHint(`edit tool: under construction`)
        editor.svgView.style.cursor = `url(${Tool.cursorPath}edit.svg) 1 1, crosshair`

        this.outline = document.createElementNS("http://www.w3.org/2000/svg", "g")
        editor.decorationOverlay.appendChild(this.outline)
        this.decoration = document.createElementNS("http://www.w3.org/2000/svg", "g")
        editor.decorationOverlay.appendChild(this.decoration)
        Tool.selection.modified.add(() => {
            this.updateSelection(editor)
        }, this)
        Tool.selection.modified.trigger()
    }

    override deactivate(editor: FigureEditor) {
        editor.svgView.style.cursor = "default"
        this.removeEditors(editor)
        Tool.selection.modified.remove(this)
        editor.decorationOverlay.removeChild(this.outline!)
        editor.decorationOverlay.removeChild(this.decoration!)
        this.outline = undefined
        this.decoration = undefined
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
