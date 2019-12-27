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

import { LayerModel } from "./LayerModel"
import { Signal } from "toad.js"
import { LocalLayer } from "./LocalLayer"
import * as figure from "../figures"
import { Matrix } from "../../shared/geometry"
import { Tool } from "../figuretools"

export class LocalLayerModel implements LayerModel {
    modified: Signal
    layers: Array<LocalLayer>
    
    constructor() {
        this.modified = new Signal()
        this.layers = new Array<LocalLayer>()
    }

    layerById(layerID: number) {
        for (let layer of this.layers) {
            if (layer.id === layerID)
                return layer
        }
        throw Error("BoardListener_impl.layerById(): unknown layer id " + layerID)
    }

    add(layerId: number, figure: figure.Figure) {
        console.log(`MyLayerModel.add(${layerId})`)
        let layer = this.layerById(layerId)
        layer.data.push(figure)
    }

    transform(layerID: number, figureIdArray: Array<number>, matrix: Matrix /*, newIds: Array<number>*/) {
        console.log(`MyLayerModel.transform(${layerID}, ${figureIdArray}, ${JSON.stringify(matrix)})`)
        let figureIdSet = new Set<number>()
        for(let id of figureIdArray)
            figureIdSet.add(id)
        let newIdArray = new Array<number>()
        
        let layer = this.layerById(layerID)
        for (let index in layer.data) {
            let fig = layer.data[index]
            if (!figureIdSet.has(fig.id))
                continue
                
            if (fig.transform(matrix)) {
                console.log("  figure transformed itself")
                // console.log("transformed "+JSON.stringify(fig))
                continue
            }

            console.log("figure encapsuled with a transform object")
            let transform = new figure.Transform()
            transform.id = layer.createFigureId()
            newIdArray.push(transform.id)
            transform.matrix = new Matrix(matrix)
            transform.children.push(fig)
            layer.data[index] = transform

            Tool.selection.replace(fig, transform)
        }
    }
}