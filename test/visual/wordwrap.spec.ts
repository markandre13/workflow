import { expect } from "chai"
import { annotate } from "karma-mocha-html-annotations-reporter"

import * as value from "shared/workflow_value"
import {
    Point, Size, Rectangle
} from "shared/geometry"
import { Path } from "client/paths/Path"

import { WordWrapTestRunner, Placer } from "client/wordwrap/testrunner"
import { WordWrap, Slice, WordSource } from "client/wordwrap/wordwrap"
import { WordBox } from "client/wordwrap/WordBox"

import { TextSource } from "client/wordwrap/TextSource"
import { Cursor } from "client/wordwrap/Cursor"

// FIXME: document attributes
interface WordWrapTest {
    //! if true, execute only this test
    only?: boolean
    //! if true, let the algorithm generate a trace
    trace?: boolean
    //! a title to be shown when rendered
    title?: string
    //! the polygon into which the box is to be placed
    polygon: Array<Point>

    boxes?: Array<Size>

    //! the resulting box to be expected
    result: value.Rectangle

    strategy?: Placer
}

type Strategy = (wordwrap: WordWrap, boxes: Array<Size> | undefined, box: Size, svg: SVGElement) => Point | undefined

function runTest(context: Mocha.Context, strategy: Strategy, test: WordWrapTest): void {
    const runner = new WordWrapTestRunner("VISUAL-UNIT-TEST", polygon2path(test.polygon), test.boxes, test.result!, test.trace == true, strategy)
    if (runner.svg)
        annotate(context, runner.svg)
}

