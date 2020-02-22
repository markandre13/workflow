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

import { SelectTool, Tool } from "../figuretools"
import { LocalLayerModel } from "./LocalLayerModel"
import { Figure } from "../figures"
import * as figure from "../figures"
import { FigureEditor } from "./FigureEditor"
import { Path } from "../paths"

import { Point, Rectangle, Matrix, pointEqualsPoint, pointPlusPoint, pointPlusSize, pointMinusPoint, pointMinus } from "../../shared/geometry"
import { LocalLayer } from "./LocalLayer"
import { EditorEvent } from "./EditorEvent"

// PageObject style API for testing FigureEditor
// https://martinfowler.com/bliki/PageObject.html
export class FigureEditorUser {
    figureeditor: FigureEditor
    selectTool: SelectTool
    id: number
    model: LocalLayerModel
    figures: Array<Figure>
    mousePosition: Point
    verbose: boolean
    constructor(verbose=false) {
        this.verbose = verbose
        this.id = 0
        let figureeditor = document.createElement("toad-figureeditor") as FigureEditor
        document.body.innerHTML = ""
        document.body.appendChild(figureeditor)

        Tool.cursorPath = "base/img/cursor/"
        if (Tool.selection)
            Tool.selection.clear()

        let selectTool = new SelectTool()
        figureeditor.setTool(selectTool)
        Tool.selection.clear()

        let model = new LocalLayerModel()
        let layer = new LocalLayer()
        
        model.layers.push(layer)
        figureeditor.setModel(model)

        this.figureeditor = figureeditor
        this.selectTool = selectTool
        this.model = model
        this.mousePosition = new Point()
        this.figures = []
    }

    // semantic operations

    addFigure(figure: Figure) {
        if (this.verbose)
            console.log("### ADD FIGURE")
        this.model.add(0, figure)
        this.figures.push(figure)
    }

    addRectangle(rectangle?: Rectangle, center?: Point, radiant?: number) {
        if (this.verbose)
            console.log("### ADD RECTANGLE")
        if (rectangle === undefined)
            rectangle = new Rectangle()
        let fig = new figure.Rectangle(rectangle)
        fig.id = ++this.id
        fig.stroke = "#000"
        fig.fill = "rgba(255,0,0,0.2)"
        if (center !== undefined && radiant !== undefined) {
            let transform = new Matrix()
            transform.translate(pointMinus(center))
            transform.rotate(radiant)
            transform.translate(center)
            fig.matrix = transform
        } else
        if (center !== undefined) {
            let transform = new Matrix()
            transform.translate(center)
            fig.matrix = transform
        }
        this.model.add(0, fig)
        this.figures.push(fig)
    }

    selectFigure(index = 0, shift = true) {
        if (this.verbose)
            console.log("### SELECT FIGURE")
        this.clickInsideFigure(index, shift)
        if (!Tool.selection.has(this.figures[index]))
            throw Error(`could not select figure ${index}`)
        // expect(Tool.selection.has(this.figures[index])).to.be.true
    }

    selectionHasPoint(point: Point) {
        if (Tool.selection.empty())
            throw Error("Error: selection decoration is empty")
        let msg = ""
        for (let i of [0, 2, 4, 6]) {
            let r = this.selectTool.getBoundaryHandle(i)
            if (r.inside(point))
                return
            msg = `${msg} (${r.origin.x}, ${r.origin.y})`
        }
        throw Error(`Selection decoration has no edge (${point.x}, ${point.y}). We have ${msg}`)
    }

    selectionHasRectangle(rectangle: Rectangle, center?: Point, radiant?: number) {
        // console.log("=== selectionHasRectangle ===")
        // console.log("transformation", this.selectTool.transformation)
        // console.log("boundary", this.selectTool.boundary)
        // console.log("boundaryTransformation", this.selectTool.boundaryTransformation)

        let transform: Matrix|undefined = undefined
        if (center !== undefined && radiant !== undefined) {
            transform = new Matrix()
            transform.translate(pointMinus(center))
            transform.rotate(radiant)
            transform.translate(center)
        }

        rectangle.forAllEdges((edge)=>{
            this.selectionHasPoint(edge)
        }, transform)
    }

