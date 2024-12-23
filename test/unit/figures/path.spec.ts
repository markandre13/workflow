import { expect } from "chai"

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
        const p9 = { x: 210, y: 220 }
        describe("create SVG Path", function () {
            describe("first anchor", function () {
                it("E ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    expect(path.toPathString()).to.equal("M 10 20")
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal("M 10 20 L 210 220")
                })
                it("AE ...", function () {
                    const path = new Path()
                    path.addAngleEdge(p0, p1)
                    expect(path.toPathString()).to.equal("M 30 40")
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal("M 30 40 L 210 220")
                })
                it("EA ...", function () {
                    const path = new Path()
                    path.addEdgeAngle(p0, p1)
                    expect(path.toPathString()).to.equal("M 10 20")
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal("M 10 20 C 30 40 210 220 210 220")
                })
                it("AA ...", function () {
                    const path = new Path()
                    path.addAngleAngle(p0, p1, p2)
                    expect(path.toPathString()).to.equal("M 30 40")
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal("M 30 40 C 50 60 210 220 210 220")
                })
                it("S ...", function () {
                    const path = new Path()
                    path.addSymmetric(p0, p1)
                    expect(path.toPathString()).to.equal("M 30 40")
                    path.addEdge(p9)
                    const m = mirrorPoint(p1, p0)
                    expect(path.toPathString()).to.equal(`M 30 40 C ${m.x} ${m.y} 210 220 210 220`)
                })
            })

            describe("in between anchors", function () {

                it("... E E ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdge(p1)
                    path.addEdge(p2)
                    expect(path.toPathString()).to.equal("M 10 20 L 30 40 L 50 60")
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal("M 10 20 L 30 40 L 50 60 L 210 220")
                })
                it("... EA E ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdgeAngle(p1, p2)
                    path.addEdge(p3)
                    expect(path.toPathString()).to.equal("M 10 20 L 30 40 C 50 60 70 80 70 80")
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal("M 10 20 L 30 40 C 50 60 70 80 70 80 L 210 220")
                })
                it("... AE E ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleEdge(p1, p2)
                    path.addEdge(p3)
                    expect(path.toPathString()).to.equal("M 10 20 C 10 20 30 40 50 60 L 70 80")
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal("M 10 20 C 10 20 30 40 50 60 L 70 80 L 210 220")
                })
                it("... AA E ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleAngle(p1, p2, p3)
                    path.addEdge(p4)
                    expect(path.toPathString()).to.equal("M 10 20 C 10 20 30 40 50 60 C 70 80 90 100 90 100")
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal("M 10 20 C 10 20 30 40 50 60 C 70 80 90 100 90 100 L 210 220")
                })
                it("... S E ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addSymmetric(p1, p2)
                    path.addEdge(p3)
                    const m = mirrorPoint(p2, p1)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C ${m.x} ${m.y} 70 80 70 80`)
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C ${m.x} ${m.y} 70 80 70 80 L 210 220`)
                })

                /////////////////////////////

                it("... E AE ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdge(p1)
                    path.addAngleEdge(p2, p3)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 30 40 50 60 70 80`)
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 30 40 50 60 70 80 L 210 220`)
                })
                it("... EA AE ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdgeAngle(p1, p2)
                    path.addAngleEdge(p3, p4)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 50 60 70 80 90 100`)
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 50 60 70 80 90 100 L 210 220`)
                })
                it("... AE AE ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleEdge(p1, p2)
                    path.addAngleEdge(p3, p4)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 50 60 70 80 90 100`)
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 50 60 70 80 90 100 L 210 220`)
                })
                it("... AA AE ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleAngle(p1, p2, p3)
                    path.addAngleEdge(p4, p5)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 70 80 90 100 110 120`)
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 70 80 90 100 110 120 L 210 220`)
                })
                it("... S AE ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addSymmetric(p1, p2)
                    path.addAngleEdge(p3, p4)
                    const m = mirrorPoint(p2, p1)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C ${m.x} ${m.y} 70 80 90 100`)
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C ${m.x} ${m.y} 70 80 90 100 L 210 220`)
                })

                /////////////////////////////

                it("... E EA ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdge(p1)
                    path.addEdgeAngle(p2, p3)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 L 50 60`)
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 L 50 60 C 70 80 210 220 210 220`)
                })
                it("... EA EA ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdgeAngle(p1, p2)
                    path.addEdgeAngle(p3, p4)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 50 60 70 80 70 80`)
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 50 60 70 80 70 80 C 90 100 210 220 210 220`)
                })
                it("... AE EA ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleEdge(p1, p2)
                    path.addEdgeAngle(p3, p4)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 L 70 80`)
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 L 70 80 C 90 100 210 220 210 220`)
                })
                it("... AA EA ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleAngle(p1, p2, p3)
                    path.addEdgeAngle(p4, p5)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 70 80 90 100 90 100`)
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 70 80 90 100 90 100 C 110 120 210 220 210 220`)
                })
                it("... S EA ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addSymmetric(p1, p2)
                    path.addEdgeAngle(p3, p4)
                    const m = mirrorPoint(p2, p1)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C ${m.x} ${m.y} 70 80 70 80`)
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C ${m.x} ${m.y} 70 80 70 80 C 90 100 210 220 210 220`)
                })

                /////////////////////////////

                it("... E AA ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdge(p1)
                    path.addAngleAngle(p2, p3, p4)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 30 40 50 60 70 80`)
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 30 40 50 60 70 80 C 90 100 210 220 210 220`)
                })
                it("... EA AA ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdgeAngle(p1, p2)
                    path.addAngleAngle(p3, p4, p5)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 50 60 70 80 90 100`)
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 50 60 70 80 90 100 C 110 120 210 220 210 220`)
                })
                it("... AE AA ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleEdge(p1, p2)
                    path.addAngleAngle(p3, p4, p5)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 50 60 70 80 90 100`)
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 50 60 70 80 90 100 C 110 120 210 220 210 220`)
                })
                it("... AA AA ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleAngle(p1, p2, p3)
                    path.addAngleAngle(p4, p5, p6)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 70 80 90 100 110 120`)
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 70 80 90 100 110 120 C 130 140 210 220 210 220`)
                })
                it("... S AA ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addSymmetric(p1, p2)
                    path.addAngleAngle(p3, p4, p5)
                    const m = mirrorPoint(p2, p1)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C ${m.x} ${m.y} 70 80 90 100`)
                    path.addEdge(p9)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C ${m.x} ${m.y} 70 80 90 100 C 110 120 210 220 210 220`)
                })

                /////////////////////////////

                it("... E S ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdge(p1)
                    path.addSymmetric(p2, p3)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 30 40 50 60 70 80`)
                    path.addEdge(p9)
                    const m = mirrorPoint(p3, p2)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 30 40 50 60 70 80 C ${m.x} ${m.y} 210 220 210 220`)
                })
                it("... EA S ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdgeAngle(p1, p2)
                    path.addSymmetric(p3, p4)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 50 60 70 80 90 100`)
                    path.addEdge(p9)
                    const m = mirrorPoint(p4, p3)
                    expect(path.toPathString()).to.equal(`M 10 20 L 30 40 C 50 60 70 80 90 100 C ${m.x} ${m.y} 210 220 210 220`)
                })
                it("... AE S ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleEdge(p1, p2)
                    path.addSymmetric(p3, p4)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 50 60 70 80 90 100`)
                    path.addEdge(p9)
                    const m = mirrorPoint(p4, p3)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 50 60 70 80 90 100 C ${m.x} ${m.y} 210 220 210 220`)
                })
                it("... AA S ...", function () { 
                    const path = new Path()
                    path.addEdge(p0)
                    path.addAngleAngle(p1, p2, p3)
                    path.addSymmetric(p4, p5)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 70 80 90 100 110 120`)
                    path.addEdge(p9)
                    // console.log(path.toInternalString())
                    const m = mirrorPoint(p5, p4)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C 70 80 90 100 110 120 C ${m.x} ${m.y} 210 220 210 220`)
                })
                it("... S S ...", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addSymmetric(p1, p2)
                    path.addSymmetric(p3, p4)
                    const m0 = mirrorPoint(p2, p1)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C ${m0.x} ${m0.y} 70 80 90 100`)
                    path.addEdge(p9)
                    const m1 = mirrorPoint(p4, p3)
                    expect(path.toPathString()).to.equal(`M 10 20 C 10 20 30 40 50 60 C ${m0.x} ${m0.y} 70 80 90 100 C ${m1.x} ${m1.y} 210 220 210 220`)

                })
            })
            describe("close", function () {
                it("E ... E Z", function () {
                    const path = new Path()
                    path.addEdge(p0)
                    path.addEdge(p1)
                    path.addEdge(p2)
                    path.addClose()
                    expect(path.toPathString()).to.equal("M 10 20 L 30 40 L 50 60 L 10 20 Z")
                })
                it("AE ... EA Z", function () {
                    const path = new Path()
                    path.addAngleEdge(p0, p1)
                    path.addEdge(p2)
                    path.addEdgeAngle(p3, p4)
                    path.addClose()
                    expect(path.toPathString()).to.equal("M 30 40 L 50 60 L 70 80 C 90 100 10 20 30 40 Z")
                })
                // it("AE ... E Z", function () {
                //     const path = new Path()
                //     path.addAngleEdge(p0, p1)
                //     expect(path.toPathString()).to.equal("M 30 40")
                //     path.addEdge(p9)
                //     expect(path.toPathString()).to.equal("M 30 40 L 210 220")
                // })
                // it("EA ... E Z", function () {
                //     const path = new Path()
                //     path.addEdgeAngle(p0, p1)
                //     expect(path.toPathString()).to.equal("M 10 20")
                //     path.addEdge(p9)
                //     expect(path.toPathString()).to.equal("M 10 20 C 30 40 210 220 210 220")
                // })
                // it("AA ... E Z", function () {
                //     const path = new Path()
                //     path.addAngleAngle(p0, p1, p2)
                //     expect(path.toPathString()).to.equal("M 30 40")
                //     path.addEdge(p9)
                //     expect(path.toPathString()).to.equal("M 30 40 C 50 60 210 220 210 220")
                // })
                // it("S ... E Z", function () {
                //     const path = new Path()
                //     path.addSmooth(p0, p1)
                //     expect(path.toPathString()).to.equal("M 30 40")
                //     path.addEdge(p9)
                //     const m = mirrorPoint(p1, p0)
                //     expect(path.toPathString()).to.equal(`M 30 40 C ${m.x} ${m.y} 210 220 210 220`)
                // })
            })
        })
    })
})