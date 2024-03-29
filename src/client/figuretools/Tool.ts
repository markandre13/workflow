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
import { EditorPointerEvent } from "../figureeditor/EditorPointerEvent"
import { EditorKeyboardEvent } from "../figureeditor/EditorKeyboardEvent"
import { FigureSelectionModel } from "../figureeditor/FigureSelectionModel"
import { FigureEditor } from "../figureeditor/FigureEditor"
import { pointPlusPoint, pointMultiplyNumber, pointMinus, pointMinusSize, sizeMultiplyNumber, isEqual, pointMinusPoint, squaredLength, rotatePointAroundPointBy } from "shared/geometry"
import { Rectangle } from "shared/geometry/Rectangle"
import { Point } from "shared/geometry/Point"
import { Matrix } from "shared/geometry/Matrix"
import { parseXML, Tag, TagType, Text } from "client/utils/xml"

export class Tool {
    static selection: FigureSelectionModel // = new FigureSelection()
    static cursorPath = "img/cursor/"

    debug = false
    insideHandle?: number

    transformation: Matrix
    boundary: Rectangle
    boundaryTransformation: Matrix

    handles: Map<Figure, Array<AbstractPath>>

    activate(editor: FigureEditor) {}
    deactivate(editor: FigureEditor) {}

    pointerEvent(event: EditorPointerEvent) {
        switch(event.type) {
            case "down": return this.pointerdown(event);
            case "move": return this.pointermove(event);
            case "up": return this.pointerup(event);
        }
    }
    pointerdown(event: EditorPointerEvent) {}
    pointermove(event: EditorPointerEvent) {}
    pointerup(event: EditorPointerEvent) {}

    keyEvent(event: EditorKeyboardEvent) {
        switch(event.type) {
            case "down": return this.keydown(event)
            case "up": return this.keyup(event)
        }
    }
    keydown(event: EditorKeyboardEvent) {}
    keyup(event: EditorKeyboardEvent) {}
    clipboard(editor: FigureEditor, event: ClipboardEvent) {}
    
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

    getBoundaryHandle(handle: number): {path: Path, handleDirection: Point} {
        const m = new Matrix(this.transformation)
        m.append(this.boundaryTransformation)

        let   x = this.boundary.origin.x,
              y = this.boundary.origin.y,
              w = this.boundary.size.width,
              h = this.boundary.size.height

        const figureCenter = m.transformPoint({x: x+w/2, y: y+h/2})

        let handleDirection: Point
        switch(handle % 8) {
            case 0:
                handleDirection = { x: -1, y: -1 }
                break
            case 1:
                handleDirection = { x: 0, y: -1 }
                break
            case 2:
                handleDirection = { x: 1, y: -1 }
                break
            case 3:
                handleDirection = { x: 1, y: 0 }
                break
            case 4:
                handleDirection = { x: 1, y: 1 }
                break
            case 5:
                handleDirection = { x: 0, y: 1 }
                break
            case 6:
                handleDirection = { x: -1, y: 1 }
                break
            case 7:
                handleDirection = { x: -1, y: 0 }
                break                                                                                                                                                                                                                        
        }
        const origin = m.transformPoint({x: 0, y: 0})
        handleDirection = pointMinusPoint(m.transformPoint(handleDirection!), origin)

        //
        // HANDLES FOR ROTATION
        //
        if (handle >= 8) {
            let previous, center
            switch(handle) {
                case 8:
                    previous = m.transformPoint({x: x, y: y+h})
                    center = m.transformPoint({x: x, y: y})
                    break
                case 9:
                    previous = m.transformPoint({x: x, y: y})
                    center = m.transformPoint({x: x+w/2, y: y})
                    break
                case 10:
                    previous = m.transformPoint({x: x, y: y})
                    center = m.transformPoint({x: x+w, y: y})
                    break
                case 11:
                    previous = m.transformPoint({x: x+w, y: y})
                    center = m.transformPoint({x: x+w, y: y + h/2})
                    break
                case 12:
                    previous = m.transformPoint({x: x+w, y: y})
                    center = m.transformPoint({x: x+w, y: y+h})
                    break
                case 13:
                    previous = m.transformPoint({x: x+w, y: y+h})
                    center = m.transformPoint({x: x+w/2, y: y+h})
                    break
                case 14:
                    previous = m.transformPoint({x: x+w, y: y+h})
                    center = m.transformPoint({x: x, y: y+h})
                    break
                case 15:
                    previous = m.transformPoint({x: x, y: y+h})
                    center = m.transformPoint({x: x, y: y+h/2})
                    break
                default:
                    throw Error("yikes")
            }

            const toCenterX = pointMinusPoint(center, previous)
            const toCenter = pointMultiplyNumber(toCenterX, 1/Math.sqrt(squaredLength(toCenterX)))

            const scale1 = m.transformPoint({x:0, y: 0})
            const scale2 = m.transformPoint({x: Figure.HANDLE_RANGE, y: 0})
            const size = Math.sqrt(squaredLength(pointMinusPoint(scale2, scale1)))

            let start = pointPlusPoint(center, pointMultiplyNumber(toCenter, -size * 2))
            if (handle % 2 !== 0)
                start = rotatePointAroundPointBy(start, center, -Math.PI/4)

            const path = new Path()
            path.move(center)
            for(let i=0, r=Math.PI/2; i <= 8; ++i, r+=Math.PI/16) {
                path.line(rotatePointAroundPointBy(start, center, r))
            }
            path.close()
            return { path, handleDirection }
        }

        //
        // HANDLES FOR SCALING SCALE
        //
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
        const r = new Rectangle(x, y, Figure.HANDLE_RANGE, Figure.HANDLE_RANGE)

        const center = r.origin = m.transformPoint(r.origin)
        r.origin.x -= Figure.HANDLE_RANGE / 2.0
        r.origin.y -= Figure.HANDLE_RANGE / 2.0

        r.origin.x = Math.round(r.origin.x-0.5)+0.5
        r.origin.y = Math.round(r.origin.y-0.5)+0.5
        
        const path = new Path()
        path.appendRect(r)
        return { path, handleDirection }
    }
    
