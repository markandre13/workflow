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
    describe("draw curves one segment at a time (v5)", function () {

        //
        // getting started
        //

        it("READY", function () {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            expect(scene.penTool.state).to.equal(State.READY)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready.svg")
        })

        it("sequence of curves", function () {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 120, y: 70 }
            const p2 = { x: 130, y: 60 }
            const p3 = { x: 200, y: 110 }
            const p4 = { x: 220, y: 50 }
            const p5 = { x: 230, y: 40 }
           
            expect(scene.penTool.state).to.equal(State.READY)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready.svg")

            scene.mouseDownAt(p0)
            expect(scene.penTool.state).to.equal(State.DOWN_ADD_FIRST_ANCHOR)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            expect(scene.penTool._outline!.toInternalString()).to.equal(`E ${p(p0)}`)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([1, 0])

            scene.mouseTo(p1)
            expect(scene.penTool.state).to.equal(State.DOWN_DRAG_FIRST_ANCHOR)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            expect(scene.penTool._outline!.toInternalString()).to.equal(`E ${p(p0)}`)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasHandleAt(p0, p1)).to.be.true
            expect(scene.hasHandleAt(p0, mirrorPoint(p0, p1))).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([1, 2])

            scene.mouseTo(p2)
            expect(scene.penTool.state).to.equal(State.DOWN_DRAG_FIRST_ANCHOR)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            expect(scene.penTool._outline!.toInternalString()).to.equal(`E ${p(p0)}`)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasHandleAt(p0, p2)).to.be.true
            expect(scene.hasHandleAt(p0, mirrorPoint(p0, p2))).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([1, 2])

            scene.mouseUp()
            expect(scene.penTool.state).to.equal(State.ACTIVE)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
            expect(scene.penTool._outline!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p2)}`)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasHandleAt(p0, p2)).to.be.true
            expect(scene.hasHandleAt(p0, mirrorPoint(p0, p2))).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([1, 2])

            scene.mouseDownAt(p3)
            expect(scene.penTool.state).to.equal(State.DOWN_ADD_ANCHOR)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            expect(scene.penTool._outline!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p2)} E ${p(p3)}`)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p3)).to.be.true
            expect(scene.hasHandleAt(p0, p2)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 1])

            scene.mouseTo(p4)
            const m4 = mirrorPoint(p3, p4)
            expect(scene.penTool.state).to.equal(State.DOWN_DRAG_ANCHOR)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            expect(scene.penTool._outline!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p2)} S ${p(m4)} ${p(p3)}`)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p3)).to.be.true
            expect(scene.hasHandleAt(p0, p2)).to.be.true
            expect(scene.hasHandleAt(p3, p4)).to.be.true
            expect(scene.hasHandleAt(p3, m4)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 3])

            scene.mouseTo(p5)
            const m5 = mirrorPoint(p3, p5)
            expect(scene.penTool.state).to.equal(State.DOWN_DRAG_ANCHOR)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            expect(scene.penTool._outline!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p2)} S ${p(m5)} ${p(p3)}`)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p3)).to.be.true
            expect(scene.hasHandleAt(p0, p2)).to.be.true
            expect(scene.hasHandleAt(p3, p5)).to.be.true
            expect(scene.hasHandleAt(p3, m5)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 3])

            scene.mouseUp()
            expect(scene.penTool.state).to.equal(State.ACTIVE)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-active.svg")
            expect(scene.penTool._outline!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p2)} S ${p(m5)} ${p(p3)}`)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p3)).to.be.true
            expect(scene.hasHandleAt(p0, p2)).to.be.true
            expect(scene.hasHandleAt(p3, p5)).to.be.true
            expect(scene.hasHandleAt(p3, m5)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 3])
        })

        it("drag close on edge", function() {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 120, y: 70 }
            const p2 = { x: 80, y: 60 }
            const p3 = { x: 50, y: 40 }
           
            scene.mouseDownAt(p0)
            scene.mouseUp()

            scene.mouseDownAt(p1)
            scene.mouseUp()

            scene.mouseDownAt(p0)           
            expect(scene.penTool.state).to.equal(State.DOWN_CLOSE_EDGE)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            expect(scene.penTool._outline!.toInternalString()).to.equal(`E ${p(p0)} E ${p(p1)} Z`)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p1)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 0])

            scene.mouseTo(p2)
            expect(scene.penTool.state).to.equal(State.DRAG_CLOSE_EDGE)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            const m2 = mirrorPoint(p0, p2)
            expect(scene.penTool._outline!.toInternalString()).to.equal(`AE ${p(m2)} ${p(p0)} E ${p(p1)} Z`)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p1)).to.be.true
            expect(scene.hasHandleAt(p0, m2)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 1])

            scene.mouseTo(p3)
            expect(scene.penTool.state).to.equal(State.DRAG_CLOSE_EDGE)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            const m3 = mirrorPoint(p0, p3)
            expect(scene.penTool._outline!.toInternalString()).to.equal(`AE ${p(m3)} ${p(p0)} E ${p(p1)} Z`)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p1)).to.be.true
            expect(scene.hasHandleAt(p0, m3)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 1])

            scene.mouseUp()
            expect(scene.penTool.state).to.equal(State.READY)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready.svg")
            expect(scene.penTool._outline!.toInternalString()).to.equal(`AE ${p(m3)} ${p(p0)} E ${p(p1)} Z`)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p1)).to.be.true
            expect(scene.hasHandleAt(p0, m3)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([2, 1])

            expect(scene.penTool.figure?.toInternalString()).to.equal(`AE ${p(m3)} ${p(p0)} E ${p(p1)} Z`)
        })
        it("drag close on curve", function() {
            const scene = new FigureEditorScene()
            scene.selectPenTool()

            const p0 = { x: 100, y: 100 }
            const p1 = { x: 110, y: 90 }
            const p2 = { x: 150, y: 10 }
            const p3 = { x: 200, y: 120 }
            const p4 = { x: 80, y: 60 }
            const p5 = { x: 50, y: 40 }
           
            scene.mouseDownAt(p0)
            scene.mouseTo(p1)
            scene.mouseUp()

            scene.mouseDownAt(p2)
            scene.mouseUp()

            scene.mouseDownAt(p3)
            scene.mouseUp()

            scene.mouseDownAt(p0)           
            expect(scene.penTool.state).to.equal(State.DOWN_CLOSE_CURVE)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            expect(scene.penTool._outline!.toInternalString()).to.equal(`EA ${p(p0)} ${p(p1)} E ${p(p2)} E ${p(p3)} Z`)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p2)).to.be.true
            expect(scene.hasAnchorAt(p3)).to.be.true
            expect(scene.hasHandleAt(p0, p1)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([3, 1])

            scene.mouseTo(p4)
            expect(scene.penTool.state).to.equal(State.DRAG_CLOSE_CURVE)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            const m4 = mirrorPoint(p0, p4)
            let m1 = new Point(93.67544467966324, 87.35088935932649)
            expect(scene.penTool._outline!.toInternalString()).to.equal(`SM ${p(m4)} ${p(p0)} ${p(m1)} E ${p(p2)} E ${p(p3)} Z`)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p2)).to.be.true
            expect(scene.hasAnchorAt(p3)).to.be.true
            expect(scene.hasHandleAt(p0, m4)).to.be.true
            expect(scene.hasHandleAt(p0, m1)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])

            scene.mouseTo(p5)
            expect(scene.penTool.state).to.equal(State.DRAG_CLOSE_CURVE)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("direct-selection-cursor.svg")
            const m5 = mirrorPoint(p0, p5)
            m1 = new Point(90.94642539574815, 89.13571047489778)
            expect(scene.penTool._outline!.toInternalString()).to.equal(`SM ${p(m5)} ${p(p0)} ${p(m1)} E ${p(p2)} E ${p(p3)} Z`)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p2)).to.be.true
            expect(scene.hasAnchorAt(p3)).to.be.true
            expect(scene.hasHandleAt(p0, m5)).to.be.true
            expect(scene.hasHandleAt(p0, m1)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])

            scene.mouseUp()
            expect(scene.penTool.state).to.equal(State.READY)
            expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready.svg")
            expect(scene.penTool._outline!.toInternalString()).to.equal(`SM ${p(m5)} ${p(p0)} ${p(m1)} E ${p(p2)} E ${p(p3)} Z`)
            expect(scene.hasAnchorAt(p0)).to.be.true
            expect(scene.hasAnchorAt(p2)).to.be.true
            expect(scene.hasAnchorAt(p3)).to.be.true
            expect(scene.hasHandleAt(p0, m5)).to.be.true
            expect(scene.hasHandleAt(p0, m1)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])
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