/*
 *  The TOAD JavaScript/TypeScript GUI Library
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

import * as valueimpl from "./workflow_valueimpl"
import { Point, Size } from "./workflow_valueimpl"
import * as valuetype from "./workflow_valuetype"

export { Point, Size } from "./workflow_valueimpl"

export function pointPlusSize(point: Point, size: Size): Point {
    return new Point({
        x: point.x+size.width,
        y: point.y+size.height
    })
}

export function pointMinusPoint(a: Point, b: Point): Point {
    return new Point({
        x: a.x - b.x,
        y: a.y - b.y
    })
}

export function pointPlusPoint(a: Point, b: Point): Point {
    return new Point({
        x: a.x + b.x,
        y: a.y + b.y
    })
}

export function pointMultiplyNumber(a: Point, b: number): Point {
    return new Point({
        x: a.x * b,
        y: a.y * b
    })
}

export function pointMinus(a: Point) {
    return new Point({
        x: -a.x,
        y: -a.y
    })
}

export class Rectangle extends valueimpl.Rectangle {
  
    constructor(rectangle?: valuetype.Rectangle) {
        super(rectangle)
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

    expandByPoint(p: Point): Rectangle {
        if (p.x < this.origin.x) {
            this.size.width += this.origin.x - p.x ; this.origin.x = p.x
        } else
        if (p.x > this.origin.x + this.size.width) {
            this.size.width = p.x - this.origin.x
        }
        if (p.y < this.origin.y) {
            this.size.height += this.origin.y - p.y ; this.origin.y = p.y
        } else
        if (p.y > this.origin.y + this.size.height) {
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
  
    expandByRectangle(r: valuetype.Rectangle): Rectangle {
        if (this.size.width === 0 && this.size.height === 0) {
            this.origin.x = r.origin.x
            this.origin.y = r.origin.y
            this.size.width = r.size.width
            this.size.height = r.size.height
        } else {
            this.expandByPoint(r.origin)
            this.expandByPoint(pointPlusSize(r.origin, r.size))
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
}

export class Matrix extends valueimpl.Matrix {
    constructor(matrix?: Partial<Matrix>) {
        super(matrix)
        if (matrix === undefined) {
            this.m11 = 1.0
            this.m22 = 1.0
        }
    }
    
    isIdentity(): boolean {
        return this.m11 === 1.0 && this.m12 === 0.0 &&
               this.m21 === 0.0 && this.m22 === 1.0 &&
               this.tX  === 0.0 && this.tY  === 0.0
    }

    isOnlyTranslate(): boolean {
        return this.m11 === 1.0 && this.m12 === 0.0 &&
               this.m21 === 0.0 && this.m22 === 1.0
    }

    isOnlyTranslateAndScale(): boolean {
        return this.m12 === 0.0 && this.m21 === 0.0
    }
    
    identity() {
        this.m11 = 1.0
        this.m12 = 0.0
        this.m21 = 0.0
        this.m22 = 1.0
        this.tX  = 0.0
        this.tY  = 0.0
    }
    
    append(matrix: Matrix) {
        let n11 = this.m11 * matrix.m11 + this.m12 * matrix.m21
        let n12 = this.m11 * matrix.m12 + this.m12 * matrix.m22
        let n21 = this.m21 * matrix.m11 + this.m22 * matrix.m21
        let n22 = this.m21 * matrix.m12 + this.m22 * matrix.m22
        let nX  = this.tX  * matrix.m11 + this.tY  * matrix.m21 + matrix.tX
        let nY  = this.tX  * matrix.m12 + this.tY  * matrix.m22 + matrix.tY
        
        this.m11 = n11
        this.m12 = n12
        this.m21 = n21
        this.m22 = n22
        this.tX  = nX
        this.tY  = nY
    }

    prepend(matrix: Matrix) {
        let n11 = matrix.m11 * this.m11 + matrix.m12 * this.m21
        let n12 = matrix.m11 * this.m12 + matrix.m12 * this.m22
        let n21 = matrix.m21 * this.m11 + matrix.m22 * this.m21
        let n22 = matrix.m21 * this.m12 + matrix.m22 * this.m22
        let nX  = matrix.tX  * this.m11 + matrix.tY  * this.m21 + this.tX
        let nY  = matrix.tX  * this.m12 + matrix.tY  * this.m22 + this.tY
        
        this.m11 = n11
        this.m12 = n12
        this.m21 = n21
        this.m22 = n22
        this.tX  = nX
        this.tY  = nY
    }
    
    invert() {
        let d = 1.0 / (this.m11 * this.m22 - this.m21 * this.m12)
        let n11 = d *  this.m22
        let n12 = d * -this.m12
        let n21 = d * -this.m21
        let n22 = d *  this.m11
        let nX  = d * (this.m21 * this.tY - this.m22 * this.tX)
        let nY  = d * (this.m12 * this.tX - this.m11 * this.tY)

        this.m11 = n11
        this.m12 = n12
        this.m21 = n21
        this.m22 = n22
        this.tX  = nX
        this.tY  = nY
    }
    
    translate(point: Point) {
        let m = new Matrix({
            m11: 1.0, m12: 0.0,
            m21: 0.0, m22: 1.0,
            tX: point.x, tY: point.y
        })
        this.append(m)
    }

    rotate(radiant: number) {
        let m = new Matrix({
            m11:  Math.cos(radiant), m12: Math.sin(radiant),
            m21: -Math.sin(radiant), m22: Math.cos(radiant),
            tX: 0, tY: 0
        })
        this.append(m)
    }
    
    scale(x: number, y:number) {
        let m = new Matrix({
            m11:  x, m12: 0,
            m21:  0, m22: y,
            tX: 0, tY: 0
        })
        this.append(m)
    }
    
    transformPoint(point: Point): Point {
        return new Point({
            x: point.x * this.m11 + point.y * this.m21 + this.tX,
            y: point.x * this.m12 + point.y * this.m22 + this.tY
        })
    }

    transformArrayPoint(point: [number, number]): [number, number] {
        return [
            point[0] * this.m11 + point[1] * this.m21 + this.tX,
            point[0] * this.m12 + point[1] * this.m22 + this.tY
        ]
    }
    
    transformSize(size: Size): Size {
        return new Size({
            width: size.width * this.m11 + size.height * this.m21,
            height: size.width * this.m12 + size.height * this.m22
        })
    }
}
