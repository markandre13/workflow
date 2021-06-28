import { expect } from "chai"
import { Rectangle } from "shared/geometry"

describe("Rectangle", ()=> {
    describe("constructor", ()=> {
        it("Rectangle(x: number, y: number, width: number, height: number)", () => {
            const p = new Rectangle(60, 65, 70, 75)
            expect(p.origin.x).to.equal(60)
            expect(p.origin.y).to.equal(65)
            expect(p.size.width).to.equal(70)
            expect(p.size.height).to.equal(75)
        })
        it("Rectangle(rectangle: Rectangle)", () => {
            const p = new Rectangle(new Rectangle(60, 65, 70, 75))
            expect(p.origin.x).to.equal(60)
            expect(p.origin.y).to.equal(65)
            expect(p.size.width).to.equal(70)
            expect(p.size.height).to.equal(75)
        })
        it("Rectangle(origin: Point, size: Size)", () => {
            const p = new Rectangle({origin: {x: 60, y: 65}, size: {width: 70, height: 75}})
            expect(p.origin.x).to.equal(60)
            expect(p.origin.y).to.equal(65)
            expect(p.size.width).to.equal(70)
            expect(p.size.height).to.equal(75)
        })
    })
    // FIXME: there's a whole set of methods to be documented here
})
