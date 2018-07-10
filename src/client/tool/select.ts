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
import { Path } from "../Path"
import { Figure } from "../figure"
import { FigureEditor, FigureSelection, EditorEvent } from "../editor.ts"
import { Tool } from "./tool"

enum State {
    NONE,
    DRAG_MARQUEE,
    MOVE_HANDLE,
    MOVE_SELECTION
}

export class SelectTool extends Tool {
    state: State

    boundary: Rectangle
    decoration: Array<Path>
    mouseDownAt?: Point

    svgMarquee?: SVGElement
    
    selectedHandle: number
    handleStart: Point
    oldBoundary: Rectangle
    transformation: Matrix

    rotationCenter: Point
    rotationStartDirection: number

    constructor() {
        super()
        this.state = State.NONE
        this.boundary = new Rectangle()
        this.decoration = new Array<Path>()
        
        this.selectedHandle = 0
        this.handleStart = new Point()
        this.oldBoundary = new Rectangle()
        this.transformation = new Matrix()
        this.rotationCenter = new Point()
        this.rotationStartDirection = 0
    }

    mousedown(event: EditorEvent) {
        console.log("SelectTool.mousedown()")
            
        this.mouseDownAt = event

        if (this.downHandle(event)) {
            console.log("down handle")
            return
        }
        console.log("not handle")

        this.transformation.identity()

        let figure = event.editor.selectedLayer!.findFigureAt(event)
        
        if (figure === undefined) {
            this.clearDecoration(event.editor)
            for(let figure of Tool.selection.selection)
                this.destroyOutline(event.editor, figure)
            Tool.selection.clear()
            return
        }
        
        if (Tool.selection.has(figure))
            return
        
        if (!event.shiftKey) {
            this.clearDecoration(event.editor)
            for(let figure of Tool.selection.selection)
                this.destroyOutline(event.editor, figure)
            Tool.selection.clear()
        }
            
        Tool.selection.add(figure)

        this.createOutline(event.editor, figure)
        this.updateBoundary()
        this.updateDecoration(event.editor)
    }

    mousemove(event: EditorEvent) {
        console.log("SelectTool.mousemove()")
        switch(this.state) {
            case State.MOVE_HANDLE:
                this.moveHandle(event)
                return
        }

        if (Tool.selection.empty() && this.svgMarquee === undefined) {
            this.svgMarquee = document.createElementNS("http://www.w3.org/2000/svg", "rect")
            this.svgMarquee.setAttributeNS("", 'stroke', 'rgb(79,128,255)')
            this.svgMarquee.setAttributeNS("", 'fill', 'rgba(79,128,255,0.2)')
            event.editor.decorationOverlay.appendChild(this.svgMarquee)
        }
        if (this.svgMarquee) {
            let x0=this.mouseDownAt!.x, y0=this.mouseDownAt!.y, x1=event.x, y1=event.y
            if (x1<x0) [x0,x1] = [x1,x0]
            if (y1<y0) [y0,y1] = [y1,y0]
            this.svgMarquee.setAttributeNS("", "x", String(Math.round(x0)+0.5)) // FIXME: just a hunch for nice rendering
            this.svgMarquee.setAttributeNS("", "y", String(Math.round(y0)+0.5))
            this.svgMarquee.setAttributeNS("", "width", String(Math.round(x1-x0)))
            this.svgMarquee.setAttributeNS("", "height", String(Math.round(y1-y0)))
            return
        }
        
        // mouse move for handle
        let delta = pointMinusPoint(event, this.mouseDownAt!)
        for(let decorator of this.decoration) {
            decorator.translate(delta)
            decorator.update()
        }
        this.transformation.identity()
        this.transformation.translate(delta)
        this.updateOutline(event.editor)
        event.editor.transformSelection(this.transformation)
        this.mouseDownAt = event
    }

    mouseup(event: EditorEvent) {
        console.log("SelectTool.mouseup()")
        switch(this.state) {
            case State.DRAG_MARQUEE:
                break
            case State.MOVE_HANDLE:
                this.moveHandle(event)
                this.stopHandle(event)
                return
            case State.MOVE_SELECTION:
                break
        }
        this.mouseDownAt = undefined
        if (!event.editor.selectedLayer)
            return
        if (this.svgMarquee) {
            event.editor.decorationOverlay.removeChild(this.svgMarquee)
            this.svgMarquee = undefined
        }
    }

