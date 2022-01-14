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

// Quick orientation for myself before going to work:

// Pen Tool (P): Create Paths <=== we are here
//   Anchor
//   Anchor has two handles
// Add Anchor Point Tool (+)
// Delete Anchor Point Tool (-)
// Anchor Point Tool (Shift+C)

// Similar tools:
// Curvature Tool (Shift+~): draw lines first, then bend them
// Pencil Tool (N): Freehand with fixed width
// Paintbrush Tool (B): Freehand with variable width
// Blob Tool (Shift B): Like the marker tool I came up with

import { Tool } from "./Tool"
import { EditorMouseEvent } from "../figureeditor"
import { Path } from "../figures/Path"

export class PenTool extends Tool {
    svg?: SVGElement
    path?: Path

    constructor() {
        super()
    }

    override activate(event: EditorMouseEvent) {
        Tool.selection.clear()
    }

    override mousedown(event: EditorMouseEvent) {
        console.log(`mousedown!!`)
        this.path = new Path()
        // this.path.move(event)

        if (event.editor.strokeAndFillModel) {
            this.path.stroke = event.editor.strokeAndFillModel.stroke
            this.path.fill = event.editor.strokeAndFillModel.fill
        }

        const path = this.path.getPath()
        this.svg = this.path.updateSVG(path, event.editor.decorationOverlay)
        // Tool.setOutlineColors(path) FIXME
        event.editor.decorationOverlay.appendChild(this.svg)

    }

    override mousemove(event: EditorMouseEvent) {
    }

    override mouseup(event: EditorMouseEvent) {
    }
}
