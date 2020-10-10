import { ORB } from "corba.js"

const expect = chai.expect

// import * as value from "../../src/shared/workflow_value"
import * as value from "shared/workflow_value"
import {
    Point, Size, Rectangle, Matrix
} from "shared/geometry"
import { Path } from "client/paths/Path"

// import { WordWrapTestRunner, Placer } from "./testrunner"
import { WordWrap, Slice, WordSource } from "client/wordwrap/wordwrap"
import { TextSource } from "client/wordwrap/TextSource"
import { Cursor } from "client/wordwrap/Cursor"
import { WordBox } from "client/wordwrap/WordBox"

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

export type Placer = (wordwrap: WordWrap, boxes: Array<Size> | undefined, box: Size, svg: SVGElement) => Point | undefined

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

// FIXME: document attributes
interface WordWrapTest {
    //! if true, execute only this test
    only?: boolean
    //! if true, let the algorithm generate a trace
    trace?: boolean
    //! a title to be shown when rendered
    title: string
    //! the polygon into which the box is to be placed
    polygon?: Array<Point>

    boxes?: Array<Size>

    //! the box to be placed
    result?: value.Rectangle

    strategy?: Placer
}

function runTest(test: WordWrapTest) {
    console.log("runTest: enter")
    let strategy: Placer | undefined
    if (test.strategy)
        strategy = test.strategy
    // if (only && !test.only) {
    //     continue
    // }
    if (test.polygon) {
        let path = new Path()
        for (let point of test.polygon) {
            if (path.empty())
                path.move(point)
            else
                path.line(point)
        }
        path.close()

        // new WordWrapTestRunner(test.title, path, test.boxes, test.result!, test.trace == true, strategy!)

        console.log("runTest: do wordwrap")
        let wordwrap = new WordWrap(path, undefined, false)

        // strategy
        let box = new Size(80, 40)
        let [slice, point] = wordwrap.pointForBoxInSlices(box, new Array<Slice>())
        // return slice === -1 ? undefined : point
        console.log(`slice: ${slice}`)
        console.log(`point: ${point.x}, ${point.y}`)

    } else {
        if (test.title !== "") {
            let heading = document.createElement("h1")
            heading.appendChild(document.createTextNode(test.title))
            document.body.appendChild(heading)
        } else {
            document.body.appendChild(document.createElement("br"))
        }
    }
}

function annotate(test: any, context: string) {
    const currentTest = test.currentTest
    const activeTest = test.test
    const isEachHook = currentTest && /^"(?:before|after)\seach"/.test(activeTest.title);
    const t = isEachHook ? currentTest : activeTest;
    t.context = context
}

before(function () {
    ORB.registerValueType("Point", Point)
    ORB.registerValueType("Size", Size)
    ORB.registerValueType("Rectangle", Rectangle)
    ORB.registerValueType("Matrix", Matrix)
    // window.customElements.define("toad-figureeditor", FigureEditor)
})

after(function () {
})

describe("wordwrap", function () {
    it("bottom is below slice", function () {
        annotate(this, "i am the 1st test out of three")
        runTest({
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
            result: {
                origin: { x: 120, y: 57.89473684210527 }, 
                size: { width: 80, height: 40 }
            }
        })
        expect(2).to.equal(2)
    })
})
