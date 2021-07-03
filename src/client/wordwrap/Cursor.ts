/*
 *  workflow - A collaborative real-time white- and kanban board
 *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Text } from "../figures/Text"
import { Path } from "../paths"
import { WordBox } from "./WordBox"
import { Point } from "shared/geometry"
import { WordWrap } from "./wordwrap"
import { TextSource } from "./TextSource"
import { EditorMouseEvent, EditorKeyboardEvent } from "../figureeditor"

// FIXME: this class quickly turned into an TextEditor, merge it into TextTool
export class Cursor {
    text: Text
    svgParent: SVGElement
    svgCursor: SVGLineElement
    svgSelection?: SVGPathElement

    textSource: TextSource // use the one in text
    boxes: Array<WordBox>   // use the one in text textSource.wordBoxes

    timer: undefined | number

    position: Point // x is used when going up/down
    xDuringVerticalMovement: undefined | number

    // cursor location
    offsetWord: number      // index within wordBoxes
    offsetChar: number      // index within wordBox

    // cursor location when selection began
    selectionOffsetWord: number | null = null
    selectionOffsetChar: number = 0

    constructor(text: Text, svg: SVGElement, textSource: TextSource) {
        this.text = text
        this.svgParent = svg
        this.textSource = textSource
        this.boxes = textSource.wordBoxes
        this.position = new Point()
        this.xDuringVerticalMovement = undefined
        this.offsetWord = 0
        this.offsetChar = 0
        this.svgCursor = this.createCursor()
        this.updateCursor()
        this.svgParent.appendChild(this.svgCursor)
    }

    hasSelection(): boolean {
        return this.selectionOffsetWord !== null
    }

    createCursor(): SVGLineElement {
        let cursor = document.createElementNS("http://www.w3.org/2000/svg", "line")
        cursor.setAttributeNS("", "stroke", "#000")
        return cursor
    }

    mousedown(e: EditorMouseEvent) {
        this.offsetWord = 0
        this.offsetChar = 0
        if (this.goNearY(e.y)) {
            this.goNearX(e.x)
        }
        this.selectionOffsetWord = this.offsetWord
        this.selectionOffsetChar = this.offsetChar
        this.updateCursor()
    }

    mousemove(e: EditorMouseEvent) {
        this.offsetWord = 0
        this.offsetChar = 0
        if (this.goNearY(e.y)) {
            this.goNearX(e.x)
            this.updateCursor()
        }
    }

    updateSelection(e?: EditorKeyboardEvent) {
        if (e === undefined || e.shift) {
            if (this.selectionOffsetWord === null) {
                this.selectionOffsetWord = this.offsetWord
                this.selectionOffsetChar = this.offsetChar
            }
        } else {
            this.selectionOffsetWord = null
        }
    }

    // TODO: break this method up!
    keydown(e: EditorKeyboardEvent) {
        e.preventDefault()

        if (e.code === "Home" || (e.ctrl && e.code === "KeyA")) {
            this.updateSelection(e)
            this.moveCursorBOL()
            this.updateCursor()
            return
        }
        if (e.code === "End" || (e.ctrl && e.code === "KeyE")) {
            this.updateSelection(e)
            this.moveCursorEOL()
            this.updateCursor()
            return
        }

        switch (e.code) {
            case "ArrowRight":
                this.updateSelection(e)
                this.moveCursorRight()
                this.updateCursor()
                break
            case "ArrowLeft":
                this.updateSelection(e)
                this.moveCursorLeft()
                this.updateCursor()
                break
            case "Backspace":
                if (this.selectionOffsetWord !== null) {
                    this.deleteSelectedText()
                } else {
                    this.updateSelection()
                    this.moveCursorLeft()
                    this.deleteSelectedText()
                }
                this.textSource.reset()
                const wordwrap0 = new WordWrap(e.editor.getPath(this.text) as Path, this.textSource)
                this.textSource.updateSVG()
                this.updateCursor()
                break
            case "Delete":
                if (this.selectionOffsetWord !== null) {
                    this.deleteSelectedText()
                } else {
                    this.updateSelection()
                    this.moveCursorRight()
                    this.deleteSelectedText()
                }
                // redo word wrap
                this.textSource.reset()
                const wordwrap1 = new WordWrap(e.editor.getPath(this.text) as Path, this.textSource)
                this.textSource.updateSVG()
                this.updateCursor()
                break
            default:
                if (e.value.length == 1) {
                    this.insertCharacter(e.value)
                    this.textSource.reset()
                    const wordwrap2 = new WordWrap(e.editor.getPath(this.text) as Path, this.textSource)
                    this.textSource.updateSVG()
                    this.updateCursor()
                }
        }

        switch (e.code) {
            case "ArrowDown":
                this.updateSelection(e)
                if (this.xDuringVerticalMovement === undefined)
                    this.xDuringVerticalMovement = this.position.x

                if (this.gotoNextRow()) {
                    this.goNearX(this.xDuringVerticalMovement)
                    this.updateCursor()
                }
                break
            case "ArrowUp":
                this.updateSelection(e)
                if (this.xDuringVerticalMovement === undefined)
                    this.xDuringVerticalMovement = this.position.x
                if (this.gotoPreviousRow()) {
                    this.goNearX(this.xDuringVerticalMovement)
                    this.updateCursor()
                }
                break
            default:
                this.xDuringVerticalMovement = undefined
        }
    }

    insertCharacter(value: string) {
        if (this.selectionOffsetWord !== null) {
            this.deleteSelectedText()
        }
        let r = this.boxes[this.offsetWord]
        if (value === " ") {
            if (this.offsetChar === 0) {
                console.log(`Cursor.keyDown(): ignoring ' ' at beginning of word`)
                return
            }
            // const word = this.textSource.wordBoxes[this.offsetWord]
            this.textSource.wordBoxes.splice(this.offsetWord + 1, 0, new WordBox(0, 0, r.word.substring(this.offsetChar)))
            r.word = r.word.substring(0, this.offsetChar)
            if (r.svg)
                r.svg.textContent = r.word
            this.offsetChar = 0
            this.offsetWord++
        } else {
            r.word = r.word.slice(0, this.offsetChar) + value + r.word.slice(this.offsetChar)
            if (r.svg !== undefined) {
                r.svg.textContent = r.word
            }
            this.offsetChar++
        }
    }

    moveCursorRight() {
        ++this.offsetChar
        if (this.offsetChar > this.boxes[this.offsetWord].word.length) {
            if (this.offsetWord >= this.boxes.length || this.boxes[this.offsetWord].endOfWrap) {
                --this.offsetChar
            } else {
                this.offsetChar = 0
                ++this.offsetWord
            }
        }
    }

    moveCursorLeft() {
        if (this.offsetWord === 0 && this.offsetChar === 0)
            return
        --this.offsetChar
        if (this.offsetChar < 0) {
            --this.offsetWord
            const r = this.boxes[this.offsetWord]
            this.offsetChar = r.word.length
        }
    }

    moveCursorBOL() {
        let offsetWord = this.offsetWord
        while (true) {
            if ((offsetWord > 0 && this.boxes[offsetWord - 1].endOfLine) ||
                offsetWord === 0) {
                this.offsetWord = offsetWord
                this.offsetChar = 0
                break
            }
            --offsetWord
        }
    }

    moveCursorEOL() {
        let offsetWord = this.offsetWord
        while (true) {
            if (offsetWord === this.boxes.length - 1 ||
                (this.boxes[offsetWord].endOfLine || this.boxes[offsetWord].endOfWrap)) {
                this.offsetWord = offsetWord
                this.offsetChar = this.boxes[offsetWord].word.length
                break
            }
            ++offsetWord
        }
    }

    deleteSelectedText() {
        const [offsetWord0, offsetChar0, offsetWord1, offsetChar1] = this.getSelection()
        if (offsetWord0 === offsetWord1) {
            const word = this.textSource.wordBoxes[offsetWord0]
            word.word = word.word.substring(0, offsetChar0) + word.word.substring(offsetChar1)
            if (word.svg !== undefined) {
                word.svg.textContent = word.word
            }
        } else {
            const word0 = this.textSource.wordBoxes[offsetWord0]
            const word1 = this.textSource.wordBoxes[offsetWord1]
            word0.word = word0.word.substring(0, offsetChar0) + word1.word.substring(offsetChar1)
            if (word0.svg !== undefined) {
                word0.svg.textContent = word0.word
            }

            for (let i = offsetWord0 + 1; i < offsetWord1; ++i) {
                const word = this.textSource.wordBoxes[i]
                if (word.svg) {
                    word.svg.parentElement?.removeChild(word.svg)
                    word.svg = undefined
                }
            }
            this.textSource.wordBoxes.splice(offsetWord0 + 1, offsetWord1 - offsetWord0)
        }
        this.offsetWord = offsetWord0
        this.offsetChar = offsetChar0
        this.selectionOffsetWord = null
    }

    // FIXME: name does not indicate position is not changed
    gotoNextRow(): boolean {
        let offsetWord = this.offsetWord
        while (offsetWord < this.boxes.length && !this.boxes[offsetWord++].endOfLine) { }
        if (offsetWord >= this.boxes.length || this.boxes[offsetWord - 1].endOfWrap)
            return false
        this.offsetWord = offsetWord
        this.offsetChar = 0
        return true
    }

    gotoPreviousRow(): boolean {
        // console.log(`gotoPreviousRow: enter`)
        let offsetWord = this.offsetWord

        // console.log(`gotoPreviousRow: goto bol in current line`)
        while (offsetWord > 0 && !this.boxes[offsetWord - 1].endOfLine) {
            --offsetWord
        }
        // console.log(`gotoPreviousRow: bol offsetWord=${offsetWord}`)

        if (offsetWord == 0)
            return false

        --offsetWord

        // console.log(`gotoPreviousRow: goto bol in previous line`)
        while (offsetWord > 0 && !this.boxes[offsetWord - 1].endOfLine) {
            --offsetWord
        }
        // console.log(`gotoPreviousRow: offsetWord=${offsetWord}`)
        this.offsetWord = offsetWord
        this.offsetChar = 0
        // console.log(`gotoPreviousRow: leave`)
        return true
    }

    goNearY(y: number): boolean {
        let rowWord = 0
        let maxY = Number.MIN_VALUE
        for (let i = 0; i < this.boxes.length; ++i) {
            let r = this.boxes[i]
            maxY = Math.max(maxY, r.origin.y + r.size.height)
            if (r.endOfLine) {
                if (y <= maxY) {
                    this.offsetWord = rowWord
                    return true
                }
                maxY = Number.MIN_VALUE
                if (i + 1 >= this.boxes.length || r.endOfWrap)
                    break
                rowWord = i + 1
            }
        }
        this.offsetWord = rowWord
        return true
    }

    // FIXME: name does not indicate going from offset(Char|Word) to position.x
    goNearX(x: number) {
        let offsetWord = this.offsetWord
        let offsetChar = this.offsetChar
        // console.log(`gotoCursorHorizontally(): enter with x=${x}, offsetWord=${offsetWord}, offsetChar=${offsetChar}`)
        while (true) {
            let r = this.boxes[offsetWord]

            // current position is right of r => next word
            if (x > r.origin.x + r.size.width) {
                if (r.endOfLine) {
                    // console.log(`gotoCursorHorizontally: current position ${x} is right of ${r.origin.x + r.size.width} and we are end of line => stop`)
                    offsetChar = r.word.length
                    break
                } else {
                    ++offsetWord
                    if (offsetWord === this.boxes.length) {
                        offsetChar = r.word.length
                        --offsetWord
                        break
                    }
                    // console.log(`gotoCursorHorizontally: current position ${x} is right of ${r.origin.x + r.size.width} => next word ${offsetWord}`)
                    continue
                }
            }

            if (offsetWord != this.offsetWord && x < r.origin.x) {
                let r0 = this.boxes[offsetWord - 1]
                let x0 = r0.origin.x + r0.size.width
                let x1 = r.origin.x
                // console.log(`found character before word for x=${x}, x0=${x0}, x1=${x1}, compare x1-x >= x-x0 (${x1-x} >= ${x-x0})`)
                if (x1 - x >= x - x0) {
                    offsetWord = offsetWord - 1
                    offsetChar = r0.word.length
                } else {
                    offsetChar = 0
                }
                break
            }

            // console.log(`gotoCursorHorizontally: search within word ${offsetWord}`)
            offsetChar = -1
            let x0 = r.origin.x
            for (let i = 1; i <= r.word.length; ++i) {
                let x1 = r.origin.x + r.svg!.getSubStringLength(0, i)
                // console.log(`  i=${i}, x0=${x0}, x1=${x1}`)
                if (x < x1) {
                    // console.log(`found character after word for x=${x}, x0=${x0}, x1=${x1}, compare x1-x >= x-x0 (${x1-x} >= ${x-x0})`)
                    if (x1 - x >= x - x0) {
                        offsetChar = i - 1
                    } else {
                        offsetChar = i
                    }
                    // console.log(`offsetChar=${offsetChar}`)
                    break
                }
                x0 = x1
            }
            if (offsetChar == -1) {
                // throw Error("failed to place cursor")
                offsetChar = r.word.length
            }
            break
        } //  while(!this.boxes[offsetWord].endOfLine)
        this.offsetWord = offsetWord
        this.offsetChar = offsetChar
        // console.log(`gotoCursorHorizontally: offsetWord=${offsetWord}, offsetChar=${offsetChar}`)
    }

    getSelection() {
        if (this.selectionOffsetWord === null)
            throw Error("no selection")

        let [offsetWord0, offsetChar0] = [this.offsetWord, this.offsetChar]
        let [offsetWord1, offsetChar1] = [this.selectionOffsetWord, this.selectionOffsetChar]

        //  this.offsetToScreen(this.selectionOffsetWord, this.selectionOffsetChar)
        if (offsetWord0 > offsetWord1 ||
            (offsetWord0 === offsetWord1 &&
                offsetChar0 > offsetChar1)
        ) {
            return [offsetWord1, offsetChar1, offsetWord0, offsetChar0]
        }
        return [offsetWord0, offsetChar0, offsetWord1, offsetChar1]
    }

    // use offsetWord and offsetChar to place the cursor
    updateCursor() {

        const [x, y, h] = this.offsetToScreen(this.offsetWord, this.offsetChar)

        if (this.selectionOffsetWord === null) {
            if (this.svgSelection) {
                this.svgSelection.parentElement?.removeChild(this.svgSelection)
                this.svgSelection = undefined
            }
        } else {
            let [offsetWord0, offsetChar0, offsetWord1, offsetChar1] = this.getSelection()
            const path = new Path()

            // console.log(` create selection between offsets (${offsetWord0}, ${offsetChar0}) and (${offsetWord1}, ${offsetChar1})`)

            let offsetWord = offsetWord0
            while (offsetWord <= offsetWord1) {
                const word = this.boxes[offsetWord]
                if (word.endOfLine || word.endOfSlice || offsetWord === offsetWord1) {
                    // console.log(`  create rectangle" endof`)
                    const [x0, y0, h0] = this.offsetToScreen(offsetWord0, offsetChar0)
                    let x1, y1, h1
                    if (offsetWord < offsetWord1)
                        [x1, y1, h1] = this.offsetToScreen(offsetWord, word.word.length)
                    else
                        [x1, y1, h1] = this.offsetToScreen(offsetWord, offsetChar1)
                    path.move(x0, y0 + h0)
                        .line(x0, y0)
                        .line(x1, y1)
                        .line(x1, y1 + h1)
                        .close();
                    [offsetWord0, offsetChar0] = [offsetWord + 1, 0]
                }
                ++offsetWord
            }

            if (this.svgSelection === undefined) {
                // console.log(`create selection to from ${x0} to ${x1}`)
                this.svgSelection = path.createSVG("#b3d7ff", 1, "#b3d7ff")
                this.svgParent.insertBefore(this.svgSelection, this.svgParent.children[0])
            } else {
                // console.log(`update selection to from ${x0} to ${x1}`)
                path.updateSVG(this.svgParent, this.svgSelection)
            }
        }

        this.position.x = x
        this.position.y = y

        const xs = `${Math.round(x) + 0.5}`
        const y1 = `${Math.round(y) + 0.5}`
        const y2 = `${Math.round(y + h) + 0.5}`

        this.svgCursor.setAttributeNS("", "x1", xs)
        this.svgCursor.setAttributeNS("", "y1", y1)
        this.svgCursor.setAttributeNS("", "x2", xs)
        this.svgCursor.setAttributeNS("", "y2", y2)

        // disable blinking for 0.5s while moving
        if (this.timer) {
            window.clearTimeout(this.timer)
            this.timer = undefined
        }
        this.svgCursor.classList.remove("cursor-blink")
        this.timer = window.setTimeout(() => {
            this.svgCursor.classList.add("cursor-blink")
            this.timer = undefined
        }, 500)
    }

    offsetToScreen(offsetWord: number, offsetChar: number) {
        let r = this.boxes[offsetWord]!
        let x
        if (r.word.length === 0) {
            x = 0
        } else {
            // console.log(`word='${r.word}', word.length=${r.word.length}, call getSubStringLength(0, offsetChar=${this.offsetChar})`)
            x = offsetChar === 0 ? 0 : r.svg!.getSubStringLength(0, offsetChar)
        }
        return [r.origin.x + x, r.origin.y, r.size.height]
    }

    stop() {
        if (this.timer) {
            window.clearTimeout(this.timer)
            this.timer = undefined
            this.svgCursor.classList.remove("cursor-blink")
        }
    }
}
