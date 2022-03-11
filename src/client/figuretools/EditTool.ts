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
import { Figure } from "../figures/Figure"
import { Path } from "../figures/Path"
import { pointMinusPoint, pointPlusPoint, mirrorPoint } from "shared/geometry"
import { Point } from "shared/geometry/Point"
import { figure } from "shared/workflow"
const AnchorType = figure.AnchorType

export enum EditToolState {
    NONE,
    DRAG_ANCHOR
}

enum Handle {
    PREVIOUS_FORWARD,
    CURRENT_BACKWARD,
    CURRENT_FORWARD,
    NEXT_BACKWARD
}

// Anchor wraps the somewhat tedious data structure of figure.Path's anchors
// modifications will happen on 'outline' and are then copied to 'figure' by
// calling apply()
class Anchor {
    tool: EditTool
    editor: PathEditor
    figure: Path
    outline: Path
    idxType: number
    idxValue: number
    svgAnchor: SVGRectElement

    constructor(tool: EditTool, editor: PathEditor, figure: Path, outline: Path, idxType: number, idxValue: number) {
        this.tool = tool
        this.editor = editor
        this.figure = figure
        this.outline = outline
        this.idxType = idxType
        this.idxValue = idxValue

        this.svgAnchor = tool.createAnchor(this.pos)
        this.svgAnchor.style.cursor = `url(${Tool.cursorPath}edit-anchor.svg) 1 1, crosshair`
        this.svgAnchor.onmouseenter = () => { editor.insideAnchor = this }
        this.svgAnchor.onmouseleave = () => { editor.insideAnchor = undefined }
        this.tool.decoration!.appendChild(this.svgAnchor)
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

        this.svgAnchor.setAttributeNS("", "x", `${Math.round(point.x - Figure.HANDLE_RANGE / 2.0 - 0.5) + 0.5}`)
        this.svgAnchor.setAttributeNS("", "y", `${Math.round(point.y - Figure.HANDLE_RANGE / 2.0 - 0.5) + 0.5}`)

        this.outline.getPath().updateSVG(this.tool.outline!, this.editor.outlineSVG)
    }

    apply() {
        const end = this.idxValue + this.length
        for (let i = this.idxValue; i < end; ++i) {
            this.figure.values[i] = this.outline.values[i]
        }
    }
}

abstract class EditToolEditor {
    destructor(): void { }
    pointerEvent(event: EditorPointerEvent): boolean {
        return false
    }

    protected createAnchor(p: Point) {
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

    protected createHandle(p: Point) {
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

        // create outline
        const outline = path.clone()
        const outlinePath = outline.getPath()
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
            if (anchor.svgAnchor) {
                this.tool.decoration!.removeChild(anchor.svgAnchor)
            }
        })
        this.anchors.length = 0
        this.tool.outline!.removeChild(this.outlineSVG)
    }

    // TODO: this is copied from figure.Path.getPath(), which is covered by tests
    // plan is to create a function which is suitable for both use cases...
    // hm... changes become too many, might want to have a complete new set of tests
    override pointerEvent(event: EditorPointerEvent): boolean {
        if (event.type === "down" && this.insideAnchor) {
            this.currentAnchor = this.insideAnchor
            return true
        }
        if (this.currentAnchor !== undefined) {
            switch (event.type) {
                case "move":
                    this.currentAnchor.pos = event
                    break
                case "up":
                    this.currentAnchor.apply()
                    event.editor.model!.modified.trigger({
                        operation: Operation.UPDATE_FIGURES,
                        figures: [this.currentAnchor!.figure.id]
                    })
                    this.currentAnchor = undefined
                    break
            }
            return true
        }
        return false
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
