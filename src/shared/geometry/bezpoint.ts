function mid(a: number, b: number) {
    return (a + b) / 2.0
}

function distance(x: number, y: number, x1: number, y1: number) {
    const ax = x - x1
    const ay = y - y1
    return Math.sqrt(ax * ax + ay * ay)
}

export interface BezPointDistance {
    dist: number
}

// find the minimal distance and position of curve to point (px, py)
export function bezpoint(
    px: number, py: number,
    x0: number, y0: number,
    x1: number, y1: number,
    x2: number, y2: number,
    x3: number, y3: number,
    min = 0.0, max = 1.0,
    dist?: BezPointDistance): number {
    const vx0 = x1 - x0
    const vx1 = x2 - x1
    const vx2 = x3 - x2
    const vy0 = y1 - y0
    const vy1 = y2 - y1
    const vy2 = y3 - y2

    const w0 = vx0 * vy1 - vy0 * vx1
    const w1 = vx1 * vy2 - vy1 * vx2

    const vx3 = x2 - x0
    const vx4 = x3 - x0
    const vy3 = y2 - y0
    const vy4 = y3 - y0

    const w2 = vx3 * vy4 - vy3 * vx4
    const w3 = vx0 * vy4 - vy0 * vx4

    if (Math.abs(w0) + Math.abs(w1) + Math.abs(w2) + Math.abs(w3) < 1.0) {
        let mind = distance(px, py, x0, y0)
        let f = 0.0
        let d = distance(px, py, x1, y1)
        if (d < mind) {
            mind = d
            f = 1.0
        }
        d = distance(px, py, x2, y2)
        if (d < mind) {
            mind = d
            f = 2.0
        }
        d = distance(px, py, x3, y3)
        if (d < mind) {
            mind = d
            f = 3.0
        }

        if (dist)
            dist.dist = mind
        return min + (max - min) * f / 3.0
    }

    const xx = mid(x1, x2)
    const yy = mid(y1, y2)
    const x11 = mid(x0, x1)
    const y11 = mid(y0, y1)
    const x22 = mid(x2, x3)
    const y22 = mid(y2, y3)
    const x12 = mid(x11, xx)
    const y12 = mid(y11, yy)
    const x21 = mid(xx, x22)
    const y21 = mid(yy, y22)
    const cx = mid(x12, x21)
    const cy = mid(y12, y21)
    //   double d1, d2, t1, t2;
    const d1 = {} as BezPointDistance, d2 = {} as BezPointDistance
    const t1 = bezpoint(px, py, x0, y0, x11, y11, x12, y12, cx, cy, min, min + (max - min) / 2.0, d1)
    const t2 = bezpoint(px, py, cx, cy, x21, y21, x22, y22, x3, y3, min + (max - min) / 2.0, max, d2)
    if (dist) {
        dist.dist = (d1.dist < d2.dist) ? d1.dist : d2.dist
    }
    return (d1.dist < d2.dist) ? t1 : t2
}
