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

// import "assert"
import * as assert from "assert"

import { AbstractPath } from "../paths/AbstractPath"
import { Path } from "../paths/Path"
import { Figure } from "../figures/Figure"
import { EditorEvent } from "../figureeditor/EditorEvent"
import { FigureSelectionModel } from "../figureeditor/FigureSelectionModel"
import { FigureEditor } from "../figureeditor/FigureEditor"

export class Tool {
    static selection: FigureSelectionModel // = new FigureSelection()
    static cursorPath = "img/cursor/"

    handles: Map<Figure, Array<AbstractPath>>
    outline: SVGGElement | undefined
    decoration: SVGGElement | undefined

    activate(e: EditorEvent) {}
    deactivate(e: EditorEvent) {}
    mousedown(e: EditorEvent) {}
    mousemove(e: EditorEvent) {}
    mouseup(e: EditorEvent) {}
    
    constructor() {
        if (Tool.selection === undefined) Tool.selection = new FigureSelectionModel() // FIXME: initialization via static doesn't work
        this.handles = new Map<Figure, Array<Path>>()
    }
}
