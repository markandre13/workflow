/*
 *  workflow - A collaborative real-time white- and kanban board
 *  Copyright (C) 2018 Mark-André Hopf <mhopf@mark13.org>
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

import {
    Point, Rectangle, Matrix,
    pointPlusPoint, pointMinusPoint, pointMultiplyNumber, pointMinus
} from "../../shared/geometry"
import { Path } from "../path"
import { Figure, Shape } from "../figure"
import { FigureEditor, FigureSelectionModel, EditorEvent } from "../editor"
import { Tool } from "./tool"

export class ShapeTool extends Tool {
    creator: Function
    shape?: Shape

    constructor(creator: Function) {
        super()
        this.creator = creator
    }
    
    activate(event: EditorEvent) {
        Tool.selection.clear()
    }
    
    deactivate(event: EditorEvent) {
    }

    mousedown(event: EditorEvent) {
        this.shape = this.creator() as Shape
        this.shape.setHandlePosition(0, event)
        this.shape.setHandlePosition(2, event)
        if (event.editor.strokeAndFillModel) {
            this.shape.stroke = event.editor.strokeAndFillModel.stroke
            this.shape.fill = event.editor.strokeAndFillModel.fill
        }
        
        let path = this.shape.getPath() as Path
        Tool.setOutlineColors(path)
        event.editor.decorationOverlay.appendChild(path.svg)
    }

    mousemove(event: EditorEvent) {
        this.shape!.setHandlePosition(2, event)
        this.shape!.update()
        Tool.setOutlineColors(this.shape!.getPath() as Path)
    }

    mouseup(event: EditorEvent) {
        let shape = this.shape!
    
        shape.setHandlePosition(2, event)
        
        if (shape.size.width<0) {
            shape.origin.x += shape.size.width
            shape.size.width = -shape.size.width
        }
        if (shape.size.height<0) {
            shape.origin.y += shape.size.height
            shape.size.height = -shape.size.height
        }

        let path = shape.getPath() as Path
        event.editor.decorationOverlay.removeChild(path.svg)

        event.editor.addFigure(shape)
        this.shape = undefined
    }
}
