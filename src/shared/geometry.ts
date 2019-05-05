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
import * as valuetype from "./workflow_valuetype"

export class Point extends valueimpl.Point {
    constructor()
    constructor(point: Partial<Point>)
    constructor(x: number, y: number)
    constructor(xOrPoint?: number|Partial<Point>, y?: number) {
        if (xOrPoint === undefined) {
            super()
        } else
        if (typeof xOrPoint === "object") {
            super(xOrPoint)
        } else {
            super({x: xOrPoint, y: y!})
        }
    }
}

export class Size extends valueimpl.Size {
    constructor()
    constructor(size: Partial<Size>)
    constructor(width: number, height: number)
    constructor(widthOrSize?: number|Partial<Size>, height?: number) {
        if (widthOrSize === undefined) {
            super()
        } else
        if (typeof widthOrSize === "object") {
            super(widthOrSize)
        } else {
            super({width: widthOrSize, height: height!})
        }
    }
}

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

export function isZero(a: number): boolean {
    return Math.abs(a) <= Number.EPSILON
}

export function pointEqualsPoint(a: Point, b: Point): boolean {
    return isZero(a.x-b.x) && isZero(a.y-b.y)
}

export function sizeEqualsSize(a: Size, b: Size): boolean {
    return isZero(a.width-b.width) && isZero(a.height-b.height)
}

export function signedArea(p0: Point, p1: Point, p2: Point): number {
  return (p0.x- p2.x) * (p1.y - p2.y) - (p1.x - p2.x) * (p0.y - p2.y)
}

export function squaredLength(a: Point): number {
    return a.x * a.x + a.y * a.y
}

export function dot(a: Point, b: Point): number {
    return a.x * b.x + a.y * b.y
}

export function distancePointToLine(q: Point, p0: Point, p1: Point): number {
    let b = pointMinusPoint(p1, p0),
        a = pointMinusPoint(q, p0),
        lb = squaredLength(b),
        t = dot(a, b) / lb
        if (t < 0.0 || t > 1.0) {
            return Infinity
        }
        return Math.abs(b.y * a.x - b.x * a.y) / Math.sqrt(lb)
}


export class Rectangle extends valueimpl.Rectangle {
  
