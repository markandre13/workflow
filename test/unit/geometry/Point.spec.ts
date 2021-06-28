import { expect } from "chai"
import { Point } from "shared/geometry"

describe("Point", ()=> {
    describe("constructor", ()=> {
        it("Point(x: number, y: number)", () => {
            const p = new Point(60, 65)
            expect(p.x).to.equal(60)
            expect(p.y).to.equal(65)
        })
        it("Point(point: Point)", () => {
            const p = new Point(new Point(60, 65))
            expect(p.x).to.equal(60)
            expect(p.y).to.equal(65)
        })
        it("Point({x: number, y: number})", () => {
            const p = new Point({x: 60, y: 65})
            expect(p.x).to.equal(60)
            expect(p.y).to.equal(65)
        })
    })
})
