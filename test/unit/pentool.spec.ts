import { expect, use } from '@esm-bundle/chai'
// import { chaiAlmost from "chai-almost"
// use(chaiAlmost())

import { FigureEditorScene } from "./FigureEditorScene"

import { initializeCORBAValueTypes } from "client/workflow"
import { Point } from 'shared/geometry'
import { Path } from 'client/figures/Path'

function mirrorPoint(center: Point, point: Point) {
    return new Point(
        center.x - (point.x - center.x),
        center.y - (point.y - center.y)
    )
}

describe("PenTool", function() {
    this.beforeAll(async function() {
        initializeCORBAValueTypes()
        await loadScript("polyfill/path-data-polyfill.js")
    })
/*
    it("draw sequence of curves", function() {
        const scene = new FigureEditorScene(false)

        scene.selectPenTool()
        expect(/pen-ready.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null
        expect(scene.penTool.path).to.be.undefined

        const downAt = {x: 100, y: 100}
        scene.mouseDownAt(downAt)
        expect(scene.hasAnchorAt(downAt)).to.be.true
        expect(scene.getAnchorCount()).to.equal(1)
        expect(scene.getHandleCount()).to.equal(0)
        expect(/direct-selection-cursor.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null
        expect(scene.penTool.path).not.to.be.undefined
        const data = scene.penTool.path!.path.data
        expect(data).to.deep.equal([
            {type: 'M', values: [100, 100]},
            {type: 'L', values: [100, 100]},
        ])

        const moveTo0 = {x: 110, y: 80}
        scene.moveMouseTo(moveTo0)
        expect(scene.hasAnchorAt(downAt)).to.be.true
        expect(scene.hasHandleAt(moveTo0)).to.be.true
        expect(scene.hasHandleAt(mirrorPoint(downAt, moveTo0))).to.be.true
        expect(scene.getAnchorCount()).to.equal(1)
        expect(scene.getHandleCount()).to.equal(2)
        expect(/direct-selection-cursor.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null
        expect(data).to.deep.equal([
            {type: 'M', values: [100, 100]},
            {type: 'L', values: [100, 100]},
        ])

        const moveTo1 = {x: 120, y: 140}
        scene.moveMouseTo(moveTo1)
        expect(scene.hasAnchorAt(downAt)).to.be.true
        expect(scene.hasHandleAt(moveTo1)).to.be.true
        expect(scene.hasHandleAt({x: downAt.x - (moveTo1.x - downAt.x), y: downAt.y - (moveTo1.y - downAt.y)})).to.be.true
        expect(scene.getAnchorCount()).to.equal(1)
        expect(scene.getHandleCount()).to.equal(2)
        expect(/direct-selection-cursor.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null
        expect(data).to.deep.equal([
            {type: 'M', values: [100, 100]},
            {type: 'L', values: [100, 100]},
        ])

        scene.mouseUp()
        expect(scene.hasAnchorAt(downAt)).to.be.true
        expect(scene.hasHandleAt(moveTo1)).to.be.true
        expect(scene.hasHandleAt({x: downAt.x - (moveTo1.x - downAt.x), y: downAt.y - (moveTo1.y - downAt.y)})).to.be.true
        expect(scene.getAnchorCount()).to.equal(1)
        expect(scene.getHandleCount()).to.equal(2)
        expect(/pen-active.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null
        expect(data).to.deep.equal([
            {type: 'M', values: [100, 100]},
            {type: 'C', values: [120, 140, 120, 140, 120, 140]},
        ])

        const moveTo2 = {x: 220, y: 100}
        scene.moveMouseTo(moveTo2)
        expect(scene.hasAnchorAt(downAt)).to.be.true
        expect(scene.hasHandleAt(moveTo1)).to.be.true
        expect(scene.hasHandleAt({x: downAt.x - (moveTo1.x - downAt.x), y: downAt.y - (moveTo1.y - downAt.y)})).to.be.true
        expect(scene.getAnchorCount()).to.equal(1)
        expect(scene.getHandleCount()).to.equal(2)
        expect(/pen-active.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null
        expect(data).to.deep.equal([
            {type: 'M', values: [100, 100]},
            {type: 'C', values: [120, 140, 120, 140, 120, 140]},
        ])

        scene.mouseDownAt(moveTo2)
        expect(scene.hasAnchorAt(downAt)).to.be.true
        expect(scene.hasAnchorAt(moveTo2)).to.be.true
        expect(scene.hasHandleAt(moveTo1)).to.be.true
        expect(scene.getAnchorCount()).to.equal(2)
        expect(scene.getHandleCount()).to.equal(1)
        expect(/direct-selection-cursor.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null
        expect(data).to.deep.equal([
            {type: 'M', values: [100, 100]},
            {type: 'C', values: [120, 140, 220, 100, 220, 100]},
        ])

        const moveTo3 = {x: 230, y: 70}
        scene.moveMouseTo(moveTo3)
        expect(scene.hasAnchorAt(downAt)).to.be.true
        expect(scene.hasAnchorAt(moveTo2)).to.be.true
        expect(scene.hasHandleAt(moveTo1)).to.be.true
        expect(scene.hasHandleAt(moveTo3)).to.be.true
        expect(scene.hasHandleAt(mirrorPoint(moveTo2, moveTo3))).to.be.true
        expect(scene.getAnchorCount()).to.equal(2)
        expect(scene.getHandleCount()).to.equal(3)
        expect(/direct-selection-cursor.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null
        expect(data).to.deep.equal([
            {type: 'M', values: [100, 100]},
            {type: 'C', values: [120, 140, 210, 130, 220, 100]},
        ])

        scene.mouseUp()
        expect(scene.hasAnchorAt(downAt)).to.be.true
        expect(scene.hasAnchorAt(moveTo2)).to.be.true
        expect(scene.hasHandleAt(moveTo1)).to.be.true
        expect(scene.hasHandleAt(moveTo3)).to.be.true
        expect(scene.hasHandleAt(mirrorPoint(moveTo2, moveTo3))).to.be.true
        expect(scene.getAnchorCount()).to.equal(2)
        expect(scene.getHandleCount()).to.equal(3)
        expect(/pen-active.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null
        expect(data).to.deep.equal([
            {type: 'M', values: [100, 100]},
            {type: 'C', values: [120, 140, 210, 130, 220, 100]},
        ])

        const moveTo4 = {x: 300, y: 100}
        scene.moveMouseTo(moveTo4)
        expect(scene.hasAnchorAt(downAt)).to.be.true
        expect(scene.hasAnchorAt(moveTo2)).to.be.true
        expect(scene.hasHandleAt(moveTo1)).to.be.true
        expect(scene.hasHandleAt(moveTo3)).to.be.true
        expect(scene.hasHandleAt(mirrorPoint(moveTo2, moveTo3))).to.be.true
        expect(scene.getAnchorCount()).to.equal(2)
        expect(scene.getHandleCount()).to.equal(3)
        expect(/pen-active.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null
        expect(data).to.deep.equal([
            {type: 'M', values: [100, 100]},
            {type: 'C', values: [120, 140, 210, 130, 220, 100]},
        ])

        scene.mouseDownAt(moveTo4)
        expect(scene.hasAnchorAt(downAt)).to.be.true
        expect(scene.hasAnchorAt(moveTo2)).to.be.true
        expect(scene.hasAnchorAt(moveTo4)).to.be.true
        expect(scene.hasHandleAt(moveTo3)).to.be.true
        expect(scene.getAnchorCount()).to.equal(3)
        expect(scene.getHandleCount()).to.equal(1)
        expect(/direct-selection-cursor.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null
        expect(data).to.deep.equal([
            {type: 'M', values: [100, 100]},
            {type: 'C', values: [120, 140, 210, 130, 220, 100]},
            {type: 'C', values: [230, 70, 300, 100, 300, 100]},
        ])

        const moveTo5 = {x: 350, y: 170}
        scene.moveMouseTo(moveTo5)
        expect(scene.hasAnchorAt(downAt)).to.be.true
        expect(scene.hasAnchorAt(moveTo2)).to.be.true
        expect(scene.hasAnchorAt(moveTo4)).to.be.true
        expect(scene.hasHandleAt(moveTo3)).to.be.true
        expect(scene.hasHandleAt(moveTo5)).to.be.true
        expect(scene.hasHandleAt(mirrorPoint(moveTo4, moveTo5))).to.be.true
        expect(scene.getAnchorHandleCount()).to.equal([3,3])
        expect(/direct-selection-cursor.svg/.exec(scene.figureeditor.svgView.style.cursor)).to.be.not.null
        expect(data).to.deep.equal([
            {type: 'M', values: [100, 100]},
            {type: 'C', values: [120, 140, 210, 130, 220, 100]},
            {type: 'C', values: [230, 70, 250, 30, 300, 100]},
        ])

        scene.mouseUp()
    })
*/
    describe("the moment we have enough data for the final curve/line and the mouse is released we add it to the figure", function() {
        it.only("draw initial line", function() {
            const scene = new FigureEditorScene(false)
            scene.selectPenTool()

            const p0 = {x: 100, y: 100}
            const p1 = {x: 110, y: 80}
            scene.mouseDownAt(p0)
            let check = () => {
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([1, 0])
                const data = scene.penTool.path!.path.data
                expect(data).to.deep.equal([
                    {type: 'M', values: [p0.x, p0.y]},
                ])
            }
            check()

            scene.mouseUp()
            check()
            scene.moveMouseTo(p1)
            check()
            scene.mouseDownAt(p1)
            check = () => {
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p1)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 0])
                const data = scene.penTool.path!.path.data
                expect(data).to.deep.equal([
                    {type: 'M', values: [p0.x, p0.y]},
                    {type: 'L', values: [p1.x, p1.y]},
                ])
            }
            check()
            scene.mouseUp()
            check()
            expect(scene.model.layers[0].data.length).equals(1)
            expect(scene.model.layers[0].data[0]).instanceOf(Path)
            const path = scene.model.layers[0].data[0] as Path
            expect(path.toString()).to.equal('figure.Path("M 100 100 L 110 80")')
        })
    })

    xit("draw line after", function() {
        const scene = new FigureEditorScene(false)
        scene.selectPenTool()

        const p0 = {x: 100, y: 100}
        const p1 = {x: 110, y: 80}
        scene.mouseDownAt(p0)
        scene.mouseUp()
        scene.moveMouseTo(p1)
        scene.mouseDownAt(p1)
        scene.mouseUp()

        const p2 = {x: 240, y: 150}
        // scene.mouseDownAt(p3)

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