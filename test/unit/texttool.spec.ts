import { expect, use } from "chai"
import chaiAlmost = require('chai-almost')
use(chaiAlmost())
import chaiSubset = require("chai-subset")
use(chaiSubset)

import { Point, Rectangle } from "shared/geometry"
import { FigureEditorScene } from "./FigureEditorScene"
import { Text } from "client/figures/Text"
import { Tool } from "client/figuretools"

describe("FigureEditor", function() {
    describe("TextTool", function() {
        describe("Area", function() {
            it("create", function() {
                // GIVEN an empty figure editor with TextTool being active
                const scene = new FigureEditorScene()
                scene.selectTextTool()
                expect(scene.model.layers[0].data.length).equals(0)

                // WHEN when we drag a rectangle
                scene.mouseDownAt(new Point(10, 15))
                scene.moveMouseBy(new Point(110, 50))
                scene.mouseUp()

                // THEN we will have a Text figure within this rectangle...
                expect(scene.model.layers[0].data.length).equals(1)
                expect(scene.model.layers[0].data[0]).instanceOf(Text)
                const text = scene.model.layers[0].data[0] as Text
                expect(text).to.containSubset({origin: {x: 10, y: 15}, size: {width: 110, height: 50}})

                // ...and it's selected
                scene.selectionHasRectangle(new Rectangle(10, 15, 110, 50))
                expect(Tool.selection.selection.size).to.equal(1)
                expect(Tool.selection.has(text))
            })
        })
        describe("type text", function() {
            it("type a letter", function() {
                const scene = new FigureEditorScene()
                scene.createTextArea()

                // Text's constructor creates the text source using the initial text. "" in this case
                const text = scene.model.layers[0].data[0] as Text
                const textSource = text.textSource
                // TextSource's constructor breaks down the initial text into word boxes
                const wordBoxes = textSource.wordBoxes
                expect(wordBoxes.length).to.equal(1)
                const word = wordBoxes[0]
                expect(word.word).to.equal("")

                // FigureEditor.updateView() will have called Text's updateSVG() method
                expect(word.svg).instanceOf(SVGTextElement)
                expect(word.svg?.textContent).to.equal("")
                expect(word.ascent).to.almost.equal(0) // not a requirement; our current algorithm can not calculate the ascent of an empty string

                // WHEN we type the letter 'A'
                scene.keydown("A")

                // THEN we should be able to see it in the rectangles upper, left corner
                // NOTE: we haven't checked if the SVG is actually placed correctly within the DOM
                expect(word.ascent).to.not.almost.equal(0) // we now have an ascent
                expect(word.svg?.getAttributeNS("", "x")).to.equal(`${10}`)
                expect(word.svg?.getAttributeNS("", "y")).to.equal(`${15 + word.ascent}`)
                expect(word.word).to.equal("A")
                expect(word.svg?.textContent).to.equal("A")
            })
            it("type two letters", function() {
                const scene = new FigureEditorScene()
                scene.createTextArea()

                scene.keydown("A")
                scene.keydown("B")

                const text = scene.model.layers[0].data[0] as Text
                const word = text.textSource.wordBoxes[0]
                expect(word.word).to.equal("AB")
                expect(word.svg?.textContent).to.equal("AB")
            })
            it("type a blank letter", function() {
                const scene = new FigureEditorScene()
                scene.createTextArea()

                scene.keydown("A")
                scene.keydown(" ")

                const text = scene.model.layers[0].data[0] as Text
                const textSource = text.textSource
                const wordBoxes = textSource.wordBoxes
                expect(wordBoxes.length).to.equal(2)
                expect(wordBoxes[0].word).to.equal("A")
                expect(wordBoxes[1].word).to.equal("")
            })
            it("type two letters separated by a space", function() {
                const scene = new FigureEditorScene()
                scene.createTextArea()

                scene.keydown("A")
                scene.keydown(" ")
                scene.keydown("B")

                const text = scene.model.layers[0].data[0] as Text
                const textSource = text.textSource
                const wordBoxes = textSource.wordBoxes
                expect(wordBoxes.length).to.equal(2)
                expect(wordBoxes[0].word).to.equal("A")
                expect(wordBoxes[0].svg?.textContent).to.equal("A")
                expect(wordBoxes[1].word).to.equal("B")
                expect(wordBoxes[1].svg?.textContent).to.equal("B")
            })
            it("split two letters by inserting a space", function() {
                const scene = new FigureEditorScene()
                scene.createTextArea()
                scene.keydown("A")
                scene.keydown("B")
                scene.sendArrowLeft()
                scene.keydown(" ")

                const text = scene.model.layers[0].data[0] as Text
                const textSource = text.textSource
                const wordBoxes = textSource.wordBoxes
                expect(wordBoxes.length).to.equal(2)
                expect(wordBoxes[0].word).to.equal("A")
                expect(wordBoxes[0].svg?.textContent).to.equal("A")
                expect(wordBoxes[1].word).to.equal("B")
                expect(wordBoxes[1].svg?.textContent).to.equal("B")
            })
        })
        describe("delete text", function() {
            xit("delete", function() {
                const scene = new FigureEditorScene(true)
                scene.createTextArea()
                scene.keydown("A")
                scene.sendArrowLeft()
                // scene.sendDelete()
            })
            // backspace & delete
        })
        describe("cursor", function() {
            it("is visible in a newly created text area", function() {
                const scene = new FigureEditorScene()
                scene.createTextArea()

                const text = scene.model.layers[0].data[0] as Text
                const cursor = text.cursor
                const word = text.textSource.wordBoxes[0]

                expect(cursor.offsetWord).equal(0)
                expect(cursor.offsetChar).equal(0)
                const line = cursor.cursor

                // THEN it's visible
                // FIXME: currently it seems to be hidden behind the selection marker
                expect(line.getAttributeNS("", "x1")).to.equal(`${10.5}`)
                expect(line.getAttributeNS("", "y1")).to.equal(`${15.5}`)
                expect(line.getAttributeNS("", "x2")).to.equal(`${10.5}`)
                expect(line.getAttributeNS("", "y2")).to.equal(`${Math.round(15 + word.size.height) + 0.5}`)
            })
            // TODO: check also that this works for not the 1st line?
            it("it's behind the last typed letter", function() {
                const scene = new FigureEditorScene()
                scene.createTextArea()
                scene.keydown("A")

                const text = scene.model.layers[0].data[0] as Text
                const cursor = text.cursor
                const word = text.textSource.wordBoxes[0]

                expect(cursor.offsetWord).equal(0)
                expect(cursor.offsetChar).equal(1)
                const line = cursor.cursor

                // THEN it's visible
                // FIXME: currently it seems to be hidden behind the selection marker
                expect(line.getAttributeNS("", "x1")).to.equal(`${Math.round(10 + word.size.width) + 0.5}`)
                expect(line.getAttributeNS("", "y1")).to.equal(`${15.5}`)
                expect(line.getAttributeNS("", "x2")).to.equal(`${Math.round(10 + word.size.width) + 0.5}`)
                expect(line.getAttributeNS("", "y2")).to.equal(`${Math.round(15 + word.size.height) + 0.5}`)
            })
            it("move left", function() {
                const scene = new FigureEditorScene()
                scene.createTextArea()
                scene.keydown("A")
                scene.sendArrowLeft()

                const text = scene.model.layers[0].data[0] as Text
                const cursor = text.cursor
                const word = text.textSource.wordBoxes[0]

                expect(cursor.offsetWord).equal(0)
                expect(cursor.offsetChar).equal(0)
                const line = cursor.cursor

                // THEN it's visible
                // FIXME: currently it seems to be hidden behind the selection marker
                expect(line.getAttributeNS("", "x1")).to.equal(`${10.5}`)
                expect(line.getAttributeNS("", "y1")).to.equal(`${15.5}`)
                expect(line.getAttributeNS("", "x2")).to.equal(`${10.5}`)
                expect(line.getAttributeNS("", "y2")).to.equal(`${Math.round(15 + word.size.height) + 0.5}`)
            })
            it("move right", function() {
                const scene = new FigureEditorScene()
                scene.createTextArea()
                scene.keydown("A")
                scene.sendArrowLeft()
                scene.sendArrowRight()

                const text = scene.model.layers[0].data[0] as Text
                const cursor = text.cursor
                const word = text.textSource.wordBoxes[0]

                expect(cursor.offsetWord).equal(0)
                expect(cursor.offsetChar).equal(1)
                const line = cursor.cursor

                // THEN it's visible
                // FIXME: currently it seems to be hidden behind the selection marker
                expect(line.getAttributeNS("", "x1")).to.equal(`${Math.round(10 + word.size.width) + 0.5}`)
                expect(line.getAttributeNS("", "y1")).to.equal(`${15.5}`)
                expect(line.getAttributeNS("", "x2")).to.equal(`${Math.round(10 + word.size.width) + 0.5}`)
                expect(line.getAttributeNS("", "y2")).to.equal(`${Math.round(15 + word.size.height) + 0.5}`)
            })

            // type something, switch to select tool and move, back to text editing: text doesn't update?
            // it does! but it does not take the transformation into consideration!!!

            // is there an HTML/SVG way to handle line distance, paragraph distance, letter spacing, etc.?
            // TEST: disable cursor when switching to another Text
            // TEST: when the cursor leaves the region were words are rendered...

            // next steps:
            // delete & backspace
            // line break/paragraph break
            // unicode line break rules (conditional word separator? CTRL+SPACE was it in MS Word?)
            //   "There are two ways to specify a conditional (allowed) line break: the <wbr> tag, which
            //   is being standardized in HTML5, and the zero width space character (U+200B, &#x200b;)"
            //   &shy; https://en.wikipedia.org/wiki/Soft_hyphen
            // mark region
            // cut/copy/paste
            // text, text area
            // fix the scrollarea's scrollbars
            // zoom in/out, map
            // bezier
            // text in bezier (or not yet)
            // save/load to file
            // save/load in browser
            // distance to outline
            // the signed uuid server idea

            // later steps:
            // bold, italics, font size, ...
            // distance to shape
            // ...
        })
    })
})
