import { expect } from '@esm-bundle/chai'

import { FigureEditorScene } from "../FigureEditorScene"
import { State } from "client/figuretools/PenTool"

import { initializeCORBAValueTypes } from "client/workflow"
import { Point, mirrorPoint } from 'shared/geometry'

// it("\x07") // beep

describe("EditTool", function () {
    this.beforeAll(async function () {
        initializeCORBAValueTypes()
        await loadScript("polyfill/path-data-polyfill.js")
    })

    it("ready to start a new path", function () {
        const scene = new FigureEditorScene()
        scene.selectEditTool()

        expect(scene.penTool.state).to.equal(State.READY)
        expect(scene.figureeditor.svgView.style.cursor).to.contain("pen-ready.svg")
    })

    xit("select a path", function() {

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
