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
import { distancePointToPoint, pointMinusPoint, pointPlusPoint, pointMultiplyNumber } from "shared/geometry"
import { Rectangle } from "shared/geometry/Rectangle"
import { Point } from "shared/geometry/Point"
import { figure } from "shared/workflow"
import { timeStamp } from "console"
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

interface Anchor {
    svg: SVGElement
    figure: Figure
    index: number
}

export class EditTool extends Tool {
    state: EditToolState
    insideAnchor?: Anchor
    currentAnchor?: Anchor
    lastPos?: Point

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

        // selection does not have a protocol yet...
        Tool.selection.modified.add(() => {
            this.updateOutline(editor)
            this.updateAnchorsOfSelection(editor)
        }, this)
        Tool.selection.modified.trigger()
    }

    override deactivate(editor: FigureEditor) {
        editor.svgView.style.cursor = "default"
        Tool.selection.modified.remove(this)
        editor.decorationOverlay.removeChild(this.outline!)
        editor.decorationOverlay.removeChild(this.decoration!)
        this.outline = undefined
        this.decoration = undefined
        this.anchors = []
        this.insideAnchor = undefined
    }

    override pointerEvent(event: EditorPointerEvent): void {
        switch (this.state) {
            case EditToolState.NONE:
                switch (event.type) {
                    case "down": {
                        if (this.insideAnchor) {
                            console.log(`inside anchor!!!`)
                            this.state = EditToolState.DRAG_ANCHOR
                            this.currentAnchor = this.insideAnchor
                            this.lastPos = event
                            return
                        }
                        let figure = event.editor.selectedLayer!.findFigureAt(event)
                        if (figure === undefined) {
                            if (!event.shiftKey) {
                                Tool.selection.clear()
                            }
                            // this.state = ArrangeToolState.DRAG_MARQUEE
                            return
                        }

                        if (Tool.selection.has(figure)) {
                            return
                        }

                        Tool.selection.modified.lock()
                        if (!event.shiftKey)
                            Tool.selection.clear()
                        Tool.selection.add(figure)
                        Tool.selection.modified.unlock()
                    } break
                } break
            case EditToolState.DRAG_ANCHOR:
                switch(event.type) {
                    case "move":
                        if (this.currentAnchor!.figure instanceof Path) {
                            // FIXME: there's too much skew using delta transformations
                            this.currentAnchor!.figure.moveEdge(this.currentAnchor!.index, pointMinusPoint(event, this.lastPos!))
                            let x = event.x - Figure.HANDLE_RANGE / 2.0
                            let y = event.y - Figure.HANDLE_RANGE / 2.0
                            x = Math.round(x - 0.5) + 0.5
                            y = Math.round(y - 0.5) + 0.5
                            this.currentAnchor!.svg.setAttributeNS("", "x", `${x}`)
                            this.currentAnchor!.svg.setAttributeNS("", "y", `${y}`)
                            this.updateOutline(event.editor)
                            this.lastPos = event
                        }
                        break
                    case "up":
                        this.state = EditToolState.NONE
                        event.editor.model!.modified.trigger({
                            operation: Operation.UPDATE_FIGURES,
                            figures: [this.currentAnchor!.figure.id]
                        })
                        break
                }
        }
    }

    anchors: Anchor[] = []
    _handlePos = new Array<Point>(4)
    _handles = new Array<SVGCircleElement>(4)
    lines = new Array<SVGLineElement>(4)

    clearOutline() {
        this.outline!.innerHTML = ""
    }

    updateOutline(editor: FigureEditor) {
        this.clearOutline()
        for (let figure of Tool.selection.selection) {
            this.outline!.appendChild(this.createOutline(editor, figure))
        }
    }

    clearAnchors() {
        this.anchors.forEach(anchor => {
            this.decoration!.removeChild(anchor.svg)
        })
        this.anchors.length = 0
    }

    updateAnchorsOfSelection(editor: FigureEditor) {
        this.clearAnchors()
        Tool.selection.selection.forEach(figure => {
            // TODO: move into figure.Path, etc. once this works
            if (figure instanceof Path) {
                let idxValue = 0
                for (let idxType = 0; idxType < figure.types.length; ++idxType) {
                    let svg
                    switch (figure.types[idxType]) {
                        case AnchorType.ANCHOR_EDGE:
                            svg = this.createAnchor({ x: figure.values[idxValue], y: figure.values[idxValue + 1] })
                            idxValue += 2
                            break
                        case AnchorType.ANCHOR_EDGE_ANGLE:
                            svg = this.createAnchor({ x: figure.values[idxValue], y: figure.values[idxValue + 1] })
                            idxValue += 4
                            break
                        case AnchorType.ANCHOR_ANGLE_EDGE:
                        case AnchorType.ANCHOR_SYMMETRIC:
                            svg = this.createAnchor({ x: figure.values[idxValue + 2], y: figure.values[idxValue + 3] })
                            idxValue += 4
                            break
                        case AnchorType.ANCHOR_ANGLE_ANGLE:
                        case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
                            svg = this.createAnchor({ x: figure.values[idxValue + 2], y: figure.values[idxValue + 3] })
                            idxValue += 6
                            break
                        case AnchorType.CLOSE:
                            break
                    }
                    if (svg) {
                        svg.style.cursor = `url(${Tool.cursorPath}edit-anchor.svg) 1 1, crosshair`
                        const anchor = {
                            figure: figure,
                            index: idxType,
                            svg: svg,
                        }
                        this.anchors.push(anchor)
                        svg.onmouseenter = () => {
                            this.insideAnchor = anchor
                        }
                        svg.onmouseleave = () => {
                            this.insideAnchor = undefined
                        }
                        this.decoration!.appendChild(svg)
                    }
                }
            }
        })
    }
}
