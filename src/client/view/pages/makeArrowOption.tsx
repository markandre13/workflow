import { PointLike } from "shared/geometry/Point"
import { JSX } from "toad.jsx"
import { arrow2path } from "./arrow2path"
import { StrokeEndType } from "shared/workflow"

export function makeArrowOption(type: StrokeEndType, left: boolean = true): [StrokeEndType, JSX.Element] {
    let fill: string
    switch (type) {
        case StrokeEndType.FILLED:
        case StrokeEndType.FILLED_CONCAVE:
        case StrokeEndType.FILLED_CONVEX:
            fill = "#fff"
            break
        default:
            fill = "none"
    }
    let p0: PointLike, p1: PointLike
    if (left) {
        p0 = { x: 2, y: 4.5 }
        p1 = { x: 12, y: 4.5 }
    } else {
        p0 = { x: 12, y: 4.5 }
        p1 = { x: 2, y: 4.5 }
    }
    return [type, <div>
        <svg width="14" height="10">
            <path stroke="#fff" fill={fill} d={arrow2path(type, p0, p1, 9, 9)} />
        </svg>
    </div>]
}