describe("wordwrap", function () {
    describe("pointForBoxInSlices: place 1st box in two stripes", function () {
        const strategy = (wordwrap: WordWrap, boxes: Array<Size> | undefined, box: Size): Point | undefined => {
            let [slice, point] = wordwrap.pointForBoxInSlices(box, new Array<Slice>())
            return slice === -1 ? undefined : point
        }
        it("bottom is below slice", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 110, y: 20 },
                    { x: 300, y: 100 },
                    { x: 300, y: 170 },
                    { x: 10, y: 170 },
                    { x: 120, y: 80 },
                ],
                result: {
                    origin: { x: 120, y: 57.89473684210527 },
                    size: { width: 80, height: 40 }
                }
            })
        })
        it("bottom is below slice with intersection", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 110, y: 20 },
                    { x: 300, y: 100 },
                    { x: 300, y: 170 },
                    { x: 170, y: 90 },
                    { x: 10, y: 170 },
                    { x: 120, y: 80 },
                ],
                result: { origin: { x: -1, y: -1 }, size: { width: 80, height: 40 } }
            })
        })
        it("evaluate multiple slices to place box", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 10, y: 80 },
                    { x: 60, y: 50 },
                    { x: 110, y: 40 },
                    { x: 160, y: 50 },
                    { x: 210, y: 80 },
                    { x: 210, y: 190 },
                    { x: 10, y: 190 },
                ],
                result: { origin: { x: 70, y: 48 }, size: { width: 80, height: 40 } }
            })
        })
        it("need move down to place box", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 160, y: 20 },
                    { x: 210, y: 100 },
                    { x: 280, y: 180 },
                    { x: 20, y: 180 },
                    { x: 110, y: 100 },
                ],
                result: { origin: { x: 120, y: 84 }, size: { width: 80, height: 40 } }
            })
        })
        it("box outside corner left", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 200, y: 100 },
                    { x: 20, y: 20 },
                    { x: 100, y: 100 },
                    { x: 80, y: 180 },
                    { x: 280, y: 180 },
                ],
                result: { origin: { x: 100, y: 91.11111111111111 }, size: { width: 80, height: 40 } }
            })
        })
        it("box outside corner right", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 200, y: 100 },
                    { x: 20, y: 20 },
                    { x: 100, y: 100 },
                    { x: 120, y: 180 },
                    { x: 280, y: 180 },
                ],
                result: { origin: { x: 108.75, y: 95 }, size: { width: 80, height: 40 } }
            })
        })
        it("left dent", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 115, y: 100 },
                    { x: 160, y: 20 },
                    { x: 205, y: 100 },
                    { x: 160, y: 180 },
                    { x: 140, y: 180 },
                ],
                result: { origin: { x: -1, y: -1 }, size: { width: 80, height: 40 } }
            })
        })
        it("connected", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 115, y: 100 },
                    { x: 160, y: 20 },
                    { x: 205, y: 100 },
                    { x: 160, y: 180 },
                ],
                result: { origin: { x: -1, y: -1 }, size: { width: 80, height: 40 } }
            })
        })
        it("narrow/open/left&right/inside", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 110, y: 180 },
                    { x: 160, y: 20 },
                    { x: 210, y: 180 },
                ],
                result: { origin: { x: -1, y: -1 }, size: { width: 80, height: 40 } }
            })
        })
        it("narrow/open/right", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 10, y: 20 },
                    { x: 310, y: 180 },
                    { x: 170, y: 180 },
                ],
                result: { origin: { x: -1, y: -1 }, size: { width: 80, height: 40 } }
            })
        })
        it("narrow/open/left", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 310, y: 20 },
                    { x: 150, y: 180 },
                    { x: 10, y: 180 },
                ],
                result: { origin: { x: -1, y: -1 }, size: { width: 80, height: 40 } }
            })
        })
        it("edge/open/left&right/inside", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 70, y: 180 },
                    { x: 160, y: 20 },
                    { x: 250, y: 180 },
                ],
                result: { origin: { x: 120, y: 91.11111111111111 }, size: { width: 80, height: 40 } }
            })
        })
        it("median/open/right", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 10, y: 20 },
                    { x: 30, y: 20 },
                    { x: 310, y: 180 },
                    { x: 100, y: 180 },
                ],
                result: { origin: { x: 71.57894736842104, y: 89.47368421052632 }, size: { width: 80, height: 40 } }
            })
        })
        it("median/open/left", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 290, y: 20 },
                    { x: 310, y: 20 },
                    { x: 220, y: 180 },
                    { x: 10, y: 180 },
                ],
                result: { origin: { x: 168.42105263157896, y: 89.4736842105263 }, size: { width: 80, height: 40 } }
            })
        })
        it("wide/open/left&right/wide", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 70, y: 180 },
                    { x: 110, y: 20 },
                    { x: 210, y: 20 },
                    { x: 250, y: 180 },
                ],
                result: { origin: { x: 110, y: 20 }, size: { width: 80, height: 40 } }
            })
        })
        it("wide/open/right", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 10, y: 20 },
                    { x: 120, y: 20 },
                    { x: 310, y: 180 },
                    { x: 100, y: 180 },
                ],
                result: { origin: { x: 32.5, y: 20 }, size: { width: 80, height: 40 } }
            })
        })
        it("wide/open/left", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 200, y: 20 },
                    { x: 310, y: 20 },
                    { x: 220, y: 180 },
                    { x: 10, y: 180 },
                ],
                result: { origin: { x: 200, y: 20 }, size: { width: 80, height: 40 } }
            })
        })
        it("2nd slice", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 110, y: 20 },
                    { x: 210, y: 20 },
                    { x: 310, y: 180 },
                    { x: 170, y: 180 },
                    { x: 160, y: 50 },
                    { x: 90, y: 180 },
                    { x: 10, y: 180 },
                ],
                result: { origin: { x: 165.08771929824562, y: 76.14035087719299 }, size: { width: 80, height: 40 } }
            })
        })
        it("2nd slice with down spike", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 110, y: 20 },
                    { x: 190, y: 20 },
                    { x: 200, y: 90 },
                    { x: 210, y: 20 },
                    { x: 310, y: 180 },
                    { x: 170, y: 180 },
                    { x: 160, y: 50 },
                    { x: 90, y: 180 },
                    { x: 10, y: 180 },
                ],
                result: { origin: { x: 166.15384615384616, y: 90 }, size: { width: 80, height: 40 } }
            })
        })
        it("1st slice", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 110, y: 20 },
                    { x: 210, y: 20 },
                    { x: 310, y: 180 },
                    { x: 170, y: 180 },
                    { x: 160, y: 50 },
                    { x: 150, y: 180 },
                    { x: 10, y: 180 },
                ],
                result: { origin: { x: 74.91228070175438, y: 76.14035087719299 }, size: { width: 80, height: 40 } }
            })
        })
    })
    describe("placeWordBoxes()", function () {
        const strategy = (wordwrap: WordWrap, boxes: Array<Size> | undefined, box: Size, svg: SVGElement): Point | undefined => {
            wordwrap.trace = true
            let boxSource = new IteratingBoxSource()
            wordwrap.placeWordBoxes(boxSource)

            // add result to SVG
            for (let r of boxSource.wordBoxes) {
                let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
                rect.setAttributeNS("", "stroke", "#aaa")
                rect.setAttributeNS("", "fill", "none")
                rect.setAttributeNS("", "x", String(r.origin.x))
                rect.setAttributeNS("", "width", String(r.size.width))
                rect.setAttributeNS("", "y", String(r.origin.y))
                rect.setAttributeNS("", "height", String(r.size.height))
                svg.appendChild(rect)
            }

            if (boxSource.wordBoxes.length === 0)
                return undefined
            return boxSource.wordBoxes[boxSource.wordBoxes.length - 1].origin
        }
        
        it("wordwrap 001", function () {
            runTest(this, strategy, {
                trace: true,
                polygon: [
                    { x: 110, y: 20 },
                    { x: 310, y: 100 },
                    { x: 280, y: 190 },
                    { x: 100, y: 100 },
                    { x: 40, y: 190 },
                    { x: 10, y: 80 },
                ],
                result: { origin: { x: 239.2, y: 149.6 }, size: { width: 40, height: 20 } }
            })
        })
        it("wordwrap 002", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 20, y: 10 },
                    { x: 190, y: 50 },
                    { x: 310, y: 10 },
                    { x: 280, y: 190 },
                    { x: 100, y: 100 },
                    { x: 40, y: 190 },
                    { x: 10, y: 80 },
                ],
                result: { origin: { x: 258.2113821138212, y: 139.1056910569106 }, size: { width: 20, height: 20 } }
            })
        })
    })
    describe("Regression Tests", function () {
        const strategy = (wordwrap: WordWrap, boxes: Array<Size> | undefined, box: Size, svg: SVGElement): Point | undefined => {
            // wordwrap.trace = false
            let boxSource = new BoxSource(boxes!)
            wordwrap.placeWordBoxes(boxSource)

            for (let r of boxSource.wordBoxes) {
                // console.log(r)
                let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
                rect.setAttributeNS("", "stroke", "#aaa")
                rect.setAttributeNS("", "fill", "none")
                rect.setAttributeNS("", "x", String(r.origin.x))
                rect.setAttributeNS("", "width", String(r.size.width))
                rect.setAttributeNS("", "y", String(r.origin.y))
                rect.setAttributeNS("", "height", String(r.size.height))
                svg.appendChild(rect)
            }

            if (boxSource.wordBoxes.length === 0)
                return undefined
            console.log(boxSource.wordBoxes[boxSource.wordBoxes.length - 1])
            return boxSource.wordBoxes[boxSource.wordBoxes.length - 1].origin
        }
        it("placeWordBoxes() rounding error box.width & horizontal width", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 20, y: 10 },
                    { x: 190, y: 50 },
                    { x: 310, y: 10 },
                    { x: 280, y: 190 },
                    { x: 100, y: 100 },
                    { x: 40, y: 190 },
                    { x: 10, y: 80 },
                ],
                boxes: [{ width: 33.685546875, height: 13.953125 }],
                result: { origin: { x: 18.90453506097561, y: 17.66825457317073 }, size: { width: 33.685546875, height: 13.953125 } }
            })
        })
        it("placeWordBoxes() used slice data as cursor and modified it", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 20, y: 10 },
                    { x: 190, y: 50 },
                    { x: 310, y: 10 },
                    { x: 280, y: 190 },
                    { x: 100, y: 100 },
                    { x: 40, y: 190 },
                    { x: 10, y: 80 },
                ],
                boxes: [{ width: 110.44158363342285, height: 16.171875 }, { width: 40.69293403625488, height: 16.171875 }, { width: 36.3858699798584, height: 16.171875 }, { width: 19.307065963745117, height: 16.171875 }, { width: 41.26358985900879, height: 16.171875 }, { width: 77.88723182678223, height: 16.171875 }],
                result: { origin: { x: 11.975446428571429, y: 66.171875 }, size: { height: 16.171875, width: 77.88723182678223 } }
            })
        })
    })
    describe("render real text", function () {
        const strategy = (wordwrap: WordWrap, boxes: Array<Size> | undefined, box: Size, svg: SVGElement): Point | undefined => {
            // wordwrap.trace = false
            let textSource = new TextSource()

            textSource.initializeWordBoxes(svg)
            // let s = ""
            // for (let x of textSource.rectangles)
            // s=`${s}, {width: ${x.size.width}, height: ${x.size.height}}`
            // console.log(s)
            wordwrap.placeWordBoxes(textSource)
            textSource.displayWordBoxes()
            new Cursor(svg, wordwrap, textSource)

            return new Point(0, 0)
            // if (boxes.rectangles.length === 0)
            //     return undefined
            // return boxes.rectangles[boxes.rectangles.length-1].origin
        }
        it("real text", function () {
            runTest(this, strategy, {
                polygon: [
                    { x: 20, y: 10 },
                    { x: 190, y: 50 },
                    { x: 310, y: 10 },
                    { x: 280, y: 190 },
                    { x: 100, y: 100 },
                    { x: 40, y: 190 },
                    { x: 10, y: 80 },
                ],
                result: { origin: { x: 0, y: 0 }, size: { width: 20, height: 20 } }
            })
        })
    })
})

