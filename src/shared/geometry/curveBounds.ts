import { Point } from "./Point"
import { Rectangle } from "./Rectangle"
import { pointMinusPointAsSize } from "../geometry"
import { solveQuadratic } from "./solveQuadratic"

// Code ported and further optimised from:
// http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
function add(value: number, padding: number, coord: number, min: Point, max: Point): void {
    let left = value - padding,
        right = value + padding
    if (coord == 0) {
        if (left < min.x)
            min.x = left
        if (right > max.x)
            max.x = right
    } else {
        if (left < min.y)
            min.y = left
        if (right > max.y)
            max.y = right
    }
}

function _addBounds(v0: number, v1: number, v2: number, v3: number, coord: number, padding: number, min: Point, max: Point) {
    // Calculate derivative of our bezier polynomial, divided by 3.
    // Doing so allows for simpler calculations of a, b, c and leads to the
    // same quadratic roots.
    let a = 3 * (v1 - v2) - v0 + v3,
        b = 2 * (v0 + v2) - 4 * v1,
        c = v1 - v0
    const roots: number[] = []
    const count = solveQuadratic(a, b, c, roots, 0, 1)
    // Add some tolerance for good roots, as t = 0, 1 are added
    // separately anyhow, and we don't want joins to be added with radii
    // in getStrokeBounds()
    const tMin = Number.EPSILON / 2,
        tMax = 1 - tMin
    // Only add strokeWidth to bounds for points which lie within 0 < t < 1
    // The corner cases for cap and join are handled in getStrokeBounds()
    add(v3, 0, coord, min, max)
    for (let i = 0; i < count; i++) {
        const t = roots[i]
        // Test for good roots and only add to bounds if good.
        if (tMin < t && t < tMax) {
            // Calculate bezier polynomial at t.
            const t2 = t * t,
                u = 1 - t,
                u2 = u * u
            add(u2 * u * v0
                + 3 * u2 * t * v1
                + 3 * u * t2 * v2
                + t2 * t * v3,
                padding, coord, min, max)
        }
    }
}

export function curveBounds(v: Point[]): Rectangle {
    let min = { x: v[0].x, y: v[0].y },
        max = { x: v[0].x, y: v[0].y }
    _addBounds(v[0].x, v[1].x, v[2].x, v[3].x, 0, 0, min, max)
    _addBounds(v[0].y, v[1].y, v[2].y, v[3].y, 1, 0, min, max)
    return new Rectangle({ origin: min, size: pointMinusPointAsSize(max, min) })
}
