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

import { Point, Size } from "shared/geometry"
import { WordSource } from "./wordwrap"
import { WordBox } from "./WordBox"

export class TextSource implements WordSource {
    wordBoxes: Array<WordBox>
    current: number

    parentSVG!: SVGElement
    space: number // hack
    height: number // hack

    constructor(text?: string) {
        this.wordBoxes = new Array<WordBox>()
        this.current = 0
        this.space = 0
        this.height = 0

        if (text == undefined)
            text = "Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        this.splitTextIntoWordBoxes(text)
        console.log(`TextSource initialized with ${this.wordBoxes.length} words.`)
    }

    protected splitTextIntoWordBoxes(text: string): void {
        let word = ''
        for (let char of text) {
            switch (char) {
                case ' ':
                case '\t':
                case '\r':
                case '\n':
                case '\v':
                    let rectangle = new WordBox(word.length * 8, 16, word)
                    this.wordBoxes.push(rectangle)
                    word = ""
                    break
                default:
                    word += char
            }
        }
        if (word.length > 0) {
            let rectangle = new WordBox(word.length * 8, 16, word)
            this.wordBoxes.push(rectangle)
        }
        if (this.wordBoxes.length === 0) {
            let rectangle = new WordBox(0, 16, "")
            this.wordBoxes.push(rectangle)
        }
    }

    reset() {
        this.current = 0
        for (let w of this.wordBoxes) {
            w.reset()
            // w.size.width += this.space
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

        console.log(`initializeWordBoxes: ${this.wordBoxes.length}`)
    }

    pullBox(): Size | undefined {
        // console.log(`TextSource.pullBox(): currrent=${this.current}, rectangles=${this.wordBoxes.length}`)
        if (this.current >= this.wordBoxes.length)
            return undefined

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
            // baseline was set to y = 0, hence the bounding box now reveals ascent & descent
            let bbox = word.svg.getBBox()
            word.ascent = -bbox.y
        }

        if (word.word.length !== 0) {
            word.size.width = word.svg.getComputedTextLength()
            let bbox = word.svg.getBBox()
            word.size.height = bbox.height
        } else {
            word.size.width = 0
            word.size.height = this.height
        }

        return word.size
    }

    displayWordBoxes() {
        for (let word of this.wordBoxes) {
            if (word.endOfWrap || word.svg === undefined) // these have not been placed
                break

            word.svg.setAttributeNS("", "x", `${word.origin.x}`)
            word.svg.setAttributeNS("", "y", `${word.origin.y + word.ascent}`)
            word.svg.setAttributeNS("", "fill", "#000")
        }
    }

    updateSVG() {
        let visible = true
        for (let word of this.wordBoxes) {
            if (word.endOfWrap)
                visible = false
            if (word.svg === undefined)
                break
            if (visible) {
                word.svg.setAttributeNS("", "x", `${word.origin.x}`)
                word.svg.setAttributeNS("", "y", `${word.origin.y + word.ascent}`)
                word.svg.setAttributeNS("", "fill", "#000")
            } else {
                word.svg.setAttributeNS("", "fill", "#f80")
            }
        }
    }

    placeBox(origin: Point): void {
        this.wordBoxes[this.current].origin.x = origin.x
        this.wordBoxes[this.current].origin.y = origin.y
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
