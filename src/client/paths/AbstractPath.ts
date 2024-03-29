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

import { Point } from "shared/geometry/Point"
import { Matrix } from "shared/geometry/Matrix"

export abstract class AbstractPath {
    abstract transform(matrix: Matrix): AbstractPath
    abstract clone(): AbstractPath

    translate(point: Point): AbstractPath
    translate(x: number, y: number): AbstractPath
    translate(pointOrX: Point | number, Y?: number): AbstractPath {
        if (typeof pointOrX === "object")
            this.transform(new Matrix({
                a: 1.0, b: 0.0,
                c: 0.0, d: 1.0,
                e: pointOrX.x, f: pointOrX.y
            }))
        else
            this.transform(new Matrix({
                a: 1.0, b: 0.0,
                c: 0.0, d: 1.0,
                e: pointOrX, f: Y
            }));
        return this
    }
}
