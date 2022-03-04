// Copyright 2001, 2012, 2021 Dan Sunday
// Copyright 2022 Mark-André Hopf
// This code may be freely used and modified for any purpose
// providing that this copyright notice is included with it.
// There is no warranty for this code, and the author(s) of it cannot
// be held liable for any real or imagined damage from its use.
// Users of this code must verify correctness for their application.

// a Point is defined by its coordinates {int x, y;}

import { Point } from "./Point"
import { Path } from "client/paths/Path"
import { gslPolySolveCubic } from "./solveCubic"
import { bez2x, bez2dy } from "./Intersection"
import { isZero, isEqual } from "../geometry"

// FIXME: this assumes a fill-rule of "evenodd", while the browsers default to "nonzero"
// https://www.w3.org/TR/SVG2/painting.html#FillRuleProperty
export function pointInPath(path: Path, pt: Point): boolean {

    let wn = 0 // the  winding number counter

    let lastPoint!: Point
    let firstPoint!: Point
    for (let entry of path.data) {
        switch (entry.type) {
            case "M":
                firstPoint = lastPoint = { x: entry.values[0], y: entry.values[1] }
                break
            case "L": {
                const line = [
                    lastPoint,
                    { x: entry.values[0], y: entry.values[1] }
                ]
                wn = wnLine(wn, pt, line)
                lastPoint = line[1]
            } break
            case "C": {
                if (lastPoint === undefined) {
                    throw Error("yikes")
                }
                let curve = [
                    lastPoint,
                    { x: entry.values[0], y: entry.values[1] },
                    { x: entry.values[2], y: entry.values[3] },
                    { x: entry.values[4], y: entry.values[5] }
                ]
                wn = wnCurve(wn, pt, curve)
                lastPoint = curve[3]
            } break
            case "Z": {
                const line = [
                    lastPoint,
                    firstPoint
                ]
                wn = wnLine(wn, pt, line)
                lastPoint = firstPoint
            } break
        }
    }
    if (lastPoint !== firstPoint) {
        const line = [
            lastPoint,
            firstPoint
        ]
        wn = wnLine(wn, pt, line)
    }

    return (wn & 1) == 1
}

function wnLine(wn: number, pt: Point, line: Point[]) {
    if (line[0].y <= pt.y) {          // start y <= P.y
        if (line[1].y > pt.y)      // an upward crossing
            if (isLeft(line[0], line[1], pt) > 0)  // P left of  edge
                ++wn            // have  a valid up intersect
    }
    else {                        // start y > P.y (no test needed)
        if (line[1].y <= pt.y)     // a downward crossing
            if (isLeft(line[0], line[1], pt) < 0)  // P right of  edge
                --wn            // have  a valid down intersect
    }
    return wn
}

function wnCurve(wn: number, pt: Point, curve: Point[]) {
    const dy = isLeftOdd(curve, pt)
    if (dy > 0) { // downward crossing
        ++wn
    } else if (dy < 0) { // upward crossing
        --wn
    }
    return wn
}

export function isLeft(P0: Point, P1: Point, P2: Point): number {
    return (P1.x - P0.x) * (P2.y - P0.y) - (P2.x - P0.x) * (P1.y - P0.y)
}
// aka. signedArea
//         (p0.x- p2.x) * (p1.y - p2.y) - (p1.x - p2.x) * (p0.y - p2.y)

export function intersectCurveX(curve: Point[], y: number) {
    if (isEqual(curve[0].y, curve[1].y) &&
        isEqual(curve[0].y, curve[2].y) &&
        isEqual(curve[0].y, curve[3].y)
    ) return []

    let min =
        Math.min(
            Math.min(curve[0].y, curve[1].y),
            Math.min(curve[2].y, curve[3].y)
        ),
        max = Math.max(
            Math.max(curve[0].y, curve[1].y),
            Math.max(curve[2].y, curve[3].y)
        )
    if (y < min || y > max)
        return []

    let
        p1 = curve[0].y,
        c1 = curve[1].y,
        c2 = curve[2].y,
        p2 = curve[3].y,
        c = 3 * (c1 - p1),
        b = 3 * (c2 - c1) - c,
        a = p2 - p1 - c - b,
        d = p1 - y

    const roots = Array<number>(4)
    let n
    if (isZero(a)) {
        n = gslPolySolveCubic(b, c, d, roots)
    } else {
        n = gslPolySolveCubic(b / a, c / a, d / a, roots)
    }

    // filter roots to be within [0, 1]
    const result = Array<{ x: number, dy: number }>()
    for (let i = 0; i < n; ++i) {
        if (roots[i] >= 0 && roots[i] <= 1) {
            result.push({
                x: bez2x(curve, roots[i]),
                dy: bez2dy(curve, roots[i])
            })
        }
    }
    return result
}

export function isLeftOdd(curve: Point[], pt: Point): number {
    let n = 0
    let dy = 0
    for (let x of intersectCurveX(curve, pt.y)) {
        if (pt.x < x.x) {
            ++n
            dy = x.dy
        }
    }
    return (n & 1) == 1 ? dy : 0
}
