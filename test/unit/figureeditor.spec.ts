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

import { Signal } from "toad.js"

import { Matrix, pointPlusSize, pointMinusPoint, Point, pointPlusPoint, sizeMultiplyNumber } from "../../src/shared/geometry"

import * as path from "../../src/client/paths"
import * as figure from "../../src/client/figures"
import * as tool from "../../src/client/figuretools"
import { EditorEvent, FigureEditor, Layer, LayerModel } from "../../src/client/figureeditor"
import { Tool, SelectTool } from "../../src/client/figuretools";

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

        let figureeditor: FigureEditor

        this.beforeAll(()=>{
            // console.log("before all select tool tests")
        })

        // MyLayer & MyLayerModel are copied from server.ts

        class MyLayer extends Layer {
            highestFigureId?: number

            createFigureId(): number {
                if (this.highestFigureId === undefined) {
                    this.highestFigureId = 0
                    for(let figure of this.data) {
                        if (figure.id > this.highestFigureId) { // FIXME: recursive
                            this.highestFigureId = figure.id
                        }
                    }
                }
                return ++this.highestFigureId
            }
        }

        class MyLayerModel implements LayerModel {
            modified: Signal
            layers: Array<MyLayer>
            
            constructor() {
                this.modified = new Signal()
                this.layers = new Array<MyLayer>()
            }

            layerById(layerID: number) {
                for (let layer of this.layers) {
                    if (layer.id === layerID)
                        return layer
                }
                throw Error("BoardListener_impl.layerById(): unknown layer id " + layerID)
            }

            add(layerId: number, figure: figure.Figure) {
                console.log(`MyLayerModel.add(${layerId})`)
                let layer = this.layerById(layerId)
                layer.data.push(figure)
            }

            transform(layerID: number, figureIdArray: Array<number>, matrix: Matrix /*, newIds: Array<number>*/) {
                console.log(`MyLayerModel.transform(${layerID}, ${figureIdArray}, ${JSON.stringify(matrix)})`)
                let figureIdSet = new Set<number>()
                for(let id of figureIdArray)
                    figureIdSet.add(id)
                let newIdArray = new Array<number>()
                
                let layer = this.layerById(layerID)
                for (let index in layer.data) {
                    let fig = layer.data[index]
                    if (!figureIdSet.has(fig.id))
                        continue
                        
                    if (fig.transform(matrix)) {
                        console.log("  figure transformed itself")
                        // console.log("transformed "+JSON.stringify(fig))
                        continue
                    }

                    console.log("figure encapsuled with a transform object")
                    let transform = new figure.Transform()
                    transform.id = layer.createFigureId()
                    newIdArray.push(transform.id)
                    transform.matrix = new Matrix(matrix)
                    transform.children.push(fig)
                    layer.data[index] = transform

                    Tool.selection.replace(fig, transform)
                }
            }
        }

        it("move figure", ()=> {
             // GIVEN
            let figureeditor = document.createElement("toad-figureeditor") as FigureEditor
            document.body.appendChild(figureeditor)

            let selectTool = new SelectTool()
            figureeditor.setTool(selectTool)

            let model = new MyLayerModel()
            let layer = new MyLayer()
            let fig = new figure.Rectangle({ origin: {x:50, y: 50}, size: {width: 20, height: 30}})
            fig.stroke = "#000"
            fig.fill = "#f00"
            model.layers.push(layer)
            figureeditor.setModel(model)

            layer.data.push(fig)

            expect(Tool.selection.has(fig)).to.be.false

            // WHEN: CLICK INSIDE FIGURE
            let mouseDownToMoveAt = {x: 60, y: 60}
            selectTool.mousedown(new EditorEvent(figureeditor, mouseDownToMoveAt, false))
            selectTool.mouseup(new EditorEvent(figureeditor, mouseDownToMoveAt, false))

            // THEN: EXPECT FIGURE TO BE SELECTED
            expect(Tool.selection.has(fig)).to.be.true

            // WHEN: MOUSE DOWN AT 60, 60, MOUSE MOVE BY 17, -29 AND MOUSE UP
            let translation = {x: 17, y: -29}
            let mouseUpToMoveAt = pointPlusPoint(mouseDownToMoveAt, translation)
            let newOrigin = pointPlusPoint(fig.origin, translation)

            selectTool.mousedown(new EditorEvent(figureeditor, mouseDownToMoveAt, false))
            selectTool.mousemove(new EditorEvent(figureeditor, mouseUpToMoveAt, false))
            selectTool.mouseup(new EditorEvent(figureeditor, mouseUpToMoveAt, false))

            // THEN: FIGURE ORIGIN HAS MOVED BY 18, -29
            expect(fig.origin).to.eql(newOrigin)
        })
       
        it("scale figure using nw handle", ()=> {
            // GIVEN
            let figureeditor = document.createElement("toad-figureeditor") as FigureEditor
            document.body.appendChild(figureeditor)

            let selectTool = new SelectTool()
            figureeditor.setTool(selectTool)

            let model = new MyLayerModel()
            let layer = new MyLayer()
            let fig = new figure.Rectangle({ origin: {x:50, y: 50}, size: {width: 20, height: 30}})
            fig.stroke = "#000"
            fig.fill = "#f00"
            layer.data.push(fig)
            model.layers.push(layer)
            figureeditor.setModel(model)

            expect(Tool.selection.has(fig)).to.be.false

            let oldSECorner = pointPlusSize(fig.origin, fig.size)

            // WHEN
            selectTool.mousedown(new EditorEvent(figureeditor, fig.origin, false))
            selectTool.mouseup(new EditorEvent(figureeditor, fig.origin, false))

            // THEN
            expect(Tool.selection.has(fig)).to.be.true

            selectTool.mousedown(new EditorEvent(figureeditor, fig.origin, false))

            let newNECorner = new Point(40, 65)
            selectTool.mousemove(new EditorEvent(figureeditor, newNECorner, false))
            selectTool.mouseup(new EditorEvent(figureeditor, newNECorner, false))

            // THEN
            expect(fig.origin).to.eql(newNECorner)
            let newSECorner = pointPlusSize(fig.origin, fig.size)
            expect(oldSECorner).to.eql(newSECorner)
       })

       it.only("rotate figure using nw handle", ()=> {
            // GIVEN
            let figureeditor = document.createElement("toad-figureeditor") as FigureEditor
            document.body.appendChild(figureeditor)

            let selectTool = new SelectTool()
            figureeditor.setTool(selectTool)

            let model = new MyLayerModel()
            let layer = new MyLayer()
            let fig = new figure.Rectangle({ origin: {x:50, y: 50}, size: {width: 20, height: 30}})
            fig.stroke = "#000"
            fig.fill = "#f00"
            layer.data.push(fig)
            model.layers.push(layer)
            figureeditor.setModel(model)

            
            let handleRange = figure.Figure.HANDLE_RANGE
            let oldMouseRotate = pointMinusPoint(fig.origin, {x: handleRange, y: handleRange})
            let center = pointPlusSize(fig.origin, sizeMultiplyNumber(fig.size, 0.5))
            
            let vector = pointMinusPoint(oldMouseRotate, center)

            let radiant = Math.atan2(vector.y, vector.x) + Math.PI / 2.0
            let diameter = Math.sqrt(vector.x*vector.x + vector.y*vector.y)

            let newMouseRotate = new Point(center.x + Math.cos(radiant) * diameter, center.y + Math.sin(radiant) * diameter)

            expect(Tool.selection.has(fig)).to.be.false
            selectTool.mousedown(new EditorEvent(figureeditor, center, false))
            selectTool.mouseup(new EditorEvent(figureeditor, center, false))
            expect(Tool.selection.has(fig)).to.be.true

            console.log("START ROTATE")
            selectTool.mousedown(new EditorEvent(figureeditor, oldMouseRotate, false))
            selectTool.mousemove(new EditorEvent(figureeditor, newMouseRotate, false))
            selectTool.mouseup(new EditorEvent(figureeditor, newMouseRotate, false))

            let newFig = Tool.selection.selection.values().next().value


            let p = newFig.getPath() as path.PathGroup
            p.updateSVG()
            let p1 = p.data[0] as path.Path
            console.log(JSON.stringify(p1.path))
            expect(p1.path[0].values).to.almost.eql([75, 55])
            expect(p1.path[1].values).to.almost.eql([75, 75])
            expect(p1.path[2].values).to.almost.eql([45, 75])
            expect(p1.path[3].values).to.almost.eql([45, 55])
       })
    })
})

