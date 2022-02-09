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

import { Size } from "shared/geometry/Size"
import { Point } from "shared/geometry/Point"
import { WordSource } from "./wordwrap"
import { WordBox } from "./WordBox"

export class TextSource implements WordSource {
    wordBoxes: Array<WordBox>
    current: number

    parentSVG!: SVGElement
    space: number // hack
    height: number // hack

    constructor(text?: string) {
        this.wordBoxes = []
        this.current = 0
        this.space = 0
        this.height = 0

        if (text == undefined)
            text = "Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        TextSource.splitTextIntoWordBoxes(this.wordBoxes, text)
    }

    toString(): string {
        let text = ""
        for(const box of this.wordBoxes) {
            if (text.length != 0)
                text += " "
            text += box.word
        }
        return text
    }

    static splitTextIntoWordBoxes(wordBoxes: WordBox[], text: string): void {
        let word = ''
        for (let char of text) {
            switch (char) {
                case ' ':
                case '\t':
                case '\r':
                case '\n':
                case '\v':
                    let rectangle = new WordBox(word.length * 8, 16, word)
                    wordBoxes.push(rectangle)
                    word = ""
                    break
                default:
                    word += char
            }
        }
        if (word.length > 0) {
            let rectangle = new WordBox(word.length * 8, 16, word)
            wordBoxes.push(rectangle)
        }
        if (wordBoxes.length === 0) {
            let rectangle = new WordBox(0, 16, "")
            wordBoxes.push(rectangle)
        }
    }

    reset() {
        this.current = 0
        for (let w of this.wordBoxes) {
            w.reset()
        }
    }

    initializeWordBoxes(parentSVG: SVGElement) {
        this.parentSVG = parentSVG

        // set this.space
        let spacer = document.createElementNS("http://www.w3.org/2000/svg", "text")
        spacer.setAttributeNS("", "font-family", "sans-serif")
        spacer.setAttributeNS("", "font-size", "12px")
        spacer.innerHTML = "&nbsp;"
        parentSVG.appendChild(spacer)
        this.space = spacer.getComputedTextLength()
        parentSVG.removeChild(spacer)

        // set height
        let a = document.createElementNS("http://www.w3.org/2000/svg", "text")
        a.innerHTML = "X"
        parentSVG.appendChild(a)
        this.height = a.getBBox().height
        parentSVG.removeChild(a)
    }

    pullBox(): Size | undefined {
        // console.log(`TextSource.pullBox(): current=${this.current}, wordBoxes.length=${this.wordBoxes.length}`)
        if (this.current >= this.wordBoxes.length) {
            // console.log(`  return undefined`)
            return undefined
        }

        const word = this.wordBoxes[this.current]
        
        if (word.svg === undefined) {
            let text = document.createElementNS("http://www.w3.org/2000/svg", "text")
            text.style.cursor = "inherit"
            text.setAttributeNS("", "font-family", "sans-serif")
            text.setAttributeNS("", "font-size", "12px")
            text.setAttributeNS("", "stroke", "none")
            text.setAttributeNS("", "fill", "none")
            text.setAttributeNS("", "x", "0")
            text.setAttributeNS("", "y", "0")
            text.textContent = word.word
            word.svg = text
            this.parentSVG.appendChild(text)
        }

        // with the baseline at y, the bounding box provides information on ascent & descent
        const y = Number.parseFloat(word.svg.getAttributeNS("", "y") as string)
        let bbox = word.svg.getBBox()
        word.ascent = y - bbox.y
        word.ascent = y - bbox.y
        // console.log(word)

        if (word.word.length !== 0) {
            word.size.width = word.svg.getComputedTextLength()
            let bbox = word.svg.getBBox()
            word.size.height = bbox.height
        } else {
            word.size.width = 0
            word.size.height = this.height
        }

        // console.log(`  return word '${word.word}' with svg ${word.svg === undefined ? "no" : "yes"}`)

        return word.size
    }

    displayWordBoxes() {
        this.updateSVG()
    }

    updateSVG() {
        let visible = true
        for (let word of this.wordBoxes) {
            if (visible) {
                if (word.svg === undefined) {
                    console.log(`TextSource: word within visible area has no SVG element`)
                } else {
                    word.svg.setAttributeNS("", "x", `${word.origin.x}`)
                    word.svg.setAttributeNS("", "y", `${word.origin.y + word.ascent}`)
                    word.svg.setAttributeNS("", "fill", "#000")
                }
            } else {
                if (word.svg) {
                    word.svg.parentElement?.removeChild(word.svg)
                    word.svg = undefined
                }
            }
            if (word.endOfWrap)
                visible = false
        }
    }

    placeBox(origin: Point): void {
        Object.assign(this.wordBoxes[this.current].origin, origin)
        ++this.current
    }

    endOfSlice(): void {
        this.wordBoxes[this.current - 1].endOfSlice = true
    }

    endOfLine(): void {
        this.wordBoxes[this.current - 1].endOfLine = true
    }

    endOfWrap(): void {
        this.wordBoxes[this.current - 1].endOfWrap = true
    }
}
