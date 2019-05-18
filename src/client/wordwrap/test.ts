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
    Point, Size, Rectangle, Matrix,
    pointPlusSize, pointMinusPoint, pointPlusPoint, pointMultiplyNumber,
    pointMinus, pointEqualsPoint, signedArea, isZero, distancePointToLine
} from "../../shared/geometry"
import { Path } from "../path"

import { WordWrapTestRunner, Placer } from "./testrunner"
import { WordWrap, Slice, WordSource } from "./wordwrap"

class BoxSource implements WordSource {
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
        return this.box
    }

    placeBox(origin: Point): void {
        let rectangle = new Rectangle(origin, this.box!)
        this.rectangles.push(rectangle)
        let path = new Path()
        path.appendRect(rectangle)
        path.setAttributes({stroke: this.style ? "#f00" : "#f80", fill: "none"})
        path.updateSVG()
        document.getElementById("svg")!.appendChild(path.svg)
        this.style = !this.style
    }
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
    //! the box to be placed
    box?: value.Rectangle
    
    strategy?: Placer
}

// draw the expected box and the result
// mark image when test failed to execute
// line breaks, headings
// middle mouse, dump test data for copy'n pasting it back?

const wordWrapTest: WordWrapTest[] = [
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
}, { 
    title: "pointForBoxInSlices: place 1st box in two stripes",
    strategy: (wordwrap: WordWrap, box: Size): Point|undefined => {
        return wordwrap.pointForBoxInSlices(box)
    }
}, {
    title: "bottom is below slice",
    polygon: [
        {x: 110, y:  20},
        {x: 300, y: 100},
        {x: 300, y: 170},
        {x:  10, y: 170},
        {x: 120, y:  80},
    ],
    box: { origin: { x: 120, y: 57.89473684210527 }, size: { width: 80, height: 40 } }
}, {
    title: "bottom is below slice with intersection",
    only: false,
    trace: false,
    polygon: [
        {x: 110, y:  20},
        {x: 300, y: 100},
        {x: 300, y: 170},
        {x: 170, y:  90},
        {x:  10, y: 170},
        {x: 120, y:  80},
    ],
    box: { origin: { x: -1, y: -1 }, size: { width: 80, height: 40 } }
}, {
    title: "evaluate multiple slices to place box",
    only: false,
    trace: false,
    polygon: [
        {x: 10, y:  80},
        {x: 60, y:  50},
        {x: 110, y: 40},
        {x: 160, y: 50},
        {x: 210, y: 80},
        {x: 210, y: 190},
        {x:  10, y: 190},
    ],
    box: { origin: { x: 70, y: 48 }, size: { width: 80, height: 40 } }
} , {
    title: "xxx",
    polygon: [
        {x: 160, y:  20},
        {x: 210, y: 100},
        {x: 280, y: 180},
        {x:  20, y: 180},
        {x: 110, y: 100},
    ],
    box: { origin: { x: 120, y: 84 }, size: { width: 80, height: 40 } }
}, {
    title: "box outside corner left",
    polygon: [
        {x: 200, y: 100},
        {x:  20, y:  20},
        {x: 100, y: 100},
        {x:  80, y: 180},
        {x: 280, y: 180},
    ],
    box: { origin: { x: 100, y: 91.11111111111111 }, size: { width: 80, height: 40 } }
}, {
    title: "box outside corner right",
    polygon: [
        {x: 200, y: 100},
        {x:  20, y:  20},
        {x: 100, y: 100},
        {x: 120, y: 180},
        {x: 280, y: 180},
    ],
    box: { origin: { x: 0, y: 0 }, size: { width: 80, height: 40 } }
}, {
    title: "left dent",
    polygon: [
        {x: 115, y: 100},
        {x: 160, y:  20},
        {x: 205, y: 100},
        {x: 160, y: 180},
        {x: 140, y: 180},
    ],
    box: { origin: { x: 0, y: 0 }, size: { width: 80, height: 40 } }
}, {
    title: "connected",
    polygon: [
        {x: 115, y: 100},
        {x: 160, y:  20},
        {x: 205, y: 100},
        {x: 160, y: 180},
//        {x: 140, y: 180},
    ],
    box: { origin: { x: 0, y: 0 }, size: { width: 80, height: 40 } }
}, {
    title: "narrow/open/left&right/inside",
    polygon: [
        {x: 110, y: 180},
        {x: 160, y:  20},
        {x: 210, y: 180},
    ],
    box: { origin: { x: 0, y: 0 }, size: { width: 80, height: 40 } }
}, {
    title: "narrow/open/right",
    polygon: [
        {x:  10, y:  20},
        {x: 310, y: 180},
        {x: 170, y: 180},
    ],
    box: { origin: { x: 0, y: 0 }, size: { width: 80, height: 40 } }
}, {
    title: "narrow/open/left",
    polygon: [
        {x: 310, y:  20},
        {x: 150, y: 180},
        {x:  10, y: 180},
    ],
    box: { origin: { x: -1, y: -1 }, size: { width: 80, height: 40 } }
}, {
    title: "edge/open/left&right/inside",
    polygon: [
        {x:  70, y: 180},
        {x: 160, y:  20},
        {x: 250, y: 180},
    ],
    box: { origin: { x: 120, y: 91.11111111111111 }, size: { width: 80, height: 40 } }
}, {
    title: "median/open/right",
    polygon: [
        {x:  10, y:  20},
        {x:  30, y:  20},
        {x: 310, y: 180},
        {x: 100, y: 180},
    ],
    box: { origin: { x: 71.57894736842104, y: 89.47368421052632 }, size: { width: 80, height: 40 } }
}, {
    title: "median/open/left",
    polygon: [
        {x: 290, y:  20},
        {x: 310, y:  20},
        {x: 220, y: 180},
        {x:  10, y: 180},
    ],
    box: { origin: { x: 168.42105263157896, y: 89.4736842105263 }, size: { width: 80, height: 40 } }
}, {
    title: "wide/open/left&right/wide",
    polygon: [
        {x:  70, y: 180},
        {x: 110, y:  20},
        {x: 210, y:  20},
        {x: 250, y: 180},
    ],
    box: { origin: { x: 110, y: 20 }, size: { width: 80, height: 40 } }
}, {
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
}]


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
            new WordWrapTestRunner(test.title, path, test.box!, test.trace == true, strategy!)
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