    updateOutline(editor: FigureEditor) {
        // FIXME: improve
        let outlines = this.outlines
        this.outlines = new Map<Figure, Path>()
        for(let [figure, path] of outlines) {
            editor.decorationOverlay.removeChild(path.svg)
            this.createOutline(editor, figure)
        }
        for(let [figure, path] of this.outlines) {
            path.transform(this.transformation)
            path.update()
        }
    }
    
    updateBoundary() {
        this.boundary = new Rectangle()
        for(let figure of Tool.selection.selection) {
            this.boundary.expandByRectangle(figure.bounds())
        }
//        this.boundary.inflate(1.0)
    }
    
    clearDecoration(editor: FigureEditor) {
        for(let decorator of this.decoration) {
            editor.decorationOverlay.removeChild(decorator.svg)
        }
        this.decoration.length = 0
    }
    
    updateDecoration(editor: FigureEditor) {
        this.clearDecoration(editor)

        let path = new Path()
        let rectangle = new Rectangle(this.boundary)
        rectangle.origin.x    = Math.round(rectangle.origin.x-0.5)+0.5
        rectangle.origin.y    = Math.round(rectangle.origin.y-0.5)+0.5
        rectangle.size.width  = Math.round(rectangle.size.width)
        rectangle.size.height = Math.round(rectangle.size.height)
        path.appendRect(rectangle)
        path.transform(this.transformation)
        path.update()
        path.svg.setAttributeNS("", "stroke", "rgb(79,128,255)")
        path.svg.setAttributeNS("", "fill", "none")
        editor.decorationOverlay.appendChild(path.svg)
        this.decoration.push(path)
    
        for(let handle=0; handle<16; ++handle) {
            let path = new Path()
            path.appendRect(this.getBoundaryHandle(handle))
            path.update()
            if (handle<8) {
                path.svg.setAttributeNS("", "stroke", "rgb(79,128,255)")
                path.svg.setAttributeNS("", "fill", "#fff")
            } else {
                path.svg.setAttributeNS("", "stroke", "rgba(0,0,0,0)")
                path.svg.setAttributeNS("", "fill", "rgba(0,0,0,0)")
            }
            this.setCursorForHandle(handle, path.svg)
            editor.decorationOverlay.appendChild(path.svg)
            this.decoration.push(path)
        }
    }
     
    /*******************************************************************
     *                                                                 *
     *                           H A N D L E                           *
     *                                                                 *
     *******************************************************************/

    getBoundaryHandle(handle: number): Rectangle {
        const s = 5.0
        let   x = this.boundary.origin.x,
              y = this.boundary.origin.y,
              w = this.boundary.size.width,
              h = this.boundary.size.height

        switch(handle % 8) {
            case  0: [x, y] = [x       ,y      ]; break
            case  1: [x, y] = [x+w/2.0, y      ]; break
            case  2: [x, y] = [x+w    , y      ]; break
            case  3: [x, y] = [x+w    , y+h/2.0]; break
            case  4: [x, y] = [x+w    , y+h    ]; break
            case  5: [x, y] = [x+w/2.0, y+h    ]; break
            case  6: [x, y] = [x      , y+h    ]; break
            case  7: [x, y] = [x      , y+h/2.0]; break
        }
        let r = new Rectangle()
        r.set(x, y, s, s)
        r.origin = this.transformation.transformPoint(r.origin)
        r.origin.x -= s/2.0
        r.origin.y -= s/2.0

        // for handle <= 7 move away from center by one pixel
        // for handle > 7, move away from center by one + s pixel
        let center = this.transformation.transformPoint(this.boundary.center())
        let v = pointMinusPoint(r.origin, center)
        
        let ax = Math.abs(v.x),
            ay = Math.abs(v.y)
        let a = (ax > ay) ? ax : ay
        if (a !== 0) { // FIXME: test
          v.y /= a
          v.x /= a
        }
        if (handle>=8)
            v = pointMultiplyNumber(v, s)
        r.origin = pointPlusPoint(r.origin, v)
        
        r.origin.x = Math.round(r.origin.x-0.5)+0.5
        r.origin.y = Math.round(r.origin.y-0.5)+0.5
        
        return r
    }
    
