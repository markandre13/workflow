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

/******************************************************************
 * TERMS
 * o decoration: a rectangular frame with the handles
 * o outline   : an outline of the selected figures
 *               transformations will only be applied to the outline
 *               until the mouse is released, upon which the transformation
 *               is applied to the model/send to the server
 *               sure? what about a sequence of transformations? undo & transform again?
 * 
 * UPCOMING IMPLEMENTATION FOR ROTATION
 * o when figures are selected, we calculate the decoration and it's
 *   transformation (currently transformation is set to identity regularly)
 * o when figures do not have a similar transformation, identity will
 *   be used
 ******************************************************************/

import {
    Point, Rectangle, Matrix,
    pointPlusPoint, pointMinusPoint, pointMultiplyNumber, pointMinus
} from "../../shared/geometry"
import { Path } from "../paths/Path"
import { Figure } from "../figures/Figure"
import { AttributedFigure } from "../figures/AttributedFigure"
import { EditorEvent } from "../figureeditor/EditorEvent"
import { FigureEditor } from "../figureeditor/FigureEditor"
import { Tool } from "./Tool"
import { Transform } from "../figures/Transform"
import { PathGroup } from "../paths/PathGroup"

export enum SelectToolState {
    NONE,
    DRAG_MARQUEE,       // select figures using a marquee rectangle
    MOVE_HANDLE,        // move a handle to resize and rotate
    MOVE_SELECTION      // move selected
}

export class SelectTool extends Tool {
    state: SelectToolState

    boundary: Rectangle
    boundaryTransformation: Matrix
    mouseDownAt?: Point
    mouseLastAt?: Point

    marqueeRectangle?: Rectangle
    svgMarquee?: SVGElement
    marqueeOutlines: Map<Figure, SVGElement>
    
    selectedHandle: number
    handleStart: Point
    oldBoundary: Rectangle
    transformation: Matrix

    rotationCenter: Point
    rotationStartDirection: number

    constructor() {
        super()
        this.state = SelectToolState.NONE
        this.boundary = new Rectangle()
        this.boundaryTransformation = new Matrix()
        this.marqueeOutlines = new Map<Figure, SVGElement>()
        
        this.selectedHandle = 0
        this.handleStart = new Point()
        this.oldBoundary = new Rectangle()
        this.transformation = new Matrix()
        this.rotationCenter = new Point()
        this.rotationStartDirection = 0
    }
    
    activate(event: EditorEvent) {
        Tool.selection.modified.add( () => {
            this.updateOutlineAndDecorationOfSelection(event.editor)
        }, this)

        if (event.editor.strokeAndFillModel) {
            event.editor.strokeAndFillModel.modified.add( () => {
                // console.log("SelectTool.strokeAndFillModel.modified -> update selected figures")
                for(let figure of Tool.selection.selection) {
                    if (figure instanceof AttributedFigure) {
                        figure.stroke = event.editor.strokeAndFillModel!.stroke
                        figure.fill = event.editor.strokeAndFillModel!.fill
                    }
                }
            }, this)
        }
        Tool.selection.modified.trigger()
    }
    
    deactivate(event: EditorEvent) {
        Tool.selection.modified.remove(this)
        if (event.editor.strokeAndFillModel) {
            event.editor.strokeAndFillModel!.modified.remove(this)
        }
        this.removeOutlines(event.editor)
        this.removeDecoration(event.editor)
    }

