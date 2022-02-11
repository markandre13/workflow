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

import { Point } from "./geometry/Point"
import { Size } from "./geometry/Size"
import { Rectangle } from "./geometry/Rectangle"
import { Matrix } from "./geometry/Matrix"
export { Point, Size, Matrix }

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

export function pointMinusPointAsSize(a: Point, b: Point): Size {
    return {
        width: a.x - b.x,
        height: a.y - b.y
    }
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
    // let m = new Matrix()
    // m.translate(pointMinus(center))
    // m.rotate(byRadiant)
    // m.translate(center)
    // let pp = m.transformPoint(point)
    // if (!pointEqualsPoint(p, pp))
    //     console.log(`something's wrong with the matrix`)

    return p
}

// const epsilon = Number.EPSILON * 2.0
const epsilon = 0.000000001

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

export function distancePointToPoint(p0: Point, p1: Point): number {
    return Math.sqrt(squaredLength(pointMinusPoint(p1, p0)))
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
