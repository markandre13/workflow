import { ORB } from "corba.js"
import { initializeORB } from "client/workflow"
import { LocalDrawingModel } from "client/figureeditor/LocalDrawingModel"
import { Figure, Rectangle, Text } from "client/figures"
import { expect } from "chai"

import {FigureEditorScene} from "./FigureEditorScene"
import { Layer } from "client/figureeditor"

// NOTE: this was originally written to check the get/set of Text's "text" attribute
// and that it works together with corba.js's serialization/deserialization.
//
// Testing wheter getter/setter's work as attributes should be moved into corba.js
// so that a simple test here for setting/getting the value works.
describe("figure serialization/deserialization", function() {

    const orb = new ORB()
    //    orb.debug = 1
    initializeORB(orb)
    const model = new LocalDrawingModel()
    const layer = new Layer()
    model.layers.push(layer)

    function wire(figure: Figure) {
        layer.data.length = 0
    
        layer.data.push(figure)
        // console.log(layer.data[0])
        const output = orb.serialize(layer)
        // console.log(output)
        const input = orb.deserialize(output)
        // console.log(input.data[0])
        return input
    }

    it("Rectangle", function() {
        const figure = new Rectangle({origin: {x: 15, y: 20}, size: {width: 25, height: 30} })
        expect(layer).to.deep.equal(wire(figure))
    })

    it("Text", function() {
        const scene = new FigureEditorScene()
        scene.createTextArea()
        scene.keydown("KeyA")
        scene.keydown("Space")
        scene.keydown("KeyB")

        const textOrig = scene.model.layers[0].data[0] as Text
        const stream = orb.serialize(textOrig)
        const textCopy = orb.deserialize(stream) as Text

        expect(textCopy.text).to.equal("a b")
    })
})
