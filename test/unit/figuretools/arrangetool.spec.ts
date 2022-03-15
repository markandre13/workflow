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

import { expect, use } from '@esm-bundle/chai'
// import chaiAlmost from "chai-almost"
// use(chaiAlmost())

import { initializeCORBAValueTypes } from "client/workflow"

import { pointPlusSize, pointMinusPoint, pointMinus, pointPlusPoint, rotatePointAroundPointBy } from "shared/geometry"
import { Rectangle } from "shared/geometry/Rectangle"
import { Point } from "shared/geometry/Point"
import { Matrix } from "shared/geometry/Matrix"

import * as figure from "client/figures"
import { Tool, ArrangeToolState } from "client/figuretools"
import { FigureEditorScene } from "../FigureEditorScene"

describe("FigureEditor", function() {
    this.beforeAll(async function() {
        initializeCORBAValueTypes()
        await loadScript("polyfill/path-data-polyfill.js")
    })

    describe("SelectTool", () => {

        describe("select", () => {
            describe("single figure", () => {
                it("no transformation", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()
                    let rectangle0 = new Rectangle(50.5, 50.5, 20, 30)
                    scene.addRectangle(rectangle0)

                    // WHEN
                    scene.pointerDownAt(new Point(60, 65))
                    scene.pointerUp()

                    // THEN
                    scene.selectionHasRectangle(rectangle0)
                })
                it("translated", () => {
                    let scene = new FigureEditorScene()
                    let rectangle0 = new Rectangle(50, 50, 20, 30)
                    scene.addRectangle(rectangle0, new Point(100, 0))

                    // WHEN
                    scene.pointerDownAt(new Point(60 + 100, 65))
                    scene.pointerUp()

                    // THEN
                    scene.selectionHasRectangle(new Rectangle(50 + 100, 50, 20, 30))
                })
                it("scaled")
                it("rotated", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()
                    let rectangle0 = new Rectangle(50, 50, 20, 30)
                    let radiants = Math.PI / 8
                    scene.addRectangle(rectangle0, rectangle0.center(), radiants)

                    // WHEN
                    scene.selectFigure()

                    // THEN
                    scene.selectionHasRectangle(rectangle0, rectangle0.center(), radiants)
                })
                it("translated, scaled and rotated")
            })

            describe("group of figures", () => {
                it("no transformation", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()

                    let rectangle0 = new Rectangle(50, 50, 10, 20)
                    scene.addRectangle(rectangle0)

                    let rectangle1 = new Rectangle(70, 110, 30, 40)
                    scene.addRectangle(rectangle1)

                    scene.selectFigure(0)
                    scene.selectFigure(1)

                    let r2 = new Rectangle(50, 50, 50, 100)
                    scene.selectionHasRectangle(r2)
                })
                it("same rotation", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()
                    let radiants = Math.PI / 8

                    let rectangle0 = new Rectangle(50, 50, 10, 20)
                    scene.addRectangle(rectangle0, rectangle0.center(), radiants)

                    let rectangle1 = new Rectangle(70, 110, 30, 40)
                    scene.addRectangle(rectangle1, rectangle1.center(), radiants)

                    scene.selectFigure(0)
                    scene.selectFigure(1)

                    let transform = new Matrix()
                    transform.translate(pointMinus(rectangle0.center()))
                    transform.rotate(radiants)
                    transform.translate(rectangle0.center())
                    let p = transform.transformPoint(rectangle0.origin)
                    scene.selectionHasPoint(p)

                    transform = new Matrix()
                    transform.translate(pointMinus(rectangle1.center()))
                    transform.rotate(radiants)
                    transform.translate(rectangle1.center())
                    p = transform.transformPoint(pointPlusSize(rectangle1.origin, rectangle1.size))
                    scene.selectionHasPoint(p)
                })
                it("rotated orthogonal to each other", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()
                    let radiants = Math.PI / 8

                    let rectangle0 = new Rectangle(50, 50, 10, 20)
                    scene.addRectangle(rectangle0, rectangle0.center(), radiants)

                    let rectangle1 = new Rectangle(70, 110, 30, 40)
                    scene.addRectangle(rectangle1, rectangle1.center(), radiants)

                    let rectangle2 = new Rectangle(60, 80, 5, 10)
                    scene.addRectangle(rectangle2, rectangle2.center(), radiants + Math.PI / 2)

                    let rectangle3 = new Rectangle(75, 80, 5, 10)
                    scene.addRectangle(rectangle3, rectangle3.center(), radiants + Math.PI)

                    let rectangle4 = new Rectangle(90, 80, 5, 10)
                    scene.addRectangle(rectangle4, rectangle4.center(), radiants + Math.PI * 3 / 2)

                    scene.selectFigure(0)
                    scene.selectFigure(1)
                    scene.selectFigure(2)
                    scene.selectFigure(3)
                    scene.selectFigure(4)

                    let transform = new Matrix()
                    transform.translate(pointMinus(rectangle0.center()))
                    transform.rotate(radiants)
                    transform.translate(rectangle0.center())
                    let p = transform.transformPoint(rectangle0.origin)
                    scene.selectionHasPoint(p)

                    transform = new Matrix()
                    transform.translate(pointMinus(rectangle1.center()))
                    transform.rotate(radiants)
                    transform.translate(rectangle1.center())
                    p = transform.transformPoint(pointPlusSize(rectangle1.origin, rectangle1.size))
                    scene.selectionHasPoint(p)
                })
                it("different rotation", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()
                    let radiants = Math.PI / 8

                    let rectangle0 = new Rectangle(50, 50, 10, 20)
                    scene.addRectangle(rectangle0, rectangle0.center(), radiants)

                    let rectangle1 = new Rectangle(70, 110, 30, 40)
                    scene.addRectangle(rectangle1, rectangle1.center(), radiants)

                    let rectangle2 = new Rectangle(60, 80, 5, 10)
                    scene.addRectangle(rectangle2, rectangle2.center(), Math.PI / 16)

                    scene.selectFigure(0)
                    scene.selectFigure(1)
                    scene.selectFigure(2)

                    let transform = new Matrix()
                    transform.translate(pointMinus(rectangle0.center()))
                    transform.rotate(radiants)
                    transform.translate(rectangle0.center())
                    let p = {
                        x: transform.transformPoint({ x: rectangle0.origin.x, y: rectangle0.origin.y + rectangle0.size.height }).x,
                        y: transform.transformPoint(rectangle0.origin).y
                    }
                    scene.selectionHasPoint(p)

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
                    scene.selectionHasPoint(p)
                })
            })
        })

        describe("marquee", () => {
            it("single figure", () => {
                // GIVEN
                let scene = new FigureEditorScene()
                let rectangle0 = new Rectangle(50, 50, 20, 30)
                scene.addRectangle(rectangle0)

                // WHEN
                scene.pointerDownAt({ x: 45, y: 45 })
                scene.pointerTo({ x: 75, y: 85 })
                scene.pointerUp()

                // THEN
                scene.selectionHasRectangle(rectangle0)
            })
            it("subset of group of figures", () => {
                // GIVEN
                let scene = new FigureEditorScene()
                let innerRect0 = new Rectangle(50, 50, 10, 10)
                scene.addRectangle(innerRect0)
                let innerRect1 = new Rectangle(70, 70, 10, 10)
                scene.addRectangle(innerRect1)

                let leftRect = new Rectangle(30, 60, 10, 10)
                scene.addRectangle(leftRect)
                let topRect = new Rectangle(60, 30, 10, 10)
                scene.addRectangle(topRect)
                let rightRect = new Rectangle(90, 60, 10, 10)
                scene.addRectangle(rightRect)
                let bottomRect = new Rectangle(60, 90, 10, 10)
                scene.addRectangle(bottomRect)

                // WHEN
                scene.pointerDownAt({ x: 45, y: 45 })
                scene.pointerTo({ x: 85, y: 85 })
                scene.pointerUp()

                // THEN
                scene.selectionHasPoint(innerRect0.origin)
                scene.selectionHasPoint(pointPlusSize(innerRect1.origin, innerRect1.size))
            })
            it("translated figure", () => {
                // GIVEN
                let test = new FigureEditorScene()
                let rectangle0 = new Rectangle(50, 50, 20, 30)
                test.addRectangle(rectangle0, { x: 100, y: 0 })

                // WHEN
                test.pointerDownAt({ x: 145, y: 45 })
                test.pointerTo({ x: 175, y: 85 })
                test.pointerUp()

                // THEN
                let rectangle1 = new Rectangle(150, 50, 20, 30)
                test.selectionHasRectangle(rectangle1)
            })
        })

        describe("move", () => {
            describe("single figure", () => {
                it("moves figure's outline before mouse is released", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()

                    let r0 = new Rectangle(50, 50, 20, 30)
                    let translation = new Point(10, -10)
                    let r1 = new Rectangle(r0)
                    r1.origin = pointPlusPoint(r1.origin, translation)
                    scene.addRectangle(r0)

                    scene.selectFigure(0)
                    scene.selectionHasRectangle(r0)

                    // WHEN
                    let oldCenter = scene.centerOfFigure()
                    scene.pointerDownAt(oldCenter)
                    scene.movePointerBy(translation)

                    // THEN
                    scene.selectionHasRectangle(r1)
                    scene.outlineHasRectangle(r1)
                })
/*
                // WIP: this did not work because unlike figure.Rectangle, figure.Path returned a reference to
                // it's own Path, so that modifing the outline changed the figure itself
                xit("moves paths's outline before mouse is released", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()

                    let r0 = new Rectangle(50.5, 50.5, 20, 30)
                    let p = new RawPath()
                    p.appendRect(r0)
                    let fig = new Path(p)
                    fig.id = ++scene.id
                    fig.stroke = "#000"
                    fig.fill = "rgba(255,0,0,0.2)"
                    scene.model.add(0, fig)
                    scene.figures.push(fig)

                    expect(scene.model.layers[0].data[0].toString())
                        .equals(`figure.Path(m=undefined, d="M 50.5 50.5 L 70.5 50.5 L 70.5 80.5 L 50.5 80.5 Z")`)

                    scene.mouseDownAt({x: 60, y: 60})

                    // FIXME: this triggesrs a transform in the select tool
                    console.log(`2: ${scene.model.layers[0].data[0]}`)
                    scene.mouseUp()

                    // WHEN
                    let translation = new Point(10, -10)
                    let oldCenter = scene.centerOfFigure()
                    console.log(`3: ${scene.model.layers[0].data[0]}`)
                    scene.mouseDownAt(oldCenter)

                    // this moveMouseBy should not update the figure, only the outline
                    // this works with the rectangle, but not the path

                    scene.moveMouseBy(translation)
                    expect(scene.model.layers[0].data[0].toString())
                        .equals(`figure.Path(m=undefined, d="M 50.5 50.5 L 70.5 50.5 L 70.5 80.5 L 50.5 80.5 Z")`)
                    scene.mouseUp()

                    // THEN
                    let r1 = new Rectangle(r0)
                    r1.origin = pointPlusPoint(r1.origin, translation)
                    console.log(scene.model.layers[0].data[0].toString())
                    // scene.selectionHasRectangle(r1)
                    // scene.outlineHasRectangle(r1)

                    console.log(`after move: ${scene.model.layers[0].data[0]}`)
                })
*/
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
                    test.pointerDownAt(oldCenter)
                    test.movePointerBy(translation)
                    test.pointerUp()

                    // THEN
                    let r1 = new Rectangle(r0)
                    r1.origin = pointPlusPoint(r1.origin, translation)
                    test.selectionHasRectangle(r1)
                    test.outlineHasRectangle(r1)
                    test.renderHasRectangle(r1) // when this fails then...? ah! actually moving is piped through the server!
                })
                it("moves figure with matrix when mouse is released", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()
                    let r0 = new Rectangle(50, 50, 20, 30)
                    let translation = new Point(10, -10)
                    scene.addRectangle(r0, new Point(), 0)
                    scene.selectFigure(0)
                    scene.selectionHasRectangle(r0)

                    // WHEN
                    let oldCenter = scene.centerOfFigure()
                    scene.pointerDownAt(oldCenter)
                    scene.movePointerBy(translation)
                    scene.pointerUp()

                    // THEN
                    let r1 = new Rectangle(r0)
                    r1.origin = pointPlusPoint(r1.origin, translation)
                    scene.selectionHasRectangle(r1)
                    scene.outlineHasRectangle(r1)
                    scene.renderHasRectangle(r1)
                })
                it("moves a translated figure")
                it("moves a rotated figure", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()
                    let r0 = new Rectangle(50, 50, 20, 30)
                    scene.addRectangle(r0, r0.center(), Math.PI / 8)
                    scene.selectFigure(0)

                    // WHEN
                    scene.pointerDownAt(r0.center())
                    let translation = new Point(100, 0)
                    scene.movePointerBy(translation)
                    scene.pointerUp()

                    // THEN
                    let r1 = new Rectangle(r0)
                    r1.origin = pointPlusPoint(r1.origin, translation)

                    scene.selectionHasRectangle(r1, r1.center(), Math.PI / 8)
                    scene.outlineHasRectangle(r1, r1.center(), Math.PI / 8)
                    scene.renderHasRectangle(r1, r1.center(), Math.PI / 8)
                })
                it("moves a scaled figure")
            })
        })

        describe("scale", () => {
            describe("single figure", () => {
                it("scales figure's outline before mouse is released", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()
                    let rectangle = new Rectangle(50, 50, 20, 30)
                    scene.addRectangle(rectangle)
                    scene.selectFigure()
                    let down = new Point(rectangle.origin)
                    let up = new Point(40, 65)

                    // WHEN
                    scene.pointerDownAt(down)
                    scene.pointerTo(up)

                    // THEN
                    let scaled = new Rectangle(40, 65, 30, 15)
                    scene.selectionHasRectangle(scaled)
                    scene.outlineHasRectangle(scaled)
                })
                it("scales figure when mouse is released", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()
                    let rectangle = new Rectangle(50, 50, 20, 30)
                    scene.addRectangle(rectangle)
                    scene.selectFigure()
                    let down = new Point(rectangle.origin)
                    let up = new Point(40, 65)

                    // WHEN
                    scene.pointerDownAt(down)
                    scene.pointerTo(up)
                    scene.pointerUp()

                    // THEN
                    let scaled = new Rectangle(40, 65, 30, 15)
                    scene.selectionHasRectangle(scaled)
                    scene.outlineHasRectangle(scaled)
                    scene.renderHasRectangle(scaled)
                })
                it("scales already scaled figure's outline before mouse is released")
                it("scales already scaled figure when mouse is released")
                it("scales a translated figure")
                it("scales a rotated figure", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()
                    let rectangle = new Rectangle(50, 50, 20, 30)
                    let scaled = new Rectangle(40, 65, 30, 15)
                    scene.addRectangle(rectangle, rectangle.center(), Math.PI / 8)
                    scene.selectFigure()

                    // WHEN
                    let down = rotatePointAroundPointBy(rectangle.origin, rectangle.center(), Math.PI / 8)
                    let up = rotatePointAroundPointBy(scaled.origin, rectangle.center(), Math.PI / 8)
                    scene.pointerDownAt(down)
                    scene.pointerTo(up)
                    scene.pointerUp()

                    // THEN
                    scene.selectionHasRectangle(scaled, rectangle.center(), Math.PI / 8)
                    scene.outlineHasRectangle(scaled, rectangle.center(), Math.PI / 8)
                    scene.renderHasRectangle(scaled, rectangle.center(), Math.PI / 8)
                })
            })
            describe("group of figures", () => {
                it("scales outline of two figure before mouse is released", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()
                    let rect0 = new Rectangle(50, 50, 20, 30)
                    let rect1 = new Rectangle(100, 100, 40, 50)
                    scene.addRectangle(rect0)
                    scene.addRectangle(rect1)
                    scene.selectFigure(0)
                    scene.selectFigure(1)

                    let selection = new Rectangle(50, 50, 90, 100)
                    scene.selectionHasRectangle(selection)

                    let down = new Point(rect0.origin)
                    let up = new Point(40, 60)

                    // WHEN
                    scene.pointerDownAt(down)
                    scene.pointerTo(up)
                    // test.mouseUp()

                    // THEN
                    let scaled = new Rectangle(40, 60, 100, 90)
                    scene.selectionHasRectangle(scaled)
                    scene.outlineHasPoint(scaled.origin)
                    scene.outlineHasPoint(pointPlusSize(scaled.origin, scaled.size))
                    // test.renderHasRectangle(scaled)
                })
                it("scales two figures when mouse is released", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()
                    let rect0 = new Rectangle(50, 50, 20, 30)
                    let rect1 = new Rectangle(100, 100, 40, 50)
                    scene.addRectangle(rect0)
                    scene.addRectangle(rect1)
                    scene.selectFigure(0)
                    scene.selectFigure(1)

                    let selection = new Rectangle(50, 50, 90, 100)
                    scene.selectionHasRectangle(selection)

                    let down = new Point(rect0.origin)
                    let up = new Point(40, 60)

                    // WHEN
                    scene.pointerDownAt(down)
                    scene.pointerTo(up)
                    scene.pointerUp()

                    // THEN
                    let scaled = new Rectangle(40, 60, 100, 90)
                    scene.selectionHasRectangle(scaled)
                    scene.outlineHasPoint(scaled.origin)
                    scene.outlineHasPoint(pointPlusSize(scaled.origin, scaled.size))
                    scene.renderHasPoint(scaled.origin)
                    scene.renderHasPoint(pointPlusSize(scaled.origin, scaled.size))

                    // followd by move & scale does not work, and other combinations also. might need to recalculate boundary!!! write some tests 1st!!!
                })
            })
        })
        describe("rotate", () => {
            describe("single figure", () => {
                it("rotates figure's outline before mouse is released", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()
                    let rectangle = new Rectangle({ origin: { x: 50.5, y: 50.5 }, size: { width: 20, height: 30 } })
                    let fig = new figure.Rectangle(rectangle)
                    fig.stroke = "#000"
                    fig.fill = "rgba(255,0,0,0.2)"

                    scene.addFigure(fig)
                    scene.selectFigure()

                    // WHEN
                    let oldMouseRotate = scene.centerOfNWRotateHandle()
                    let center = scene.centerOfFigure()
                    let newMouseRotate = rotatePointAroundPointBy(oldMouseRotate, center, Math.PI / 8)

                    scene.pointerDownAt(oldMouseRotate)
                    scene.pointerTo(newMouseRotate)

                    // THEN
                    scene.selectionHasRectangle(rectangle, rectangle.center(), Math.PI / 8)
                    scene.outlineHasRectangle(rectangle, rectangle.center(), Math.PI / 8)
                })

                it("rotates figure when mouse is released", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()
                    let rectangle = new Rectangle({ origin: { x: 50.5, y: 50.5 }, size: { width: 20, height: 30 } })
                    let fig = new figure.Rectangle(rectangle)
                    fig.stroke = "#000"
                    fig.fill = "rgba(255,0,0,0.2)"

                    scene.addFigure(fig)
                    scene.selectFigure()

                    // WHEN
                    let center = scene.centerOfFigure()
                    let position0 = scene.centerOfNWRotateHandle()
                    let position1 = rotatePointAroundPointBy(position0, center, Math.PI / 8)

                    scene.pointerDownAt(position0)
                    scene.pointerTo(position1)
                    scene.pointerUp()

                    // THEN
                    scene.selectionHasRectangle(rectangle, center, Math.PI / 8)
                    scene.outlineHasRectangle(rectangle, center, Math.PI / 8)
                    scene.renderHasRectangle(rectangle, center, Math.PI / 8)
                })

                it("rotates already rotated figure's outline before mouse is released", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()
                    let rectangle = new Rectangle({ origin: { x: 50, y: 50 }, size: { width: 20, height: 30 } })
                    let fig = new figure.Rectangle(rectangle)
                    fig.stroke = "#000"
                    fig.fill = "rgba(255,0,0,0.2)"

                    scene.addFigure(fig)
                    scene.selectFigure()

                    // WHEN
                    let center = scene.centerOfFigure()
                    // 45, 45
                    let position0 = scene.centerOfNWRotateHandle()
                    let position1 = rotatePointAroundPointBy(position0, center, Math.PI / 8)
                    let position2 = rotatePointAroundPointBy(position0, center, Math.PI / 4)

                    scene.pointerDownAt(position0)
                    expect(scene.arrangeTool.state).is.equal(ArrangeToolState.MOVE_HANDLE)
                    expect(scene.arrangeTool.selectedHandle).is.equal(8)
                    scene.pointerTo(position1)
                    scene.pointerUp()

                    // 2nd rotation
                    let p1 = { x: 48.5 + figure.Figure.HANDLE_RANGE / 2.0, y: 38.5 + figure.Figure.HANDLE_RANGE / 2.0 }
                    position2 = rotatePointAroundPointBy(p1, center, Math.PI / 8)

                    scene.pointerDownAt(p1)
                    expect(scene.arrangeTool.state).is.equal(ArrangeToolState.MOVE_HANDLE)
                    expect(scene.arrangeTool.selectedHandle).is.equal(8)
                    scene.pointerTo(position2)

                    // THEN
                    scene.selectionHasRectangle(rectangle, center, Math.PI / 4)
                    scene.outlineHasRectangle(rectangle, center, Math.PI / 4)
                })

                it("rotates already rotated figure when mouse is released", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()
                    let rectangle = new Rectangle({ origin: { x: 50.5, y: 50.5 }, size: { width: 20, height: 30 } })
                    let fig = new figure.Rectangle(rectangle)
                    fig.stroke = "#000"
                    fig.fill = "rgba(255,0,0,0.2)"

                    scene.addFigure(fig)
                    scene.selectFigure()

                    // WHEN
                    let center = rectangle.center()
                    let position0 = scene.centerOfNWRotateHandle()
                    let position1 = rotatePointAroundPointBy(position0, center, Math.PI / 8)
                    let position2 = rotatePointAroundPointBy(position0, center, Math.PI / 4)

                    // 1st rotation
                    scene.pointerDownAt(position0)
                    expect(scene.arrangeTool.state).is.equal(ArrangeToolState.MOVE_HANDLE)
                    expect(scene.arrangeTool.selectedHandle).is.equal(8)
                    scene.pointerTo(position1)
                    scene.pointerUp()
                    scene.selectionHasRectangle(rectangle, center, Math.PI / 8)
                    scene.renderHasRectangle(rectangle, center, Math.PI / 8)

                    // 2nd rotation
                    let p1 = { x: 48.5 + figure.Figure.HANDLE_RANGE / 2.0, y: 38.5 + figure.Figure.HANDLE_RANGE / 2.0 }
                    position2 = rotatePointAroundPointBy(p1, center, Math.PI / 8)

                    scene.pointerDownAt(p1)
                    expect(scene.arrangeTool.state).is.equal(ArrangeToolState.MOVE_HANDLE)
                    expect(scene.arrangeTool.selectedHandle).is.equal(8)
                    scene.pointerTo(position2)
                    scene.pointerUp()

                    // THEN            
                    scene.selectionHasRectangle(rectangle, center, Math.PI / 4)
                    scene.renderHasRectangle(rectangle, center, Math.PI / 4)
                    scene.outlineHasRectangle(rectangle, center, Math.PI / 4)
                })
                it("rotates a translated figure", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()
                    let rectangle0 = new Rectangle(50, 50, 20, 30)
                    let translate = new Point(100, 0)
                    scene.addRectangle(rectangle0, translate)
                    scene.selectFigure()

                    // WHEN
                    let handleRange = figure.Figure.HANDLE_RANGE
                    let center = pointPlusPoint(rectangle0.center(), translate)
                    let down = pointMinusPoint(
                        pointPlusPoint(rectangle0.origin, translate), { x: handleRange, y: handleRange })
                    let up = rotatePointAroundPointBy(down, center, Math.PI / 8)

                    scene.pointerDownAt(down)
                    scene.pointerTo(up)
                    scene.pointerUp()

                    // THEN
                    scene.selectionHasRectangle(new Rectangle(50 + 100, 50, 20, 30), center, Math.PI / 8)
                })
                it("rotates a scaled figure")
            })

            describe("group of figures", () => {
                it("rotate outline of two figures using nw handle before mouse is released", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()

                    let rectangle0 = new Rectangle(50, 50, 10, 20)
                    scene.addRectangle(rectangle0)

                    let rectangle1 = new Rectangle(70, 110, 30, 40)
                    scene.addRectangle(rectangle1)

                    scene.selectFigure(0)
                    scene.selectFigure(1)

                    let r2 = new Rectangle(50, 50, 50, 100)
                    scene.selectionHasRectangle(r2)
                    // WHEN
                    let oldMouseRotate = scene.centerOfNWRotateHandle()
                    let center = scene.arrangeTool.boundary.center()
                    let newMouseRotate = rotatePointAroundPointBy(oldMouseRotate, center, Math.PI / 4)

                    scene.pointerDownAt(oldMouseRotate)
                    scene.pointerTo(newMouseRotate)

                    // THEN
                    scene.selectionHasRectangle(r2, center, Math.PI / 4)
                    scene.outlineHasRectangle(rectangle0, center, Math.PI / 4)
                    scene.outlineHasRectangle(rectangle1, center, Math.PI / 4)
                })
                it("rotate two figures using nw handle", () => {
                    // GIVEN
                    let scene = new FigureEditorScene()

                    let rectangle0 = new Rectangle(50, 50, 10, 20)
                    scene.addRectangle(rectangle0)

                    let rectangle1 = new Rectangle(70, 110, 30, 40)
                    scene.addRectangle(rectangle1)

                    scene.selectFigure(0)
                    scene.selectFigure(1)

                    let r2 = new Rectangle(50, 50, 50, 100)
                    scene.selectionHasRectangle(r2)

                    // WHEN
                    let oldMouseRotate = scene.centerOfNWRotateHandle()
                    let center = scene.arrangeTool.boundary.center()
                    let newMouseRotate = rotatePointAroundPointBy(oldMouseRotate, center, Math.PI / 4)

                    scene.pointerDownAt(oldMouseRotate)
                    scene.pointerTo(newMouseRotate)
                    scene.pointerUp()

                    // THEN
                    scene.selectionHasRectangle(r2, center, Math.PI / 4)
                    scene.outlineHasRectangle(rectangle0, center, Math.PI / 4)
                    scene.outlineHasRectangle(rectangle1, center, Math.PI / 4)
                    scene.renderHasRectangle(rectangle0, center, Math.PI / 4)
                    scene.renderHasRectangle(rectangle1, center, Math.PI / 4)
                })
            })
        })
        describe("delete", () => {
            it("single figure", () => {
                // GIVEN
                let scene = new FigureEditorScene()
                let rectangle0 = new Rectangle(50, 50, 20, 30)
                scene.addRectangle(rectangle0)

                // WHEN
                scene.pointerDownAt({ x: 45, y: 45 })
                scene.pointerTo({ x: 75, y: 85 })
                scene.pointerUp()

                expect(scene.model.layers[0].data.length).to.equal(1)
                scene.keydown("Delete")

                // THEN
                expect(Tool.selection.empty()).to.be.true
                expect(scene.model.layers[0].data.length).to.equal(0)
            })
            it("subset of group of figures", () => {
                // GIVEN
                let scene = new FigureEditorScene()
                let innerRect0 = new Rectangle(50, 50, 10, 10)
                scene.addRectangle(innerRect0)
                let innerRect1 = new Rectangle(70, 70, 10, 10)
                scene.addRectangle(innerRect1)

                let leftRect = new Rectangle(30, 60, 10, 10)
                scene.addRectangle(leftRect)
                let topRect = new Rectangle(60, 30, 10, 10)
                scene.addRectangle(topRect)
                let rightRect = new Rectangle(90, 60, 10, 10)
                scene.addRectangle(rightRect)
                let bottomRect = new Rectangle(60, 90, 10, 10)
                scene.addRectangle(bottomRect)

                // WHEN
                scene.pointerDownAt({ x: 45, y: 45 })
                scene.pointerTo({ x: 85, y: 85 })
                scene.pointerUp()

                expect(scene.model.layers[0].data.length).to.equal(6)
                scene.keydown("Delete")

                // THEN
                expect(Tool.selection.empty()).to.be.true
                expect(scene.model.layers[0].data.length).to.equal(4)
            })


        })
        describe("lifecycle", () => {
            it("switch between operations (scale, move, scale)", () => {
                // GIVEN
                let scene = new FigureEditorScene()
                let rect0 = new Rectangle(50, 50, 20, 30)
                scene.addRectangle(rect0)
                scene.selectFigure(0)

                // scale
                let rect1 = new Rectangle(40, 60, 30, 20)
                let down0 = new Point(rect0.origin)
                let up0 = new Point(rect1.origin)
                scene.pointerDownAt(down0)
                scene.pointerTo(up0)
                scene.pointerUp()
                scene.selectionHasRectangle(rect1)
                scene.outlineHasRectangle(rect1)
                scene.renderHasRectangle(rect1)

                // move
                let rect2 = new Rectangle(140, 60, 30, 20)
                let down1 = new Point(65, 65)
                let up1 = new Point(165, 65)
                scene.pointerDownAt(down1)
                scene.pointerTo(up1)
                scene.pointerUp()
                scene.selectionHasRectangle(rect2)
                scene.outlineHasRectangle(rect2)
                scene.renderHasRectangle(rect2)

                // scale
                let rect3 = new Rectangle(130, 70, 40, 10)
                let down2 = new Point(rect2.origin)
                let up2 = new Point(rect3.origin)
                scene.pointerDownAt(down2)
                scene.pointerTo(up2)
                scene.pointerUp()
                scene.selectionHasRectangle(rect3)
                scene.outlineHasRectangle(rect3)
                scene.renderHasRectangle(rect3)
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
            let scene = new FigureEditorScene()
            let fig1 = new figure.Rectangle({ origin: { x: 50, y: 10 }, size: { width: 20, height: 30 } })
            scene.addFigure(fig1)

            let fig2 = new figure.Rectangle({ origin: { x: 50, y: 50 }, size: { width: 10, height: 40 } })
            scene.addFigure(fig2)

            // cache should contain figure, path & svg
            let cache = scene.figureeditor.cache
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
            expect(scene.figureeditor.layer!!.childNodes[0]).to.equal(ce1.svg)
            expect(scene.figureeditor.layer!!.childNodes[1]).to.equal(ce2.svg)
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

function loadScript(filename: string) {
    const pathDataPolyfill = document.createElement("script")
    pathDataPolyfill.src = filename
    const promise = new Promise( (resolve, reject) => {
        pathDataPolyfill.onload = resolve
        pathDataPolyfill.onerror = (error) => reject(new Error(`loadScript('${filename}') failed`))
    })
    document.head.appendChild(pathDataPolyfill)
    return promise
}
