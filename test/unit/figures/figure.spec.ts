import { expect } from "chai"

import { Point } from 'shared/geometry/Point'
import { Rectangle } from 'shared/geometry/Rectangle'
import { Matrix } from 'shared/geometry/Matrix'
import { Path } from 'client/paths'
import { Figure } from "client/figures/Figure"

class FigureX extends Figure {
    constructor() {
        super()
    }
    transform(transform: Matrix): boolean {
        throw Error("not yet implemented")
    }
    distance(pt: Point): number {
        throw Error("not yet implemented")
    }
    bounds(): Rectangle {
        throw Error("not yet implemented")
    }
    getHandlePosition(i: number): Point | undefined {
        throw Error("not yet implemented")
    }
    setHandlePosition(handle: number, pt: Point): void {
        throw Error("not yet implemented")
    }
    getPath(): Path {
        throw Error("nope")
    }
}


describe("figures", function () {
    describe("Figure", function () {
        it("stroke", function() {
            const figure = new FigureX()
            expect(figure.stroke).to.equal("none")
            figure.stroke = "#fff"
            expect(figure.stroke).to.equal("rgba(255,255,255,1)")
            figure.stroke = "none"
            expect(figure.stroke).to.equal("none")
        })

        it("strokeWidth", function() {
            const figure = new FigureX()
            expect(figure.strokeWidth).to.equal(1)
            figure.strokeWidth = 20
            expect(figure.strokeWidth).to.equal(20)
            figure.strokeWidth = 1
            expect(figure.strokeWidth).to.equal(1)
        })

        it("fill", function() {
            const figure = new FigureX()
            expect(figure.fill).to.equal("none")
            figure.fill = "#fff"
            expect(figure.fill).to.equal("rgba(255,255,255,1)")
            figure.fill = "none"
            expect(figure.fill).to.equal("none")
        })
    })
})
