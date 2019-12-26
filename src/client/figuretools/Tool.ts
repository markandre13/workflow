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
    outlines: Map<Figure, AbstractPath>

    activate(e: EditorEvent) {}
    deactivate(e: EditorEvent) {}
    mousedown(e: EditorEvent) {}
    mousemove(e: EditorEvent) {}
    mouseup(e: EditorEvent) {}
    
    constructor() {
        if (Tool.selection === undefined) Tool.selection = new FigureSelectionModel() // FIXME: initialization via static doesn't work
        this.handles = new Map<Figure, Array<Path>>()
        this.outlines = new Map<Figure, Path>()
    }

    static createOutlineCopy(path: AbstractPath): AbstractPath {
        let outlinePath = path.clone()
        // FIXME: translate outline by (-1, +1)
        Tool.setOutlineColors(outlinePath)
        outlinePath.updateSVG()
        return outlinePath
    }
    
    static setOutlineColors(path: AbstractPath): void {
        let attributes = {
            stroke: "rgb(79,128,255)",
            strokeWidth: 1,
            fill: "none"
        }
        path.setAttributes(attributes)
    }
    
    createOutlines(editor: FigureEditor): void { // FIXME: rename into createOutlinesForSelection()
        for(let figure of Tool.selection.selection) {
            if (this.outlines.has(figure))
                continue
            let outline = Tool.createOutlineCopy(figure.getPath() as AbstractPath)
            editor.decorationOverlay.appendChild(outline.svg)
            this.outlines.set(figure, outline)
        }
    }
    
    removeOutlines(editor: FigureEditor): void {
        for(let pair of this.outlines) {
            editor.decorationOverlay.removeChild(pair[1].svg)
        }
        this.outlines.clear()
    }
}
