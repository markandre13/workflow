import { expect } from "chai"

import { Rectangle } from "shared/geometry/Rectangle"
import { Point } from "shared/geometry/Point"
import * as figure from "client/figures"
import { FigureEditorScene } from "../../../unit/FigureEditorScene"

describe("figureeditor", function () {
    describe("handles", function () {
        it("drag left handle of a rectangle", function () {
            const scene = new FigureEditorScene()
            scene.addRectangle(new Rectangle(50.5, 50.5, 50, 50))

            scene.pointerClickAt(new Point(75, 75))

            scene.pointerDownAt(new Point(48, 50))
            scene.pointerTo(new Point(6, 50))
            scene.pointerUp()

            const x = (scene.figures[0] as figure.Rectangle).origin.x
            expect(x).to.equal(6)
        })
    })
})
