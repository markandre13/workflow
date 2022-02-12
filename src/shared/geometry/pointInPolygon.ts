// Copyright 2001, 2012, 2021 Dan Sunday
// This code may be freely used and modified for any purpose
// providing that this copyright notice is included with it.
// There is no warranty for this code, and the author of it cannot
// be held liable for any real or imagined damage from its use.
// Users of this code must verify correctness for their application.

// a Point is defined by its coordinates {int x, y;}

import { Point } from "./Point"

// cn_PnPoly(): crossing number test for a point in a polygon
//      Input:   P = a point,
//               V[] = vertex points of a polygon V[n+1] with V[n]=V[0]
//      Return:  0 = outside, 1 = inside
// This code is patterned after [Franklin, 2000]
export function pointInPolygonCN(P: Point, V: Point[], n: number): boolean {
    let cn = 0    // the  crossing number counter

    // loop through all edges of the polygon
    for (let i = 0; i < n; i++) {    // edge from V[i] to V[i+1]
        if (((V[i].y <= P.y) && (V[i + 1].y > P.y))     // an upward crossing
            || ((V[i].y > P.y) && (V[i + 1].y <= P.y))) { // a downward crossing
            // compute  the actual edge-ray intersect x-coordinate
            let vt = (P.y - V[i].y) / (V[i + 1].y - V[i].y)
            if (P.x < V[i].x + vt * (V[i + 1].x - V[i].x)) // P.x < intersect
                ++cn   // a valid crossing of y=P.y right of P.x
        }
    }
    return (cn & 1) == 1    // 0 if even (out), and 1 if  odd (in)

}

// isLeft(): tests if a point is Left|On|Right of an infinite line.
//    Input:  three points P0, P1, and P2
//    Return: >0 for P2 left of the line through P0 and P1
//            =0 for P2  on the line
//            <0 for P2  right of the line
function isLeft(P0: Point, P1: Point, P2: Point): number {
    return (P1.x - P0.x) * (P2.y - P0.y) - (P2.x - P0.x) * (P1.y - P0.y)
}
// aka. signedArea
//         (p0.x- p2.x) * (p1.y - p2.y) - (p1.x - p2.x) * (p0.y - p2.y)

// isLeft for Bezier Curve?

// pointInPolygonWN(): winding number test for a point in a polygon
//      Input:   P = a point,
//               V[] = vertex points of a polygon V[n+1] with V[n]=V[0]
//      Return:  wn = the winding number (=0 only when P is outside)
export function pointInPolygonWN(P: Point, V: Point[], n: number): boolean {
    let wn = 0    // the  winding number counter

    // loop through all edges of the polygon
    for (let i = 0; i < n; i++) {   // edge from V[i] to  V[i+1]

        // if (V[i].y <= P.y && P.y < V[i + 1].y && isLeft(V[i], V[i + 1], P) > 0) {
        //     ++wn
        // }
        // if (V[i+1].y <= P.y && P.y < V[i].y && isLeft(V[i+1], V[i], P) > 0) {
        //     --wn
        // }

        if (V[i].y <= P.y) {          // start y <= P.y
            if (V[i + 1].y > P.y)      // an upward crossing
                if (isLeft(V[i], V[i + 1], P) > 0)  // P left of  edge
                    ++wn            // have  a valid up intersect
        }
        else {                        // start y > P.y (no test needed)
            if (V[i + 1].y <= P.y)     // a downward crossing
                if (isLeft(V[i], V[i + 1], P) < 0)  // P right of  edge
                    --wn            // have  a valid down intersect
        }
    }
    return wn == 1
}
