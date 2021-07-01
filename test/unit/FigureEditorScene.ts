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

import { SelectTool, TextTool, Tool } from "client/figuretools"
import { LocalLayerModel } from "client/figureeditor/LocalLayerModel"
import { Figure } from "client/figures"
import * as figure from "client/figures"
import { FigureEditor, EditorKeyboardEvent } from "client/figureeditor"
import { Path } from "client/paths"

import { Point, Rectangle, Matrix, pointEqualsPoint, pointPlusPoint, pointPlusSize, pointMinusPoint, pointMinus } from "shared/geometry"
import { LocalLayer } from "client/figureeditor/LocalLayer"
import { EditorMouseEvent } from "client/figureeditor/EditorMouseEvent"

// PageObject style API for testing FigureEditor
// https://martinfowler.com/bliki/PageObject.html
export class FigureEditorScene {
    figureeditor: FigureEditor
    selectTool: SelectTool
    textTool: TextTool
    id: number
    model: LocalLayerModel
    figures: Array<Figure>
    mousePosition: Point
    verbose: boolean

    constructor(verbose=false) {
        this.verbose = verbose
        this.id = 0
        this.figureeditor = new FigureEditor()
        document.body.innerHTML = ""
        document.body.appendChild(this.figureeditor)

        Tool.cursorPath = "base/img/cursor/"
        if (Tool.selection)
            Tool.selection.clear()

        this.selectTool = new SelectTool()
        this.textTool = new TextTool()
        this.figureeditor.setTool(this.selectTool)

        Tool.selection.clear()

        let model = new LocalLayerModel()
        let layer = new LocalLayer()
        
        model.layers.push(layer)
        this.figureeditor.setModel(model)

        this.model = model
        this.mousePosition = new Point()
        this.figures = []
    }

    sleep(milliseconds: number = 500) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('success')
            }, milliseconds)
        })
    }

    // semantic operations

    selectSelectTool() { this.figureeditor.setTool(this.selectTool)}
    selectTextTool() { this.figureeditor.setTool(this.textTool)}

    addFigure(figure: Figure): void {
        if (this.verbose)
            console.log("### ADD FIGURE")
        this.model.add(0, figure)
        this.figures.push(figure)
    }

    addRectangle(rectangle?: Rectangle, center?: Point, radiant?: number): void {
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

    selectFigure(index = 0, shift = true): void {
        if (this.verbose)
            console.log("### SELECT FIGURE")
        this.clickInsideFigure(index, shift)
        if (!Tool.selection.has(this.figures[index]))
            throw Error(`could not select figure ${index}`)
        // expect(Tool.selection.has(this.figures[index])).to.be.true
    }

    selectionHasPoint(point: Point): void {
        if (Tool.selection.empty())
            throw Error("Error: selection decoration is empty")
        let msg = ""
        for (let i of [0, 2, 4, 6]) {
            let r = this.figureeditor.tool!.getBoundaryHandle(i)
            if (r.inside(point))
                return
            msg = `${msg} (${r.origin.x}, ${r.origin.y})`
        }
        throw Error(`Selection decoration has no edge (${point.x}, ${point.y}). We have ${msg}`)
    }

    selectionHasRectangle(rectangle: Rectangle, center?: Point, radiant?: number): void {
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

    renderHasPoint(point: Point): void {
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

    renderHasRectangle(rectangle: Rectangle, center?: Point, radiant?: number): void {
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

    outlineHasPoint(point: Point): void {
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

    outlineHasRectangle(rectangle: Rectangle, center?: Point, radiant?: number): void {
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

    keydown(key: string): void {
        if (this.verbose)
            console.log(`### KEY DOWN ${key}`)
        let k = new KeyboardEvent("keydown", {key: key})
        this.figureeditor.tool!.keydown(new EditorKeyboardEvent(this.figureeditor, k))
    }

    mouseDownAt(point: Point, shift = true): void {
        if (this.verbose)
            console.log(`### MOUSE DOWN AT ${point.x}, ${point.y}`)
        this.mousePosition = new Point(point)
        this.figureeditor.tool!.mousedown(new EditorMouseEvent(this.figureeditor, point, {shiftKey: shift}))
    }

    moveMouseTo(point: Point, shift = true) {
        if (this.verbose)
            console.log(`### MOVE MOUSE TO ${point.x}, ${point.y}`)
        this.mousePosition = new Point(point)
        this.figureeditor.tool!.mousemove(new EditorMouseEvent(this.figureeditor, this.mousePosition, {shiftKey: shift}))
    }

    moveMouseBy(translation: Point, shift = true): void {
        if (this.verbose)
            console.log(`### MOVE MOUSE BY ${translation.x}, ${translation.y}`)
        this.mousePosition = pointPlusPoint(this.mousePosition, translation)
        this.figureeditor.tool!.mousemove(new EditorMouseEvent(this.figureeditor, this.mousePosition, {shiftKey: shift}))
    }

    mouseUp(shift = true): void {
        if (this.verbose)
            console.log(`### MOUSE UP`)
        this.figureeditor.tool!.mouseup(new EditorMouseEvent(this.figureeditor, this.mousePosition, {shiftKey: shift}))
    }

    mouseClickAt(point: Point, shift=false): void {
        if (this.verbose)
            console.log(`### MOUSE CLICK AT ${point}`)
        this.mouseDownAt(point, shift)
        this.mouseUp(shift)
    }

    clickInsideFigure(index = 0, shift = false): void {
        if (this.verbose)
            console.log(`### CLICK INSIDE FIGURE ${index}`)
        this.mouseDownAt(this.centerOfFigure(index), shift)
        this.mouseUp(shift)
    }

    centerOfFigure(index = 0): Point {
        let f = this.figures[index]
        let center = f.bounds().center()
        if (f.matrix)
            center = f.matrix.transformPoint(center)
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

    createTextArea() {
        this.selectTextTool()
        this.mouseDownAt(new Point(10, 15))
        this.moveMouseBy(new Point(110, 50))
        this.mouseUp()
    }

    sendArrowLeft() {
        const e = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "ArrowLeft"
        })
        this.figureeditor.tool!.keydown(new EditorKeyboardEvent(this.figureeditor, e))
    }

    sendArrowRight() {
        const e = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "ArrowRight"
        })
        this.figureeditor.tool!.keydown(new EditorKeyboardEvent(this.figureeditor, e))
    }

    sendBackspace() {
        const e = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "Backspace"
        })
        this.figureeditor.tool!.keydown(new EditorKeyboardEvent(this.figureeditor, e))

        const x: number[] = []
        x.filter( x => true).shift

    }

    sendDelete() {
        const e = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "Delete"
        })
        this.figureeditor.tool!.keydown(new EditorKeyboardEvent(this.figureeditor, e))
    }

}
