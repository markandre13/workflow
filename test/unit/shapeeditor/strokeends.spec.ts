import { describe, it, expect, beforeEach } from "vitest"
import { OptionModel } from "toad.js/appkit/OptionModel"

import { Rectangle } from "client/shapes"
import { Layer, ShapeEditor } from "client/shapeeditor"
import { LocalDrawingModel } from "client/shapeeditor/LocalDrawingModel"
import { Tool } from "client/shapetools"
import { ShapeSelectionModel } from "client/shapeeditor/ShapeSelectionModel"
import { StrokeEndType } from "shared/workflow"

let nextId = 1

function strokeEndModel() {
    return new OptionModel(StrokeEndType.NONE, [
        [StrokeEndType.NONE, "none"],
        [StrokeEndType.SIMPLE, "simple"],
        [StrokeEndType.FILLED, "filled"],
    ])
}

function rectangle(): Rectangle {
    return new Rectangle({ id: nextId++, origin: { x: 0, y: 0 }, size: { width: 10, height: 10 } })
}

describe("stroke ends follow the selection", () => {
    beforeEach(() => {
        // a new selection drops the listeners of the editors created by earlier tests
        Tool.selection = new ShapeSelectionModel()
    })

    it("selecting a single shape sets the stroke end models to its stroke ends", () => {
        const strokeStart = strokeEndModel()
        const strokeEnd = strokeEndModel()
        const editor = new ShapeEditor({ strokeStart, strokeEnd })
        const model = new LocalDrawingModel()
        model.layers.push(new Layer())
        editor.setModel(model)

        const shape = rectangle()
        shape.strokeStart = StrokeEndType.FILLED
        shape.strokeEnd = StrokeEndType.SIMPLE
        editor.addShape(shape)

        Tool.selection.set(shape)

        expect(strokeStart.value).to.equal(StrokeEndType.FILLED)
        expect(strokeEnd.value).to.equal(StrokeEndType.SIMPLE)
    })

    it("a shape without stroke ends selects NONE", () => {
        const strokeStart = strokeEndModel()
        const strokeEnd = strokeEndModel()
        const editor = new ShapeEditor({ strokeStart, strokeEnd })
        const model = new LocalDrawingModel()
        model.layers.push(new Layer())
        editor.setModel(model)

        const shape = rectangle()
        editor.addShape(shape)

        strokeStart.value = StrokeEndType.SIMPLE
        Tool.selection.set(shape)

        expect(strokeStart.value).to.equal(StrokeEndType.NONE)
        expect(strokeEnd.value).to.equal(StrokeEndType.NONE)
    })

    it("selecting several shapes leaves the stroke end models unchanged", () => {
        const strokeStart = strokeEndModel()
        const strokeEnd = strokeEndModel()
        const editor = new ShapeEditor({ strokeStart, strokeEnd })
        const model = new LocalDrawingModel()
        model.layers.push(new Layer())
        editor.setModel(model)

        const first = rectangle()
        const second = rectangle()
        first.strokeStart = StrokeEndType.FILLED
        editor.addShape(first)
        editor.addShape(second)

        strokeStart.value = StrokeEndType.SIMPLE
        Tool.selection.set(first)
        Tool.selection.add(second)

        expect(strokeStart.value).to.equal(StrokeEndType.FILLED)
        expect(strokeEnd.value).to.equal(StrokeEndType.NONE)
    })
})
