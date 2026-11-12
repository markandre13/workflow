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

import { Shape } from "../shapes/Shape"

import { DrawingModel } from "./DrawingModel"
import { Operation } from "./ShapeEditor"
import { Group } from 'client/shapes/Group'
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

    add(layerId: number, shape: Shape) {
        let layer = this.layerById(layerId)
        if (shape.id === 0) {
            if (this.idCounter === -1)
                this.initializeIdCounter()
            shape.id = ++this.idCounter
        }
        layer.data.push(shape)
        this.signal.emit({ operation: Operation.ADD_SHAPES, shapes: [shape.id] })
    }

    delete(layerID: number, shapeIds: Array<number>): void {
        // console.log(`LocalLayerModel.delete(${layerID}, ${shapeIds})`)

        // remove from data model
        const fastShapeIds = this.shapeIdsAsSet(shapeIds) // FIXME: could use the ShapeEditor cache instead
        const layer = this.layerById(layerID)

        this.removeFromLayer(layer, fastShapeIds)

        // inform views to update
        this.signal.emit({ operation: Operation.DELETE_SHAPES, shapes: shapeIds })
    }

    setStrokeAndFill(layerID: number, shapeIds: Array<number>, stroke: string, fill: string):void {
        this.forAllShapes(layerID, shapeIds, (shape) => {
            shape.stroke = stroke
            shape.fill = fill
        })
        this.signal.emit({ operation: Operation.UPDATE_SHAPES, shapes: shapeIds })
    }

    forAllShapes(layerID: number, shapeIds: Array<number>, callback: (shape: Shape) => void) {
        let fastShapeIds = this.shapeIdsAsSet(shapeIds) // FIXME: could use the ShapeEditor cache instead
        let layer = this.layerById(layerID)
        for (let index in layer.data) {
            let fig = layer.data[index]
            if (fastShapeIds.has(fig.id)) {
                callback(fig)
            }
        }
    }

    // layerId: layer containing shapes to be transformed
    // shapeIds: shapes to be transformed
    transform(layerID: number, shapeIds: Array<number>, matrix: Matrix /*, newIds: Array<number>*/) {
        // console.log(`LocalLayerModel.transform(${layerID}, ${shapeIds}, ${matrix})`)
        let fastShapeIds = this.shapeIdsAsSet(shapeIds) // FIXME: could use the ShapeEditor cache instead
        let layer = this.layerById(layerID)
        for (let index in layer.data) {
            let fig = layer.data[index]
            if (!fastShapeIds.has(fig.id))
                continue

            if (fig.matrix === undefined && fig.transform(matrix)) {
                // console.log(`LocalLayerModel.transform(${layerID}, ${shapeIds}, ${matrix}) -> trigger with UPDATE_SHAPES`)
                this.signal.emit({ operation: Operation.UPDATE_SHAPES, shapes: [fig.id] })
                continue
            }

            if (fig.matrix === undefined)
                fig.matrix = new Matrix()
            fig.matrix.prepend(matrix)
            // console.log(`LocalLayerModel.transform(${layerID}, ${shapeIds}, ${matrix}) -> trigger with TRANSFORM_SHAPES`)
            this.signal.emit({ operation: Operation.TRANSFORM_SHAPES, matrix: matrix, shapes: [fig.id] })
        }
    }

    bringToFront(layerID: number, shapeIds: Array<number>): void {
        const fastShapeIds = this.shapeIdsAsSet(shapeIds) // FIXME: could use the ShapeEditor cache instead
        const layer = this.layerById(layerID)

        const removed = this.removeFromLayer(layer, fastShapeIds)

        removed.shapes.reverse()
        layer.data.push(...removed.shapes)

        this.signal.emit({ operation: Operation.BRING_SHAPES_TO_FRONT, shapes: shapeIds })
    }

    bringToBack(layerID: number, shapeIds: Array<number>): void {
        const fastShapeIds = this.shapeIdsAsSet(shapeIds) // FIXME: could use the ShapeEditor cache instead
        const layer = this.layerById(layerID)

        const removed = this.removeFromLayer(layer, fastShapeIds)

        // insert at head
        removed.shapes.reverse()
        layer.data.splice(0, 0, ...removed.shapes)

        this.signal.emit({ operation: Operation.BRING_SHAPES_TO_BACK, shapes: shapeIds })
    }

    bringForward(layerID: number, shapeIds: Array<number>): void {
        const fastShapeIds = this.shapeIdsAsSet(shapeIds) // FIXME: could use the ShapeEditor cache instead
        const layer = this.layerById(layerID)

        const removed = this.removeFromLayer(layer, fastShapeIds)
        removed.shapes.reverse()
        removed.index.reverse()

        for (let i = 0; i < shapeIds.length; ++i) {
            layer.data.splice(removed.index[i]+1, 0, removed.shapes[i])
        }

        this.signal.emit({ operation: Operation.BRING_SHAPES_FORWARD, shapes: shapeIds })
    }

    bringBackward(layerID: number, shapeIds: Array<number>): void {
        const fastShapeIds = this.shapeIdsAsSet(shapeIds) // FIXME: could use the ShapeEditor cache instead
        const layer = this.layerById(layerID)

        const removed = this.removeFromLayer(layer, fastShapeIds)
        removed.shapes.reverse()
        removed.index.reverse()
        
        for (let i = 0; i < shapeIds.length; ++i) {
            let idx = removed.index[i]-1
            if (idx < 0)
                idx = 0
            layer.data.splice(idx, 0, removed.shapes[i])
        }

        this.signal.emit({ operation: Operation.BRING_SHAPES_BACKWARD, shapes: shapeIds })
    }

    protected initializeIdCounter() {
        for (let layer of this.layers) {
            for (let shape of layer.data) {
                this.initializeIdCounterHelper(shape)
            }
        }
        ++this.idCounter
    }

    protected initializeIdCounterHelper(shape: Shape) {
        this.idCounter = Math.max(this.idCounter, shape.id)
        if (shape instanceof Group) {
            for (let groupShape of shape.childShapes) {
                this.initializeIdCounterHelper(groupShape)
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

    protected removeFromLayer(layer: Layer, shapeIds: Set<number>): {shapes: Shape[], index: number[]} {
        const result: {shapes: Shape[], index: number[]} = {shapes: [], index: []}
        for (let i = layer.data.length - 1; i >= 0; --i) {
            if (!shapeIds.has(layer.data[i].id))
                continue
            result.shapes.push(layer.data[i])
            result.index.push(i)
            layer.data.splice(i, 1)
        }
        if (result.shapes.length !== shapeIds.size)
            throw Error(`Unknown shape Ids`)
        return result
    }

    protected shapeIdsAsSet(shapeIds: Array<number>): Set<number> {
        // console.log(`LocalLayerModel.shapeIdsAsSet(${shapeIds})`)
        let shapeIdSet = new Set<number>()
        for (let id of shapeIds)
            shapeIdSet.add(id)
        return shapeIdSet
    }
}