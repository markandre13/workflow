import { expect } from "chai"

import { ShapeEditorScene } from "../ShapeEditorScene"
import { Tool } from "client/shapetools/Tool"
import { PathEditor } from "client/shapetools/EditTool"
import { Path } from "client/shapes/Path"

import { initializeCORBAValueTypes } from "client/workflow"
import { pointMinusPoint, pointPlusPoint, pointMultiplyNumber, mirrorPoint } from 'shared/geometry'
import { PointLike } from 'shared/geometry/Point'

it("\x07") // beep

describe("EditTool", function () {
    beforeAll(async function () {
        initializeCORBAValueTypes()
        await loadScript("polyfill/path-data-polyfill.js")
    })

    describe("Path", function () {

        it("ready to edit", function () {
            const scene = new ShapeEditorScene()

            scene.selectEditTool()

            expect(scene.shapeeditor.svgView.style.cursor).to.contain("edit.svg")
        })

        it("select path", function () {
            const scene = new ShapeEditorScene()
            const path = new Path()
            const p0 = { x: 10, y: 50 }
            const p1 = { x: 90, y: 50 }
            path.addEdge(p0)
            path.addEdge(p1)
            scene.addShape(path)
            scene.selectEditTool()

            scene.pointerClickAt({ x: 50, y: 50 })

            expect(Tool.selection.has(path)).to.be.true
            expect(scene.shapeeditor.svgView.style.cursor).to.contain("edit.svg")
        })
        it("temporarily show all handles on anchor when one handle is grabbed", function () {
            const scene = new ShapeEditorScene()
            const path = new Path()
            const p0 = { x: 10, y: 50 }
            const p1 = { x: 30, y: 70 }
            const p2 = { x: 40, y: 50 }
            const p3 = { x: 60, y: 70 }
            const p4 = { x: 70, y: 50 }
            const p5 = { x: 90, y: 70 }
            const p6 = { x: 100, y: 50 }
            const p7 = { x: 120, y: 50 }
            path.addEdge(p0)
            path.addSymmetric(p1, p2)
            path.addSymmetric(p3, p4)
            path.addSymmetric(p5, p6)
            path.addEdge(p7)
            scene.addShape(path)
            scene.selectEditTool()

            scene.pointerClickAt(p0)
            expect(scene.getAnchorHandleCount()).to.deep.equal([5, 0])

            scene.pointerClickAt(p4)
            expect(scene.hasHandleAt(p2, mirrorPoint(p2, p1))).to.be.true
            expect(scene.hasHandleAt(p4, p3)).to.be.true
            expect(scene.hasHandleAt(p4, mirrorPoint(p4, p3))).to.be.true
            expect(scene.hasHandleAt(p6, p5)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([5, 4])

            // previous anchor's handle
            scene.pointerDownAt(mirrorPoint(p2, p1))
            expect(scene.hasHandleAt(p2, p1)).to.be.true
            expect(scene.hasHandleAt(p2, mirrorPoint(p2, p1))).to.be.true
            expect(scene.hasHandleAt(p4, p3)).to.be.true
            expect(scene.hasHandleAt(p4, mirrorPoint(p4, p3))).to.be.true
            expect(scene.hasHandleAt(p6, p5)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([5, 5])

            scene.pointerUp()
            expect(scene.hasHandleAt(p2, mirrorPoint(p2, p1))).to.be.true
            expect(scene.hasHandleAt(p4, p3)).to.be.true
            expect(scene.hasHandleAt(p4, mirrorPoint(p4, p3))).to.be.true
            expect(scene.hasHandleAt(p6, p5)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([5, 4])

            // next anchor's handle
            scene.pointerDownAt(p5)
            expect(scene.hasHandleAt(p2, mirrorPoint(p2, p1))).to.be.true
            expect(scene.hasHandleAt(p4, p3)).to.be.true
            expect(scene.hasHandleAt(p4, mirrorPoint(p4, p3))).to.be.true
            expect(scene.hasHandleAt(p6, p5)).to.be.true
            expect(scene.hasHandleAt(p6, mirrorPoint(p6, p5))).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([5, 5])

            scene.pointerUp()
            expect(scene.hasHandleAt(p2, mirrorPoint(p2, p1))).to.be.true
            expect(scene.hasHandleAt(p4, p3)).to.be.true
            expect(scene.hasHandleAt(p4, mirrorPoint(p4, p3))).to.be.true
            expect(scene.hasHandleAt(p6, p5)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([5, 4])
        })
        it("anchors at path head and tail show only one handle", function () {
            const scene = new ShapeEditorScene()

            const p0 = { x: 10, y: 50 }
            const p1 = { x: 20, y: 70 }
            const p2 = { x: 40, y: 50 }
            const p3 = { x: 60, y: 70 }
            const p4 = { x: 80, y: 50 }
            const p5 = { x: 100, y: 70 }

            const path = new Path()
            path.addSymmetric(p0, p1)
            path.addSymmetric(p2, p3)
            path.addSymmetric(p4, p5)
            scene.addShape(path)

            scene.selectEditTool()
            scene.pointerClickAt(p1)
            expect(Tool.selection.has(path)).to.be.true

            scene.pointerClickAt(p5)
            expect(scene.hasAnchorAt(p1)).to.be.true
            expect(scene.hasAnchorAt(p3)).to.be.true
            expect(scene.hasAnchorAt(p5)).to.be.true
            expect(scene.hasHandleAt(p3, mirrorPoint(p3, p2))).to.be.true
            expect(scene.hasHandleAt(p5, p4)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])

            scene.pointerClickAt(p1)
            expect(scene.hasAnchorAt(p1)).to.be.true
            expect(scene.hasAnchorAt(p3)).to.be.true
            expect(scene.hasAnchorAt(p5)).to.be.true
            expect(scene.hasHandleAt(p1, mirrorPoint(p1, p0))).to.be.true
            expect(scene.hasHandleAt(p3, p2)).to.be.true
            expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])
        })

        describe("change anchor types", function () {
            describe("ALT key makes edges sharper", function () {
                it("click handle, related angle is removed", function() {
                    const scene = new ShapeEditorScene()

                    const p0 = { x: 10, y: 50 }
                    let p1 = { x: 40, y: 20 }
                    let p2 = { x: 50, y: 50 }
                    let p3 = mirrorPoint(p2, p1)
                    const p4 = { x: 90, y: 50 }

                    const path = new Path()
                    path.addEdge(p0)
                    path.addSymmetric(p1, p2)
                    path.addEdge(p4)
                    scene.addShape(path)

                    expect(path.toInternalString()).to.equal(`E ${p(p0)} S ${p(p1)} ${p(p2)} E ${p(p4)}`)

                    scene.selectEditTool()
                    scene.pointerClickAt(p0) // select shape

                    const outline = (scene.editTool.editors[0] as PathEditor).outline
                    expect(
                        outline.toInternalString()
                    ).to.equal(`E ${p(p0)} S ${p(p1)} ${p(p2)} E ${p(p4)}`)

                    scene.pointerClickAt(p2) // select anchor
                  
                    scene.keydown("AltLeft")
                    scene.pointerClickAt(p1)
                    expect(
                        outline.toInternalString()
                    ).to.equal(`E ${p(p0)} EA ${p(p2)} ${p(p3)} E ${p(p4)}`)

                    expect(path.toInternalString()).to.equal(`E ${p(p0)} EA ${p(p2)} ${p(p3)} E ${p(p4)}`)

                    scene.pointerClickAt(p3)
                    expect(
                        outline.toInternalString()
                    ).to.equal(`E ${p(p0)} E ${p(p2)} E ${p(p4)}`)

                    expect(path.toInternalString()).to.equal(`E ${p(p0)} E ${p(p2)} E ${p(p4)}`)
                    
                })
                it("click anchor, all angles are removed", function() {
                    const scene = new ShapeEditorScene()

                    const p0 = { x: 10, y: 50 }
                    let p1 = { x: 40, y: 20 }
                    let p2 = { x: 50, y: 50 }
                    let p3 = mirrorPoint(p2, p1)
                    const p4 = { x: 90, y: 50 }

                    const path = new Path()
                    path.addEdge(p0)
                    path.addSymmetric(p1, p2)
                    path.addEdge(p4)
                    scene.addShape(path)

                    expect(path.toInternalString()).to.equal(`E ${p(p0)} S ${p(p1)} ${p(p2)} E ${p(p4)}`)

                    scene.selectEditTool()
                    scene.pointerClickAt(p0) // select shape

                    const outline = (scene.editTool.editors[0] as PathEditor).outline
                    expect(
                        outline.toInternalString()
                    ).to.equal(`E ${p(p0)} S ${p(p1)} ${p(p2)} E ${p(p4)}`)

                    scene.pointerClickAt(p2) // select anchor
                  
                    scene.keydown("AltLeft")
                    scene.pointerClickAt(p2)
                    expect(
                        outline.toInternalString()
                    ).to.equal(`E ${p(p0)} E ${p(p2)} E ${p(p4)}`)

                    expect(path.toInternalString()).to.equal(`E ${p(p0)} E ${p(p2)} E ${p(p4)}`)
                })

                describe("drag handle and release pointer", function () {
                    describe("anchor becomes ANGLE_ANGLE", function () {
                        it("backward handle", function () {
                            const scene = new ShapeEditorScene()

                            const p0 = { x: 10, y: 50 }
                            let p1 = { x: 40, y: 20 }
                            let p2 = { x: 50, y: 50 }
                            let p3 = { x: 70, y: 60 }
                            const p4 = { x: 90, y: 50 }

                            const p5 = { x: 30, y: 70 }
                            const p6 = { x: 35, y: 65 }

                            const path = new Path()
                            path.addEdge(p0)
                            path.addSymmetric(p1, p2)
                            path.addEdge(p4)
                            scene.addShape(path)
                            expect(path.toInternalString()).to.equal(`E ${p(p0)} S ${p(p1)} ${p(p2)} E ${p(p4)}`)

                            scene.selectEditTool()
                            scene.pointerClickAt(p0)
                            scene.pointerClickAt(p2)

                            expect(scene.hasAnchorAt(p0)).to.be.true
                            expect(scene.hasAnchorAt(p2)).to.be.true
                            expect(scene.hasAnchorAt(p4)).to.be.true
                            expect(scene.hasHandleAt(p2, p1)).to.be.true
                            expect(scene.hasHandleAt(p2, mirrorPoint(p2, p1))).to.be.true
                            expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])

                            scene.pointerDownAt(p1)
                            scene.pointerTo(p5)

                            expect(scene.hasAnchorAt(p0)).to.be.true
                            expect(scene.hasAnchorAt(p2)).to.be.true
                            expect(scene.hasAnchorAt(p4)).to.be.true
                            expect(scene.hasHandleAt(p2, p5)).to.be.true
                            expect(scene.hasHandleAt(p2, mirrorPoint(p2, p5))).to.be.true
                            expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])
                            expect(
                                (scene.editTool.editors[0] as PathEditor).outline.toInternalString()
                            ).to.equal(`E ${p(p0)} S ${p(p5)} ${p(p2)} E ${p(p4)}`)

                            scene.keydown("AltLeft")
                            expect(
                                (scene.editTool.editors[0] as PathEditor).outline.toInternalString()
                            ).to.equal(`E ${p(p0)} AA ${p(p5)} ${p(p2)} ${p(mirrorPoint(p2, p5))} E ${p(p4)}`)

                            scene.pointerTo(p6)
                            expect(scene.hasAnchorAt(p0)).to.be.true
                            expect(scene.hasAnchorAt(p2)).to.be.true
                            expect(scene.hasAnchorAt(p4)).to.be.true
                            expect(scene.hasHandleAt(p2, p6)).to.be.true
                            expect(scene.hasHandleAt(p2, mirrorPoint(p2, p5))).to.be.true
                            expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])
                            expect(
                                (scene.editTool.editors[0] as PathEditor).outline.toInternalString()
                            ).to.equal(`E ${p(p0)} AA ${p(p6)} ${p(p2)} ${p(mirrorPoint(p2, p5))} E ${p(p4)}`)

                            scene.pointerUp()
                            expect(
                                path.toInternalString()
                            ).to.equal(`E ${p(p0)} AA ${p(p6)} ${p(p2)} ${p(mirrorPoint(p2, p5))} E ${p(p4)}`)
                        })
                        it("forward handle", function () {
                            const scene = new ShapeEditorScene()

                            const p0 = { x: 10, y: 50 }
                            let p1 = { x: 40, y: 20 }
                            let p2 = { x: 50, y: 50 }
                            let p3 = { x: 70, y: 60 }
                            const p4 = { x: 90, y: 50 }

                            const p5 = { x: 30, y: 70 }
                            const p6 = { x: 35, y: 65 }

                            const path = new Path()
                            path.addEdge(p0)
                            path.addSymmetric(p1, p2)
                            path.addEdge(p4)
                            scene.addShape(path)
                            expect(path.toInternalString()).to.equal(`E ${p(p0)} S ${p(p1)} ${p(p2)} E ${p(p4)}`)

                            scene.selectEditTool()
                            scene.pointerClickAt(p0)
                            scene.pointerClickAt(p2)

                            expect(scene.hasAnchorAt(p0)).to.be.true
                            expect(scene.hasAnchorAt(p2)).to.be.true
                            expect(scene.hasAnchorAt(p4)).to.be.true
                            expect(scene.hasHandleAt(p2, p1)).to.be.true
                            expect(scene.hasHandleAt(p2, mirrorPoint(p2, p1))).to.be.true
                            expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])

                            scene.pointerDownAt(mirrorPoint(p2, p1))
                            scene.pointerTo(p5)

                            expect(scene.hasAnchorAt(p0)).to.be.true
                            expect(scene.hasAnchorAt(p2)).to.be.true
                            expect(scene.hasAnchorAt(p4)).to.be.true
                            expect(scene.hasHandleAt(p2, mirrorPoint(p2, p5))).to.be.true
                            expect(scene.hasHandleAt(p2, p5)).to.be.true
                            expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])
                            expect(
                                (scene.editTool.editors[0] as PathEditor).outline.toInternalString()
                            ).to.equal(`E ${p(p0)} S ${p(mirrorPoint(p2, p5))} ${p(p2)} E ${p(p4)}`)

                            scene.keydown("AltLeft")
                            expect(
                                (scene.editTool.editors[0] as PathEditor).outline.toInternalString()
                            ).to.equal(`E ${p(p0)} AA ${p(mirrorPoint(p2, p5))} ${p(p2)} ${p(p5)} E ${p(p4)}`)

                            scene.pointerTo(p6)
                            expect(scene.hasAnchorAt(p0)).to.be.true
                            expect(scene.hasAnchorAt(p2)).to.be.true
                            expect(scene.hasAnchorAt(p4)).to.be.true
                            expect(scene.hasHandleAt(p2, p6)).to.be.true
                            expect(scene.hasHandleAt(p2, mirrorPoint(p2, p5))).to.be.true
                            expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])
                            expect(
                                (scene.editTool.editors[0] as PathEditor).outline.toInternalString()
                            ).to.equal(`E ${p(p0)} AA ${p(mirrorPoint(p2, p5))} ${p(p2)} ${p(p6)} E ${p(p4)}`)

                            scene.pointerUp()
                            expect(
                                path.toInternalString()
                            ).to.equal(`E ${p(p0)} AA ${p(mirrorPoint(p2, p5))} ${p(p2)} ${p(p6)} E ${p(p4)}`)
                        })
                        it("regression: handles were wrong after pointerUp()", function () {
                            const scene = new ShapeEditorScene()

                            const p0 = { x: 10, y: 50 }
                            const p1 = { x: 20, y: 70 }
                            const p2 = { x: 40, y: 50 }
                            const p3 = { x: 60, y: 70 }
                            const p4 = { x: 80, y: 50 }
                            const p5 = { x: 100, y: 70 }

                            const p6 = { x: 40, y: 90 }

                            const path = new Path()
                            path.addSymmetric(p0, p1)
                            path.addSymmetric(p2, p3)
                            path.addSymmetric(p4, p5)
                            scene.addShape(path)
                            // expect(path.toInternalString()).to.equal(`S ${p(p0)} S ${p(p1)} ${p(p2)} E ${p(p4)}`)

                            scene.selectEditTool()
                            scene.pointerClickAt(p1)
                            expect(Tool.selection.has(path)).to.be.true
                            scene.pointerClickAt(p5)

                            expect(
                                (scene.editTool.editors[0] as PathEditor).outline.toInternalString()
                            ).to.equal(`S ${p(p0)} ${p(p1)} S ${p(p2)} ${p(p3)} S ${p(p4)} ${p(p5)}`)

                            expect(scene.hasAnchorAt(p1)).to.be.true
                            expect(scene.hasAnchorAt(p3)).to.be.true
                            expect(scene.hasAnchorAt(p5)).to.be.true
                            expect(scene.hasHandleAt(p3, mirrorPoint(p3, p2))).to.be.true
                            expect(scene.hasHandleAt(p5, p4)).to.be.true
                            expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])

                            scene.pointerDownAt(mirrorPoint(p3, p2))
                            scene.keydown("AltLeft")
                            scene.pointerTo(p6)

                            expect(scene.hasAnchorAt(p1)).to.be.true
                            expect(scene.hasAnchorAt(p3)).to.be.true
                            expect(scene.hasAnchorAt(p5)).to.be.true
                            expect(scene.hasHandleAt(p3, p2)).to.be.true
                            expect(scene.hasHandleAt(p3, p6)).to.be.true
                            expect(scene.hasHandleAt(p5, p4)).to.be.true
                            expect(scene.getAnchorHandleCount()).to.deep.equal([3, 3])

                            expect(
                                (scene.editTool.editors[0] as PathEditor).outline.toInternalString()
                            ).to.equal(`S ${p(p0)} ${p(p1)} AA ${p(p2)} ${p(p3)} ${p(p6)} S ${p(p4)} ${p(p5)}`)

                            scene.pointerUp()
                            expect(path.toInternalString())
                                .to.equal(`S ${p(p0)} ${p(p1)} AA ${p(p2)} ${p(p3)} ${p(p6)} S ${p(p4)} ${p(p5)}`)
                            expect(scene.hasAnchorAt(p1)).to.be.true
                            expect(scene.hasAnchorAt(p3)).to.be.true
                            expect(scene.hasAnchorAt(p5)).to.be.true
                            // expect(scene.hasHandleAt(p3, p2)).to.be.true
                            expect(scene.hasHandleAt(p3, p6)).to.be.true
                            expect(scene.hasHandleAt(p5, p4)).to.be.true
                            expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])
                        })
                    })
                    it("when key is released outline's anchor reverts", function () {
                        const scene = new ShapeEditorScene()

                        const p0 = { x: 10, y: 50 }
                        let p1 = { x: 40, y: 20 }
                        let p2 = { x: 50, y: 50 }
                        let p3 = { x: 70, y: 60 }
                        const p4 = { x: 90, y: 50 }

                        const p5 = { x: 30, y: 70 }
                        const p6 = { x: 35, y: 65 }

                        const path = new Path()
                        path.addEdge(p0)
                        path.addSymmetric(p1, p2)
                        path.addEdge(p4)
                        scene.addShape(path)
                        expect(path.toInternalString()).to.equal(`E ${p(p0)} S ${p(p1)} ${p(p2)} E ${p(p4)}`)

                        scene.selectEditTool()
                        scene.pointerClickAt(p0)
                        scene.pointerClickAt(p2)

                        expect(scene.hasAnchorAt(p0)).to.be.true
                        expect(scene.hasAnchorAt(p2)).to.be.true
                        expect(scene.hasAnchorAt(p4)).to.be.true
                        expect(scene.hasHandleAt(p2, p1)).to.be.true
                        expect(scene.hasHandleAt(p2, mirrorPoint(p2, p1))).to.be.true
                        expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])

                        scene.pointerDownAt(p1)
                        scene.pointerTo(p5)

                        expect(scene.hasAnchorAt(p0)).to.be.true
                        expect(scene.hasAnchorAt(p2)).to.be.true
                        expect(scene.hasAnchorAt(p4)).to.be.true
                        expect(scene.hasHandleAt(p2, p5)).to.be.true
                        expect(scene.hasHandleAt(p2, mirrorPoint(p2, p5))).to.be.true
                        expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])
                        expect(
                            (scene.editTool.editors[0] as PathEditor).outline.toInternalString()
                        ).to.equal(`E ${p(p0)} S ${p(p5)} ${p(p2)} E ${p(p4)}`)

                        scene.keydown("AltLeft")
                        expect(
                            (scene.editTool.editors[0] as PathEditor).outline.toInternalString()
                        ).to.equal(`E ${p(p0)} AA ${p(p5)} ${p(p2)} ${p(mirrorPoint(p2, p5))} E ${p(p4)}`)

                        scene.pointerTo(p6)
                        expect(scene.hasAnchorAt(p0)).to.be.true
                        expect(scene.hasAnchorAt(p2)).to.be.true
                        expect(scene.hasAnchorAt(p4)).to.be.true
                        expect(scene.hasHandleAt(p2, p6)).to.be.true
                        expect(scene.hasHandleAt(p2, mirrorPoint(p2, p5))).to.be.true
                        expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])
                        expect(
                            (scene.editTool.editors[0] as PathEditor).outline.toInternalString()
                        ).to.equal(`E ${p(p0)} AA ${p(p6)} ${p(p2)} ${p(mirrorPoint(p2, p5))} E ${p(p4)}`)

                        scene.keyup("AltLeft")
                        expect(
                            (scene.editTool.editors[0] as PathEditor).outline.toInternalString()
                        ).to.equal(`E ${p(p0)} S ${p(p6)} ${p(p2)} E ${p(p4)}`)
                        expect(scene.hasAnchorAt(p0)).to.be.true
                        expect(scene.hasAnchorAt(p2)).to.be.true
                        expect(scene.hasAnchorAt(p4)).to.be.true
                        expect(scene.hasHandleAt(p2, p6)).to.be.true
                        expect(scene.hasHandleAt(p2, mirrorPoint(p2, p6))).to.be.true
                        expect(scene.getAnchorHandleCount()).to.deep.equal([3, 2])
                    })
                })
            })
            describe("CTRL key makes anchors smoother", function () {
                // this is true for all anchor types, even edge
                it("click handle, anchor becomes SMOOTH")
                it("click anchor, anchor becomes SYMMETRIC")
                it("drag handle + SMOOTH, opposite handle's distance adjust propotionally")
            })
            it("remove ANCHOR: click DELETE/BACKSPACE key to delete all marked anchors")
            it("split path: CTRL click on curve/line removes it and splits the path")
            it("join/close paths: move anchor on anchor")
        })

        describe("no key", function () {
            it("drag anchor, move all marked anchors")
            // these are for a single selected anchor, but when multiple anchors are selected, move all anchors
            describe("anchor EDGE", function () {
                it("move anchor", function () {
                    const scene = new ShapeEditorScene()
                    const path = new Path()
                    const p0 = { x: 10, y: 50 }
                    const p1 = { x: 90, y: 50 }
                    const p2 = { x: 20, y: 30 }

                    path.addEdge(p0)
                    path.addEdge(p1)
                    scene.addShape(path)
                    scene.selectEditTool()

                    scene.pointerClickAt({ x: 50, y: 50 })
                    expect(Tool.selection.has(path)).to.be.true
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasAnchorAt(p1)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 0])

                    const e = scene.shapeeditor.shadowRoot!.elementFromPoint(p0.x, p0.y)! as SVGElement
                    expect(e.style.cursor).to.contain("edit-anchor.svg")

                    // TODO: test outline
                    scene.pointerDownAt(p0)
                    scene.pointerTo(p2)
                    scene.pointerUp()

                    expect(scene.hasAnchorAt(p2)).to.be.true
                    expect(scene.hasAnchorAt(p1)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([2, 0])

                    expect(path.toInternalString()).to.equal("E 20 30 E 90 50")

                    expect(scene.shapeeditor.svgView.style.cursor).to.contain("edit.svg")
                })
            })

            describe("anchor EDGE_ANGLE", function () {

                it("move anchor", function () {
                    const scene = new ShapeEditorScene()

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
                    scene.addShape(path)
                    expect(path.toInternalString()).to.equal(`E ${p(p0)} EA ${p(p2)} ${p(p3)} E ${p(p4)}`)

                    scene.selectEditTool()
                    scene.pointerClickAt(p0)
                    expect(Tool.selection.has(path)).to.be.true

                    const e = scene.shapeeditor.shadowRoot!.elementFromPoint(p2.x, p2.y)! as SVGElement
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
                    const scene = new ShapeEditorScene()

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
                    scene.addShape(path)
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

                    const e = scene.shapeeditor.shadowRoot!.elementFromPoint(p3.x, p3.y)! as SVGElement
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
                    const scene = new ShapeEditorScene()

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
                    scene.addShape(path)
                    expect(path.toInternalString()).to.equal(`E ${p(p0)} AE ${p(p1)} ${p(p2)} E ${p(p4)}`)

                    scene.selectEditTool()
                    scene.pointerClickAt(p0)
                    expect(Tool.selection.has(path)).to.be.true

                    const e = scene.shapeeditor.shadowRoot!.elementFromPoint(p2.x, p2.y)! as SVGElement
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
                    const scene = new ShapeEditorScene(true)

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
                    scene.addShape(path)
                    expect(path.toInternalString()).to.equal(`E ${p(p0)} AE ${p(p1)} ${p(p2)} E ${p(p4)}`)

                    // select shape
                    scene.selectEditTool()
                    scene.pointerClickAt(p0)
                    expect(Tool.selection.has(path)).to.be.true

                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasAnchorAt(p2)).to.be.true
                    expect(scene.hasAnchorAt(p4)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([3, 0])

                    // select anchor
                    scene.pointerClickAt(p2)
                    expect(Tool.selection.has(path)).to.be.true
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasAnchorAt(p2)).to.be.true
                    expect(scene.hasAnchorAt(p4)).to.be.true
                    expect(scene.hasHandleAt(p2, p1)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([3, 1])

                    const e = scene.shapeeditor.shadowRoot!.elementFromPoint(p1.x, p1.y)! as SVGElement
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
                    const scene = new ShapeEditorScene()

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
                    scene.addShape(path)
                    expect(path.toInternalString()).to.equal(`E ${p(p0)} S ${p(p1)} ${p(p2)} E ${p(p4)}`)

                    scene.selectEditTool()
                    scene.pointerClickAt(p0)
                    expect(Tool.selection.has(path)).to.be.true

                    const e = scene.shapeeditor.shadowRoot!.elementFromPoint(p2.x, p2.y)! as SVGElement
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
                    const scene = new ShapeEditorScene()

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
                    scene.addShape(path)
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

                    const e = scene.shapeeditor.shadowRoot!.elementFromPoint(p1.x, p1.y)! as SVGElement
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
                    const scene = new ShapeEditorScene()

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
                    scene.addShape(path)
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

                    const e = scene.shapeeditor.shadowRoot!.elementFromPoint(p1.x, p1.y)! as SVGElement
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
                    const scene = new ShapeEditorScene()

                    const p0 = { x: 10, y: 50 }
                    let p1 = { x: 40, y: 20 }
                    let p2 = { x: 50, y: 50 }
                    let p3: PointLike = pointMinusPoint(p2, pointMultiplyNumber(pointMinusPoint(p1, p2), 2))
                    const p4 = { x: 90, y: 50 }
                    const p5 = { x: 55, y: 65 }

                    const path = new Path()
                    path.addEdge(p0)
                    path.addSmoothAngleAngle(p1, p2, p3)
                    path.addEdge(p4)
                    scene.addShape(path)
                    expect(path.toInternalString()).to.equal(`E ${p(p0)} SAA ${p(p1)} ${p(p2)} ${p(p3)} E ${p(p4)}`)

                    scene.selectEditTool()
                    scene.pointerClickAt(p0)
                    expect(Tool.selection.has(path)).to.be.true
                    expect(scene.hasAnchorAt(p0)).to.be.true
                    expect(scene.hasAnchorAt(p2)).to.be.true
                    expect(scene.hasAnchorAt(p4)).to.be.true
                    expect(scene.getAnchorHandleCount()).to.deep.equal([3, 0])

                    // WHEN anchor is moved from p2 to p5
                    const e = scene.shapeeditor.shadowRoot!.elementFromPoint(p2.x, p2.y)! as SVGElement
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
                    const scene = new ShapeEditorScene()

                    const p0 = { x: 10, y: 50 }
                    let p1 = { x: 40, y: 20 }
                    let p2 = { x: 50, y: 50 }
                    let p3: PointLike = pointMinusPoint(p2, pointMultiplyNumber(pointMinusPoint(p1, p2), 2))
                    const p4 = { x: 90, y: 50 }
                    const p5 = { x: 55, y: 165 }

                    const path = new Path()
                    path.addEdge(p0)
                    path.addSmoothAngleAngle(p1, p2, p3)
                    path.addEdge(p4)
                    scene.addShape(path)
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
                    const e = scene.shapeeditor.shadowRoot!.elementFromPoint(p1.x, p1.y)! as SVGElement
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
                    const scene = new ShapeEditorScene()

                    const p0 = { x: 10, y: 50 }
                    let p2 = { x: 50, y: 50 }
                    let p3 = { x: 70, y: 60 }
                    let p1: PointLike = pointMinusPoint(p2, pointMultiplyNumber(pointMinusPoint(p3, p2), 2))
                    const p4 = { x: 90, y: 50 }
                    const p5 = { x: 55, y: 165 }

                    const path = new Path()
                    path.addEdge(p0)
                    path.addSmoothAngleAngle(p1, p2, p3)
                    path.addEdge(p4)
                    scene.addShape(path)
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
                    const e = scene.shapeeditor.shadowRoot!.elementFromPoint(p3.x, p3.y)! as SVGElement
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
                    const scene = new ShapeEditorScene()

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
                    scene.addShape(path)
                    expect(path.toInternalString()).to.equal(`E ${p(p0)} AA ${p(p1)} ${p(p2)} ${p(p3)} E ${p(p4)}`)

                    scene.selectEditTool()
                    scene.pointerClickAt(p0)
                    expect(Tool.selection.has(path)).to.be.true

                    const e = scene.shapeeditor.shadowRoot!.elementFromPoint(p2.x, p2.y)! as SVGElement
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
                    const scene = new ShapeEditorScene()

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
                    scene.addShape(path)
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

                    const e = scene.shapeeditor.shadowRoot!.elementFromPoint(p1.x, p1.y)! as SVGElement
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
                    const scene = new ShapeEditorScene()

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
                    scene.addShape(path)
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

                    const e = scene.shapeeditor.shadowRoot!.elementFromPoint(p1.x, p1.y)! as SVGElement
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
            it("click on path segment adds anchor")
            describe("pointer actions to move from ANGLE_ANGLE -> SMOOTH -> SYMMETRIC", function () {
                it("ANGLE_ANGLE when both handles are in line may convert to SMOOTH")
                // indicate it
                // on release convert to smooth
                // using backward handle
                // using forward forward handle
                it("SMOOTH, when both handles are same distance, may convert to SYMMETRIC")
                // using backward handle
                // using forward forward handle
            })
            describe("pointer action to move from SYMMETRIC -> SMOOTH -> ANGLE_ANGLE", function () {
                it("SYMMETRIC, drag from anchor becomes SMOOTH")
                // using backward handle
                // using forward forward handle
                it("SMOOTH drag from anchor becomes ANGLE_ANGLE")
                // using backward handle
                // using forward forward handle
            })
        })
    })
})

function p(point: PointLike) {
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
