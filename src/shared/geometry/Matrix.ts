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
import { isEqual } from "../geometry"
import { Size } from "./Size"
import { Point } from "./Point"

// FIXME: DO A HUGE OVERHAUL: ADOPT FUNCTIONAL STYLE, DON'T LET METHODS RETURNING A MATRIX MODIFY THE MATRIX, RETURN A NEW ONE

export class Matrix implements value.Matrix {
    a!: number
    b!: number
    c!: number
    d!: number
    e!: number
    f!: number

    constructor(matrix?: Partial<value.Matrix> | GIOPDecoder) {
        value.initMatrix(this, matrix)
        if (matrix === undefined) {
            this.a = 1.0
            this.d = 1.0
        }
    }

    isIdentity(): boolean {
        return this.a === 1.0 && this.b === 0.0 &&
            this.c === 0.0 && this.d === 1.0 &&
            this.e === 0.0 && this.f === 0.0
    }

    isOnlyTranslate(): boolean {
        return this.a === 1.0 && this.b === 0.0 &&
            this.c === 0.0 && this.d === 1.0
    }

    isOnlyTranslateAndScale(): boolean {
        return this.b === 0.0 && this.c === 0.0
    }

    identity(): Matrix {
        [this.a, this.b, this.c, this.d, this.e, this.f] = [1, 0, 0, 1, 0, 0]
        return this
    }

    append(matrix: Matrix): Matrix {
        [this.a, this.b, this.c, this.d, this.e, this.f] =
            [this.a * matrix.a + this.c * matrix.b,
            this.b * matrix.a + this.d * matrix.b,
            this.a * matrix.c + this.c * matrix.d,
            this.b * matrix.c + this.d * matrix.d,
            this.a * matrix.e + this.c * matrix.f + this.e,
            this.b * matrix.e + this.d * matrix.f + this.f]
        return this
    }

    prepend(matrix: Matrix): Matrix {
        [this.a, this.b, this.c, this.d, this.e, this.f] =
            [matrix.a * this.a + matrix.c * this.b,
            matrix.b * this.a + matrix.d * this.b,
            matrix.a * this.c + matrix.c * this.d,
            matrix.b * this.c + matrix.d * this.d,
            matrix.a * this.e + matrix.c * this.f + matrix.e,
            matrix.b * this.e + matrix.d * this.f + matrix.f]
        return this
    }

    invert(): Matrix {
        let d = 1.0 / (this.a * this.d - this.c * this.b)
        let n11 = d * this.d
        let n12 = d * -this.b
        let n21 = d * -this.c
        let n22 = d * this.a
        let nX = d * (this.c * this.f - this.d * this.e)
        let nY = d * (this.b * this.e - this.a * this.f)

        this.a = n11
        this.b = n12
        this.c = n21
        this.d = n22
        this.e = nX
        this.f = nY
        return this
    }

    translate(point: Point): Matrix {
        let m = new Matrix({
            a: 1.0, c: 0.0, e: point.x,
            b: 0.0, d: 1.0, f: point.y
        })
        this.prepend(m)
        return this
    }

    rotate(radiant: number): Matrix {
        let m = new Matrix({
            a: Math.cos(radiant), c: -Math.sin(radiant), e: 0,
            b: Math.sin(radiant), d: Math.cos(radiant), f: 0
        })
        this.prepend(m)
        return this
    }

    getRotation(): number {
        let r0 = -Math.atan2(-this.b, this.a)
        let r1 = -Math.atan2(this.c, this.d)
        if (isEqual(r0, r1)) {
            if (r0 < 0)
                r0 = Math.PI + r0
            return r0
        }
        return NaN
    }

    scale(x: number, y: number): Matrix {
        let m = new Matrix({
            a: x, c: 0, e: 0,
            b: 0, d: y, f: 0
        })
        this.prepend(m)
        return this
    }

    postTranslate(point: Point): Matrix {
        let m = new Matrix({
            a: 1.0, c: 0.0, e: point.x,
            b: 0.0, d: 1.0, f: point.y
        })
        this.append(m)
        return this
    }

    postRotate(radiant: number): Matrix {
        let m = new Matrix({
            a: Math.cos(radiant), c: -Math.sin(radiant), e: 0,
            b: Math.sin(radiant), d: Math.cos(radiant), f: 0
        })
        this.append(m)
        return this
    }

    postScale(x: number, y: number): Matrix {
        let m = new Matrix({
            a: x, c: 0, e: 0,
            b: 0, d: y, f: 0
        })
        this.append(m)
        return this
    }

    transformPoint(point: Point): Point {
        return new Point({
            x: point.x * this.a + point.y * this.c + this.e,
            y: point.x * this.b + point.y * this.d + this.f
        })
    }

    transformArrayPoint(point: [number, number]): [number, number] {
        return [
            point[0] * this.a + point[1] * this.c + this.e,
            point[0] * this.b + point[1] * this.d + this.f
        ]
    }

    transformSize(size: Size): Size {
        return new Size({
            width: size.width * this.a + size.height * this.c,
            height: size.width * this.b + size.height * this.d
        })
    }

    toString(): string {
        return `{rotate: [${this.a}, ${this.b}, ${this.c}, ${this.d}], translate: [${this.e}, ${this.f}]}`
    }
}
