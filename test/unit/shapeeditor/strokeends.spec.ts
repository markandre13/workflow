import { describe, it, expect, beforeEach } from "vitest"
import { OptionModel } from "toad.js/appkit/OptionModel"

import { Rectangle } from "client/shapes"
import { Layer, ShapeEditor } from "client/shapeeditor"
import { LocalDrawingModel } from "client/shapeeditor/LocalDrawingModel"
import { Tool } from "client/shapetools"
import { ShapeSelectionModel } from "client/shapeeditor/ShapeSelectionModel"
import { Path } from "client/shapes/Path"
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

describe("Path shows its stroke ends when they change", () => {
    it("adding and removing stroke ends replaces the element in the layer", () => {
        const layer = document.createElementNS("http://www.w3.org/2000/svg", "g")
        document.body.append(layer)
        const path = new Path()
        path.addEdge({ x: 10, y: 20 })
        path.addEdge({ x: 100, y: 20 })
        const raw = path.getPath()

        const plain = path.updateSVG(raw, layer, undefined)
        layer.appendChild(plain)

        path.strokeEnd = StrokeEndType.SIMPLE
        const withEnd = path.updateSVG(raw, layer, plain)
        expect(withEnd).to.be.instanceOf(SVGGElement)
        expect(Array.from(layer.children)).to.deep.equal([withEnd])

        path.strokeEnd = undefined
        const without = path.updateSVG(raw, layer, withEnd)
        expect(without).to.be.instanceOf(SVGPathElement)
        expect(Array.from(layer.children)).to.deep.equal([without])

        layer.remove()
    })
})

describe("LocalDrawingModel emits only on change", () => {
    it("setStrokeEnds emits when a stroke end changes but not when it stays the same", () => {
        const model = new LocalDrawingModel()
        const layer = new Layer()
        model.layers.push(layer)
        const shape = rectangle()
        shape.strokeStart = StrokeEndType.FILLED
        layer.data.push(shape)
        let emits = 0
        model.signal.add(() => emits++)

        model.setStrokeEnds(layer.id, [shape.id], StrokeEndType.FILLED, undefined)
        expect(emits).to.equal(0)

        model.setStrokeEnds(layer.id, [shape.id], StrokeEndType.SIMPLE, undefined)
        expect(emits).to.equal(1)
    })

    it("setStrokeAndFill emits when the stroke changes but not when it stays the same", () => {
        const model = new LocalDrawingModel()
        const layer = new Layer()
        model.layers.push(layer)
        const shape = rectangle()
        shape.stroke = "#000"
        shape.fill = "#fff"
        layer.data.push(shape)
        let emits = 0
        model.signal.add(() => emits++)

        model.setStrokeAndFill(layer.id, [shape.id], "#000", "#fff")
        expect(emits).to.equal(0)

        model.setStrokeAndFill(layer.id, [shape.id], "#f00", "#fff")
        expect(emits).to.equal(1)
    })
})

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
