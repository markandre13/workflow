import { expect } from "chai"
import { annotate } from "karma-mocha-html-annotations-reporter"

import * as value from "shared/workflow_value"
import {
    Point, Size, Rectangle
} from "shared/geometry"
import { Path } from "client/paths/Path"

import { WordWrapTestRunner, Placer } from "client/wordwrap/testrunner"
import { WordWrap, Slice, WordSource } from "client/wordwrap/wordwrap"
import { TextSource } from "client/wordwrap/TextSource"
import { Cursor } from "client/wordwrap/Cursor"
import { WordBox } from "client/wordwrap/WordBox"

// FIXME: document attributes
interface WordWrapTest {
    //! if true, execute only this test
    only?: boolean
    //! if true, let the algorithm generate a trace
    trace?: boolean
    //! a title to be shown when rendered
    title?: string
    //! the polygon into which the box is to be placed
    polygon?: Array<Point>

    boxes?: Array<Size>

    //! the box to be placed
    result?: value.Rectangle

    strategy?: Placer
}

type Strategy = (wordwrap: WordWrap, boxes: Array<Size> | undefined, box: Size) => Point | undefined

const wordWrapTest: WordWrapTest[] = [
    {
        title: "pointForBoxInSlices: place 1st box in two stripes",
        strategy: (wordwrap: WordWrap, boxes: Array<Size> | undefined, box: Size): Point | undefined => {
            let [slice, point] = wordwrap.pointForBoxInSlices(box, new Array<Slice>())
            return slice === -1 ? undefined : point
        }
    }, {
        title: "bottom is below slice",
        // only: true,
        // trace: true,
        polygon: [
            { x: 110, y: 20 },
            { x: 300, y: 100 },
            { x: 300, y: 170 },
            { x: 10, y: 170 },
            { x: 120, y: 80 },
        ],
        result: { origin: { x: 120, y: 57.89473684210527 }, size: { width: 80, height: 40 } }
    },
]

function runTest(strategy: Strategy, test: WordWrapTest): SVGElement {
    console.log(`enter run test`)
    let path = new Path()
    for(let point of test.polygon!) {
        if (path.empty())
            path.move(point)
        else
            path.line(point)
    }
    path.close()
    console.log(`path has been created, launching WordWrapTestRunner`)
    const runner = new WordWrapTestRunner("VISUAL-UNIT-TEST", path, test.boxes, test.result!, test.trace == true, strategy)
    console.log(`return result`)
    console.log(runner.svg)
    return runner.svg!
}

// describe("workflow", function() {
describe("wordwrap", function () {
    describe("pointForBoxInSlices: place 1st box in two stripes", function () {
        const strategy = (wordwrap: WordWrap, boxes: Array<Size> | undefined, box: Size): Point | undefined => {
            let [slice, point] = wordwrap.pointForBoxInSlices(box, new Array<Slice>())
            return slice === -1 ? undefined : point
        }
        it("bottom is below slice", function () {
            const svg = runTest(strategy, {
                polygon: [
                    { x: 110, y: 20 },
                    { x: 300, y: 100 },
                    { x: 300, y: 170 },
                    { x: 10, y: 170 },
                    { x: 120, y: 80 },
                ],
                result: { origin: { x: 120, y: 57.89473684210527 }, size: { width: 80, height: 40 } }
            })
            console.log(svg)
            annotate(this, svg)
        })
    }),
        it("works", function () {
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
            svg.style.border = "1px solid #ddd"
            svg.setAttributeNS("", "width", "320")
            svg.setAttributeNS("", "height", "200")
            svg.setAttributeNS("", "viewBox", "0 0 320 200")

            let text = document.createElementNS("http://www.w3.org/2000/svg", "text")
            text.setAttributeNS("", "fill", "#000")
            text.setAttributeNS("", "x", "2")
            text.setAttributeNS("", "y", "20")
            text.appendChild(document.createTextNode("ZACKY BUMM CRASH"))
            svg.appendChild(text)

            annotate(this, svg)

            // const h = new Hello()      
            // annotate(this, "i am the 1st test out of three WAWE")
            // expect(h.speak()).to.equal(4711)
        })
    //         it("fails", function() {
    //             // annotate(this, "i am the 2nd test out of three")
    //             let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    //             svg.style.border = "1px solid #ddd"
    //             svg.setAttributeNS("", "width", "320")
    //             svg.setAttributeNS("", "height", "200")
    //             svg.setAttributeNS("", "viewBox", "0 0 320 200")

    //             let text = document.createElementNS("http://www.w3.org/2000/svg", "text")
    //             text.setAttributeNS("", "fill", "#000")
    //             text.setAttributeNS("", "x", "2")
    //             text.setAttributeNS("", "y", "20")
    //             text.appendChild(document.createTextNode("ZACK BUMM CRASH"))
    //             svg.appendChild(text)

    //             annotate(this, svg)

    //             expect(1).to.equal(2)
    //         })
    //         it("works again", function() {
    //             // annotate(this, "i am the 3rd test out of three")
    //             let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    //             svg.style.border = "1px solid #ddd"
    //             svg.setAttributeNS("", "width", "320")
    //             svg.setAttributeNS("", "height", "200")
    //             svg.setAttributeNS("", "viewBox", "0 0 320 200")

    //             let text = document.createElementNS("http://www.w3.org/2000/svg", "text")
    //             text.setAttributeNS("", "fill", "#000")
    //             text.setAttributeNS("", "x", "2")
    //             text.setAttributeNS("", "y", "20")
    //             text.appendChild(document.createTextNode("ZACK BUMM CRASH"))
    //             svg.appendChild(text)

    //             annotate(this, svg)

    //             expect(2).to.equal(2)
    //         })
    //     })

    //     describe("some other tests", function() {
    //         it("works", function() {
    //         })
    //         it("fails", function() {
    //             expect(1).to.equal(2)
    //         })
    //         it("works again", function() {
    //             expect(2).to.equal(2)
    //         })
})
// })

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
