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
import { Point, Matrix } from "shared/geometry"
import { Figure } from "../figures"

export class Layer implements valuetype.Layer {
    // FigureModel
    data!: Array<Figure>

    // Layer
    id!: number
    name!: string
    
    constructor(init?: Partial<value.Layer>) {
        value.initFigureModel(this, init) // FIXME corba.js: shouldn't initLayer include this call?
        value.initLayer(this, init)
    }

    findFigureAt(point: Point): Figure | undefined {
        let mindist = Number.POSITIVE_INFINITY
        let nearestFigure: Figure | undefined;
        for (let index = this.data.length - 1; index >= 0; --index) {
            let figure = this.data[index]
            let pointInFigureSpace
            if (figure.matrix !== undefined) {
                pointInFigureSpace = new Matrix(figure.matrix).invert().transformPoint(point)
            } else {
                pointInFigureSpace = point
            }
            let d = figure.distance(pointInFigureSpace)
            if (d < mindist) {
                mindist = d
                nearestFigure = figure
            }
        }
        if (mindist >= Figure.FIGURE_RANGE) {
            return undefined;
        }
        return nearestFigure;
    }
}
