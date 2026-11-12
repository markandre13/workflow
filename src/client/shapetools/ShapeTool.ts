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

import { Tool } from "./Tool"
import { BoxShape } from "../shapes/BoxShape"
import { EditorPointerEvent, ShapeEditor } from "../shapeeditor"

/**
 * Create Shapes, eg. Rectangle, Circle, ...
 */
export class ShapeTool extends Tool {
    creator: new() => BoxShape
    shape?: BoxShape
    svg?: SVGElement

    constructor(creator: new () => BoxShape) {
        super()
        this.creator = creator
    }

    override activate(editor: ShapeEditor) {
        Tool.selection.clear()
        Tool.setHint(`${this.creator.name.toLowerCase()} tool: <pointer>drag</pointer> to add ${this.creator.name.toLowerCase()}`)
    }

    override pointerdown(event: EditorPointerEvent) {
        this.shape = new this.creator()
        this.shape.setHandlePosition(0, event)
        this.shape.setHandlePosition(2, event)
        if (event.editor.strokeAndFillModel) {
            this.shape.stroke = event.editor.strokeAndFillModel.stroke
            this.shape.fill = event.editor.strokeAndFillModel.fill
        }

        let path = this.shape.getPath()
        this.svg = this.shape.updateSVG(path, event.editor.decoration)
        // Tool.setOutlineColors(path) FIXME
        event.editor.decoration.appendChild(this.svg)
    }

    override pointermove(event: EditorPointerEvent) {
        if (!event.pointerDown) {
            return
        }
        let shape = this.shape!
        shape.setHandlePosition(2, event)
        let path = shape.getPath()
        shape.updateSVG(path, event.editor.decoration, this.svg)
    }

    override pointerup(event: EditorPointerEvent) {
        let shape = this.shape!

        shape.setHandlePosition(2, event)

        if (shape.size.width < 0) {
            shape.origin.x += shape.size.width
            shape.size.width = -shape.size.width
        }
        if (shape.size.height < 0) {
            shape.origin.y += shape.size.height
            shape.size.height = -shape.size.height
        }

        // let path = shape.getPath()
        event.editor.decoration.removeChild(this.svg!!)

        event.editor.addShape(shape)
        this.shape = undefined
        this.svg = undefined
    }
}
