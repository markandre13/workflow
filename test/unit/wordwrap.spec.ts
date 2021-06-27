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

//
// TODO: Move these tests into test/visual/wordwrap
//
// MEANWHILE, use this strategy for debugging:
//
// * mark test as 'only'
// * npm run test:watch:verbose
// * press karma's debug button
//

import { expect } from "chai"
import { Point, Size, Rectangle, pointEqualsPoint, rectangleEqualsRectangle, lineCrossesRect2, lineCrossesLine } from "shared/geometry"
import { Path } from "client/paths"
import { WordWrap, WordSource, Slice, SweepEvent, withinSlices, appendEventAsNewSlice, printSlices, validateSlices } from "client/wordwrap/wordwrap"
import { OrderedArray } from "client/OrderedArray"
import { WordBox } from "client/wordwrap/WordBox"

class BoxSource implements WordSource {
    remaining: number
    style: boolean
    box?: Size
    wordBoxes: Array<WordBox>

    constructor(remaining = 4096) {
        this.remaining = remaining
        this.style = true
        this.wordBoxes = new Array<WordBox>()
    }

    reset(): void { }

    pullBox(): Size | undefined {
        if (this.remaining === 0)
            return undefined
        --this.remaining
        this.box = new Size(this.style ? 40 : 20, 20)
        return this.box
    }

    placeBox(origin: Point): void {
        let rectangle = new WordBox(0, 0, "") // new WordBox(origin, this.box!)
        rectangle.set(origin.x, origin.y, this.box!.width, this.box!.height)
        this.wordBoxes.push(rectangle)
        let path = new Path()
        path.appendRect(rectangle)
        document.getElementById("svg")!.appendChild(path.createSVG(this.style ? "#f00" : "#f80"))
        this.style = !this.style
    }

    endOfLine() { }
    endOfSlice() { }
    endOfWrap() { }
}

