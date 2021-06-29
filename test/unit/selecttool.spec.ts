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

import { Point, Rectangle, Matrix, pointPlusSize, pointMinusPoint, pointMinus, pointPlusPoint, sizeMultiplyNumber, rotatePointAroundPointBy } from "shared/geometry"

import * as figure from "client/figures"
import { Tool, SelectToolState } from "client/figuretools"
import { FigureEditorScene } from "./FigureEditorScene"

declare global {
    interface SVGPathElement {
        d: string
        setPathData(data: any): void
        getPathData(): any
    }
}

describe("FigureEditor", () => {

    describe("SelectTool", () => {

        describe("select", () => {
            describe("single figure", () => {
                it("no transformation", () => {
                    // GIVEN
                    let test = new FigureEditorScene()
                    let rectangle0 = new Rectangle(50.5, 50.5, 20, 30)
                    test.addRectangle(rectangle0)

                    // WHEN
                    test.mouseDownAt(new Point(60, 65))
                    test.mouseUp()

                    // THEN
                    test.selectionHasRectangle(rectangle0)
                })
                it("translated", () => {
                    let test = new FigureEditorScene()
                    let rectangle0 = new Rectangle(50, 50, 20, 30)
                    test.addRectangle(rectangle0, new Point(100, 0))

                    // WHEN
                    test.mouseDownAt(new Point(60 + 100, 65))
                    test.mouseUp()

                    // THEN
                    test.selectionHasRectangle(new Rectangle(50 + 100, 50, 20, 30))
                })
                it("scaled")
                it("rotated", () => {
                    // GIVEN
                    let test = new FigureEditorScene()
                    let rectangle0 = new Rectangle(50, 50, 20, 30)
                    let radiants = Math.PI / 8
                    test.addRectangle(rectangle0, rectangle0.center(), radiants)

                    // WHEN
                    test.selectFigure()

                    // THEN
                    test.selectionHasRectangle(rectangle0, rectangle0.center(), radiants)
                })
                it("translated, scaled and rotated")
            })

            describe("group of figures", () => {
                it("no transformation", () => {
                    // GIVEN
                    let test = new FigureEditorScene()

                    let rectangle0 = new Rectangle(50, 50, 10, 20)
                    test.addRectangle(rectangle0)

                    let rectangle1 = new Rectangle(70, 110, 30, 40)
                    test.addRectangle(rectangle1)

                    test.selectFigure(0)
                    test.selectFigure(1)

                    let r2 = new Rectangle(50, 50, 50, 100)
                    test.selectionHasRectangle(r2)
                })
                it("same rotation", () => {
                    // GIVEN
                    let test = new FigureEditorScene()
                    let radiants = Math.PI / 8

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
                it("rotated orthogonal to each other", () => {
                    // GIVEN
                    let test = new FigureEditorScene()
                    let radiants = Math.PI / 8

                    let rectangle0 = new Rectangle(50, 50, 10, 20)
                    test.addRectangle(rectangle0, rectangle0.center(), radiants)

                    let rectangle1 = new Rectangle(70, 110, 30, 40)
                    test.addRectangle(rectangle1, rectangle1.center(), radiants)

                    let rectangle2 = new Rectangle(60, 80, 5, 10)
                    test.addRectangle(rectangle2, rectangle2.center(), radiants + Math.PI / 2)

                    let rectangle3 = new Rectangle(75, 80, 5, 10)
                    test.addRectangle(rectangle3, rectangle3.center(), radiants + Math.PI)

                    let rectangle4 = new Rectangle(90, 80, 5, 10)
                    test.addRectangle(rectangle4, rectangle4.center(), radiants + Math.PI * 3 / 2)

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
                it("different rotation", () => {
                    // GIVEN
                    let test = new FigureEditorScene()
                    let radiants = Math.PI / 8

                    let rectangle0 = new Rectangle(50, 50, 10, 20)
                    test.addRectangle(rectangle0, rectangle0.center(), radiants)

                    let rectangle1 = new Rectangle(70, 110, 30, 40)
                    test.addRectangle(rectangle1, rectangle1.center(), radiants)

                    let rectangle2 = new Rectangle(60, 80, 5, 10)
                    test.addRectangle(rectangle2, rectangle2.center(), Math.PI / 16)

                    test.selectFigure(0)
                    test.selectFigure(1)
                    test.selectFigure(2)

                    let transform = new Matrix()
                    transform.translate(pointMinus(rectangle0.center()))
                    transform.rotate(radiants)
                    transform.translate(rectangle0.center())
                    let p = {
                        x: transform.transformPoint({ x: rectangle0.origin.x, y: rectangle0.origin.y + rectangle0.size.height }).x,
                        y: transform.transformPoint(rectangle0.origin).y
                    }
                    test.selectionHasPoint(p)

                    transform = new Matrix()
                    transform.translate(pointMinus(rectangle1.center()))
                    transform.rotate(radiants)
                    transform.translate(rectangle1.center())
                    p = {
                        x: transform.transformPoint({
                            x: rectangle1.origin.x + rectangle1.size.width,
                            y: rectangle1.origin.y
                        }).x,
                        y: transform.transformPoint({
                            x: rectangle1.origin.x + rectangle1.size.width,
                            y: rectangle1.origin.y + rectangle1.size.height
                        }).y
                    }
                    test.selectionHasPoint(p)
                })
            })
        })

        describe("marquee", () => {
            it("single figure", () => {
                // GIVEN
                let test = new FigureEditorScene()
                let rectangle0 = new Rectangle(50, 50, 20, 30)
                test.addRectangle(rectangle0)

                // WHEN
                test.mouseDownAt({ x: 45, y: 45 })
                test.moveMouseTo({ x: 75, y: 85 })
                test.mouseUp()

                // THEN
                test.selectionHasRectangle(rectangle0)
            })
            it("subset of group of figures", () => {
                // GIVEN
                let test = new FigureEditorScene()
                let innerRect0 = new Rectangle(50, 50, 10, 10)
                test.addRectangle(innerRect0)
                let innerRect1 = new Rectangle(70, 70, 10, 10)
                test.addRectangle(innerRect1)

                let leftRect = new Rectangle(30, 60, 10, 10)
                test.addRectangle(leftRect)
                let topRect = new Rectangle(60, 30, 10, 10)
                test.addRectangle(topRect)
                let rightRect = new Rectangle(90, 60, 10, 10)
                test.addRectangle(rightRect)
                let bottomRect = new Rectangle(60, 90, 10, 10)
                test.addRectangle(bottomRect)

                // WHEN
                test.mouseDownAt({ x: 45, y: 45 })
                test.moveMouseTo({ x: 85, y: 85 })
                test.mouseUp()

                // THEN
                test.selectionHasPoint(innerRect0.origin)
                test.selectionHasPoint(pointPlusSize(innerRect1.origin, innerRect1.size))
            })
            it("translated figure", () => {
                // GIVEN
                let test = new FigureEditorScene()
                let rectangle0 = new Rectangle(50, 50, 20, 30)
                test.addRectangle(rectangle0, { x: 100, y: 0 })

                // WHEN
                test.mouseDownAt({ x: 145, y: 45 })
                test.moveMouseTo({ x: 175, y: 85 })
                test.mouseUp()

                // THEN
                let rectangle1 = new Rectangle(150, 50, 20, 30)
                test.selectionHasRectangle(rectangle1)
            })
        })

        describe("move", () => {
            describe("single figure", () => {
                it("moves figure's outline before mouse is released", () => {
                    // GIVEN
                    let test = new FigureEditorScene()

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
                it("moves figure without matrix when mouse is released", () => {
                    // GIVEN
                    let test = new FigureEditorScene()
                    let r0 = new Rectangle(50.5, 50.5, 20, 30)
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
                    test.renderHasRectangle(r1) // when this fails then...? ah! actually moving is piped through the server!
                })
                it("moves figure with matrix when mouse is released", () => {
                    // GIVEN
                    let test = new FigureEditorScene()
                    let r0 = new Rectangle(50, 50, 20, 30)
                    let translation = new Point(10, -10)
                    test.addRectangle(r0, new Point(), 0)
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
                it("moves a translated figure")
                it("moves a rotated figure", () => {
                    // GIVEN
                    let test = new FigureEditorScene()
                    let r0 = new Rectangle(50, 50, 20, 30)
                    test.addRectangle(r0, r0.center(), Math.PI / 8)
                    test.selectFigure(0)

                    // WHEN
                    test.mouseDownAt(r0.center())
                    let translation = new Point(100, 0)
                    test.moveMouseBy(translation)
                    test.mouseUp()

                    // THEN
                    let r1 = new Rectangle(r0)
                    r1.origin = pointPlusPoint(r1.origin, translation)

                    test.selectionHasRectangle(r1, r1.center(), Math.PI / 8)
                    test.outlineHasRectangle(r1, r1.center(), Math.PI / 8)
                    test.renderHasRectangle(r1, r1.center(), Math.PI / 8)
                })
                it("moves a scaled figure")
            })
        })

        describe("scale", () => {
            describe("single figure", () => {
                it("scales figure's outline before mouse is released", () => {
                    // GIVEN
                    let test = new FigureEditorScene()
                    let rectangle = new Rectangle(50, 50, 20, 30)
                    test.addRectangle(rectangle)
                    test.selectFigure()
                    let down = new Point(rectangle.origin)
                    let up = new Point(40, 65)

                    // WHEN
                    test.mouseDownAt(down)
                    test.moveMouseTo(up)

                    // THEN
                    let scaled = new Rectangle(40, 65, 30, 15)
                    test.selectionHasRectangle(scaled)
                    test.outlineHasRectangle(scaled)
                })
                it("scales figure when mouse is released", () => {
                    // GIVEN
                    let test = new FigureEditorScene()
                    let rectangle = new Rectangle(50, 50, 20, 30)
                    test.addRectangle(rectangle)
                    test.selectFigure()
                    let down = new Point(rectangle.origin)
                    let up = new Point(40, 65)

                    // WHEN
                    test.mouseDownAt(down)
                    test.moveMouseTo(up)
                    test.mouseUp()

                    // THEN
                    let scaled = new Rectangle(40, 65, 30, 15)
                    test.selectionHasRectangle(scaled)
                    test.outlineHasRectangle(scaled)
                    test.renderHasRectangle(scaled)
                })
                it("scales already scaled figure's outline before mouse is released")
                it("scales already scaled figure when mouse is released")
                it("scales a translated figure")
                it("scales a rotated figure", () => {
                    // GIVEN
                    let test = new FigureEditorScene()
                    let rectangle = new Rectangle(50, 50, 20, 30)
                    let scaled = new Rectangle(40, 65, 30, 15)
                    test.addRectangle(rectangle, rectangle.center(), Math.PI / 8)
                    test.selectFigure()

                    // WHEN
                    let down = rotatePointAroundPointBy(rectangle.origin, rectangle.center(), Math.PI / 8)
                    let up = rotatePointAroundPointBy(scaled.origin, rectangle.center(), Math.PI / 8)
                    test.mouseDownAt(down)
                    test.moveMouseTo(up)
                    test.mouseUp()

                    // THEN
                    test.selectionHasRectangle(scaled, rectangle.center(), Math.PI / 8)
                    test.outlineHasRectangle(scaled, rectangle.center(), Math.PI / 8)
                    test.renderHasRectangle(scaled, rectangle.center(), Math.PI / 8)
                })
            })
            describe("group of figures", () => {
                it("scales outline of two figure before mouse is released", () => {
                    // GIVEN
                    let test = new FigureEditorScene()
                    let rect0 = new Rectangle(50, 50, 20, 30)
                    let rect1 = new Rectangle(100, 100, 40, 50)
                    test.addRectangle(rect0)
                    test.addRectangle(rect1)
                    test.selectFigure(0)
                    test.selectFigure(1)

                    let selection = new Rectangle(50, 50, 90, 100)
                    test.selectionHasRectangle(selection)

                    let down = new Point(rect0.origin)
                    let up = new Point(40, 60)

                    // WHEN
                    test.mouseDownAt(down)
                    test.moveMouseTo(up)
                    // test.mouseUp()

                    // THEN
                    let scaled = new Rectangle(40, 60, 100, 90)
                    test.selectionHasRectangle(scaled)
                    test.outlineHasPoint(scaled.origin)
                    test.outlineHasPoint(pointPlusSize(scaled.origin, scaled.size))
                    // test.renderHasRectangle(scaled)
                })
                it("scales two figures when mouse is released", () => {
                    // GIVEN
                    let test = new FigureEditorScene()
                    let rect0 = new Rectangle(50, 50, 20, 30)
                    let rect1 = new Rectangle(100, 100, 40, 50)
                    test.addRectangle(rect0)
                    test.addRectangle(rect1)
                    test.selectFigure(0)
                    test.selectFigure(1)

                    let selection = new Rectangle(50, 50, 90, 100)
                    test.selectionHasRectangle(selection)

                    let down = new Point(rect0.origin)
                    let up = new Point(40, 60)

                    // WHEN
                    test.mouseDownAt(down)
                    test.moveMouseTo(up)
                    test.mouseUp()

                    // THEN
                    let scaled = new Rectangle(40, 60, 100, 90)
                    test.selectionHasRectangle(scaled)
                    test.outlineHasPoint(scaled.origin)
                    test.outlineHasPoint(pointPlusSize(scaled.origin, scaled.size))
                    test.renderHasPoint(scaled.origin)
                    test.renderHasPoint(pointPlusSize(scaled.origin, scaled.size))

                    // followd by move & scale does not work, and other combinations also. might need to recalculate boundary!!! write some tests 1st!!!
                })
            })
        })
        describe("rotate", () => {
            describe("single figure", () => {
                it("rotates figure's outline before mouse is released", () => {
                    // GIVEN
                    let test = new FigureEditorScene()
                    let rectangle = new Rectangle({ origin: { x: 50.5, y: 50.5 }, size: { width: 20, height: 30 } })
                    let fig = new figure.Rectangle(rectangle)
                    fig.stroke = "#000"
                    fig.fill = "rgba(255,0,0,0.2)"

                    test.addFigure(fig)
                    test.selectFigure()

                    // WHEN
                    let oldMouseRotate = test.centerOfNWRotateHandle()
                    let center = test.centerOfFigure()
                    let newMouseRotate = rotatePointAroundPointBy(oldMouseRotate, center, Math.PI / 8)

                    test.mouseDownAt(oldMouseRotate)
                    test.moveMouseTo(newMouseRotate)

                    // THEN
                    test.selectionHasRectangle(rectangle, rectangle.center(), Math.PI / 8)
                    test.outlineHasRectangle(rectangle, rectangle.center(), Math.PI / 8)
                })

                it("rotates figure when mouse is released", () => {
                    // GIVEN
                    let test = new FigureEditorScene()
                    let rectangle = new Rectangle({ origin: { x: 50.5, y: 50.5 }, size: { width: 20, height: 30 } })
                    let fig = new figure.Rectangle(rectangle)
                    fig.stroke = "#000"
                    fig.fill = "rgba(255,0,0,0.2)"

                    test.addFigure(fig)
                    test.selectFigure()

                    // WHEN
                    let center = test.centerOfFigure()
                    let position0 = test.centerOfNWRotateHandle()
                    let position1 = rotatePointAroundPointBy(position0, center, Math.PI / 8)

                    test.mouseDownAt(position0)
                    test.moveMouseTo(position1)
                    test.mouseUp()

                    // THEN
                    test.selectionHasRectangle(rectangle, center, Math.PI / 8)
                    test.outlineHasRectangle(rectangle, center, Math.PI / 8)
                    test.renderHasRectangle(rectangle, center, Math.PI / 8)
                })

                it("rotates already rotated figure's outline before mouse is released", () => {
                    // GIVEN
                    let test = new FigureEditorScene()
                    let rectangle = new Rectangle({ origin: { x: 50, y: 50 }, size: { width: 20, height: 30 } })
                    let fig = new figure.Rectangle(rectangle)
                    fig.stroke = "#000"
                    fig.fill = "rgba(255,0,0,0.2)"

                    test.addFigure(fig)
                    test.selectFigure()

                    // WHEN
                    let center = test.centerOfFigure()
                    // 45, 45
                    let position0 = test.centerOfNWRotateHandle()
                    let position1 = rotatePointAroundPointBy(position0, center, Math.PI / 8)
                    let position2 = rotatePointAroundPointBy(position0, center, Math.PI / 4)

                    test.mouseDownAt(position0)
                    expect(test.selectTool.state).is.equal(SelectToolState.MOVE_HANDLE)
                    expect(test.selectTool.selectedHandle).is.equal(8)
                    test.moveMouseTo(position1)
                    test.mouseUp()

                    // 2nd rotation
                    let p1 = { x: 48.5 + figure.Figure.HANDLE_RANGE / 2.0, y: 38.5 + figure.Figure.HANDLE_RANGE / 2.0 }
                    position2 = rotatePointAroundPointBy(p1, center, Math.PI / 8)

                    test.mouseDownAt(p1)
                    expect(test.selectTool.state).is.equal(SelectToolState.MOVE_HANDLE)
                    expect(test.selectTool.selectedHandle).is.equal(8)
                    test.moveMouseTo(position2)

                    // THEN
                    test.selectionHasRectangle(rectangle, center, Math.PI / 4)
                    test.outlineHasRectangle(rectangle, center, Math.PI / 4)
                })

                it("rotates already rotated figure when mouse is released", () => {
                    // GIVEN
                    let test = new FigureEditorScene()
                    let rectangle = new Rectangle({ origin: { x: 50.5, y: 50.5 }, size: { width: 20, height: 30 } })
                    let fig = new figure.Rectangle(rectangle)
                    fig.stroke = "#000"
                    fig.fill = "rgba(255,0,0,0.2)"

                    test.addFigure(fig)
                    test.selectFigure()

                    // WHEN
                    let center = rectangle.center()
                    let position0 = test.centerOfNWRotateHandle()
                    let position1 = rotatePointAroundPointBy(position0, center, Math.PI / 8)
                    let position2 = rotatePointAroundPointBy(position0, center, Math.PI / 4)

                    // 1st rotation
                    test.mouseDownAt(position0)
                    expect(test.selectTool.state).is.equal(SelectToolState.MOVE_HANDLE)
                    expect(test.selectTool.selectedHandle).is.equal(8)
                    test.moveMouseTo(position1)
                    test.mouseUp()
                    test.selectionHasRectangle(rectangle, center, Math.PI / 8)
                    test.renderHasRectangle(rectangle, center, Math.PI / 8)

                    // 2nd rotation
                    let p1 = { x: 48.5 + figure.Figure.HANDLE_RANGE / 2.0, y: 38.5 + figure.Figure.HANDLE_RANGE / 2.0 }
                    position2 = rotatePointAroundPointBy(p1, center, Math.PI / 8)

                    test.mouseDownAt(p1)
                    expect(test.selectTool.state).is.equal(SelectToolState.MOVE_HANDLE)
                    expect(test.selectTool.selectedHandle).is.equal(8)
                    test.moveMouseTo(position2)
                    test.mouseUp()

                    // THEN            
                    test.selectionHasRectangle(rectangle, center, Math.PI / 4)
                    test.renderHasRectangle(rectangle, center, Math.PI / 4)
                    test.outlineHasRectangle(rectangle, center, Math.PI / 4)
                })
                it("rotates a translated figure", () => {
                    // GIVEN
                    let test = new FigureEditorScene()
                    let rectangle0 = new Rectangle(50, 50, 20, 30)
                    let translate = new Point(100, 0)
                    test.addRectangle(rectangle0, translate)
                    test.selectFigure()

                    // WHEN
                    let handleRange = figure.Figure.HANDLE_RANGE
                    let center = pointPlusPoint(rectangle0.center(), translate)
                    let down = pointMinusPoint(
                        pointPlusPoint(rectangle0.origin, translate), { x: handleRange, y: handleRange })
                    let up = rotatePointAroundPointBy(down, center, Math.PI / 8)

                    test.mouseDownAt(down)
                    test.moveMouseTo(up)
                    test.mouseUp()

                    // THEN
                    test.selectionHasRectangle(new Rectangle(50 + 100, 50, 20, 30), center, Math.PI / 8)
                })
                it("rotates a scaled figure")
            })

            describe("group of figures", () => {
                it("rotate outline of two figures using nw handle before mouse is released", () => {
                    // GIVEN
                    let test = new FigureEditorScene()

                    let rectangle0 = new Rectangle(50, 50, 10, 20)
                    test.addRectangle(rectangle0)

                    let rectangle1 = new Rectangle(70, 110, 30, 40)
                    test.addRectangle(rectangle1)

                    test.selectFigure(0)
                    test.selectFigure(1)

                    let r2 = new Rectangle(50, 50, 50, 100)
                    test.selectionHasRectangle(r2)
                    // WHEN
                    let oldMouseRotate = test.centerOfNWRotateHandle()
                    let center = test.selectTool.boundary.center()
                    let newMouseRotate = rotatePointAroundPointBy(oldMouseRotate, center, Math.PI / 4)

                    test.mouseDownAt(oldMouseRotate)
                    test.moveMouseTo(newMouseRotate)

                    // THEN
                    test.selectionHasRectangle(r2, center, Math.PI / 4)
                    test.outlineHasRectangle(rectangle0, center, Math.PI / 4)
                    test.outlineHasRectangle(rectangle1, center, Math.PI / 4)
                })
                it("rotate two figures using nw handle", () => {
                    // GIVEN
                    let test = new FigureEditorScene()

                    let rectangle0 = new Rectangle(50, 50, 10, 20)
                    test.addRectangle(rectangle0)

                    let rectangle1 = new Rectangle(70, 110, 30, 40)
                    test.addRectangle(rectangle1)

                    test.selectFigure(0)
                    test.selectFigure(1)

                    let r2 = new Rectangle(50, 50, 50, 100)
                    test.selectionHasRectangle(r2)

                    // WHEN
                    let oldMouseRotate = test.centerOfNWRotateHandle()
                    let center = test.selectTool.boundary.center()
                    let newMouseRotate = rotatePointAroundPointBy(oldMouseRotate, center, Math.PI / 4)

                    test.mouseDownAt(oldMouseRotate)
                    test.moveMouseTo(newMouseRotate)
                    test.mouseUp()

                    // THEN
                    test.selectionHasRectangle(r2, center, Math.PI / 4)
                    test.outlineHasRectangle(rectangle0, center, Math.PI / 4)
                    test.outlineHasRectangle(rectangle1, center, Math.PI / 4)
                    test.renderHasRectangle(rectangle0, center, Math.PI / 4)
                    test.renderHasRectangle(rectangle1, center, Math.PI / 4)
                })
            })
        })
        describe("delete", () => {
            it("single figure", () => {
                // GIVEN
                let test = new FigureEditorScene()
                let rectangle0 = new Rectangle(50, 50, 20, 30)
                test.addRectangle(rectangle0)

                // WHEN
                test.mouseDownAt({ x: 45, y: 45 })
                test.moveMouseTo({ x: 75, y: 85 })
                test.mouseUp()

                expect(test.model.layers[0].data.length).to.equal(1)
                test.keydown("Delete")

                // THEN
                expect(Tool.selection.empty()).to.be.true
                expect(test.model.layers[0].data.length).to.equal(0)
            })
            it("subset of group of figures", () => {
                // GIVEN
                let test = new FigureEditorScene()
                let innerRect0 = new Rectangle(50, 50, 10, 10)
                test.addRectangle(innerRect0)
                let innerRect1 = new Rectangle(70, 70, 10, 10)
                test.addRectangle(innerRect1)

                let leftRect = new Rectangle(30, 60, 10, 10)
                test.addRectangle(leftRect)
                let topRect = new Rectangle(60, 30, 10, 10)
                test.addRectangle(topRect)
                let rightRect = new Rectangle(90, 60, 10, 10)
                test.addRectangle(rightRect)
                let bottomRect = new Rectangle(60, 90, 10, 10)
                test.addRectangle(bottomRect)

                // WHEN
                test.mouseDownAt({ x: 45, y: 45 })
                test.moveMouseTo({ x: 85, y: 85 })
                test.mouseUp()

                expect(test.model.layers[0].data.length).to.equal(6)
                test.keydown("Delete")

                // THEN
                expect(Tool.selection.empty()).to.be.true
                expect(test.model.layers[0].data.length).to.equal(4)
            })


        })
        describe("lifecycle", () => {
            it("switch between operations (scale, move, scale)", () => {
                // GIVEN
                let test = new FigureEditorScene()
                let rect0 = new Rectangle(50, 50, 20, 30)
                test.addRectangle(rect0)
                test.selectFigure(0)

                // scale
                let rect1 = new Rectangle(40, 60, 30, 20)
                let down0 = new Point(rect0.origin)
                let up0 = new Point(rect1.origin)
                test.mouseDownAt(down0)
                test.moveMouseTo(up0)
                test.mouseUp()
                test.selectionHasRectangle(rect1)
                test.outlineHasRectangle(rect1)
                test.renderHasRectangle(rect1)

                // move
                let rect2 = new Rectangle(140, 60, 30, 20)
                let down1 = new Point(65, 65)
                let up1 = new Point(165, 65)
                test.mouseDownAt(down1)
                test.moveMouseTo(up1)
                test.mouseUp()
                test.selectionHasRectangle(rect2)
                test.outlineHasRectangle(rect2)
                test.renderHasRectangle(rect2)

                // scale
                let rect3 = new Rectangle(130, 70, 40, 10)
                let down2 = new Point(rect2.origin)
                let up2 = new Point(rect3.origin)
                test.mouseDownAt(down2)
                test.moveMouseTo(up2)
                test.mouseUp()
                test.selectionHasRectangle(rect3)
                test.outlineHasRectangle(rect3)
                test.renderHasRectangle(rect3)
            })
        })
    })

    describe("figureeditor's path and svg cache", () => {
        it("adding one figure creates one path and one svg", () => {
            let test = new FigureEditorScene()
            let fig1 = new figure.Rectangle({ origin: { x: 50, y: 50 }, size: { width: 20, height: 30 } })
            test.addFigure(fig1)

            // cache should contain figure, path & svg
            let cache = test.figureeditor.cache
            expect(cache.size).to.equal(1)
            let ce = cache.get(0)!!
            expect(ce.figure).to.equal(fig1)
            expect(ce.path).to.not.undefined
            expect(ce.svg).to.not.undefined

            // screen should contain svg
            expect(test.figureeditor.layer!!.childNodes[0]).to.equal(ce.svg)
        })

        it("adding two figures creates two paths and two svgs", () => {
            let test = new FigureEditorScene()
            let fig1 = new figure.Rectangle({ origin: { x: 50, y: 10 }, size: { width: 20, height: 30 } })
            test.addFigure(fig1)

            let fig2 = new figure.Rectangle({ origin: { x: 50, y: 50 }, size: { width: 10, height: 40 } })
            test.addFigure(fig2)

            // cache should contain figure, path & svg
            let cache = test.figureeditor.cache
            expect(cache.size).to.equal(2)
            let ce1 = cache.get(0)!
            expect(ce1.figure).to.equal(fig1)
            expect(ce1.path).to.not.undefined
            expect(ce1.svg).to.not.undefined

            let ce2 = cache.get(1)!
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