    mousedown(event: EditorEvent) {
        this.mouseDownAt = event
        this.mouseLastAt = event

        if (this.downHandle(event)) {
            this.state = SelectToolState.MOVE_HANDLE
            // console.log(`DOWN: START TO MOVE HANDLE ${this.selectedHandle}`)
            return
        }

        this.transformation.identity()

        let figure = event.editor.selectedLayer!.findFigureAt(event)
        
        if (figure === undefined) {
            if (!event.shiftKey) {
                Tool.selection.clear()
            }
            this.state = SelectToolState.DRAG_MARQUEE
            return
        }
        
        this.state = SelectToolState.MOVE_SELECTION

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
            case SelectToolState.MOVE_HANDLE:
                this.moveHandle(event)
                break
            case SelectToolState.DRAG_MARQUEE:
                this.dragMarquee(event)
                break
            case SelectToolState.MOVE_SELECTION:
                this.moveSelection(event)
                break
        }
    }

    mouseup(event: EditorEvent) {
        switch(this.state) {
            case SelectToolState.DRAG_MARQUEE:
                this.stopMarquee(event)
                break
            case SelectToolState.MOVE_HANDLE:
                // console.log("UP: HANDLE")
                this.moveHandle(event)
                this.stopHandle(event)
                break
            case SelectToolState.MOVE_SELECTION:
                this.moveSelection(event)
                this.stopMove(event)
                break
        }
        this.state = SelectToolState.NONE
    }

    /*******************************************************************
     *                                                                 *
     *                   M O V E   S E L E C T I O N                   *
     *                                                                 *
     *******************************************************************/
    
    private moveSelection(event: EditorEvent) {

        // move decoration & outline
        let moveAbsolute = pointMinusPoint(event, this.mouseDownAt!)
        let translate = `translate(${moveAbsolute.x}, ${moveAbsolute.y})`
        this.decoration!.setAttributeNS("", "transform", translate)
        this.outline!.setAttributeNS("", "transform", translate)

        // change model
        let moveRelative = pointMinusPoint(event, this.mouseLastAt!)
        this.transformation.identity()
        this.transformation.translate(moveRelative)
        event.editor.transformSelection(this.transformation)

        this.mouseLastAt = event
    }
    
    private stopMove(event: EditorEvent) {
        this.mouseDownAt = undefined
    }
         
    /*******************************************************************
     *                                                                 *
     *                           H A N D L E                           *
     *                                                                 *
     *******************************************************************/

    private updateBoundary() {
        // console.log("SelectTool.updateBoundary()")
        this.boundary = new Rectangle()

        if (Tool.selection.empty()) {
            this.boundaryTransformation.identity()
            return
        }

        // for(let figure of Tool.selection.selection) {
        //     let figureBoundary = figure.bounds()
        //     this.boundary.expandByRectangle(figureBoundary)
        // }


        if (Tool.selection.selection.size > 1)
            throw Error("can't handle more than one figure yet")

        let figure
        for(let f of Tool.selection.selection) {
            figure = f
            break
        }

        if (figure instanceof Transform) {
            // console.log("it's a transform")
            this.boundaryTransformation = new Matrix(figure.matrix)
            for(let f of figure.childFigures) {
                this.boundary.expandByRectangle(f.bounds())
            }
        } else {
            if (figure && figure.matrix)
                this.boundaryTransformation = new Matrix(figure.matrix)
            else
                this.boundaryTransformation.identity()
            for(let figure of Tool.selection.selection) {
                this.boundary.expandByRectangle(figure.bounds())
            }
        }
    }

    getBoundaryHandle(handle: number): Rectangle {
        let   x = this.boundary.origin.x,
              y = this.boundary.origin.y,
              w = this.boundary.size.width,
              h = this.boundary.size.height

        let v = { x: 0, y: 0} // FIXME: pre-store x in an array
        switch(handle % 8) {
            case  0:
                [x, y] = [x       ,y      ]
                v = { x: -1, y: -1}
                break
            case  1:
                [x, y] = [x+w/2.0, y      ]
                v = { x:  0, y: -1}
                break
            case  2:
                [x, y] = [x+w    , y      ]
                v = { x:  1, y: -1}
                break
            case  3:
                [x, y] = [x+w    , y+h/2.0]
                v = { x:  1, y:  0}
                break
            case  4:
                [x, y] = [x+w    , y+h    ]
                v = { x:  1, y:  1}
                break
            case  5:
                [x, y] = [x+w/2.0, y+h    ]
                v = { x:  0, y:  1}
                break
            case  6:
                [x, y] = [x      , y+h    ]
                v = { x: -1, y:  1}
                break
            case  7:
                [x, y] = [x      , y+h/2.0]
                v = { x: -1, y:  0}
                break
        }
        let r = new Rectangle()
        r.set(x, y, Figure.HANDLE_RANGE, Figure.HANDLE_RANGE)

        let m = new Matrix(this.transformation)
        m.prepend(this.boundaryTransformation)

        r.origin = m.transformPoint(r.origin)
        r.origin.x -= Figure.HANDLE_RANGE / 2.0
        r.origin.y -= Figure.HANDLE_RANGE / 2.0

        // for handle <= 7 move away from center by one pixel
        // for handle > 7, move away from center by one + s pixel

        if (handle>=8) {
            v = pointMultiplyNumber(v, Figure.HANDLE_RANGE+1)
            r.origin = pointPlusPoint(r.origin, v)
        }

        r.origin.x = Math.round(r.origin.x-0.5)+0.5
        r.origin.y = Math.round(r.origin.y-0.5)+0.5
        
        return r
    }
    
    private setCursorForHandle(handle: number, svg: SVGElement) {
        return
        switch(handle) {
            case 0:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-nw.svg) 6 6, move`)
                break
            case 1:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-n.svg) 4 7, move`)
                break
            case 2:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-ne.svg) 6 6, move`)
                break
            case 3:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-e.svg) 7 4, move`)
                break
            case 4:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-se.svg) 6 6, move`)
                break
            case 5:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-s.svg) 4 7, move`)
                break
            case 6:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-sw.svg) 6 6, move`)
                break
            case 7:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-w.svg) 7 4, move`)
                break
            case 8:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-nw.svg) 5 5, move`)
                break
            case 9:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-n.svg) 7 2, move`)
                break
            case 10:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-ne.svg) 8 5, move`)
                break
            case 11:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-e.svg) 5 7, move`)
                break
            case 12:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-se.svg) 8 8, move`)
                break
            case 13:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-s.svg) 7 5, move`)
                break
            case 14:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-sw.svg) 5 8, move`)
                break
            case 15:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-w.svg) 2 7, move`)
                break
        }
    }
    
    private downHandle(event: EditorEvent): boolean {
        // console.log(`SelectTool.downHandle(): (${event.x}, ${event.y})`)
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
        // console.log(`SelectTool.moveHandle2Scale()`)

        // new boundary = (x0,y0)-(x1,y1), old boundary = (ox0,oy0)-(ox1,oy1)
        let x0 = this.boundary.origin.x,
            y0 = this.boundary.origin.y,
            x1 = x0 + this.boundary.size.width,
            y1 = y0 + this.boundary.size.height,
            ox0 = this.oldBoundary.origin.x,
            oy0 = this.oldBoundary.origin.y,
            ox1 = ox0 + this.oldBoundary.size.width,
            oy1 = oy0 + this.oldBoundary.size.height

        let m = new Matrix(this.boundaryTransformation)
        m.invert()
        let p = m.transformPoint(event)
        // console.log(`mouse up at screen ${event.x}, ${event.y}`)
        // console.log(`mouse up at boundary ${p.x}, ${p.y}`)

        switch(this.selectedHandle) {
            case 0: [x0, y0] = [p.x, p.y]; break
            case 1: y0 = p.y; break
            case 2: [x1, y0] = [p.x, p.y]; break
            case 3: x1 = p.x; break
            case 4: [x1, y1] = [p.x, p.y]; break
            case 5: y1 = p.y; break
            case 6: [x0, y1] = [p.x, p.y]; break
            case 7: x0 = p.x; break
        }

        let sx = (x1-x0) / (ox1 - ox0),
            sy = (y1-y0) / (oy1 - oy0)

        // console.log(`  handle ${this.selectedHandle}`)
        // console.log(`  ox0=${ox0}, oy0=${oy0}, ox1=${ox1}, oy1=${oy1}`)
        // console.log(`  x0=${x0}, y0=${y0}, x1=${x1}, y1=${y1}`)
        // console.log(`  sx=${sx}, sy=${sy}`)

        // let X0, OX0, Y0, OY0
        // if (event.editor.getMatrix()) {
            let [X0, Y0] = m.transformArrayPoint([x0, y0])
            let [OX0, OY0] = m.transformArrayPoint([ox0, oy0])
        //   ...
        // } else {
            X0 = x0; Y0 = y0
            OX0 = ox0; OY0 = oy0
        // }
        let m2 = new Matrix()
        // console.log(`  translate(${-OX0}, ${-OY0})`)
        // console.log(`  scale(${sx}, ${sy})`)
        // console.log(`  translate(${X0}, ${Y0})`)
        m2.translate({x: -OX0, y: -OY0})
        m2.scale(sx, sy)
        m2.translate({x: X0, y: Y0})
        // this.transformation.prepend(m2)

        // up to here the math for m2 is correct

        //m2.prepend(this.boundaryTransformation)
        
        // this.boundaryTransformation = m2
        //this.boundaryTransformation.identity()
        this.transformation = m2
        
        this.updateOutlineAndDecorationOfSelection(event.editor)
    }
    
    private moveHandle2Rotate(event: EditorEvent) {
        // console.log(`moveHandle2Rotate`)
        let rotd = Math.atan2(event.y - this.rotationCenter.y, event.x - this.rotationCenter.x)
        rotd -= this.rotationStartDirection
        let center = this.rotationCenter
        // if (event.editor.getMatrix()) {
        //   ...
        // }

        // console.log(`SelectTool.moveHandle2Rotate(): center=(${center.x}, ${center.y}), radians=${rotd}`)

        this.transformation.identity()
        this.transformation.translate(pointMinus(center))
        this.transformation.rotate(rotd)
        this.transformation.translate(center)
        
        this.updateOutlineAndDecorationOfSelection(event.editor)
    }
    
    private stopHandle(event: EditorEvent) {
        // console.log(`stopHandle`)
        this.state = SelectToolState.NONE
        // console.log("SelectTool.stopHandle() -> editor.transformSelection()")

        let transformation = this.transformation
        this.transformation = new Matrix()
        event.editor.transformSelection(transformation)

        // this.updateBoundaryFromSelection() // because the figure is updated async, or just continue with the current selection?

        this.updateOutlineAndDecorationOfSelection(event.editor)
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

    private createMarqueeOutlines(editor: FigureEditor) {
        for(let figure of editor.selectedLayer!.data) {
            if (Tool.selection.has(figure))
                continue

            if (!this.marqueeRectangle!.containsRectangle(figure.bounds() as Rectangle))
                continue

            let svg = this.createOutline(editor, figure)

            editor.decorationOverlay.appendChild(svg)
            this.marqueeOutlines.set(figure, svg)
        }
    }

    private removeMarqueeOutlines(editor: FigureEditor) {
        for(let pair of this.marqueeOutlines) {
            editor.decorationOverlay.removeChild(pair[1])
        }
        this.marqueeOutlines.clear()
    }

    /*******************************************************************
     *                                                                 *
     *             O U T L I N E   &   D E C O R A T I O N             *
     *                                                                 *
     *******************************************************************/

    // NOTE: might want to generalize this in the future to be available
    //       for all tools, plugable for different look/device requirements,
    //       handles could be distinguished into corner, curve, ...

    updateOutlineAndDecorationOfSelection(editor: FigureEditor): void {
        // console.log(`Tool.updateOutlineAndDecorationOfSelection() for selection of ${Tool.selection.selection.size} figures`)
        this.removeOutlines(editor)
        this.removeDecoration(editor)
        this.createOutlines(editor)
        this.createDecoration(editor)            
    }

    createOutlines(editor: FigureEditor): void { // FIXME: rename into createOutlinesForSelection()
        this.outline = document.createElementNS("http://www.w3.org/2000/svg", "g")
        // this.outline.setAttributeNS("", "transform", "translate(-1, 1)")

        for(let figure of Tool.selection.selection) {
            this.outline.appendChild(this.createOutline(editor, figure))
        }

        editor.decorationOverlay.appendChild(this.outline)
    }

    createOutline(editor: FigureEditor, figure: Figure) {
        let path = figure.getPath() as Path
        if (figure.matrix !== undefined)
            path.transform(figure.matrix as Matrix)
        path.transform(this.transformation)
        let svg = figure.updateSVG(path, undefined)
        this.setOutlineColors(svg)
        return svg
    }

    removeOutlines(editor: FigureEditor): void {
        if (this.outline) {
            editor.decorationOverlay.removeChild(this.outline)
            this.outline = undefined
        }
    }
    
    setOutlineColors(svg: SVGElement): void {
        if (svg instanceof SVGGElement) {
            // for(let child of svg.childNodes) {
            for(let i=0; i<svg.childNodes.length; ++i) {
                let child = svg.childNodes[i] as SVGElement
                this.setOutlineColors(child)
            }
        } else {
            svg.setAttributeNS("", "stroke-width", "1")
            svg.setAttributeNS("", "stroke", "rgb(79,128,255)")
            svg.setAttributeNS("", "fill", "none")
        }
    }

    updateDecoration(editor: FigureEditor) {
        this.removeDecoration(editor)
        this.createDecoration(editor)
    }
    
    createDecoration(editor: FigureEditor) {
        if (Tool.selection.empty())
            return

        this.decoration = document.createElementNS("http://www.w3.org/2000/svg", "g")
    
        this.updateBoundary() // FIXME: side effect
        this.createDecorationRectangle(editor)
        this.createDecorationHandles(editor)

        editor.decorationOverlay.appendChild(this.decoration)
    }

    createDecorationRectangle(editor: FigureEditor) {
        // adjust boundary to nice looking screen coordinates
        let rectangle = new Rectangle(this.boundary)
        rectangle.origin.x    = Math.round(rectangle.origin.x-0.5)+0.5
        rectangle.origin.y    = Math.round(rectangle.origin.y-0.5)+0.5
        rectangle.size.width  = Math.round(rectangle.size.width)
        rectangle.size.height = Math.round(rectangle.size.height)

        // convert to path
        let path = new Path()
        path.appendRect(rectangle)

        // transform path to screen
        let m = new Matrix(this.transformation)
        m.prepend(this.boundaryTransformation)
        path.transform(m)
    
        // display path
        this.decoration!.appendChild(path.createSVG("#rgb(79,128,255)"))
    }
    
    createDecorationHandles(editor: FigureEditor) {
        for(let handle=0; handle<16; ++handle) {
            let path = new Path()
            path.appendRect(this.getBoundaryHandle(handle))
            let svg: SVGElement
            if (handle<8) {
                svg = path.createSVG("rgb(79,128,255)", 1, "#fff")
            } else {
                // transparent SVGElement can not be seen but clicked
                svg = path.createSVG("rgba(0,0,0,0)", 1, "rgba(0,0,0,0)")
            }
            this.setCursorForHandle(handle, svg)
            this.decoration!.appendChild(svg)
        }
    }

    removeDecoration(editor: FigureEditor) {
        if (this.decoration) {
            editor.decorationOverlay.removeChild(this.decoration)
            this.decoration = undefined
        }
    }
}