describe("wordwrap", function () {
    beforeEach(function () {
        document.body.innerHTML = `<svg id="svg" xmlns="http://www.w3.org/2000/svg" style="border: 1px solid #ddd" width="640" height="480" viewBox="0 0 640 480">`
    })


    // FIXME: that function is gone/renamed, hence this test is disabled
    // describe("pointForBoxInCorner" , function() {
    //     it("cornerOpensLeftAndRight", function() {
    //         let path = new Path()
    //         path.setAttributes({stroke: "#000", fill: "none"})
    //         path.move( 20, 100)
    //         path.line(200,  40)
    //         path.line(380, 100)
    //         path.close()
    //         path.updateSVG()
    //         document.getElementById("svg")!.appendChild(path.svg)

    //         let wordwrap = new WordWrap(path)

    //         let e0 = wordwrap.sweepBuffer.shift()
    //         let e1 = wordwrap.sweepBuffer.shift()

    //         let box = new Size(80, 20)
    //         let pt = wordwrap.pointForBoxInCorner(box, e0, e1)

    //         expect(pt).not.to.be.undefined
    //         expect(pointEqualsPoint(pt!, new Point(160, 53.33333333333333))).to.be.true

    //         path = new Path()
    //         let rectangle = new Rectangle(pt!, box)
    //         path.appendRect(rectangle)
    //         path.setAttributes({stroke: "#f80", fill: "none"})
    //         path.updateSVG()
    //         document.getElementById("svg")!.appendChild(path.svg)
    //     })
    // })

    it("rectangle", function () {
        let path = new Path()
        path.appendRect(new Rectangle(20, 20, 60, 60))
        document.getElementById("svg")!.appendChild(path.createSVG())

        let boxsource = new BoxSource()
        let wordwrap = new WordWrap(path, boxsource)

        expect(boxsource.wordBoxes.length).to.equal(6)

        expect(rectangleEqualsRectangle(
            boxsource.wordBoxes[0],
            new Rectangle(20, 20, 40, 20)
        )).to.be.true

        expect(rectangleEqualsRectangle(
            boxsource.wordBoxes[1],
            new Rectangle(60, 20, 20, 20)
        )).to.be.true

        expect(rectangleEqualsRectangle(
            boxsource.wordBoxes[5],
            new Rectangle(60, 60, 20, 20)
        )).to.be.true
    })

    it("rhomb", function () {
        let path = new Path()
        path.move(200, 40)
        path.line(400, 180)
        path.line(150, 250)
        path.line(20, 100)
        path.close()
        document.getElementById("svg")!.appendChild(path.createSVG())

        let boxsource = new BoxSource()
        let wordwrap = new WordWrap(path, boxsource)

        expect(boxsource.wordBoxes.length).to.equal(52)

        expect(rectangleEqualsRectangle(
            boxsource.wordBoxes[0],
            new Rectangle(172.90322580645162, 49.03225806451613, 40, 20)
        )).to.be.true

        expect(rectangleEqualsRectangle(
            boxsource.wordBoxes[1],
            new Rectangle(112.90322580645162, 69.03225806451613, 20, 20)
        )).to.be.true

        expect(rectangleEqualsRectangle(
            boxsource.wordBoxes[51],
            new Rectangle(171.8279569892473, 209.03225806451613, 20, 20)
        )).to.be.true
    })

    // FIXME: the cornerOpens* tests do not fail because of what they tests but because to many elements are added at the bottom

    it("cornerOpensLeftAndRight", function () {
        let path = new Path()
        path.move(250, 20)
        path.line(400, 240)
        path.line(100, 240)
        path.close()
        document.getElementById("svg")!.appendChild(path.createSVG())

        let boxsource = new BoxSource()
        let wordwrap = new WordWrap(path, boxsource)

        //        console.log(boxsource.rectangles.length)

        expect(boxsource.wordBoxes.length).to.equal(41)

        // FIXME: check some rectangles
    })

    it("cornerOpensToTheRight", function () {
        let path = new Path()
        path.move(20, 20)
        path.line(400, 250)
        path.line(100, 250)
        path.close()
        document.getElementById("svg")!.appendChild(path.createSVG())

        let boxsource = new BoxSource()
        let wordwrap = new WordWrap(path, boxsource)

        //        console.log(boxsource.rectangles.length)

        expect(boxsource.wordBoxes.length).to.equal(40)

        // FIXME: check some rectangles
    })

    it("cornerOpensToTheLeft", function () {
        let path = new Path()
        path.move(480, 20)
        path.line(400, 250)
        path.line(100, 250)
        path.close()
        document.getElementById("svg")!.appendChild(path.createSVG())

        let boxsource = new BoxSource()
        let wordwrap = new WordWrap(path, boxsource)

        //        console.log(boxsource.rectangles.length)

        expect(boxsource.wordBoxes.length).to.equal(40)

        // FIXME: check some rectangles
    })

    it("splitAndMergeSplicesOnce", function () {
        let path = new Path()
        path.move(20, 40)
        path.line(310, 40)
        path.line(320, 130)
        path.line(330, 40)
        path.line(620, 40)
        path.line(330, 450)
        path.line(320, 310)
        path.line(310, 450)
        path.close()
        document.getElementById("svg")!.appendChild(path.createSVG())

        let boxsource = new BoxSource()
        let wordwrap = new WordWrap(path, boxsource)

        expect(boxsource.wordBoxes.length).to.equal(180)

        expect(rectangleEqualsRectangle(
            boxsource.wordBoxes[0],
            new Rectangle(34.146341463414636, 40, 40, 20)
        )).to.be.true

        expect(rectangleEqualsRectangle(
            boxsource.wordBoxes[7],
            new Rectangle(254.14634146341464, 40, 20, 20)
        )).to.be.true

        expect(rectangleEqualsRectangle(
            boxsource.wordBoxes[8],
            new Rectangle(330, 40, 40, 20)
        )).to.be.true

        expect(rectangleEqualsRectangle(
            boxsource.wordBoxes[178],
            new Rectangle(260.4878048780488, 360, 40, 20)
        )).to.be.true

        expect(rectangleEqualsRectangle(
            boxsource.wordBoxes[179],
            new Rectangle(325, 360, 20, 20)
        )).to.be.true
    })

    it("cornerFitsOnlyAtBottom", function () {
        let path = new Path()
        path.move(20, 40)
        path.line(300, 40)
        path.line(320, 10)
        path.line(340, 40)
        path.line(620, 40)
        path.line(330, 450)
        path.line(320, 310)
        path.line(310, 450)
        path.close()
        document.getElementById("svg")!.appendChild(path.createSVG())

        let boxsource = new BoxSource()
        let wordwrap = new WordWrap(path, boxsource)

        expect(boxsource.wordBoxes.length).to.equal(184)

        expect(rectangleEqualsRectangle(
            boxsource.wordBoxes[0],
            new Rectangle(34.146341463414636, 40, 40, 20)
        )).to.be.true

        expect(rectangleEqualsRectangle(
            boxsource.wordBoxes[1],
            new Rectangle(74.14634146341464, 40, 20, 20)
        )).to.be.true

        expect(rectangleEqualsRectangle(
            boxsource.wordBoxes[183],
            new Rectangle(325, 360, 20, 20)
        )).to.be.true
    })

    it("cornerDoesNotFit", function () {
        let path = new Path()
        path.move(20, 40)
        path.line(310, 40)
        path.line(320, 10)
        path.line(330, 40)
        path.line(620, 40)
        path.line(330, 450)
        path.line(320, 310)
        path.line(310, 450)
        path.close()
        document.getElementById("svg")!.appendChild(path.createSVG())

        let boxsource = new BoxSource()
        let wordwrap = new WordWrap(path, boxsource)

        expect(boxsource.wordBoxes.length).to.not.equal(0)
    })

    describe("levelSlicesHorizontally", function () {

        it("more sweepevents on the left than on the right", function () {
            // Given
            //
            //        (110, 20)
            //             \   ────
            //              \      ───
            //           (120, 80)    (252.5, 80)
            //              /               ───
            //             /                   ────
            //       (95.5, 100)                (300, 100)
            //          /
            //         /
            //     (10,170)
            let slice = new Slice()
            slice.left.push(new SweepEvent(
                new Point(110, 20),
                new Point(120, 80)))
            slice.left.push(new SweepEvent(
                new Point(120, 80),
                new Point(95.55555555555556, 100)))
            slice.left.push(new SweepEvent(
                new Point(95.55555555555556, 100),
                new Point(10, 170)))
            slice.right.push(new SweepEvent(
                new Point(110, 20),
                new Point(252.5, 80)))
            slice.right.push(new SweepEvent(
                new Point(252.5, 80),
                new Point(300, 100)))
            let slices = new Array<Slice>()
            slices.push(slice)
            let wordwrap = new WordWrap(new Path().appendRect(new Rectangle(0, 0, 320, 200)))

            // When
            wordwrap.levelSlicesHorizontally(slices)

            // Then (not sure if this expection is correct at least we don't get an exception)
            expect(slices.length).to.equal(1)
            expect(slices[0].left.length).to.equal(3)
            expect(slices[0].right.length).to.equal(2)
        })

        it("slice and cut it step by step 001", function () {
            // Given a path and a box
            //
            //                (110,40)
            //               /        \
            //           (60,50)   (160,50)
            //            /              \
            //        (10,80)         (210,80)
            //           |                |
            //        (10,190)--------(210,190)
            //
            let dot = [
                { x: 10, y: 80 }, // 0
                { x: 60, y: 50 }, // 1
                { x: 110, y: 40 }, // 2
                { x: 160, y: 50 }, // 3
                { x: 210, y: 80 }, // 4
                { x: 210, y: 190 }, // 5
                { x: 10, y: 190 }, // 6
            ]
            let path = new Path(dot)
            let wordwrap = new WordWrap(path)

            let cursor = new Point(0, 0)
            let box = new Size(80, 40)
            let slices = new Array<Slice>()

            // When
            wordwrap.extendSlices(cursor, box, slices)

            // Then we should've pulled the two lines from the top
            expect(slices.length).to.equal(1)
            expect(slices[0].left[0].p[0]).to.eql(dot[2])
            expect(slices[0].left[0].p[1]).to.eql(dot[1])
            expect(slices[0].right[0].p[0]).to.eql(dot[2])
            expect(slices[0].right[0].p[1]).to.eql(dot[3])

            // When we level were no leveling is needed
            wordwrap.levelSlicesHorizontally(slices)

            // Then nothing should have changed
            expect(slices.length).to.equal(1)
            expect(slices[0].left[0].p[0]).to.eql(dot[2])
            expect(slices[0].left[0].p[1]).to.eql(dot[1])
            expect(slices[0].right[0].p[0]).to.eql(dot[2])
            expect(slices[0].right[0].p[1]).to.eql(dot[3])

            // When we move a little bit lower
            cursor.y = 45
            wordwrap.extendSlices(cursor, box, slices)

            // Then we should have aquired more slices
            expect(slices.length).to.equal(1)
            expect(slices[0].left.length).to.equal(3)
            expect(slices[0].left[0].p[0]).to.eql(dot[2])
            expect(slices[0].left[0].p[1]).to.eql(dot[1])
            expect(slices[0].left[1].p[0]).to.eql(dot[1])
            expect(slices[0].left[1].p[1]).to.eql(dot[0])
            expect(slices[0].left[2].p[0]).to.eql(dot[0])
            expect(slices[0].left[2].p[1]).to.eql(dot[6])

            expect(slices[0].right.length).to.equal(3)
            expect(slices[0].right[0].p[0]).to.eql(dot[2])
            expect(slices[0].right[0].p[1]).to.eql(dot[3])
            expect(slices[0].right[1].p[0]).to.eql(dot[3])
            expect(slices[0].right[1].p[1]).to.eql(dot[4])
            expect(slices[0].right[2].p[0]).to.eql(dot[4])
            expect(slices[0].right[2].p[1]).to.eql(dot[5])

            // When reducing were no reducing is possible
            wordwrap.mergeAndDropSlices(cursor, box, slices)
            wordwrap.dropEventsInSlices(cursor, box, slices)

            // Then nothing should have changed
            expect(slices.length).to.equal(1)
            expect(slices[0].left.length).to.equal(3)
            expect(slices[0].left[0].p[0]).to.eql(dot[2])
            expect(slices[0].left[0].p[1]).to.eql(dot[1])
            expect(slices[0].left[1].p[0]).to.eql(dot[1])
            expect(slices[0].left[1].p[1]).to.eql(dot[0])
            expect(slices[0].left[2].p[0]).to.eql(dot[0])
            expect(slices[0].left[2].p[1]).to.eql(dot[6])

            expect(slices[0].right.length).to.equal(3)
            expect(slices[0].right[0].p[0]).to.eql(dot[2])
            expect(slices[0].right[0].p[1]).to.eql(dot[3])
            expect(slices[0].right[1].p[0]).to.eql(dot[3])
            expect(slices[0].right[1].p[1]).to.eql(dot[4])
            expect(slices[0].right[2].p[0]).to.eql(dot[4])
            expect(slices[0].right[2].p[1]).to.eql(dot[5])

            // When we level were no leveling is needed
            wordwrap.levelSlicesHorizontally(slices)

            console.log(JSON.stringify(slices, null, 4))

        })

        it("slice and cut it step by step 002", function () {
            //
            //   (110,20)---
            //         \    ---
            //          \      ---
            //     (120,80)        ---
            //         /    (170,90)  ---
            //        |    /        \    ---
            //       /    /          \   (300,100)
            //      |    /            \    |
            //     (10,170)           (300,170)
            //
            let dot = [
                { x: 110, y: 20 }, // 0
                { x: 300, y: 100 }, // 1
                { x: 300, y: 170 }, // 2
                { x: 170, y: 90 }, // 3
                { x: 10, y: 170 }, // 4
                { x: 120, y: 80 }, // 5
            ]
            let path = new Path(dot)
            document.getElementById("svg")!.appendChild(path.createSVG())

            let wordwrap = new WordWrap(path)

            let cursor = new Point(0, 0)
            let box = new Size(80, 40)
            let slices = new Array<Slice>()

            // When
            wordwrap.extendSlices(cursor, box, slices)

            // Then
            expect(slices.length).to.equal(1)
            expect(slices[0].left.length).to.equal(1)
            expect(slices[0].left[0].p[0]).to.eql(dot[0])
            expect(slices[0].left[0].p[1]).to.eql(dot[5])

            expect(slices[0].right.length).to.equal(1)
            expect(slices[0].right[0].p[0]).to.eql(dot[0])
            expect(slices[0].right[0].p[1]).to.eql(dot[1])

            // When
            wordwrap.levelSlicesHorizontally(slices)

            // Then
            expect(slices.length).to.equal(1)
            expect(slices[0].left.length).to.equal(1)
            expect(slices[0].left[0].p[0]).to.eql(dot[0])
            expect(slices[0].left[0].p[1]).to.eql(dot[5])

            expect(slices[0].right.length).to.equal(2)
            expect(slices[0].right[0].p[0]).to.eql(dot[0])
            expect(slices[0].right[0].p[1]).to.eql({ x: 252.5, y: 80 })
            expect(slices[0].right[1].p[0]).to.eql({ x: 252.5, y: 80 })
            expect(slices[0].right[1].p[1]).to.eql(dot[1])

            // When
            cursor.y = 70
            wordwrap.extendSlices(cursor, box, slices)

            // Then
            expect(slices.length).to.equal(2)

            // left slice: left
            expect(slices[0].left.length).to.equal(2)
            expect(slices[0].left[0].p[0]).to.eql(dot[0])
            expect(slices[0].left[0].p[1]).to.eql(dot[5])
            expect(slices[0].left[1].p[0]).to.eql(dot[5])
            expect(slices[0].left[1].p[1]).to.eql(dot[4])

            // left slice: right
            expect(slices[0].right.length).to.equal(3)
            expect(slices[0].right[0].p[0]).to.eql(dot[0])
            expect(slices[0].right[0].p[1]).to.eql({ x: 252.5, y: 80 })
            expect(slices[0].right[1].p[0]).to.eql({ x: 252.5, y: 80 })
            expect(slices[0].right[1].p[1]).to.eql({ x: 276.25, y: 90 })	// SURE?
            expect(slices[0].right[2].p[0]).to.eql(dot[3])
            expect(slices[0].right[2].p[1]).to.eql(dot[4])

            // right slice: left
            expect(slices[1].left.length).to.equal(3)
            expect(slices[1].left[0].p[0]).to.eql(dot[0])
            expect(slices[1].left[0].p[1]).to.eql(dot[5])
            expect(slices[1].left[1].p[0]).to.eql(dot[5])
            expect(slices[1].left[1].p[1]).to.eql({ x: 107.77777777777779, y: 90 }) // SURE?
            expect(slices[1].left[2].p[0]).to.eql(dot[3])
            expect(slices[1].left[2].p[1]).to.eql(dot[2])

            // right slice: right
            expect(slices[1].right.length).to.equal(3)
            expect(slices[1].right[0].p[0]).to.eql(dot[0])
            expect(slices[1].right[0].p[1]).to.eql({ x: 252.5, y: 80 })
            expect(slices[1].right[1].p[0]).to.eql({ x: 252.5, y: 80 })
            expect(slices[1].right[1].p[1]).to.eql(dot[1])
            expect(slices[1].right[2].p[0]).to.eql(dot[1])
            expect(slices[1].right[2].p[1]).to.eql(dot[2])

            // When
            wordwrap.levelSlicesHorizontally(slices)

            //            console.log(JSON.stringify(slices, null, 4))

            // Then
            expect(slices.length).to.equal(2)

            // left slice: left
            expect(slices[0].left.length).to.equal(3)
            expect(slices[0].left[0].p[0]).to.eql(dot[0])
            expect(slices[0].left[0].p[1]).to.eql(dot[5])
            expect(slices[0].left[1].p[0]).to.eql(dot[5])
            expect(slices[0].left[1].p[1]).to.eql({ x: 107.77777777777777, y: 90 }) // SURE?
            expect(slices[0].left[2].p[0]).to.eql({ x: 107.77777777777777, y: 90 }) // SURE?
            expect(slices[0].left[2].p[1]).to.eql(dot[4])

            // left slice: right
            expect(slices[0].right.length).to.equal(3)
            expect(slices[0].right[0].p[0]).to.eql(dot[0])
            expect(slices[0].right[0].p[1]).to.eql({ x: 252.5, y: 80 })
            expect(slices[0].right[1].p[0]).to.eql({ x: 252.5, y: 80 })
            expect(slices[0].right[1].p[1]).to.eql({ x: 276.25, y: 90 })
            expect(slices[0].right[2].p[0]).to.eql(dot[3])
            expect(slices[0].right[2].p[1]).to.eql(dot[4])

            // right slice: left
            expect(slices[1].left.length).to.equal(4)
            expect(slices[1].left[0].p[0]).to.eql(dot[0])
            expect(slices[1].left[0].p[1]).to.eql(dot[5])
            expect(slices[1].left[1].p[0]).to.eql(dot[5])
            expect(slices[1].left[1].p[1]).to.eql({ x: 107.77777777777779, y: 90 })
            expect(slices[1].left[2].p[0]).to.eql(dot[3])
            expect(slices[1].left[2].p[1]).to.eql({ x: 186.25, y: 100 }) // SURE?
            expect(slices[1].left[3].p[0]).to.eql({ x: 186.25, y: 100 }) // SURE?
            expect(slices[1].left[3].p[1]).to.eql(dot[2])

            // right slice: right
            expect(slices[1].right.length).to.equal(4)
            expect(slices[1].right[0].p[0]).to.eql(dot[0])
            expect(slices[1].right[0].p[1]).to.eql({ x: 252.5, y: 80 })
            expect(slices[1].right[1].p[0]).to.eql({ x: 252.5, y: 80 })
            expect(slices[1].right[1].p[1]).to.eql({ x: 276.25, y: 90 }) // SURE?
            expect(slices[1].right[2].p[0]).to.eql({ x: 276.25, y: 90 }) // SURE?
            expect(slices[1].right[2].p[1]).to.eql(dot[1])
            expect(slices[1].right[3].p[0]).to.eql(dot[1])
            expect(slices[1].right[3].p[1]).to.eql(dot[2])
        })

        it("dd", function () {
            let slice = new Slice()
            slice.left.push(new SweepEvent(new Point(110, 20),
                new Point(120, 80)))
            slice.left.push(new SweepEvent(new Point(120, 80),
                new Point(10, 170)))

            slice.right.push(new SweepEvent(new Point(170, 90),
                new Point(10, 170)))

            //            slice.right.push(new SweepEvent(new Point(252.5, 80),
            //                                            new Point(300, 100)))
            let slices = new Array<Slice>()
            slices.push(slice)
            let wordwrap = new WordWrap(new Path().appendRect(new Rectangle(0, 0, 320, 200)))

            // When
            wordwrap.levelSlicesHorizontally(slices)
        })

        it("test1", function () {

            let path = new Path()
            path.move(160 + 20, 10)
            path.line(310, 100 + 20)
            path.line(160 - 20, 190)
            path.line(10, 100 - 20)
            path.close()

            let wordwrap = new WordWrap(path)
            expect(wordwrap.sweepBuffer.length).to.equal(4)

            let slices = new Array<Slice>()
            wordwrap.extendSlices(new Point(0, 0), new Size(320, 200), slices)

            expect(wordwrap.sweepBuffer.length).to.equal(0)
            expect(slices.length).to.equal(1)
            expect(slices[0].left.length).to.equal(2)
            expect(slices[0].right.length).to.equal(2)

            wordwrap.levelSlicesHorizontally(slices)

            expect(slices[0].left.length).to.equal(3)
            expect(slices[0].right.length).to.equal(3)

            expect(pointEqualsPoint(slices[0].left[0].p[0], new Point(180, 10))).to.be.true
            expect(pointEqualsPoint(slices[0].left[0].p[1], new Point(10, 80))).to.be.true

            expect(pointEqualsPoint(slices[0].left[1].p[0], new Point(10, 80))).to.be.true
            expect(pointEqualsPoint(slices[0].left[1].p[1], new Point(57.27272727272727, 120))).to.be.true

            expect(pointEqualsPoint(slices[0].left[2].p[0], new Point(57.27272727272727, 120))).to.be.true
            expect(pointEqualsPoint(slices[0].left[2].p[1], new Point(140, 190))).to.be.true

            expect(pointEqualsPoint(slices[0].right[0].p[0], new Point(180, 10))).to.be.true
            expect(pointEqualsPoint(slices[0].right[0].p[1], new Point(262.72727272727275, 80))).to.be.true

            expect(pointEqualsPoint(slices[0].right[1].p[0], new Point(262.72727272727275, 80))).to.be.true
            expect(pointEqualsPoint(slices[0].right[1].p[1], new Point(310, 120))).to.be.true

            expect(pointEqualsPoint(slices[0].right[2].p[0], new Point(310, 120))).to.be.true
            expect(pointEqualsPoint(slices[0].right[2].p[1], new Point(140, 190))).to.be.true
        })
    })

    describe("withinSlices()", () => {
        it("test001", () => {
            let rectangle = new Rectangle(120, 57.89473684210527, 80, 40)

            let slice = new Slice()
            slice.left.push(new SweepEvent(new Point(110, 20), new Point(120, 80)))
            slice.left.push(new SweepEvent(new Point(120, 80), new Point(95.55555555555556, 100)))
            slice.left.push(new SweepEvent(new Point(95.55555555555556, 100), new Point(10, 170)))
            slice.right.push(new SweepEvent(new Point(110, 20), new Point(252.5, 80)))
            slice.right.push(new SweepEvent(new Point(252.5, 80), new Point(300, 100)))
            let slices = new Array<Slice>()
            slices.push(slice)

            expect(withinSlices(rectangle, slices, true)).to.be.true
        })

        it("test002", () => {
            let rectangle = new Rectangle(120, 91.11111111111111, 80, 40)

            let slice = new Slice()
            slice.left.push(new SweepEvent(new Point(160, 20), new Point(115, 100)))
            slice.left.push(new SweepEvent(new Point(115, 100), new Point(140, 180)))
            slice.right.push(new SweepEvent(new Point(160, 20), new Point(205, 100)))
            slice.right.push(new SweepEvent(new Point(205, 100), new Point(160, 180)))
            let slices = new Array<Slice>()
            slices.push(slice)

            expect(withinSlices(rectangle, slices, true)).to.be.false
        })

        it("test003", () => {
            let rectangle = new Rectangle(71.57894736842104, 89.47368421052632, 80, 40)
            let slice = new Slice()
            slice.left.push(new SweepEvent(new Point(10, 20), new Point(100, 180)))
            slice.right.push(new SweepEvent(new Point(30, 20), new Point(310, 180)))
            let slices = new Array<Slice>()
            slices.push(slice)

            expect(withinSlices(rectangle, slices, true)).to.be.true
        })
    })

    describe("lineCrossesRect()", () => {
        it("test001", () => {
            let rectangle = new Rectangle(120, 91.11111111111111, 80, 40)
            let line = [new Point(115, 100), new Point(140, 180)]
            expect(lineCrossesRect2(line, rectangle)).to.be.true
        })

        it("test002", () => {
            let rectangle = new Rectangle(168.42105263157896, 89.4736842105263, 80, 40)
            let line = [new Point(290, 20), new Point(10, 180)]
            expect(lineCrossesRect2(line, rectangle)).to.be.false
        })
    })

    describe("lineCrossesLine()", () => {
        it("test001", () => {
            let line0 = [new Point(120, 91.11111111111111), new Point(120, 131.11111111111111)]
            let line1 = [new Point(115, 100), new Point(140, 180)]

            expect(lineCrossesLine(line0, line1)).to.be.true
            expect(lineCrossesLine(line1, line0)).to.be.true
        })
    })

    describe("findSpaceAtCursorForBox()", () => {
        function printSlices(slices: Array<Slice>) {
            console.log("Array<Slice>")
            for (let slice of slices) {
                console.log("  Slice")
                console.log("    left")
                for (let event of slice.left) {
                    console.log("      ", event.p)
                    if (pointEqualsPoint(event.p[0], event.p[1]))
                        console.log("        EVENT IS A POINT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                }
                console.log("    right")
                for (let event of slice.right) {
                    console.log("      ", event.p)
                    if (pointEqualsPoint(event.p[0], event.p[1]))
                        console.log("        EVENT IS A POINT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                }
            }
        }

        it("extendSlices() is able to crawl down", () => {
            // Given
            let path = new Path()
            path.move(110, 20)
            path.line(310, 100)
            path.line(280, 190)
            path.line(100, 100)
            path.line(40, 190)
            path.line(10, 80)
            path.close()

            let wordwrap = new WordWrap(path)
            let cursor = new Point(78, 90)
            let box = new Size(40, 20)
            let slices = new Array<Slice>()

            // When
            wordwrap.extendSlices(cursor, box, slices)

            // Then
            expect(slices.length).to.equal(2)

            expect(slices[0].left.length).to.equal(2)
            expect(pointEqualsPoint(slices[0].left[0].p[0], new Point(10, 80))).to.be.true
            expect(pointEqualsPoint(slices[0].left[0].p[1], new Point(15.454545454545453, 100))).to.be.true
            expect(pointEqualsPoint(slices[0].left[1].p[0], new Point(15.454545454545453, 100))).to.be.true
            expect(pointEqualsPoint(slices[0].left[1].p[1], new Point(40, 190))).to.be.true
            expect(slices[0].right.length).to.equal(2)
            expect(pointEqualsPoint(slices[0].right[0].p[0], new Point(260, 80))).to.be.true
            expect(pointEqualsPoint(slices[0].right[0].p[1], new Point(310, 100))).to.be.true
            expect(pointEqualsPoint(slices[0].right[1].p[0], new Point(100, 100))).to.be.true
            expect(pointEqualsPoint(slices[0].right[1].p[1], new Point(40, 190))).to.be.true

            expect(slices[0].left.length).to.equal(2)
            expect(pointEqualsPoint(slices[1].left[0].p[0], new Point(10, 80))).to.be.true
            expect(pointEqualsPoint(slices[1].left[0].p[1], new Point(15.454545454545453, 100))).to.be.true
            expect(pointEqualsPoint(slices[1].left[1].p[0], new Point(100, 100))).to.be.true
            expect(pointEqualsPoint(slices[1].left[1].p[1], new Point(280, 190))).to.be.true
            expect(slices[0].right.length).to.equal(2)
            expect(pointEqualsPoint(slices[1].right[0].p[0], new Point(260, 80))).to.be.true
            expect(pointEqualsPoint(slices[1].right[0].p[1], new Point(310, 100))).to.be.true
            expect(pointEqualsPoint(slices[1].right[1].p[0], new Point(310, 100))).to.be.true
            expect(pointEqualsPoint(slices[1].right[1].p[1], new Point(280, 190))).to.be.true
        })

        it("extendSlices() joins neighbouring empty right and empty left", () => {
            // Given
            let path = new Path()
            path.move(20, 10)
            path.line(190, 50)
            path.line(310, 10)
            path.line(280, 190)
            path.line(100, 100)
            path.line(40, 190)
            path.line(10, 80)
            path.close()

            let wordwrap = new WordWrap(path)
            let cursor = new Point(0, 60)
            let box = new Size(40, 20)
            let slices = new Array<Slice>()

            // When
            wordwrap.extendSlices(cursor, box, slices)

            // Then
            expect(slices.length).to.equal(1)
        })

    })

    describe("appendEventAsNewSlice()", () => {
        it("001", () => {
            let slices = new Array<Slice>()
            let slice = new Slice()
            slice.left.push(new SweepEvent({ x: 110, y: 20 }, { x: 66.25, y: 90 }))
            slice.left.push(new SweepEvent({ x: 66.25, y: 90 }, { x: 10, y: 180 }))
            slice.right.push(new SweepEvent({ x: 190, y: 20 }, { x: 200, y: 90 }))
            slices.push(slice)
            slice = new Slice()
            // slice.left.push(new SweepEvent({x:210, y:20}, {x:200, y: 90}))
            // slice.right.push(new SweepEvent({x:210, y:20}, {x:253.75, y: 90}))
            // slice.right.push(new SweepEvent({x:253.75, y: 90}, {x:310, y: 180}))
            // slices.push(slice)

            let sweepBuffer = new OrderedArray<SweepEvent>((a, b) => { return SweepEvent.less(a, b) })
            sweepBuffer.insert(new SweepEvent({ x: 160, y: 50 }, { x: 170, y: 180 }))

            let event = new SweepEvent({ x: 160, y: 50 }, { x: 90, y: 180 })
            appendEventAsNewSlice(slices, event, sweepBuffer, new Rectangle(0, 0, 320, 200))

            printSlices(slices)
            validateSlices(slices)
        })
    })

})

