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

import { SelectTool, Tool } from "../figuretools"
import { LocalLayerModel } from "./LocalLayerModel"
import { Figure } from "../figures"
import * as figure from "../figures"
import { FigureEditor } from "./FigureEditor"
import { Path } from "../paths"

import { Point, pointPlusPoint, pointMinusPoint } from "../../shared/geometry"
import { LocalLayer } from "./LocalLayer"
import { EditorEvent } from "./EditorEvent"

// PageObject style API for testing FigureEditor
// https://martinfowler.com/bliki/PageObject.html
export class FigureEditorPageObject {
    figureeditor: FigureEditor
    selectTool: SelectTool
    model: LocalLayerModel
    figures: Array<Figure>
    mousePosition: Point
    constructor() {
        let figureeditor = document.createElement("toad-figureeditor") as FigureEditor
        document.body.innerHTML = ""
        document.body.appendChild(figureeditor)

        Tool.cursorPath = "base/img/cursor/"

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
        // this.model.layers[0].data.push(figure)
        // this.model.modified.trigger()
        this.model.add(0, figure)
        this.figures.push(figure)
    }

    addRectangle() {
        let fig = new figure.Rectangle({ origin: {x:50, y: 50}, size: {width: 20, height: 30}})
        fig.stroke = "#000"
        fig.fill = "#f00"
        this.addFigure(fig)
    }

    selectFigure(index = 0, shift = true) {
        this.clickInsideFigure(index, shift)
        if (!Tool.selection.has(this.figures[index]))
            throw Error("fuck")
        // expect(Tool.selection.has(this.figures[index])).to.be.true
    }

    selectionHasCorner(x: number, y: number): boolean {
        let path = this.selectTool.decoration[0] as Path
        let msg = `Selection decoration has no edge (${x}, ${y}). We have `
        for(let i=0; i<4; ++i) {
            if (path.path[i].values[0]===x && path.path[i].values[1]===y)
                return true
            msg = `${msg} (${path.path[i].values[0]}, ${path.path[i].values[1]})`
        }
        throw Error(msg)
    }

    mouseDownAt(position: Point, shift = true) {
        this.mousePosition = new Point(position)
        this.selectTool.mousedown(new EditorEvent(this.figureeditor, position, {shiftKey: shift}))
    }

    moveMouseTo(point: Point, shift = true) {
        this.mousePosition = new Point(point)
        this.selectTool.mousemove(new EditorEvent(this.figureeditor, this.mousePosition, {shiftKey: shift}))
    }

    moveMouseBy(translation: Point, shift = true) {
        this.mousePosition = pointPlusPoint(this.mousePosition, translation)
        this.selectTool.mousemove(new EditorEvent(this.figureeditor, this.mousePosition, {shiftKey: shift}))
    }

    mouseUp(shift = true) {
        this.selectTool.mouseup(new EditorEvent(this.figureeditor, this.mousePosition, {shiftKey: shift}))
    }

    mouseClickAt(point: Point, shift=false) {
        this.mouseDownAt(point, shift)
        this.mouseUp(shift)
    }

    clickInsideFigure(index = 0, shift = false) {
        this.mouseClickAt(this.centerOfFigure(index), shift)
    }

    centerOfFigure(index = 0): Point {
        return this.figures[index].bounds().center()
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
