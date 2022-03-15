import { expect } from '@esm-bundle/chai'

import { FigureEditorScene } from "../FigureEditorScene"
import { Tool } from "client/figuretools/Tool"
import { Path } from "client/figures/Path"

import { initializeCORBAValueTypes } from "client/workflow"
import { Point, mirrorPoint } from 'shared/geometry'

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

        it("cursor for anchor")
        it("cursor for handle")

        it("move an edge anchor", function() {
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

            const e = scene.figureeditor.shadowRoot!.elementFromPoint(p0.x, p0.y)! as SVGElement
            expect(e.style.cursor).to.contain("edit-anchor.svg")

            // TODO: test outline
            e.dispatchEvent(new PointerEvent("pointerenter"))
            scene.pointerDownAt(p0)
            scene.pointerTo(p2)
            scene.pointerUp()
            e.dispatchEvent(new PointerEvent("pointerleave"))

            expect(path.toInternalString()).to.equal("E 20 30 E 90 50")

            expect(Tool.selection.has(path)).to.be.true
            expect(scene.figureeditor.svgView.style.cursor).to.contain("edit.svg")
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
