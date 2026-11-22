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
import { StrokeEndType } from "shared/workflow"

/**
 * Drawing model for when there is no server.
 * 
 * Changes the model and sends a message to listeners.
 */
export class LocalDrawingModel extends DrawingModel {
    idCounter = -1
    // modified = new Signal<DrawingEvent>()
    // layers: Layer[] = []

    add(layer: Layer, shape: Shape) {
        if (shape.id === 0) {
            if (this.idCounter === -1)
                this.initializeIdCounter()
            shape.id = ++this.idCounter
        }
        layer.data.push(shape)
        this.signal.emit({ operation: Operation.ADD_SHAPES, shapes: [shape] })
    }

    delete(layer: Layer, shapes: Shape[]): void {
        // remove from data model
        this.removeFromLayer(layer, new Set(shapes))

        // inform views to update
        this.signal.emit({ operation: Operation.DELETE_SHAPES, shapes: shapes })
    }

    setStrokeAndFill(layer: Layer, shapes: Shape[], stroke: string, fill: string): void {
        let changedShapes: Shape[] = []
        this.forAllShapes(layer, shapes, (shape) => {
            shape.stroke = stroke
            shape.fill = fill
            if (shape.stroke !== stroke || shape.fill !== fill) {
                shape.stroke = stroke
                shape.fill = fill
                changedShapes.push(shape)
            }
        })
        if (changedShapes.length > 0) {
            this.signal.emit({ operation: Operation.UPDATE_SHAPES, shapes: changedShapes })
        }
    }

    setStrokeEnds(layer: Layer, shapes: Shape[], start: StrokeEndType | undefined, end: StrokeEndType | undefined): void {
        let changedShapes: Shape[] = []
        this.forAllShapes(layer, shapes, (shape) => {
            if (shape.strokeStart !== start || shape.strokeEnd !== end) {
                shape.strokeStart = start
                shape.strokeEnd = end
                changedShapes.push(shape)
            }
        })
        if (changedShapes.length > 0) {
            this.signal.emit({ operation: Operation.UPDATE_SHAPES, shapes: changedShapes })
        }
    }

    setStrokeWidth(layer: Layer, shapes: Shape[], width: number): void {
        let changedShapes: Shape[] = []
        this.forAllShapes(layer, shapes, (shape) => {
            if (shape.strokeWidth !== width) {
                shape.strokeWidth = width
                changedShapes.push(shape)
            }
        })
        if (changedShapes.length > 0) {
            this.signal.emit({ operation: Operation.UPDATE_SHAPES, shapes: changedShapes })
        }
    }

    forAllShapes(layer: Layer, shapes: Shape[], callback: (shape: Shape) => void) {
        let fastShapes = new Set(shapes)
        for (let index in layer.data) {
            let fig = layer.data[index]
            if (fastShapes.has(fig)) {
                callback(fig)
            }
        }
    }

    // layer: layer containing shapes to be transformed
    // shapes: shapes to be transformed
    transform(layer: Layer, shapes: Shape[], matrix: Matrix /*, newIds: Array<number>*/) {
        let fastShapes = new Set(shapes)
        for (let index in layer.data) {
            let fig = layer.data[index]
            if (!fastShapes.has(fig))
                continue

            if (fig.matrix === undefined && fig.transform(matrix)) {
                this.signal.emit({ operation: Operation.UPDATE_SHAPES, shapes: [fig] })
                continue
            }

            if (fig.matrix === undefined) {
                fig.matrix = new Matrix()
            }
            fig.matrix.prepend(matrix)
            this.signal.emit({ operation: Operation.TRANSFORM_SHAPES, matrix: matrix, shapes: [fig] })
        }
    }

    bringToFront(layer: Layer, shapes: Shape[]): void {
        const removed = this.removeFromLayer(layer, new Set(shapes))

        removed.shapes.reverse()
        layer.data.push(...removed.shapes)

        this.signal.emit({ operation: Operation.BRING_SHAPES_TO_FRONT, shapes: shapes })
    }

    bringToBack(layer: Layer, shapes: Shape[]): void {
        const removed = this.removeFromLayer(layer, new Set(shapes))

        // insert at head
        removed.shapes.reverse()
        layer.data.splice(0, 0, ...removed.shapes)

        this.signal.emit({ operation: Operation.BRING_SHAPES_TO_BACK, shapes: shapes })
    }

    bringForward(layer: Layer, shapes: Shape[]): void {
        const removed = this.removeFromLayer(layer, new Set(shapes))
        removed.shapes.reverse()
        removed.index.reverse()

        for (let i = 0; i < shapes.length; ++i) {
            layer.data.splice(removed.index[i] + 1, 0, removed.shapes[i])
        }

        this.signal.emit({ operation: Operation.BRING_SHAPES_FORWARD, shapes: shapes })
    }

    bringBackward(layer: Layer, shapes: Shape[]): void {
        const removed = this.removeFromLayer(layer, new Set(shapes))
        removed.shapes.reverse()
        removed.index.reverse()

        for (let i = 0; i < shapes.length; ++i) {
            let idx = removed.index[i] - 1
            if (idx < 0)
                idx = 0
            layer.data.splice(idx, 0, removed.shapes[i])
        }

        this.signal.emit({ operation: Operation.BRING_SHAPES_BACKWARD, shapes: shapes })
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

    protected removeFromLayer(layer: Layer, shapes: Set<Shape>): { shapes: Shape[], index: number[] } {
        const result: { shapes: Shape[], index: number[] } = { shapes: [], index: [] }
        for (let i = layer.data.length - 1; i >= 0; --i) {
            if (!shapes.has(layer.data[i]))
                continue
            result.shapes.push(layer.data[i])
            result.index.push(i)
            layer.data.splice(i, 1)
        }
        if (result.shapes.length !== shapes.size)
            throw Error(`Unknown shapes`)
        return result
    }
}