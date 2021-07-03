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

import { AbstractPath } from "../paths/AbstractPath"
import { Path } from "../paths/Path"
import { Figure } from "../figures/Figure"
import { EditorMouseEvent } from "../figureeditor/EditorMouseEvent"
import { EditorKeyboardEvent } from "../figureeditor/EditorKeyboardEvent"
import { FigureSelectionModel } from "../figureeditor/FigureSelectionModel"
import { FigureEditor } from "../figureeditor/FigureEditor"
import { Rectangle, Matrix, pointPlusPoint, pointMultiplyNumber, pointMinus, pointMinusSize, sizeMultiplyNumber, isEqual } from "shared/geometry"

export class Tool {
    static selection: FigureSelectionModel // = new FigureSelection()
    static cursorPath = "img/cursor/"

    transformation: Matrix
    boundary: Rectangle
    boundaryTransformation: Matrix

    handles: Map<Figure, Array<AbstractPath>>
    outline: SVGGElement | undefined
    decoration: SVGGElement | undefined

    activate(event: EditorMouseEvent) {}
    deactivate(event: EditorMouseEvent) {}
    mousedown(event: EditorMouseEvent) {}
    mousemove(event: EditorMouseEvent) {}
    mouseup(event: EditorMouseEvent) {}
    keydown(event: EditorKeyboardEvent) {}
    clipboard(event: ClipboardEvent) {}
    
    constructor() {
        if (Tool.selection === undefined) Tool.selection = new FigureSelectionModel() // FIXME: initialization via static doesn't work
        this.transformation = new Matrix()
        this.boundary = new Rectangle()
        this.boundaryTransformation = new Matrix()
        this.handles = new Map<Figure, Array<Path>>()
    }

    updateBoundary() {
        // console.log(`SelectTool.updateBoundary() ENTER`)
        this.boundaryTransformation.identity()
        this.boundary = new Rectangle()

        if (Tool.selection.empty()) {
            // console.log(`SelectTool.updateBoundary() DONE`)
            return
        }

        // get rotation of the selected figures
        let firstRotation = true
        let rotation = 0.0
        for(let figure of Tool.selection.selection) {
            let r: number
            if (figure.matrix === undefined) {
                r = 0.0
            } else {
                r = figure.matrix.getRotation()
                if (isNaN(r)) {
                    rotation = 0.0
                    break
                }
            }

            if (firstRotation) {
                firstRotation = false
                rotation = r
            } else {
                if (!isEqual(r % (Math.PI/2), rotation % (Math.PI/2))) {
                    rotation = 0.0
                    break
                }
            }
        }

        // get boundary of selected figures in a coordinate system rotated by 'rotation'
        let rotationAroundOrigin = new Matrix()
        rotationAroundOrigin.rotate(rotation)
        let inverseRotationAroundOrigin = new Matrix(rotationAroundOrigin).invert()
        let boundary = new Rectangle()
        let firstEdge = true
        for(let figure of Tool.selection.selection) {
            let figureBoundary = figure.bounds()
            // console.log(`figure ${figure.id} matrix`, figure.matrix)
            figureBoundary.forAllEdges( (edge)=>{
                // console.log(`figure ${figure.id} edge ${edge.x}, ${edge.y}`)
                edge = inverseRotationAroundOrigin.transformPoint(edge)
                if (firstEdge) {
                    firstEdge = false
                    boundary.origin = edge   
                } else {
                    boundary.expandByPoint(edge)
                }
            }, figure.matrix)
        }
        
        // get center in real coordinate system
        let center = rotationAroundOrigin.transformPoint(boundary.center())

        // setup rotated boundary
        this.boundary.origin = pointMinusSize(center, sizeMultiplyNumber(boundary.size, 0.5))
        this.boundary.size = boundary.size

        if (rotation != 0.0) {
            this.boundaryTransformation.translate(pointMinus(center))
            this.boundaryTransformation.rotate(rotation)
            this.boundaryTransformation.translate(center)
        }
        // console.log(`SelectTool.updateBoundary() DONE`)
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
        let r = new Rectangle(x, y, Figure.HANDLE_RANGE, Figure.HANDLE_RANGE)
        let m = new Matrix(this.transformation)
        m.append(this.boundaryTransformation)

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
    
    setCursorForHandle(handle: number, svg: SVGElement) {
        // return
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
        this.updateOutlineOfSelection(editor)
        this.updateDecorationOfSelection(editor)
    }

    updateOutlineOfSelection(editor: FigureEditor): void {
        // console.log(`Tool.updateOutlineAndDecorationOfSelection() for selection of ${Tool.selection.selection.size} figures`)
        this.removeOutlines(editor)
        this.createOutlines(editor)
    }

    updateDecorationOfSelection(editor: FigureEditor): void {
        // console.log(`Tool.updateOutlineAndDecorationOfSelection() for selection of ${Tool.selection.selection.size} figures`)
        this.removeDecoration(editor)
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
        let path = figure.getPath()
        if (figure.matrix !== undefined)
            path.transform(figure.matrix)
        path.transform(this.transformation)
        let svg = path.updateSVG(editor.decorationOverlay, undefined)
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
        m.append(this.boundaryTransformation)
        path.transform(m)
    
        // display path
        let svg = path.createSVG("rgb(79,128,255)")
        this.decoration!.appendChild(svg)
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
