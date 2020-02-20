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

import { Point, Rectangle, Matrix, pointPlusSize, pointMinusPoint, pointMinus, pointPlusPoint, sizeMultiplyNumber, rotatePointAroundPointBy } from "../../src/shared/geometry"

import { Path } from "../../src/client/paths"
import * as figure from "../../src/client/figures"
import { Tool, SelectToolState } from "../../src/client/figuretools"
import { FigureEditorUser } from "../../src/client/figureeditor/FigureEditorUser"

declare global {
    interface SVGPathElement {
        d: string
        setPathData(data: any): void
        getPathData(): any
    }
}

describe.only("figureeditor", ()=> {
    
    describe("SelectTool", ()=> {

        describe("select", ()=> {
            describe("single figure", ()=> {
                it("no transformation", ()=> {
                    // GIVEN
                    let test = new FigureEditorUser()
                    let rectangle0 = new Rectangle(50, 50, 20, 30)
                    test.addRectangle(rectangle0)

                    // WHEN
                    test.mouseDownAt(new Point(60,65))
                    test.mouseUp()
            
                    // THEN
                    test.selectionHasRectangle(rectangle0)
                })
                it("translated", ()=>{
                    let test = new FigureEditorUser()
                    let rectangle0 = new Rectangle(50, 50, 20, 30)
                    test.addRectangle(rectangle0, new Point(100, 0))

                    // WHEN
                    test.mouseDownAt(new Point(60+100,65))
                    test.mouseUp()
            
                    // THEN
                    test.selectionHasRectangle(new Rectangle(50+100, 50, 20, 30))
                })
                it("scaled")
                it("rotated", ()=> {
                    // GIVEN
                    let test = new FigureEditorUser()
                    let rectangle0 = new Rectangle(50, 50, 20, 30)
                    let radiants = Math.PI/8
                    test.addRectangle(rectangle0, rectangle0.center(), radiants)

                    // WHEN
                    test.selectFigure()

                    // THEN
                    test.selectionHasRectangle(rectangle0, rectangle0.center(), radiants)
                })
                it("translated, scaled and rotated")
            })

            describe("group of figures", ()=> {
                it("no transformation", ()=> {
                    // GIVEN
                    let test = new FigureEditorUser()

                    let rectangle0 = new Rectangle(50, 50, 10, 20)
                    test.addRectangle(rectangle0)
                    
                    let rectangle1 = new Rectangle(70, 110, 30, 40)
                    test.addRectangle(rectangle1)

                    test.selectFigure(0)
                    test.selectFigure(1)

                    let r2 = new Rectangle(50,50,50,100)
                    test.selectionHasRectangle(r2)
                })
                it("same rotation", ()=> {
                    // GIVEN
                    let test = new FigureEditorUser()
                    let radiants = Math.PI/8

                    let rectangle0 = new Rectangle(50, 50, 10, 20)
                    test.addRectangle(rectangle0, rectangle0.center(), radiants)
                    
                    let rectangle1 = new Rectangle(70, 110, 30, 40)
                    test.addRectangle(rectangle1, rectangle1.center(), radiants)

                    test.selectFigure(0)
                    test.selectFigure(1)
           
                    let transform = new Matrix()
                    transform.translate(pointMinus(rectangle0.center()))
                    transform.rotate(radiants)
                    transform.translate(rectangle0.center())
                    let p = transform.transformPoint(rectangle0.origin)
                    test.selectionHasPoint(p)

                    transform = new Matrix()
                    transform.translate(pointMinus(rectangle1.center()))
                    transform.rotate(radiants)
                    transform.translate(rectangle1.center())
                    p = transform.transformPoint(pointPlusSize(rectangle1.origin, rectangle1.size))
                    test.selectionHasPoint(p)
                })
                it("rotated orthogonal to each other", ()=> {
                    // GIVEN
                    let test = new FigureEditorUser()
                    let radiants = Math.PI/8

                    let rectangle0 = new Rectangle(50, 50, 10, 20)
                    test.addRectangle(rectangle0, rectangle0.center(), radiants)
                    
                    let rectangle1 = new Rectangle(70, 110, 30, 40)
                    test.addRectangle(rectangle1, rectangle1.center(), radiants)

                    let rectangle2 = new Rectangle(60, 80, 5, 10)
                    test.addRectangle(rectangle2, rectangle2.center(), radiants + Math.PI/2)

                    let rectangle3 = new Rectangle(75, 80, 5, 10)
                    test.addRectangle(rectangle3, rectangle3.center(), radiants + Math.PI)

                    let rectangle4 = new Rectangle(90, 80, 5, 10)
                    test.addRectangle(rectangle4, rectangle4.center(), radiants + Math.PI*3/2)

                    test.selectFigure(0)
                    test.selectFigure(1)
                    test.selectFigure(2)
                    test.selectFigure(3)
                    test.selectFigure(4)
           
                    let transform = new Matrix()
                    transform.translate(pointMinus(rectangle0.center()))
                    transform.rotate(radiants)
                    transform.translate(rectangle0.center())
                    let p = transform.transformPoint(rectangle0.origin)
                    test.selectionHasPoint(p)

                    transform = new Matrix()
                    transform.translate(pointMinus(rectangle1.center()))
                    transform.rotate(radiants)
                    transform.translate(rectangle1.center())
                    p = transform.transformPoint(pointPlusSize(rectangle1.origin, rectangle1.size))
                    test.selectionHasPoint(p)                    
                })
                it("different rotation", ()=> {
                        // GIVEN
                        let test = new FigureEditorUser()
                        let radiants = Math.PI/8
    
                        let rectangle0 = new Rectangle(50, 50, 10, 20)
                        test.addRectangle(rectangle0, rectangle0.center(), radiants)
                        
                        let rectangle1 = new Rectangle(70, 110, 30, 40)
                        test.addRectangle(rectangle1, rectangle1.center(), radiants)

                        let rectangle2 = new Rectangle(60, 80, 5, 10)
                        test.addRectangle(rectangle2, rectangle2.center(), Math.PI/16)
    
                        test.selectFigure(0)
                        test.selectFigure(1)
                        test.selectFigure(2)
               
                        let transform = new Matrix()
                        transform.translate(pointMinus(rectangle0.center()))
                        transform.rotate(radiants)
                        transform.translate(rectangle0.center())
                        let p = {x: transform.transformPoint({x: rectangle0.origin.x, y: rectangle0.origin.y+rectangle0.size.height}).x,
                                 y: transform.transformPoint(rectangle0.origin).y }
                        test.selectionHasPoint(p)
    
                        transform = new Matrix()
                        transform.translate(pointMinus(rectangle1.center()))
                        transform.rotate(radiants)
                        transform.translate(rectangle1.center())
                        p = {x: transform.transformPoint({
                                x: rectangle1.origin.x+rectangle1.size.width, 
                                y: rectangle1.origin.y}).x,
                             y: transform.transformPoint({
                                 x: rectangle1.origin.x+rectangle1.size.width,
                                 y: rectangle1.origin.y+rectangle1.size.height}).y }
                        test.selectionHasPoint(p)
                })
            })
        })

        describe("move", ()=> {
            describe("single figure", ()=> {
                it("moves figure's outline before mouse is released", ()=> {
                    // GIVEN
                    let test = new FigureEditorUser()

                    let r0 = new Rectangle(50, 50, 20, 30)
                    let translation = new Point(10, -10)
                    let r1 = new Rectangle(r0)
                    r1.origin = pointPlusPoint(r1.origin, translation)
                    test.addRectangle(r0)

                    test.selectFigure(0)
                    test.selectionHasRectangle(r0)

                    // WHEN
                    let oldCenter = test.centerOfFigure()
                    test.mouseDownAt(oldCenter)
                    test.moveMouseBy(translation)
            
                    // THEN
                    test.selectionHasRectangle(r1)
                    test.outlineHasRectangle(r1)
                })
                it("moves figure when mouse is released", ()=> {
                    // GIVEN
                    let test = new FigureEditorUser()
                    let r0 = new Rectangle(50, 50, 20, 30)
                    let translation = new Point(10, -10)
                    test.addRectangle(r0)
                    test.selectFigure(0)
                    test.selectionHasRectangle(r0)

                    // WHEN
                    let oldCenter = test.centerOfFigure()
                    test.mouseDownAt(oldCenter)
                    test.moveMouseBy(translation)
                    test.mouseUp()

                    // THEN
                    let r1 = new Rectangle(r0)
                    r1.origin = pointPlusPoint(r1.origin, translation)
                    test.selectionHasRectangle(r1)
                    test.outlineHasRectangle(r1)
                    test.renderHasRectangle(r1)
                })
                it("translated")
                it("rotated", ()=> {
                    // GIVEN
                    let test = new FigureEditorUser()
                    let r0 = new Rectangle(50, 50, 20, 30)
                    test.addRectangle(r0, r0.center(), Math.PI/8)
                    test.selectFigure(0)
                    
                    // WHEN
                    test.mouseDownAt(r0.center())
                    let translation = new Point(100, 0)
                    test.moveMouseBy(translation)
                    test.mouseUp()

                    // THEN
                    let r1 = new Rectangle(r0)
                    r1.origin = pointPlusPoint(r1.origin, translation)

                    test.selectionHasRectangle(r1, r1.center(), Math.PI/8)
                    test.outlineHasRectangle(r1, r1.center(), Math.PI/8)
                    test.renderHasRectangle(r1, r1.center(), Math.PI/8)
                })
                it("scaled")
            })
        })
       
        describe("scale", ()=>{
            describe("single figure", ()=> {
                it("scales figure's outline before mouse is released", ()=>{
                    // GIVEN
                    let test = new FigureEditorUser()
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
                    // test.mouseUp()

                    // THEN
                    let scaled = new Rectangle(40, 65, 30, 15)
                    test.selectionHasRectangle(scaled)
                    test.outlineHasRectangle(scaled)
                })
                it("scales figure when mouse is released", ()=> {
                    // GIVEN
                    let test = new FigureEditorUser()
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
                    let scaled = new Rectangle(40, 65, 30, 15)
                    test.selectionHasRectangle(scaled)
                    test.outlineHasRectangle(scaled)
                    test.renderHasRectangle(scaled)
                })
            })
        })
        describe("rotate", ()=> {
            describe("single figure", ()=> {
                it("rotates figure's outline before mouse is released", ()=> {
                    // GIVEN
                    let test = new FigureEditorUser()
                    let rectangle = new Rectangle({ origin: {x:50.5, y: 50.5}, size: {width: 20, height: 30}})
                    let fig = new figure.Rectangle(rectangle)
                    fig.stroke = "#000"
                    fig.fill = "rgba(255,0,0,0.2)"

                    test.addFigure(fig)
                    test.selectFigure()

                    // WHEN
                    let oldMouseRotate = test.centerOfNWRotateHandle()
                    let center = test.centerOfFigure()
                    let newMouseRotate = rotatePointAroundPointBy(oldMouseRotate, center, Math.PI/8)

                    test.mouseDownAt(oldMouseRotate)
                    test.moveMouseTo(newMouseRotate)

                    // THEN
                    test.selectionHasRectangle(rectangle, rectangle.center(), Math.PI/8)
                    test.outlineHasRectangle(rectangle, rectangle.center(), Math.PI/8)
                })

                it("rotates figure when mouse is released", ()=> {
                    // GIVEN
                    let test = new FigureEditorUser()
                    let rectangle = new Rectangle({ origin: {x:50.5, y: 50.5}, size: {width: 20, height: 30}})
                    let fig = new figure.Rectangle(rectangle)
                    fig.stroke = "#000"
                    fig.fill = "rgba(255,0,0,0.2)"

                    test.addFigure(fig)
                    test.selectFigure()

                    // WHEN
                    let center = test.centerOfFigure()
                    let position0 = test.centerOfNWRotateHandle()
                    let position1 = rotatePointAroundPointBy(position0, center, Math.PI/8)

                    test.mouseDownAt(position0)
                    test.moveMouseTo(position1)
                    test.mouseUp()

                    // THEN
                    test.selectionHasRectangle(rectangle, center, Math.PI/8)
                    test.outlineHasRectangle(rectangle, center, Math.PI/8)
                    test.renderHasRectangle(rectangle, center, Math.PI/8)
                })

                it("rotates already rotated figure's outline before mouse is released", ()=> {
                    // GIVEN
                    let test = new FigureEditorUser()
                    let rectangle = new Rectangle({ origin: {x:50, y: 50}, size: {width: 20, height: 30}})
                    let fig = new figure.Rectangle(rectangle)
                    fig.stroke = "#000"
                    fig.fill = "rgba(255,0,0,0.2)"

                    test.addFigure(fig)
                    test.selectFigure()

                    // WHEN
                    let center = test.centerOfFigure()
                    // 45, 45
                    let position0 = test.centerOfNWRotateHandle()
                    let position1 = rotatePointAroundPointBy(position0, center, Math.PI/8)
                    let position2 = rotatePointAroundPointBy(position0, center, Math.PI/4)

                    test.mouseDownAt(position0)
                    expect(test.selectTool.state).is.equal(SelectToolState.MOVE_HANDLE)
                    expect(test.selectTool.selectedHandle).is.equal(8)
                    test.moveMouseTo(position1)
                    test.mouseUp()

                    // 2nd rotation
                    let p1 = {x: 48.5 + figure.Figure.HANDLE_RANGE / 2.0, y: 38.5 + figure.Figure.HANDLE_RANGE / 2.0}
                    position2 = rotatePointAroundPointBy(p1, center, Math.PI/8)

                    test.mouseDownAt(p1)
                    expect(test.selectTool.state).is.equal(SelectToolState.MOVE_HANDLE)
                    expect(test.selectTool.selectedHandle).is.equal(8)
                    test.moveMouseTo(position2)

                    // THEN
                    test.selectionHasRectangle(rectangle, center, Math.PI/4)
                    test.outlineHasRectangle(rectangle, center, Math.PI/4)
                })

                it("rotates already rotated figure when mouse is released", ()=> {
                    // GIVEN
                    let test = new FigureEditorUser()
                    let rectangle = new Rectangle({ origin: {x:50.5, y: 50.5}, size: {width: 20, height: 30}})
                    let fig = new figure.Rectangle(rectangle)
                    fig.stroke = "#000"
                    fig.fill = "rgba(255,0,0,0.2)"

                    test.addFigure(fig)
                    test.selectFigure()

                    // WHEN
                    let center = rectangle.center()
                    let position0 = test.centerOfNWRotateHandle()
                    let position1 = rotatePointAroundPointBy(position0, center, Math.PI/8)
                    let position2 = rotatePointAroundPointBy(position0, center, Math.PI/4)

                    // 1st rotation
                    test.mouseDownAt(position0)
                    expect(test.selectTool.state).is.equal(SelectToolState.MOVE_HANDLE)
                    expect(test.selectTool.selectedHandle).is.equal(8)
                    test.moveMouseTo(position1)
                    test.mouseUp()
                    test.selectionHasRectangle(rectangle, center, Math.PI/8)
                    test.renderHasRectangle(rectangle, center, Math.PI/8)

                    // 2nd rotation
                    let p1 = {x: 48.5 + figure.Figure.HANDLE_RANGE / 2.0, y: 38.5 + figure.Figure.HANDLE_RANGE / 2.0}
                    position2 = rotatePointAroundPointBy(p1, center, Math.PI/8)

                    test.mouseDownAt(p1)
                    expect(test.selectTool.state).is.equal(SelectToolState.MOVE_HANDLE)
                    expect(test.selectTool.selectedHandle).is.equal(8)
                    test.moveMouseTo(position2)
                    test.mouseUp()

                    // THEN            
                    test.selectionHasRectangle(rectangle, center, Math.PI/4)
                    test.renderHasRectangle(rectangle, center, Math.PI/4)
                    test.outlineHasRectangle(rectangle, center, Math.PI/4)
                })
                it("rotates a translated figure", ()=>{
                    // GIVEN
                    let test = new FigureEditorUser()
                    let rectangle0 = new Rectangle(50, 50, 20, 30)
                    let translate = new Point(100, 0)
                    test.addRectangle(rectangle0, translate)
                    test.selectFigure()

                    // WHEN
                    let handleRange = figure.Figure.HANDLE_RANGE
                    let center = pointPlusPoint(rectangle0.center(), translate)
                    let down = pointMinusPoint(
                        pointPlusPoint(rectangle0.origin, translate), {x: handleRange, y: handleRange})
                    let up = rotatePointAroundPointBy(down, center, Math.PI/8)

                    test.mouseDownAt(down)
                    test.moveMouseTo(up)
                    test.mouseUp()
            
                    // THEN
                    test.selectionHasRectangle(new Rectangle(50+100, 50, 20, 30), center, Math.PI/8)
                })
            })

            describe("group of figures", ()=> {
                it("rotate outline of two figures using nw handle before mouse is released", ()=> {
                    // GIVEN
                    let test = new FigureEditorUser()

                    let rectangle0 = new Rectangle(50, 50, 10, 20)
                    test.addRectangle(rectangle0)
                    
                    let rectangle1 = new Rectangle(70, 110, 30, 40)
                    test.addRectangle(rectangle1)

                    test.selectFigure(0)
                    test.selectFigure(1)

                    let r2 = new Rectangle(50,50,50,100)
                    test.selectionHasRectangle(r2)
                    // WHEN
                    let oldMouseRotate = test.centerOfNWRotateHandle()
                    let center = test.selectTool.boundary.center()
                    let newMouseRotate = rotatePointAroundPointBy(oldMouseRotate, center, Math.PI/4)

                    test.mouseDownAt(oldMouseRotate)
                    test.moveMouseTo(newMouseRotate)

                    // THEN
                    test.selectionHasRectangle(r2, center, Math.PI/4)
                    test.outlineHasRectangle(rectangle0, center, Math.PI/4)
                    test.outlineHasRectangle(rectangle1, center, Math.PI/4)
                })
                it("rotate two figures using nw handle", ()=> {
                    // GIVEN
                    let test = new FigureEditorUser()

                    let rectangle0 = new Rectangle(50, 50, 10, 20)
                    test.addRectangle(rectangle0)
                    
                    let rectangle1 = new Rectangle(70, 110, 30, 40)
                    test.addRectangle(rectangle1)

                    test.selectFigure(0)
                    test.selectFigure(1)

                    let r2 = new Rectangle(50,50,50,100)
                    test.selectionHasRectangle(r2)

                    // WHEN
                    let oldMouseRotate = test.centerOfNWRotateHandle()
                    let center = test.selectTool.boundary.center()
                    let newMouseRotate = rotatePointAroundPointBy(oldMouseRotate, center, Math.PI/4)

                    test.mouseDownAt(oldMouseRotate)
                    test.moveMouseTo(newMouseRotate)
                    test.mouseUp()

                    // THEN
                    test.selectionHasRectangle(r2, center, Math.PI/4)
                    test.outlineHasRectangle(rectangle0, center, Math.PI/4)
                    test.outlineHasRectangle(rectangle1, center, Math.PI/4)
                    test.renderHasRectangle(rectangle0, center, Math.PI/4)
                    test.renderHasRectangle(rectangle1, center, Math.PI/4)
                })

                //         it("rotate two figures using nw handle two times", () => {})
                //         it("rotate two figures using nw handle two times with deselect, select in between", () => {})
                //         it("select two figures with aligned 90 degree rotation will result in a rotated selection", () => {})
                //         it("select two figures with non-aligned rotation will result in a selection aligned to the screen", () => {})
            })

        })

    })


    describe("figureeditor's path and svg cache", ()=> {
        it("adding one figure creates one path and one svg", ()=> {
            let test = new FigureEditorUser()
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
            let test = new FigureEditorUser()
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
