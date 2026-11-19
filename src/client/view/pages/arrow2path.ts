import { PointLike } from "shared/geometry/Point"
import { StrokeEndType } from "shared/workflow"

export function arrow2path(
    type: StrokeEndType,
    p1: PointLike,
    p2: PointLike,
    w: number,
    h: number
) {
    const d = Math.atan2(p2.y - p1.y, p2.x - p1.x)

    let height = h
    const width = 0.5 * w

    const p0 = {
        x: Math.cos(d) * height + p1.x,
        y: Math.sin(d) * height + p1.y
    }

    const p = Array(4)
    p[0] = p1

    const r = 90.0 / 360.0 * (2.0 * Math.PI)
    p[1] = {
        x: p0.x + Math.cos(d - r) * width,
        y: p0.y + Math.sin(d - r) * width
    }
    p[3] = {
        x: p0.x + Math.cos(d + r) * width,
        y: p0.y + Math.sin(d + r) * width
    }

    switch (type) {
        case StrokeEndType.NONE:
            return ""
        case StrokeEndType.SIMPLE:
            return `M ${p[1].x} ${p[1].y} L ${p[0].x} ${p[0].y} L ${p[3].x} ${p[3].y}`
        case StrokeEndType.EMPTY:
        case StrokeEndType.FILLED:
            p[2] = p0
            break
        case StrokeEndType.EMPTY_CONCAVE:
        case StrokeEndType.FILLED_CONCAVE:
            height -= height / 3
            p[2] = {
                x: Math.cos(d) * height + p1.x,
                y: Math.sin(d) * height + p1.y
            }
            break
        case StrokeEndType.EMPTY_CONVEX:
        case StrokeEndType.FILLED_CONVEX:
            height += height / 3
            p[2] = {
                x: Math.cos(d) * height + p1.x,
                y: Math.sin(d) * height + p1.y
            }
            break
    }
    return `M ${p[0].x} ${p[0].y} L ${p[1].x} ${p[1].y} L ${p[2].x} ${p[2].y} L ${p[3].x} ${p[3].y} Z`
}
