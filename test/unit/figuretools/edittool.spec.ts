import { expect } from '@esm-bundle/chai'

import { FigureEditorScene } from "../FigureEditorScene"
import { Tool } from "client/figuretools/Tool"
import { Path } from "client/figures/Path"

import { initializeCORBAValueTypes } from "client/workflow"
import { Point, pointMinusPoint, pointPlusPoint, pointMultiplyNumber, mirrorPoint } from 'shared/geometry'

it("\x07") // beep

describe("EditTool", function () {
    this.beforeAll(async function () {
        initializeCORBAValueTypes()
        await loadScript("polyfill/path-data-polyfill.js")
    })

    describe("Path", function () {

        it("ready to edit", function () {
            const scene = new FigureEditorScene()

            scene.selectEditTool()

            expect(scene.figureeditor.svgView.style.cursor).to.contain("edit.svg")
        })

        it("select path", function () {
            const scene = new FigureEditorScene()
            const path = new Path()
            const p0 = { x: 10, y: 50 }
            const p1 = { x: 90, y: 50 }
            path.addEdge(p0)
            path.addEdge(p1)
            scene.addFigure(path)
            scene.selectEditTool()

            scene.pointerClickAt({ x: 50, y: 50 })

            expect(Tool.selection.has(path)).to.be.true
            expect(scene.figureeditor.svgView.style.cursor).to.contain("edit.svg")
        })

        describe("anchor EDGE", function () {
            it("move anchor", function () {
                const scene = new FigureEditorScene()
                const path = new Path()
                const p0 = { x: 10, y: 50 }
                const p1 = { x: 90, y: 50 }
                const p2 = { x: 20, y: 30 }

                path.addEdge(p0)
                path.addEdge(p1)
                scene.addFigure(path)
                scene.selectEditTool()

                scene.pointerClickAt({ x: 50, y: 50 })
                expect(Tool.selection.has(path)).to.be.true
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p1)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 0])

                const e = scene.figureeditor.shadowRoot!.elementFromPoint(p0.x, p0.y)! as SVGElement
                expect(e.style.cursor).to.contain("edit-anchor.svg")

                // TODO: test outline
                scene.pointerDownAt(p0)
                scene.pointerTo(p2)
                scene.pointerUp()

                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p1)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([2, 0])

                expect(path.toInternalString()).to.equal("E 20 30 E 90 50")

                expect(scene.figureeditor.svgView.style.cursor).to.contain("edit.svg")
            })
        })

        describe("anchor EDGE_ANGLE", function () {

            it("move anchor", function () {
                const scene = new FigureEditorScene()

                const p0 = { x: 10, y: 50 }
                let p1 = { x: 40, y: 20 }
                let p2 = { x: 50, y: 50 }
                let p3 = { x: 70, y: 60 }
                const p4 = { x: 90, y: 50 }
                const p5 = { x: 55, y: 65 }

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

                scene.pointerDownAt(p2)
                scene.pointerTo(p5)
                scene.pointerUp()

                const delta = pointMinusPoint(p5, p2)
                p1 = pointPlusPoint(p1, delta)
                p2 = pointPlusPoint(p2, delta)
                p3 = pointPlusPoint(p3, delta)

                expect(path.toInternalString()).to.equal(`E ${p(p0)} EA ${p(p2)} ${p(p3)} E ${p(p4)}`)
            })

            it("move handle", function () {
                const scene = new FigureEditorScene()

                const p0 = { x: 10, y: 50 }
                let p1 = { x: 40, y: 20 }
                let p2 = { x: 50, y: 50 }
                let p3 = { x: 70, y: 60 }
                const p4 = { x: 90, y: 50 }
                const p5 = { x: 55, y: 65 }

                const path = new Path()
                path.addEdge(p0)
                path.addEdgeAngle(p2, p3)
                path.addEdge(p4)
                scene.addFigure(path)
                expect(path.toInternalString()).to.equal(`E ${p(p0)} EA ${p(p2)} ${p(p3)} E ${p(p4)}`)

                scene.selectEditTool()
                scene.pointerClickAt(p0)
                expect(Tool.selection.has(path)).to.be.true

                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 0])

                scene.pointerClickAt(p2)
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.hasHandleAt(p2, p3)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 1])

                const e = scene.figureeditor.shadowRoot!.elementFromPoint(p3.x, p3.y)! as SVGElement
                expect(e.style.cursor).to.contain("edit-handle.svg")

                scene.pointerDownAt(p3)
                scene.pointerTo(p5)
                scene.pointerUp()

                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.hasHandleAt(p2, p5)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 1])

                expect(path.toInternalString()).to.equal(`E ${p(p0)} EA ${p(p2)} ${p(p5)} E ${p(p4)}`)
            })
        })

        describe("anchor ANGLE_EDGE", function () {

            it("move anchor", function () {
                const scene = new FigureEditorScene()

                const p0 = { x: 10, y: 50 }
                let p1 = { x: 40, y: 20 }
                let p2 = { x: 50, y: 50 }
                let p3 = { x: 70, y: 60 }
                const p4 = { x: 90, y: 50 }
                const p5 = { x: 55, y: 65 }

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

                scene.pointerDownAt(p2)
                scene.pointerTo(p5)
                scene.pointerUp()

                const delta = pointMinusPoint(p5, p2)
                p1 = pointPlusPoint(p1, delta)
                p2 = pointPlusPoint(p2, delta)
                p3 = pointPlusPoint(p3, delta)

                expect(path.toInternalString()).to.equal(`E ${p(p0)} AE ${p(p1)} ${p(p2)} E ${p(p4)}`)
            })

            it("move handle", function () {
                const scene = new FigureEditorScene()

                const p0 = { x: 10, y: 50 }
                let p1 = { x: 40, y: 20 }
                let p2 = { x: 50, y: 50 }
                let p3 = { x: 70, y: 60 }
                const p4 = { x: 90, y: 50 }
                const p5 = { x: 55, y: 65 }

                const path = new Path()
                path.addEdge(p0)
                path.addAngleEdge(p1, p2)
                path.addEdge(p4)
                scene.addFigure(path)
                expect(path.toInternalString()).to.equal(`E ${p(p0)} AE ${p(p1)} ${p(p2)} E ${p(p4)}`)

                scene.selectEditTool()
                scene.pointerClickAt(p0)
                expect(Tool.selection.has(path)).to.be.true

                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 0])

                scene.pointerClickAt(p1)
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.hasHandleAt(p2, p1)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 1])

                const e = scene.figureeditor.shadowRoot!.elementFromPoint(p1.x, p1.y)! as SVGElement
                expect(e.style.cursor).to.contain("edit-handle.svg")

                scene.pointerDownAt(p1)
                scene.pointerTo(p5)
                scene.pointerUp()

                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.hasHandleAt(p2, p5)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 1])

                expect(path.toInternalString()).to.equal(`E ${p(p0)} AE ${p(p5)} ${p(p2)} E ${p(p4)}`)
            })
        })

        describe("anchor SYMMETRIC", function () {
            it("move anchor", function () {
                const scene = new FigureEditorScene()

                const p0 = { x: 10, y: 50 }
                let p1 = { x: 40, y: 20 }
                let p2 = { x: 50, y: 50 }
                let p3 = { x: 70, y: 60 }
                const p4 = { x: 90, y: 50 }
                const p5 = { x: 55, y: 65 }

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

                scene.pointerDownAt(p2)
                scene.pointerTo(p5)
                scene.pointerUp()

                const delta = pointMinusPoint(p5, p2)
                p1 = pointPlusPoint(p1, delta)
                p2 = pointPlusPoint(p2, delta)
                p3 = pointPlusPoint(p3, delta)

                expect(path.toInternalString()).to.equal(`E ${p(p0)} S ${p(p1)} ${p(p2)} E ${p(p4)}`)
            })

            it("move backward handle", function () {
                const scene = new FigureEditorScene()

                const p0 = { x: 10, y: 50 }
                let p1 = { x: 40, y: 20 }
                let p2 = { x: 50, y: 50 }
                let p3 = { x: 70, y: 60 }
                const p4 = { x: 90, y: 50 }
                const p5 = { x: 55, y: 65 }

                const path = new Path()
                path.addEdge(p0)
                path.addSymmetric(p1, p2)
                path.addEdge(p4)
                scene.addFigure(path)
                expect(path.toInternalString()).to.equal(`E ${p(p0)} S ${p(p1)} ${p(p2)} E ${p(p4)}`)

                scene.selectEditTool()
                scene.pointerClickAt(p0)
                expect(Tool.selection.has(path)).to.be.true

                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 0])

                scene.pointerClickAt(p2)
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.hasHandleAt(p2, p1)).to.be.true
                expect(scene.hasHandleAt(p2, mirrorPoint(p2, p1))).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])

                const e = scene.figureeditor.shadowRoot!.elementFromPoint(p1.x, p1.y)! as SVGElement
                expect(e.style.cursor).to.contain("edit-handle.svg")

                scene.pointerDownAt(p1)
                scene.pointerTo(p5)
                scene.pointerUp()

                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.hasHandleAt(p2, p5)).to.be.true
                expect(scene.hasHandleAt(p2, mirrorPoint(p2, p5))).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])

                expect(path.toInternalString()).to.equal(`E ${p(p0)} S ${p(p5)} ${p(p2)} E ${p(p4)}`)
            })

            it("move forward handle", function () {
                const scene = new FigureEditorScene()

                const p0 = { x: 10, y: 50 }
                let p1 = { x: 40, y: 20 }
                let p2 = { x: 50, y: 50 }
                let p3 = { x: 70, y: 60 }
                const p4 = { x: 90, y: 50 }
                const p5 = { x: 55, y: 65 }

                const path = new Path()
                path.addEdge(p0)
                path.addSymmetric(p1, p2)
                path.addEdge(p4)
                scene.addFigure(path)
                expect(path.toInternalString()).to.equal(`E ${p(p0)} S ${p(p1)} ${p(p2)} E ${p(p4)}`)

                scene.selectEditTool()
                scene.pointerClickAt(p0)
                expect(Tool.selection.has(path)).to.be.true

                scene.pointerClickAt(p2)
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])

                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.hasHandleAt(p2, p1)).to.be.true
                expect(scene.hasHandleAt(p2, mirrorPoint(p2, p1))).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])

                const e = scene.figureeditor.shadowRoot!.elementFromPoint(p1.x, p1.y)! as SVGElement
                expect(e.style.cursor).to.contain("edit-handle.svg")

                scene.pointerDownAt(mirrorPoint(p2, p1))
                scene.pointerTo(mirrorPoint(p2, p5))
                scene.pointerUp()

                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.hasHandleAt(p2, p5)).to.be.true
                expect(scene.hasHandleAt(p2, mirrorPoint(p2, p5))).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])

                expect(path.toInternalString()).to.equal(`E ${p(p0)} S ${p(p5)} ${p(p2)} E ${p(p4)}`)
            })
        })

        describe("anchor SMOOTH", function () {

            it("move anchor", function () {
                // GIVEN a path with a smooth anchor
                const scene = new FigureEditorScene()

                const p0 = { x: 10, y: 50 }
                let p1 = { x: 40, y: 20 }
                let p2 = { x: 50, y: 50 }
                let p3 = pointMinusPoint(p2, pointMultiplyNumber(pointMinusPoint(p1, p2), 2))
                const p4 = { x: 90, y: 50 }
                const p5 = { x: 55, y: 65 }

                const path = new Path()
                path.addEdge(p0)
                path.addSmoothAngleAngle(p1, p2, p3)
                path.addEdge(p4)
                scene.addFigure(path)
                expect(path.toInternalString()).to.equal(`E ${p(p0)} SAA ${p(p1)} ${p(p2)} ${p(p3)} E ${p(p4)}`)

                scene.selectEditTool()
                scene.pointerClickAt(p0)
                expect(Tool.selection.has(path)).to.be.true
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 0])

                // WHEN anchor is moved from p2 to p5
                const e = scene.figureeditor.shadowRoot!.elementFromPoint(p2.x, p2.y)! as SVGElement
                expect(e.style.cursor).to.contain("edit-anchor.svg")

                scene.pointerDownAt(p2)
                scene.pointerTo(p5)
                scene.pointerUp()

                // THEN
                const delta = pointMinusPoint(p5, p2)
                p1 = pointPlusPoint(p1, delta)
                p2 = pointPlusPoint(p2, delta)
                p3 = pointPlusPoint(p3, delta)

                expect(path.toInternalString()).to.equal(`E ${p(p0)} SAA ${p(p1)} ${p(p2)} ${p(p3)} E ${p(p4)}`)
            })

            it("move backward handle", function () {
                // GIVEN a path with a smooth anchor
                const scene = new FigureEditorScene()

                const p0 = { x: 10, y: 50 }
                let p1 = { x: 40, y: 20 }
                let p2 = { x: 50, y: 50 }
                let p3 = pointMinusPoint(p2, pointMultiplyNumber(pointMinusPoint(p1, p2), 2))
                const p4 = { x: 90, y: 50 }
                const p5 = { x: 55, y: 165 }

                const path = new Path()
                path.addEdge(p0)
                path.addSmoothAngleAngle(p1, p2, p3)
                path.addEdge(p4)
                scene.addFigure(path)
                expect(path.toInternalString()).to.equal(`E ${p(p0)} SAA ${p(p1)} ${p(p2)} ${p(p3)} E ${p(p4)}`)

                scene.selectEditTool()
                scene.pointerClickAt(p0)
                expect(Tool.selection.has(path)).to.be.true
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 0])

                scene.pointerClickAt(p2)
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.hasHandleAt(p2, p1)).to.be.true
                expect(scene.hasHandleAt(p2, p3)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])

                // WHEN backward handle is moved from p1 to p5
                const e = scene.figureeditor.shadowRoot!.elementFromPoint(p1.x, p1.y)! as SVGElement
                expect(e.style.cursor).to.contain("edit-handle.svg")
                scene.pointerDownAt(p1)
                scene.pointerTo(p5)
                scene.pointerUp()

                // THEN
                p3 = { x: 47.25278872102622, y: -13.185859416396944 }
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.hasHandleAt(p2, p5)).to.be.true
                expect(scene.hasHandleAt(p2, p3)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])
                expect(path.toInternalString()).to.equal(`E ${p(p0)} SAA ${p(p5)} ${p(p2)} ${p(p3)} E ${p(p4)}`)
            })

            it("move forward handle", function () {
                // GIVEN a path with a smooth anchor
                const scene = new FigureEditorScene()

                const p0 = { x: 10, y: 50 }
                let p2 = { x: 50, y: 50 }
                let p3 = { x: 70, y: 60 }
                let p1 = pointMinusPoint(p2, pointMultiplyNumber(pointMinusPoint(p3, p2), 2))
                const p4 = { x: 90, y: 50 }
                const p5 = { x: 55, y: 165 }

                const path = new Path()
                path.addEdge(p0)
                path.addSmoothAngleAngle(p1, p2, p3)
                path.addEdge(p4)
                scene.addFigure(path)
                expect(path.toInternalString()).to.equal(`E ${p(p0)} SAA ${p(p1)} ${p(p2)} ${p(p3)} E ${p(p4)}`)

                scene.selectEditTool()
                scene.pointerClickAt(p0)
                expect(Tool.selection.has(path)).to.be.true
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 0])

                scene.pointerClickAt(p2)
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.hasHandleAt(p2, p1)).to.be.true
                expect(scene.hasHandleAt(p2, p3)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])

                // WHEN backward handle is moved from p1 to p5
                const e = scene.figureeditor.shadowRoot!.elementFromPoint(p3.x, p3.y)! as SVGElement
                expect(e.style.cursor).to.contain("edit-handle.svg")
                scene.pointerDownAt(p3)
                scene.pointerTo(p5)
                scene.pointerUp()

                // THEN
                p1 = { x: 48.057428275285474, y: 5.32085033156585 }
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.hasHandleAt(p2, p5)).to.be.true
                expect(scene.hasHandleAt(p2, p1)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])
                expect(path.toInternalString()).to.equal(`E ${p(p0)} SAA ${p(p1)} ${p(p2)} ${p(p5)} E ${p(p4)}`)
            })
        })

        describe("anchor ANGLE_ANGLE", function () {

            it("move anchor", function () {
                const scene = new FigureEditorScene()

                const p0 = { x: 10, y: 50 }
                let p1 = { x: 40, y: 20 }
                let p2 = { x: 50, y: 50 }
                let p3 = { x: 70, y: 60 }
                const p4 = { x: 90, y: 50 }
                const p5 = { x: 55, y: 65 }

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

                scene.pointerDownAt(p2)
                scene.pointerTo(p5)
                scene.pointerUp()

                const delta = pointMinusPoint(p5, p2)
                p1 = pointPlusPoint(p1, delta)
                p2 = pointPlusPoint(p2, delta)
                p3 = pointPlusPoint(p3, delta)

                expect(path.toInternalString()).to.equal(`E ${p(p0)} AA ${p(p1)} ${p(p2)} ${p(p3)} E ${p(p4)}`)
            })

            it("move backward handle", function () {
                const scene = new FigureEditorScene()

                const p0 = { x: 10, y: 50 }
                let p1 = { x: 40, y: 20 }
                let p2 = { x: 50, y: 50 }
                let p3 = { x: 70, y: 60 }
                const p4 = { x: 90, y: 50 }
                const p5 = { x: 55, y: 65 }

                const path = new Path()
                path.addEdge(p0)
                path.addAngleAngle(p1, p2, p3)
                path.addEdge(p4)
                scene.addFigure(path)
                expect(path.toInternalString()).to.equal(`E ${p(p0)} AA ${p(p1)} ${p(p2)} ${p(p3)} E ${p(p4)}`)

                scene.selectEditTool()
                scene.pointerClickAt(p0)
                expect(Tool.selection.has(path)).to.be.true

                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 0])

                scene.pointerClickAt(p2)
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.hasHandleAt(p2, p1)).to.be.true
                expect(scene.hasHandleAt(p2, p3)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])

                const e = scene.figureeditor.shadowRoot!.elementFromPoint(p1.x, p1.y)! as SVGElement
                expect(e.style.cursor).to.contain("edit-handle.svg")

                scene.pointerDownAt(p1)
                scene.pointerTo(p5)
                scene.pointerUp()

                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.hasHandleAt(p2, p5)).to.be.true
                expect(scene.hasHandleAt(p2, p3)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])

                expect(path.toInternalString()).to.equal(`E ${p(p0)} AA ${p(p5)} ${p(p2)} ${p(p3)} E ${p(p4)}`)
            })
            it("move forward handle", function () {
                const scene = new FigureEditorScene()

                const p0 = { x: 10, y: 50 }
                let p1 = { x: 40, y: 20 }
                let p2 = { x: 50, y: 50 }
                let p3 = { x: 70, y: 60 }
                const p4 = { x: 90, y: 50 }
                const p5 = { x: 55, y: 65 }

                const path = new Path()
                path.addEdge(p0)
                path.addAngleAngle(p1, p2, p3)
                path.addEdge(p4)
                scene.addFigure(path)
                expect(path.toInternalString()).to.equal(`E ${p(p0)} AA ${p(p1)} ${p(p2)} ${p(p3)} E ${p(p4)}`)

                scene.selectEditTool()
                scene.pointerClickAt(p0)
                expect(Tool.selection.has(path)).to.be.true

                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 0])

                scene.pointerClickAt(p2)
                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.hasHandleAt(p2, p1)).to.be.true
                expect(scene.hasHandleAt(p2, p3)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])

                const e = scene.figureeditor.shadowRoot!.elementFromPoint(p1.x, p1.y)! as SVGElement
                expect(e.style.cursor).to.contain("edit-handle.svg")

                scene.pointerDownAt(p3)
                scene.pointerTo(p5)
                scene.pointerUp()

                expect(scene.hasAnchorAt(p0)).to.be.true
                expect(scene.hasAnchorAt(p2)).to.be.true
                expect(scene.hasAnchorAt(p4)).to.be.true
                expect(scene.hasHandleAt(p2, p1)).to.be.true
                expect(scene.hasHandleAt(p2, p5)).to.be.true
                expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])

                expect(path.toInternalString()).to.equal(`E ${p(p0)} AA ${p(p1)} ${p(p2)} ${p(p5)} E ${p(p4)}`)
            })
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
