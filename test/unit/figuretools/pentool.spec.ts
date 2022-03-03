import { expect } from '@esm-bundle/chai'

import { FigureEditorScene } from "../FigureEditorScene"
import { State } from "client/figuretools/PenTool"

import { initializeCORBAValueTypes } from "client/workflow"
import { Point, mirrorPoint } from 'shared/geometry'

it("\x07") // beep

describe("PenTool", function () {
    this.beforeAll(async function () {
        initializeCORBAValueTypes()
        await loadScript("polyfill/path-data-polyfill.js")
    })

    // the checks the state machine according to doc/pentool-state-diagram.svg
    describe("draw curves one segment at a time (v4)", function () {

        //
        // getting started
        //

        it("READY", function () {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            expect(scene.penTool.state).to.equal(State.READY)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready.svg")
        })

        it("READY ---down---> DOWN_POINT", function () {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            scene.mouseDownAt(p0)

            expect(scene.penTool.state).to.equal(State.DOWN_POINT)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([1, 0])
            expect(scene.penTool.path!.toString()).to.equal('M 100 100')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.toPathString()).to.equal('M 100 100')
            expect(scene.penTool.figure!.toInternalString()).to.equal('E 100 100')

            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        //
        // drawing with evey anchor a line
        //

        it("DOWN_POINT ---up---> UP_POINT", function () {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            scene.mouseDownAt(p0)
            scene.mouseUp()

            expect(scene.penTool.state).to.equal(State.UP_POINT)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([1, 0])
            expect(scene.penTool.path!.toString()).to.equal('M 100 100')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.toPathString()).to.equal('M 100 100')
            expect(scene.penTool.figure!.toInternalString()).to.equal('E 100 100')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
        })

        it("UP_POINT ---down---> DOWN_POINT_POINT", function () {
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
            expect(scene.penTool.path!.toString()).to.equal('M 100 100 L 110 80')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.toPathString()).to.equal('M 100 100')
            expect(scene.penTool.figure!.toInternalString()).to.equal('E 100 100')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        it("DOWN_POINT_POINT ---up---> UP_POINT", function () {
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
            expect(scene.penTool.path!.toString()).to.equal('M 100 100 L 110 80')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.toPathString()).to.equal('M 100 100 L 110 80')
            expect(scene.penTool.figure!.toInternalString()).to.equal('E 100 100 E 110 80')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
        })

        // drawing with every anchor being a curve

        it("DOWN_POINT ---move---> DOWN_CURVE", function () {
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
            expect(scene.penTool.path!.toString()).to.equal('M 100 100 C 110 80 0 0 0 0')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.toPathString()).to.equal('M 100 100')
            expect(scene.penTool.figure!.toInternalString()).to.equal('E 100 100')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        it("DOWN_CURVE ---move---> DOWN_CURVE", function () {
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
            expect(scene.penTool.path!.toString()).to.equal('M 100 100 C 130 70 0 0 0 0')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.toPathString()).to.equal('M 100 100')
            expect(scene.penTool.figure!.toInternalString()).to.equal('E 100 100')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        it("DOWN_CURVE ---up---> UP_CURVE", function () {
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
            expect(scene.penTool.path!.toString()).to.equal('M 100 100 C 110 80 0 0 0 0')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.toPathString()).to.equal('M 100 100')
            expect(scene.penTool.figure!.toInternalString()).to.equal('EA 100 100 110 80')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
        })

        it("UP_CURVE ---down---> DOWN_CURVE_POINT", function () {
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
            expect(scene.penTool.path!.toString()).to.equal('M 100 100 C 110 80 150 100 150 100')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.toPathString()).to.equal('M 100 100')
            expect(scene.penTool.figure!.toInternalString()).to.equal('EA 100 100 110 80')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        it("DOWN_CURVE_POINT ---move---> DOWN_CURVE_CURVE", function () {
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
            expect(scene.penTool.path!.toString()).to.equal(`M 100 100 C 110 80 ${m.x} ${m.y} 150 100`)
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.toPathString()).to.equal('M 100 100')
            expect(scene.penTool.figure!.toInternalString()).to.equal('EA 100 100 110 80')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        it("DOWN_CURVE_CURVE ---move---> DOWN_CURVE_CURVE", function () {
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
            expect(scene.penTool.path!.toString()).to.equal(`M 100 100 C 110 80 ${m.x} ${m.y} 150 100`)
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.toPathString()).to.equal('M 100 100')
            expect(scene.penTool.figure!.toInternalString()).to.equal('EA 100 100 110 80')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        it("DOWN_CURVE_CURVE ---up---> UP_X_CURVE", function () {
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
            expect(scene.penTool.path!.toString()).to.equal(`M 100 100 C 110 80 ${m.x} ${m.y} 150 100`)
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.toInternalString()).to.equal(`EA 100 100 110 80 AE ${m.x} ${m.y} 150 100`)
            expect(scene.penTool.figure!.toPathString()).to.equal(`M 100 100 C 110 80 ${m.x} ${m.y} 150 100`)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
        })

        it("UP_X_CURVE --down--> DOWN_CURVE_POINT", function () {
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
            expect(scene.penTool.path!.toString()).to.equal(`M 100 100 C 110 80 130 130 150 100 C 170 70 200 100 200 100`)
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.toInternalString()).to.equal(`EA 100 100 110 80 AE 130 130 150 100`)
            expect(scene.penTool.figure!.toPathString()).to.equal(`M 100 100 C 110 80 130 130 150 100`)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        it("UP_X_CURVE --down--> DOWN_CURVE_POINT --up--> UP_POINT", function () {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            const p2 = { x: 150, y: 100 }
            const p3 = { x: 170, y: 70 }
            const p4 = { x: 200, y: 100 }
            const m = mirrorPoint(p2, p3)

            //      (p1)      (p3)
            //      /         /
            //     /         /
            //    /         /
            //  [p0]      [p2]       [p4]
            //            /
            //           /
            //          /
            //        (m)
            // EA p0 p1 S m p2 E p4

            scene.mouseDownAt(p0)
            scene.mouseTo(p1)
            scene.mouseUp()
            scene.mouseDownAt(p2)
            scene.mouseTo(p3)
            scene.mouseUp()
            expect(scene.penTool.state).to.equal(State.UP_X_CURVE)
            expect(scene.penTool.figure!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p1)} AE ${p(m)} ${p(p2)}`)

            scene.mouseDownAt(p4)
            expect(scene.penTool.state).to.equal(State.DOWN_CURVE_POINT)
            expect(scene.penTool.figure!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p1)} AE ${p(m)} ${p(p2)}`)

            scene.mouseUp()
            expect(scene.penTool.state).to.equal(State.UP_POINT)

            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p2)).to.be.true
            expect(scene.hasAnchorAt(p4)).to.be.true
            expect(scene.hasHandleAt(p2, p3)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([3, 1])

            expect(scene.penTool.path!.toString()).to.equal(`M 100 100 C 110 80 130 130 150 100 C 170 70 200 100 200 100`)
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p1)} S ${p(m)} ${p(p2)} E ${p(p4)}`)
            expect(scene.penTool.figure!.toPathString()).to.equal(`M 100 100 C 110 80 130 130 150 100 C 170 70 200 100 200 100`)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
        })

        // curve after curve
        it("UP_X_CURVE --down--> DOWN_CURVE_POINT --move--> DOWN_CURVE_CURVE --up--> UP_X_CURVE", function () {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            const p2 = { x: 150, y: 100 }
            const p3 = { x: 170, y: 70 }
            const p4 = { x: 200, y: 100 }
            const p5 = { x: 220, y: 60 }

            //      (p1)      (p3)       (p5)
            //     /          /          /
            //    /          /          /
            //  [p0]       [p2]       [p4]
            //             /          /
            //            /          /
            //       m(p2,p3)    m(p4,p5)

            scene.mouseDownAt(p0)
            scene.mouseTo(p1)
            scene.mouseUp()
            scene.mouseDownAt(p2)
            scene.mouseTo(p3)
            scene.mouseUp()
            expect(scene.penTool.state).to.equal(State.UP_X_CURVE)
            scene.mouseDownAt(p4)
            expect(scene.penTool.state).to.equal(State.DOWN_CURVE_POINT)
            scene.mouseTo(p5)
            expect(scene.penTool.state).to.equal(State.DOWN_CURVE_CURVE)
            scene.mouseUp()

            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p2)).to.be.true
            expect(scene.hasAnchorAt(p4)).to.be.true
            expect(scene.hasHandleAt(p2, p3)).to.be.true
            expect(scene.hasHandleAt(p4, p5)).to.be.true
            expect(scene.hasHandleAt(p4, p5)).to.be.true
            expect(scene.hasHandleAt(p4, mirrorPoint(p4, p5))).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([3, 3])

            //                                                 p0        p1     m(p2,p3)p2        p3     m(p4,p5)p4
            expect(scene.penTool.path!.toString()).to.equal(`M 100 100 C 110 80 130 130 150 100 C 170 70 180 140 200 100`)
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.toInternalString()).to.equal(`EA 100 100 110 80 S 130 130 150 100 AE 180 140 200 100`)
            expect(scene.penTool.figure!.toPathString()).to.equal(`M 100 100 C 110 80 130 130 150 100 C 170 70 180 140 200 100`)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
        })

        //
        // mixing curves and lines
        //

        it("DOWN_CURVE_POINT ---up---> UP_POINT", function () {
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
            expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(p1)} ${p(p2)} ${p(p2)}`)
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.toPathString()).to.equal(`M ${p(p0)} C ${p(p1)} ${p(p2)} ${p(p2)}`)
            expect(scene.penTool.figure!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p1)} E ${p(p2)}`)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
        })

        it("DOWN_POINT_POINT ---move---> DOWN_POINT_CURVE", function () {
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
            expect(scene.penTool.path!.toString()).to.equal('M 100 100 C 100 100 90 90 110 80')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.toPathString()).to.equal('M 100 100')
            expect(scene.penTool.figure!.toInternalString()).to.equal('E 100 100')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        it("DOWN_POINT_CURVE ---move---> DOWN_POINT_CURVE", function () {
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
            expect(scene.penTool.path!.toString()).to.equal('M 100 100 C 100 100 100 100 110 80')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.toPathString()).to.equal('M 100 100')
            expect(scene.penTool.figure!.toInternalString()).to.equal('E 100 100')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        it("DOWN_POINT_CURVE ---up---> UP_X_CURVE", function () {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 80 }
            const p2 = { x: 130, y: 70 }
            const p3 = { x: 120, y: 60 }
            scene.mouseDownAt(p0)
            scene.mouseUp()
            scene.mouseDownAt(p1)
            // scene.mouseTo(p2)
            scene.mouseTo(p3)
            scene.mouseUp()

            expect(scene.penTool.state).to.equal(State.UP_X_CURVE)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p1)).to.be.true

            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 2])
            expect(scene.penTool.path!.toString()).to.equal('M 100 100 C 100 100 100 100 110 80')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.toPathString()).to.equal('M 100 100 C 100 100 100 100 110 80')
            expect(scene.penTool.figure!.toInternalString()).to.equal('E 100 100 AE 100 100 110 80')
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
        })

        // this is for when we enter UP_POINT with a curve ending in a point
        it("DOWN_CURVE_POINT ---up---> UP_POINT --down--> DOWN_POINT_POINT --MOVE--> DOWN_POINT_CURVE", function () {
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
            expect(scene.penTool.path!.toString()).to.equal('M 100 100 C 110 80 150 100 150 100 C 150 100 180 150 200 110')
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.penTool.figure!.toPathString()).to.equal('M 100 100 C 110 80 150 100 150 100')
            expect(scene.penTool.figure!.toInternalString()).to.equal(`EA 100 100 110 80 E 150 100`)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
        })

        describe("curve -> close -> curve", function () {
            it("DOWN_CURVE_CURVE --up--> UP_X_CURVE --close--> DOWN_CURVE_CLOSE", function () {
                const scene = new FigureEditorScene()
                scene.selectPenTool()

                const p0 = { x: 100, y: 100 }
                const p1 = { x: 110, y: 80 }
                const p2 = { x: 200, y: 110 }
                const p3 = { x: 220, y: 130 }

                scene.mouseDownAt(p0)
                scene.mouseTo(p1)
                scene.mouseUp()

                scene.mouseDownAt(p2)
                scene.mouseTo(p3)
                scene.mouseUp()

                expect(scene.penTool.state).to.equal(State.UP_X_CURVE)

                scene.mouseDownAt(p0)
                expect(scene.penTool.state).to.equal(State.DOWN_CURVE_CLOSE)

                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasHandleAt(p0, p1)).to.be.true
                expect(scene.hasHandleAt(p2, p3)).to.be.true
                const m = mirrorPoint(p2, p3)
                expect(scene.hasHandleAt(p2, mirrorPoint(p2, p3))).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 3])

                expect(scene.penTool.path!.toString()).to.equal(`M 100 100 C 110 80 ${m.x} ${m.y} 200 110 C 220 130 100 100 100 100`)
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.penTool.figure!.toInternalString()).to.equal(`EA 100 100 110 80 AE ${m.x} ${m.y} 200 110`)
                expect(scene.penTool.figure!.toPathString()).to.equal(`M 100 100 C 110 80 ${m.x} ${m.y} 200 110`)
                expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            })

            it("DOWN_CURVE_CURVE --up--> UP_X_CURVE --close--> DOWN_CURVE_CLOSE --up--> READY", function () {
                const scene = new FigureEditorScene()
                scene.selectPenTool()

                const p0 = { x: 100, y: 100 }
                const p1 = { x: 110, y: 80 }
                const p2 = { x: 200, y: 110 }
                const p3 = { x: 220, y: 130 }

                scene.mouseDownAt(p0)
                scene.mouseTo(p1)
                scene.mouseUp()

                scene.mouseDownAt(p2)
                scene.mouseTo(p3)
                scene.mouseUp()

                scene.mouseDownAt(p0)
                scene.mouseUp()
                expect(scene.penTool.state).to.equal(State.READY)

                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasHandleAt(p0, p1)).to.be.true
                expect(scene.hasHandleAt(p2, p3)).to.be.true
                const m = mirrorPoint(p2, p3)
                expect(scene.hasHandleAt(p2, mirrorPoint(p2, p3))).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 3])

                expect(scene.penTool.path!.toString()).to.equal(`M 100 100 C 110 80 ${m.x} ${m.y} 200 110 C 220 130 100 100 100 100`)
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.penTool.figure!.toInternalString()).to.equal(`EA 100 100 110 80 S ${m.x} ${m.y} 200 110 Z`)
                expect(scene.penTool.figure!.toPathString()).to.equal(`M 100 100 C 110 80 ${m.x} ${m.y} 200 110 C 220 130 100 100 100 100 Z`)
                expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready")
            })

            it("DOWN_CURVE_CURVE --up--> UP_X_CURVE --close--> DOWN_CURVE_CLOSE --move--> DOWN_CURVE_CLOSE_CURVE", function () {
                const scene = new FigureEditorScene()
                scene.selectPenTool()

                const p0 = { x: 100, y: 100 }
                const p1 = { x: 110, y: 80 }
                const p2 = { x: 200, y: 110 }
                const p3 = { x: 220, y: 130 }
                const p4 = { x: 95, y: 110 }

                scene.mouseDownAt(p0)
                scene.mouseTo(p1)
                scene.mouseUp()

                scene.mouseDownAt(p2)
                scene.mouseTo(p3)
                scene.mouseUp()

                scene.mouseDownAt(p0)
                scene.mouseTo(p4)
                expect(scene.penTool.state).to.equal(State.DOWN_CURVE_CLOSE_CURVE)

                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasHandleAt(p0, { x: 105, y: 90 })).to.be.true
                expect(scene.hasHandleAt(p2, mirrorPoint(p2, p3))).to.be.true
                expect(scene.hasHandleAt(p2, p3)).to.be.true
                expect(scene.hasHandleAt(p2, mirrorPoint(p2, p3))).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 4])

                const m = mirrorPoint(p2, p3)
                expect(scene.penTool.path!.toString()).to.equal(`M 100 100 C 90 120 180 90 200 110 C 220 130 105 90 100 100`)
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.penTool.figure!.toInternalString()).to.equal(`EA 100 100 110 80 AE 180 90 200 110`)
                expect(scene.penTool.figure!.toPathString()).to.equal(`M 100 100 C 110 80 180 90 200 110`)
                expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            })

            it("DOWN_CURVE_CURVE --up--> UP_X_CURVE --close--> DOWN_CURVE_CLOSE --move--> DOWN_CURVE_CLOSE_CURVE --move--> DOWN_CURVE_CLOSE_CURVE", function () {
                const scene = new FigureEditorScene()
                scene.selectPenTool()

                const p0 = { x: 100, y: 100 }
                const p1 = { x: 110, y: 80 }
                const p2 = { x: 200, y: 110 }
                const p3 = { x: 220, y: 130 }
                const p4 = { x: 75, y: 125 }
                const p5 = { x: 95, y: 110 }

                scene.mouseDownAt(p0)
                scene.mouseTo(p1)
                scene.mouseUp()

                scene.mouseDownAt(p2)
                scene.mouseTo(p3)
                scene.mouseUp()

                scene.mouseDownAt(p0)
                scene.mouseTo(p4)
                scene.mouseTo(p5)
                expect(scene.penTool.state).to.equal(State.DOWN_CURVE_CLOSE_CURVE)

                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasHandleAt(p0, { x: 105, y: 90 })).to.be.true
                expect(scene.hasHandleAt(p2, mirrorPoint(p2, p3))).to.be.true
                expect(scene.hasHandleAt(p2, p3)).to.be.true
                expect(scene.hasHandleAt(p2, mirrorPoint(p2, p3))).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 4])

                const m = mirrorPoint(p2, p3)
                expect(scene.penTool.path!.toString()).to.equal(`M 100 100 C 90 120 ${m.x} ${m.y} 200 110 C 220 130 105 90 100 100`)
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.penTool.figure!.toInternalString()).to.equal(`EA 100 100 110 80 AE ${m.x} ${m.y} 200 110`)
                expect(scene.penTool.figure!.toPathString()).to.equal(`M 100 100 C 110 80 ${m.x} ${m.y} 200 110`)
                expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            })

            it("DOWN_CURVE_CURVE --up--> UP_X_CURVE --close--> DOWN_CURVE_CLOSE --move--> DOWN_CURVE_CLOSE_CURVE --up--> READY", function () {
                const scene = new FigureEditorScene()
                scene.selectPenTool()

                const p0 = { x: 100, y: 100 }
                const p1 = { x: 110, y: 80 }
                const p2 = { x: 200, y: 110 }
                const p3 = { x: 220, y: 130 }
                const p4 = { x: 75, y: 125 }
                const p5 = { x: 95, y: 110 }

                scene.mouseDownAt(p0)
                scene.mouseTo(p1)
                scene.mouseUp()

                scene.mouseDownAt(p2)
                scene.mouseTo(p3)
                scene.mouseUp()

                scene.mouseDownAt(p0)
                scene.mouseTo(p4)
                scene.mouseTo(p5)
                scene.mouseUp()
                expect(scene.penTool.state).to.equal(State.READY)

                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasHandleAt(p0, { x: 105, y: 90 })).to.be.true
                expect(scene.hasHandleAt(p2, mirrorPoint(p2, p3))).to.be.true
                expect(scene.hasHandleAt(p2, p3)).to.be.true
                expect(scene.hasHandleAt(p2, mirrorPoint(p2, p3))).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 4])

                const m = mirrorPoint(p2, p3)
                expect(scene.penTool.path!.toString()).to.equal(`M 100 100 C 90 120 ${m.x} ${m.y} 200 110 C 220 130 105 90 100 100`)
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.penTool.figure!.toInternalString()).to.equal(`SM 105 90 100 100 90 120 S ${m.x} ${m.y} 200 110 Z`)
                expect(scene.penTool.figure!.toPathString()).to.equal(`M 100 100 C 90 120 ${m.x} ${m.y} 200 110 C 220 130 105 90 100 100 Z`)
                expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready.svg")
            })
        })

        describe("curve -> close -> point", function () {

            it("DOWN_POINT_CURVE --up--> UP_X_CURVE --close--> DOWN_CURVE_CLOSE", function () {
                const scene = new FigureEditorScene()
                scene.selectPenTool()

                const p0 = { x: 100, y: 100 }
                const p1 = { x: 110, y: 80 }
                const p2 = { x: 130, y: 70 }
                scene.mouseDownAt(p0)
                scene.mouseUp()
                scene.mouseDownAt(p1)
                scene.mouseTo(p2)
                scene.mouseUp()
                scene.mouseDownAt(p0)

                expect(scene.penTool.state).to.equal(State.DOWN_CURVE_CLOSE)

                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p1)).to.be.true
                expect(scene.hasHandleAt(p1, p2)).to.be.true
                expect(scene.hasHandleAt(p1, mirrorPoint(p1, p2))).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 2])

                expect(scene.penTool.path!.toString()).to.equal('M 100 100 C 100 100 90 90 110 80 C 130 70 100 100 100 100')
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.penTool.figure!.toPathString()).to.equal('M 100 100 C 100 100 90 90 110 80')
                expect(scene.penTool.figure!.toInternalString()).to.equal('E 100 100 AE 90 90 110 80')
                expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            })

            it("DOWN_POINT_CURVE --up--> UP_X_CURVE --close--> DOWN_CURVE_CLOSE --up--> READY", function () {
                const scene = new FigureEditorScene()
                scene.selectPenTool()

                const p0 = { x: 100, y: 100 }
                const p1 = { x: 110, y: 80 }
                const p2 = { x: 130, y: 70 }
                scene.mouseDownAt(p0)
                scene.mouseUp()
                scene.mouseDownAt(p1)
                scene.mouseTo(p2)
                scene.mouseUp()
                scene.mouseDownAt(p0)
                scene.mouseUp()

                expect(scene.penTool.state).to.equal(State.READY)

                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p1)).to.be.true
                expect(scene.hasHandleAt(p1, p2)).to.be.true
                expect(scene.hasHandleAt(p1, mirrorPoint(p1, p2))).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 2])

                expect(scene.penTool.path!.toString()).to.equal('M 100 100 C 100 100 90 90 110 80 C 130 70 100 100 100 100')
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.penTool.figure!.toPathString()).to.equal('M 100 100 C 100 100 90 90 110 80 C 130 70 100 100 100 100 Z')
                expect(scene.penTool.figure!.toInternalString()).to.equal('E 100 100 S 90 90 110 80 Z')
                expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready.svg")
            })

            it("DOWN_POINT_CURVE --up--> UP_X_CURVE --close--> DOWN_CURVE_CLOSE --move--> DOWN_CURVE_CLOSE_CURVE", function () {
                const scene = new FigureEditorScene()
                scene.selectPenTool()

                const p0 = { x: 100, y: 100 }
                const p1 = { x: 110, y: 80 }
                const p2 = { x: 130, y: 70 }
                const p3 = { x: 90, y: 120 }
                scene.mouseDownAt(p0)
                scene.mouseUp()
                scene.mouseDownAt(p1)
                scene.mouseTo(p2)
                scene.mouseUp()
                scene.mouseDownAt(p0)
                scene.mouseTo(p3)

                expect(scene.penTool.state).to.equal(State.DOWN_CURVE_CLOSE_CURVE)
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p1)).to.be.true
                expect(scene.hasHandleAt(p1, p2)).to.be.true
                expect(scene.hasHandleAt(p1, mirrorPoint(p1, p2))).to.be.true
                expect(scene.hasHandleAt(p0, mirrorPoint(p0, p3))).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 3])

                expect(scene.penTool.path!.toString()).to.equal('M 100 100 C 100 100 90 90 110 80 C 130 70 110 80 100 100')
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.penTool.figure!.toPathString()).to.equal('M 100 100 C 100 100 90 90 110 80')
                expect(scene.penTool.figure!.toInternalString()).to.equal('E 100 100 AE 90 90 110 80')
                expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            })

            it("DOWN_POINT_CURVE --up--> UP_X_CURVE --close--> DOWN_CURVE_CLOSE --move--> DOWN_CURVE_CLOSE_CURVE --move--> DOWN_CURVE_CLOSE_CURVE", function () {
                const scene = new FigureEditorScene()
                scene.selectPenTool()

                const p0 = { x: 100, y: 100 }
                const p1 = { x: 110, y: 80 }
                const p2 = { x: 130, y: 70 }
                const p3 = { x: 220, y: 130 }
                const p4 = { x: 90, y: 120 }
                scene.mouseDownAt(p0)
                scene.mouseUp()
                scene.mouseDownAt(p1)
                scene.mouseTo(p2)
                scene.mouseUp()
                scene.mouseDownAt(p0)
                scene.mouseTo(p3)
                scene.mouseTo(p4)

                expect(scene.penTool.state).to.equal(State.DOWN_CURVE_CLOSE_CURVE)
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p1)).to.be.true
                expect(scene.hasHandleAt(p1, p2)).to.be.true
                expect(scene.hasHandleAt(p1, mirrorPoint(p1, p2))).to.be.true
                expect(scene.hasHandleAt(p0, mirrorPoint(p0, p4))).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 3])

                expect(scene.penTool.path!.toString()).to.equal('M 100 100 C 100 100 90 90 110 80 C 130 70 110 80 100 100')
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.penTool.figure!.toPathString()).to.equal('M 100 100 C 100 100 90 90 110 80')
                expect(scene.penTool.figure!.toInternalString()).to.equal('E 100 100 AE 90 90 110 80')
                expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            })

            it("DOWN_POINT_CURVE --up--> UP_X_CURVE --close--> DOWN_CURVE_CLOSE --move--> DOWN_CURVE_CLOSE_CURVE --> up --> READY", function () {
                const scene = new FigureEditorScene()
                scene.selectPenTool()

                const p0 = { x: 100, y: 100 }
                const p1 = { x: 150, y: 100 }
                const p2 = { x: 170, y: 70 }
                const p3 = { x: 80, y: 120 }
                const m0 = mirrorPoint(p1, p2)
                const m1 = mirrorPoint(p0, p3)
                scene.mouseDownAt(p0)
                scene.mouseUp()
                scene.mouseDownAt(p1)
                scene.mouseTo(p2)
                scene.mouseUp()
                scene.mouseDownAt(p0)
                scene.mouseTo(p3)
                scene.mouseUp()

                expect(scene.penTool.state).to.equal(State.READY)
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p1)).to.be.true
                expect(scene.hasHandleAt(p1, p2)).to.be.true
                expect(scene.hasHandleAt(p1, mirrorPoint(p1, p2))).to.be.true
                expect(scene.hasHandleAt(p0, mirrorPoint(p0, p3))).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 3])

                expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(p0)} ${p(m0)} ${p(p1)} C ${p(p2)} ${p(m1)} ${p(p0)}`)
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.penTool.figure!.toInternalString()).to.equal(`AE ${p(m1)} ${p(p0)} S ${p(m0)} ${p(p1)} Z`)
                expect(scene.penTool.figure!.toPathString()).to.equal(`M ${p(p0)} C ${p(p0)} ${p(m0)} ${p(p1)} C ${p(p2)} ${p(m1)} ${p(p0)} Z`)
                expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready.svg")
            })
        })

        // WRONG: THIS IS point -> close -> curve AS THE 1ST ANCHOR IS A POINT!!!
        describe("point -> close -> curve", function () {
            it("*_POINT --up--> UP_POINT --close--> DOWN_POINT_CLOSE", function () {
                const scene = new FigureEditorScene()
                scene.selectPenTool()

                const p0 = { x: 100, y: 100 }
                const p1 = { x: 150, y: 100 }
                const p2 = { x: 80, y: 120 }
                const m = mirrorPoint(p0, p2)
                scene.mouseDownAt(p0)
                scene.mouseUp()

                scene.mouseDownAt(p1)
                scene.mouseUp()

                scene.mouseDownAt(p0)

                expect(scene.penTool.state).to.equal(State.DOWN_POINT_CLOSE)
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p1)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 0])

                expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} L ${p(p1)} L ${p(p0)}`)
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.penTool.figure!.toInternalString()).to.equal(`E ${p(p0)} E ${p(p1)}`)
                expect(scene.penTool.figure!.toPathString()).to.equal(`M ${p(p0)} L ${p(p1)}`)
                expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            })

            // // special case: p0 p1 p0
            // it("*_POINT --up--> UP_POINT --close--> DOWN_POINT_CLOSE --up--> READY", function () {
            //     const scene = new FigureEditorScene()
            //     scene.selectPenTool()

            //     const p0 = { x: 100, y: 100 }
            //     const p1 = { x: 150, y: 100 }
            //     const p2 = { x: 125, y: 120 }
            //     const m = mirrorPoint(p0, p2)
            //     scene.mouseDownAt(p0)
            //     scene.mouseUp()

            //     scene.mouseDownAt(p1)
            //     scene.mouseUp()

            //     scene.mouseDownAt(p2)
            //     scene.mouseUp()

            //     scene.mouseDownAt(p0)
            //     scene.mouseUp()

            //     expect(scene.penTool.state).to.equal(State.DOWN_POINT_CLOSE_CURVE)
            //     expect(scene.hasAnchorAt(p0)).to.be.true
            //     expect(scene.hasAnchorAt(p1)).to.be.true
            //     expect(scene.hasAnchorAt(p2)).to.be.true
            //     expect(scene.getAnchorHandleCount()).to.deep.equal([3, 0])

            //     expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} L ${p(p1)} C ${p(p1)} ${p(m)} ${p(p0)}`)
            //     expect(scene.model.layers[0].data.length).equals(1)
            //     expect(scene.penTool.figure!.toInternalString()).to.equal(`E ${p(p0)} E ${p(p1)}`)
            //     expect(scene.penTool.figure!.toPathString()).to.equal(`M ${p(p0)} L ${p(p1)}`)
            //     expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            // })

            it("*_POINT --up--> UP_POINT --close--> DOWN_POINT_CLOSE --move--> DOWN_POINT_CLOSE_CURVE", function () {
                const scene = new FigureEditorScene()
                scene.selectPenTool()

                const p0 = { x: 100, y: 100 }
                const p1 = { x: 150, y: 100 }
                const p2 = { x: 80, y: 120 }
                const m = mirrorPoint(p0, p2)
                scene.mouseDownAt(p0)
                scene.mouseUp()

                scene.mouseDownAt(p1)
                scene.mouseUp()

                scene.mouseDownAt(p0)
                scene.mouseTo(p2)

                expect(scene.penTool.state).to.equal(State.DOWN_POINT_CLOSE_CURVE)
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p1)).to.be.true
                expect(scene.hasHandleAt(p0, m)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 1])

                expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} L ${p(p1)} C ${p(p1)} ${p(m)} ${p(p0)}`)
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.penTool.figure!.toInternalString()).to.equal(`E ${p(p0)} E ${p(p1)}`)
                expect(scene.penTool.figure!.toPathString()).to.equal(`M ${p(p0)} L ${p(p1)}`)
                expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            })

            // point point closeAsCurve
            it("point point closeAsCurve: *_POINT --up--> UP_POINT --close--> DOWN_POINT_CLOSE --move--> DOWN_POINT_CLOSE_CURVE --move--> DOWN_POINT_CLOSE_CURVE", function () {
                const scene = new FigureEditorScene()
                scene.selectPenTool()

                const p0 = { x: 100, y: 100 }
                const p1 = { x: 150, y: 100 }
                const p2 = { x: 60, y: 110 }
                const p3 = { x: 80, y: 120 }
                const m = mirrorPoint(p0, p3)

                scene.mouseDownAt(p0)
                scene.mouseUp()

                scene.mouseDownAt(p1)
                scene.mouseUp()

                scene.mouseDownAt(p0)
                scene.mouseTo(p2)
                scene.mouseTo(p3)

                expect(scene.penTool.state).to.equal(State.DOWN_POINT_CLOSE_CURVE)
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p1)).to.be.true
                expect(scene.hasHandleAt(p0, m)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 1])

                expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} L ${p(p1)} C ${p(p1)} ${p(m)} ${p(p0)}`)
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.penTool.figure!.toInternalString()).to.equal(`E ${p(p0)} E ${p(p1)}`)
                expect(scene.penTool.figure!.toPathString()).to.equal(`M ${p(p0)} L ${p(p1)}`)
                expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            })

            describe("close with point", function () {
                // EA E ->
                // EA AE ->
                it("E AE -> ...", function () {
                    const scene = new FigureEditorScene()
                    scene.selectPenTool()

                    const p0 = { x: 100, y: 100 }
                    const p1 = { x: 200, y: 100 }
                    const p2 = { x: 220, y: 70 }
                    const m = mirrorPoint(p1, p2)

                    scene.mouseDownAt(p0)
                    scene.mouseUp()

                    scene.mouseDownAt(p1)
                    scene.mouseTo(p2)
                    scene.mouseUp()
                    expect(scene.penTool.state).to.equal(State.UP_X_CURVE)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(p0)} ${p(m)} ${p(p1)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasAnchorAt(p1)).to.be.true
                    expect(scene.hasHandleAt(p1, p2)).to.be.true
                    expect(scene.hasHandleAt(p1, m)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 2])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`E ${p(p0)} AE ${p(m)} ${p(p1)}`)

                    scene.mouseDownAt(p0)
                    expect(scene.penTool.state).to.equal(State.DOWN_CURVE_CLOSE)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(p0)} ${p(m)} ${p(p1)} C ${p(p2)} ${p(p0)} ${p(p0)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasAnchorAt(p1)).to.be.true
                    expect(scene.hasHandleAt(p1, p2)).to.be.true
                    expect(scene.hasHandleAt(p1, m)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 2])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`E ${p(p0)} AE ${p(m)} ${p(p1)}`)

                    scene.mouseUp()
                    expect(scene.penTool.state).to.equal(State.READY)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(p0)} ${p(m)} ${p(p1)} C ${p(p2)} ${p(p0)} ${p(p0)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasAnchorAt(p1)).to.be.true
                    expect(scene.hasHandleAt(p1, p2)).to.be.true
                    expect(scene.hasHandleAt(p1, m)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 2])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`E ${p(p0)} S ${p(m)} ${p(p1)} Z`)
                })
                it("E E -> E E Z", function () {
                    const scene = new FigureEditorScene()
                    scene.selectPenTool()

                    const p0 = { x: 100, y: 100 }
                    const p1 = { x: 200, y: 100 }

                    scene.mouseDownAt(p0)
                    scene.mouseUp()

                    scene.mouseDownAt(p1)
                    scene.mouseUp()

                    scene.mouseDownAt(p0)
                    expect(scene.penTool.state).to.equal(State.DOWN_POINT_CLOSE)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} L ${p(p1)} L ${p(p0)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasAnchorAt(p1)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 0])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`E ${p(p0)} E ${p(p1)}`)

                    scene.mouseUp()
                    expect(scene.penTool.state).to.equal(State.READY)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} L ${p(p1)} L ${p(p0)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasAnchorAt(p1)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 0])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`E ${p(p0)} E ${p(p1)} Z`)
                })
            })

            describe("close with curve", function () {
                // FIXME: the 'move' transitions are missing
                it("E AE -> AE S Z", function () {
                    const scene = new FigureEditorScene()
                    scene.selectPenTool()

                    const p0 = { x: 100, y: 100 }
                    const p1 = { x: 200, y: 100 }
                    const p2 = { x: 200, y: 80 }
                    const p3 = { x: 110, y: 120 }
                    const m0 = mirrorPoint(p1, p2)
                    const m1 = mirrorPoint(p0, p3)

                    scene.mouseDownAt(p0)
                    scene.mouseUp()

                    scene.mouseDownAt(p1)
                    scene.mouseTo(p2)

                    scene.mouseUp()
                    expect(scene.penTool.state).to.equal(State.UP_X_CURVE)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(p0)} ${p(m0)} ${p(p1)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasAnchorAt(p1)).to.be.true
                    expect(scene.hasHandleAt(p1, p2)).to.be.true
                    expect(scene.hasHandleAt(p1, m0)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 2])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`E ${p(p0)} AE ${p(m0)} ${p(p1)}`)

                    scene.mouseDownAt(p0)
                    expect(scene.penTool.state).to.equal(State.DOWN_CURVE_CLOSE)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(p0)} ${p(m0)} ${p(p1)} C ${p(p2)} ${p(p0)} ${p(p0)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasAnchorAt(p1)).to.be.true
                    expect(scene.hasHandleAt(p1, p2)).to.be.true
                    expect(scene.hasHandleAt(p1, m0)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 2])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`E ${p(p0)} AE ${p(m0)} ${p(p1)}`)

                    scene.mouseTo(p3)
                    expect(scene.penTool.state).to.equal(State.DOWN_CURVE_CLOSE_CURVE)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(p0)} ${p(m0)} ${p(p1)} C ${p(p2)} ${p(m1)} ${p(p0)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasAnchorAt(p1)).to.be.true
                    expect(scene.hasHandleAt(p1, p2)).to.be.true
                    expect(scene.hasHandleAt(p1, m0)).to.be.true
                    expect(scene.hasHandleAt(p0, m1)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 3])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`E ${p(p0)} AE ${p(m0)} ${p(p1)}`)

                    scene.mouseUp()
                    expect(scene.penTool.state).to.equal(State.READY)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(p0)} ${p(m0)} ${p(p1)} C ${p(p2)} ${p(m1)} ${p(p0)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasAnchorAt(p1)).to.be.true
                    expect(scene.hasHandleAt(p1, p2)).to.be.true
                    expect(scene.hasHandleAt(p1, m0)).to.be.true
                    expect(scene.hasHandleAt(p0, m1)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 3])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`AE ${p(m1)} ${p(p0)} S ${p(m0)} ${p(p1)} Z`)
                })

                it("E E -> AE E Z", function () {
                    const scene = new FigureEditorScene()
                    scene.selectPenTool()

                    const p0 = { x: 100, y: 100 }
                    const p1 = { x: 200, y: 100 }
                    const p2 = { x: 110, y: 120 }
                    const m = mirrorPoint(p0, p2)

                    scene.mouseDownAt(p0)
                    scene.mouseUp()

                    scene.mouseDownAt(p1)
                    scene.mouseUp()

                    scene.mouseDownAt(p0)
                    expect(scene.penTool.state).to.equal(State.DOWN_POINT_CLOSE)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} L ${p(p1)} L ${p(p0)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasAnchorAt(p1)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 0])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`E ${p(p0)} E ${p(p1)}`)

                    scene.mouseTo(p2)
                    expect(scene.penTool.state).to.equal(State.DOWN_POINT_CLOSE_CURVE)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} L ${p(p1)} C ${p(p1)} ${p(m)} ${p(p0)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasAnchorAt(p1)).to.be.true
                    expect(scene.hasHandleAt(p0, m)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 1])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`E ${p(p0)} E ${p(p1)}`)

                    scene.mouseUp()
                    expect(scene.penTool.state).to.equal(State.READY)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} L ${p(p1)} C ${p(p1)} ${p(m)} ${p(p0)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasAnchorAt(p1)).to.be.true
                    expect(scene.hasHandleAt(p0, m)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 1])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`AE ${p(m)} ${p(p0)} E ${p(p1)} Z`)
                })
                it("EA AE -> SM E Z", function () {
                    const scene = new FigureEditorScene()
                    scene.selectPenTool()

                    const p0 = { x: 100, y: 100 }
                    const p1 = { x: 120, y: 80 }
                    const p2 = { x: 200, y: 100 }
                    const p3 = { x: 220, y: 80 }
                    const p4 = { x: 110, y: 110 }

                    scene.mouseDownAt(p0)
                    scene.mouseTo(p1)
                    scene.mouseUp()

                    scene.mouseDownAt(p2)
                    // NOTE: all expectations till here are covered by EA E -> SM E Z
                    expect(scene.penTool.state).to.equal(State.DOWN_CURVE_POINT)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(p1)} ${p(p2)} ${p(p2)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    // only forward handle remains as in illustrator, affinity designer drops it later at mouseup
                    expect(scene.hasHandleAt(p0, p1)).to.be.true
                    expect(scene.hasAnchorAt(p2)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 1])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p1)}`)

                    const m0 = mirrorPoint(p2, p3)

                    scene.mouseTo(p3)
                    expect(scene.penTool.state).to.equal(State.DOWN_CURVE_CURVE)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(p1)} ${p(m0)} ${p(p2)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasHandleAt(p0, p1)).to.be.true
                    expect(scene.hasHandleAt(p2, p3)).to.be.true
                    expect(scene.hasHandleAt(p2, m0)).to.be.true
                    expect(scene.hasAnchorAt(p2)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 3])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p1)}`)

                    scene.mouseUp()
                    expect(scene.penTool.state).to.equal(State.UP_X_CURVE)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(p1)} ${p(m0)} ${p(p2)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasHandleAt(p0, p1)).to.be.true
                    expect(scene.hasHandleAt(p2, p3)).to.be.true
                    expect(scene.hasHandleAt(p2, m0)).to.be.true
                    expect(scene.hasAnchorAt(p2)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 3])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p1)} AE ${p(m0)} ${p(p2)}`)

                    scene.mouseDownAt(p0)
                    expect(scene.penTool.state).to.equal(State.DOWN_CURVE_CLOSE)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(p1)} ${p(m0)} ${p(p2)} C ${p(p3)} ${p(p0)} ${p(p0)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasHandleAt(p0, p1)).to.be.true
                    expect(scene.hasHandleAt(p2, p3)).to.be.true
                    expect(scene.hasHandleAt(p2, m0)).to.be.true
                    expect(scene.hasAnchorAt(p2)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 3])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p1)} AE ${p(m0)} ${p(p2)}`)

                    //        120,80          220,80      
                    //         (p1)            (p3)
                    //         /               /
                    //  (pa)  /               /
                    //      \/               /
                    //     [p0]            [p2]
                    //   100,100         200,100
                    //        \           /
                    //       (p4)        /
                    //          \       /
                    //          (pb)  (m0)
                    const pa = mirrorPoint(p0, p4)
                    const pb = { x: 120, y: 120 }

                    scene.mouseTo(p4)
                    expect(scene.penTool.state).to.equal(State.DOWN_CURVE_CLOSE_CURVE)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(pb)} ${p(m0)} ${p(p2)} C ${p(p3)} ${p(pa)} ${p(p0)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasHandleAt(p0, pa)).to.be.true
                    expect(scene.hasHandleAt(p0, pb)).to.be.true
                    expect(scene.hasHandleAt(p2, m0)).to.be.true
                    expect(scene.hasHandleAt(p2, p3)).to.be.true
                    expect(scene.hasAnchorAt(p2)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 4])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p1)} AE ${p(m0)} ${p(p2)}`)

                    scene.mouseUp()
                    expect(scene.penTool.state).to.equal(State.READY)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(pb)} ${p(m0)} ${p(p2)} C ${p(p3)} ${p(pa)} ${p(p0)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasHandleAt(p0, pa)).to.be.true
                    expect(scene.hasHandleAt(p0, pb)).to.be.true
                    expect(scene.hasHandleAt(p2, m0)).to.be.true
                    expect(scene.hasHandleAt(p2, p3)).to.be.true
                    expect(scene.hasAnchorAt(p2)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 4])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`SM ${p(pa)} ${p(p0)} ${p(pb)} S ${p(m0)} ${p(p2)} Z`)
                })

                it("EA E -> SM E Z", function () {
                    const scene = new FigureEditorScene()
                    scene.selectPenTool()

                    const p0 = { x: 100, y: 100 }
                    const p1 = { x: 120, y: 80 }
                    const p2 = { x: 200, y: 100 }
                    const p3 = { x: 90, y: 90 }

                    expect(scene.penTool.state).to.equal(State.READY)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready.svg")

                    scene.mouseDownAt(p0)
                    expect(scene.penTool.state).to.equal(State.DOWN_POINT)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([1, 0])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`E 100 100`)

                    scene.mouseTo(p1)
                    expect(scene.penTool.state).to.equal(State.DOWN_CURVE)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(p1)} 0 0 0 0`) // weird but okay as long as it's not rendered yet
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasHandleAt(p0, p1)).to.be.true
                    expect(scene.hasHandleAt(p0, mirrorPoint(p0, p1))).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([1, 2])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`E 100 100`)

                    scene.mouseUp()
                    expect(scene.penTool.state).to.equal(State.UP_CURVE)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(p1)} 0 0 0 0`) // weird but okay as long as it's not rendered yet
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasHandleAt(p0, p1)).to.be.true
                    expect(scene.hasHandleAt(p0, mirrorPoint(p0, p1))).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([1, 2])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p1)}`)

                    scene.mouseDownAt(p2)
                    expect(scene.penTool.state).to.equal(State.DOWN_CURVE_POINT)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(p1)} ${p(p2)} ${p(p2)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    // only forward handle remains as in illustrator, affinity designer drops it later at mouseup
                    expect(scene.hasHandleAt(p0, p1)).to.be.true
                    expect(scene.hasAnchorAt(p2)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 1])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p1)}`)

                    scene.mouseUp()
                    expect(scene.penTool.state).to.equal(State.UP_POINT)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(p1)} ${p(p2)} ${p(p2)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasHandleAt(p0, p1)).to.be.true
                    expect(scene.hasAnchorAt(p2)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 1])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p1)} E ${p(p2)}`)

                    scene.mouseDownAt(p0)
                    expect(scene.penTool.state).to.equal(State.DOWN_POINT_CLOSE)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(p1)} ${p(p2)} ${p(p2)} L ${p(p0)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasHandleAt(p0, p1)).to.be.true
                    expect(scene.hasAnchorAt(p2)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 1])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p1)} E ${p(p2)}`)

                    //
                    //           120,80
                    //         (p1)
                    //  90,90   /
                    //   (pa)  /
                    //       \/
                    //      [p0]                  [p2]
                    //  100,100 \               200,100
                    //          (p31)
                    //            110,110
                    //               \
                    //               (pb) 120, 120
                    const p31 = { x: 110, y: 110 }
                    scene.mouseTo(p31)
                    expect(scene.penTool.state).to.equal(State.DOWN_POINT_CLOSE_CURVE)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
                    const pa1 = mirrorPoint(p0, p31)
                    const pb1 = { x: 120, y: 120 }
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(pb1)} ${p(p2)} ${p(p2)} C ${p(p2)} ${p(pa1)} ${p(p0)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasHandleAt(p0, pa1)).to.be.true
                    expect(scene.hasHandleAt(p0, pb1)).to.be.true
                    expect(scene.hasAnchorAt(p2)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 2])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p1)} E ${p(p2)}`)

                    //
                    // 80,80      120,80
                    // (pb)      (p1)
                    //    \      /
                    //   (p3)  /
                    //       \/
                    //      [p0]                  [p2]
                    //  100,100 \               200,100
                    //          (pa)
                    //            110,110
                    //
                    scene.mouseTo(p3)
                    expect(scene.penTool.state).to.equal(State.DOWN_POINT_CLOSE_CURVE)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
                    const pa = mirrorPoint(p0, p3)
                    const pb = { x: 80, y: 80 }
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(pb)} ${p(p2)} ${p(p2)} C ${p(p2)} ${p(pa)} ${p(p0)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasHandleAt(p0, pa)).to.be.true
                    expect(scene.hasHandleAt(p0, pb)).to.be.true
                    expect(scene.hasAnchorAt(p2)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 2])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p1)} E ${p(p2)}`)

                    scene.mouseUp()
                    expect(scene.penTool.state).to.equal(State.READY)
                    expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready.svg")
                    expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} C ${p(pb)} ${p(p2)} ${p(p2)} C ${p(p2)} ${p(pa)} ${p(p0)}`)
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasHandleAt(p0, pa)).to.be.true
                    expect(scene.hasHandleAt(p0, pb)).to.be.true
                    expect(scene.hasAnchorAt(p2)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 2])
                    expect(scene.penTool.figure!.toInternalString()).to.equal(`SM ${p(pa)} ${p(p0)} ${p(pb)} E ${p(p2)} Z`)
                })
            })

            // curve point closeAsCurve
            it("curve point closeAsCurve", function () {
                const scene = new FigureEditorScene()
                scene.selectPenTool()

                const p0 = { x: 100, y: 100 }
                const p1 = { x: 120, y: 80 }
                const p2 = { x: 200, y: 100 }
                const p3 = { x: 90, y: 90 }
                const m = mirrorPoint(p0, p3)

                scene.mouseDownAt(p0)
                scene.mouseTo(p1)
                scene.mouseUp()

                scene.mouseDownAt(p2)
                scene.mouseUp()

                scene.mouseDownAt(p0)
                scene.mouseTo(p3)
                scene.mouseUp()
                // console.log(scene.penTool.figure!.toInternalString())

                expect(scene.penTool.figure!.toInternalString()).to.equal(`SM 110 110 100 100 80 80 E 200 100 Z`)
            })

            it("curve point closeAsCurve (two moves)", function () {
                const scene = new FigureEditorScene()
                scene.selectPenTool()

                const p0 = { x: 100, y: 100 }
                const p1 = { x: 120, y: 80 }
                const p2 = { x: 200, y: 100 }
                const px = { x: 5, y: 7 }
                const p3 = { x: 90, y: 90 }
                const m = mirrorPoint(p0, p3)

                scene.mouseDownAt(p0)
                scene.mouseTo(p1)
                scene.mouseUp()

                scene.mouseDownAt(p2)
                scene.mouseUp()

                scene.mouseDownAt(p0)
                scene.mouseTo(px)
                scene.mouseTo(p3)
                scene.mouseUp()
                // console.log(scene.penTool.figure!.toInternalString())

                expect(scene.penTool.figure!.toInternalString()).to.equal(`SM 110 110 100 100 80 80 E 200 100 Z`)
            })


            it("*_POINT --up--> UP_POINT --close--> DOWN_POINT_CLOSE --move--> DOWN_POINT_CLOSE_CURVE --up--> READY", function () {
                const scene = new FigureEditorScene()
                scene.selectPenTool()

                const p0 = { x: 100, y: 100 }
                const p1 = { x: 150, y: 100 }
                const p2 = { x: 80, y: 120 }
                const m = mirrorPoint(p0, p2)
                scene.mouseDownAt(p0)
                scene.mouseUp()

                scene.mouseDownAt(p1)
                scene.mouseUp()

                scene.mouseDownAt(p0)
                scene.mouseTo(p2)
                scene.mouseUp()

                expect(scene.penTool.state).to.equal(State.READY)
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p1)).to.be.true
                expect(scene.hasHandleAt(p0, m)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 1])

                expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} L ${p(p1)} C ${p(p1)} ${p(m)} ${p(p0)}`)
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.penTool.figure!.toInternalString()).to.equal(`AE ${p(m)} ${p(p0)} E ${p(p1)} Z`)
                expect(scene.penTool.figure!.toPathString()).to.equal(`M ${p(p0)} L ${p(p1)} C ${p(p1)} ${p(m)} ${p(p0)} Z`)
                expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready.svg")
            })

            // curve -> point -> clouse curve
            // LOG  : PenTool.mouseEvent(): state=READY, type=mousedown
            // LOG  : PenTool.mouseEvent(): state=DOWN_POINT, type=mousemove
            // LOG  : PenTool.mouseEvent(): state=DOWN_CURVE, type=mouseup
            // LOG  : PenTool.mouseEvent(): state=UP_CURVE, type=mousedown
            // LOG  : PenTool.mouseEvent(): state=DOWN_CURVE_POINT, type=mouseup
            // LOG  : PenTool.mouseEvent(): state=UP_POINT, type=mousedown
            // LOG  : PenTool.mouseEvent(): state=DOWN_POINT_CLOSE, type=mousemove
            // LOG  : PenTool.mouseEvent(): state=DOWN_POINT_CLOSE_CURVE, type=mouseup

            // curve -> point -> curve
            it("*_POINT --up--> UP_POINT --close--> DOWN_POINT_CLOSE --move--> DOWN_POINT_CLOSE_CURVE --up--> READY", function () {
                const scene = new FigureEditorScene()
                scene.selectPenTool()

                const p0 = { x: 100, y: 100 }
                const p1 = { x: 150, y: 100 }
                const p2 = { x: 60, y: 110 }
                const p3 = { x: 80, y: 120 }
                const m = mirrorPoint(p0, p3)

                scene.mouseDownAt(p0) // curve
                scene.mouseTo(p1)
                scene.mouseUp()

                scene.mouseDownAt(p2) // point
                scene.mouseUp()

                scene.mouseDownAt(p0) // curve
                scene.mouseTo(p2)
                scene.mouseUp()

                // the above code ran into an exception before
                // now the expectation must match the one in affinity designer/illustrator
                // which is: the last line creates an SMOOTH/SYMMETRIC angle
                expect(scene.penTool.state).to.equal(State.READY)
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p1)).to.be.true
                expect(scene.hasHandleAt(p0, m)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 1])

                expect(scene.penTool.path!.toString()).to.equal(`M ${p(p0)} L ${p(p1)} C ${p(p1)} ${p(m)} ${p(p0)}`)
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.penTool.figure!.toInternalString()).to.equal(`E ${p(p0)} E ${p(p1)}`)
                expect(scene.penTool.figure!.toPathString()).to.equal(`M ${p(p0)} L ${p(p1)}`)
                expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready.svg")
            })
        })
        describe("point -> close -> point", function () {
        })
    })
})

function p(point: Point) {
    return `${point.x} ${point.y}`
}

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