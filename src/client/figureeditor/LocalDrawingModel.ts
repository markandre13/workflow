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

import { Figure } from "../figures/Figure"

import { DrawingModel } from "./DrawingModel"
import { Operation } from "./FigureEditor"
import { Group } from 'client/figures/Group'
import { Layer } from './Layer'

/**
 * Drawing model for when there is no server.
 * 
 * Changes the model and sends a message to listeners.
 */
export class LocalDrawingModel extends DrawingModel {
    idCounter = -1
    // modified = new Signal<DrawingEvent>()
    // layers: Layer[] = []

    add(layerId: number, figure: Figure) {
        let layer = this.layerById(layerId)
        if (figure.id === 0) {
            if (this.idCounter === -1)
                this.initializeIdCounter()
            figure.id = ++this.idCounter
        }
        layer.data.push(figure)
        this.modified.trigger({ operation: Operation.ADD_FIGURES, figures: [figure.id] })
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

    setStrokeAndFill(layerID: number, figureIds: Array<number>, stroke: string, fill: string):void {
        this.forAllFigures(layerID, figureIds, (figure) => {
            figure.stroke = stroke
            figure.fill = fill
        })
        this.modified.trigger({ operation: Operation.UPDATE_FIGURES, figures: figureIds })
    }

    forAllFigures(layerID: number, figureIds: Array<number>, callback: (figure: Figure) => void) {
        let fastFigureIds = this.figureIdsAsSet(figureIds) // FIXME: could use the FigureEditor cache instead
        let layer = this.layerById(layerID)
        for (let index in layer.data) {
            let fig = layer.data[index]
            if (fastFigureIds.has(fig.id)) {
                callback(fig)
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

    bringToFront(layerID: number, figureIds: Array<number>): void {
        const fastFigureIds = this.figureIdsAsSet(figureIds) // FIXME: could use the FigureEditor cache instead
        const layer = this.layerById(layerID)

        const removed = this.removeFromLayer(layer, fastFigureIds)

        removed.figures.reverse()
        layer.data.push(...removed.figures)

        this.modified.trigger({ operation: Operation.BRING_FIGURES_TO_FRONT, figures: figureIds })
    }

    bringToBack(layerID: number, figureIds: Array<number>): void {
        const fastFigureIds = this.figureIdsAsSet(figureIds) // FIXME: could use the FigureEditor cache instead
        const layer = this.layerById(layerID)

        const removed = this.removeFromLayer(layer, fastFigureIds)

        // insert at head
        removed.figures.reverse()
        layer.data.splice(0, 0, ...removed.figures)

        this.modified.trigger({ operation: Operation.BRING_FIGURES_TO_BACK, figures: figureIds })
    }

    bringForward(layerID: number, figureIds: Array<number>): void {
        const fastFigureIds = this.figureIdsAsSet(figureIds) // FIXME: could use the FigureEditor cache instead
        const layer = this.layerById(layerID)

        const removed = this.removeFromLayer(layer, fastFigureIds)
        removed.figures.reverse()
        removed.index.reverse()

        for (let i = 0; i < figureIds.length; ++i) {
            layer.data.splice(removed.index[i]+1, 0, removed.figures[i])
        }

        this.modified.trigger({ operation: Operation.BRING_FIGURES_FORWARD, figures: figureIds })
    }

    bringBackward(layerID: number, figureIds: Array<number>): void {
        const fastFigureIds = this.figureIdsAsSet(figureIds) // FIXME: could use the FigureEditor cache instead
        const layer = this.layerById(layerID)

        const removed = this.removeFromLayer(layer, fastFigureIds)
        removed.figures.reverse()
        removed.index.reverse()
        
        for (let i = 0; i < figureIds.length; ++i) {
            let idx = removed.index[i]-1
            if (idx < 0)
                idx = 0
            layer.data.splice(idx, 0, removed.figures[i])
        }

        this.modified.trigger({ operation: Operation.BRING_FIGURES_BACKWARD, figures: figureIds })
    }

    protected initializeIdCounter() {
        for (let layer of this.layers) {
            for (let figure of layer.data) {
                this.initializeIdCounterHelper(figure)
            }
        }
        ++this.idCounter
    }

    protected initializeIdCounterHelper(figure: Figure) {
        this.idCounter = Math.max(this.idCounter, figure.id)
        if (figure instanceof Group) {
            for (let groupFigure of figure.childFigures) {
                this.initializeIdCounterHelper(groupFigure)
            }
        }
    }

    protected layerById(layerID: number) {
        for (let layer of this.layers) {
            if (layer.id === layerID)
                return layer
        }
        throw Error("LocalLayerModel.layerById(): unknown layer id " + layerID)
    }

    protected removeFromLayer(layer: Layer, figureIds: Set<number>): {figures: Figure[], index: number[]} {
        const result: {figures: Figure[], index: number[]} = {figures: [], index: []}
        for (let i = layer.data.length - 1; i >= 0; --i) {
            if (!figureIds.has(layer.data[i].id))
                continue
            result.figures.push(layer.data[i])
            result.index.push(i)
            layer.data.splice(i, 1)
        }
        if (result.figures.length !== figureIds.size)
            throw Error(`Unknown figure Ids`)
        return result
    }

    protected figureIdsAsSet(figureIds: Array<number>): Set<number> {
        // console.log(`LocalLayerModel.figureIdsAsSet(${figureIds})`)
        let figureIdSet = new Set<number>()
        for (let id of figureIds)
            figureIdSet.add(id)
        return figureIdSet
    }
}