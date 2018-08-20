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

/*

the tests here were written switching from HeadlessChrome to regular Chrome,
perform a visual check and then translate that visual check to the tests
you'll see below.

diff --git a/karma.conf.js b/karma.conf.js
index 70658e7..90a6a7b 100644
--- a/karma.conf.js
+++ b/karma.conf.js
@@ -18,9 +18,10 @@ module.exports = (config) => {
     },
     port: 9876,
     colors: true,
-    browsers: ['ChromeHeadless'],
-    autoWatch: false,
-    singleRun: true
+//    browsers: ['ChromeHeadless'],
+    browsers: ['Chrome'],
+    autoWatch: true,
+    singleRun: false
     // browserNoActivityTimeout: 0
   })
 }

*/

import { expect } from "chai"
import { Point, Size, Rectangle, rectangleEqualsRectangle } from "shared/geometry"
import { Path } from "client/path"
import { WordWrap, WordSource } from "client/wordwrap"

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

describe("wordwrap", function() {
    beforeEach(function() {
        document.body.innerHTML=`<svg id="svg" xmlns="http://www.w3.org/2000/svg" style="border: 1px solid #ddd" width="640" height="480" viewBox="0 0 640 480">`
    })

    it("rectangle", function() {
        let path = new Path()
        path.setAttributes({stroke: "#000", fill: "none"})
        path.move(200,  40)
        path.line(400, 180)
        path.line(150, 250)
        path.line( 20, 100)
        path.close()
        path.updateSVG()
        document.getElementById("svg")!.appendChild(path.svg)

        let boxsource = new BoxSource()
        let wordwrap = new WordWrap(path, boxsource)
        
        expect(boxsource.rectangles.length).to.equal(52)

        expect(rectangleEqualsRectangle(
          boxsource.rectangles[0],
          new Rectangle(172.90322580645162, 49.03225806451613, 40, 20)
        )).to.be.true

        expect(rectangleEqualsRectangle(
          boxsource.rectangles[1],
          new Rectangle(112.90322580645162, 69.03225806451613, 20, 20)
        )).to.be.true

        expect(rectangleEqualsRectangle(
          boxsource.rectangles[51],
          new Rectangle(171.8279569892473, 209.03225806451613, 20, 20)
        )).to.be.true
    })

// FIXME: the cornerOpens* tests do not fail because of what they tests but because to many elements are added at the bottom

    it("cornerOpensLeftAndRight", function() {
        let path = new Path()
        path.setAttributes({stroke: "#000", fill: "none"})
        path.move(250,  20)
        path.line(400, 240)
        path.line(100, 240)
        path.close()
        path.updateSVG()
        document.getElementById("svg")!.appendChild(path.svg)

        let boxsource = new BoxSource()
        let wordwrap = new WordWrap(path, boxsource)
        
//        console.log(boxsource.rectangles.length)
        
        expect(boxsource.rectangles.length).to.equal(41)
        
        // FIXME: check some rectangles
    })

    it("cornerOpensToTheRight", function() {
        let path = new Path()
        path.setAttributes({stroke: "#000", fill: "none"})
        path.move(20,  20)
        path.line(400, 250)
        path.line(100, 250)
        path.close()
        path.updateSVG()
        document.getElementById("svg")!.appendChild(path.svg)

        let boxsource = new BoxSource()
        let wordwrap = new WordWrap(path, boxsource)
        
//        console.log(boxsource.rectangles.length)
        
        expect(boxsource.rectangles.length).to.equal(40)
        
        // FIXME: check some rectangles
    })

    it("cornerOpensToTheLeft", function() {
        let path = new Path()
        path.setAttributes({stroke: "#000", fill: "none"})
        path.move(480,  20)
        path.line(400, 250)
        path.line(100, 250)
        path.close()
        path.updateSVG()
        document.getElementById("svg")!.appendChild(path.svg)

        let boxsource = new BoxSource()
        let wordwrap = new WordWrap(path, boxsource)
        
//        console.log(boxsource.rectangles.length)
        
        expect(boxsource.rectangles.length).to.equal(40)
        
        // FIXME: check some rectangles
    })

    it("splitAndMergeSplicesOnce", function() {
        let path = new Path()
        path.setAttributes({stroke: "#000", fill: "none"})
        path.move( 20,  40)
        path.line(310,  40)
        path.line(320, 130)
        path.line(330,  40)
        path.line(620,  40)
        path.line(330, 450)
        path.line(320, 310)
        path.line(310, 450)
        path.close()
        path.updateSVG()
        document.getElementById("svg")!.appendChild(path.svg)

        let boxsource = new BoxSource()
        let wordwrap = new WordWrap(path, boxsource)
        
        expect(boxsource.rectangles.length).to.equal(180)

        expect(rectangleEqualsRectangle(
          boxsource.rectangles[0],
          new Rectangle(34.146341463414636, 40, 40, 20)
        )).to.be.true

        expect(rectangleEqualsRectangle(
          boxsource.rectangles[7],
          new Rectangle(254.14634146341464, 40, 20, 20)
        )).to.be.true

        expect(rectangleEqualsRectangle(
          boxsource.rectangles[8],
          new Rectangle(330, 40, 40, 20)
        )).to.be.true

        expect(rectangleEqualsRectangle(
          boxsource.rectangles[178],
          new Rectangle(260.4878048780488, 360, 40, 20)
        )).to.be.true

        expect(rectangleEqualsRectangle(
          boxsource.rectangles[179],
          new Rectangle(325, 360, 20, 20)
        )).to.be.true
    })

    it("cornerFitsOnlyAtBottom", function() {
        let path = new Path()
        path.setAttributes({stroke: "#000", fill: "none"})
        path.move( 20,  40)
        path.line(300,  40)
        path.line(320,  10)
        path.line(340,  40)
        path.line(620,  40)
        path.line(330, 450)
        path.line(320, 310)
        path.line(310, 450)
        path.close()
        path.updateSVG()
        document.getElementById("svg")!.appendChild(path.svg)

        let boxsource = new BoxSource()
        let wordwrap = new WordWrap(path, boxsource)
        
        expect(boxsource.rectangles.length).to.equal(168)
        
        expect(rectangleEqualsRectangle(
          boxsource.rectangles[0],
          new Rectangle(300, 40, 40, 20)
        )).to.be.true

        expect(rectangleEqualsRectangle(
          boxsource.rectangles[1],
          new Rectangle(48.29268292682927, 60, 20, 20)
        )).to.be.true

        expect(rectangleEqualsRectangle(
          boxsource.rectangles[167],
          new Rectangle(325, 360, 20, 20)
        )).to.be.true
    })

    it("cornerDoesNotFit", function() {
        let path = new Path()
        path.setAttributes({stroke: "#000", fill: "none"})
        path.move( 20,  40)
        path.line(310,  40)
        path.line(320,  10)
        path.line(330,  40)
        path.line(620,  40)
        path.line(330, 450)
        path.line(320, 310)
        path.line(310, 450)
        path.close()
        path.updateSVG()
        document.getElementById("svg")!.appendChild(path.svg)

        let boxsource = new BoxSource()
        let wordwrap = new WordWrap(path, boxsource)
        
        expect(boxsource.rectangles.length).to.not.equal(0)
    })
})