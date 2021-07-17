import { expect, use } from "chai"
import chaiEachEqualsSubset = require("./chai-eachequalssubset")
use(chaiEachEqualsSubset)

import { LocalDrawingModel } from "client/figureeditor/LocalDrawingModel"
import { Rectangle } from "client/figures"
import { Layer } from "client/figureeditor"

describe("LocalDrawingModel", function () {
    describe("arrange", function () {
        // FIXME: test DrawingModel's signal!

        it("bring to front", function () {
            const { drawing, layer } = setup()
            drawing.bringToFront(1, [10, 30])
            expect(layer.data).eachEqualsSubset([{ id: 20 }, { id: 40 }, { id: 10 }, { id: 30 }])
        })

        it("bring to front (corner case front element)", function () {
            const { drawing, layer } = setup()
            drawing.bringToFront(1, [40])
            expect(layer.data).eachEqualsSubset([{ id: 10 }, { id: 20 }, { id: 30 }, { id: 40 }])
        })

        it("bring to back", function () {
            const { drawing, layer } = setup()
            drawing.bringToBack(1, [20, 40])
            expect(layer.data).eachEqualsSubset([{ id: 20 }, { id: 40 }, { id: 10 }, { id: 30 }])
        })

        it("bring to back (corner case back element)", function () {
            const { drawing, layer } = setup()
            drawing.bringToBack(1, [10])
            expect(layer.data).eachEqualsSubset([{ id: 10 }, { id: 20 }, { id: 30 }, { id: 40 }])
        })

        it("bring forward", function () {
            const { drawing, layer } = setup()
            drawing.bringForward(1, [10, 30])
            expect(layer.data).eachEqualsSubset([{ id: 20 }, { id: 10 }, { id: 40 }, { id: 30 }])
        })

        it("bring forward (corner case front element)", function () {
            const { drawing, layer } = setup()
            drawing.bringForward(1, [40])
            expect(layer.data).eachEqualsSubset([{ id: 10 }, { id: 20 }, { id: 30 }, { id: 40 }])
        })

        it("bring backward", function () {
            const { drawing, layer } = setup()
            drawing.bringBackward(1, [20, 40])
            expect(layer.data).eachEqualsSubset([{ id: 20 }, { id: 10 }, { id: 40 }, { id: 30 }])
        })

        it("bring backward (corner case back)", function () {
            const { drawing, layer } = setup()
            drawing.bringBackward(1, [10])
            expect(layer.data).eachEqualsSubset([{ id: 10 }, { id: 20 }, { id: 30 }, { id: 40 }])
        })

        function setup() {
            const drawing = new LocalDrawingModel()
            const layer = new Layer({ id: 1, name: "Layer 1" })
            drawing.layers.push(layer)

            drawing.add(1, new Rectangle({ id: 10, origin: { x: 1, y: 0 }, size: { width: 10, height: 10 } }))
            drawing.add(1, new Rectangle({ id: 20, origin: { x: 1, y: 0 }, size: { width: 10, height: 10 } }))
            drawing.add(1, new Rectangle({ id: 30, origin: { x: 1, y: 0 }, size: { width: 10, height: 10 } }))
            drawing.add(1, new Rectangle({ id: 40, origin: { x: 1, y: 0 }, size: { width: 10, height: 10 } }))

            expect(layer.data).eachEqualsSubset([{ id: 10 }, { id: 20 }, { id: 30 }, { id: 40 }])

            return { drawing, layer }
        }
    })
})