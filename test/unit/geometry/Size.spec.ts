import { expect } from "chai"
import { Size } from "shared/geometry"

describe("Size", ()=> {
    describe("constructor", ()=> {
        it("Size(width: number, height: number)", () => {
            const p = new Size(60, 65)
            expect(p.width).to.equal(60)
            expect(p.height).to.equal(65)
        })
        it("Size(point: Point)", () => {
            const p = new Size(new Size(60, 65))
            expect(p.width).to.equal(60)
            expect(p.height).to.equal(65)
        })
        it("Size({width: number, height: number})", () => {
            const p = new Size({width: 60, height: 65})
            expect(p.width).to.equal(60)
            expect(p.height).to.equal(65)
        })
    })
})
