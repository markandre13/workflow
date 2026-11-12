import { expect } from "chai"

import { PointLike } from 'shared/geometry/Point'
import { Rectangle } from 'shared/geometry/Rectangle'
import { Matrix } from 'shared/geometry/Matrix'
import { Path } from 'client/paths'
import { Shape } from "client/shapes/Shape"

class ShapeX extends Shape {
    constructor() {
        super()
    }
    transform(transform: Matrix): boolean {
        throw Error("not yet implemented")
    }
    distance(pt: PointLike): number {
        throw Error("not yet implemented")
    }
    bounds(): Rectangle {
        throw Error("not yet implemented")
    }
    getHandlePosition(i: number): PointLike | undefined {
        throw Error("not yet implemented")
    }
    setHandlePosition(handle: number, pt: PointLike): void {
        throw Error("not yet implemented")
    }
    getPath(): Path {
        throw Error("nope")
    }
}


describe("shapes", function () {
    describe("Shape", function () {
        it("stroke", function() {
            const shape = new ShapeX()
            expect(shape.stroke).to.equal("none")
            shape.stroke = "#fff"
            expect(shape.stroke).to.equal("rgba(255,255,255,1)")
            shape.stroke = "none"
            expect(shape.stroke).to.equal("none")
        })

        it("strokeWidth", function() {
            const shape = new ShapeX()
            expect(shape.strokeWidth).to.equal(1)
            shape.strokeWidth = 20
            expect(shape.strokeWidth).to.equal(20)
            shape.strokeWidth = 1
            expect(shape.strokeWidth).to.equal(1)
        })

        it("fill", function() {
            const shape = new ShapeX()
            expect(shape.fill).to.equal("none")
            shape.fill = "#fff"
            expect(shape.fill).to.equal("rgba(255,255,255,1)")
            shape.fill = "none"
            expect(shape.fill).to.equal("none")
        })
    })
})
