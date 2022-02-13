import { expect } from '@esm-bundle/chai'
import { isLeft, intersectCurveX, pointInPath } from "shared/geometry/pointInPolygon"
import { Point } from "shared/geometry/Point"
import { Path } from "client/paths/Path"

describe("geometry", function () {
    describe("pointInPath(path: Path, pt: Point): boolean", function () {
        comment(this, `
            <p>
                Return <em>true</em> when <em>pt</em> is within <em>path</em>.
            </p><p>
                The implementation is based on the winding number algorithm from
                <em>Sunday, Daniel 2021, Practical Geometry Algorithms with C++ Code, Amazon KDP</em>
                and extended to handle curves.
            </p>
        `)
        describe("open square", function () {
            comment(this, `
                When the path is not closed, a straight line is assumed between the first and the last point.
            `)
            it("left -> outside", function () {
                expect(
                    pointInPathTest(this,
                        false,
                        { x: 60, y: 100 },
                        new Path()
                            .move(110, 50)
                            .line(210, 50)
                            .line(210, 150)
                            .line(110, 150))
                ).to.be.true
            })
            it("center -> inside", function () {
                expect(
                    pointInPathTest(this,
                        true,
                        { x: 160, y: 100 },
                        new Path()
                            .move(110, 50)
                            .line(210, 50)
                            .line(210, 150)
                            .line(110, 150))
                ).to.be.true
            })
        })
        describe("closed square", function () {
            comment(this, `
                This should cover the standard cases for pure line paths.
            `)
            it("center -> inside", function () {
                expect(
                    pointInPathTest(this,
                        true,
                        { x: 160, y: 100 },
                        new Path()
                            .move(110, 50)
                            .line(210, 50)
                            .line(210, 150)
                            .line(110, 150)
                            .close())
                ).to.be.true
            })
            it("left -> outside", function () {
                expect(
                    pointInPathTest(this,
                        false,
                        { x: 60, y: 100 },
                        new Path()
                            .move(110, 50)
                            .line(210, 50)
                            .line(210, 150)
                            .line(110, 150)
                            .close())
                ).to.be.true
            })
            it("right -> outside", function () {
                expect(
                    pointInPathTest(this,
                        false,
                        { x: 260, y: 100 },
                        new Path()
                            .move(110, 50)
                            .line(210, 50)
                            .line(210, 150)
                            .line(110, 150)
                            .close())
                ).to.be.true
            })
            it("top -> outside", function () {
                expect(
                    pointInPathTest(this,
                        false,
                        { x: 160, y: 20 },
                        new Path()
                            .move(110, 50)
                            .line(210, 50)
                            .line(210, 150)
                            .line(110, 150)
                            .close())
                ).to.be.true
            })
            it("bottom -> outside", function () {
                expect(
                    pointInPathTest(this,
                        false,
                        { x: 160, y: 180 },
                        new Path()
                            .move(110, 50)
                            .line(210, 50)
                            .line(210, 150)
                            .line(110, 150)
                            .close())
                ).to.be.true
            })
        })
        describe("on horizontal line", function () {
            comment(this, `
                As the algorithm works with an horizontal scan line,
                encountering horizontal lines on the path may contain
                corner cases.
            `)
            describe("square", function () {
                it("left -> outside", function () {
                    expect(
                        pointInPathTest(this,
                            false,
                            { x: 30, y: 50 },
                            new Path()
                                .move(110, 50)
                                .line(210, 50)
                                .line(210, 150)
                                .line(110, 150)
                                .close())
                    ).to.be.true
                })
                it("middle -> outside", function () {
                    expect(
                        pointInPathTest(this,
                            true,
                            { x: 160, y: 50 },
                            new Path()
                                .move(110, 50)
                                .line(210, 50)
                                .line(210, 150)
                                .line(110, 150)
                                .close())
                    ).to.be.true
                })
            })
            describe("u shape", function () {
                it("left -> outside", function () {
                    expect(
                        pointInPathTest(this,
                            false,
                            { x: 60, y: 50 },
                            uShape())
                    ).to.be.true
                })

                it("middle of left -> outside", function () {
                    expect(
                        pointInPathTest(this,
                            true,
                            { x: 125, y: 50 },
                            uShape())
                    ).to.be.true
                })

                it("middle -> outside", function () {
                    expect(
                        pointInPathTest(this,
                            false,
                            { x: 160, y: 50 },
                            uShape())
                    ).to.be.true
                })
            })
            describe("open curve", function () {
                describe("one intersection", function () {
                    it("middle -> outside", function () {
                        expect(
                            pointInPathTest(this,
                                false,
                                { x: 60, y: 100 },
                                new Path()
                                    .move(210, 150)
                                    .curve(60, 130,
                                        260, 80,
                                        110, 50))
                        ).to.be.true
                    })
                    it("left -> outside", function () {
                        expect(
                            pointInPathTest(this,
                                false,
                                { x: 60, y: 80 },
                                new Path()
                                    .move(210, 150)
                                    .curve(60, 130,
                                        260, 80,
                                        110, 50))
                        ).to.be.true
                    })
                    it("left -> inside", function () {
                        expect(
                            pointInPathTest(this,
                                true,
                                { x: 150, y: 80 },
                                new Path()
                                    .move(210, 150)
                                    .curve(60, 130,
                                        260, 80,
                                        110, 50))
                        ).to.be.true
                    })
                    it("right -> outside", function () {
                        expect(
                            pointInPathTest(this,
                                false,
                                { x: 180, y: 80 },
                                new Path()
                                    .move(210, 150)
                                    .curve(60, 130,
                                        260, 80,
                                        110, 50))
                        ).to.be.true
                    })
                })
                describe("two intersections", function () {
                    it("left -> outside", function () {
                        expect(
                            pointInPathTest(this,
                                false,
                                { x: 60, y: 100 },
                                new Path()
                                    .move(110, 150)
                                    .curve(130, 50,
                                        190, 50,
                                        210, 150))
                        ).to.be.true
                    })
                    it("center -> inside", function () {
                        expect(
                            pointInPathTest(this,
                                true,
                                { x: 160, y: 100 },
                                new Path()
                                    .move(110, 150)
                                    .curve(130, 50,
                                        190, 50,
                                        210, 150))
                        ).to.be.true
                    })
                })
                describe("three intersections", function () {
                    it("1", function () {
                        expect(
                            pointInPathTest(this,
                                false,
                                { x: 60, y: 80 },
                                new Path()
                                    .move(100, 200)
                                    .curve(120, -200,
                                        180, 400,
                                        200, 0))
                        ).to.be.true
                    })
                    it("2", function () {
                        expect(
                            pointInPathTest(this,
                                true,
                                { x: 125, y: 80 },
                                new Path()
                                    .move(100, 200)
                                    .curve(120, -200,
                                        180, 400,
                                        200, 0))
                        ).to.be.true
                    })
                    it("3", function () {
                        expect(
                            pointInPathTest(this,
                                false,
                                { x: 150, y: 80 },
                                new Path()
                                    .move(100, 200)
                                    .curve(120, -200,
                                        180, 400,
                                        200, 0))
                        ).to.be.true
                    })
                    it("4", function () {
                        expect(
                            pointInPathTest(this,
                                true,
                                { x: 180, y: 80 },
                                new Path()
                                    .move(100, 200)
                                    .curve(120, -200,
                                        180, 400,
                                        200, 0))
                        ).to.be.true
                    })
                    it("5", function () {
                        expect(
                            pointInPathTest(this,
                                false,
                                { x: 260, y: 80 },
                                new Path()
                                    .move(100, 200)
                                    .curve(120, -200,
                                        180, 400,
                                        200, 0))
                        ).to.be.true
                    })
                })
            })
        })
    })
    describe("isLeft(P0, P1, P2)", function () {
        comment(this, `
            Used to determine the winding number for lines.
        `)
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
    describe("intersectCurveX", function () {
        comment(this, `
            <p>
                Used to determine the winding number for curves.
            </p><p>
                This calculates the intersections of a curve with a horizontal
                line and returns for each intersection
                
                <ul>
                    <li>
                        <em>x</em> to determine whether the intersection is left or right of a point and
                    </li><li>
                        <em>dy</em> to determine whether the curve at the intersection
                        goes up- or downward.
                    </li>
                </ul>
            </p><p>
                Compared to <em>isLeft()</em> this method is rather expensive.
            </p>
        `)
        it("one intersection", function () {
            intersectCurveXTest(this, [
                { x: 100, y: 20 },
                { x: 100, y: 50 },
                { x: 200, y: 150 },
                { x: 200, y: 180 },
            ], 100)
        })
        it("one intersection 2", function () {
            intersectCurveXTest(this, [
                { x: 100, y: 20 },
                { x: 100, y: 20 },
                { x: 100, y: 200 },
                { x: 100, y: 200 },
            ], 100)
        })
        it("two intersections forward", function () {
            intersectCurveXTest(this, [
                { x: 100, y: 180 },
                { x: 120, y: 20 },
                { x: 180, y: 30 },
                { x: 200, y: 170 },
            ], 100)
        })
        it("two intersections backward", function () {
            intersectCurveXTest(this, [
                { x: 200, y: 170 },
                { x: 180, y: 30 },
                { x: 120, y: 20 },               
                { x: 100, y: 180 },
            ], 100)
        })
        it("three intersections", function () {
            intersectCurveXTest(this, [
                { x: 100, y: 180 },
                { x: 120, y: -200 },
                { x: 180, y: 400 },
                { x: 200, y: 20 },
            ], 100)
        })
        it("same line", function () {
            intersectCurveXTest(this, [
                { x: 20, y: 100 },
                { x: 100, y: 100 },
                { x: 220, y: 100 },
                { x: 300, y: 100 },
            ], 100)
        })
    })
})

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

function comment(context: Mocha.Suite, comment: string) {
    (context as any).comment = comment
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

    if ((test as any).comment) {
        const paragraph = document.createElement("div")
        paragraph.innerHTML = (test as any).comment
        document.body.appendChild(paragraph)
    }

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
    cross.setAttributeNS("", "stroke", "#00f")
    svg.appendChild(cross)
}

function line(svg: SVGSVGElement, a: Point, b: Point, stroke = "#333") {
    const curve = document.createElementNS("http://www.w3.org/2000/svg", "line")
    curve.setAttributeNS("", "x1", `${a.x}`)
    curve.setAttributeNS("", "y1", `${a.y}`)
    curve.setAttributeNS("", "x2", `${b.x}`)
    curve.setAttributeNS("", "y2", `${b.y}`)
    curve.setAttributeNS("", "stroke", stroke)
    curve.setAttributeNS("", "fill", "none")
    svg.appendChild(curve)
}

function curve(svg: SVGSVGElement, c: Point[]) {
    const curve = document.createElementNS("http://www.w3.org/2000/svg", "path")
    curve.setAttributeNS("", "d", `M ${c[0].x} ${c[0].y} C ${c[1].x} ${c[1].y} ${c[2].x} ${c[2].y} ${c[3].x} ${c[3].y}`)
    curve.setAttributeNS("", "stroke", "#333")
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

function intersectCurveXTest(
    context: Mocha.Context,
    c: Point[],
    y: number
) {
    const r = intersectCurveX(c, y)
    const panel = svg()
    curve(panel, c)
    for (let x of r) {
        const p0 = { x: x.x, y }
        cross(panel, { x: x.x, y })
        line(panel, p0, {x: x.x + 10 * Math.sign(c[3].x - c[0].x), y: y+x.dy*0.1}, "#080")
    }
    annotate(context, true, panel)
}

function pointInPathTest(
    context: Mocha.Context,
    expectIsInside: boolean,
    pt: Point,
    path: Path) {
    const panel = svg()
    panel.appendChild(path.createSVG("#000", 1, "#ddd"))
    cross(panel, pt)
    const isInside = pointInPath(path, pt)
    annotate(context, isInside === expectIsInside, panel)
    return isInside === expectIsInside
}

function uShape() {
    return new Path()
        .move(110, 50)
        .line(140, 50)
        .line(140, 100)
        .line(180, 100)
        .line(180, 50)
        .line(210, 50)
        .line(210, 150)
        .line(110, 150)
        .close()
}