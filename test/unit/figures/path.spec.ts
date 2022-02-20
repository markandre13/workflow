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
            describe("valid permutations with two anchors", function () {
                it("E -> M", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    expect(path.toPathString()).to.equal("M 10 20")
                })
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
            describe("valid permutations with three anchors", function() {
                it("E EA E -> M L C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdgeAngle(p1, p2)
                    path.addEdge(p3)
                    expect(path.toPathString()).to.equal("M 10 20 L 30 40 C 50 60 70 80 70 80")
                })
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
                it("E AE E -> M C L", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleEdge(p1, p2)
                    path.addEdge(p3)
                    expect(path.toPathString()).to.equal("M 10 20 C 10 20 30 40 50 60 L 70 80")
                })
                it("EA AE E -> M C L", function() {
                    const path = new Path()
                    path.addEdgeAngle(p0, p1)
                    path.addAngleEdge(p2, p3)
                    path.addEdge(p4)
                    expect(path.toPathString()).to.equal("M 10 20 C 30 40 50 60 70 80 L 90 100")
                })
                xit("E S E -> M C L", function() {
                    // illegal
                    // const path = new Path()
                    // path.addEdge(p0)
                    // path.addSmooth(p1, p2)
                    // path.addEdge(p3)
                    // expect(path.toPathString()).to.equal("M 10 20 C 30 40 50 60 70 80 L 90 100")
                })
                it("EA S E -> M C L", function() {
                    const path = new Path()
                    path.addEdgeAngle(p0, p1)
                    path.addSmooth(p2, p3)
                    path.addEdge(p4)
                    const m = mirrorPoint(p2, p3)
                    expect(path.toPathString()).to.equal(`M 10 20 C 30 40 ${m.x} ${m.y} 50 60 C 70 80 90 100 90 100`)
                })
                it("E EA AE -> M L C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdgeAngle(p1, p2)
                    path.addEdge(p3)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 50 60 70 80 70 80`)
                })
                it("EA EA AE -> M C C", function() {
                    const path = new Path()
                    path.addEdgeAngle(p0, p1)
                    path.addEdgeAngle(p2, p3)
                    path.addAngleEdge(p4, p5)
                    expect(path.toPathString()).to.equal(`M 10 20 C 30 40 50 60 50 60 C 70 80 90 100 110 120`)
                })
                it("E AA AE -> M C C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleAngle(p1, p2, p3)
                    path.addAngleEdge(p4, p5)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 70 80 90 100 110 120`)
                })
                it("EA AA AE -> M C C", function() {
                    const path = new Path()
                    path.addEdgeAngle(p0, p1)
                    path.addAngleAngle(p2, p3, p4)
                    path.addAngleEdge(p5, p6)
                    expect(path.toPathString()).to.equal(`M 10 20 C 30 40 50 60 70 80 C 90 100 110 120 130 140`)
                })
                it("E AE AE -> M C C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleEdge(p1, p2)
                    path.addAngleEdge(p3, p4)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 50 60 70 80 90 100`)
                })
                it("EA AE AE -> M C C", function() {
                    const path = new Path()
                    path.addEdgeAngle(p0, p1)
                    path.addAngleEdge(p2, p3)
                    path.addAngleEdge(p4, p5)
                    expect(path.toPathString()).to.equal(`M 10 20 C 30 40 50 60 70 80 C 70 80 90 100 110 120`)
                })
                xit("E S AE -> M C C", function() {
                    // illegal
                    const path = new Path()
                    path.addEdge(p0)
                    path.addSmooth(p1, p2)
                    path.addAngleEdge(p3, p4)
                    const m = mirrorPoint(p3, p2)
                    expect(path.toPathString()).to.equal(`M 10 20 C 30 40 50 60 70 80 C ${m.x} ${m.y} 90 100 110 120`)
                })
                it("EA S AE -> M C C", function() {
                    const path = new Path()
                    path.addEdgeAngle(p0, p1)
                    path.addSmooth(p2, p3)
                    path.addAngleEdge(p4, p5)
                    const m = mirrorPoint(p2, p3)
                    expect(path.toPathString()).to.equal(`M 10 20 C 30 40 ${m.x} ${m.y} 50 60 C 70 80 90 100 110 120`)
                })
                it("E EA S -> M L C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdgeAngle(p1, p2)
                    path.addSmooth(p3, p4)
                    const m = mirrorPoint(p3, p4)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 50 60 ${m.x} ${m.y} 70 80`)
                })
                // EA EA S njet
                it("E AA S -> M C C", function() {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleAngle(p1, p2, p3)
                    path.addSmooth(p4, p5)
                    const m = mirrorPoint(p4, p5)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 70 80 ${m.x} ${m.y} 90 100`)
                })
                // EA AA S njet
                xit("E AE S -> M C C", function() {
                    // illegal
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleEdge(p1, p2)
                    path.addSmooth(p4, p5)
                    const m = mirrorPoint(p4, p5)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 70 80 ${m.x} ${m.y} 90 100`)
                })
                // EA AE S njet
                // E S S njet
                it("EA S S -> M C C", function() {
                    const path = new Path()
                    path.addEdgeAngle(p0, p1)
                    path.addSmooth(p2, p3)
                    path.addSmooth(p4, p5)
                    const m0 = mirrorPoint(p2, p3)
                    const m1 = mirrorPoint(p4, p5)
                    expect(path.toPathString()).to.equal(`M 10 20 C 30 40 ${m0.x} ${m0.y} 50 60 C 70 80 ${m1.x} ${m1.y} 90 100`)
                })
            })
        })
        describe("illegal anchors", function () {
            xit("AE -> error", function () {
                const path = new Path()
                const p0 = { x: 10, y: 20 }
                const p1 = { x: 30, y: 40 }
                path.addAngleEdge(p0, p1)
            })
            xit("AA -> error", function () {
                const path = new Path()
                const p0 = { x: 10, y: 20 }
                const p1 = { x: 30, y: 40 }
                path.addAngleEdge(p0, p1)
            })
            xit("S -> error", function () {
                const path = new Path()
                const p0 = { x: 10, y: 20 }
                const p1 = { x: 30, y: 40 }
                path.addSmooth(p0, p1)
            })
        })
    })
})