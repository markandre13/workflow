import { expect } from '@esm-bundle/chai'
import { pointInPolygonCN, isLeft } from "shared/geometry/pointInPolygon"
import { Point } from "shared/geometry/Point"

function annotate(context: Mocha.Context, okay: boolean, annotation: string | SVGSVGElement) {
    const currentTest = context.currentTest
    const activeTest = context.test
    let isEachHook = false
    if (activeTest) {
        isEachHook = currentTest !== undefined && /^"(?:before|after)\seach"/.test(activeTest.title)
    }
    const test = isEachHook ? currentTest : activeTest

    printTitles(test?.parent)

    // test.annotation = annotation

    if (typeof annotation === "string") {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        svg.style.border = "1px solid #ddd"
        svg.setAttributeNS("", "width", "320")
        svg.setAttributeNS("", "height", "200")
        svg.setAttributeNS("", "viewBox", "0 0 320 200")

        let text = document.createElementNS("http://www.w3.org/2000/svg", "text")
        text.setAttributeNS("", "fill", "#000")
        text.setAttributeNS("", "x", "0")
        text.setAttributeNS("", "y", "12")
        text.appendChild(document.createTextNode(annotation))
        svg.appendChild(text)
        annotation = svg
    }

    if (!okay) {
        annotation.style.border = "1px solid #f00"
    }

    let text = document.createElementNS("http://www.w3.org/2000/svg", "text")
    text.setAttributeNS("", "fill", "#000")
    text.setAttributeNS("", "x", "2")
    text.setAttributeNS("", "y", "194")
    text.style.fontSize = "10px"
    text.style.fontFamily = "sans-serif"
    text.appendChild(document.createTextNode(test!.title))
    annotation.appendChild(text)

    document.body.appendChild(annotation)
}

const printedTitles = new Set()
function printTitles(test?: Mocha.Suite): number {
    if (test === undefined)
        return 0
    const level = printTitles(test.parent) + 1

    if (printedTitles.has(test))
        return level
    printedTitles.add(test)

    const heading = document.createElement(`h${level}`)
    heading.appendChild(document.createTextNode(test.title))
    document.body.appendChild(heading)
    return level
}

// use the dom code from zx spectrum!?
function svg() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.style.border = "1px solid #ddd"
    svg.setAttributeNS("", "width", "320")
    svg.setAttributeNS("", "height", "200")
    svg.setAttributeNS("", "viewBox", "0 0 320 200")
    return svg
}

function cross(svg: SVGSVGElement, pt: Point) {
    const cross = document.createElementNS("http://www.w3.org/2000/svg", "path")
    cross.setAttributeNS("", "d", `M ${pt.x} ${pt.y} m -5 -5 l 10 10 m -10 0 l 10 -10`)
    cross.setAttributeNS("", "stroke", "#f00")
    svg.appendChild(cross)
}

function line(svg: SVGSVGElement, a: Point, b: Point) {
    const curve = document.createElementNS("http://www.w3.org/2000/svg", "line")
    curve.setAttributeNS("", "x1", `${a.x}`)
    curve.setAttributeNS("", "y1", `${a.y}`)
    curve.setAttributeNS("", "x2", `${b.x}`)
    curve.setAttributeNS("", "y2", `${b.y}`)
    curve.setAttributeNS("", "stroke", "#00f")
    curve.setAttributeNS("", "fill", "none")
    svg.appendChild(curve)
}

function curve(svg: SVGSVGElement, c: Point[]) {
    const curve = document.createElementNS("http://www.w3.org/2000/svg", "path")
    curve.setAttributeNS("", "d", `M ${c[0].x} ${c[0].y} C ${c[1].x} ${c[1].y} ${c[2].x} ${c[2].y} ${c[3].x} ${c[3].y}`)
    curve.setAttributeNS("", "stroke", "#00f")
    curve.setAttributeNS("", "fill", "none")
    svg.appendChild(curve)
}

function runTest(context: Mocha.Context, pt: Point, c: Point[]) {
    const panel = svg()
    cross(panel, pt)
    curve(panel, c)
    annotate(context, true, panel)
}

function isLeftTest(
    context: Mocha.Context,
    a: Point, b: Point, pt: Point,
    check: (r: number) => boolean
) {
    const panel = svg()
    cross(panel, pt)
    line(panel, a, b)
    const r = check(isLeft(a, b, pt))
    annotate(context, r, panel)
    expect(r).to.be.true
}

describe("geometry", function () {
    describe("isLeft(P0, P1, P2)", function () {
        it(">0 for P2 left of the line through P0 and P1", function () {
            isLeftTest(this,
                { x: 100, y: 20 },
                { x: 150, y: 180 },
                { x: 50, y: 100 },
                (r) => r > 0
            )
        })
        it("=0 for P2  on the line", function () {
            isLeftTest(this,
                { x: 100, y: 20 },
                { x: 150, y: 180 },
                { x: 125, y: 100 },
                (r) => r == 0
            )
        })
        it("<0 for P2  right of the line", function () {
            isLeftTest(this,
                { x: 100, y: 20 },
                { x: 150, y: 180 },
                { x: 200, y: 100 },
                (r) => r < 0
            )
        })
    })
    describe("isLeftCurve", function() {
        it("isLeft", function () {
            runTest(this, 
                {x: 30, y: 50},
                [
                    {x: 100, y: 200},
                    {x: 120, y: 0},
                    {x: 180, y: 0},
                    {x: 200, y: 200},           
                ])
        })
    })
})
