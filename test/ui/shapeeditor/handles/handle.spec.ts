import { expect } from "chai"

import { Rectangle } from "shared/geometry/Rectangle"
import { Point } from "shared/geometry/Point"
import * as shape from "client/shapes"
import { ShapeEditorScene } from "../../../unit/ShapeEditorScene"

describe("shapeeditor", function () {
    describe("handles", function () {
        it("drag left handle of a rectangle", function () {
            const scene = new ShapeEditorScene()
            scene.addRectangle(new Rectangle(50.5, 50.5, 50, 50))

            scene.pointerClickAt(new Point(75, 75))

            scene.pointerDownAt(new Point(48, 50))
            scene.pointerTo(new Point(6, 50))
            scene.pointerUp()

            const x = (scene.shapes[0] as shape.Rectangle).origin.x
            expect(x).to.equal(6)
        })
    })
})
