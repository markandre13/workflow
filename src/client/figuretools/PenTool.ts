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

// lines & handles are only drawn for one segment at a time

import { Tool } from "./Tool"
import { Figure } from "../figures/Figure"
import { EditorMouseEvent } from "../figureeditor"
import { Path } from "../figures/Path"
import { Path as RawPath } from "../paths/Path"
import { Point, Rectangle, distancePointToPoint } from "shared/geometry"
import { MenuButton } from "toad.js"
import { AbstractPath } from "client/paths/AbstractPath"
import { getTextOfJSDocComment } from "typescript"

// FIXME: cursor: remove white border from tip and set center one pixel above tip
// FIXME: use (document|body).onmousemove for mouse event outside browser
//        or https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture

enum Cursor {
    DEFAULT,
    READY,
    ACTIVE,
    DIRECT
    // CORNER, // this is a handle cursor
    // ADD_ANCHOR, // position dependent
    // DELETE_ANCHOR, // this is a handle cursor
    // CONTINUE, // this is a handle cursor
    // CLOSE // this is a handle cursor
}

enum State {
    READY,
    LINE,
    DIRECT
}

export class PenTool extends Tool {
    svg?: SVGElement
    path?: Path
    state = State.READY

    anchors: SVGRectElement[] = []
    _handles = new Array<SVGCircleElement>(3)
    lines = new Array<SVGLineElement>(3)

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
        switch(this.state) {
            case State.READY:
                this.state = State.DIRECT // make this DIRECT, and switch to line afterwards?
                this.setCursor(event, Cursor.DIRECT)

                this.decoration = document.createElementNS("http://www.w3.org/2000/svg", "g")
                this.decoration.id = "pen-tool-decoration"
                this.updateBoundary() // FIXME: side effect
                event.editor.decorationOverlay.appendChild(this.decoration)

                const anchor = this.createAnchor(event)
                this.decoration.appendChild(anchor)
                this.anchors.push(anchor)

                this.path = new Path()
                if (event.editor.strokeAndFillModel) {
                    this.path.stroke = event.editor.strokeAndFillModel.stroke
                    this.path.fill = event.editor.strokeAndFillModel.fill
                }
                this.path.move(event)
                this.path.line(event)
                const path = this.path.getPath()
                this.svg = this.path.updateSVG(path, event.editor.decorationOverlay)
                this.decoration.appendChild(this.svg)

                // this.updateAnchor(0) // create or update

                break
            // case State.LINE:
            //     this.state = State.DIRECT
            //     this.setCursor(event, Cursor.DIRECT)
            //     break
        }
    }
   
    override mousemove(event: EditorMouseEvent) {
        switch (this.state) {
            // case State.LINE: {
            //     const path = this.path!
            //     const idx = path.path.data.length - 1
            //     path.path.data[idx].values[0] = event.x
            //     path.path.data[idx].values[1] = event.y
            //     path.updateSVG(path.getPath(), event.editor.decorationOverlay, this.svg)
            // } break
            case State.DIRECT: {
                const x = this.path!.path.data[0].values[0]
                const y = this.path!.path.data[0].values[1]

                this.updateHandle(0, {x, y}, event)

                // const line0 = this.createLine({x, y}, event)                   
                // this.decoration!.appendChild(line0)

                const p = {
                    x: x - (event.x - x),
                    y: y - (event.y - y)
                }
                this.updateHandle(1, {x, y}, p)

                // const line1 = this.createLine({x, y}, p)
                // this.decoration!.appendChild(line1)
                // const path = this.path!
                // const idx1 = path.path.data.length - 1
                // const segment1 = path.path.data[idx1]
                // if (segment1.type === 'L' &&
                //     distancePointToPoint(
                //         event,
                //         new Point(segment1.values[0], segment1.values[1])
                //     ) >= 1)
                // {
                //     const segment0 = path.path.data[idx1 - 1]

                //     segment1.type = 'C'
                //     const v = new Array<number>(6)
                //     v[0] = segment0.values[segment0.values.length - 2]
                //     v[1] = segment0.values[segment0.values.length - 1]
                //     v[4] = segment1.values[0]
                //     v[5] = segment1.values[1]
                //     segment1.values = v
                // }
                // if (segment1.type === 'C') {
                //     const v = segment1.values
                //     v[2] = event.x
                //     v[3] = event.y
                //     path.updateSVG(path.getPath(), event.editor.decorationOverlay, this.svg)
                // }
            } break

        }
    }

    override mouseup(event: EditorMouseEvent) {
        switch(this.state) {
            case State.DIRECT:
                this.setCursor(event, Cursor.ACTIVE)
                this.state = State.LINE
        }
        // if (this.path) {
        //     event.editor.decorationOverlay.removeChild(this.svg!!)
        //     // event.editor.addFigure(this.path)
        //     this.path = undefined
        //     this.svg = undefined
        //     this.setCursor(event, Cursor.READY)
        // }
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
            case Cursor.DIRECT:
                event.editor.svgView.style.cursor = `url(${Tool.cursorPath}direct-selection-cursor.svg) 1 1, crosshair`
                break
        }
    }

    createAnchor(p: Point) {
        let x = p.x - Figure.HANDLE_RANGE / 2.0
        let y = p.y - Figure.HANDLE_RANGE / 2.0    
        x = Math.round(x-0.5)+0.5
        y = Math.round(y-0.5)+0.5

        let anchor = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        anchor.setAttributeNS("", "x", `${x}`)
        anchor.setAttributeNS("", "y", `${y}`)
        anchor.setAttributeNS("", "width", `${Figure.HANDLE_RANGE}`)
        anchor.setAttributeNS("", "height", `${Figure.HANDLE_RANGE}`)
        anchor.setAttributeNS("", "stroke", "rgb(79,128,255)")
        anchor.setAttributeNS("", "fill", "#fff")
        return anchor
    }

    createHandle(p: Point) {
        const x = Math.round(p.x-0.5)+0.5
        const y = Math.round(p.y-0.5)+0.5
        
        const handle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        handle.setAttributeNS("", "cx", `${x}`)
        handle.setAttributeNS("", "cy", `${y}`)
        handle.setAttributeNS("", "r", `${Figure.HANDLE_RANGE / 2.0}`)
        handle.setAttributeNS("", "stroke", `rgb(79,128,255)`)
        handle.setAttributeNS("", "fill", `rgb(79,128,255)`)
        return handle
    }

    updateHandle(i: number, anchorPos: Point, handlePos: Point) {
        if (this._handles[i] === undefined) {
            this._handles[i] = this.createHandle(handlePos)
            this.decoration!.appendChild(this._handles[i])
            this.lines[i] = this.createLine(anchorPos, handlePos)
            this.decoration!.appendChild(this.lines[i])
        } else {
            const x = Math.round(handlePos.x-0.5)+0.5
            const y = Math.round(handlePos.y-0.5)+0.5
            this._handles[i].setAttributeNS("", "cx", `${x}`)
            this._handles[i].setAttributeNS("", "cy", `${y}`)
            this.lines[i].setAttributeNS("", "x1", `${anchorPos.x}`)
            this.lines[i].setAttributeNS("", "y1", `${anchorPos.y}`)
            this.lines[i].setAttributeNS("", "x2", `${handlePos.x}`)
            this.lines[i].setAttributeNS("", "y2", `${handlePos.y}`)
        }
    }

    createLine(p0: Point, p1: Point) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
        line.setAttributeNS("", "x1", `${p0.x}`)
        line.setAttributeNS("", "y1", `${p0.y}`)
        line.setAttributeNS("", "x2", `${p1.x}`)
        line.setAttributeNS("", "y2", `${p1.y}`)
        line.setAttributeNS("", "stroke", `rgb(79,128,255)`)
        return line
    }
}
