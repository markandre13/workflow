import { describe, it, expect, beforeEach } from "vitest"
import { NumberModel } from "toad.js/appkit/NumberModel"

import { Rectangle } from "client/shapes"
import { Layer, ShapeEditor } from "client/shapeeditor"
import { LocalDrawingModel } from "client/shapeeditor/LocalDrawingModel"
import { Tool } from "client/shapetools"
import { ShapeSelectionModel } from "client/shapeeditor/ShapeSelectionModel"

let nextId = 1

function rectangle(): Rectangle {
    return new Rectangle({ id: nextId++, origin: { x: 0, y: 0 }, size: { width: 10, height: 10 } })
}

describe("stroke width follows the selection", () => {
    beforeEach(() => {
        // a new selection drops the listeners of the editors created by earlier tests
        Tool.selection = new ShapeSelectionModel()
    })

    it("changing the stroke width sets it on the selected shapes", () => {
        const strokeWidth = new NumberModel(1, { min: 1, max: 32, step: 1 })
        const editor = new ShapeEditor({ strokeWidth })
        const model = new LocalDrawingModel()
        model.layers.push(new Layer())
        editor.setModel(model)

        const first = rectangle()
        const second = rectangle()
        editor.addShape(first)
        editor.addShape(second)
        Tool.selection.set(first)
        Tool.selection.add(second)

        strokeWidth.value = 4

        expect(first.strokeWidth).to.equal(4)
        expect(second.strokeWidth).to.equal(4)
    })

    it("selecting a single shape sets the stroke width model to its width", () => {
        const strokeWidth = new NumberModel(1, { min: 1, max: 32, step: 1 })
        const editor = new ShapeEditor({ strokeWidth })
        const model = new LocalDrawingModel()
        model.layers.push(new Layer())
        editor.setModel(model)

        const shape = rectangle()
        shape.strokeWidth = 6
        editor.addShape(shape)

        Tool.selection.set(shape)

        expect(strokeWidth.value).to.equal(6)
    })

    it("a shape keeps its width when the selection changes to several shapes", () => {
        const strokeWidth = new NumberModel(1, { min: 1, max: 32, step: 1 })
        const editor = new ShapeEditor({ strokeWidth })
        const model = new LocalDrawingModel()
        model.layers.push(new Layer())
        editor.setModel(model)

        const first = rectangle()
        first.strokeWidth = 3
        const second = rectangle()
        editor.addShape(first)
        editor.addShape(second)
        Tool.selection.set(first)
        Tool.selection.add(second)

        expect(first.strokeWidth).to.equal(3)
        expect(second.strokeWidth).to.equal(1)
    })
})
