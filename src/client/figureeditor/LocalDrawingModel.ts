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

import { DrawingEvent } from './DrawingEvent'
import { DrawingModel } from "./DrawingModel"
import { LocalLayer } from "./LocalLayer"
import { Operation } from "./FigureEditor"
import { Group } from 'client/figures/Group'
import { Layer } from './Layer'

export class LocalDrawingModel implements DrawingModel {
    idCounter: number
    modified: Signal<DrawingEvent>
    layers: Array<LocalLayer>

    constructor() {
        this.idCounter = -1
        this.modified = new Signal()
        // this.modified.add((data: LayerEvent)=>{
        //     console.log(`LocalLayerModel.modified(), need to do something: ${JSON.stringify(data)}`)
        // })
        this.layers = new Array<LocalLayer>()
    }

    add(layerId: number, figure: Figure) {
        if (this.idCounter === -1) {
            this.setIdCounter()
        }
        // console.log(`LocalLayerModel.add(${layerId}, ${(figure as Object).constructor.name})`)
        let layer = this.layerById(layerId)
        figure.id = this.idCounter
        ++this.idCounter
        layer.data.push(figure)
        this.modified.trigger({ operation: Operation.ADD_FIGURES, figures: [figure.id] })
    }

    protected setIdCounter() {
        for (let layer of this.layers) {
            for (let figure of layer.data) {
                this.setIdCounterByFigure(figure)
            }
        }
        ++this.idCounter
    }

    protected setIdCounterByFigure(figure: Figure) {
        this.idCounter = Math.max(this.idCounter, figure.id)
        if (figure instanceof Group) {
            for (let groupFigure of figure.childFigures) {
                this.setIdCounterByFigure(groupFigure)
            }
        }
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
                this.modified.trigger({ operation: Operation.UPDATE_FIGURES, figures: [fig.id] })
                continue
            }

            if (fig.matrix === undefined)
                fig.matrix = new Matrix()
            fig.matrix.prepend(matrix)
            // console.log(`LocalLayerModel.transform(${layerID}, ${figureIds}, ${matrix}) -> trigger with TRANSFORM_FIGURES`)
            this.modified.trigger({ operation: Operation.TRANSFORM_FIGURES, matrix: matrix, figures: [fig.id] })
        }
    }

    delete(layerID: number, figureIds: Array<number>): void {
        // console.log(`LocalLayerModel.delete(${layerID}, ${figureIds})`)

        // remove from data model
        const fastFigureIds = this.figureIdsAsSet(figureIds) // FIXME: could use the FigureEditor cache instead
        const layer = this.layerById(layerID)

        this.removeFromLayer(layer, fastFigureIds)

        // inform views to update
        this.modified.trigger({ operation: Operation.DELETE_FIGURES, figures: figureIds })
    }

    bringToFront(layerID: number, figureIds: Array<number>): void {
        const fastFigureIds = this.figureIdsAsSet(figureIds) // FIXME: could use the FigureEditor cache instead
        const layer = this.layerById(layerID)

        const figures = this.removeFromLayer(layer, fastFigureIds)

        figures.reverse()
        layer.data.push(...figures)

        this.modified.trigger({ operation: Operation.BRING_FIGURES_TO_FRONT, figures: figureIds })
    }

    bringToBack(layerID: number, figureIds: Array<number>): void {
        const fastFigureIds = this.figureIdsAsSet(figureIds) // FIXME: could use the FigureEditor cache instead
        const layer = this.layerById(layerID)

        const figures = this.removeFromLayer(layer, fastFigureIds)

        // insert at head
        figures.reverse()
        layer.data.splice(0, 0, ...figures)

        this.modified.trigger({ operation: Operation.BRING_FIGURES_TO_BACK, figures: figureIds })
    }

    bringForward(layerID: number, figureIds: Array<number>): void {
        const fastFigureIds = this.figureIdsAsSet(figureIds) // FIXME: could use the FigureEditor cache instead
        const layer = this.layerById(layerID)
        for (let i = layer.data.length - 1; i >= 0; --i) {
            if (!fastFigureIds.has(layer.data[i].id))
                continue
            const figure = layer.data[i]
            layer.data.splice(i, 1)
            layer.data.splice(i+1, 0, figure)
        }

        this.modified.trigger({ operation: Operation.BRING_FIGURES_FORWARD, figures: figureIds })
    }

    bringBackward(layerID: number, figureIds: Array<number>): void {
    }

    protected layerById(layerID: number) {
        for (let layer of this.layers) {
            if (layer.id === layerID)
                return layer
        }
        throw Error("LocalLayerModel.layerById(): unknown layer id " + layerID)
    }

    protected removeFromLayer(layer: Layer, figureIds: Set<number>): Figure[] {
        const figures: Figure[] = []
        for (let i = layer.data.length - 1; i >= 0; --i) {
            if (!figureIds.has(layer.data[i].id))
                continue
            figures.push(layer.data[i])
            layer.data.splice(i, 1)
        }
        return figures
    }

    protected figureIdsAsSet(figureIds: Array<number>): Set<number> {
        // console.log(`LocalLayerModel.figureIdsAsSet(${figureIds})`)
        let figureIdSet = new Set<number>()
        for (let id of figureIds)
            figureIdSet.add(id)
        return figureIdSet
    }
}