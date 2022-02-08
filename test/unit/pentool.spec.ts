import { expect } from '@esm-bundle/chai'

import { FigureEditorScene } from "./FigureEditorScene"
import { State } from "client/figuretools/PenTool"

import { initializeCORBAValueTypes } from "client/workflow"
import { Point, pointMinusPoint } from 'shared/geometry'

function mirrorPoint(center: Point, point: Point) {
    return pointMinusPoint(center, pointMinusPoint(point, center))
}

describe("PenTool", function () {
    this.beforeAll(async function () {
        initializeCORBAValueTypes()
        await loadScript("polyfill/path-data-polyfill.js")
    })
    
    // the checks the state machine according to doc/pentool-state-diagram.svg
    describe("draw curves one segment at a time (v3)", function () {
        it("READY", function() {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            expect(scene.penTool.state).to.equal(State.READY)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready.svg")
        })

        it("READY ---down---> DOWN_POINT", function() {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            scene.mouseDownAt(p0)

            expect(scene.penTool.state).to.equal(State.DOWN_POINT)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([1, 0])
            expect(scene.penTool.path!.path.toString()).to.equal('M 100 100')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.path.toString()).to.equal('M 100 100')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        it("DOWN_POINT ---up---> UP_POINT", function() {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            scene.mouseDownAt(p0)
            scene.mouseUp()

            expect(scene.penTool.state).to.equal(State.UP_POINT)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([1, 0])
            expect(scene.penTool.path!.path.toString()).to.equal('M 100 100')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.path.toString()).to.equal('M 100 100')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
        })

        it("UP_POINT ---down---> DOWN_POINT_POINT", function() {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            scene.mouseDownAt(p0)
            scene.mouseUp()
            scene.mouseDownAt(p1)

            expect(scene.penTool.state).to.equal(State.DOWN_POINT_POINT)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p1)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 0])
            expect(scene.penTool.path!.path.toString()).to.equal('M 100 100 L 110 80')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.path.toString()).to.equal('M 100 100')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        it("DOWN_POINT_POINT ---move---> DOWN_POINT_CURVE", function() {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            const p2 = { x: 130, y: 70 }
            scene.mouseDownAt(p0)
            scene.mouseUp()
            scene.mouseDownAt(p1)
            scene.mouseTo(p2)

            expect(scene.penTool.state).to.equal(State.DOWN_POINT_CURVE)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p1)).to.be.true

            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 2])
            expect(scene.penTool.path!.path.toString()).to.equal('M 100 100 C 100 100 90 90 110 80')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.path.toString()).to.equal('M 100 100')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        it("DOWN_POINT_CURVE ---move---> DOWN_POINT_CURVE", function() {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            const p2 = { x: 130, y: 70 }
            const p3 = { x: 120, y: 60 }
            scene.mouseDownAt(p0)
            scene.mouseUp()
            scene.mouseDownAt(p1)
            scene.mouseTo(p2)
            scene.mouseTo(p3)

            expect(scene.penTool.state).to.equal(State.DOWN_POINT_CURVE)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p1)).to.be.true

            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 2])
            expect(scene.penTool.path!.path.toString()).to.equal('M 100 100 C 100 100 100 100 110 80')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.path.toString()).to.equal('M 100 100')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        it("DOWN_POINT_POINT ---up---> UP_POINT", function() {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            scene.mouseDownAt(p0)
            scene.mouseUp()
            scene.mouseDownAt(p1)
            scene.mouseUp()

            expect(scene.penTool.state).to.equal(State.UP_POINT)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p1)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 0])
            expect(scene.penTool.path!.path.toString()).to.equal('M 100 100 L 110 80')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.path.toString()).to.equal('M 100 100 L 110 80')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
        })

        it("DOWN_POINT ---move---> DOWN_CURVE", function() {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            scene.mouseDownAt(p0)
            scene.mouseTo(p1)

            expect(scene.penTool.state).to.equal(State.DOWN_CURVE)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasHandleAt(p0, p1)).to.be.true
            expect(scene.hasHandleAt(p0, mirrorPoint(p0, p1))).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([1, 2])
            expect(scene.penTool.path!.path.toString()).to.equal('M 100 100 C 110 80 0 0 0 0')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.path.toString()).to.equal('M 100 100')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        it("DOWN_CURVE ---move---> DOWN_CURVE", function() {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            const p2 = { x: 130, y: 70 }
            scene.mouseDownAt(p0)
            scene.mouseTo(p1)
            scene.mouseTo(p2)

            expect(scene.penTool.state).to.equal(State.DOWN_CURVE)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasHandleAt(p0, p2)).to.be.true
            expect(scene.hasHandleAt(p0, mirrorPoint(p0, p2))).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([1, 2])
            expect(scene.penTool.path!.path.toString()).to.equal('M 100 100 C 130 70 0 0 0 0')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.path.toString()).to.equal('M 100 100')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        it("DOWN_CURVE ---up---> UP_CURVE", function() {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            scene.mouseDownAt(p0)
            scene.mouseTo(p1)
            scene.mouseUp()

            expect(scene.penTool.state).to.equal(State.UP_CURVE)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasHandleAt(p0, p1)).to.be.true
            expect(scene.hasHandleAt(p0, mirrorPoint(p0, p1))).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([1, 2])
            expect(scene.penTool.path!.path.toString()).to.equal('M 100 100 C 110 80 0 0 0 0')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.path.toString()).to.equal('M 100 100')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
        })

        it("UP_CURVE ---down---> DOWN_CURVE_POINT", function() {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            const p2 = { x: 150, y: 100 }

            scene.mouseDownAt(p0)
            scene.mouseTo(p1)
            scene.mouseUp()
            scene.mouseDownAt(p2)

            expect(scene.penTool.state).to.equal(State.DOWN_CURVE_POINT)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p2)).to.be.true
            expect(scene.hasHandleAt(p0, p1)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 1])
            expect(scene.penTool.path!.path.toString()).to.equal('M 100 100 C 110 80 150 100 150 100')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.path.toString()).to.equal('M 100 100')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        it("DOWN_CURVE_POINT ---up---> UP_POINT", function() {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            const p2 = { x: 150, y: 100 }

            scene.mouseDownAt(p0)
            scene.mouseTo(p1)
            scene.mouseUp()
            scene.mouseDownAt(p2)
            scene.mouseUp()

            expect(scene.penTool.state).to.equal(State.UP_POINT)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p2)).to.be.true
            expect(scene.hasHandleAt(p0, p1)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 1])
            expect(scene.penTool.path!.path.toString()).to.equal('M 100 100 C 110 80 150 100 150 100')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.path.toString()).to.equal('M 100 100 C 110 80 150 100 150 100')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
        })

        // this is for when we enter UP_POINT with a curve ending in a point
        it("DOWN_CURVE_POINT ---up---> UP_POINT --down--> DOWN_POINT_POINT --MOVE--> DOWN_POINT_CURVE", function() {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            const p2 = { x: 150, y: 100 }
            const p3 = { x: 200, y: 110 }
            const p4 = { x: 220, y: 70 }

            scene.mouseDownAt(p0)
            scene.mouseTo(p1)
            scene.mouseUp()
            scene.mouseDownAt(p2)
            scene.mouseUp()
            scene.mouseDownAt(p3)
            scene.mouseTo(p4)

            expect(scene.penTool.state).to.equal(State.DOWN_POINT_CURVE)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p2)).to.be.true
            expect(scene.hasAnchorAt(p3)).to.be.true
            expect(scene.hasHandleAt(p3, p4)).to.be.true
            expect(scene.hasHandleAt(p3, mirrorPoint(p3, p4))).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])
            expect(scene.penTool.path!.path.toString()).to.equal('M 100 100 C 110 80 150 100 150 100 C 150 100 180 150 200 110')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.path.toString()).to.equal('M 100 100 C 110 80 150 100 150 100')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        it("DOWN_CURVE_POINT ---move---> DOWN_CURVE_CURVE", function() {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            const p2 = { x: 150, y: 100 }
            const p3 = { x: 170, y: 70 }

            scene.mouseDownAt(p0)
            scene.mouseTo(p1)
            scene.mouseUp()
            scene.mouseDownAt(p2)
            scene.mouseTo(p3)

            expect(scene.penTool.state).to.equal(State.DOWN_CURVE_CURVE)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p2)).to.be.true
            expect(scene.hasHandleAt(p0, p1)).to.be.true
            expect(scene.hasHandleAt(p2, p3)).to.be.true
            const m = mirrorPoint(p2, p3)
            expect(scene.hasHandleAt(p2, mirrorPoint(p2, p3))).to.be.true

            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 3])
            expect(scene.penTool.path!.path.toString()).to.equal(`M 100 100 C 110 80 ${m.x} ${m.y} 150 100`)
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.path.toString()).to.equal('M 100 100')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        it("DOWN_CURVE_CURVE ---move---> DOWN_CURVE_CURVE", function() {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            const p2 = { x: 150, y: 100 }
            const p3 = { x: 170, y: 70 }
            const p4 = { x: 160, y: 60 }

            scene.mouseDownAt(p0)
            scene.mouseTo(p1)
            scene.mouseUp()
            scene.mouseDownAt(p2)
            scene.mouseTo(p3)
            scene.mouseTo(p4)

            expect(scene.penTool.state).to.equal(State.DOWN_CURVE_CURVE)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p2)).to.be.true
            expect(scene.hasHandleAt(p0, p1)).to.be.true
            expect(scene.hasHandleAt(p2, p4)).to.be.true
            const m = mirrorPoint(p2, p4)
            expect(scene.hasHandleAt(p2, mirrorPoint(p2, p4))).to.be.true

            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 3])
            expect(scene.penTool.path!.path.toString()).to.equal(`M 100 100 C 110 80 ${m.x} ${m.y} 150 100`)
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.path.toString()).to.equal('M 100 100')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        it("DOWN_CURVE_CURVE ---up---> UP_X_CURVE", function() {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            const p2 = { x: 150, y: 100 }
            const p3 = { x: 170, y: 70 }

            scene.mouseDownAt(p0)
            scene.mouseTo(p1)
            scene.mouseUp()
            scene.mouseDownAt(p2)
            scene.mouseTo(p3)
            scene.mouseUp()

            expect(scene.penTool.state).to.equal(State.UP_X_CURVE)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p2)).to.be.true
            expect(scene.hasHandleAt(p0, p1)).to.be.true
            expect(scene.hasHandleAt(p2, p3)).to.be.true
            const m = mirrorPoint(p2, p3)
            expect(scene.hasHandleAt(p2, mirrorPoint(p2, p3))).to.be.true

            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 3])
            expect(scene.penTool.path!.path.toString()).to.equal(`M 100 100 C 110 80 ${m.x} ${m.y} 150 100`)
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.path.toString()).to.equal(`M 100 100 C 110 80 ${m.x} ${m.y} 150 100`)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
        })

        it("UP_X_CURVE --down--> DOWN_CURVE_POINT", function() {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            const p2 = { x: 150, y: 100 }
            const p3 = { x: 170, y: 70 }
            const p4 = { x: 200, y: 100 }

            scene.mouseDownAt(p0)
            scene.mouseTo(p1)
            scene.mouseUp()
            scene.mouseDownAt(p2)
            scene.mouseTo(p3)
            scene.mouseUp()
            scene.mouseDownAt(p4)

            expect(scene.penTool.state).to.equal(State.DOWN_CURVE_POINT)

            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p2)).to.be.true
            expect(scene.hasAnchorAt(p4)).to.be.true
            expect(scene.hasHandleAt(p2, p3)).to.be.true

            expect(scene.getAnchorHandleCount()).to.deep.equal([3, 1])
            expect(scene.penTool.path!.path.toString()).to.equal(`M 100 100 C 110 80 130 130 150 100 C 170 70 200 100 200 100`)
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.path.toString()).to.equal(`M 100 100 C 110 80 130 130 150 100`)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

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