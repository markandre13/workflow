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

import { Signal } from "toad.js"
import { Matrix } from "shared/geometry"
import { Figure } from "./figures/Figure"
import { Layer } from "./figureeditor/Layer"
import { DrawingModel } from "./figureeditor/DrawingModel"

import * as inf from "shared/workflow"
import * as value from "shared/workflow_value"
import * as valuetype from "shared/workflow_valuetype"
import { DrawingEvent } from "./figureeditor/DrawingEvent"

// FigureEditor -> BoardModel -> Server -> BoardListener_impl -> FigureEditor.updateView()
export class BoardModel implements valuetype.BoardModel, DrawingModel {
    // BoardModel
    bid!: number
    name!: string
    description!: string
    layers!: Array<Layer>

    // LayerModel
    modified: Signal<DrawingEvent>

    board?: inf.Board

    constructor(init: Partial<value.BoardModel>) {
        value.initBoardModel(this, init)
        this.modified = new Signal()
        console.log("BoardModel.constructor()")
    }
    // FIXME: too many functions to do stuff
    transform(layerID: number, indices: Array<number>, matrix: Matrix): void {
        this.board!.transform(layerID, indices, matrix)
    }
    add(layerID: number, figure: Figure) {
        this.board!.add(layerID, figure)
    }

    // these do work over the network
    delete(layerID: number, indices: Array<number>): void {}
    bringToFront(layerID: number, indices: Array<number>): void {}
    bringToBack(layerID: number, indices: Array<number>): void {}
    bringForward(layerID: number, indices: Array<number>): void {}
    bringBackward(layerID: number, indices: Array<number>): void {}
}
