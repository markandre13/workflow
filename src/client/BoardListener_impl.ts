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

import { ORB } from "corba.js"
import { Matrix } from "../shared/geometry"
import { Figure } from "./figures/Figure"
import { AbstractPath } from "./paths/AbstractPath"
import { BoardModel } from "./BoardModel"

import * as skel from "../shared/workflow_skel"
import * as Transform from "./figures/Transform"

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
    async add(layerId: number, figure: Figure) {
        let layer = this.layerById(layerId)
        layer.data.push(figure)
        this.boardmodel.modified.trigger()
    }
    async transform(layerId: number, figureIdArray: Array<number>, matrix: Matrix, newIds: Array<number>) {
        console.log("BoardListener_impl.transform(", figureIdArray, ", ", matrix, ", ", newIds, ")")
        // FIXME: too many casts
        let layer = this.layerById(layerId)
        let figureIdSet = new Set<number>()
        for (let id of figureIdArray)
            figureIdSet.add(id)
        for (let index in layer.data) {
            let fig = layer.data[index]
            if (!figureIdSet.has(fig.id))
                continue;
            if (fig.transform(matrix))
                continue;
            let transform = new Transform.Transform()
            transform.id = newIds.shift()!
            transform.transform(matrix)
            let oldGraphic = fig.getGraphic() as AbstractPath
            let oldParentNode = oldGraphic.svg.parentNode!
            let oldNextSibling = oldGraphic.svg.nextSibling
            oldParentNode.removeChild(oldGraphic.svg)
            transform.add(fig)
            let newGraphic = transform.getGraphic() as AbstractPath
            newGraphic.updateSVG();
            oldParentNode.insertBefore(newGraphic.svg, oldNextSibling)
            layer.data[index] = transform
        }
    }
}
