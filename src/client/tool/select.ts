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
import { FigureEditor, FigureSelectionModel, EditorEvent } from "../editor.ts"
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

    marqueeRectangle?: Rectangle
    svgMarquee?: SVGElement
    marqueeOutlines: Map<Figure, Path>
    
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
        this.marqueeOutlines = new Map<Figure, Path>()
        
        this.selectedHandle = 0
        this.handleStart = new Point()
        this.oldBoundary = new Rectangle()
        this.transformation = new Matrix()
        this.rotationCenter = new Point()
        this.rotationStartDirection = 0
    }
    
    activate(event: EditorEvent) {
        Tool.selection.modified.add( () => {
            this.removeOutlines(event.editor)
            this.removeDecoration(event.editor)
            this.createOutlines(event.editor)
            this.createDecoration(event.editor)
        }, this)
        Tool.selection.modified.trigger()
    }
    
    deactivate(event: EditorEvent) {
        Tool.selection.modified.remove(this)
        this.removeOutlines(event.editor)
        this.removeDecoration(event.editor)
    }

    mousedown(event: EditorEvent) {
        this.mouseDownAt = event

        if (this.downHandle(event)) {
            this.state = State.MOVE_HANDLE
            return
        }

        this.transformation.identity()

        let figure = event.editor.selectedLayer!.findFigureAt(event)
        
        if (figure === undefined) {
            if (!event.shiftKey) {
                Tool.selection.clear()
            }
            this.state = State.DRAG_MARQUEE
            return
        }
        
        this.state = State.MOVE_SELECTION

        if (Tool.selection.has(figure)) {
            return
        }
        
        Tool.selection.modified.lock()
        if (!event.shiftKey)
            Tool.selection.clear()
        Tool.selection.add(figure)
        Tool.selection.modified.unlock()
    }

    mousemove(event: EditorEvent) {
        switch(this.state) {
            case State.MOVE_HANDLE:
                this.moveHandle(event)
                break
            case State.DRAG_MARQUEE:
                this.dragMarquee(event)
                break
            case State.MOVE_SELECTION:
                this.moveSelection(event)
                break
        }
    }

    mouseup(event: EditorEvent) {
        switch(this.state) {
            case State.DRAG_MARQUEE:
                this.stopMarquee(event)
                break
            case State.MOVE_HANDLE:
                this.moveHandle(event)
                this.stopHandle(event)
                break
            case State.MOVE_SELECTION:
                this.moveSelection(event)
                this.stopMove(event)
                break
        }
        this.state = State.NONE
    }
    
    updateOutlines(editor: FigureEditor) {
        this.removeOutlines(editor)
        this.createOutlines(editor)
        for(let [figure, path] of this.outlines) {
            path.transform(this.transformation)
            path.update()
        }
    }
    
    updateDecoration(editor: FigureEditor) {
        this.removeDecoration(editor)
        this.createDecoration(editor)
    }
    
    createDecoration(editor: FigureEditor) {
        if (Tool.selection.empty())
            return
    
        this.updateBoundary()
        this.createDecorationRectangle(editor)
        this.createDecorationHandles(editor)
    }

    removeDecoration(editor: FigureEditor) {
        for(let decorator of this.decoration) {
            editor.decorationOverlay.removeChild(decorator.svg)
        }
        this.decoration.length = 0
    }

    private updateBoundary() {
        this.boundary = new Rectangle()
        for(let figure of Tool.selection.selection) {
            this.boundary.expandByRectangle(figure.bounds())
        }
    }
    
    private createDecorationRectangle(editor: FigureEditor) {
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
    }
    
    private createDecorationHandles(editor: FigureEditor) {
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

    private getBoundaryHandle(handle: number): Rectangle {
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
    
    private setCursorForHandle(handle: number, svg: SVGElement) {
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
    
    private downHandle(event: EditorEvent): boolean {
        if (Tool.selection.empty())
            return false
        for(let handle = 0; handle<16; ++handle) {
            let rectangle = this.getBoundaryHandle(handle)
            if (!rectangle.contains(event))
                continue
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
        return false
    }
    
    private moveHandle(event: EditorEvent) {
        if (this.selectedHandle < 8)
            this.moveHandle2Scale(event)
        else
            this.moveHandle2Rotate(event)
    }
    
    private moveHandle2Scale(event: EditorEvent) {
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
        
        this.updateOutlines(event.editor)
        this.updateDecoration(event.editor)
    }
    
    private moveHandle2Rotate(event: EditorEvent) {
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
        
        this.updateOutlines(event.editor)
        this.updateDecoration(event.editor)
    }
    
    private stopHandle(event: EditorEvent) {
        this.state = State.NONE
        event.editor.transformSelection(this.transformation)
    }

    /*******************************************************************
     *                                                                 *
     *                            M A R Q U E E                        *
     *                                                                 *
     *******************************************************************/

    private dragMarquee(event: EditorEvent) {
        if (this.svgMarquee === undefined)
            this.createMarquee(event.editor)
        this.updateMarquee(event)
        this.removeMarqueeOutlines(event.editor)
        this.createMarqueeOutlines(event.editor)
    }
  
    private stopMarquee(event: EditorEvent) {

        Tool.selection.modified.lock()
        this.copyMarqueeToSelection()
        this.removeMarquee(event.editor)
        this.removeMarqueeOutlines(event.editor)
        Tool.selection.modified.unlock()

        this.mouseDownAt = undefined
    }

    private createMarquee(editor: FigureEditor) {
        if (this.svgMarquee !== undefined)
            return
        this.svgMarquee = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        this.svgMarquee.setAttributeNS("", 'stroke', 'rgb(79,128,255)')
        this.svgMarquee.setAttributeNS("", 'fill', 'rgba(79,128,255,0.2)')
        editor.decorationOverlay.appendChild(this.svgMarquee)
    }
    
    private removeMarquee(editor: FigureEditor) {
        if (this.svgMarquee === undefined)
            return
        editor.decorationOverlay.removeChild(this.svgMarquee)
        this.svgMarquee = undefined
    }
    
    private copyMarqueeToSelection() {
        for(let pair of this.marqueeOutlines) {
            Tool.selection.add(pair[0])
        }
    }
  
    private updateMarquee(event: EditorEvent) {
        let x0=this.mouseDownAt!.x, y0=this.mouseDownAt!.y, x1=event.x, y1=event.y
        if (x1<x0) [x0,x1] = [x1,x0]
        if (y1<y0) [y0,y1] = [y1,y0]
        this.marqueeRectangle = new Rectangle({origin: { x: x0, y: y0 }, size: { width: x1-x0, height: y1-y0 }})
        this.svgMarquee!.setAttributeNS("", "x", String(Math.round(x0)+0.5)) // FIXME: just a hunch for nice rendering
        this.svgMarquee!.setAttributeNS("", "y", String(Math.round(y0)+0.5))
        this.svgMarquee!.setAttributeNS("", "width", String(Math.round(x1-x0)))
        this.svgMarquee!.setAttributeNS("", "height", String(Math.round(y1-y0)))
    }

    private removeMarqueeOutlines(editor: FigureEditor) {
        for(let pair of this.marqueeOutlines) {
            editor.decorationOverlay.removeChild(pair[1].svg)
        }
        this.marqueeOutlines.clear()
    }

    private createMarqueeOutlines(editor: FigureEditor) {
        for(let figure of editor.selectedLayer!.data) {
            if (Tool.selection.has(figure))
                continue

            if (!this.marqueeRectangle!.containsRectangle(figure.bounds()))
                continue

            let outline = Tool.createOutlineCopy(figure.getPath() as Path)
            editor.decorationOverlay.appendChild(outline.svg)
            this.marqueeOutlines.set(figure, outline)
        }
    }

    /*******************************************************************
     *                                                                 *
     *                   M O V E   S E L E C T I O N                   *
     *                                                                 *
     *******************************************************************/
    
    private moveSelection(event: EditorEvent) {
        let delta = pointMinusPoint(event, this.mouseDownAt!)
        for(let decorator of this.decoration) {
            decorator.translate(delta)
            decorator.update()
        }

        this.transformation.identity()
        this.transformation.translate(delta)

        this.updateOutlines(event.editor)

        event.editor.transformSelection(this.transformation)
        this.mouseDownAt = event
    }
    
    private stopMove(event: EditorEvent) {
        this.mouseDownAt = undefined
    }
}
