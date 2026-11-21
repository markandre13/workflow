import { expect } from "chai"

import { LocalDrawingModel } from "client/shapeeditor/LocalDrawingModel"
import { Rectangle } from "client/shapes"
import { ShapeEditor, Layer } from "client/shapeeditor"

describe("ShapeEditor", function () {
    describe("arrange", function () {
        it("bring to front", function() {
            const { drawing, layer, editor, shape } = setup()
            drawing.bringToFront(layer, [shape(10), shape(30)])
            expect(svgsToNumbers(editor)).to.deep.equal([1, 3, 0, 2])
        })

        it("bring to back", function() {
            const { drawing, layer, editor, shape } = setup()
            drawing.bringToBack(layer, [shape(20), shape(40)])
            expect(svgsToNumbers(editor)).to.deep.equal([1, 3, 0, 2])
        })

        it("bring forward", function() {
            const { drawing, layer, editor, shape } = setup()
            drawing.bringForward(layer, [shape(10), shape(30)])
            expect(svgsToNumbers(editor)).to.deep.equal([1, 0, 3, 2])
        })

        it("bring backward", function() {
            const { drawing, layer, editor, shape } = setup()
            drawing.bringBackward(layer, [shape(20), shape(40)])
            expect(svgsToNumbers(editor)).to.deep.equal([1, 0, 3, 2])
        })

        function svgsToNumbers(editor: ShapeEditor) {
            const display: number[] = []
            for(let i=0; i<editor.layer!.children.length; ++i)
                display.push(Number.parseInt(editor.layer!.children[i].getAttributeNS("", "d")!.substr(2, 1)))
            return display
        }

        function setup() {
            const drawing = new LocalDrawingModel()
            const layer = new Layer({ id: 1, name: "Layer 1" })
            drawing.layers.push(layer)

            const editor = new ShapeEditor({model: drawing})
            document.body.innerHTML = ""
            document.body.appendChild(editor)

            drawing.add(layer, new Rectangle({ id: 10, origin: { x: 0, y: 0 }, size: { width: 10, height: 10 } }))
            drawing.add(layer, new Rectangle({ id: 20, origin: { x: 1, y: 1 }, size: { width: 10, height: 10 } }))
            drawing.add(layer, new Rectangle({ id: 30, origin: { x: 2, y: 2 }, size: { width: 10, height: 10 } }))
            drawing.add(layer, new Rectangle({ id: 40, origin: { x: 3, y: 3 }, size: { width: 10, height: 10 } }))

            const shape = (id: number) => layer.data.find(s => s.id === id)!
            return { drawing, layer, editor, shape }
        }
    })
})
