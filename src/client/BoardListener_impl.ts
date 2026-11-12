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

import { ORB } from "corba.js"
import { Matrix } from "shared/geometry/Matrix"
import { Shape } from "./shapes"
import { BoardModel } from "./BoardModel"
import { Operation } from "./shapeeditor/ShapeEditor"

import * as skel from "shared/workflow_skel"

// ShapeEditor -> BoardModel -> Server -> BoardListener_impl -> ShapeEditor.updateView()
export class BoardListener_impl extends skel.BoardListener {
    boardmodel: BoardModel
    constructor(orb: ORB, boardmodel: BoardModel) {
        super(orb)
        this.boardmodel = boardmodel
    }
    layerById(layerID: number) {
        for (let layer of this.boardmodel.layers) {
            if (layer.id === layerID)
                return layer
        }
        throw Error("BoardListener_impl.layerById(): unknown layer id " + layerID)
    }
    async add(layerId: number, shape: Shape) {
        let layer = this.layerById(layerId)
        layer.data.push(shape)

        this.boardmodel.signal.emit({
            operation: Operation.ADD_SHAPES,
            shapes: [shape.id]
        })
    }
    async transform(layerId: number, shapeIdArray: Array<number>, matrix: Matrix, newIds: Array<number>) {    
        // console.log("BoardListener_impl.transform(", shapeIdArray, ", ", matrix, ", ", newIds, ")")
        // FIXME: too many casts
        let layer = this.layerById(layerId)
        let shapeIdSet = new Set<number>()
        for (let id of shapeIdArray)
            shapeIdSet.add(id)
        for (let index in layer.data) {
            let fig = layer.data[index]
            if (!shapeIdSet.has(fig.id))
                continue
            if (fig.transform(matrix)) // TODO: it doesn't work like this anymore, need to go thru ShapeEditor?
                continue
            
            throw Error("BoardListener_impl.transform(): inserting a Transform() shape is not implemented... and should also be deprecated.")
            // let transform = new Transform()
            // transform.id = newIds.shift()!
            // transform.transform(matrix)
            // let oldPath = fig.getPath()
            // let oldParentNode = oldPath.svg.parentNode!
            // let oldNextSibling = oldPath.svg.nextSibling
            // oldParentNode.removeChild(oldPath.svg)
            // transform.add(fig)
            // let newPath = transform.getPath()
            // newPath.updateSVG();
            // oldParentNode.insertBefore(newPath.svg, oldNextSibling)
            // layer.data[index] = transform
        }

        this.boardmodel.signal.emit({
            operation: Operation.TRANSFORM_SHAPES,
            shapes: shapeIdArray,
            matrix: matrix
        })

    }
}
