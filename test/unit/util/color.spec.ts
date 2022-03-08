import { expect } from '@esm-bundle/chai'
import { parseColor } from "client/utils/color"

describe("color parser", function () {
    describe("sRGB", async function () {
        it("none", function() {
            expect(parseColor("none")).to.be.undefined
        })
        it("three digit hex - #rgb", function() {
            expect(parseColor("#abc")).to.deep.equal({r: 0xAA, g: 0xBB, b: 0xCC, a: 255})
        })
        it("six digit hex - #rrggbb", function() {
            expect(parseColor("#abcdef")).to.deep.equal({r: 0xAB, g: 0xCD, b: 0xEF, a: 255})
        })
        it("integer functional - rgb(rrr,ggg,bbb)", function() {
            expect(parseColor("rgb(100,150,200)")).to.deep.equal({r: 100, g: 150, b: 200, a: 255})
        })
        it("integer functional - rgba(rrr,ggg,bbb,A)", function() {
            expect(parseColor("rgba(100,150,200,0.5)")).to.deep.equal({r: 100, g: 150, b: 200, a: 127})
        })
        it("float functional - rgb(R%,G%,B%)", function() {
            expect(parseColor("rgb(0.0%,50.0%,100.00%)")).to.deep.equal({r: 0, g: 127, b: 255, a: 255})
        })
        it("float functional - rgba(R%,G%,B%,A)", function() {
            expect(parseColor("rgba(0.0%,50.0%,100.00%,0.5)")).to.deep.equal({r: 0, g: 127, b: 255, a: 127})
        })
    })
})
