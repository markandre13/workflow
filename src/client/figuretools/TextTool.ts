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

export enum TextToolState {
    NONE
}

export class TextTool extends Tool {
    state: TextToolState

    constructor() {
        super()
        this.state = TextToolState.NONE
    }
    
    activate(event: EditorEvent) {
        this.setCursorForHandle(0, event.editor.svgView)
    }
    
    deactivate(event: EditorEvent) {
        event.editor.svgView.style.cursor = ""
    }

    mousedown(event: EditorEvent) {
    }

    mousemove(event: EditorEvent) {

    }

    mouseup(event: EditorEvent) {
    }

    keydown(editor: FigureEditor, keyboardEvent: KeyboardEvent) {

    }
    
    private setCursorForHandle(handle: number, svg: SVGElement) {
        // return
        switch(handle) {
            case 0:
                svg.style.cursor = `url(${Tool.cursorPath}text-plain.svg) 9 11, move`
                break
        }
    }
}
