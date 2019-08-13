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

import { Point, Matrix } from "../../shared/geometry"

export abstract class AbstractPath {
    svg!: SVGElement
    abstract updateSVG(): void
    abstract transform(matrix: Matrix): AbstractPath
    abstract setAttributes(attibutes: any): AbstractPath
    abstract clone(): AbstractPath
    translate(point: Point): AbstractPath
    translate(x: number, y: number): AbstractPath
    translate(pointOrX: Point | number, Y?: number): AbstractPath {
        if (typeof pointOrX === "object")
            this.transform(new Matrix({
                m11: 1.0, m12: 0.0,
                m21: 0.0, m22: 1.0,
                tX: pointOrX.x, tY: pointOrX.y
            }))
        else
            this.transform(new Matrix({
                m11: 1.0, m12: 0.0,
                m21: 0.0, m22: 1.0,
                tX: pointOrX, tY: Y
            }));
        return this
    }
}
