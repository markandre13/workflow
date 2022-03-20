import { expect } from '@esm-bundle/chai'

import { FigureEditorScene } from "../FigureEditorScene"
import { Tool } from "client/figuretools/Tool"
import { Path } from "client/figures/Path"

import { initializeCORBAValueTypes } from "client/workflow"
import { Point, pointMinusPoint, pointPlusPoint, mirrorPoint } from 'shared/geometry'

it("\x07") // beep

describe("EditTool", function () {
    this.beforeAll(async function () {
        initializeCORBAValueTypes()
        await loadScript("polyfill/path-data-polyfill.js")
    })

    describe("Path", function() {

        it("ready to edit", function () {
            const scene = new FigureEditorScene()

            scene.selectEditTool()

            expect(scene.figureeditor.svgView.style.cursor).to.contain("edit.svg")
        })

        it("select a path", function() {
            const scene = new FigureEditorScene()
            const path = new Path()
            const p0 = {x: 10, y: 50}
            const p1 = {x: 90, y: 50}
            path.addEdge(p0)
            path.addEdge(p1)
            scene.addFigure(path)
            scene.selectEditTool()

            scene.pointerClickAt({x: 50, y: 50})

            expect(Tool.selection.has(path)).to.be.true
            expect(scene.figureeditor.svgView.style.cursor).to.contain("edit.svg")
        })

        it("move anchor edge", function() {
            const scene = new FigureEditorScene()
            const path = new Path()
            const p0 = {x: 10, y: 50}
            const p1 = {x: 90, y: 50}
            const p2 = {x: 20, y: 30}

            path.addEdge(p0)
            path.addEdge(p1)
            scene.addFigure(path)
            scene.selectEditTool()

            scene.pointerClickAt({x: 50, y: 50})
            expect(Tool.selection.has(path)).to.be.true

            const e = scene.figureeditor.shadowRoot!.elementFromPoint(p0.x, p0.y)! as SVGElement
            expect(e.style.cursor).to.contain("edit-anchor.svg")

            // TODO: test outline
            e.dispatchEvent(new PointerEvent("pointerenter"))
            scene.pointerDownAt(p0)
            scene.pointerTo(p2)
            scene.pointerUp()
            e.dispatchEvent(new PointerEvent("pointerleave"))

            expect(path.toInternalString()).to.equal("E 20 30 E 90 50")
           
            expect(scene.figureeditor.svgView.style.cursor).to.contain("edit.svg")
        })

        it("move anchor symmetric", function() {
            const scene = new FigureEditorScene()

            const p0 = {x: 10, y: 50}
            let p1 = {x: 40, y: 20}
            let p2 = {x: 50, y: 50}
            let p3 = {x: 70, y: 60}
            const p4 = {x: 90, y: 50}
            const p5 = {x: 55, y: 65}

            const path = new Path()
            path.addEdge(p0)
            path.addSymmetric(p1, p2)
            path.addEdge(p4)
            scene.addFigure(path)
            expect(path.toInternalString()).to.equal(`E ${p(p0)} S ${p(p1)} ${p(p2)} E ${p(p4)}`)

            scene.selectEditTool()
            scene.pointerClickAt(p0)
            expect(Tool.selection.has(path)).to.be.true

            const e = scene.figureeditor.shadowRoot!.elementFromPoint(p2.x, p2.y)! as SVGElement
            expect(e.style.cursor).to.contain("edit-anchor.svg")

            e.dispatchEvent(new PointerEvent("pointerenter"))
            scene.pointerDownAt(p2)
            scene.pointerTo(p5)
            scene.pointerUp()
            e.dispatchEvent(new PointerEvent("pointerleave"))

            const delta = pointMinusPoint(p5, p2)
            p1 = pointPlusPoint(p1, delta)
            p2 = pointPlusPoint(p2, delta)
            p3 = pointPlusPoint(p3, delta)

            expect(path.toInternalString()).to.equal(`E ${p(p0)} S ${p(p1)} ${p(p2)} E ${p(p4)}`)
        })

        it("move anchor edge angle", function() {
            const scene = new FigureEditorScene()

            const p0 = {x: 10, y: 50}
            let p1 = {x: 40, y: 20}
            let p2 = {x: 50, y: 50}
            let p3 = {x: 70, y: 60}
            const p4 = {x: 90, y: 50}
            const p5 = {x: 55, y: 65}

            const path = new Path()
            path.addEdge(p0)
            path.addEdgeAngle(p2, p3)
            path.addEdge(p4)
            scene.addFigure(path)
            expect(path.toInternalString()).to.equal(`E ${p(p0)} EA ${p(p2)} ${p(p3)} E ${p(p4)}`)

            scene.selectEditTool()
            scene.pointerClickAt(p0)
            expect(Tool.selection.has(path)).to.be.true

            const e = scene.figureeditor.shadowRoot!.elementFromPoint(p2.x, p2.y)! as SVGElement
            expect(e.style.cursor).to.contain("edit-anchor.svg")

            e.dispatchEvent(new PointerEvent("pointerenter"))
            scene.pointerDownAt(p2)
            scene.pointerTo(p5)
            scene.pointerUp()
            e.dispatchEvent(new PointerEvent("pointerleave"))

            const delta = pointMinusPoint(p5, p2)
            p1 = pointPlusPoint(p1, delta)
            p2 = pointPlusPoint(p2, delta)
            p3 = pointPlusPoint(p3, delta)

            expect(path.toInternalString()).to.equal(`E ${p(p0)} EA ${p(p2)} ${p(p3)} E ${p(p4)}`)
        })

        it("move anchor angle edge", function() {
            const scene = new FigureEditorScene()

            const p0 = {x: 10, y: 50}
            let p1 = {x: 40, y: 20}
            let p2 = {x: 50, y: 50}
            let p3 = {x: 70, y: 60}
            const p4 = {x: 90, y: 50}
            const p5 = {x: 55, y: 65}

            const path = new Path()
            path.addEdge(p0)
            path.addAngleEdge(p1, p2)
            path.addEdge(p4)
            scene.addFigure(path)
            expect(path.toInternalString()).to.equal(`E ${p(p0)} AE ${p(p1)} ${p(p2)} E ${p(p4)}`)

            scene.selectEditTool()
            scene.pointerClickAt(p0)
            expect(Tool.selection.has(path)).to.be.true

            const e = scene.figureeditor.shadowRoot!.elementFromPoint(p2.x, p2.y)! as SVGElement
            expect(e.style.cursor).to.contain("edit-anchor.svg")

            e.dispatchEvent(new PointerEvent("pointerenter"))
            scene.pointerDownAt(p2)
            scene.pointerTo(p5)
            scene.pointerUp()
            e.dispatchEvent(new PointerEvent("pointerleave"))

            const delta = pointMinusPoint(p5, p2)
            p1 = pointPlusPoint(p1, delta)
            p2 = pointPlusPoint(p2, delta)
            p3 = pointPlusPoint(p3, delta)

            expect(path.toInternalString()).to.equal(`E ${p(p0)} AE ${p(p1)} ${p(p2)} E ${p(p4)}`)
        })

        it("move anchor angle angle", function() {
            const scene = new FigureEditorScene()

            const p0 = {x: 10, y: 50}
            let p1 = {x: 40, y: 20}
            let p2 = {x: 50, y: 50}
            let p3 = {x: 70, y: 60}
            const p4 = {x: 90, y: 50}
            const p5 = {x: 55, y: 65}

            const path = new Path()
            path.addEdge(p0)
            path.addAngleAngle(p1, p2, p3)
            path.addEdge(p4)
            scene.addFigure(path)
            expect(path.toInternalString()).to.equal(`E ${p(p0)} AA ${p(p1)} ${p(p2)} ${p(p3)} E ${p(p4)}`)

            scene.selectEditTool()
            scene.pointerClickAt(p0)
            expect(Tool.selection.has(path)).to.be.true

            const e = scene.figureeditor.shadowRoot!.elementFromPoint(p2.x, p2.y)! as SVGElement
            expect(e.style.cursor).to.contain("edit-anchor.svg")

            e.dispatchEvent(new PointerEvent("pointerenter"))
            scene.pointerDownAt(p2)
            scene.pointerTo(p5)
            scene.pointerUp()
            e.dispatchEvent(new PointerEvent("pointerleave"))

            const delta = pointMinusPoint(p5, p2)
            p1 = pointPlusPoint(p1, delta)
            p2 = pointPlusPoint(p2, delta)
            p3 = pointPlusPoint(p3, delta)

            expect(path.toInternalString()).to.equal(`E ${p(p0)} AA ${p(p1)} ${p(p2)} ${p(p3)} E ${p(p4)}`)
        })

        it("move anchor smooth angle angle", function() {
            const scene = new FigureEditorScene()

            const p0 = {x: 10, y: 50}
            let p1 = {x: 40, y: 20}
            let p2 = {x: 50, y: 50}
            let p3 = {x: 70, y: 60}
            const p4 = {x: 90, y: 50}
            const p5 = {x: 55, y: 65}

            const path = new Path()
            path.addEdge(p0)
            path.addSmoothAngleAngle(p1, p2, p3)
            path.addEdge(p4)
            scene.addFigure(path)
            expect(path.toInternalString()).to.equal(`E ${p(p0)} SAA ${p(p1)} ${p(p2)} ${p(p3)} E ${p(p4)}`)

            scene.selectEditTool()
            scene.pointerClickAt(p0)
            expect(Tool.selection.has(path)).to.be.true

            const e = scene.figureeditor.shadowRoot!.elementFromPoint(p2.x, p2.y)! as SVGElement
            expect(e.style.cursor).to.contain("edit-anchor.svg")

            e.dispatchEvent(new PointerEvent("pointerenter"))
            scene.pointerDownAt(p2)
            scene.pointerTo(p5)
            scene.pointerUp()
            e.dispatchEvent(new PointerEvent("pointerleave"))

            const delta = pointMinusPoint(p5, p2)
            p1 = pointPlusPoint(p1, delta)
            p2 = pointPlusPoint(p2, delta)
            p3 = pointPlusPoint(p3, delta)

            expect(path.toInternalString()).to.equal(`E ${p(p0)} SAA ${p(p1)} ${p(p2)} ${p(p3)} E ${p(p4)}`)
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
