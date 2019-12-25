/*
 *  workflow - A collaborative real-time white- and kanban board
 *  Copyright (C) 2018 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as value from "../../shared/workflow_value"
import {
    Point, Size, Rectangle
} from "../../shared/geometry"
import { Path } from "../paths/Path"

import { WordWrapTestRunner, Placer } from "./testrunner"
import { WordWrap, Slice, WordSource } from "./wordwrap"
import { TextSource } from "./TextSource"
import { Cursor } from "./Cursor"
import { Word } from "./Word"

class BoxSource implements WordSource {
    current: number
    boxes: Array<Size>
    rectangles: Array<Word>
    
    constructor(boxes: Array<Size>) {
        this.boxes = boxes
        this.current = 0
        this.rectangles = new Array<Word>()
    }

    pullBox(): Size|undefined {
        if (this.current >= this.boxes.length)
            return undefined
        return this.boxes[this.current]
    }

    placeBox(origin: Point): void {
        let rectangle = new Word(this.boxes[this.current].width, this.boxes[this.current].height, "")
        rectangle.origin.x = origin.x
        rectangle.origin.y = origin.y
        this.rectangles.push(rectangle)
        this.current++
    }

    endOfSlice(): void {}
    endOfLine(): void {}
    endOfWrap(): void {}
}

class IteratingBoxSource implements WordSource {
    remaining: number
    style: boolean
    box?: Size
    rectangles: Array<Rectangle>
    
    constructor(remaining = 4096) {
        this.remaining = remaining
        this.style = true
        this.rectangles = new Array<Rectangle>()
    }

    pullBox(): Size|undefined {
        if (this.remaining === 0)
            return undefined
        --this.remaining
        this.box = new Size(this.style ? 40 : 20, 20)
        this.style = !this.style
        return this.box
    }

    placeBox(origin: Point): void {
        let rectangle = new Rectangle(origin, this.box!)
        this.rectangles.push(rectangle)
    }

    endOfSlice(): void {}
    endOfLine(): void {}
    endOfWrap(): void {}
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

// draw the expected box and the result
// mark image when test failed to execute
// line breaks, headings
// middle mouse, dump test data for copy'n pasting it back?

const wordWrapTest: WordWrapTest[] = [
/*
{
    title: "pointForBoxInCorner: place 1st box in a single stripe",
    strategy: (wordwrap: WordWrap, box: Size): Point|undefined => {
        let slices = new Array<Slice>()
        wordwrap.extendSlices(new Point(0,0), box, slices)
        if (slices.length === 0) {
            console.log("no slices")
            console.log(wordwrap)
        }        
        wordwrap.levelSlicesHorizontally(slices)
        let slice = slices[0]
        let index = 0
        return wordwrap.pointForBoxInCorner(box, slice.left[index], slice.right[index])
    }
},
{
    title: "wide/edge/right",
    polygon: [
        {x:  10, y:  20},
        {x: 310, y: 180},
        {x: 100, y: 180},
    ],
    box: { origin: { x: 76.42857142857144, y: 98.09523809523812 }, size: { width: 80, height: 40 } }
}, {
    title: "wide/edge/left",
    polygon: [
        {x: 310, y:  20},
        {x: 220, y: 180},
        {x:  10, y: 180},
    ],
    box: { origin: { x: 163.57142857142858, y: 98.09523809523807 }, size: { width: 80, height: 40 } }
}, {
    title: "wide/narrow/left&right",
    polygon: [
        {x:  70, y: 180},
        {x: 150, y:  20},
        {x: 170, y:  20},
        {x: 250, y: 180},
    ],
    box: { origin: { x: 120, y: 80 }, size: { width: 80, height: 40 } }
}, { title: "" }, {
    title: "wide/open/right",
    polygon: [
        {x:  10, y:  20},
        {x: 120, y:  20},
        {x: 310, y: 180},
        {x: 100, y: 180},
    ],
    box: { origin: { x: 32.5, y: 20 }, size: { width: 80, height: 40 } }
}, {
    title: "wide/open/left",
    polygon: [
        {x: 200, y:  20},
        {x: 310, y:  20},
        {x: 220, y: 180},
        {x:  10, y: 180},
    ],
    box: { origin: { x: 200, y: 20 }, size: { width: 80, height: 40 } }
}, {
    title: "wide/open/left&right/wide",
    polygon: [
        {x:  70, y: 180},
        {x: 110, y:  20},
        {x: 210, y:  20},
        {x: 250, y: 180},
    ],
    box: { origin: { x: 110, y: 20 }, size: { width: 80, height: 40 } }
}, { title: "" }, {
    title: "narrow top&bottom/open/left&right",
    polygon: [
        {x: 150, y:  20},
        {x: 170, y:  20},
        {x: 190, y: 180},
        {x: 130, y: 180},
    ],
    box: { origin: { x: -1, y: -1 }, size: { width: 80, height: 40 } }
}, {
    title: "narrow top/open/left&right",
    polygon: [
        {x: 160-10,    y:  20},
        {x: 160+10,    y:  20},
        {x: 160+10+40, y: 120},
        {x: 160-10-40, y: 120},
    ],
    box: { origin: { x: -1, y: -1 }, size: { width: 80, height: 40 } }
}, {
    title: "narrow bottom/open/left&right",
    polygon: [
        {x: 160-10-40, y:  20},
        {x: 160+10+40, y:  20},
        {x: 160+10,    y: 120},
        {x: 160-10,    y: 120},
    ],
    box: { origin: { x: -1, y: -1 }, size: { width: 80, height: 40 } }
}, { title: "" }, {
    title: "bottom is below slice",
    polygon: [
        {x: 110, y:  20},
        {x: 257, y:  80},
        {x: 297, y: 170},
        {x:  65, y: 170},
        {x: 120, y:  70},
    ],
    box: { origin: { x: -1, y: -1 }, size: { width: 80, height: 40 } }
}, {
    title: "wide top but not enough/open/right",
    polygon: [
        {x:  10, y:  20},
        {x: 101, y:  20},
        {x: 310, y: 180},
        {x: 100, y: 180},
    ],
    box: { origin: { x: 41.19747899159664, y: 35.46218487394958 }, size: { width: 80, height: 40 } }
}, {
    title: "wide top but not enough/open/left",
    polygon: [
        {x: 200, y:  20},
        {x: 285, y:  20},
        {x: 220, y: 180},
        {x:  10, y: 180},
    ],
    box: { origin: { x: 182.89999999999998, y: 34.39999999999999 }, size: { width: 80, height: 40 } }
},*/ { 
    title: "pointForBoxInSlices: place 1st box in two stripes",
    strategy: (wordwrap: WordWrap, boxes: Array<Size>|undefined, box: Size): Point|undefined => {
        let [slice, point] = wordwrap.pointForBoxInSlices(box, new Array<Slice>())
        return slice === -1 ? undefined : point
    }
}, {
    title: "bottom is below slice",
    // only: true,
    // trace: true,
    polygon: [
        {x: 110, y:  20},
        {x: 300, y: 100},
        {x: 300, y: 170},
        {x:  10, y: 170},
        {x: 120, y:  80},
    ],
    result: { origin: { x: 120, y: 57.89473684210527 }, size: { width: 80, height: 40 } }
}, {
    title: "bottom is below slice with intersection",
    polygon: [
        {x: 110, y:  20},
        {x: 300, y: 100},
        {x: 300, y: 170},
        {x: 170, y:  90},
        {x:  10, y: 170},
        {x: 120, y:  80},
    ],
    result: { origin: { x: -1, y: -1 }, size: { width: 80, height: 40 } }
}, {
    title: "evaluate multiple slices to place box",
    polygon: [
        {x: 10, y:  80},
        {x: 60, y:  50},
        {x: 110, y: 40},
        {x: 160, y: 50},
        {x: 210, y: 80},
        {x: 210, y: 190},
        {x:  10, y: 190},
    ],
    result: { origin: { x: 70, y: 48 }, size: { width: 80, height: 40 } }
} , {
    title: "need move down to place box",
    polygon: [
        {x: 160, y:  20},
        {x: 210, y: 100},
        {x: 280, y: 180},
        {x:  20, y: 180},
        {x: 110, y: 100},
    ],
    result: { origin: { x: 120, y: 84 }, size: { width: 80, height: 40 } }
}, {
    title: "box outside corner left",
    polygon: [
        {x: 200, y: 100},
        {x:  20, y:  20},
        {x: 100, y: 100},
        {x:  80, y: 180},
        {x: 280, y: 180},
    ],
    result: { origin: { x: 100, y: 91.11111111111111 }, size: { width: 80, height: 40 } }
}, {
    title: "box outside corner right",
    polygon: [
        {x: 200, y: 100},
        {x:  20, y:  20},
        {x: 100, y: 100},
        {x: 120, y: 180},
        {x: 280, y: 180},
    ],
    result: { origin: { x: 108.75, y: 95 }, size: { width: 80, height: 40 } }
}, {
    title: "left dent",
    polygon: [
        {x: 115, y: 100},
        {x: 160, y:  20},
        {x: 205, y: 100},
        {x: 160, y: 180},
        {x: 140, y: 180},
    ],
    result: { origin: { x: -1, y: -1 }, size: { width: 80, height: 40 } }
}, {
    title: "connected",
    polygon: [
        {x: 115, y: 100},
        {x: 160, y:  20},
        {x: 205, y: 100},
        {x: 160, y: 180},
    ],
    result: { origin: { x: -1, y: -1 }, size: { width: 80, height: 40 } }
}, {
    title: "narrow/open/left&right/inside",
    polygon: [
        {x: 110, y: 180},
        {x: 160, y:  20},
        {x: 210, y: 180},
    ],
    result: { origin: { x: -1, y: -1 }, size: { width: 80, height: 40 } }
}, {
    title: "narrow/open/right",
    polygon: [
        {x:  10, y:  20},
        {x: 310, y: 180},
        {x: 170, y: 180},
    ],
    result: { origin: { x: -1, y: -1 }, size: { width: 80, height: 40 } }
}, {
    title: "narrow/open/left",
    polygon: [
        {x: 310, y:  20},
        {x: 150, y: 180},
        {x:  10, y: 180},
    ],
    result: { origin: { x: -1, y: -1 }, size: { width: 80, height: 40 } }
}, {
    title: "edge/open/left&right/inside",
    polygon: [
        {x:  70, y: 180},
        {x: 160, y:  20},
        {x: 250, y: 180},
    ],
    result: { origin: { x: 120, y: 91.11111111111111 }, size: { width: 80, height: 40 } }
}, {
    title: "median/open/right",
    polygon: [
        {x:  10, y:  20},
        {x:  30, y:  20},
        {x: 310, y: 180},
        {x: 100, y: 180},
    ],
    result: { origin: { x: 71.57894736842104, y: 89.47368421052632 }, size: { width: 80, height: 40 } }
}, {
    title: "median/open/left",
    polygon: [
        {x: 290, y:  20},
        {x: 310, y:  20},
        {x: 220, y: 180},
        {x:  10, y: 180},
    ],
    result: { origin: { x: 168.42105263157896, y: 89.4736842105263 }, size: { width: 80, height: 40 } }
}, {
    title: "wide/open/left&right/wide",
    polygon: [
        {x:  70, y: 180},
        {x: 110, y:  20},
        {x: 210, y:  20},
        {x: 250, y: 180},
    ],
    result: { origin: { x: 110, y: 20 }, size: { width: 80, height: 40 } }
}, {
    title: "wide/open/right",
    polygon: [
        {x:  10, y:  20},
        {x: 120, y:  20},
        {x: 310, y: 180},
        {x: 100, y: 180},
    ],
    result: { origin: { x: 32.5, y: 20 }, size: { width: 80, height: 40 } }
}, {
    title: "wide/open/left",
    polygon: [
        {x: 200, y:  20},
        {x: 310, y:  20},
        {x: 220, y: 180},
        {x:  10, y: 180},
    ],
    result: { origin: { x: 200, y: 20 }, size: { width: 80, height: 40 } }
}, {
    title: "2nd slice",
    only: false,
    trace: false,
    polygon: [
        {x: 110, y:  20},
        {x: 210, y:  20},
        {x: 310, y: 180},
        {x: 230, y: 180},
        {x: 160, y:  50},
        {x:  90, y: 180},
        {x:  10, y: 180},
    ],
    result: { origin: { x: -1, y: -1 }, size: { width: 80, height: 40 } }
}, {
    title: "2nd slice",
    polygon: [
        {x: 110, y:  20},
        {x: 210, y:  20},
        {x: 310, y: 180},
        {x: 170, y: 180},
        {x: 160, y:  50},
        {x:  90, y: 180},
        {x:  10, y: 180},
    ],
    result: { origin: { x: 165.08771929824562, y: 76.14035087719299 }, size: { width: 80, height: 40 } }
}, {
    title: "2nd slice with down spike",
    // only: true,
    // trace: true,
    polygon: [
        {x: 110, y:  20},
        {x: 190, y:  20},
        {x: 200, y:  90},
        {x: 210, y:  20},
        {x: 310, y: 180},
        {x: 170, y: 180},
        {x: 160, y:  50},
        {x:  90, y: 180},
        {x:  10, y: 180},
    ],
    result: { origin: { x: 166.15384615384616, y: 90 }, size: { width: 80, height: 40 } }
}, {
    title: "1st slice",
    polygon: [
        {x: 110, y:  20},
        {x: 210, y:  20},
        {x: 310, y: 180},
        {x: 170, y: 180},
        {x: 160, y:  50},
        {x: 150, y: 180},
        {x:  10, y: 180},
    ],
    result: { origin: { x: 74.91228070175438, y: 76.14035087719299 }, size: { width: 80, height: 40 } }
} /*, { 
    title: "pointForBoxInSlices: place 1st box in two stripes",
    strategy: (wordwrap: WordWrap, box: Size): Point|undefined => {
        let source = new BoxSource()
        // return wordwrap.pointForBoxInSlices(box)
    }
}, {
    title: "bottom is below slice",
    // only: true,
    // trace: true,
    polygon: [
        {x: 110, y:  20},
        {x: 300, y: 100},
        {x: 300, y: 170},
        {x:  10, y: 170},
        {x: 120, y:  80},
    ],
    box: { origin: { x: 120, y: 57.89473684210527 }, size: { width: 80, height: 40 } }
}*/
, { 
    title: "placeWordBoxes()",
    strategy: (wordwrap: WordWrap, boxes: Array<Size>|undefined, box: Size, svg: SVGElement): Point|undefined => {
        wordwrap.trace = false
        let boxSource = new IteratingBoxSource()
        wordwrap.placeWordBoxes(boxSource)

        for(let r of boxSource.rectangles) {
            let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
            rect.setAttributeNS("", "stroke", "#aaa")
            rect.setAttributeNS("", "fill", "none")
            rect.setAttributeNS("", "x", String(r.origin.x))
            rect.setAttributeNS("", "width", String(r.size.width))
            rect.setAttributeNS("", "y", String(r.origin.y))
            rect.setAttributeNS("", "height", String(r.size.height))
            svg.appendChild(rect)
        }

        if (boxSource.rectangles.length === 0)
            return undefined
        return boxSource.rectangles[boxSource.rectangles.length-1].origin
    }
}, {
    title: "wordwrap 001",
    polygon: [
        {x:110, y: 20},
        {x:310, y:100},
        {x:280, y:190},
        {x:100, y:100},
        {x: 40, y:190},
        {x: 10, y: 80},
    ],
    result: { origin: { x: 239.2, y: 149.6 }, size: { width: 40, height: 20 } }
}, {
    title: "wordwrap 002",
    polygon: [
        {x: 20, y: 10},
        {x:190, y: 50},
        {x:310, y: 10},
        {x:280, y:190},
        {x:100, y:100},
        {x: 40, y:190},
        {x: 10, y: 80},
    ],
    result: { origin: { x: 258.2113821138212, y: 139.1056910569106  }, size: { width: 20, height: 20 } }
}, {
        title: "Regression Tests",
        strategy: (wordwrap: WordWrap, boxes: Array<Size>|undefined, box: Size, svg: SVGElement): Point|undefined => {
            // wordwrap.trace = false
            let boxSource = new BoxSource(boxes!)
            wordwrap.placeWordBoxes(boxSource)
    
            for(let r of boxSource.rectangles) {
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
    
            if (boxSource.rectangles.length === 0)
                return undefined
            console.log(boxSource.rectangles[boxSource.rectangles.length-1])
            return boxSource.rectangles[boxSource.rectangles.length-1].origin
        }

}, {
    title: "placeWordBoxes() rounding error box.width & horizontal width",
    polygon: [
        {x: 20, y: 10},
        {x:190, y: 50},
        {x:310, y: 10},
        {x:280, y:190},
        {x:100, y:100},
        {x: 40, y:190},
        {x: 10, y: 80},
    ],
    boxes: [{width: 33.685546875, height: 13.953125}],
    result: { origin: { x: 18.90453506097561, y: 17.66825457317073  }, size: { width: 33.685546875, height: 13.953125 } }
}, {
    title: "placeWordBoxes() used slice data as cursor and modified it",
    // only: true,
    // trace: true,
    polygon: [
        {x: 20, y: 10},
        {x:190, y: 50},
        {x:310, y: 10},
        {x:280, y:190},
        {x:100, y:100},
        {x: 40, y:190},
        {x: 10, y: 80},
    ],
    boxes: [ {width: 110.44158363342285, height: 16.171875}, {width: 40.69293403625488, height: 16.171875}, {width: 36.3858699798584, height: 16.171875}, {width: 19.307065963745117, height: 16.171875}, {width: 41.26358985900879, height: 16.171875}, {width: 77.88723182678223, height: 16.171875}],
    result: { origin: { x: 11.975446428571429, y: 66.171875  }, size: { height: 16.171875, width: 77.88723182678223 } }
}, { 
    title: "render real text",
    // only: true,
    strategy: (wordwrap: WordWrap, boxes: Array<Size>|undefined, box: Size, svg: SVGElement): Point|undefined => {
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
    
        return new Point(0,0)
        // if (boxes.rectangles.length === 0)
        //     return undefined
        // return boxes.rectangles[boxes.rectangles.length-1].origin
    }
}, {
    // only: true,
    trace: false,
    title: "real text",
    polygon: [
        {x: 20, y: 10},
        {x:190, y: 50},
        {x:310, y: 10},
        {x:280, y:190},
        {x:100, y:100},
        {x: 40, y:190},
        {x: 10, y: 80},
    ],
    result: { origin: { x: 0, y: 0 }, size: { width: 20, height: 20 } }
}]

// run the unit tests which also create visual output
// all those tests are defined in list array wordWrapTest
export function testWrap() {
    document.body.innerHTML=""

    let only = isAtLeastOneTestIsMarkedAsOnly(wordWrapTest)
    let strategy: Placer|undefined

    for(let test of wordWrapTest) {
        if (test.strategy)
            strategy = test.strategy
        if (only && !test.only) {
            continue
        }
        if (test.polygon) {
            let path = new Path()
            for(let point of test.polygon) {
                if (path.empty())
                    path.move(point)
                else
                    path.line(point)
            }
            path.close()
            new WordWrapTestRunner(test.title, path, test.boxes, test.result!, test.trace == true, strategy!)
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
    
    let debug = document.createElement("pre")
    debug.id = "debug"
    document.body.appendChild(debug)
}

function isAtLeastOneTestIsMarkedAsOnly(wordWrapTest: WordWrapTest[]): boolean {
    for(let test of wordWrapTest) {
        if (test.only === true) {
            return true
        }
    }
    return false
}
