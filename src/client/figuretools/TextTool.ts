/*
 *  workflow - A collaborative real-time white- and kanban board
 *  Copyright (C) 2020 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/******************************************************************
 * TERMS
 * o decoration: a rectangular frame with the handles (FIXME: frame is missing, TODO: pivot point for rotation as handle)
 * o outline   : an outline of the selected figures
 *               transformations will only be applied to the outline
 *               until the mouse is released, upon which the transformation
 *               is applied to the model/send to the server
 ******************************************************************/

import {
    Point, Rectangle, Matrix,
    pointPlusPoint, pointMinusPoint, pointMultiplyNumber, pointMinus, pointMinusSize, sizeMultiplyNumber, isEqual
} from "../../shared/geometry"
import { Path } from "../paths/Path"
import { Figure } from "../figures/Figure"
import { AttributedFigure } from "../figures/AttributedFigure"
import { EditorEvent } from "../figureeditor/EditorEvent"
import { FigureEditor } from "../figureeditor/FigureEditor"
import { Tool } from "./Tool"
import * as figures from "../figures"
import { figure } from "../../shared/workflow_value"

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
    
    activate(event: EditorEvent) {
        this.state = TextToolState.NONE
    }
    
    deactivate(event: EditorEvent) {
        this.setCursor(TextCursor.NONE, event.editor.svgView)
    }

    mousedown(event: EditorEvent) {
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
            } else {
                // create text within shape
            }
        }
        // let text = new figures.Text({origin: event})
        // event.editor.addFigure(text)
    }

    mousemove(event: EditorEvent) {
        switch(this.state) {
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
                let x0=this.mouseDownAt!.x, y0=this.mouseDownAt!.y, x1=event.x, y1=event.y
                if (x1<x0) [x0,x1] = [x1,x0]
                if (y1<y0) [y0,y1] = [y1,y0]
                this.svgRect!.setAttributeNS("", "x", String(Math.round(x0)+0.5)) // FIXME: just a hunch for nice rendering
                this.svgRect!.setAttributeNS("", "y", String(Math.round(y0)+0.5))
                this.svgRect!.setAttributeNS("", "width", String(Math.round(x1-x0)))
                this.svgRect!.setAttributeNS("", "height", String(Math.round(y1-y0)))
                break
        }
    }

    mouseup(event: EditorEvent) {
        switch(this.state) {
            case TextToolState.AREA:
                this.state = TextToolState.NONE
                event.editor.decorationOverlay.removeChild(this.svgRect)
                event.editor.svgView.removeChild(this.defs)

                let x0=this.mouseDownAt!.x, y0=this.mouseDownAt!.y, x1=event.x, y1=event.y
                if (x1<x0) [x0,x1] = [x1,x0]
                if (y1<y0) [y0,y1] = [y1,y0]
                let rect = new Rectangle({origin: { x: x0, y: y0 }, size: { width: x1-x0, height: y1-y0 }})
                let text = new figures.Text(rect)
                event.editor.addFigure(text)
                break
        }
    }

    keydown(editor: FigureEditor, keyboardEvent: KeyboardEvent) {
        if (this.state == TextToolState.EDIT) {
            this.text.cursor.keydown(keyboardEvent)
        }
    }
    
    private setCursor(type: TextCursor, svg: SVGElement) {
        if (this.currentCursor === type)
            return
        this.currentCursor = type
        svg.style.cursor = ""
        switch(type) {
            case TextCursor.NONE:
                svg.style.cursor = ""
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
