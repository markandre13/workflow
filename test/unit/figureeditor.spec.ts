import { expect } from "chai"

import { ORB } from "corba.js"

import { Point, Size, Rectangle, Matrix } from "shared/geometry"

import * as path from "client/path"
import * as figure from "client/figure"
import * as tool from "client/tool"

declare global {
    interface SVGPathElement {
        d: string
        setPathData(data: any): void
        getPathData(): any
    }
}

describe("figureeditor", function() {
    before(function() {
        ORB.registerValueType("Point", Point)
        ORB.registerValueType("Size", Size)
        ORB.registerValueType("Rectangle", Rectangle)
        ORB.registerValueType("Matrix", Matrix)
    })
    
    describe("figure to graphic", function() {

        it("rectangle", function() {
            let fig000 = new figure.Rectangle({
                origin: { x: 10, y: 20 },
                size: { width: 30, height: 40 }
            })
            let grp000 = fig000.getGraphic() as path.Graphic
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
            let grp002 = fig002.getGraphic() as path.Graphic
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

                let grp001 = fig001.getGraphic() as path.Graphic
                grp001.updateSVG()

                expect(grp001.svg.tagName).to.equal("g")
                expect(grp001.svg.children.length).to.equal(1)
                expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
            })
        
            it("transform, add, getGraphic", function() {
                let fig000 = new figure.Rectangle({
                    origin: { x: 10, y: 20 },
                    size: { width: 30, height: 40 }
                })
                let fig001 = new figure.Transform()
                
                let matrix = new Matrix()
                matrix.scale(2, 2)
                fig001.transform(matrix)

                fig001.add(fig000)

                let grp001 = fig001.getGraphic() as path.Graphic
                grp001.updateSVG()

                expect(grp001.svg.tagName).to.equal("g")
                expect(grp001.svg.children.length).to.equal(1)
                expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
            })
            
            it("add, transform, getGraphic", function() {
                let fig000 = new figure.Rectangle({
                    origin: { x: 10, y: 20 },
                    size: { width: 30, height: 40 }
                })
                let fig001 = new figure.Transform()
                fig001.add(fig000)

                let matrix = new Matrix()
                matrix.scale(2, 2)
                fig001.transform(matrix)
                
                let grp001 = fig001.getGraphic() as path.Graphic
                grp001.updateSVG()
                
                expect(grp001.svg.tagName).to.equal("g")
                expect(grp001.svg.children.length).to.equal(1)
                expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
            })

            it("transform, getGraphic, add", function() {
                let fig000 = new figure.Rectangle({
                    origin: { x: 10, y: 20 },
                    size: { width: 30, height: 40 }
                })
                let fig001 = new figure.Transform()

                let matrix = new Matrix()
                matrix.scale(2, 2)
                fig001.transform(matrix)

                let grp001 = fig001.getGraphic() as path.Graphic

                fig001.add(fig000)
                
                grp001.updateSVG()
                
                expect(grp001.svg.tagName).to.equal("g")
                expect(grp001.svg.children.length).to.equal(1)
                expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
            })

            it("add, getGraphic, transform", function() {
                let fig000 = new figure.Rectangle({
                    origin: { x: 10, y: 20 },
                    size: { width: 30, height: 40 }
                })
                let fig001 = new figure.Transform()

                fig001.add(fig000)

                let grp001 = fig001.getGraphic() as path.Graphic

                let matrix = new Matrix()
                matrix.scale(2, 2)
                fig001.transform(matrix)
                
                grp001.updateSVG()
                
                expect(grp001.svg.tagName).to.equal("g")
                expect(grp001.svg.children.length).to.equal(1)
                expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
            })

            it("getGraphic, add, transform", function() {
                let fig000 = new figure.Rectangle({
                    origin: { x: 10, y: 20 },
                    size: { width: 30, height: 40 }
                })
                let fig001 = new figure.Transform()

                let grp001 = fig001.getGraphic() as path.Graphic

                fig001.add(fig000)

                let matrix = new Matrix()
                matrix.scale(2, 2)
                fig001.transform(matrix)
                
                grp001.updateSVG()
                
                expect(grp001.svg.tagName).to.equal("g")
                expect(grp001.svg.children.length).to.equal(1)
                expect(grp001.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
            })

            it("getGraphic, transform, add", function() {
                let fig000 = new figure.Rectangle({
                    origin: { x: 10, y: 20 },
                    size: { width: 30, height: 40 }
                })
                let fig001 = new figure.Transform()

                let grp001 = fig001.getGraphic() as path.Graphic

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
                let graphic = fig.getGraphic() as path.Graphic
                graphic.updateSVG()
                
                let outline = tool.Tool.createOutlineCopy(graphic)
                
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

                let graphic = fig001.getGraphic() as path.Graphic
                graphic.updateSVG()
                
                let outline = tool.Tool.createOutlineCopy(graphic)
                outline.updateSVG()

                expect(outline.svg.tagName).to.equal("g")
                expect(outline.svg.children.length).to.equal(1)
                expect(outline.svg.children[0].getAttribute("d")).to.equal("M 20 40 L 80 40 L 80 120 L 20 120 Z")
            })
        })
        
        // now simulate the applications code path for transform
    })
/*
    describe("tool", function() {
        describe("transform", function() {
            it("recognize translation", function() {
    
                let point = new Point({x: 17, y: 18})
                console.log(point)

                let path = new Path()
                path.appendRect(new Rectangle({origin: {x: 0, y:0 }, size: { width: 320, height: 200}}))
                path.update()
                console.log(path.svg)
            })
        })
    })
*/
})
