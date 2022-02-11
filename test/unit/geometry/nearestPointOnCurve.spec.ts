import { nearestPointOnCurve } from "shared/geometry/nearestPointOnCurve"
import { bezpoint } from "shared/geometry/bezpoint"

describe("geometry", function () {
    it("nearestPointOnCurve", function () {
         /*
          *  main :
          *	Given a cubic Bezier curve (i.e., its control points), and some
          *	arbitrary point in the plane, find the point on the curve
          *	closest to that arbitrary point.
          */

        const bezCurve = [	/*  A cubic Bezier curve	*/
            { x: 0.0, y: 0.0 },
            { x: 1.0, y: 2.0 },
            { x: 3.0, y: 3.0 },
            { x: 4.0, y: 2.0 },
        ]
        const arbPoint = { x: 3.5, y: 2.0 } /*Some arbitrary point*/
        //  Point2	pointOnCurve;		 /*  Nearest point on the curve */

        /*  Find the closest point */
        const pointOnCurve = nearestPointOnCurve(arbPoint, bezCurve)
        console.log(`pointOnCurve : ${pointOnCurve.x}, ${pointOnCurve.y}`)

        const d = bezpoint(
            arbPoint.x, arbPoint.y,
            bezCurve[0].x, bezCurve[0].y,
            bezCurve[1].x, bezCurve[1].y,
            bezCurve[2].x, bezCurve[2].y,
            bezCurve[3].x, bezCurve[3].y
        )
        console.log(`${d.point.x}, ${d.point.y}`)
    })
})
