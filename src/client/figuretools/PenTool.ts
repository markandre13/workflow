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

// Icon: something with splines/beziérs (isograph drawing bezier?)
// Illustrator uses a nib cursor, despite the fixed line width.
// Hence I use a technical pena as cursor, like a rapido/iso-graph
// Pen Tool (P): Create Paths <=== we are here
//   Anchor
//   Anchor has two handles
// Add Anchor Point Tool (+)
// Delete Anchor Point Tool (-)
// Anchor Point Tool (Shift+C)

// Similar tools:
// Curvature Tool (Shift+~): draw lines first, then bend them (isograph picking a curve?)
// how about combining this with the pen tool by moving add/remove anchor elsewhere?

// Pencil Tool (N): Freehand with fixed width (Icon: isograph/radiograph & winding line)
// Paintbrush Tool (B): Freehand with variable width (Icon: brush/nib)
// pencil, brush, nib, ... should all be the same tool, but with different configuration,
// similar to manga studio/cell studio paint, icon/cursor would be a nib, which might be
// confusion to illustrator users but it would be more realistic

// Blob Tool (Shift B): Like the marker tool I came up with (Icon: marker)

// Testing: I want visual unit tests for this!!!

import { Tool } from "./Tool"
import { EditorMouseEvent } from "../figureeditor"
import { Path } from "../figures/Path"

enum Cursor {
    DEFAULT,
    READY,
    ACTIVE,
    // CORNER, // this is a handle cursor
    // ADD_ANCHOR, // position dependent
    // DELETE_ANCHOR, // this is a handle cursor
    // CONTINUE, // this is a handle cursor
    // CLOSE // this is a handle cursor
}


export class PenTool extends Tool {
    svg?: SVGElement
    path?: Path

    constructor() {
        super()
    }

    override activate(event: EditorMouseEvent) {
        Tool.selection.clear()
        this.setCursor(event, Cursor.READY)
    }

    override deactivate(event: EditorMouseEvent) {
        this.setCursor(event, Cursor.DEFAULT)
    }

    override mousedown(event: EditorMouseEvent) {
        this.setCursor(event, Cursor.ACTIVE)

        this.path = new Path()
        this.path.move(event)
        this.path.line(event)

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
        if (this.path) {
            this.path.path.data[1].values[0] = event.x
            this.path.path.data[1].values[1] = event.y
            this.path.updateSVG(this.path.getPath(), event.editor.decorationOverlay, this.svg)
        }
    }

    override mouseup(event: EditorMouseEvent) {
        if (this.path) {
            event.editor.decorationOverlay.removeChild(this.svg!!)
            // event.editor.addFigure(this.path)
            this.path = undefined
            this.svg = undefined
            this.setCursor(event, Cursor.READY)
        }
    }

    setCursor(event: EditorMouseEvent, cursor: Cursor) {
        switch(cursor) {
            case Cursor.DEFAULT:
                event.editor.svgView.style.cursor = ""
                break
            case Cursor.READY:
                event.editor.svgView.style.cursor = `url(${Tool.cursorPath}pen-ready.svg) 5 1, crosshair`
                break
            case Cursor.ACTIVE:
                event.editor.svgView.style.cursor = `url(${Tool.cursorPath}pen-active.svg) 5 1, crosshair`
                break
        }
    }
}
