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

import * as value  from "./workflow_value"
import * as valuetype from "./workflow_valuetype"
import { GIOPDecoder } from "corba.js" 

export class Point implements value.Point {
    x!: number
    y!: number

    constructor()
    constructor(point: Partial<Point>)
    constructor(x: number, y: number)
    constructor(decoder: GIOPDecoder)
    constructor(xOrPoint?: number|Partial<Point>|GIOPDecoder, y?: number) {
        if (xOrPoint instanceof GIOPDecoder) {
            value.initPoint(this, xOrPoint)
        } else
        if (xOrPoint === undefined) {
            value.initPoint(this)
        } else
        if (typeof xOrPoint === "object") {
            value.initPoint(this, xOrPoint)
        } else {
            value.initPoint(this, {x: xOrPoint, y: y!})
        }
    }
    toString() {
        return `Point(${this.x}, ${this.y})`
    }
}

export class Size implements value.Size {
    width!: number
    height!: number

    constructor()
    constructor(size: Partial<Size>)
    constructor(width: number, height: number)
    constructor(decoder: GIOPDecoder)
    constructor(widthOrSize?: number|Partial<Size>|GIOPDecoder, height?: number) {
        if (widthOrSize instanceof GIOPDecoder) {
            value.initSize(this, widthOrSize)
        } else
        if (widthOrSize === undefined) {
            value.initSize(this)
        } else
        if (typeof widthOrSize === "object") {
            value.initSize(this, widthOrSize)
        } else {
            value.initSize(this, {width: widthOrSize, height: height!})
        }
    }
    toString() {
        return `Size(${this.width}, ${this.height})`
    }
}

export function pointPlusSize(point: Point, size: Size): Point {
    return new Point({
        x: point.x + size.width,
        y: point.y + size.height
    })
}

export function pointMinusSize(point: Point, size: Size): Point {
    return new Point({
        x: point.x - size.width,
        y: point.y - size.height
    })
}

export function pointPlusPoint(a: Point, b: Point): Point {
    return new Point({
        x: a.x + b.x,
        y: a.y + b.y
    })
}

export function pointMinusPoint(a: Point, b: Point): Point {
    return new Point({
        x: a.x - b.x,
        y: a.y - b.y
    })
}

export function pointMultiplyNumber(a: Point, b: number): Point {
    return new Point({
        x: a.x * b,
        y: a.y * b
    })
}

export function sizeMultiplyNumber(a: Size, b: number): Size {
    return new Size({
        width: a.width * b,
        height: a.height * b
    })
}

export function pointMinus(a: Point) {
    return new Point({
        x: -a.x,
        y: -a.y
    })
}

export function rotatePointAroundPointBy(point: Point, center: Point, byRadiant: number): Point {
    let vector = pointMinusPoint(point, center)
    let radiant = Math.atan2(vector.y, vector.x) + byRadiant
    let diameter = Math.sqrt(vector.x*vector.x + vector.y*vector.y)
    let p = new Point(center.x + Math.cos(radiant) * diameter, center.y + Math.sin(radiant) * diameter)

    // FIXME: move this sanity check into separate test
    let m = new Matrix()
    m.translate(pointMinus(center))
    m.rotate(byRadiant)
    m.translate(center)
    let pp = m.transformPoint(point)
    if (!pointEqualsPoint(p, pp))
        throw Error("something's wrong with the matrix")

    return p
}

// let epsilon = Number.EPSILON * 2.0
let epsilon = 0.000000001

export function isZero(a: number): boolean {
    return Math.abs(a) <= epsilon
}

export function isOne(a: number): boolean {
    return (1.0 - Math.abs(a)) <= epsilon
}

export function isEqual(a: number, b: number) {
    return isZero(a-b)
}

