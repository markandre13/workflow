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
import { Point, Rectangle, distancePointToPoint, pointMinusPoint } from "shared/geometry"

// FIXME: cursor: remove white border from tip and set center one pixel above tip
// FIXME: cursor: white surrounding for ready, edge, ...
// FIXME: use (document|body).onmousemove for mouse event outside browser
//        or https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
// FIXME: draw temporary path as outline, sync intermediate steps with the model
// FIXME: use the temporary edgeHandle point also to start new curves instead of adding
//        a new segment? (is that a thing?)

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
    FIRST_DOWN,
    FIRST_UP,
    DOWN,
    UP,

    HOVER0, // figure is active, mouse is up, we've drawn the 1st anchor and handle point
    HOVER,
    EDGE
}

function mirrorPoint(center: Point, point: Point) {
    return pointMinusPoint(center, pointMinusPoint(point, center))
}

export class PenTool extends Tool {
    svg?: SVGElement
    path?: Path
    state = State.READY

    anchors: SVGRectElement[] = []
    _handles = new Array<SVGCircleElement>(3)
    lines = new Array<SVGLineElement>(3)

    edgeHandle?: Point

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

    override mouseEvent(event: EditorMouseEvent) {
        console.log(`PenTool.mouseEvent(): state=${State[this.state]}, type=${event.type}`)
        console.log(`this.path=${this.path}`)

        switch(this.state) {
            case State.READY:
                switch(event.type) {
                    case "mousedown":
                        this.prepareEditor(event)
                        // start with a single anchor rectangle [] where the pointer went down
                        this.addAnchor(event)
                        this.path!.move(event)
                        this.state = State.FIRST_DOWN
                        break
                } break
            case State.FIRST_DOWN:
                switch(event.type) {
                    case "mouseup":
                        this.state = State.FIRST_UP
                        break
                } break
            case State.FIRST_UP:
                switch(event.type) {
                    case "mousedown":
                        this.addAnchor(event)
                        this.path!.line(event)
                        this.path!.updateSVG(this.path!.getPath(), event.editor.decorationOverlay, this.svg)
                        this.state = State.DOWN
                        break
                } break
            case State.DOWN:
                switch(event.type) {
                    case "mouseup": {
                        event.editor.addFigure(new Path(this.path))
                        this.state = State.UP
                    } break
                } break
        }
    }

    protected prepareEditor(event: EditorMouseEvent) {
        this.setCursor(event, Cursor.DIRECT)
        this.decoration = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.decoration.id = "pen-tool-decoration"
        this.updateBoundary() // FIXME: side effect
        event.editor.decorationOverlay.appendChild(this.decoration)

        // start the new path with a single line segment
        this.path = new Path()
        this.path.stroke = "#4f80ff"
        // this.path.move(event)
        // this.path.line(event)

        // FIXME: these two lines we're going to change as follows:
        // move it into a separate function, which only puts the last pathsegment similar to Adobe Illustrator
        // on the decorationOverlay
        const path = this.path.getPath()
        this.svg = this.path.updateSVG(path, event.editor.decorationOverlay)

        // this.setOutlineColors(this.svg) 
        this.decoration.appendChild(this.svg)
    }