    setCursorForHandle(h: number, handle: {path: Path, handleDirection: Point}, svg: SVGElement) {
        const r1 = Math.atan2(handle.handleDirection.y, handle.handleDirection.x)
        const r2 = r1 + (13 - 7.5) / 16 * 2 * Math.PI
        let r3 = ( Math.round(r2 / (2 * Math.PI) * 8) + 8 ) % 8

        // console.log(`h=${h}, r1=${r1}, r2=${r2}, r3=${r3}`)

        if (h >= 8)
            r3 += 8

        switch(r3) {
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
        // this.outline.setAttributeNS("", "transform", "translate(-1, 1)")

        for(let figure of Tool.selection.selection) {
            editor.outline.appendChild(this.createOutline(editor, figure))
        }

    }

    createOutline(editor: FigureEditor, figure: Figure) {
        let path = figure.getPath()
        if (figure.matrix !== undefined)
            path.transform(figure.matrix)
        path.transform(this.transformation)
        let svg = path.updateSVG(editor.outline, undefined)
        this.setOutlineColors(svg)
        return svg
    }

    removeOutlines(editor: FigureEditor): void {
        editor.outline.innerHTML = ""
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
            svg.setAttributeNS("", "stroke", "#4f80ff")
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
    
        this.updateBoundary() // FIXME: side effect
        this.createDecorationRectangle(editor)
        this.createDecorationHandles(editor)
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
        editor.outline.appendChild(svg)
    }
    
    createDecorationHandles(editor: FigureEditor) {
        for(let h=15; h>=0; --h) {
            // let path = new Path()
            // path.appendRect(this.getBoundaryHandle(handle))
            const handle = this.getBoundaryHandle(h)
            let svg: SVGElement
            if (h<8) {
                // if (!this.debug) {
                    svg = handle.path.createSVG("rgb(79,128,255)", 1, "#fff")
                // } else {
                //     svg = handle.path.createSVG("#333", 1, "#ccc")
                // }
            } else {
                // transparent SVGElement can not be seen but clicked
                // if (!this.debug) {
                    svg = handle.path.createSVG("rgba(0,0,0,0)", 1, "rgba(0,0,0,0)")
                // } else {
                //     svg = handle.path.createSVG("#333", 1, "#ccc")
                // }
            }
            this.setCursorForHandle(h, handle, svg)
            svg.onpointerenter = () => { 
                this.insideHandle = h
            }
            svg.onpointerleave = () => {
                this.insideHandle = undefined
            }
            editor.decoration.appendChild(svg)
        }
    }

    // FIXME: this belongs in FigureEditor
    removeDecoration(editor: FigureEditor) {
        editor.decoration.innerHTML = ""
        editor.outline.innerHTML = ""
    }

    static createAnchor(figureToScreen: Matrix | undefined, p: Point) {
        if (figureToScreen) {
            p = figureToScreen.transformPoint(p)
        }
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

    static updateAnchor(figureToScreen: Matrix | undefined, p: Point, svg: SVGRectElement) {
        if (figureToScreen) {
            p = figureToScreen.transformPoint(p)
        }
        let x = p.x - Figure.HANDLE_RANGE / 2.0
        let y = p.y - Figure.HANDLE_RANGE / 2.0
        x = Math.round(x - 0.5) + 0.5
        y = Math.round(y - 0.5) + 0.5
        svg.setAttributeNS("", "x", `${x}`)
        svg.setAttributeNS("", "y", `${y}`)
    }

    static createHandle(figureToScreen: Matrix | undefined, p: Point) {
        if (figureToScreen) {
            p = figureToScreen.transformPoint(p)
        }
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

    static updateHandle(figureToScreen: Matrix | undefined, p: Point, svg: SVGCircleElement) {
        if (figureToScreen) {
            p = figureToScreen.transformPoint(p)
        }
        const x = Math.round(p.x - 0.5) + 0.5
        const y = Math.round(p.y - 0.5) + 0.5
        svg.setAttributeNS("", "cx", `${x}`)
        svg.setAttributeNS("", "cy", `${y}`)
    }

    static createLine(figureToScreen: Matrix | undefined, p0: Point, p1: Point) {
        if (figureToScreen) {
            p0 = figureToScreen.transformPoint(p0)
            p1 = figureToScreen.transformPoint(p1)
        }
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
        line.setAttributeNS("", "x1", `${p0.x}`)
        line.setAttributeNS("", "y1", `${p0.y}`)
        line.setAttributeNS("", "x2", `${p1.x}`)
        line.setAttributeNS("", "y2", `${p1.y}`)
        line.setAttributeNS("", "stroke", `rgb(79,128,255)`)
        return line
    }

    static updateLine(figureToScreen: Matrix | undefined, p0: Point, p1: Point, svg: SVGLineElement) {
        if (figureToScreen) {
            p0 = figureToScreen.transformPoint(p0)
            p1 = figureToScreen.transformPoint(p1)
        }
        svg.setAttributeNS("", "x1", `${p0.x}`)
        svg.setAttributeNS("", "y1", `${p0.y}`)
        svg.setAttributeNS("", "x2", `${p1.x}`)
        svg.setAttributeNS("", "y2", `${p1.y}`)
    }

    static setHint(hint: string) {
        const hintView = document.getElementById("hint")
        if (!hintView) {
            return
        }
        const xml = parseXML("Tool.setHint()", hint)
        Tool.transform(xml)
        hintView.innerHTML = xml.toString()
    }

    static clearHint() {
        const hintView = document.getElementById("hint")
        if (!hintView)
            return
        hintView.innerHTML = ``
    }

    static transform(xml: Tag) {
        xml.forAll("pointer", (tag: Tag) => {
            tag.name = "span"
            tag.addAttribute("class", "action")
        })
        xml.forAll("ctrl", (tag: Tag) => {
            tag.name = "kbd"
            tag.type = TagType.Start
            const text = new Text(tag.filename, tag.row, tag.col)
            if (navigator.appVersion.indexOf("Macintosh") !== -1) {
                text.text = " ^ " // aka. ctrl, control
            } else {
                text.text = "ctrl"
            }
            tag.pushBack(text)
        })
        xml.forAll("alt", (tag: Tag) => {
            tag.name = "kbd"
            tag.type = TagType.Start
            const text = new Text(tag.filename, tag.row, tag.col)
            if (navigator.appVersion.indexOf("Macintosh") !== -1) {
                text.text = "⌥" // aka. opt, option
            } else {
                text.text = "alt"
            }
            tag.pushBack(text)
        })
        xml.forAll("meta", (tag: Tag) => {
            tag.name = "kbd"
            tag.type = TagType.Start
            const text = new Text(tag.filename, tag.row, tag.col)
            if (navigator.appVersion.indexOf("Macintosh") !== -1) {
                text.text = "⌘" // aka. cmd, command
            } else {
                text.text = "⊞" // aka. windows, linux key
            }
            tag.pushBack(text)
        })
        xml.forAll("shift", (tag: Tag) => {
            tag.name = "kbd"
            tag.type = TagType.Start
            const text = new Text(tag.filename, tag.row, tag.col)
            text.text = "⇧"
            tag.pushBack(text)
        })
        xml.forAll("enter", (tag: Tag) => {
            tag.name = "kbd"
            tag.type = TagType.Start
            const text = new Text(tag.filename, tag.row, tag.col)
            text.text = "↩"
            tag.pushBack(text)
        })
        xml.forAll("esc", (tag: Tag) => {
            tag.name = "kbd"
            tag.type = TagType.Start
            const text = new Text(tag.filename, tag.row, tag.col)
            text.text = "esc"
            tag.pushBack(text)
        })

        return xml
    }
}
