import { expect, use } from '@esm-bundle/chai'
// import { chaiAlmost from "chai-almost"
// use(chaiAlmost())

import { FigureEditorScene } from "./FigureEditorScene"

import { initializeCORBAValueTypes } from "client/workflow"
import { Point, pointMinusPoint, pointPlusPoint } from 'shared/geometry'
import { Path } from 'client/figures/Path'
import { StrokeAndFillModel } from "client/views/widgets/strokeandfill"

function mirrorPoint(center: Point, point: Point) {
    return pointMinusPoint(center, pointMinusPoint(point, center))
}

describe("PenTool", function () {
    this.beforeAll(async function () {
        initializeCORBAValueTypes()
        await loadScript("polyfill/path-data-polyfill.js")
    })

    describe("draw curves one segment at a time", function () {
        it("line(point, point)", function () {
            const scene = new FigureEditorScene(true)
            scene.selectPenTool()
            expect(/pen-ready.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            scene.mouseDownAt(p0)
            let check = () => {
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([1, 0])
                expect(scene.penTool.path!.path.toString()).to.equal('M 100 100')
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.penTool.figure!.path.toString()).to.equal('M 100 100')
            }
            check()
            expect(/direct-selection-cursor.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null

            scene.mouseUp()
            check()
            expect(/pen-active.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null

            scene.mouseTo(p1)
            check()
            expect(/pen-active.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null

            scene.mouseDownAt(p1)
            check = () => {
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p1)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 0])
                expect(scene.penTool.path!.path.toString()).to.equal('M 100 100 L 110 80')
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.penTool.figure!.path.toString()).to.equal('M 100 100')
            }
            check()
            expect(/direct-selection-cursor.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null

            scene.mouseUp()
            check = () => {
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p1)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 0])
                expect(scene.penTool.path!.path.toString()).to.equal('M 100 100 L 110 80')
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.model.layers[0].data[0]).instanceOf(Path)
                const path = scene.model.layers[0].data[0] as Path
                expect(scene.penTool.figure!.path.toString()).to.equal('M 100 100 L 110 80')
            }
            check()
            expect(/pen-active.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null
        })

        it.only("line(point, point) + line(point, point)", function () {
            const ignorePoint = { x: 1234, y: 5678 }

            const scene = new FigureEditorScene(false)
            scene.selectPenTool()

            // first line
            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            scene.mouseDownAt(p0)
            scene.mouseUp()
            scene.mouseDownAt(p1)
            scene.mouseUp()

            // second line
            const p2 = { x: 130, y: 140 }
            scene.mouseTo(p2)
            let check = () => {
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p1)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 0])
                expect(scene.penTool.path!.path.toString()).to.equal('M 100 100 L 110 80')

                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.model.layers[0].data[0]).instanceOf(Path)
                const path = scene.model.layers[0].data[0] as Path
                expect(path.toString()).to.equal('figure.Path(d="M 100 100 L 110 80")')
            }
            check()
            expect(/pen-active.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null

            scene.mouseDownAt(p2)
            check = () => {
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p1)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 0])
                expect(scene.penTool.path!.path.toString()).to.equal('M 100 100 L 110 80 L 130 140')

                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.model.layers[0].data[0]).instanceOf(Path)
                const path = scene.model.layers[0].data[0] as Path
                expect(path.toString()).to.equal('figure.Path(d="M 100 100 L 110 80")')
            }
            check()
            expect(/direct-selection-cursor.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null

            scene.mouseTo(ignorePoint)
            scene.mouseUp()
            check = () => {
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p1)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 0])
                expect(scene.penTool.path!.path.toString()).to.equal('M 100 100 L 110 80 L 130 140')

                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.model.layers[0].data[0]).instanceOf(Path)
                const path = scene.model.layers[0].data[0] as Path
                expect(path.toString()).to.equal('figure.Path(d="M 100 100 L 110 80 L 130 140")')
            }
            check()
            expect(/pen-active.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null
        })

        it("line(point, point) + line(point, point) + close", function () {

            const scene = new FigureEditorScene(false)

            // TODO: move this into the scene
            const strokeAndFill = new StrokeAndFillModel()
            scene.figureeditor.setModel(strokeAndFill)
            strokeAndFill.stroke = "#f00"
            strokeAndFill.fill = "#08f"

            scene.selectPenTool()

            // first line
            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            scene.mouseDownAt(p0)
            scene.mouseUp()
            scene.mouseDownAt(p1)
            scene.mouseUp()

            // FIXME: the figure must also be selected so that the attributes can be modified while editing
            const path = scene.model.layers[0].data[0] as Path
            expect(path.stroke).equals(strokeAndFill.stroke)
            expect(path.fill).equals(strokeAndFill.fill)

            // second line
            const p2 = { x: 130, y: 140 }
            scene.mouseDownAt(p2)
            scene.mouseUp()

            // close
            scene.mouseDownAt(p0)
            let check = () => {
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p1)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 0])
                expect(scene.penTool.path!.path.toString()).to.equal('M 100 100 L 110 80 L 130 140 Z')
            }
            check()
            expect(/direct-selection-cursor.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null
            expect(path.toString()).to.equal('figure.Path(d="M 100 100 L 110 80 L 130 140")')

            scene.mouseUp()
            check()
            expect(/pen-ready.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null
            expect(path.toString()).to.equal('figure.Path(d="M 100 100 L 110 80 L 130 140 Z")')

            // figure should be selected
            // handles should have no cursor
        })

        it("curve(angle, *)", function() {
            const scene = new FigureEditorScene(false)

            // TODO: move this into the scene
            const strokeAndFill = new StrokeAndFillModel()
            scene.figureeditor.setModel(strokeAndFill)
            strokeAndFill.stroke = "#f00"
            strokeAndFill.fill = "#08f"

            scene.selectPenTool()

            // down
            const p0 = { x: 100, y: 100 }
            scene.mouseDownAt(p0)

            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([1, 0])
            expect(scene.penTool.path!.path.toString()).to.equal("M 100 100")
            expect(scene.model.layers[0].data.length).equals(0)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")

            // dragging creates a curve
            const p1 = { x: 110, y: 80 }
            scene.mouseTo(p1)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasHandleAt(p0, p1)).to.be.true
            expect(scene.hasHandleAt(p0, mirrorPoint(p0, p1)))
            expect(scene.getAnchorHandleCount()).to.deep.equal([1, 2])
            expect(scene.penTool.path!.path.toString()).to.equal("M 100 100 C 110 80 0 0 0 0")
            expect(scene.model.layers[0].data.length).equals(0)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")

            // dragging again updates the curve
            const p2 = { x: 130, y: 70 }
            scene.mouseTo(p2)
            let check = () => {
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasHandleAt(p0, p2)).to.be.true
                expect(scene.hasHandleAt(p0, mirrorPoint(p0, p2)))
                expect(scene.getAnchorHandleCount()).to.deep.equal([1, 2])
                expect(scene.penTool.path!.path.toString()).to.equal("M 100 100 C 130 70 0 0 0 0")
                expect(scene.model.layers[0].data.length).equals(0)
            }
            check()
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")

            scene.mouseUp()
            check()
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
        })

        it("curve(angle, point)", function() {
            const scene = new FigureEditorScene(false)

            // TODO: move this into the scene
            const strokeAndFill = new StrokeAndFillModel()
            scene.figureeditor.setModel(strokeAndFill)
            strokeAndFill.stroke = "#f00"
            strokeAndFill.fill = "#08f"

            scene.selectPenTool()

            // draw initial angle: curve(angle, *)
            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            scene.mouseDownAt(p0)
            scene.mouseTo(p1)
            scene.mouseUp()

            // draw second point
            const p2 = { x: 130, y: 70 }
            scene.mouseDownAt(p2)
            const check = () => {
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasHandleAt(p0, p1)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 1])
                expect(scene.penTool.path!.path.toString()).to.equal("M 100 100 C 110 80 130 70 130 70")
            }
            check()
            expect(scene.model.layers[0].data.length).equals(0)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")

            scene.mouseUp()
            check()
            expect(scene.model.layers[0].data.length).equals(1)
            const path = scene.model.layers[0].data[0] as Path
            expect(path.toString()).to.equal('figure.Path(d="M 100 100 C 110 80 130 70 130 70")')
            
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
        })

        it("curve(angle, angle)", function() {
            const scene = new FigureEditorScene(false)

            // TODO: move this into the scene
            const strokeAndFill = new StrokeAndFillModel()
            scene.figureeditor.setModel(strokeAndFill)
            strokeAndFill.stroke = "#f00"
            strokeAndFill.fill = "#08f"

            scene.selectPenTool()

            // draw initial angle: curve(angle, *)
            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            scene.mouseDownAt(p0)
            scene.mouseTo(p1)
            scene.mouseUp()

            // add second point
            const p2 = { x: 130, y: 70 }
            scene.mouseDownAt(p2)
            let check = () => {
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasHandleAt(p0, p1)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 1])
                expect(scene.penTool.path!.path.toString()).to.equal("M 100 100 C 110 80 130 70 130 70")
                expect(scene.model.layers[0].data.length).equals(0)
            }
            check()
            expect(scene.model.layers[0].data.length).equals(0)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")

            // drag second point
            const p3 = { x: 140, y: 60}
            scene.mouseTo(p3)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p2)).to.be.true
            expect(scene.hasHandleAt(p0, p1)).to.be.true
            expect(scene.hasHandleAt(p2, mirrorPoint(p2, p3))).to.be.true
            expect(scene.hasHandleAt(p2, p3)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 3])
            expect(scene.penTool.path!.path.toString()).to.equal("M 100 100 C 110 80 120 80 130 70")
            expect(scene.model.layers[0].data.length).equals(0)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")

            // drag second point again
            const p4 = { x: 135, y: 65}
            scene.mouseTo(p4)
            check = () => {
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasHandleAt(p0, p1)).to.be.true
                expect(scene.hasHandleAt(p2, mirrorPoint(p2, p4))).to.be.true
                expect(scene.hasHandleAt(p2, p4)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 3])
            }
            expect(scene.penTool.path!.path.toString()).to.equal("M 100 100 C 110 80 125 75 130 70")
            expect(scene.model.layers[0].data.length).equals(0)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")

            scene.mouseUp()
            check()
            expect(scene.model.layers[0].data.length).equals(1)
            const path = scene.model.layers[0].data[0] as Path
            expect(path.toString()).to.equal('figure.Path(d="M 100 100 C 110 80 125 75 130 70")')
            
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
        })

        it("curve(angle, angle) + curve(angle, point) + line(point, point)", function() {
            const scene = new FigureEditorScene(false)

            // TODO: move this into the scene
            const strokeAndFill = new StrokeAndFillModel()
            scene.figureeditor.setModel(strokeAndFill)
            strokeAndFill.stroke = "#f00"
            strokeAndFill.fill = "#08f"

            scene.selectPenTool()

            // draw initial curve: curve(angle, angle)
            const p0 = { x: 100, y: 100 }
            const p1 = { x: 120, y: 80 }
            scene.mouseDownAt(p0)
            scene.mouseTo(p1)
            scene.mouseUp()

            const p2 = { x: 150, y: 100 }
            const p3 = { x: 170, y: 120 }
            scene.mouseDownAt(p2)
            scene.mouseTo(p3)
            scene.mouseUp()

            expect(scene.model.layers[0].data[0]).to.equal(scene.penTool.figure)

            // after curve, add a point
            const p4 = { x: 200, y: 100}
            scene.mouseDownAt(p4)
            let check = () => {
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.hasHandleAt(p2, p3)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 1])
                expect(scene.penTool.path!.path.toString()).to.equal("M 100 100 C 120 80 130 80 150 100 C 170 120 200 100 200 100")
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
            }
            let path = scene.model.layers[0].data[0] as Path
            expect(path.toString()).to.equal('figure.Path(d="M 100 100 C 120 80 130 80 150 100")')
            check()
            expect(scene.model.layers[0].data[0]).to.equal(scene.penTool.figure)

            scene.mouseUp()
            check()
            expect(scene.model.layers[0].data[0]).to.equal(scene.penTool.figure)
            expect(scene.model.layers[0].data.length).equals(1)
            path = scene.model.layers[0].data[0] as Path
            expect(path.toString()).to.equal('figure.Path(d="M 100 100 C 120 80 130 80 150 100 C 170 120 200 100 200 100")')

            // add another point, which should now be a line
            const p5 = { x: 250, y: 110}
            scene.mouseDownAt(p5)
            console.log(scene.penTool.path!.path.toString())
            expect(scene.penTool.path!.path.toString()).to.equal("M 100 100 C 120 80 130 80 150 100 C 170 120 200 100 200 100 L 250 110")
        })

        it("curve(angle, angle) + curve(angle, angle)", function() {
            const scene = new FigureEditorScene(false)

            // TODO: move this into the scene
            const strokeAndFill = new StrokeAndFillModel()
            scene.figureeditor.setModel(strokeAndFill)
            strokeAndFill.stroke = "#f00"
            strokeAndFill.fill = "#08f"

            scene.selectPenTool()

            // draw initial curve: curve(angle, angle)
            const p0 = { x: 100, y: 100 }
            const p1 = { x: 120, y: 80 }
            scene.mouseDownAt(p0)
            scene.mouseTo(p1)
            scene.mouseUp()

            const p2 = { x: 150, y: 100 }
            const p3 = { x: 170, y: 120 }
            scene.mouseDownAt(p2)
            scene.mouseTo(p3)
            scene.mouseUp()

            expect(scene.model.layers[0].data[0]).to.equal(scene.penTool.figure)

            // after curve, add a point
            const p4 = { x: 200, y: 100}
            scene.mouseDownAt(p4)
            let check = () => {
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.hasHandleAt(p2, p3)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 1])
                expect(scene.penTool.path!.path.toString()).to.equal("M 100 100 C 120 80 130 80 150 100 C 170 120 200 100 200 100")
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
            }
            let path = scene.model.layers[0].data[0] as Path
            expect(path.toString()).to.equal('figure.Path(d="M 100 100 C 120 80 130 80 150 100")')
            check()
            expect(scene.model.layers[0].data[0]).to.equal(scene.penTool.figure)

            const p5 = { x: 220, y: 80}
            scene.mouseTo(p5)
            check = () => {
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.hasHandleAt(p2, p3)).to.be.true
                expect(scene.hasHandleAt(p4, p5)).to.be.true
                expect(scene.hasHandleAt(p4, mirrorPoint(p4, p5))).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 3])
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.model.layers[0].data[0]).to.equal(scene.penTool.figure)
            }
            expect(scene.penTool.path!.path.toString()).to.equal("M 100 100 C 120 80 130 80 150 100 C 170 120 180 120 200 100")
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")

            scene.mouseUp()
            check()
            expect(scene.model.layers[0].data[0]).to.equal(scene.penTool.figure)
            path = scene.model.layers[0].data[0] as Path
            expect(path.toString()).to.equal('figure.Path(d="M 100 100 C 120 80 130 80 150 100 C 170 120 180 120 200 100")')
        })

        it("curve(point, angle)", function () {
            const scene = new FigureEditorScene(false)

            // TODO: move this into the scene
            const strokeAndFill = new StrokeAndFillModel()
            scene.figureeditor.setModel(strokeAndFill)
            strokeAndFill.stroke = "#f00"
            strokeAndFill.fill = "#08f"

            scene.selectPenTool()

            // begin as line
            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            scene.mouseDownAt(p0)
            scene.mouseUp()
            scene.mouseDownAt(p1)

            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p1)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 0])
            expect(scene.penTool.path!.path.toString()).to.equal("M 100 100 L 110 80")
            expect(scene.model.layers[0].data.length).equals(0)
            expect(/direct-selection-cursor.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null

            // dragging the 2nd anchor converts the line into a curve
            const p2 = { x: 130, y: 80 }
            scene.mouseTo(p2)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p1)).to.be.true
            expect(scene.hasHandleAt(p1, p2))
            expect(scene.hasHandleAt(p1, mirrorPoint(p1, p2)))
            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 2])
            expect(scene.penTool.path!.path.toString()).to.equal("M 100 100 C 100 100 90 80 110 80")
            expect(scene.model.layers[0].data.length).equals(0)
            expect(/direct-selection-cursor.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null

            // dragging the 2nd anchor again, updates the curve
            const p3 = { x: 150, y: 70 }
            scene.mouseTo(p3)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p1)).to.be.true
            expect(scene.hasHandleAt(p1, p3))
            expect(scene.hasHandleAt(p1, mirrorPoint(p1, p3)))
            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 2])
            expect(scene.penTool.path!.path.toString()).to.equal("M 100 100 C 100 100 70 90 110 80")
            expect(scene.model.layers[0].data.length).equals(0)
            expect(/direct-selection-cursor.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null

            // mouse up creates the figure
            scene.mouseUp()
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p1)).to.be.true
            expect(scene.hasHandleAt(p1, p3))
            expect(scene.hasHandleAt(p1, mirrorPoint(p1, p3)))
            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 2])
            expect(scene.penTool.path!.path.toString()).to.equal("M 100 100 C 100 100 70 90 110 80")
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
            expect(scene.model.layers[0].data.length).equals(1)
            const path = scene.model.layers[0].data[0] as Path
            expect(path.toString()).to.equal('figure.Path(d="M 100 100 C 100 100 70 90 110 80")')

            // TODO: check that we're in a valid state to continue drawing
        })

        // when we begin a new figure, remove the previous selection
    })
})

function loadScript(filename: string) {
    const pathDataPolyfill = document.createElement("script")
    pathDataPolyfill.src = filename
    const promise = new Promise((resolve, reject) => {
        pathDataPolyfill.onload = resolve
        pathDataPolyfill.onerror = (error) => reject(new Error(`loadScript('${filename}') failed`))
    })
    document.head.appendChild(pathDataPolyfill)
    return promise
}