    /*
    mouseEventOld(event: EditorMouseEvent) {
        console.log(`PenTool.mouseEvent(): state=${State[this.state]}, type=${event.type}`)
        console.log(`this.path=${this.path}`)

        switch (this.state) {
            case State.READY:
                switch (event.type) {
                    case "mousedown": {
                        // prepare editor
                        this.setCursor(event, Cursor.DIRECT)

                        this.decoration = document.createElementNS("http://www.w3.org/2000/svg", "g")
                        this.decoration.id = "pen-tool-decoration"
                        this.updateBoundary() // FIXME: side effect
                        event.editor.decorationOverlay.appendChild(this.decoration)

                        // start with a single anchor rectangle [] where the pointer went down
                        this.addAnchor(event)

                        // start the new path with a single line segment
                        console.log(`start the new path with a single line segment`)
                        this.path = new Path()
                        this.path.stroke = "#4f80ff"
                        this.path.move(event)
                        this.path.line(event)

                        // FIXME: these two lines we're going to change as follows:
                        // move it into a separate function, which only puts the last pathsegment similar to Adobe Illustrator
                        // on the decorationOverlay
                        const path = this.path.getPath()
                        this.svg = this.path.updateSVG(path, event.editor.decorationOverlay)

                        // this.setOutlineColors(this.svg) 
                        this.decoration.appendChild(this.svg)

                        // this.updateAnchor(0) // create or update
                        this.state = State.DRAG
                    } break
                } break

            case State.DRAG: {
                switch (event.type) {
                    case "mousemove": {
                        const path = this.path!
                        const idx = path.path.data.length - 1
                        const segment = path.path.data[idx]
                        if (segment.type === 'L') {
                            console.log(`PenTool: move initial line handle (at this moment)`) // we could already convert to a curve here!
                            const anchor = { x: segment.values[0], y: segment.values[1] }
                            this.updateHandle(0, anchor, event) // forward handle
                            this.updateHandle(1, anchor, mirrorPoint(anchor, event)) // backward handle
                        } else {
                            console.log(`PenTool: move 'smooth' corner handle`)
                            const p = { x: segment.values![4], y: segment.values![5] }
                            const m = mirrorPoint(p, event)
                            segment.values![2] = m.x
                            segment.values![3] = m.y
                            path.updateSVG(path.getPath(), event.editor.decorationOverlay, this.svg)
                            // keep handle 0, as the previous forward handle
                            this.updateHandle(1, p, event) // forward handle
                            this.updateHandle(2, p, m) // backward handle
                        }
                    } break

                    case "mouseup": {
                        this.setCursor(event, Cursor.ACTIVE)

                        // getLastSegment
                        const path = this.path!
                        const idx = path.path.data.length - 1
                        const segment = path.path.data[idx]

                        // as of now, this is just for the initial line segment
                        // the initial point has been dragged, which means the initial line becomes a curve
                        if (segment.type === 'L' &&
                            distancePointToPoint(
                                event,
                                new Point(segment.values[0], segment.values[1])
                            ) >= 1) {
                                console.log(`PenTool: convert line to curve`) // we could do this earlier
                            segment.type = 'C'
                            const v = new Array<number>(6)
                            v[0] = v[2] = v[4] = event.x
                            v[1] = v[3] = v[5] = event.y
                            segment.values = v
                            path.updateSVG(path.getPath(), event.editor.decorationOverlay, this.svg)
                            this.state = State.HOVER0
                            console.log("set state HOVER0")
                        } else {
                            console.log("set state HOVER")
                            this.state = State.HOVER
                        }
                        // TODO: if this is the end of a segment, update model (either call isLastAnchor? or introduce another state)
                    } break
                }
            } break

            case State.HOVER0:
            case State.HOVER: {
                switch (event.type) {
                    case "mousedown": {
                        this.setCursor(event, Cursor.DIRECT)

                        const path = this.path!
                        const idx = path.path.data.length - 1
                        const segment = path.path.data[idx]

                        if (this.state === State.HOVER0) {
                            const v = segment.values!
                            v[2] = v[4] = event.x
                            v[3] = v[5] = event.y
                            path.updateSVG(path.getPath(), event.editor.decorationOverlay, this.svg)

                            this.addAnchor(event)
                            // const anchor = this.createAnchor(event)
                            // this.decoration!.appendChild(anchor)
                            // this.anchors.push(anchor)
                            this.updateHandle(1)
                        } else {
                            if (this.isFirstAnchor(event)) {
                                console.log(`PenTool: is first anchor: close polygon`)
                                // FIXME: add fill color
                                // FIXME: add curve
                                // FIXME: we might want to continue to drag
                                this.path!.close()
                                path.updateSVG(path.getPath(), event.editor.decorationOverlay, this.svg)
                                this.state = State.READY
                                break
                            }
                            if (this.isLastAnchor(event)) {
                                console.log(`PenTool: is last anchor -> switch to EDGE mode`)
                                this.state = State.EDGE
                                // path.curve(event, event, event)
                                // path.updateSVG(path.getPath(), event.editor.decorationOverlay, this.svg)
                                this.updateHandle(1,
                                    { x: segment.values![4], y: segment.values![5] },
                                    event
                                )
                                break
                            }

                            this.addAnchor(event)

                            let m
                            if (this.edgeHandle === undefined) {
                                console.log(`edgeHandle undefined`)
                                m = mirrorPoint(
                                    { x: segment.values![4], y: segment.values![5] },
                                    { x: segment.values![2], y: segment.values![3] }
                                )
                            } else {
                                console.log(`edge handle`)
                                m = this.edgeHandle
                                this.edgeHandle = undefined
                            }

                            path.curve(m, event, event)
                            path.updateSVG(path.getPath(), event.editor.decorationOverlay, this.svg)

                            this.updateHandle(0,
                                { x: segment.values![4], y: segment.values![5] },
                                m
                            )
                            this.updateHandle(1)
                            this.updateHandle(2)
                        }
                        this.state = State.DRAG
                    } break
                }
            } break
            case State.EDGE: {
                switch (event.type) {
                    case "mousemove": {
                        const path = this.path!
                        const idx = path.path.data.length - 1
                        const segment = path.path.data[idx]
                        this.updateHandle(1,
                            { x: segment.values![4], y: segment.values![5] },
                            event
                        )
                    } break
                    case "mouseup": {
                        const path = this.path!
                        const idx = path.path.data.length - 1
                        const segment = path.path.data[idx]
                        this.updateHandle(1,
                            { x: segment.values![4], y: segment.values![5] },
                            event
                        )
                        this.edgeHandle = event
                        this.state = State.HOVER
                        break
                    } break
                }
            } break

        }
    }
    */

