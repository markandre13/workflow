import { expect } from '@esm-bundle/chai'

import { Path } from "client/figures/Path"
import { mirrorPoint } from "shared/geometry"

// E EA AE AA S


// invalid if last
// EA
// AA
// S

// valid permutations with two anchors
// E E ✔
// E AE  ✔
// EA E  ✔
// EA AE  ✔

// valid permutations with three anchors

// valid last E AE S?

describe("figures", function () {
    describe("Path", function () {
        const p0 = { x: 10, y: 20 }
        const p1 = { x: 30, y: 40 }
        const p2 = { x: 50, y: 60 }
        const p3 = { x: 70, y: 80 }
        const p4 = { x: 90, y: 100 }
        const p5 = { x: 110, y: 120 }
        const p6 = { x: 130, y: 140 }
        describe("create SVG Path", function () {
            describe("one anchor", function() {
                it("E -> M", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    expect(path.toPathString()).to.equal("M 10 20")
                })
            })
            describe("two anchors front", function () {
                it("E E -> M L", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdge(p1)
                    expect(path.toPathString()).to.equal("M 10 20 L 30 40")
                })
                it("E AE -> M C", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleEdge(p1, p2)
                    expect(path.toPathString()).to.equal("M 10 20 C 10 20 30 40 50 60")
                })
                it("EA E -> M C", function () {
                    const path = new Path()
                    path.addEdgeAngle(p0, p1)
                    path.addEdge(p2)
                    expect(path.toPathString()).to.equal("M 10 20 C 30 40 50 60 50 60")
                })
                it("EA AE -> M C", function () {
                    const path = new Path()
                    path.addEdgeAngle(p0, p1)
                    path.addAngleEdge(p2, p3)
                    expect(path.toPathString()).to.equal("M 10 20 C 30 40 50 60 70 80")
                })
            })
            // FIXME: add a final E to check that the pointer is incremented correctly... maybe by adding a final edge and checking toPathString again
            describe("two anchors middle", function() {
                // E E E skipped
                it("E EA E -> M L C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdgeAngle(p1, p2)
                    path.addEdge(p3)
                    expect(path.toPathString()).to.equal("M 10 20 L 30 40 C 50 60 70 80 70 80")
                })
                it("E AE E -> M C L", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleEdge(p1, p2)
                    path.addEdge(p3)
                    expect(path.toPathString()).to.equal("M 10 20 C 10 20 30 40 50 60 L 70 80")
                })
                it("E AA E -> M C L", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleAngle(p1, p2, p3)
                    path.addEdge(p4)
                    expect(path.toPathString()).to.equal("M 10 20 C 10 20 30 40 50 60 C 70 80 90 100 90 100")
                })
                it("E S E -> M C L", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addSmooth(p1, p2)
                    path.addEdge(p3)
                    const m = mirrorPoint(p2, p1)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C ${m.x} ${m.y} 70 80 70 80`)
                })

                /////////////////////////////

                it("E EA AE -> M L C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdgeAngle(p1, p2)
                    path.addEdge(p3)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 50 60 70 80 70 80`)
                })

                it("E AE AE -> M C C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleEdge(p1, p2)
                    path.addAngleEdge(p3, p4)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 50 60 70 80 90 100`)
                })

                it("E AA AE -> M C C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleAngle(p1, p2, p3)
                    path.addAngleEdge(p4, p5)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 70 80 90 100 110 120`)
                })

                it("E S AE -> M C C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addSmooth(p1, p2)
                    path.addAngleEdge(p3, p4)
                    const m = mirrorPoint(p2, p1)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C ${m.x} ${m.y} 70 80 90 100`)
                })

                /////////////////////////////

                it("E EA EA -> M C C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdgeAngle(p1, p2)
                    path.addEdgeAngle(p3, p4)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 50 60 70 80 70 80`)
                })
                it("E AE EA -> M C L", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleEdge(p1, p2)
                    path.addEdgeAngle(p3, p4)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 L 70 80`)
                })
                it("E AA EA -> M C C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleAngle(p1, p2, p3)
                    path.addEdgeAngle(p4, p5)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 70 80 90 100 90 100`)
                })
                it("E S EA -> M C C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addSmooth(p1, p2)
                    path.addEdgeAngle(p3, p4)
                    const m = mirrorPoint(p2, p1)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C ${m.x} ${m.y} 70 80 70 80`)
                })

                /////////////////////////////

                it("E EA AA -> M L C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdgeAngle(p1, p2)
                    path.addAngleAngle(p3, p4, p5)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 50 60 70 80 90 100`)
                })
                it("E AE AA -> M C C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleEdge(p1, p2)
                    path.addAngleAngle(p3, p4, p5)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 50 60 70 80 90 100`)
                })
                it("E AA AA -> M C C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleAngle(p1, p2, p3)
                    path.addAngleAngle(p4, p5, p6)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 70 80 90 100 110 120`)
                })
                it("E S AA -> M C C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addSmooth(p1, p2)
                    path.addAngleAngle(p3, p4, p5)
                    const m = mirrorPoint(p2, p1)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C ${m.x} ${m.y} 70 80 90 100`)
                })

                /////////////////////////////

                it("E EA S -> M L C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdgeAngle(p1, p2)
                    path.addSmooth(p3, p4)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 50 60 70 80 90 100`)
                })
                it("E AE S -> M C C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleEdge(p1, p2)
                    path.addSmooth(p3, p4)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 50 60 70 80 90 100`)
                })
                it("E AA S -> M C C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleAngle(p1, p2, p3)
                    path.addSmooth(p4, p5)
                    const m = mirrorPoint(p4, p5)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 70 80 ${m.x} ${m.y} 90 100`)
                })
                it("E S S -> M C C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addSmooth(p1, p2)
                    path.addSmooth(p3, p4)
                    const m = mirrorPoint(p2, p1)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C ${m.x} ${m.y} 70 80 90 100`)
                })

                /////////////////////////////

                describe("old", function() {
                    it("EA EA E -> M C C", function() {
                        const path = new Path()
                        path.addEdgeAngle(p0, p1)
                        path.addEdgeAngle(p2, p3)
                        path.addEdge(p4)
                        expect(path.toPathString()).to.equal("M 10 20 C 30 40 50 60 50 60 C 70 80 90 100 90 100")
                    })
                    it("EA AA E -> M C C", function() {
                        const path = new Path()
                        path.addEdgeAngle(p0, p1)
                        path.addAngleAngle(p2, p3, p4)
                        path.addEdge(p5)
                        expect(path.toPathString()).to.equal("M 10 20 C 30 40 50 60 70 80 C 90 100 110 120 110 120")
                    })
                    it("EA AE E -> M C L", function() {
                        const path = new Path()
                        path.addEdgeAngle(p0, p1)
                        path.addAngleEdge(p2, p3)
                        path.addEdge(p4)
                        expect(path.toPathString()).to.equal("M 10 20 C 30 40 50 60 70 80 L 90 100")
                    })
                    it("EA S E -> M C L", function() {
                        const path = new Path()
                        path.addEdgeAngle(p0, p1)
                        path.addSmooth(p2, p3)
                        path.addEdge(p4)
                        const m = mirrorPoint(p3, p2)
                        expect(path.toPathString()).to.equal(`M 10 20 C 30 40 50 60 70 80 C ${m.x} ${m.y} 90 100 90 100`)
                    })
                    it("EA EA AE -> M C C", function() {
                        const path = new Path()
                        path.addEdgeAngle(p0, p1)
                        path.addEdgeAngle(p2, p3)
                        path.addAngleEdge(p4, p5)
                        expect(path.toPathString()).to.equal(`M 10 20 C 30 40 50 60 50 60 C 70 80 90 100 110 120`)
                    })
                    it("EA AA AE -> M C C", function() {
                        const path = new Path()
                        path.addEdgeAngle(p0, p1)
                        path.addAngleAngle(p2, p3, p4)
                        path.addAngleEdge(p5, p6)
                        expect(path.toPathString()).to.equal(`M 10 20 C 30 40 50 60 70 80 C 90 100 110 120 130 140`)
                    })
                    it("EA AE AE -> M C C", function() {
                        const path = new Path()
                        path.addEdgeAngle(p0, p1)
                        path.addAngleEdge(p2, p3)
                        path.addAngleEdge(p4, p5)
                        expect(path.toPathString()).to.equal(`M 10 20 C 30 40 50 60 70 80 C 70 80 90 100 110 120`)
                    })


                    it("EA S AE -> M C C", function() {
                        const path = new Path()
                        path.addEdgeAngle(p0, p1)
                        path.addSmooth(p2, p3)
                        path.addAngleEdge(p4, p5)
                        const m = mirrorPoint(p3, p2)
                        expect(path.toPathString()).to.equal(`M 10 20 C 30 40 50 60 70 80 C ${m.x} ${m.y} 90 100 110 120`)
                    })
                    // EA AE S njet
                    // E S S njet
                    it("EA S S -> M C C", function() {
                        const path = new Path()
                        path.addEdgeAngle(p0, p1)
                        path.addSmooth(p2, p3)
                        path.addSmooth(p4, p5)
                        const m = mirrorPoint(p3, p2)
                        expect(path.toPathString()).to.equal(`M 10 20 C 30 40 50 60 70 80 C ${m.x} ${m.y} 90 100 110 120`)
                    })
                })
            })
        })
    })
})