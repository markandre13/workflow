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

import { Signal } from "toad.js"
import { Matrix } from "../shared/geometry"
import { Figure } from "./figures/Figure"
import { LayerModel } from "./figureeditor/LayerModel"

import * as inf from "../shared/workflow"
import * as stub from "../shared/workflow_stub"
import * as valueimpl from "../shared/workflow_valueimpl"

// FigureEditor -> BoardModel -> Server -> BoardListener_impl -> FigureEditor.updateView()
export class BoardModel extends valueimpl.BoardModel implements LayerModel {
    modified: Signal
    board?: inf.Board
    constructor() {
        super();
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
    delete(layerID: number, indices: Array<number>): void {}
}
