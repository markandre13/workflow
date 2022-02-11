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

import { Point } from "./Point"
import { solveCubic } from "./solveCubic"
import { isZero, pointMultiplyNumber, pointPlusPoint } from "../geometry"

/**
 * \param[in] p four points of a cubic bézier curve
 * \param[in] t ∈[0, 1] position on the bézier curve
 * \return point on the curve at t
 */
function bez2point(p: Point[], t: number): Point {
    const u = 1 - t, u2 = u * u, t2 = t * t
    return pointPlusPoint(
        pointPlusPoint(
            pointMultiplyNumber(p[0], u2 * u),
            pointMultiplyNumber(p[1], t * u2 * 3)
        ),
        pointPlusPoint(
            pointMultiplyNumber(p[2], t2 * u * 3),
            pointMultiplyNumber(p[3], t2 * t)
        )
    )
}

function bez2x(p: Point[], t: number): number {
    const u = 1 - t,
        u2 = u * u,
        t2 = t * t
    return p[0].x * u2 * u + p[1].x * t * u2 * 3 + p[2].x * t2 * u * 3 + p[3].x * t2 * t
}

// description of an intersection between path segments
export class IntersectionPoint {
    type: string	// 'L'line or 'C'urve, as used in Path // FIXME: enum?
    src: Array<Point>	// data for L or C
    u: number		// position of intersection on src within [0, 1]
    pt: Point		// the actual calculated location of the intersection
    constructor(type: string, src: Array<Point>, u: number, pt: Point) {
        this.type = type
        this.src = src
        this.u = u
        this.pt = pt
    }
}

export class Intersection {
    seg0: IntersectionPoint
    seg1: IntersectionPoint

    constructor(t0: string, s0: Array<Point>, u0: number, p0: Point,
        t1: string, s1: Array<Point>, u1: number, p1: Point) {
        this.seg0 = new IntersectionPoint(t0, s0, u0, p0)
        this.seg1 = new IntersectionPoint(t1, s1, u1, p1)
    }
}

export function _intersectLineLine(lineA: Array<Point>, lineB: Array<Point>): Point | undefined {
    let ax = lineA[1].x - lineA[0].x,
        ay = lineA[1].y - lineA[0].y,
        bx = lineB[1].x - lineB[0].x,
        by = lineB[1].y - lineB[0].y,
        cross = ax * by - ay * bx

    if (isZero(cross))
        return undefined

    let
        dx = lineA[0].x - lineB[0].x,
        dy = lineA[0].y - lineB[0].y,
        a = (bx * dy - by * dx) / cross,
        b = (ax * dy - ay * dx) / cross
    if (a < 0.0 || a > 1.0 || b < 0.0 || b > 1.0)
        return undefined
    return new Point(lineA[0].x + a * ax, lineA[0].y + a * ay)
}

export function intersectLineLine(ilist: Array<Intersection>, lineA: Array<Point>, lineB: Array<Point>) {
    let ax = lineA[1].x - lineA[0].x,
        ay = lineA[1].y - lineA[0].y,
        bx = lineB[1].x - lineB[0].x,
        by = lineB[1].y - lineB[0].y,
        cross = ax * by - ay * bx
    if (isZero(cross))
        return

    let
        dx = lineA[0].x - lineB[0].x,
        dy = lineA[0].y - lineB[0].y,
        a = (bx * dy - by * dx) / cross,
        b = (ax * dy - ay * dx) / cross
    if (a < 0.0 || a > 1.0 || b < 0.0 || b > 1.0)
        return
    let p = new Point(lineA[0].x + a * ax, lineA[0].y + a * ay)
    ilist.push(new Intersection("L", lineA, a, p,
        "L", lineB, b, p))
}

/**
 * \param vc
 *   four points of a bézier curve
 * \param vl
 *   two points of a line
 */
export function intersectCurveLine(ilist: Array<Intersection>, curve: Point[], line: Point[]) {
    const lx1 = line[0].x, ly1 = line[0].y,
        lx2 = line[1].x, ly2 = line[1].y,
        // Rotate both curve and line around l1 so that line is on x axis.
        ldx = lx2 - lx1,
        ldy = ly2 - ly1,
        // Calculate angle to the x-axis (1, 0).
        angle = Math.atan2(-ldy, ldx),
        sin = Math.sin(angle),
        cos = Math.cos(angle),
        // (rlx1, rly1) = (0, 0)
        rlx2 = ldx * cos - ldy * sin

    // rotated line: The curve values for the rotated line.
    // TPoint rvl[2] = {{0, 0}, {rlx2, 0}};
    // rotated curve: Calculate the curve values of the rotated curve.
    const rvc = Array<Point>(4)
    for (let i = 0; i < 4; ++i) {
        const x = curve[i].x - lx1,
            y = curve[i].y - ly1
        rvc[i] = {
            x: x * cos - y * sin,
            y: y * cos + x * sin
        }
    }

    const roots = Array<number>(4)
    const count = solveCubic(rvc, true, 0, roots, 0, 1)

    // NOTE: count could be -1 for infinite solutions, but that should only
    // happen with lines, in which case we should not be here.
    for (let i = 0; i < count; ++i) {
        const tc = roots[i],
            x = bez2x(rvc, tc)
        if (x >= 0 && x <= rlx2) {
            const tl = x / rlx2
            ilist.push(new Intersection(
                'C', curve, tc, bez2point(curve, tc),
                'L', line, tl, new Point(line[0].x + tl * ldx, line[0].y + tl * ldy)) // FIXME
            )
        }
    }
}