    setCursorForHandle(handle: number, svg: SVGElement) {
        switch(handle) {
            case 0:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-nw.svg) 6 6, move")
                break
            case 1:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-n.svg) 4 7, move")
                break
            case 2:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-ne.svg) 6 6, move")
                break
            case 3:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-e.svg) 7 4, move")
                break
            case 4:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-se.svg) 6 6, move")
                break
            case 5:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-s.svg) 4 7, move")
                break
            case 6:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-sw.svg) 6 6, move")
                break
            case 7:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-w.svg) 7 4, move")
                break
            case 8:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-nw.svg) 5 5, move")
                break
            case 9:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-n.svg) 7 2, move")
                break
            case 10:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-ne.svg) 8 5, move")
                break
            case 11:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-e.svg) 5 7, move")
                break
            case 12:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-se.svg) 8 8, move")
                break
            case 13:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-s.svg) 7 5, move")
                break
            case 14:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-sw.svg) 5 8, move")
                break
            case 15:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-w.svg) 2 7, move")
                break
        }
    }
    
    downHandle(event: EditorEvent): boolean {
        if (Tool.selection.empty())
            return false
        for(let handle = 0; handle<16; ++handle) {
            let rectangle = this.getBoundaryHandle(handle)
            if (rectangle.contains(event)) {
                this.state = State.MOVE_HANDLE
                this.selectedHandle = handle
                this.handleStart = event
                this.transformation.identity()
                this.oldBoundary = new Rectangle(this.boundary)
                if (handle >= 8) {
                    this.rotationCenter = this.boundary.center()
                    this.rotationStartDirection = Math.atan2(event.y - this.rotationCenter.y,
                                                             event.x - this.rotationCenter.x)
                }
                return true
            }
        }
        return false
    }
    
    moveHandle(event: EditorEvent) {
        if (this.selectedHandle < 8)
            this.moveHandle2Scale(event)
        else
            this.moveHandle2Rotate(event)
    }
    
    moveHandle2Scale(event: EditorEvent) {
        let x0 = this.boundary.origin.x,
            y0 = this.boundary.origin.y,
            x1 = x0 + this.boundary.size.width,
            y1 = y0 + this.boundary.size.height,
            ox0 = this.oldBoundary.origin.x,
            oy0 = this.oldBoundary.origin.y,
            ox1 = ox0 + this.oldBoundary.size.width,
            oy1 = oy0 + this.oldBoundary.size.height

        switch(this.selectedHandle) {
            case 0: [x0, y0] = [event.x, event.y]; break
            case 1: y0 = event.y; break
            case 2: [x1, y0] = [event.x, event.y]; break
            case 3: x1 = event.x; break
            case 4: [x1, y1] = [event.x, event.y]; break
            case 5: y1 = event.y; break
            case 6: [x0, y1] = [event.x, event.y]; break
            case 7: x0 = event.x; break
        }
            
        let sx = (x1-x0) / (ox1 - ox0),
            sy = (y1-y0) / (oy1 - oy0)
        let X0, OX0, Y0, OY0
        // if (event.editor.getMatrix()) {
        //   ...
        // } else {
            X0 = x0; Y0 = y0
            OX0 = ox0; OY0 = oy0
        // }
        this.transformation.identity()
        this.transformation.translate({x: -OX0, y: -OY0})
        this.transformation.scale(sx, sy)
        this.transformation.translate({x: X0, y: Y0})
        
        this.updateOutline(event.editor)
        this.updateDecoration(event.editor)
    }
    
    moveHandle2Rotate(event: EditorEvent) {
        let rotd = Math.atan2(event.y - this.rotationCenter.y, event.x - this.rotationCenter.x)
        rotd -= this.rotationStartDirection
        let center = this.rotationCenter
        // if (event.editor.getMatrix()) {
        //   ...
        // }
        this.transformation.identity()
        this.transformation.translate(pointMinus(center))
        this.transformation.rotate(rotd)
        this.transformation.translate(center)
        
        this.updateOutline(event.editor)
        this.updateDecoration(event.editor)
    }
    
    stopHandle(event: EditorEvent) {
        this.state = State.NONE
        event.editor.transformSelection(this.transformation)
    }
}
