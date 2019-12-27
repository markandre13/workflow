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


import { expect, use } from "chai"
import chaiAlmost = require('chai-almost')
use(chaiAlmost())

import { Matrix, pointPlusSize, pointMinusPoint, Point, pointPlusPoint, sizeMultiplyNumber, rotatePointAroundPointBy } from "../../src/shared/geometry"

import * as path from "../../src/client/paths"
import * as figure from "../../src/client/figures"
import * as tool from "../../src/client/figuretools"
import { EditorEvent, FigureEditor, Layer, LayerModel } from "../../src/client/figureeditor"
import { Tool, SelectTool } from "../../src/client/figuretools";
import { Figure } from "../../src/shared/workflow_valueimpl";
import { LocalLayerModel } from "../../src/client/figureeditor/LocalLayerModel"
import { LocalLayer } from "../../src/client/figureeditor/LocalLayer"
import { FigureEditorPageObject } from "../../src/client/figureeditor/FigureEditorPageObject"

declare global {
    interface SVGPathElement {
        d: string
        setPathData(data: any): void
        getPathData(): any
    }
}

describe.only("figureeditor", function() {
    
    describe("figure to path", function() {

        it("rectangle", function() {
            let fig000 = new figure.Rectangle({
                origin: { x: 10, y: 20 },
                size: { width: 30, height: 40 }
            })
            let grp000 = fig000.getPath() as path.Path
            expect(grp000.svg.tagName).to.equal("path")
            expect(grp000.svg.getAttribute("d")).to.equal("M 10 20 L 40 20 L 40 60 L 10 60 Z")
        })
        
        it("group", function() {
            let fig000 = new figure.Rectangle({
                origin: { x: 10, y: 20 },
                size: { width: 30, height: 40 }
            })
            let fig001 = new figure.Rectangle({
                origin: { x: 50, y: 60 },
                size: { width: 70, height: 80 }
            })
            let fig002 = new figure.Group()
            fig002.add(fig000)
            fig002.add(fig001)
            let grp002 = fig002.getPath() as path.Path
            grp002.updateSVG()
            expect(grp002.svg.tagName).to.equal("g")
            expect(grp002.svg.children.length).to.equal(2)
            expect(grp002.svg.children[0].getAttribute("d")).to.equal("M 10 20 L 40 20 L 40 60 L 10 60 Z")
            expect(grp002.svg.children[1].getAttribute("d")).to.equal("M 50 60 L 120 60 L 120 140 L 50 140 Z")
        })

        describe("transform", function() {
            it("transform from raw data", function() {
                let fig000 = new figure.Rectangle({
                    origin: { x: 10, y: 20 },
                    size: { width: 30, height: 40 }
                })
                let fig001 = new figure.Transform()
                
                let matrix = new Matrix()
                matrix.scale(2, 2)
                fig001.matrix = matrix
                fig001.children.push(fig000)

                let grp001 = fig001.getPath() as path.Path
                grp001.updateSVG()

                expect(grp001.svg.tagName).to.equal("g")
                expect(grp001.svg.children.length).to.equal(1)
                expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
            })
        
            it("transform, add, getPath", function() {
                let fig000 = new figure.Rectangle({
                    origin: { x: 10, y: 20 },
                    size: { width: 30, height: 40 }
                })
                let fig001 = new figure.Transform()
                
                let matrix = new Matrix()
                matrix.scale(2, 2)
                fig001.transform(matrix)

                fig001.add(fig000)

                let grp001 = fig001.getPath() as path.Path
                grp001.updateSVG()

                expect(grp001.svg.tagName).to.equal("g")
                expect(grp001.svg.children.length).to.equal(1)
                expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
            })
            
            it("add, transform, getPath", function() {
                let fig000 = new figure.Rectangle({
                    origin: { x: 10, y: 20 },
                    size: { width: 30, height: 40 }
                })
                let fig001 = new figure.Transform()
                fig001.add(fig000)

                let matrix = new Matrix()
                matrix.scale(2, 2)
                fig001.transform(matrix)
                
                let grp001 = fig001.getPath() as path.Path
                grp001.updateSVG()
                
                expect(grp001.svg.tagName).to.equal("g")
                expect(grp001.svg.children.length).to.equal(1)
                expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
            })

            it("transform, getPath, add", function() {
                let fig000 = new figure.Rectangle({
                    origin: { x: 10, y: 20 },
                    size: { width: 30, height: 40 }
                })
                let fig001 = new figure.Transform()

                let matrix = new Matrix()
                matrix.scale(2, 2)
                fig001.transform(matrix)

                let grp001 = fig001.getPath() as path.Path

                fig001.add(fig000)
                
                grp001.updateSVG()
                
                expect(grp001.svg.tagName).to.equal("g")
                expect(grp001.svg.children.length).to.equal(1)
                expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
            })

            it("add, getPath, transform", function() {
                let fig000 = new figure.Rectangle({
                    origin: { x: 10, y: 20 },
                    size: { width: 30, height: 40 }
                })
                let fig001 = new figure.Transform()

                fig001.add(fig000)

                let grp001 = fig001.getPath() as path.Path

                let matrix = new Matrix()
                matrix.scale(2, 2)
                fig001.transform(matrix)
                
                grp001.updateSVG()
                
                expect(grp001.svg.tagName).to.equal("g")
                expect(grp001.svg.children.length).to.equal(1)
                expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
            })

            it("getPath, add, transform", function() {
                let fig000 = new figure.Rectangle({
                    origin: { x: 10, y: 20 },
                    size: { width: 30, height: 40 }
                })
                let fig001 = new figure.Transform()

                let grp001 = fig001.getPath() as path.Path

                fig001.add(fig000)

                let matrix = new Matrix()
                matrix.scale(2, 2)
                fig001.transform(matrix)
                
                grp001.updateSVG()
                
                expect(grp001.svg.tagName).to.equal("g")
                expect(grp001.svg.children.length).to.equal(1)
                expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
            })

            it("getPath, transform, add", function() {
                let fig000 = new figure.Rectangle({
                    origin: { x: 10, y: 20 },
                    size: { width: 30, height: 40 }
                })
                let fig001 = new figure.Transform()

                let grp001 = fig001.getPath() as path.Path

                let matrix = new Matrix()
                matrix.scale(2, 2)
                fig001.transform(matrix)
                
                fig001.add(fig000)

                grp001.updateSVG()

                expect(grp001.svg.tagName).to.equal("g")
                expect(grp001.svg.children.length).to.equal(1)
                expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
            })
        })
        
        describe("outline", function() {
            it("rectangle", function() {
                let fig = new figure.Rectangle({
                    origin: { x: 10, y: 20 },
                    size: { width: 30, height: 40 }
                })
                let path = fig.getPath() as path.Path
                path.updateSVG()
                
                let outline = tool.Tool.createOutlineCopy(path)
                
                expect(outline.svg.tagName).to.equal("path")
                expect(outline.svg.getAttribute("d")).to.equal("M 10 20 L 40 20 L 40 60 L 10 60 Z")
            })

            it("transform, rectangle", function() {            
                let fig000 = new figure.Rectangle({
                    origin: { x: 10, y: 20 },
                    size: { width: 30, height: 40 }
                })
                let fig001 = new figure.Transform()
                
                let matrix = new Matrix()
                matrix.scale(2, 2)
                fig001.matrix = matrix
                fig001.children.push(fig000)

                let path = fig001.getPath() as path.Path
                path.updateSVG()
                
                let outline = tool.Tool.createOutlineCopy(path)
                outline.updateSVG()

                expect(outline.svg.tagName).to.equal("g")
                expect(outline.svg.children.length).to.equal(1)
                expect(outline.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
            })
        })
    })

    describe("SelectTool", ()=> {

        this.beforeAll(()=>{
            // console.log("before all select tool tests")
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
       
        it("scale single figure using nw handle", ()=> {
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

        it("rotate single figure using nw handle", ()=> {
            // GIVEN
            let test = new FigureEditorPageObject()
            test.addRectangle()
            test.selectFigure()

            // WHEN
            let oldMouseRotate = test.centerOfNWRotateHandle()
            let center = test.centerOfFigure()
            let newMouseRotate = rotatePointAroundPointBy(oldMouseRotate, center, Math.PI/2)

            test.mouseDownAt(oldMouseRotate)
            test.moveMouseTo(newMouseRotate)
            test.mouseUp()

            // THEN
            let newFig = Tool.selection.selection.values().next().value
            let p = newFig.getPath() as path.PathGroup
            p.updateSVG()
            let p1 = p.data[0] as path.Path
            expect(p1.path[0].values).to.almost.eql([75, 55])
            expect(p1.path[1].values).to.almost.eql([75, 75])
            expect(p1.path[2].values).to.almost.eql([45, 75])
            expect(p1.path[3].values).to.almost.eql([45, 55])
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
       it("rotate single figure using nw handle two times", () => {
           // TODO: this is where it becomes interesting...
           // STEPS:
           // o rotate, release
       })

       it("rotate two figures using nw handle two times", () => {})
       it("rotate two figures using nw handle two times with deselect, select in between", () => {})
       it("select two figures with aligned 90 degree rotation will result in a rotated selection", () => {})
       it("select two figures with non-aligned rotation will result in a selection aligned to the screen", () => {})
    })
})