    setCursor(event: EditorMouseEvent, cursor: Cursor) {
        switch (cursor) {
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
        x = Math.round(x - 0.5) + 0.5
        y = Math.round(y - 0.5) + 0.5

        let anchor = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        anchor.setAttributeNS("", "x", `${x}`)
        anchor.setAttributeNS("", "y", `${y}`)
        anchor.setAttributeNS("", "width", `${Figure.HANDLE_RANGE}`)
        anchor.setAttributeNS("", "height", `${Figure.HANDLE_RANGE}`)
        anchor.setAttributeNS("", "stroke", "rgb(79,128,255)")
        anchor.setAttributeNS("", "fill", "#fff")
        return anchor
    }

    addAnchor(p: Point) {
        if (this.anchors.length > 1) {
            this.anchors[this.anchors.length - 1].style.cursor = ""
        }
        const anchor = this.createAnchor(p)
        if (this.anchors.length === 0) {
            anchor.style.cursor = `url(${Tool.cursorPath}pen-close.svg) 5 1, crosshair`
        } else {
            anchor.style.cursor = `url(${Tool.cursorPath}pen-edge.svg) 5 1, crosshair`
        }
        this.decoration!.appendChild(anchor)
        this.anchors.push(anchor)
    }

    isFirstAnchor(p: Point) {
        if (this.anchors.length === 0)
            return false
        const first = this.anchors[0]
        const rect = new Rectangle(
            Number.parseFloat(first.getAttributeNS(null, "x")!),
            Number.parseFloat(first.getAttributeNS(null, "y")!),
            Number.parseFloat(first.getAttributeNS(null, "width")!),
            Number.parseFloat(first.getAttributeNS(null, "height")!)
        )
        return rect.inside(p)
    }

    isLastAnchor(p: Point) {
        if (this.anchors.length === 0)
            return false
        const last = this.anchors[this.anchors.length - 1]
        const rect = new Rectangle(
            Number.parseFloat(last.getAttributeNS(null, "x")!),
            Number.parseFloat(last.getAttributeNS(null, "y")!),
            Number.parseFloat(last.getAttributeNS(null, "width")!),
            Number.parseFloat(last.getAttributeNS(null, "height")!)
        )
        return rect.inside(p)
    }

    createHandle(p: Point) {
        const x = Math.round(p.x - 0.5) + 0.5
        const y = Math.round(p.y - 0.5) + 0.5

        const handle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        handle.setAttributeNS("", "cx", `${x}`)
        handle.setAttributeNS("", "cy", `${y}`)
        handle.setAttributeNS("", "r", `${Figure.HANDLE_RANGE / 2.0}`)
        handle.setAttributeNS("", "stroke", `rgb(79,128,255)`)
        handle.setAttributeNS("", "fill", `rgb(79,128,255)`)
        return handle
    }

    updateHandle(idx: number): void
    updateHandle(idx: number, anchorPos: Point, handlePos: Point): void
    updateHandle(idx: number, anchorPos?: Point, handlePos?: Point): void {
        if (anchorPos === undefined) {
            if (this._handles[idx] !== undefined) {
                this._handles[idx].style.display = "none"
                this.lines[idx].style.display = "none"
            }
            return
        }
        if (handlePos === undefined)
            throw Error("yikes")

        if (this._handles[idx] === undefined) {
            this._handles[idx] = this.createHandle(handlePos)
            this.decoration!.appendChild(this._handles[idx])
            this.lines[idx] = this.createLine(anchorPos, handlePos)
            this.decoration!.appendChild(this.lines[idx])
        } else {
            this._handles[idx].style.display = ""
            this.lines[idx].style.display = ""
            const x = Math.round(handlePos.x - 0.5) + 0.5
            const y = Math.round(handlePos.y - 0.5) + 0.5
            this._handles[idx].setAttributeNS("", "cx", `${x}`)
            this._handles[idx].setAttributeNS("", "cy", `${y}`)
            this.lines[idx].setAttributeNS("", "x1", `${anchorPos.x}`)
            this.lines[idx].setAttributeNS("", "y1", `${anchorPos.y}`)
            this.lines[idx].setAttributeNS("", "x2", `${handlePos.x}`)
            this.lines[idx].setAttributeNS("", "y2", `${handlePos.y}`)
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
