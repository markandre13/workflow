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

import { Signal } from 'toad.js'

import { LayerModel } from "./LayerModel"
import { LocalLayer } from "./LocalLayer"
import * as figure from "../figures"
import { Matrix } from "../../shared/geometry"
import { Operation } from "./FigureEditor"
// import { Point, Rectangle, Matrix, pointPlusSize, pointMinusPoint, pointPlusPoint, sizeMultiplyNumber, rotatePointAroundPointBy } from "../../shared/geometry"

import { Tool } from "../figuretools"

export class LocalLayerModel implements LayerModel {
    idCounter: number
    modified: Signal
    layers: Array<LocalLayer>
    
    constructor() {
        this.idCounter = 0
        this.modified = new Signal()
        this.modified.add(()=>{
            // console.log("LocalLayerModel.modified()")
        })
        this.layers = new Array<LocalLayer>()
    }

    layerById(layerID: number) {
        for (let layer of this.layers) {
            if (layer.id === layerID)
                return layer
        }
        throw Error("LocalLayerModel.layerById(): unknown layer id " + layerID)
    }

    add(layerId: number, figure: figure.Figure) {
        // console.log(`LocalLayerModel.add(${layerId})`)
        let layer = this.layerById(layerId)
        figure.id = this.idCounter
        ++this.idCounter
        layer.data.push(figure)
        this.modified.trigger()
    }

    // layerId: layer containing figures to be transformed
    // figureIds: figures to be transformed

    transform(layerID: number, figureIds: Array<number>, matrix: Matrix /*, newIds: Array<number>*/) {
        // console.log(`LocalLayerModel.transform(${layerID}, ${figureIds}, ${JSON.stringify(matrix)})`)
        let fastFigureIds = this.figureIdsAsSet(figureIds) // FIXME: could use the FigureEditor cache instead
        let layer = this.layerById(layerID)
        for (let index in layer.data) {
            let fig = layer.data[index]
            if (!fastFigureIds.has(fig.id))
                continue
                
            if (fig.matrix === undefined && fig.transform(matrix)) {
                this.modified.trigger({operation: Operation.UPDATE_FIGURES, figures: [fig.id]})
                continue
            }

            if (fig.matrix === undefined)
                fig.matrix = new Matrix()
            let m = fig.matrix as Matrix
            m.prepend(matrix)
            this.modified.trigger({operation: Operation.TRANSFORM_FIGURES, matrix: matrix, figures: [fig.id]})
        }
    }

    delete(layerID: number, figureIds: Array<number>): void {
        let fastFigureIds = this.figureIdsAsSet(figureIds) // FIXME: could use the FigureEditor cache instead
        let layer = this.layerById(layerID)
        for(let i=layer.data.length-1; i>=0; --i) {
            if (!fastFigureIds.has(layer.data[i].id))
                continue
            layer.data.splice(i, 1)
        }
        this.modified.trigger({operation: Operation.DELETE_FIGURES, figures: figureIds})
    }

    figureIdsAsSet(figureIds: Array<number>): Set<number> {
        let figureIdSet = new Set<number>()
        for(let id of figureIds)
            figureIdSet.add(id)
        return figureIdSet
    }
}