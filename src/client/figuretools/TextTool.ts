/*
 *  workflow - A collaborative real-time white- and kanban board
 *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
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

/******************************************************************
 * TERMS
 * o decoration: a rectangular frame with the handles (FIXME: frame is missing, TODO: pivot point for rotation as handle)
 * o outline   : an outline of the selected figures
 *               transformations will only be applied to the outline
 *               until the mouse is released, upon which the transformation
 *               is applied to the model/send to the server
 ******************************************************************/

import { Point, Rectangle } from "shared/geometry"
import { EditorMouseEvent, EditorKeyboardEvent } from "../figureeditor"
import { Tool } from "./Tool"
import * as figures from "../figures"

enum TextCursor {
    NONE,
    EDIT,
    AREA,
    SHAPE,
    PATH
}

enum TextToolState {
    NONE,
    AREA,
    EDIT
}

export class TextTool extends Tool {
    state: TextToolState
    currentCursor: TextCursor

    mouseDownAt!: Point
    defs!: SVGDefsElement
    svgRect!: SVGRectElement

    text!: figures.Text

    constructor() {
        super()
        this.state = TextToolState.NONE
        this.currentCursor = TextCursor.NONE
    }

    override activate(event: EditorMouseEvent) {
        this.state = TextToolState.NONE
    }

    override deactivate(event: EditorMouseEvent) {
        this.setCursor(TextCursor.NONE, event.editor.svgView)
        event.editor.svgView.style.cursor = "default"
        this.removeOutlines(event.editor)
        this.removeDecoration(event.editor)
    }

    override mousedown(event: EditorMouseEvent) {
        let figure = event.editor.selectedLayer!.findFigureAt(event)
        if (figure === undefined) {
            this.state = TextToolState.AREA
            this.mouseDownAt = event
            // create text area
            this.defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
            this.defs.innerHTML =
                `<pattern id="textToolPattern"
                x="0" y="0" width="100" height="4"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)">
               <line x1="0" y1="0" x2="100" y2="0" style="stroke: rgb(79,128,255)" />
            </pattern>`
            event.editor.svgView.appendChild(this.defs)

            this.svgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
            this.svgRect.setAttributeNS("", 'stroke', 'rgb(79,128,255)')
            this.svgRect.setAttributeNS("", 'fill', 'url(#textToolPattern)')
            event.editor.decorationOverlay.appendChild(this.svgRect)
        } else {
            if (figure instanceof figures.Text) {
                this.text = figure
                this.state = TextToolState.EDIT
                this.text.cursor.mousedown(event)
                Tool.selection.clear()
                Tool.selection.add(figure)
                this.updateDecorationOfSelection(event.editor)
            } else {
                // create text within shape
            }
        }
        // let text = new figures.Text({origin: event})
        // event.editor.addFigure(text)
    }

    override mousemove(event: EditorMouseEvent) {
        switch (this.state) {
            case TextToolState.EDIT:
                if (event.editor.mouseButtonIsDown) {
                    this.text.cursor.mousemove(event)
                    return
                }
            case TextToolState.NONE:
                let figure = event.editor.selectedLayer!.findFigureAt(event)
                // console.log(`at ${event.x},${event.y} found ${figure}`)
                if (figure === undefined) {
                    this.setCursor(TextCursor.AREA, event.editor.svgView)
                } else {
                    if (figure instanceof figures.Text) {
                        this.setCursor(TextCursor.EDIT, event.editor.svgView)
                    } else {
                        this.setCursor(TextCursor.SHAPE, event.editor.svgView)
                    }
                }
                break
            case TextToolState.AREA:
                let x0 = this.mouseDownAt!.x, y0 = this.mouseDownAt!.y, x1 = event.x, y1 = event.y
                if (x1 < x0) [x0, x1] = [x1, x0]
                if (y1 < y0) [y0, y1] = [y1, y0]
                this.svgRect!.setAttributeNS("", "x", String(Math.round(x0) + 0.5)) // FIXME: just a hunch for nice rendering
                this.svgRect!.setAttributeNS("", "y", String(Math.round(y0) + 0.5))
                this.svgRect!.setAttributeNS("", "width", String(Math.round(x1 - x0)))
                this.svgRect!.setAttributeNS("", "height", String(Math.round(y1 - y0)))
                break
        }
    }

    override mouseup(event: EditorMouseEvent) {
        switch (this.state) {
            case TextToolState.AREA:
                this.state = TextToolState.EDIT
                event.editor.decorationOverlay.removeChild(this.svgRect)
                event.editor.svgView.removeChild(this.defs)

                let x0 = this.mouseDownAt!.x, y0 = this.mouseDownAt!.y, x1 = event.x, y1 = event.y
                if (x1 < x0) [x0, x1] = [x1, x0]
                if (y1 < y0) [y0, y1] = [y1, y0]

                // we add the figure here
                let rect = new Rectangle({ origin: { x: x0, y: y0 }, size: { width: x1 - x0, height: y1 - y0 } })
                this.text = new figures.Text(rect)
                event.editor.addFigure(this.text)

                Tool.selection.clear()
                Tool.selection.add(this.text)
                this.updateDecorationOfSelection(event.editor)
                break
        }
    }

    override keydown(event: EditorKeyboardEvent) {
        if (this.state == TextToolState.EDIT) {
            this.text.cursor.keydown(event)
        }
    }

    private setCursor(type: TextCursor, svg: SVGElement) {
        if (this.currentCursor === type)
            return
        this.currentCursor = type
        svg.style.cursor = ""
        switch (type) {
            case TextCursor.NONE:
                svg.style.cursor = "default"
                break
            case TextCursor.EDIT:
                svg.style.cursor = `url(${Tool.cursorPath}text-edit.svg) 9 12, move`
                break
            case TextCursor.AREA:
                svg.style.cursor = `url(${Tool.cursorPath}text-area.svg) 9 12, move`
                break
            case TextCursor.SHAPE:
                svg.style.cursor = `url(${Tool.cursorPath}text-shape.svg) 9 12, move`
                break
            case TextCursor.PATH:
                svg.style.cursor = `url(${Tool.cursorPath}text-path.svg) 9 12, move`
                break
        }
    }
}
