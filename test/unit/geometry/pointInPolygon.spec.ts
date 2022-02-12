import { expect } from '@esm-bundle/chai'

import { nearestPointOnCurve } from "shared/geometry/nearestPointOnCurve"
import { bezpoint } from "shared/geometry/bezpoint"

function annotate(context: Mocha.Context, annotation:string|Element) {
    const currentTest = context.currentTest
    const activeTest = context.test
    let isEachHook = false
    if (activeTest) {
        isEachHook = currentTest !== undefined && /^"(?:before|after)\seach"/.test(activeTest.title)
    }
    const test = isEachHook ? currentTest : activeTest;
    // test.annotation = annotation

    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.style.border = "1px solid #ddd"
    svg.setAttributeNS("", "width", "320")
    svg.setAttributeNS("", "height", "200")
    svg.setAttributeNS("", "viewBox", "0 0 320 200")

    if (typeof annotation === "string") {
        // document.body.appendChild(document.createTextNode(annotation))
        let text = document.createElementNS("http://www.w3.org/2000/svg", "text")
        text.setAttributeNS("", "fill", "#000")
        text.setAttributeNS("", "x", "2")
        text.setAttributeNS("", "y", "194")
        text.appendChild(document.createTextNode(test!.title))
        svg.appendChild(text)  
        document.body.appendChild(svg)
    }
}

describe("geometry", function () {
    it("pointInPolygon1", function () {
        annotate(this, "hello1")
    })
    it("pointInPolygon2", function () {
        annotate(this, "hello2")
    })
})