    renderHasPoint(point: Point) {
        let msg = ""
        for(let [id, ce] of this.figureeditor.cache) {
            for (let segment of (ce.path as Path).data) {
                switch (segment.type) {
                    case 'M':
                    case 'L':
                        if (pointEqualsPoint(point, {x: segment.values[0], y: segment.values[1]}))
                            return
                        msg = `${msg} (${segment.values[0]}, ${segment.values[1]})`
                        break
                    case 'C':
                        throw Error("not implemented yet")
                        break
                }
            }
        }
        throw Error(`Rendered path has no edge (${point.x}, ${point.y}). We have ${msg}`)
    }

    renderHasRectangle(rectangle: Rectangle, center?: Point, radiant?: number) {
        let transform: Matrix|undefined = undefined
        if (center !== undefined && radiant !== undefined) {
            transform = new Matrix()
            transform.translate(pointMinus(center))
            transform.rotate(radiant)
            transform.translate(center)
        }

        rectangle.forAllEdges((edge)=>{
            this.renderHasPoint(edge)
        }, transform)
    }

    outlineHasPoint(point: Point) {
        let outline = this.selectTool.outline!!
        let msg = ""
        for(let i=0; i<outline.childNodes.length; ++i) {
            let path = outline.childNodes[i] as SVGPathElement
            let data = path.getPathData()
            for (let segment of data) {
                switch (segment.type) {
                    case 'M':
                    case 'L':
                        if (pointEqualsPoint(point, {x: segment.values[0], y: segment.values[1]}))
                            return
                        msg = `${msg} (${segment.values[0]}, ${segment.values[1]})`
                        break
                    case 'C':
                        throw Error("not implemented yet")
                        break
                }
            }
        }
        throw Error(`Outline path has no edge (${point.x}, ${point.y}). We have ${msg}`)
    }

    outlineHasRectangle(rectangle: Rectangle, center?: Point, radiant?: number) {
        let transform: Matrix|undefined = undefined
        if (center !== undefined && radiant !== undefined) {
            transform = new Matrix()
            transform.translate(pointMinus(center))
            transform.rotate(radiant)
            transform.translate(center)
        }

        rectangle.forAllEdges((edge)=>{
            this.outlineHasPoint(edge)
        }, transform)
    }

    mouseDownAt(point: Point, shift = true) {
        if (this.verbose)
            console.log(`### MOUSE DOWN AT ${point}`)
        this.mousePosition = new Point(point)
        this.selectTool.mousedown(new EditorEvent(this.figureeditor, point, {shiftKey: shift}))
    }

    moveMouseTo(point: Point, shift = true) {
        this.mousePosition = new Point(point)
        this.selectTool.mousemove(new EditorEvent(this.figureeditor, this.mousePosition, {shiftKey: shift}))
    }

    moveMouseBy(translation: Point, shift = true) {
        if (this.verbose)
            console.log(`### MMOVE MOUSE BY ${translation}`)
        this.mousePosition = pointPlusPoint(this.mousePosition, translation)
        this.selectTool.mousemove(new EditorEvent(this.figureeditor, this.mousePosition, {shiftKey: shift}))
    }

    mouseUp(shift = true) {
        if (this.verbose)
            console.log(`### MOUSE UP`)
        this.selectTool.mouseup(new EditorEvent(this.figureeditor, this.mousePosition, {shiftKey: shift}))
    }

    mouseClickAt(point: Point, shift=false) {
        if (this.verbose)
            console.log(`### MOUSE CLICK AT ${point}`)
        this.mouseDownAt(point, shift)
        this.mouseUp(shift)
    }

    clickInsideFigure(index = 0, shift = false) {
        if (this.verbose)
            console.log(`### CLICK INSIDE FIGURE ${index}`)
        this.mouseDownAt(this.centerOfFigure(index), shift)
        this.mouseUp(shift)
    }

    centerOfFigure(index = 0): Point {
        let f = this.figures[index]
        let center = f.bounds().center()
        if (f.matrix)
            center = (f.matrix as Matrix).transformPoint(center)
        return center
    }

    centerOfNWScaleHandle(index = 0): Point {
        // let range = figure.Figure.HANDLE_RANGE/2
        // return this.figures[index].origin // pointMinusPoint(this.figure.bounds().origin, new Point({x: range, y: range}))
        // return this.figures[index].getHandlePosition(0)
        return this.figures[index].bounds().origin
    }

    centerOfNWRotateHandle(index = 0): Point {
        // return this.figures[index].getHandlePosition(0)
        let handleRange = figure.Figure.HANDLE_RANGE
        return pointMinusPoint(this.figures[index].bounds().origin, {x: handleRange, y: handleRange})
    }
}