export function isLessEqual(a: number, b: number): boolean {
    if (a < b)
        return true
    return Math.abs(a - b) < epsilon
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

// angle between a b = arccos( dot(x, y) / len(x) * len(y) )
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

export class Rectangle implements value.Rectangle {
    origin!: Point
    size!: Size
  
    constructor()
    constructor(rectangle: Partial<value.Rectangle>)
    constructor(origin: Point, size: Size)
    constructor(x: number, y: number, width: number, height: number)
    constructor(decoder: GIOPDecoder)
    constructor(xOrOriginOrRectangle?: number|Point|Partial<value.Rectangle>|GIOPDecoder, yOrSize?: number|Size, width?: number, height?: number) {
        if (xOrOriginOrRectangle instanceof GIOPDecoder) {
            value.initRectangle(this, xOrOriginOrRectangle)
        } else
        if (xOrOriginOrRectangle === undefined) {
            value.initRectangle(this)
        } else
        if (yOrSize === undefined) {
            if ( !xOrOriginOrRectangle.hasOwnProperty("origin") ||
                 !xOrOriginOrRectangle.hasOwnProperty("size") )
            {
                throw Error("yikes")
            }
            value.initRectangle(this, xOrOriginOrRectangle as Rectangle)
        } else
        if (width === undefined) {
            if ( !xOrOriginOrRectangle.hasOwnProperty("x") || // FIXME:
                 !xOrOriginOrRectangle.hasOwnProperty("y") ||
                 !yOrSize.hasOwnProperty("width") ||
                 !yOrSize.hasOwnProperty("height") )
            {
                 throw Error("yikes")
            }
            value.initRectangle(this, {origin: xOrOriginOrRectangle as Point, size: yOrSize as Size})
        } else {
            if ( typeof xOrOriginOrRectangle !== "number" ||
                 typeof yOrSize !== "number" )
            {
                throw Error("yikes")
            }
            value.initRectangle(this, { origin: {x: xOrOriginOrRectangle, y: yOrSize},
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
    
    inside(p: Point): boolean {
        return this.origin.x < p.x && p.x < this.origin.x + this.size.width &&
               this.origin.y < p.y && p.y < this.origin.y + this.size.height
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

    forAllEdges(callback: (edge: Point) => void, transform?: Matrix) {
        if (transform !== undefined) {
            callback(transform.transformPoint(this.origin))
            callback(transform.transformPoint(pointPlusSize(this.origin, {width: this.size.width, height: 0})))
            callback(transform.transformPoint(pointPlusSize(this.origin, {width: 0, height: this.size.height})))
            callback(transform.transformPoint(pointPlusSize(this.origin, this.size)))
        } else {
            callback(this.origin)
            callback(pointPlusSize(this.origin, {width: this.size.width, height: 0}))
            callback(pointPlusSize(this.origin, {width: 0, height: this.size.height}))
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
            (rectangle as Rectangle).forAllEdges((edge)=> {
                this.expandByPoint(edge)
            }, transform )
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
    xmin: number, ymin: number, xmax: number, ymax: number,     // rectangle
    x1: number, y1: number, x2: number, y2: number): boolean    // line
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
    
    // if (rn1 === rn2) // SURE?
    //     return false

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

export function lineCrossesLine(lineA: Array<Point>, lineB: Array<Point>): boolean
{
    // console.log("lineCrossesLine")

    let ax = lineA[1].x - lineA[0].x,
        ay = lineA[1].y - lineA[0].y,
        bx = lineB[1].x - lineB[0].x,
        by = lineB[1].y - lineB[0].y,
        cross = ax*by - ay*bx

    if (isZero(cross))
        return false
     
    let dx = lineA[0].x - lineB[0].x,
        dy = lineA[0].y - lineB[0].y,
        a = (bx * dy - by * dx) / cross,
        b = (ax * dy - ay * dx) / cross
  
    if (isZero(a) || isOne(a) || isZero(b) || isOne(b))
        return false
        
    if (a<=0.0 || a>=1.0 || b<=0.0 || b>=1.0)
        return false
  
    // console.log("=> TRUE", a, b)

    return true
}

export function lineCrossesRect(
    x1: number, y1: number, x2: number, y2: number,         // line
    xmin: number, ymin: number, xmax: number, ymax: number  // rectangle
): boolean
{
    let line = [{x: x1, y: y1}, {x: x2, y: y2}]
    if (lineCrossesLine(line, [{x: xmin, y: ymin}, {x: xmax, y: ymin}]))
        return true
    if (lineCrossesLine(line, [{x: xmin, y: ymax}, {x: xmax, y: ymax}]))
        return true
    if (lineCrossesLine(line, [{x: xmin, y: ymin}, {x: xmin, y: ymax}]))
        return true
    if (lineCrossesLine(line, [{x: xmax, y: ymin}, {x: xmax, y: ymax}]))
        return true
    return false
}

export function lineCrossesRect2(l: Array<Point>, r: Rectangle): boolean {
    return lineCrossesRect(
        l[0].x, l[0].y, l[1].x, l[1].y,
        r.origin.x, r.origin.y, r.origin.x + r.size.width, r.origin.y + r.size.height
    )
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
        if (lineCrossesRect(xmin, ymin, xmax, ymax, line[i-1].x, line[i-1].y, line[i].x, line[i].y))
            return true
    }
    return false
}

// FIXME: DO A HUGE OVERHAUL: ADOPT FUNCTIONAL STYLE, DON'T LET METHODS RETURNING A MATRIX MODIFY THE MATRIX, RETURN A NEW ONE
export class Matrix implements value.Matrix {
    a!: number
    b!: number
    c!: number
    d!: number
    e!: number
    f!: number

    constructor(matrix?: Partial<value.Matrix>|GIOPDecoder) {
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
        [ this.a, this.b, this.c, this.d, this.e, this.f ] = [ 1, 0, 0, 1, 0, 0]
        return this
    }
    
    append(matrix: Matrix): Matrix {
        [ this.a, this.b, this.c, this.d, this.e, this.f ] =
        [ this.a * matrix.a + this.c * matrix.b,
          this.b * matrix.a + this.d * matrix.b,
          this.a * matrix.c + this.c * matrix.d,
          this.b * matrix.c + this.d * matrix.d,
          this.a * matrix.e + this.c * matrix.f + this.e,
          this.b * matrix.e + this.d * matrix.f + this.f ]
        return this
    }

    prepend(matrix: Matrix): Matrix {
        [ this.a, this.b, this.c, this.d, this.e, this.f ] =
        [ matrix.a * this.a + matrix.c * this.b,
          matrix.b * this.a + matrix.d * this.b,
          matrix.a * this.c + matrix.c * this.d,
          matrix.b * this.c + matrix.d * this.d,
          matrix.a * this.e + matrix.c * this.f + matrix.e,
          matrix.b * this.e + matrix.d * this.f + matrix.f ]
        return this
    }
 
    invert(): Matrix {
        let d = 1.0 / (this.a * this.d - this.c * this.b)
        let n11 = d *  this.d
        let n12 = d * -this.b
        let n21 = d * -this.c
        let n22 = d *  this.a
        let nX  = d * (this.c * this.f - this.d * this.e)
        let nY  = d * (this.b * this.e - this.a * this.f)

        this.a = n11
        this.b = n12
        this.c = n21
        this.d = n22
        this.e  = nX
        this.f  = nY
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
            a:  Math.cos(radiant), c: -Math.sin(radiant), e: 0,
            b:  Math.sin(radiant), d:  Math.cos(radiant), f: 0
        })
        this.prepend(m)
        return this
    }

    getRotation(): number {
        let r0 = -Math.atan2(-this.b, this.a)
        let r1 = -Math.atan2(this.c, this.d)
        if (isEqual(r0, r1)) {
            if (r0<0)
                r0 = Math.PI+r0
            return r0
        }
        return NaN
    }
    
    scale(x: number, y:number): Matrix {
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
            a:  Math.cos(radiant), c: -Math.sin(radiant), e: 0,
            b:  Math.sin(radiant), d:  Math.cos(radiant), f: 0
        })
        this.append(m)
        return this
    }
    
    postScale(x: number, y:number): Matrix {
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
        return `{rotate: [${this.a}, ${this.b}, ${this.c}, ${this.d}], translate: [${this.e}, ${this.f}})`
    }
}
