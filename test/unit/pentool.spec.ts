import { expect, use } from '@esm-bundle/chai'
// import { chaiAlmost from "chai-almost"
// use(chaiAlmost())
import * as ts from "@testing-library/dom"

import { FigureEditorScene } from "./FigureEditorScene"

import { registerHTMLCustomElements, initializeCORBAValueTypes } from "client/workflow"
import { Point, Rectangle } from 'shared/geometry'

// import { PenTool } from "client/figuretools/PenTool"

describe("PenTool", function() {
    this.beforeAll(async function() {
        registerHTMLCustomElements();
        initializeCORBAValueTypes()

        await loadScript("polyfill/path-data-polyfill.js")
    })

    it.only("draw 1st handle", function() {
        const scene = new FigureEditorScene(true)

        scene.selectPenTool()
        expect(/pen-ready.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null

        const downAt = {x: 100, y: 100}
        scene.mouseDownAt(downAt)
        expect(scene.hasAnchorAt(downAt)).to.be.true
        expect(scene.getAnchorCount()).to.equal(1)
        expect(scene.getHandleCount()).to.equal(0)
        expect(/direct-selection-cursor.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null

        const moveTo0 = {x: 110, y: 80}
        scene.moveMouseTo(moveTo0)
        expect(scene.hasAnchorAt(downAt)).to.be.true
        expect(scene.hasHandleAt(moveTo0)).to.be.true
        expect(scene.hasHandleAt({x: downAt.x - (moveTo0.x - downAt.x), y: downAt.y - (moveTo0.y - downAt.y)})).to.be.true
        expect(scene.getAnchorCount()).to.equal(1)
        expect(scene.getHandleCount()).to.equal(2)
        expect(/direct-selection-cursor.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null

        const moveTo1 = {x: 120, y: 140}
        scene.moveMouseTo(moveTo1)
        expect(scene.hasAnchorAt(downAt)).to.be.true
        expect(scene.hasHandleAt(moveTo1)).to.be.true
        expect(scene.hasHandleAt({x: downAt.x - (moveTo1.x - downAt.x), y: downAt.y - (moveTo1.y - downAt.y)})).to.be.true
        expect(scene.getAnchorCount()).to.equal(1)
        expect(scene.getHandleCount()).to.equal(2)
        expect(/direct-selection-cursor.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null

        scene.mouseUp()
        expect(scene.hasAnchorAt(downAt)).to.be.true
        expect(scene.hasHandleAt(moveTo1)).to.be.true
        expect(scene.hasHandleAt({x: downAt.x - (moveTo1.x - downAt.x), y: downAt.y - (moveTo1.y - downAt.y)})).to.be.true
        expect(scene.getAnchorCount()).to.equal(1)
        expect(scene.getHandleCount()).to.equal(2)
        expect(/pen-active.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null

        const moveTo2 = {x: 220, y: 240}
        scene.moveMouseTo(moveTo2)
        expect(scene.hasAnchorAt(downAt)).to.be.true
        expect(scene.hasHandleAt(moveTo1)).to.be.true
        expect(scene.hasHandleAt({x: downAt.x - (moveTo1.x - downAt.x), y: downAt.y - (moveTo1.y - downAt.y)})).to.be.true
        expect(scene.getAnchorCount()).to.equal(1)
        expect(scene.getHandleCount()).to.equal(2)
        expect(/pen-active.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null

        scene.mouseDownAt(moveTo2)
        expect(scene.hasAnchorAt(downAt)).to.be.true
        expect(scene.hasHandleAt(moveTo1)).to.be.true
        expect(scene.hasAnchorAt(moveTo2)).to.be.true
        expect(scene.getAnchorCount()).to.equal(2)
        expect(scene.getHandleCount()).to.equal(1)
        expect(/direct-selection-cursor.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null
        // ALSO: Expect path
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