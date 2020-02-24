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
import { runInThisContext } from "vm"

enum TextCursor {
    NONE,
    EDIT,
    AREA,
    SHAPE,
    PATH
}

enum TextToolState {
    NONE
}

export class TextTool extends Tool {
    state: TextToolState
    currentCursor: TextCursor

    constructor() {
        super()
        this.state = TextToolState.NONE
        this.currentCursor = TextCursor.NONE
    }
    
    activate(event: EditorEvent) {
    }
    
    deactivate(event: EditorEvent) {
        this.setCursor(TextCursor.NONE, event.editor.svgView)
    }

    mousedown(event: EditorEvent) {
    }

    mousemove(event: EditorEvent) {
        let figure = event.editor.selectedLayer!.findFigureAt(event)
        // console.log(`at ${event.x},${event.y} found ${figure}`)
        if (figure === undefined) {
            this.setCursor(TextCursor.AREA, event.editor.svgView)
        } else {
            this.setCursor(TextCursor.SHAPE, event.editor.svgView)
        }
    }

    mouseup(event: EditorEvent) {
    }

    keydown(editor: FigureEditor, keyboardEvent: KeyboardEvent) {

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