    constructor()
    constructor(rectangle: Partial<valueimpl.Rectangle>)
    constructor(origin: Point, size: Size)
    constructor(x: number, y: number, width: number, height: number)
    constructor(xOrOriginOrRectangle?: number|Point|Partial<valueimpl.Rectangle>, yOrSize?: number|Size, width?: number, height?: number) {
        if (xOrOriginOrRectangle === undefined) {
            super()
        } else
        if (yOrSize === undefined) {
            if ( !xOrOriginOrRectangle.hasOwnProperty("origin") ||
                 !xOrOriginOrRectangle.hasOwnProperty("size") )
            {
                throw Error("fuck")
            }
            super(xOrOriginOrRectangle as Rectangle)
        } else
        if (width === undefined) {
            if ( !xOrOriginOrRectangle.hasOwnProperty("x") || // FIXME:
                 !xOrOriginOrRectangle.hasOwnProperty("y") ||
                 !yOrSize.hasOwnProperty("width") ||
                 !yOrSize.hasOwnProperty("height") )
            {
                 throw Error("fuck")
            }
            super({origin: xOrOriginOrRectangle as Point, size: yOrSize as Size})
        } else {
            if ( typeof xOrOriginOrRectangle !== "number" ||
                 typeof yOrSize !== "number" )
            {
                throw Error("fuck")
            }
            super({ origin: {x: xOrOriginOrRectangle, y: yOrSize},
                     size:  {width: width, height: height! } })
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
    
    containsRectangle(r: Rectangle): boolean {
        return this.contains(r.origin) &&
               this.contains(new Point({x: r.origin.x + r.size.width, y: r.origin.y                    })) &&
               this.contains(new Point({x: r.origin.x + r.size.width, y: r.origin.y + r.size.height })) &&
               this.contains(new Point({x: r.origin.x               , y: r.origin.y + r.size.height }))
    }
    
    intersects(r: Rectangle): boolean {
        // based on Dan Cohen and Ivan Sutherland's clipping algorithm
        let x00 = this.origin.x
        let x01 = x00 + this.size.width
        if (x00>x01) {
            [x00, x01] = [x01, x00]
        }

        let x10 = r.origin.x
        let x11 = x10 + r.size.width
        if (x10>x11) {
            [x10, x11] = [x11, x10]
        }

        let y00 = this.origin.y
        let y01 = y00 + this.size.height
        if (y00>y01) {
            [y00, y01] = [ y01, y00 ]
        }

        let y10 = r.origin.y
        let y11 = y10 + r.size.height
        if (y10>y11) {
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

        return (f0 & f1)==0;
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

export function rectangleEqualsRectangle(a: Rectangle, b: Rectangle): boolean {
    return pointEqualsPoint(a.origin, b.origin) && sizeEqualsSize(a.size, b.size)
}

// this function gives the maximum
function maxi(arr: Array<number>, n: number): number {
    let  m = 0
    for (let i = 0; i < n; ++i)
        if (m < arr[i])
            m = arr[i]
    return m
}

// this function gives the minimum
function mini(arr: Array<number>, n: number): number {
    let m = 1
    for (let i = 0; i < n; ++i)
        if (m > arr[i])
            m = arr[i]
    return m
}

function liang_barsky_clipper(
    xmin: number, ymin: number, xmax: number, ymax: number, // rectangle
    x1: number, y1: number, x2: number, y2: number): boolean         // line
{
    let p1 = -(x2 - x1),
        p2 = -p1,
        p3 = -(y2 - y1),
        p4 = -p3,
        q1 = x1 - xmin,
        q2 = xmax - x1,
        q3 = y1 - ymin,
        q4 = ymax - y1,
        posarr = [1, 0, 0, 0, 0],
        negarr = [0, 0, 0, 0, 0],
        posind = 1,
        negind = 1

    if ((p1 == 0 && q1 < 0) || (p3 == 0 && q3 < 0)) {
        // line is parallel to rectangle
        return false
    }
    if (p1 != 0) {
        let r1 = q1 / p1,
            r2 = q2 / p2
        if (p1 < 0) {
            negarr[negind++] = r1 // for negative p1, add it to negative array
            posarr[posind++] = r2 // and add p2 to positive array
        } else {
            negarr[negind++] = r2
            posarr[posind++] = r1
        }
    }
    if (p3 != 0) {
        let r3 = q3 / p3,
            r4 = q4 / p4
        if (p3 < 0) {
            negarr[negind++] = r3
            posarr[posind++] = r4
        } else {
            negarr[negind++] = r4;
            posarr[posind++] = r3;
        }
    }

    let rn1 = maxi(negarr, negind), // maximum of negative array
        rn2 = mini(posarr, posind); // minimum of positive array

    if (rn1 > rn2)  { // reject
        // line is outside the clipping window!
        return false
    }
    
    if (rn1 === rn2) // SURE?
        return false

//    console.log("rn1=", rn1)
//    console.log("rn2=", rn2)

    return true
    /*
     // computing new points
    let xn1 = x1 + p2 * rn1,
        yn1 = y1 + p4 * rn1,
        xn2 = x1 + p2 * rn2,
        yn2 = y1 + p4 * rn2
    */
}

export function intersectsRectLine(rect: Rectangle, line: Array<Point>): boolean {
    let xmin = rect.origin.x,
        ymin = rect.origin.y,
        xmax = rect.origin.x + rect.size.width,
        ymax = rect.origin.y + rect.size.height
    if (xmin > xmax)
        [xmin, xmax] = [xmax, xmin]
    if (ymin > ymax)
        [ymin, ymax] = [ymax, ymin]

    for(let i=1; i<line.length; ++i) {
        if (liang_barsky_clipper(xmin, ymin, xmax, ymax, line[i-1].x, line[i-1].y, line[i].x, line[i].y))
            return true
    }
    return false
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
