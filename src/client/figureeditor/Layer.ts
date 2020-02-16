/*
 *  workflow - A collaborative real-time white- and kanban board
 *  Copyright (C) 2018, 2020 Mark-André Hopf <mhopf@mark13.org>
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

import { Point, Matrix } from "../../shared/geometry"
import { Figure } from "../../shared/workflow_valuetype"
import * as figure from "../figures/Figure"
import * as valueimpl from "../../shared/workflow_valueimpl"

export class Layer extends valueimpl.Layer {
    findFigureAt(point: Point): Figure | undefined {
        let mindist = Number.POSITIVE_INFINITY
        let nearestFigure: figure.Figure | undefined;
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
        if (mindist >= figure.Figure.FIGURE_RANGE) {
            return undefined;
        }
        return nearestFigure;
    }
}
