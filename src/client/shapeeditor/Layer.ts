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

import * as value from "shared/workflow_value"
import * as valuetype from "shared/workflow_valuetype"
import { PointLike } from "shared/geometry/Point"
import { Matrix } from "shared/geometry/Matrix"
import { Shape } from "../shapes"
import { GIOPDecoder } from "corba.js"

export class ShapeModel implements valuetype.ShapeModel {
    data!: Array<Shape>
    constructor(init?: Partial<value.ShapeModel>|GIOPDecoder) {
        value.initShapeModel(this, init)
    }
}

export class Layer extends ShapeModel implements valuetype.Layer {
    id!: number
    name!: string
    
    constructor(init?: Partial<value.Layer>|GIOPDecoder) {
        super(init)
        value.initLayer(this, init)
    }

    findShapeAt(point: PointLike): Shape | undefined {
        let mindist = Number.POSITIVE_INFINITY
        let nearestShape: Shape | undefined;
        for (let index = this.data.length - 1; index >= 0; --index) {
            let shape = this.data[index]
            let pointInShapeSpace
            if (shape.matrix !== undefined) {
                pointInShapeSpace = new Matrix(shape.matrix).invert().transformPoint(point)
            } else {
                pointInShapeSpace = point
            }
            let d = shape.distance(pointInShapeSpace)
            if (d < mindist) {
                mindist = d
                nearestShape = shape
            }
        }
        if (mindist >= Shape.SHAPE_RANGE) {
            return undefined;
        }
        return nearestShape;
    }
}