function polygon2path(polygon: Point[]): Path {
    const path = new Path()
    for (let point of polygon!) {
        if (path.empty())
            path.move(point)
        else
            path.line(point)
    }
    path.close()
    return path
}

class BoxSource implements WordSource {
    current: number
    boxes: Array<Size>
    wordBoxes: Array<WordBox>

    constructor(boxes: Array<Size>) {
        this.boxes = boxes
        this.current = 0
        this.wordBoxes = new Array<WordBox>()
    }

    reset(): void {
        this.current = 0
    }

    pullBox(): Size | undefined {
        if (this.current >= this.boxes.length)
            return undefined
        return this.boxes[this.current]
    }

    placeBox(origin: Point): void {
        let rectangle = new WordBox(this.boxes[this.current].width, this.boxes[this.current].height, "")
        rectangle.origin.x = origin.x
        rectangle.origin.y = origin.y
        this.wordBoxes.push(rectangle)
        this.current++
    }

    endOfSlice(): void { }
    endOfLine(): void { }
    endOfWrap(): void { }
}

// provide a sequence of boxes iterating between (20, 20) and (40, 20)
class IteratingBoxSource implements WordSource {
    remaining: number
    style: boolean
    box?: Size
    wordBoxes: Array<Rectangle>

    constructor(remaining = 4096) {
        this.remaining = remaining
        this.style = true
        this.wordBoxes = new Array<Rectangle>()
    }

    reset(): void { }

    pullBox(): Size | undefined {
        if (this.remaining === 0)
            return undefined
        --this.remaining
        this.box = new Size(this.style ? 40 : 20, 20)
        this.style = !this.style
        return this.box
    }

    placeBox(origin: Point): void {
        let rectangle = new Rectangle(origin, this.box!)
        this.wordBoxes.push(rectangle)
    }

    endOfSlice(): void { }
    endOfLine(): void { }
    endOfWrap(): void { }
}
