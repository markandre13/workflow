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

import { Point } from "../../shared/geometry"
import { FigureEditor } from "./FigureEditor"

export class EditorMouseEvent extends Point {
    editor: FigureEditor
    type: string
    mouseDown: boolean
    shiftKey: boolean
    constructor(editor: FigureEditor, point: Point, opt: any = undefined, type: string) {
        super(point)
        this.editor = editor
        this.type = type
        this.mouseDown = (opt || opt.mouseDown) ? true : false
        this.shiftKey = (opt || opt.shiftKey) ? true : false
    }
}
