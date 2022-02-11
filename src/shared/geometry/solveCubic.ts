/**
 * Solve the cubic polynomial with coefficients a, b, c for roots
 * (zero crossings) and returns the solutions in array 'roots'
 *
 * x^3 + a*x^2 + b*x + c = 0
 */

import { Point, isZero } from "../geometry"

// Based on gsl_poly_solve_cubic from the GNU Scientific Library and
// modified to return only unique solutions.
//
// For the math and history, which dates back to Scipione del Ferro (1465-1526)
// see:
//   https://en.wikipedia.org/wiki/Cubic_function
//   http://mathworld.wolfram.com/CubicFormula.html
function gslPolySolveCubic(a: number, b: number, c: number, roots: number[]): number {
    const q = (a * a - 3 * b),
        r = (2 * a * a * a - 9 * a * b + 27 * c),
        Q = q / 9,
        R = r / 54

    if (R === 0 && Q === 0) {
        roots[0] = - a / 3
        return 1 // the original gsl function returns 3 values here
    }

    const CR2 = 729 * r * r,
        CQ3 = 2916 * q * q * q
    if (CR2 === CQ3) {
        /* this test is actually R2 == Q3, written in a form suitable
           for exact computation with integers */

        /* Due to finite precision some double roots may be missed, and
           considered to be a pair of complex roots z = x +/- epsilon i
           close to the real axis. */

        const sqrtQ = Math.sqrt(Q)

        if (R > 0) {
            roots[0] = -2 * sqrtQ - a / 3
            roots[1] = sqrtQ - a / 3
        } else {
            roots[0] = - sqrtQ - a / 3
            roots[1] = 2 * sqrtQ - a / 3
        }
        return 2 // the original gsl function returns 3 values here
    }

    const Q3 = Q * Q * Q,
        R2 = R * R
    if (R2 < Q3) {
        const sgnR = (R >= 0 ? 1 : -1),
            ratio = sgnR * Math.sqrt(R2 / Q3),
            theta = Math.acos(ratio),
            norm = -2 * Math.sqrt(Q)
        roots[0] = norm * Math.cos(theta / 3) - a / 3
        roots[1] = norm * Math.cos((theta + 2.0 * Math.PI) / 3) - a / 3
        roots[2] = norm * Math.cos((theta - 2.0 * Math.PI) / 3) - a / 3

        /* Sort *x0, *x1, *x2 into increasing order */

        if (roots[0] > roots[1])
            [roots[0], roots[1]] = [roots[1], roots[0]]

        if (roots[1] > roots[2]) {
            [roots[1], roots[2]] = [roots[2], roots[1]]
            if (roots[0] > roots[1])
                [roots[0], roots[1]] = [roots[1], roots[0]]
        }
        return 3
    }

    const sgnR = (R >= 0 ? 1 : -1),
        A = -sgnR * Math.pow(Math.abs(R) + Math.sqrt(R2 - Q3), 1.0 / 3.0),
        B = Q / A
    roots[0] = A + B - a / 3
    return 1
}

export function solveCubic0(a: number, b: number, c: number, d: number, roots: number[], min: number, max: number): number {
    let i, j, n = gslPolySolveCubic(b / a, c / a, d / a, roots)
    for (i = 0, j = 0; i < n; ++i) {
        if (j != i)
            roots[j] = roots[i]
        if (roots[i] >= min && roots[i] <= max)
            ++j
    }
    return j
}

// Converts from the point coordinates (p1, c1, c2, p2) for one axis to
// the polynomial coefficients and solves the polynomial for val
export function solveCubic(v: Point[], coord: boolean, val: number, roots: number[], min: number, max: number): number {
    let p1, c1, c2, p2, a, b, c
    if (!coord) {
        p1 = v[0].x
        c1 = v[1].x
        c2 = v[2].x
        p2 = v[3].x
    } else {
        p1 = v[0].y
        c1 = v[1].y
        c2 = v[2].y
        p2 = v[3].y
    }
    c = 3 * (c1 - p1),
        b = 3 * (c2 - c1) - c,
        a = p2 - p1 - c - b

    // If both a and b are near zero, we should treat the curve as a line in
    // order to find the right solutions in some edge-cases in
    // Curve.getParameterOf()
    if (isZero(a) && isZero(b))
        a = b = 0
    const d = p1 - val

    //  a=2;b=-4;c=-22;d=24; // this returns 1

    return solveCubic0(a, b, c, d, roots, min, max)
}
