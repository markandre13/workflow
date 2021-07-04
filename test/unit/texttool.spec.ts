import { expect, use } from "chai"
import chaiAlmost = require('chai-almost')
use(chaiAlmost())
import chaiSubset = require("chai-subset")
use(chaiSubset)

import { Point, Rectangle } from "shared/geometry"
import { FigureEditorScene } from "./FigureEditorScene"
import { Text } from "client/figures/Text"
import { Tool } from "client/figuretools"

describe("FigureEditor", function () {
    describe("TextTool", function () {
        describe("Area", function () {
            it("create", function () {
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
                expect(text).to.containSubset({ origin: { x: 10, y: 15 }, size: { width: 110, height: 50 } })

                // ...and it's selected
                scene.selectionHasRectangle(new Rectangle(10, 15, 110, 50))
                expect(Tool.selection.selection.size).to.equal(1)
                expect(Tool.selection.has(text))
            })
        })
        describe("type text", function () {
            it("type a letter", function () {
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
                scene.keydown("KeyA")

                // THEN we should be able to see it in the rectangles upper, left corner
                // NOTE: we haven't checked if the SVG is actually placed correctly within the DOM
                expect(word.ascent).to.not.almost.equal(0) // we now have an ascent
                expect(word.svg?.getAttributeNS("", "x")).to.equal(`${10}`)
                expect(word.svg?.getAttributeNS("", "y")).to.equal(`${15 + word.ascent}`)
                expect(word.word).to.equal("a")
                expect(word.svg?.textContent).to.equal("a")
            })
            it("type two letters", function () {
                const scene = new FigureEditorScene()
                scene.createTextArea()

                scene.keydown("KeyA")
                scene.keydown("KeyB")

                const text = scene.model.layers[0].data[0] as Text
                const editor = scene.textTool.texteditor
                const word = text.textSource.wordBoxes[0]
                expect(word.word).to.equal("ab")
                expect(word.svg?.textContent).to.equal("ab")

                // caret at correct position
                expect(editor.offsetWord).to.equal(0)
                expect(editor.offsetChar).to.equal(2)
            })
            it("type a blank letter", function () {
                const scene = new FigureEditorScene()
                scene.createTextArea()

                scene.keydown("KeyA")
                scene.keydown("Space")

                const text = scene.model.layers[0].data[0] as Text
                const textSource = text.textSource
                const wordBoxes = textSource.wordBoxes
                expect(wordBoxes.length).to.equal(2)
                expect(wordBoxes[0].word).to.equal("a")
                expect(wordBoxes[1].word).to.equal("")
            })
            it("type two letters separated by a space", function () {
                const scene = new FigureEditorScene()
                scene.createTextArea()

                scene.keydown("KeyA")
                scene.keydown("Space")
                scene.keydown("KeyB")

                const text = scene.model.layers[0].data[0] as Text
                const editor = scene.textTool.texteditor
                const textSource = text.textSource
                const wordBoxes = textSource.wordBoxes
                expect(wordBoxes.length).to.equal(2)
                expect(wordBoxes[0].word).to.equal("a")
                expect(wordBoxes[0].svg?.textContent).to.equal("a")
                expect(wordBoxes[1].word).to.equal("b")
                expect(wordBoxes[1].svg?.textContent).to.equal("b")

                // caret at correct position
                expect(editor.offsetWord).to.equal(1)
                expect(editor.offsetChar).to.equal(1)
            })
            it("split two letters by inserting a space", function () {
                const scene = new FigureEditorScene()
                scene.createTextArea()
                scene.keydown("KeyA")
                scene.keydown("KeyB")
                scene.keydown("ArrowLeft")
                scene.keydown("Space")

                const text = scene.model.layers[0].data[0] as Text
                const editor = scene.textTool.texteditor
                const textSource = text.textSource
                const wordBoxes = textSource.wordBoxes

                expect(wordBoxes.length).to.equal(2)
                expect(wordBoxes[0].word).to.equal("a")
                expect(wordBoxes[0].svg?.textContent).to.equal("a")
                expect(wordBoxes[1].word).to.equal("b")
                expect(wordBoxes[1].svg?.textContent).to.equal("b")

                // caret at correct position
                expect(editor.offsetWord).to.equal(1)
                expect(editor.offsetChar).to.equal(0)
            })
            it("insert deletes selected text", function () {
                const scene = new FigureEditorScene()
                scene.createTextArea()
                scene.keydown("KeyA")
                scene.keydown("KeyB")
                scene.keydown("KeyC")
                scene.keydown("KeyD")

                scene.keydown("Home")
                scene.keydown("ArrowRight")
                scene.keydown("ArrowRight", { shift: true })
                scene.keydown("ArrowRight", { shift: true })

                scene.keydown("KeyX")

                const text = scene.model.layers[0].data[0] as Text
                const editor = scene.textTool.texteditor
                const textSource = text.textSource
                const wordBoxes = textSource.wordBoxes

                console.log(wordBoxes)

                expect(wordBoxes.length).to.equal(1)
                expect(wordBoxes[0].word).to.equal("axd")
                expect(wordBoxes[0].svg?.textContent).to.equal("axd")

                // no selection
                expect(editor.hasSelection()).to.be.false

                // caret at correct position
                expect(editor.offsetWord).to.equal(0)
                expect(editor.offsetChar).to.equal(2)
            })
        })
        describe("delete text", function () {
            describe("no selection", function () {
                it("delete first character", function () {
                    const scene = new FigureEditorScene()
                    scene.createTextArea()
                    scene.keydown("KeyA")
                    scene.keydown("KeyB")
                    scene.keydown("KeyC")
                    scene.keydown("ArrowLeft")
                    scene.keydown("ArrowLeft")
                    scene.keydown("ArrowLeft")
                    scene.keydown("Delete")

                    const text = scene.model.layers[0].data[0] as Text
                    const textSource = text.textSource
                    const wordBoxes = textSource.wordBoxes
                    expect(wordBoxes.length).to.equal(1)
                    expect(wordBoxes[0].word).to.equal("bc")
                    expect(wordBoxes[0].svg?.textContent).to.equal("bc")
                })
                it("delete middle character", function () {
                    const scene = new FigureEditorScene()
                    scene.createTextArea()
                    scene.keydown("KeyA")
                    scene.keydown("KeyB")
                    scene.keydown("KeyC")
                    scene.keydown("ArrowLeft")
                    scene.keydown("ArrowLeft")
                    scene.keydown("Delete")

                    const text = scene.model.layers[0].data[0] as Text
                    const textSource = text.textSource
                    const wordBoxes = textSource.wordBoxes
                    expect(wordBoxes.length).to.equal(1)
                    expect(wordBoxes[0].word).to.equal("ac")
                    expect(wordBoxes[0].svg?.textContent).to.equal("ac")
                })
                it("delete last character", function () {
                    const scene = new FigureEditorScene()
                    scene.createTextArea()
                    scene.keydown("KeyA")
                    scene.keydown("KeyB")
                    scene.keydown("KeyC")
                    scene.keydown("ArrowLeft")
                    scene.keydown("Delete")

                    const text = scene.model.layers[0].data[0] as Text
                    const textSource = text.textSource
                    const wordBoxes = textSource.wordBoxes
                    expect(wordBoxes.length).to.equal(1)
                    expect(wordBoxes[0].word).to.equal("ab")
                    expect(wordBoxes[0].svg?.textContent).to.equal("ab")
                })
                it("delete behind last character of last word", function () {
                    const scene = new FigureEditorScene()
                    scene.createTextArea()
                    scene.keydown("KeyA")
                    scene.keydown("Delete")

                    const text = scene.model.layers[0].data[0] as Text
                    const textSource = text.textSource
                    const wordBoxes = textSource.wordBoxes
                    expect(wordBoxes.length).to.equal(1)
                    expect(wordBoxes[0].word).to.equal("a")
                    expect(wordBoxes[0].svg?.textContent).to.equal("a")
                })
                it("delete behind last character of word (aka delete space between two words)", function () {
                    const scene = new FigureEditorScene()
                    scene.createTextArea()
                    scene.keydown("KeyA")
                    scene.keydown("KeyB")
                    scene.keydown("Space")
                    scene.keydown("KeyC")
                    scene.keydown("KeyD")

                    scene.keydown("ArrowLeft")
                    scene.keydown("ArrowLeft")
                    scene.keydown("ArrowLeft")

                    scene.keydown("Delete")

                    const text = scene.model.layers[0].data[0] as Text
                    const textSource = text.textSource
                    const wordBoxes = textSource.wordBoxes
                    expect(wordBoxes.length).to.equal(1)
                    expect(wordBoxes[0].word).to.equal("abcd")
                    expect(wordBoxes[0].svg?.textContent).to.equal("abcd")
                })
                it("delete two characters (two check that deleting the 1st leaves us in correct position to delete the 2nd)", function () {
                    const scene = new FigureEditorScene()
                    scene.createTextArea()
                    scene.keydown("KeyA")
                    scene.keydown("KeyB")
                    scene.keydown("KeyC")
                    scene.keydown("KeyD")

                    scene.keydown("ArrowLeft")
                    scene.keydown("ArrowLeft")
                    scene.keydown("ArrowLeft")

                    scene.keydown("Delete")
                    scene.keydown("Delete")

                    const text = scene.model.layers[0].data[0] as Text
                    const textSource = text.textSource
                    const wordBoxes = textSource.wordBoxes
                    expect(wordBoxes.length).to.equal(1)
                    expect(wordBoxes[0].word).to.equal("ad")
                    expect(wordBoxes[0].svg?.textContent).to.equal("ad")
                })
                it("backspace (only once test as it shares the implementation with delete)", function () {
                    const scene = new FigureEditorScene()
                    scene.createTextArea()
                    scene.keydown("KeyA")
                    scene.keydown("Backspace")

                    const text = scene.model.layers[0].data[0] as Text
                    const textSource = text.textSource
                    const wordBoxes = textSource.wordBoxes
                    expect(wordBoxes.length).to.equal(1)
                    expect(wordBoxes[0].word).to.equal("")
                    expect(wordBoxes[0].svg?.textContent).to.equal("")
                })
            })
            describe("selection", function () {
                describe("delete deletes selected text", function () {
                    it("within single word", function () {
                        const scene = new FigureEditorScene()
                        scene.createTextArea()
                        scene.keydown("KeyA")
                        scene.keydown("KeyB")
                        scene.keydown("KeyC")
                        scene.keydown("KeyD")

                        scene.keydown("Home")
                        scene.keydown("ArrowRight")
                        scene.keydown("ArrowRight", { shift: true })
                        scene.keydown("ArrowRight", { shift: true })

                        scene.keydown("Delete")

                        const text = scene.model.layers[0].data[0] as Text
                        const editor = scene.textTool.texteditor
                        const textSource = text.textSource
                        const wordBoxes = textSource.wordBoxes

                        expect(wordBoxes.length).to.equal(1)
                        expect(wordBoxes[0].word).to.equal("ad")
                        expect(wordBoxes[0].svg?.textContent).to.equal("ad")

                        // no selection
                        expect(editor.hasSelection()).to.be.false

                        // caret at correct position
                        expect(editor.offsetWord).to.equal(0)
                        expect(editor.offsetChar).to.equal(1)
                    })
                    it("within two words", function () {
                        const scene = new FigureEditorScene()
                        scene.createTextArea()
                        scene.keydown("KeyA")
                        scene.keydown("KeyB")
                        scene.keydown("KeyC")
                        scene.keydown("KeyD")
                        scene.keydown("Space")
                        scene.keydown("KeyE")
                        scene.keydown("KeyF")
                        scene.keydown("KeyG")
                        scene.keydown("KeyH")

                        scene.keydown("Home")
                        scene.keydown("ArrowRight")
                        scene.keydown("ArrowRight")
                        scene.keydown("ArrowRight", { shift: true })
                        scene.keydown("ArrowRight", { shift: true })
                        scene.keydown("ArrowRight", { shift: true })
                        scene.keydown("ArrowRight", { shift: true })
                        scene.keydown("ArrowRight", { shift: true })

                        scene.keydown("Delete")

                        const text = scene.model.layers[0].data[0] as Text
                        const editor = scene.textTool.texteditor
                        const textSource = text.textSource
                        const wordBoxes = textSource.wordBoxes

                        expect(wordBoxes.length).to.equal(1)
                        expect(wordBoxes[0].word).to.equal("abgh")
                        expect(wordBoxes[0].svg?.textContent).to.equal("abgh")

                        // no selection
                        expect(editor.hasSelection()).to.be.false

                        // caret at correct position
                        expect(editor.offsetWord).to.equal(0)
                        expect(editor.offsetChar).to.equal(2)
                    })
                    it("within three words", function () {
                        const scene = new FigureEditorScene()
                        scene.createTextArea()
                        scene.keydown("KeyA")
                        scene.keydown("KeyB")
                        scene.keydown("KeyC")
                        scene.keydown("KeyD")
                        scene.keydown("Space")
                        scene.keydown("KeyE")
                        scene.keydown("KeyF")
                        scene.keydown("KeyG")
                        scene.keydown("KeyH")
                        scene.keydown("Space")
                        scene.keydown("KeyI")
                        scene.keydown("KeyJ")
                        scene.keydown("KeyK")
                        scene.keydown("KeyL")

                        scene.keydown("Home")
                        scene.keydown("ArrowRight")
                        scene.keydown("ArrowRight")
                        scene.keydown("ArrowRight", { shift: true })
                        scene.keydown("ArrowRight", { shift: true })
                        scene.keydown("ArrowRight", { shift: true })
                        scene.keydown("ArrowRight", { shift: true })
                        scene.keydown("ArrowRight", { shift: true })
                        scene.keydown("ArrowRight", { shift: true })
                        scene.keydown("ArrowRight", { shift: true })
                        scene.keydown("ArrowRight", { shift: true })
                        scene.keydown("ArrowRight", { shift: true })
                        scene.keydown("ArrowRight", { shift: true })

                        scene.keydown("Delete")

                        const text = scene.model.layers[0].data[0] as Text
                        const editor = scene.textTool.texteditor
                        const textSource = text.textSource
                        const wordBoxes = textSource.wordBoxes

                        expect(wordBoxes.length).to.equal(1)
                        expect(wordBoxes[0].word).to.equal("abkl")
                        expect(wordBoxes[0].svg?.textContent).to.equal("abkl")

                        // no selection
                        expect(editor.hasSelection()).to.be.false

                        // caret at correct position
                        expect(editor.offsetWord).to.equal(0)
                        expect(editor.offsetChar).to.equal(2)
                    })
                })
                it("backspace deletes selected text", function () {
                    const scene = new FigureEditorScene()
                    scene.createTextArea()
                    scene.keydown("KeyA")
                    scene.keydown("KeyB")
                    scene.keydown("KeyC")
                    scene.keydown("KeyD")

                    scene.keydown("Home")
                    scene.keydown("ArrowRight")
                    scene.keydown("ArrowRight", { shift: true })
                    scene.keydown("ArrowRight", { shift: true })

                    scene.keydown("Backspace")

                    const text = scene.model.layers[0].data[0] as Text
                    const editor = scene.textTool.texteditor
                    const textSource = text.textSource
                    const wordBoxes = textSource.wordBoxes

                    expect(wordBoxes.length).to.equal(1)
                    expect(wordBoxes[0].word).to.equal("ad")
                    expect(wordBoxes[0].svg?.textContent).to.equal("ad")

                    // no selection
                    expect(editor.hasSelection()).to.be.false

                    // caret at correct position
                    expect(editor.offsetWord).to.equal(0)
                    expect(editor.offsetChar).to.equal(1)
                })
            })
        })
        describe("caret", function () {
            it("is visible in a newly created text area", function () {
                const scene = new FigureEditorScene()
                scene.createTextArea()

                const text = scene.model.layers[0].data[0] as Text
                const editor = scene.textTool.texteditor
                const word = text.textSource.wordBoxes[0]

                expect(editor.offsetWord).equal(0)
                expect(editor.offsetChar).equal(0)
                const line = editor.svgCursor

                // THEN it's visible
                // FIXME: currently it seems to be hidden behind the selection marker
                expect(line.getAttributeNS("", "x1")).to.equal(`${10.5}`)
                expect(line.getAttributeNS("", "y1")).to.equal(`${15.5}`)
                expect(line.getAttributeNS("", "x2")).to.equal(`${10.5}`)
                expect(line.getAttributeNS("", "y2")).to.equal(`${Math.round(15 + word.size.height) + 0.5}`)
            })
            // TODO: check also that this works for not the 1st line?
            it("it's behind the last typed letter", function () {
                const scene = new FigureEditorScene()
                scene.createTextArea()
                scene.keydown("KeyA")

                const text = scene.model.layers[0].data[0] as Text
                const editor = scene.textTool.texteditor
                const word = text.textSource.wordBoxes[0]

                expect(editor.offsetWord).equal(0)
                expect(editor.offsetChar).equal(1)
                const line = editor.svgCursor

                // THEN it's visible
                // FIXME: currently it seems to be hidden behind the selection marker
                expect(line.getAttributeNS("", "x1")).to.equal(`${Math.round(10 + word.size.width) + 0.5}`)
                expect(line.getAttributeNS("", "y1")).to.equal(`${15.5}`)
                expect(line.getAttributeNS("", "x2")).to.equal(`${Math.round(10 + word.size.width) + 0.5}`)
                expect(line.getAttributeNS("", "y2")).to.equal(`${Math.round(15 + word.size.height) + 0.5}`)
            })
            it("move left", function () {
                const scene = new FigureEditorScene()
                scene.createTextArea()
                scene.keydown("KeyA")
                scene.keydown("ArrowLeft")

                const text = scene.model.layers[0].data[0] as Text
                const editor = scene.textTool.texteditor
                const word = text.textSource.wordBoxes[0]

                expect(editor.offsetWord).equal(0)
                expect(editor.offsetChar).equal(0)
                const line = editor.svgCursor

                // THEN it's visible
                // FIXME: currently it seems to be hidden behind the selection marker
                expect(line.getAttributeNS("", "x1")).to.equal(`${10.5}`)
                expect(line.getAttributeNS("", "y1")).to.equal(`${15.5}`)
                expect(line.getAttributeNS("", "x2")).to.equal(`${10.5}`)
                expect(line.getAttributeNS("", "y2")).to.equal(`${Math.round(15 + word.size.height) + 0.5}`)
            })
            it("move right", function () {
                const scene = new FigureEditorScene()
                scene.createTextArea()
                scene.keydown("KeyA")
                scene.keydown("ArrowLeft")
                scene.keydown("ArrowRight")

                const text = scene.model.layers[0].data[0] as Text
                const editor = scene.textTool.texteditor
                const word = text.textSource.wordBoxes[0]

                expect(editor.offsetWord).equal(0)
                expect(editor.offsetChar).equal(1)
                const line = editor.svgCursor

                expect(line.getAttributeNS("", "x1")).to.equal(`${Math.round(10 + word.size.width) + 0.5}`)
                expect(line.getAttributeNS("", "y1")).to.equal(`${15.5}`)
                expect(line.getAttributeNS("", "x2")).to.equal(`${Math.round(10 + word.size.width) + 0.5}`)
                expect(line.getAttributeNS("", "y2")).to.equal(`${Math.round(15 + word.size.height) + 0.5}`)
            })
            describe("go to beginning of line", function () {
                it("Home key", function () {
                    const scene = new FigureEditorScene()
                    scene.createTextArea()
                    scene.keydown("KeyA")
                    scene.keydown("KeyB")
                    scene.keydown("Home")

                    const cursor = scene.textTool.texteditor
                    expect(cursor.offsetWord).equal(0)
                    expect(cursor.offsetChar).equal(0)
                })
                it("Ctrl + A", function () {
                    const scene = new FigureEditorScene()
                    scene.createTextArea()
                    scene.keydown("KeyA")
                    scene.keydown("KeyB")
                    scene.keydown("KeyA", { ctrl: true })

                    const editor = scene.textTool.texteditor
                    expect(editor.offsetWord).equal(0)
                    expect(editor.offsetChar).equal(0)
                })
                describe("unit tests", function () {
                    it("jump from 2nd word to 1st word", function () {
                        const scene = new FigureEditorScene()
                        scene.createTextArea()
                        scene.keydown("KeyA")
                        scene.keydown("Space")
                        scene.keydown("KeyB")

                        const editor = scene.textTool.texteditor

                        scene.keydown("Home")
                        expect(editor.offsetWord).equal(0)
                        expect(editor.offsetChar).equal(0)

                        scene.keydown("Home")
                        expect(editor.offsetWord).equal(0)
                        expect(editor.offsetChar).equal(0)
                    })
                    it("jump to the head of the 2nd line", function () {
                        const scene = new FigureEditorScene()
                        scene.createTextArea()
                        for (let i = 0; i < 6; ++i) {
                            scene.keydown("KeyA")
                            scene.keydown("KeyB")
                            scene.keydown("KeyC")
                            scene.keydown("KeyD")
                            scene.keydown("Space")
                        }

                        const editor = scene.textTool.texteditor

                        scene.keydown("Home")
                        expect(editor.offsetWord).equal(3)
                        expect(editor.offsetChar).equal(0)

                        scene.keydown("Home")
                        expect(editor.offsetWord).equal(3)
                        expect(editor.offsetChar).equal(0)
                    })
                })
            })
            describe("go to end of line", function () {
                it("End key", function () {
                    const scene = new FigureEditorScene()
                    scene.createTextArea()
                    scene.keydown("KeyA")
                    scene.keydown("KeyB")
                    scene.keydown("Home")

                    scene.keydown("End")

                    const editor = scene.textTool.texteditor
                    expect(editor.offsetWord).equal(0)
                    expect(editor.offsetChar).equal(2)
                })
                it("Ctrl + E", function () {
                    const scene = new FigureEditorScene()
                    scene.createTextArea()
                    scene.keydown("KeyA")
                    scene.keydown("KeyB")
                    scene.keydown("Home")

                    scene.keydown("KeyE", { ctrl: true })

                    const editor = scene.textTool.texteditor
                    expect(editor.offsetWord).equal(0)
                    expect(editor.offsetChar).equal(2)
                })
                describe("unit tests", function () {
                    it("jump from 1st word to the 2nd word", function () {
                        const scene = new FigureEditorScene()
                        scene.createTextArea()
                        scene.keydown("KeyA")
                        scene.keydown("Space")
                        scene.keydown("KeyB")
                        scene.keydown("Home")

                        const editor = scene.textTool.texteditor

                        scene.keydown("End")
                        expect(editor.offsetWord).equal(1)
                        expect(editor.offsetChar).equal(1)

                        scene.keydown("End")
                        expect(editor.offsetWord).equal(1)
                        expect(editor.offsetChar).equal(1)
                    })
                    it("jump to the end of the 2nd line", function () {
                        const scene = new FigureEditorScene()
                        scene.createTextArea()
                        for (let i = 0; i < 6; ++i) {
                            scene.keydown("KeyA")
                            scene.keydown("KeyB")
                            scene.keydown("KeyC")
                            scene.keydown("KeyD")
                            if (i !== 5)
                                scene.keydown("Space")
                        }
                        scene.keydown("Home")

                        const editor = scene.textTool.texteditor

                        scene.keydown("End")
                        expect(editor.offsetWord).equal(5)
                        expect(editor.offsetChar).equal(4)

                        scene.keydown("End")
                        expect(editor.offsetWord).equal(5)
                        expect(editor.offsetChar).equal(4)
                    })
                })
            })
        })
        describe("select text", function () {
            describe("with keyboard", function () {
                it("select one character", function () {
                    const scene = new FigureEditorScene()
                    scene.createTextArea()
                    scene.keydown("KeyA")
                    scene.keydown("ArrowLeft")
                    scene.keydown("ArrowRight", { shift: true })

                    const text = scene.model.layers[0].data[0] as Text
                    const editor = scene.textTool.texteditor

                    expect(editor.selectionOffsetWord).to.equal(0)
                    expect(editor.selectionOffsetChar).to.equal(0)
                    expect(editor.offsetWord).to.equal(0)
                    expect(editor.offsetChar).to.equal(1)

                    const word = text.textSource.wordBoxes[0]
                    const selection = editor.svgSelection!

                    const path = selection.getPathData()
                    expect(path.length).to.equal(5)
                    expect(path).to.containSubset([{ values: [10, 15] }])
                    expect(path).to.containSubset([{ values: [10 + word.size.width, 15 + word.size.height] }])
                })
                it("select two words", function () {
                    const scene = new FigureEditorScene()
                    scene.createTextArea()
                    scene.keydown("KeyA")
                    scene.keydown("Space")
                    scene.keydown("KeyB")

                    scene.keydown("ArrowLeft", { shift: true })
                    scene.keydown("ArrowLeft", { shift: true })
                    scene.keydown("ArrowLeft", { shift: true })

                    const text = scene.model.layers[0].data[0] as Text
                    const editor = scene.textTool.texteditor

                    expect(editor.selectionOffsetWord).to.equal(1)
                    expect(editor.selectionOffsetChar).to.equal(1)
                    expect(editor.offsetWord).to.equal(0)
                    expect(editor.offsetChar).to.equal(0)

                    const word0 = text.textSource.wordBoxes[0]
                    const word1 = text.textSource.wordBoxes[1]
                    const selection = editor.svgSelection!

                    const path = selection.getPathData()
                    expect(path.length).to.equal(5)
                    expect(path).to.containSubset([{ values: [10, 15] }])
                    expect(path).to.containSubset([{ values: [10 + word0.size.width + editor.textSource.space + word1.size.width, 15 + word0.size.height] }])
                })
                it("select with Home + shift", function () {
                    const scene = new FigureEditorScene()
                    scene.createTextArea()
                    scene.keydown("KeyA")
                    scene.keydown("KeyB")

                    scene.keydown("Home", { shift: true })

                    const editor = scene.textTool.texteditor
                    expect(editor.selectionOffsetWord).to.equal(0)
                    expect(editor.selectionOffsetChar).to.equal(2)
                    expect(editor.offsetWord).to.equal(0)
                    expect(editor.offsetChar).to.equal(0)

                })
                it("select with End + shift", function () {
                    const scene = new FigureEditorScene()
                    scene.createTextArea()
                    scene.keydown("KeyA")
                    scene.keydown("KeyB")
                    scene.keydown("Home")

                    scene.keydown("End", { shift: true })

                    const editor = scene.textTool.texteditor
                    expect(editor.selectionOffsetWord).to.equal(0)
                    expect(editor.selectionOffsetChar).to.equal(0)
                    expect(editor.offsetWord).to.equal(0)
                    expect(editor.offsetChar).to.equal(2)
                })

                // double click to select word?

                // within a single line
                //  A [B] C
                // it.only("select one character", function() {
                //     const scene = new FigureEditorScene()
                //     scene.createTextArea()
                //     for(let i=0; i<9; ++i) {
                //         scene.keydown("A")
                //         scene.keydown("B")
                //         scene.keydown("C")
                //         scene.keydown("D")
                //         scene.keydown(" ")
                //     }
                //     scene.sendArrowLeft()
                //     scene.sendArrowLeft()
                //     scene.sendArrowRight({shift: true})
                // })
                // end of line to head of next line, no overlap
                //  A B [C]
                // [D] E F

                // end of line, head of next line, overlap
                // A [B C]
                // [D E] F

                // end of line, head of next, next line
                // A B [C]
                // [D E F]
                // [G] H I

                describe("regression", function () {
                    it("SHIFT+A does not mean to select A", function () {
                        const scene = new FigureEditorScene()
                        scene.createTextArea()
                        scene.keydown("KeyA", { shift: true })

                        const editor = scene.textTool.texteditor
                        expect(editor.hasSelection()).to.be.false
                    })
                })
            })

            // we have no mouse tests at all!!!
            describe("mouse", function () {
            })

            describe("cut, copy, paste via clipboard", function () {
                describe("cut", function () {
                    it("nothing to cut", async function () {
                        const scene = new FigureEditorScene()
                        scene.createTextArea()
                        scene.keydown("KeyA")
                        const text = await scene.cut()
                        expect(text).to.be.undefined
                    })
                    it("cut within one word", async function () {
                        const scene = new FigureEditorScene()
                        scene.createTextArea()
                        scene.keydown("KeyA")
                        scene.keydown("KeyB")
                        scene.keydown("KeyC")
                        scene.keydown("KeyD")
                        scene.keydown("ArrowLeft")
                        scene.keydown("ArrowLeft", { shift: true })
                        scene.keydown("ArrowLeft", { shift: true })

                        const xtext = await scene.cut()
                        expect(xtext).to.equal("bc")

                        const text = scene.model.layers[0].data[0] as Text
                        const editor = scene.textTool.texteditor
                        const textSource = text.textSource
                        const wordBoxes = textSource.wordBoxes

                        expect(wordBoxes.length).to.equal(1)
                        expect(wordBoxes[0].word).to.equal("ad")
                        expect(wordBoxes[0].svg?.textContent).to.equal("ad")

                        expect(editor.offsetWord).equal(0)
                        expect(editor.offsetChar).equal(1)
                    })
                })
                describe("copy", function () {
                    it("nothing to copy", async function () {
                        const scene = new FigureEditorScene()
                        scene.createTextArea()
                        scene.keydown("KeyA")
                        const text = await scene.copy()
                        expect(text).to.be.undefined
                    })
                    it("copy within one word", async function () {
                        const scene = new FigureEditorScene()
                        scene.createTextArea()
                        scene.keydown("KeyA")
                        scene.keydown("KeyB")
                        scene.keydown("KeyC")
                        scene.keydown("ArrowLeft")
                        scene.keydown("ArrowLeft", { shift: true })

                        const text = await scene.copy()
                        expect(text).to.equal("b")
                    })
                    it("copy from two words", async function () {
                        const scene = new FigureEditorScene()
                        scene.createTextArea()
                        scene.keydown("KeyA")
                        scene.keydown("Space")
                        scene.keydown("KeyB")
                        scene.keydown("Home", { shift: true })

                        const text = await scene.copy()
                        expect(text).to.equal("a b")
                    })
                    it("copy from three words", async function () {
                        const scene = new FigureEditorScene()
                        scene.createTextArea()
                        scene.keydown("KeyA")
                        scene.keydown("Space")
                        scene.keydown("KeyB")
                        scene.keydown("Space")
                        scene.keydown("KeyC")
                        scene.keydown("Home", { shift: true })

                        const text = await scene.copy()
                        expect(text).to.equal("a b c")
                    })
                })
                describe("paste", function () {
                    it("insert", async function () {
                        const scene = new FigureEditorScene()
                        scene.createTextArea()
                        scene.keydown("KeyA")
                        scene.keydown("KeyZ")
                        scene.keydown("ArrowLeft")
                        await scene.paste("DEADBEEF")

                        const text = scene.model.layers[0].data[0] as Text
                        const textSource = text.textSource
                        const wordBoxes = textSource.wordBoxes

                        expect(wordBoxes.length).to.equal(1)
                        expect(wordBoxes[0].word).to.equal("aDEADBEEFz")
                        expect(wordBoxes[0].svg?.textContent).to.equal("aDEADBEEFz")
                    })
                    it("insert replaces selected text", async function () {
                        const scene = new FigureEditorScene()
                        scene.createTextArea()
                        scene.keydown("KeyA")
                        scene.keydown("KeyB")
                        scene.keydown("KeyY")
                        scene.keydown("KeyZ")
                        scene.keydown("Home")
                        scene.keydown("ArrowRight")
                        scene.keydown("ArrowRight", { shift: true })
                        scene.keydown("ArrowRight", { shift: true })
                        await scene.paste("DEADBEEF")

                        const text = scene.model.layers[0].data[0] as Text
                        const editor = scene.textTool.texteditor
                        const textSource = text.textSource
                        const wordBoxes = textSource.wordBoxes

                        expect(wordBoxes.length).to.equal(1)
                        expect(wordBoxes[0].word).to.equal("aDEADBEEFz")
                        expect(wordBoxes[0].svg?.textContent).to.equal("aDEADBEEFz")

                        expect(editor.offsetWord).equal(0)
                        expect(editor.offsetChar).equal(9)
                    })
                    it("insert text with space", async function () {
                        const scene = new FigureEditorScene()
                        scene.createTextArea()
                        scene.keydown("KeyA")
                        scene.keydown("KeyB")
                        scene.keydown("KeyY")
                        scene.keydown("KeyZ")
                        scene.keydown("Home")
                        scene.keydown("ArrowRight")
                        scene.keydown("ArrowRight", { shift: true })
                        scene.keydown("ArrowRight", { shift: true })
                        await scene.paste("DEAD BEEF")

                        const text = scene.model.layers[0].data[0] as Text
                        const editor = scene.textTool.texteditor
                        const textSource = text.textSource
                        const wordBoxes = textSource.wordBoxes

                        expect(wordBoxes.length).to.equal(2)
                        expect(wordBoxes[0].word).to.equal("aDEAD")
                        expect(wordBoxes[0].svg?.textContent).to.equal("aDEAD")
                        expect(wordBoxes[1].word).to.equal("BEEFz")
                        expect(wordBoxes[1].svg?.textContent).to.equal("BEEFz")

                        expect(editor.offsetWord).equal(1)
                        expect(editor.offsetChar).equal(4)
                    })
                })
            })

            // TEST: disable caret when switching to another Text
            // TEST: when the caret leaves the region were words are rendered...
            // => this stuff will solve itself when Cursor get's merged into TextTool

            // next steps:
            // line break/paragraph break
            // unicode line break rules (conditional word separator? CTRL+SPACE was it in MS Word?)
            //   "There are two ways to specify a conditional (allowed) line break: the <wbr> tag, which
            //   is being standardized in HTML5, and the zero width space character (U+200B, &#x200b;)"
            //   &shy; https://en.wikipedia.org/wiki/Soft_hyphen
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
