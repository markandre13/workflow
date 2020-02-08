/*
 *  workflow - A collaborative real-time white- and kanban board
 *  Copyright (C) 2020 Mark-André Hopf <mhopf@mark13.org>
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

import { expect, use } from "chai"
import chaiAlmost = require('chai-almost')
use(chaiAlmost())

import { Point, Rectangle, Matrix, pointPlusSize, pointMinusPoint, pointPlusPoint, sizeMultiplyNumber, rotatePointAroundPointBy } from "../../src/shared/geometry"

import * as path from "../../src/client/paths"
import * as figure from "../../src/client/figures"
import * as tool from "../../src/client/figuretools"
import { Tool, SelectTool } from "../../src/client/figuretools";
import { FigureEditorPageObject } from "../../src/client/figureeditor/FigureEditorPageObject"
import { LocalLayerModel } from "../../src/client/figureeditor/LocalLayerModel"
import { LocalLayer } from "../../src/client/figureeditor/LocalLayer"

import { AbstractPath } from "../../src/client/paths"

declare global {
    interface SVGPathElement {
        d: string
        setPathData(data: any): void
        getPathData(): any
    }
}

describe.only("figureeditor", function() {
    
    // describe("figure to path", function() {

    //     it("rectangle", function() {
    //         let fig000 = new figure.Rectangle({
    //             origin: { x: 10, y: 20 },
    //             size: { width: 30, height: 40 }
    //         })
    //         let grp000 = fig000.getPath() as path.Path
    //         expect(grp000.svg.tagName).to.equal("path")
    //         expect(grp000.svg.getAttribute("d")).to.equal("M 10 20 L 40 20 L 40 60 L 10 60 Z")
    //     })
        
    //     it("group", function() {
    //         let fig000 = new figure.Rectangle({
    //             origin: { x: 10, y: 20 },
    //             size: { width: 30, height: 40 }
    //         })
    //         let fig001 = new figure.Rectangle({
    //             origin: { x: 50, y: 60 },
    //             size: { width: 70, height: 80 }
    //         })
    //         let fig002 = new figure.Group()
    //         fig002.add(fig000)
    //         fig002.add(fig001)
    //         let grp002 = fig002.getPath() as path.Path
    //         grp002.updateSVG()
    //         expect(grp002.svg.tagName).to.equal("g")
    //         expect(grp002.svg.children.length).to.equal(2)
    //         expect(grp002.svg.children[0].getAttribute("d")).to.equal("M 10 20 L 40 20 L 40 60 L 10 60 Z")
    //         expect(grp002.svg.children[1].getAttribute("d")).to.equal("M 50 60 L 120 60 L 120 140 L 50 140 Z")
    //     })

    //     describe("transform", function() {
    //         it("transform from raw data", function() {
    //             let fig000 = new figure.Rectangle({
    //                 origin: { x: 10, y: 20 },
    //                 size: { width: 30, height: 40 }
    //             })
    //             let fig001 = new figure.Transform()
                
    //             let matrix = new Matrix()
    //             matrix.scale(2, 2)
    //             fig001.matrix = matrix
    //             fig001.childFigures.push(fig000)

    //             let grp001 = fig001.getPath() as path.Path
    //             grp001.updateSVG()

    //             expect(grp001.svg.tagName).to.equal("g")
    //             expect(grp001.svg.children.length).to.equal(1)
    //             expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
    //         })
        
    //         it("transform, add, getPath", function() {
    //             let fig000 = new figure.Rectangle({
    //                 origin: { x: 10, y: 20 },
    //                 size: { width: 30, height: 40 }
    //             })
    //             let fig001 = new figure.Transform()
                
    //             let matrix = new Matrix()
    //             matrix.scale(2, 2)
    //             fig001.transform(matrix)

    //             fig001.add(fig000)

    //             let grp001 = fig001.getPath() as path.Path
    //             grp001.updateSVG()

    //             expect(grp001.svg.tagName).to.equal("g")
    //             expect(grp001.svg.children.length).to.equal(1)
    //             expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
    //         })
            
    //         it("add, transform, getPath", function() {
    //             let fig000 = new figure.Rectangle({
    //                 origin: { x: 10, y: 20 },
    //                 size: { width: 30, height: 40 }
    //             })
    //             let fig001 = new figure.Transform()
    //             fig001.add(fig000)

    //             let matrix = new Matrix()
    //             matrix.scale(2, 2)
    //             fig001.transform(matrix)
                
    //             let grp001 = fig001.getPath() as path.Path
    //             grp001.updateSVG()
                
    //             expect(grp001.svg.tagName).to.equal("g")
    //             expect(grp001.svg.children.length).to.equal(1)
    //             expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
    //         })

    //         it("transform, getPath, add", function() {
    //             let fig000 = new figure.Rectangle({
    //                 origin: { x: 10, y: 20 },
    //                 size: { width: 30, height: 40 }
    //             })
    //             let fig001 = new figure.Transform()

    //             let matrix = new Matrix()
    //             matrix.scale(2, 2)
    //             fig001.transform(matrix)

    //             let grp001 = fig001.getPath() as path.Path

    //             fig001.add(fig000)
                
    //             grp001.updateSVG()
                
    //             expect(grp001.svg.tagName).to.equal("g")
    //             expect(grp001.svg.children.length).to.equal(1)
    //             expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
    //         })

    //         it("add, getPath, transform", function() {
    //             let fig000 = new figure.Rectangle({
    //                 origin: { x: 10, y: 20 },
    //                 size: { width: 30, height: 40 }
    //             })
    //             let fig001 = new figure.Transform()

    //             fig001.add(fig000)

    //             let grp001 = fig001.getPath() as path.Path

    //             let matrix = new Matrix()
    //             matrix.scale(2, 2)
    //             fig001.transform(matrix)
                
    //             grp001.updateSVG()
                
    //             expect(grp001.svg.tagName).to.equal("g")
    //             expect(grp001.svg.children.length).to.equal(1)
    //             expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
    //         })

    //         it("getPath, add, transform", function() {
    //             let fig000 = new figure.Rectangle({
    //                 origin: { x: 10, y: 20 },
    //                 size: { width: 30, height: 40 }
    //             })
    //             let fig001 = new figure.Transform()

    //             let grp001 = fig001.getPath() as path.Path

    //             fig001.add(fig000)

    //             let matrix = new Matrix()
    //             matrix.scale(2, 2)
    //             fig001.transform(matrix)
                
    //             grp001.updateSVG()
                
    //             expect(grp001.svg.tagName).to.equal("g")
    //             expect(grp001.svg.children.length).to.equal(1)
    //             expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
    //         })

    //         it("getPath, transform, add", function() {
    //             let fig000 = new figure.Rectangle({
    //                 origin: { x: 10, y: 20 },
    //                 size: { width: 30, height: 40 }
    //             })
    //             let fig001 = new figure.Transform()

    //             let grp001 = fig001.getPath() as path.Path

    //             let matrix = new Matrix()
    //             matrix.scale(2, 2)
    //             fig001.transform(matrix)
                
    //             fig001.add(fig000)

    //             grp001.updateSVG()

    //             expect(grp001.svg.tagName).to.equal("g")
    //             expect(grp001.svg.children.length).to.equal(1)
    //             expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
    //         })
    //     })
        
    //     describe("outline", function() {
    //         it("rectangle", function() {
    //             let fig = new figure.Rectangle({
    //                 origin: { x: 10, y: 20 },
    //                 size: { width: 30, height: 40 }
    //             })
    //             let path = fig.getPath() as path.Path
    //             path.updateSVG()
                
    //             let outline = tool.Tool.createOutlineCopy(path)
                
    //             expect(outline.svg.tagName).to.equal("path")
    //             expect(outline.svg.getAttribute("d")).to.equal("M 10 20 L 40 20 L 40 60 L 10 60 Z")
    //         })

    //         it("transform, rectangle", function() {            
    //             let fig000 = new figure.Rectangle({
    //                 origin: { x: 10, y: 20 },
    //                 size: { width: 30, height: 40 }
    //             })
    //             let fig001 = new figure.Transform()
                
    //             let matrix = new Matrix()
    //             matrix.scale(2, 2)
    //             fig001.matrix = matrix
    //             fig001.childFigures.push(fig000)

    //             let path = fig001.getPath() as path.Path
    //             path.updateSVG()
                
    //             let outline = tool.Tool.createOutlineCopy(path)
    //             outline.updateSVG()

    //             expect(outline.svg.tagName).to.equal("g")
    //             expect(outline.svg.children.length).to.equal(1)
    //             expect(outline.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
    //         })
    //     })
    // })

    describe("SelectTool", ()=> {

        this.beforeAll(()=>{
            // console.log("before all select tool tests")
        })

        it("normal selection decoration", ()=> {
            // GIVEN
            let test = new FigureEditorPageObject()
            test.addRectangle()

            // WHEN
            test.selectFigure()

            // THEN
            // { origin: {x:50, y: 50}, size: {width: 20, height: 30}}
            test.selectionHasCorner({x: 50.5, y: 50.5})
            test.selectionHasCorner({x: 70.5, y: 50.5})
            test.selectionHasCorner({x: 70.5, y: 80.5})
            test.selectionHasCorner({x: 50.5, y: 80.5})
       })

        it("move single figure", ()=> {
            // GIVEN
            let test = new FigureEditorPageObject()
            test.addRectangle()
            test.selectFigure()
            
            // WHEN
            let oldCenter = test.centerOfFigure()
            test.mouseDownAt(oldCenter)
            let translation = new Point(17, -29)
            test.moveMouseBy(translation)
            test.mouseUp()

            // THEN
            let newCenter = pointPlusPoint(oldCenter, translation)
            expect(test.centerOfFigure()).to.eql(newCenter)
        })
       
        it("scales figure", ()=> {
            // GIVEN
            let test = new FigureEditorPageObject()
            let rectangle = new figure.Rectangle({ origin: {x:50, y: 50}, size: {width: 20, height: 30}})
            rectangle.stroke = "#000"
            rectangle.fill = "#f00"
            test.addFigure(rectangle)
            test.selectFigure()
            let oldNWCorner = new Point(rectangle.origin)
            let oldSECorner = pointPlusSize(rectangle.origin, rectangle.size)

            // WHEN
            test.mouseDownAt(oldNWCorner)
            let newNWCorner = new Point(40, 65)
            test.moveMouseTo(newNWCorner)
            test.mouseUp()

            // THEN
            expect(rectangle.origin).to.eql(newNWCorner)
            let newSECorner = pointPlusSize(rectangle.origin, rectangle.size)
            expect(oldSECorner).to.eql(newSECorner)
        })

        it("rotates figure's outline before mouse is released", ()=> {
            // GIVEN
            let test = new FigureEditorPageObject()
            let rectangle = new Rectangle({ origin: {x:50, y: 50}, size: {width: 20, height: 30}})
            let fig = new figure.Rectangle(rectangle)
            fig.stroke = "#000"
            fig.fill = "rgba(255,0,0,0.2)"

            test.addFigure(fig)
            test.selectFigure()

            // WHEN
            let oldMouseRotate = test.centerOfNWRotateHandle()
            let center = test.centerOfFigure()
            let newMouseRotate = rotatePointAroundPointBy(oldMouseRotate, center, Math.PI/4)

            test.mouseDownAt(oldMouseRotate)
            test.moveMouseTo(newMouseRotate)

            // THEN
            test.selectionIsRectangle(rectangle, rectangle.center(), Math.PI/4)

            throw Error("check outline")
            // throw Error("check figure")
        })

        it.only("rotates figure when mouse is released", ()=> {
            // GIVEN
            let test = new FigureEditorPageObject(true)
            let rectangle = new Rectangle({ origin: {x:50, y: 50}, size: {width: 20, height: 30}})
            let fig = new figure.Rectangle(rectangle)
            fig.stroke = "#000"
            fig.fill = "rgba(255,0,0,0.2)"

            test.addFigure(fig)
            test.selectFigure()

            // WHEN
            let oldMouseRotate = test.centerOfNWRotateHandle()
            let center = test.centerOfFigure()
            let newMouseRotate = rotatePointAroundPointBy(oldMouseRotate, center, Math.PI/4)

            test.mouseDownAt(oldMouseRotate)
            test.moveMouseTo(newMouseRotate)
            test.mouseUp()

            // THEN
            test.selectionIsRectangle(rectangle, rectangle.center(), Math.PI/4)
            throw Error("check outline")
            throw Error("check figure")
        })


        it("rotate two figures using nw handle", () => {
            // GIVEN
            let test = new FigureEditorPageObject()
            let rectangle0 = new figure.Rectangle({ origin: {x:50, y: 50}, size: {width: 20, height: 30}})
            rectangle0.stroke = "#000"
            rectangle0.fill = "#f00"
            test.addFigure(rectangle0)
            
            let rectangle1 = new figure.Rectangle({ origin: {x:100, y: 100}, size: {width: 20, height: 30}})
            rectangle1.stroke = "#000"
            rectangle1.fill = "#f00"
            test.addFigure(rectangle1)

            test.selectFigure(0)
            test.selectFigure(1)

            expect(Tool.selection.selection.size).to.equal(2)
            expect(test.selectTool.boundary).to.almost.eql({origin: {x: 50, y: 50}, size: {width: 70, height: 80}})
            expect(test.selectTool.transformation.isIdentity()).to.be.true

            // WHEN
            let oldMouseRotate = test.centerOfNWRotateHandle()
            let center = test.selectTool.boundary.center()
            let newMouseRotate = rotatePointAroundPointBy(oldMouseRotate, center, Math.PI/4)

            test.mouseDownAt(oldMouseRotate)
            test.moveMouseTo(newMouseRotate)
            test.mouseUp()

            // THEN
            let boundary = test.selectTool.boundary
            let transformation = test.selectTool.transformation

            console.log(boundary)
            console.log(transformation)
            // TODO: write test

            // let oldMouseRotate = test.centerOfNWRotateHandle()
       })
       it("rotate two figures using nw handle two times", () => {})
       it("rotate two figures using nw handle two times with deselect, select in between", () => {})
       it("select two figures with aligned 90 degree rotation will result in a rotated selection", () => {})
       it("select two figures with non-aligned rotation will result in a selection aligned to the screen", () => {})
    })


    describe("figureeditor's path and svg cache", ()=> {
        it("adding one figure creates one path and one svg", ()=> {
            let test = new FigureEditorPageObject(true)
            let fig1 = new figure.Rectangle({ origin: {x:50, y: 50}, size: {width: 20, height: 30}})
            fig1.id = 1
            test.addFigure(fig1)

            // cache should contain figure, path & svg
            let cache = test.figureeditor.cache
            expect(cache.size).to.equal(1)
            let ce = cache.get(1)!!
            expect(ce.figure).to.equal(fig1)
            expect(ce.path).to.not.undefined
            expect(ce.svg).to.not.undefined

            // screen should contain svg
            expect(test.figureeditor.layer!!.childNodes[0]).to.equal(ce.svg)
        })

        it("adding two figures creates two paths and two svgs", ()=> {
            let test = new FigureEditorPageObject(true)
            let fig1 = new figure.Rectangle({ origin: {x:50, y: 10}, size: {width: 20, height: 30}})
            fig1.id = 1
            test.addFigure(fig1)

            let fig2 = new figure.Rectangle({ origin: {x:50, y: 50}, size: {width: 10, height: 40}})
            fig2.id = 2
            test.addFigure(fig2)

            // cache should contain figure, path & svg
            let cache = test.figureeditor.cache
            expect(cache.size).to.equal(2)
            let ce1 = cache.get(1)!
            expect(ce1.figure).to.equal(fig1)
            expect(ce1.path).to.not.undefined
            expect(ce1.svg).to.not.undefined

            let ce2 = cache.get(2)!
            expect(ce2.figure).to.equal(fig2)
            expect(ce2.path).to.not.undefined
            expect(ce2.svg).to.not.undefined

            // screen should contain svg
            expect(test.figureeditor.layer!!.childNodes[0]).to.equal(ce1.svg)
            expect(test.figureeditor.layer!!.childNodes[1]).to.equal(ce2.svg)
        })

        // the above tests should cover the current initial test data
        // now write a test to cover moving an image
        // then try it with the actual app in real
        // rotate
        // scale
        // handle
        // group
        // ...
    })
})
