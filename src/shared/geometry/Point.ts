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

import * as value from "../workflow_value"
import { GIOPDecoder } from "corba.js"

export class Point implements value.Point {
    x!: number
    y!: number

    constructor()
    constructor(point: Partial<Point>)
    constructor(x: number, y: number)
    constructor(decoder: GIOPDecoder)
    constructor(xOrPoint?: number | Partial<Point> | GIOPDecoder, y?: number) {
        if (xOrPoint instanceof GIOPDecoder) {
            value.initPoint(this, xOrPoint)
        }
        else if (xOrPoint === undefined) {
            value.initPoint(this)
        }
        else if (typeof xOrPoint === "object") {
            value.initPoint(this, xOrPoint)
        } else {
            value.initPoint(this, { x: xOrPoint, y: y! })
        }
    }
    toString() {
        return `Point(${this.x}, ${this.y})`
    }
}
