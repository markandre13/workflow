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
import * as valuetype from "../workflow_valuetype"
import { GIOPDecoder } from "corba.js"
import { Matrix } from "./Matrix"
import { Point } from "./Point"
import { Size } from "./Size"
import { pointPlusSize } from "../geometry"

export class Rectangle implements value.Rectangle {
    origin!: Point
    size!: Size

    constructor()
    constructor(rectangle: Partial<value.Rectangle>)
    constructor(origin: Point, size: Size)
    constructor(x: number, y: number, width: number, height: number)
    constructor(decoder: GIOPDecoder)
    constructor(xOrOriginOrRectangle?: number | Point | Partial<value.Rectangle> | GIOPDecoder, yOrSize?: number | Size, width?: number, height?: number) {
        if (xOrOriginOrRectangle instanceof GIOPDecoder) {
            value.initRectangle(this, xOrOriginOrRectangle)
        }
        else if (xOrOriginOrRectangle === undefined) {
            value.initRectangle(this)
        }
        else if (yOrSize === undefined) {
            if (!xOrOriginOrRectangle.hasOwnProperty("origin") ||
                !xOrOriginOrRectangle.hasOwnProperty("size")) {
                throw Error("yikes")
            }
            value.initRectangle(this, xOrOriginOrRectangle as Rectangle)
        }
        else if (width === undefined) {
            if (!xOrOriginOrRectangle.hasOwnProperty("x") || // FIXME:
                !xOrOriginOrRectangle.hasOwnProperty("y") ||
                !yOrSize.hasOwnProperty("width") ||
                !yOrSize.hasOwnProperty("height")) {
                throw Error("yikes")
            }
            value.initRectangle(this, { origin: xOrOriginOrRectangle as Point, size: yOrSize as Size })
        } else {
            if (typeof xOrOriginOrRectangle !== "number" ||
                typeof yOrSize !== "number") {
                throw Error("yikes")
            }
            value.initRectangle(this, {
                origin: { x: xOrOriginOrRectangle, y: yOrSize },
                size: { width: width, height: height! }
            })
        }
    }

    set(x: number, y: number, width: number, height: number): Rectangle {
        this.origin.x = x
        this.origin.y = y
        this.size.width = width
        this.size.height = height
        return this
    }

    contains(p: Point): boolean {
        return this.origin.x <= p.x && p.x <= this.origin.x + this.size.width &&
            this.origin.y <= p.y && p.y <= this.origin.y + this.size.height
    }

    inside(p: Point): boolean {
        return this.origin.x < p.x && p.x < this.origin.x + this.size.width &&
            this.origin.y < p.y && p.y < this.origin.y + this.size.height
    }

    containsRectangle(r: Rectangle): boolean {
        return this.contains(r.origin) &&
            this.contains(new Point({ x: r.origin.x + r.size.width, y: r.origin.y })) &&
            this.contains(new Point({ x: r.origin.x + r.size.width, y: r.origin.y + r.size.height })) &&
            this.contains(new Point({ x: r.origin.x, y: r.origin.y + r.size.height }))
    }

    intersects(r: Rectangle): boolean {
        // based on Dan Cohen and Ivan Sutherland's clipping algorithm
        let x00 = this.origin.x
        let x01 = x00 + this.size.width
        if (x00 > x01) {
            [x00, x01] = [x01, x00]
        }

        let x10 = r.origin.x
        let x11 = x10 + r.size.width
        if (x10 > x11) {
            [x10, x11] = [x11, x10]
        }

        let y00 = this.origin.y
        let y01 = y00 + this.size.height
        if (y00 > y01) {
            [y00, y01] = [y01, y00]
        }

        let y10 = r.origin.y
        let y11 = y10 + r.size.height
        if (y10 > y11) {
            [y10, y11] = [y11, y10]
        }

        let f0 = 0
        if (x00 < x10)
            f0 |= 1
        if (x00 > x11)
            f0 |= 2
        if (y00 < y10)
            f0 |= 4
        if (y00 > y11)
            f0 |= 8

        let f1 = 0
        if (x01 < x10)
            f1 |= 1
        if (x01 > x11)
            f1 |= 2
        if (y01 < y10)
            f1 |= 4
        if (y01 > y11)
            f1 |= 8

        return (f0 & f1) == 0
    }

    expandByPoint(p: Point): Rectangle {
        if (p.x < this.origin.x) {
            this.size.width += this.origin.x - p.x; this.origin.x = p.x
        }
        else if (p.x > this.origin.x + this.size.width) {
            this.size.width = p.x - this.origin.x
        }
        if (p.y < this.origin.y) {
            this.size.height += this.origin.y - p.y; this.origin.y = p.y
        }
        else if (p.y > this.origin.y + this.size.height) {
            this.size.height = p.y - this.origin.y
        }
        return this
    }

    center(): Point {
        return new Point({
            x: this.origin.x + this.size.width / 2.0,
            y: this.origin.y + this.size.height / 2.0
        })
    }

    forAllEdges(callback: (edge: Point) => void, transform?: Matrix) {
        if (transform !== undefined) {
            callback(transform.transformPoint(this.origin))
            callback(transform.transformPoint(pointPlusSize(this.origin, { width: this.size.width, height: 0 })))
            callback(transform.transformPoint(pointPlusSize(this.origin, { width: 0, height: this.size.height })))
            callback(transform.transformPoint(pointPlusSize(this.origin, this.size)))
        } else {
            callback(this.origin)
            callback(pointPlusSize(this.origin, { width: this.size.width, height: 0 }))
            callback(pointPlusSize(this.origin, { width: 0, height: this.size.height }))
            callback(pointPlusSize(this.origin, this.size))
        }
    }

    expandByRectangle(rectangle: valuetype.Rectangle, transform?: Matrix): Rectangle {
        if (this.size.width === 0 && this.size.height === 0) {
            this.origin.x = rectangle.origin.x
            this.origin.y = rectangle.origin.y
            this.size.width = rectangle.size.width
            this.size.height = rectangle.size.height
        } else {
            (rectangle as Rectangle).forAllEdges((edge) => {
                this.expandByPoint(edge)
            }, transform)
        }
        return this
    }

    inflate(expansion: number): Rectangle {
        this.origin.x -= expansion
        this.origin.y -= expansion
        expansion *= 2.0
        this.size.width += expansion
        this.size.height += expansion
        return this
    }

    toString() {
        return `Rectangle(${this.origin.x}, ${this.origin.y}, ${this.size.width}, ${this.size.height})`
    }
}
