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

import { Signal } from 'toad.js'
import { Matrix } from "shared/geometry"

import { Figure } from "../figures/Figure"

import { LayerEvent } from './LayerEvent'
import { LayerModel } from "./LayerModel"
import { LocalLayer } from "./LocalLayer"
import { Operation } from "./FigureEditor"

export class LocalLayerModel implements LayerModel {
    idCounter: number
    modified: Signal<LayerEvent>
    layers: Array<LocalLayer>
    
    constructor() {
        this.idCounter = 0
        this.modified = new Signal()
        // this.modified.add((data: LayerEvent)=>{
        //     console.log(`LocalLayerModel.modified(), need to do something: ${JSON.stringify(data)}`)
        // })
        this.layers = new Array<LocalLayer>()
    }

    layerById(layerID: number) {
        for (let layer of this.layers) {
            if (layer.id === layerID)
                return layer
        }
        throw Error("LocalLayerModel.layerById(): unknown layer id " + layerID)
    }

    add(layerId: number, figure: Figure) {
        // console.log(`LocalLayerModel.add(${layerId}, ${(figure as Object).constructor.name})`)
        let layer = this.layerById(layerId)
        figure.id = this.idCounter
        ++this.idCounter
        layer.data.push(figure)
        this.modified.trigger({operation: Operation.ADD_FIGURES, figures: [figure.id]})
    }

    // layerId: layer containing figures to be transformed
    // figureIds: figures to be transformed
    transform(layerID: number, figureIds: Array<number>, matrix: Matrix /*, newIds: Array<number>*/) {
        // console.log(`LocalLayerModel.transform(${layerID}, ${figureIds}, ${matrix})`)
        let fastFigureIds = this.figureIdsAsSet(figureIds) // FIXME: could use the FigureEditor cache instead
        let layer = this.layerById(layerID)
        for (let index in layer.data) {
            let fig = layer.data[index]
            if (!fastFigureIds.has(fig.id))
                continue
                
            if (fig.matrix === undefined && fig.transform(matrix)) {
                // console.log(`LocalLayerModel.transform(${layerID}, ${figureIds}, ${matrix}) -> trigger with UPDATE_FIGURES`)
                this.modified.trigger({operation: Operation.UPDATE_FIGURES, figures: [fig.id]})
                continue
            }

            if (fig.matrix === undefined)
                fig.matrix = new Matrix()
            fig.matrix.prepend(matrix)
            // console.log(`LocalLayerModel.transform(${layerID}, ${figureIds}, ${matrix}) -> trigger with TRANSFORM_FIGURES`)
            this.modified.trigger({operation: Operation.TRANSFORM_FIGURES, matrix: matrix, figures: [fig.id]})
        }
    }

    delete(layerID: number, figureIds: Array<number>): void {
        // console.log(`LocalLayerModel.delete(${layerID}, ${figureIds})`)
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
        // console.log(`LocalLayerModel.figureIdsAsSet(${figureIds})`)
        let figureIdSet = new Set<number>()
        for(let id of figureIds)
            figureIdSet.add(id)
        return figureIdSet
    }
}