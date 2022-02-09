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

// Selection Tool (V): Select, Move, Scale, Rotate, Shear
// missing: Direct Selection Tool (A)

/******************************************************************
 * TERMS
 * o decoration: a rectangular frame with the handles (FIXME: frame is missing, TODO: pivot point for rotation as handle)
 * o outline   : an outline of the selected figures
 *               transformations will only be applied to the outline
 *               until the mouse is released, upon which the transformation
 *               is applied to the model/send to the server
 ******************************************************************/

import { pointMinusPoint, pointMinus } from "shared/geometry"
import { Rectangle } from "shared/geometry/Rectangle"
import { Point } from "shared/geometry/Point"
import { Matrix } from "shared/geometry/Matrix"
import { Figure } from "../figures/Figure"
import { FigureEditor, EditorMouseEvent, EditorKeyboardEvent } from "../figureeditor"
import { Tool } from "./Tool"

export enum SelectToolState {
    NONE,
    DRAG_MARQUEE,       // select figures using a marquee rectangle
    MOVE_HANDLE,        // move a handle to resize and rotate
    MOVE_SELECTION      // move selected
}

export class SelectTool extends Tool {
    state: SelectToolState

    mouseDownAt?: Point
    mouseLastAt?: Point

    marqueeRectangle?: Rectangle
    svgMarquee?: SVGElement
    marqueeOutlines: Map<Figure, SVGElement>
    
    selectedHandle: number
    handleStart: Point
    oldBoundary: Rectangle

    rotationCenter: Point
    rotationStartDirection: number

    constructor() {
        super()
        this.state = SelectToolState.NONE
        this.marqueeOutlines = new Map<Figure, SVGElement>()
        
        this.selectedHandle = 0
        this.handleStart = new Point()
        this.oldBoundary = new Rectangle()
        this.rotationCenter = new Point()
        this.rotationStartDirection = 0
    }
    
    override activate(event: EditorMouseEvent) {
        event.editor.svgView.style.cursor = "default"
        Tool.selection.modified.add( () => {
            this.updateOutlineAndDecorationOfSelection(event.editor)
        }, this)
        Tool.selection.modified.trigger()
    }
    
    override deactivate(event: EditorMouseEvent) {
        Tool.selection.modified.remove(this)
        this.removeOutlines(event.editor)
        this.removeDecoration(event.editor)
    }

    override mousedown(event: EditorMouseEvent) {
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

    override mousemove(event: EditorMouseEvent) {
        if (!event.mouseDown)
            return
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

    override mouseup(event: EditorMouseEvent) {
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
        // reset state for next operation
        this.state = SelectToolState.NONE
        this.transformation.identity()
        this.updateBoundary()
    }

    override keydown(event: EditorKeyboardEvent) {
        if (event.code === "Backspace" || event.code === "Delete") {
            event.editor.deleteSelection()
            Tool.selection.modified.lock()
            Tool.selection.clear()
            Tool.selection.modified.unlock()
        }
    }

    /*******************************************************************
     *                                                                 *
     *                   M O V E   S E L E C T I O N                   *
     *                                                                 *
     *******************************************************************/
    
    private moveSelection(event: EditorMouseEvent) {
        let moveAbsolute = pointMinusPoint(event, this.mouseDownAt!)
        this.transformation.identity()
        this.transformation.translate(moveAbsolute)        
        this.updateOutlineAndDecorationOfSelection(event.editor)
        // this.mouseLastAt = event
    }
    
    private stopMove(event: EditorMouseEvent) {
        this.moveSelection(event)
        event.editor.transformSelection(this.transformation)
        this.mouseDownAt = undefined
    }
         
    /*******************************************************************
     *                                                                 *
     *                           H A N D L E                           *
     *                                                                 *
     *******************************************************************/
    
    private downHandle(event: EditorMouseEvent): boolean {
        // console.log(`SelectTool.downHandle(): (${event.x}, ${event.y})`)
        if (Tool.selection.empty())
            return false
        for(let handle = 0; handle<16; ++handle) {
            const handleInfo = this.getBoundaryHandle(handle)
            if (!handleInfo.path.contains(event))
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
    
    private moveHandle(event: EditorMouseEvent) {
        if (this.selectedHandle < 8)
            this.moveHandle2Scale(event)
        else
            this.moveHandle2Rotate(event)
    }
    
    private moveHandle2Scale(event: EditorMouseEvent) {
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
        // if (this.boundaryTransformation) {
            // let [X0, Y0]   = this.boundaryTransformation.transformArrayPoint([x0, y0])
            // let [OX0, OY0] = this.boundaryTransformation.transformArrayPoint([ox0, oy0])
        // } else {
            let [X0, Y0] = [x0, y0]
            let [OX0, OY0] = [ox0, oy0]
        // }
        // console.log(`  translate(${-OX0}, ${-OY0})`)
        // console.log(`  scale(${sx}, ${sy})`)
        // console.log(`  translate(${X0}, ${Y0})`)
        this.transformation.identity()
        this.transformation.append(m)
        this.transformation.translate({x: -OX0, y: -OY0})
        this.transformation.scale(sx, sy)
        this.transformation.translate({x: X0, y: Y0})
        
        this.transformation.prepend(this.boundaryTransformation)

        // up to here the math for m2 is correct

        //m2.prepend(this.boundaryTransformation)
        
        // this.boundaryTransformation = m2
        //this.boundaryTransformation.identity()
        // this.transformation = m2
        
        this.updateOutlineAndDecorationOfSelection(event.editor)
    }
    
    private moveHandle2Rotate(event: EditorMouseEvent) {
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
    
    private stopHandle(event: EditorMouseEvent) {
        // console.log(`stopHandle`)
        this.state = SelectToolState.NONE
        // console.log("SelectTool.stopHandle() -> editor.transformSelection()")

        let transformation = this.transformation
        this.transformation = new Matrix()
        // console.log(`SelectionTool.stopHandle(): rotation=${transformation.getRotation()}, PI/4=${Math.PI/4}`)
        event.editor.transformSelection(transformation)

        // this.updateBoundaryFromSelection() // because the figure is updated async, or just continue with the current selection?

        this.updateOutlineAndDecorationOfSelection(event.editor)
    }

    /*******************************************************************
     *                                                                 *
     *                            M A R Q U E E                        *
     *                                                                 *
     *******************************************************************/

    private dragMarquee(event: EditorMouseEvent) {
        if (this.svgMarquee === undefined)
            this.createMarquee(event.editor)
        this.updateMarquee(event)
        this.removeMarqueeOutlines(event.editor)
        this.createMarqueeOutlines(event.editor)
    }
  
    private stopMarquee(event: EditorMouseEvent) {

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
  
    private updateMarquee(event: EditorMouseEvent) {
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

            let figureInMarquee = true
            let bounds = figure.bounds()
            bounds.forAllEdges( (edge)=> {
                if (!this.marqueeRectangle!.contains(edge))
                    figureInMarquee = false
            }, figure.matrix)

            if (!figureInMarquee)
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
}
