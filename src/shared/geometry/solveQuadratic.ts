/**
 * Solves the quadratic polynomial with coefficients a, b, c for roots
 * (zero crossings) and returns the solutions in array 'roots'
 *
 * a*x^2 + b*x + c = 0
 */

// After Numerical Recipes in C, 2nd edition, Press et al.,
// 5.6, Quadratic and Cubic Equations
// If problem is actually linear, returns 0 or 1 easy roots
// If all the coefficients are 0, infinite values are possible and -1 is returned
function solveQuadratic(a: number, b: number, c: number, roots: number[]): number
function solveQuadratic(a: number, b: number, c: number, roots: number[], min: number, max: number): number
function solveQuadratic(a: number, b: number, c: number, roots: number[], min?: number, max?: number): number {
    let n = solveQuadraticCore(a, b, c, roots)
    if (min === undefined || max === undefined)
        return n
    let i, j
    for (i = 0, j = 0; i < n; ++i) {
        if (j != i)
            roots[j] = roots[i]
        if (roots[i] >= min && roots[i] <= max)
            ++j
    }
    return j
}

export { solveQuadratic }

function solveQuadraticCore(a: number, b: number, c: number, roots: number[]): number {
    const tolerance = Number.EPSILON / 2

    if (Math.abs(a) < tolerance) {
        if (Math.abs(b) >= tolerance) {
            roots[0] = -c / b
            return 1
        }
        // If all the coefficients are 0, infinite values are possible!
        if (Math.abs(c) < tolerance)
            return -1 // Infinite solutions
        return 0 // 0 solutions
    }
    let q = b * b - 4 * a * c
    if (q < 0)
        return 0 // 0 solutions
    q = Math.sqrt(q)
    if (b < 0)
        q = -q
    q = (b + q) * -0.5
    let n = 0
    if (Math.abs(q) >= tolerance)
        roots[n++] = c / q
    if (Math.abs(a) >= tolerance)
        roots[n++] = q / a
    return n // 0, 1 or 2 solutions
}
