import { expect, use } from "chai"
import chaiEachEqualsSubset = require("./chai-eachequalssubset")
use(chaiEachEqualsSubset)

import { LocalDrawingModel } from "client/figureeditor/LocalDrawingModel"
import { LocalLayer } from "client/figureeditor/LocalLayer"
import { Rectangle } from "client/figures"

describe("LocalDrawingModel", function () {
    describe("arrange", function () {
        // FIXME: test DrawingModel's signal!

        it("bring to front", function () {
            const { drawing, layer } = setup()
            drawing.bringToFront(1, [0, 2])
            expect(layer.data).eachEqualsSubset([{ id: 1 }, { id: 3 }, { id: 0 }, { id: 2 }])
        })

        it("bring to front (corner case front element)", function () {
            const { drawing, layer } = setup()
            drawing.bringToFront(1, [3])
            expect(layer.data).eachEqualsSubset([{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }])
        })

        it("bring to back", function () {
            const { drawing, layer } = setup()
            drawing.bringToBack(1, [1, 3])
            expect(layer.data).eachEqualsSubset([{ id: 1 }, { id: 3 }, { id: 0 }, { id: 2 }])
        })

        it("bring to back (corner case back element)", function () {
            const { drawing, layer } = setup()
            drawing.bringToBack(1, [0])
            expect(layer.data).eachEqualsSubset([{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }])
        })

        it("bring forward", function () {
            const { drawing, layer } = setup()
            drawing.bringForward(1, [0, 2])
            expect(layer.data).eachEqualsSubset([{ id: 1 }, { id: 0 }, { id: 3 }, { id: 2 }])
        })

        it("bring forward (corner case front element)", function () {
            const { drawing, layer } = setup()
            drawing.bringForward(1, [3])
            expect(layer.data).eachEqualsSubset([{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }])
        })

        it("bring backward", function () {
            const { drawing, layer } = setup()
            drawing.bringBackward(1, [1, 3])
            expect(layer.data).eachEqualsSubset([{ id: 1 }, { id: 0 }, { id: 3 }, { id: 2 }])
        })

        it("bring backward (corner case back)", function () {
            const { drawing, layer } = setup()
            drawing.bringBackward(1, [0])
            expect(layer.data).eachEqualsSubset([{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }])
        })

        function setup() {
            const drawing = new LocalDrawingModel()
            const layer = new LocalLayer({ id: 1, name: "Layer 1" })
            drawing.layers.push(layer)

            drawing.add(1, new Rectangle({ origin: { x: 1, y: 0 }, size: { width: 10, height: 10 } }))
            drawing.add(1, new Rectangle({ origin: { x: 1, y: 0 }, size: { width: 10, height: 10 } }))
            drawing.add(1, new Rectangle({ origin: { x: 1, y: 0 }, size: { width: 10, height: 10 } }))
            drawing.add(1, new Rectangle({ origin: { x: 1, y: 0 }, size: { width: 10, height: 10 } }))

            expect(layer.data).eachEqualsSubset([{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }])

            return { drawing, layer }
        }
    })
})