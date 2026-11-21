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

import { Matrix } from "shared/geometry/Matrix"
import { Shape } from "./shapes/Shape"
import { Layer } from "./shapeeditor/Layer"
import { DrawingModel } from "./shapeeditor/DrawingModel"

import * as inf from "shared/workflow"
import * as value from "shared/workflow_value"
import * as valuetype from "shared/workflow_valuetype"
import { DrawingEvent } from "./shapeeditor/DrawingEvent"
import { Signal } from "toad.js/reactive/Signal"

// ShapeEditor -> BoardModel -> Server -> BoardListener_impl -> ShapeEditor.updateView()
export class BoardModel extends DrawingModel implements valuetype.BoardModel {
    // BoardModel
    bid!: number
    name!: string
    comment!: string
    // layers!: Array<Layer>

    // LayerModel
    // modified: Signal<DrawingEvent>

    board?: inf.Board

    constructor(init: Partial<value.BoardModel>) {
        super()
        value.initBoardModel(this, init)
        this.signal = new Signal()
        console.log("BoardModel.constructor()")
    }
    // FIXME: too many functions to do stuff
    transform(layer: Layer, shapes: Array<Shape>, matrix: Matrix): void {
        this.board!.transform(layer.id, shapes.map(shape => shape.id), matrix)
    }
    add(layer: Layer, shape: Shape) {
        this.board!.add(layer.id, shape)
    }

    // TODO: these do not work over the network yet
    delete(layer: Layer, shapes: Array<Shape>): void {}
    setStrokeAndFill(layer: Layer, shapes: Array<Shape>, stroke: string, fill: string):void {}
    setStrokeEnds(layer: Layer, shapes: Array<Shape>, start: inf.StrokeEndType, end: inf.StrokeEndType): void {}
    bringToFront(layer: Layer, shapes: Array<Shape>): void {}
    bringToBack(layer: Layer, shapes: Array<Shape>): void {}
    bringForward(layer: Layer, shapes: Array<Shape>): void {}
    bringBackward(layer: Layer, shapes: Array<Shape>): void {}
}
