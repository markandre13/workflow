/*
 *  workflow - A collaborative real-time white- and kanban board
 *  Copyright (C) 2018 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Point, Size } from "../../shared/geometry"
import { WordSource } from "./wordwrap"
import { WordBox } from "./WordBox"
import { runInThisContext } from "vm"

export class TextSource implements WordSource {
    wordBoxes: Array<WordBox>
    current: number

    space: number // hack
    
    constructor(text?: string) {
        this.wordBoxes = new Array<WordBox>()
        this.current = 0
        this.space = 0

        if (text == undefined)
            text = "Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        this.createWordBoxes(text)
        console.log(`TextSource initialized with ${this.wordBoxes.length} words.`)
    }

    createWordBoxes(text: string): void {
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
            w.size.width += this.space
        }
    }

    initializeWordBoxes(parentSVG: SVGElement) {
        // no whitespace handling yet, hence we just fake it by adding a space to
        // every words box and then center the text in the middle
        let spacer = document.createElementNS("http://www.w3.org/2000/svg", "text")
        spacer.innerHTML = "&nbsp;"
        parentSVG.appendChild(spacer)
        this.space = spacer.getComputedTextLength()
        parentSVG.removeChild(spacer)

        let a = document.createElementNS("http://www.w3.org/2000/svg", "text")
        a.innerHTML = "X"
        parentSVG.appendChild(a)
        let height = a.getBBox().height
        parentSVG.removeChild(a)

        console.log(`initializeWordBoxes: ${this.wordBoxes.length}`)

        for(let r of this.wordBoxes) {
            let text = document.createElementNS("http://www.w3.org/2000/svg", "text")
            text.style.cursor = "inherit"
            text.setAttributeNS("", "stroke", "none")
            text.setAttributeNS("", "fill", "none")
            text.setAttributeNS("", "x", "0")
            //text.setAttributeNS("", "width", String(r.size.width))
            text.setAttributeNS("", "y", "0")
            //text.setAttributeNS("", "height", String(r.size.height))
            text.textContent = r.word
            parentSVG.appendChild(text)
            if (r.word.length === 0) {
                r.size.width = text.getComputedTextLength()+this.space // do it later so all children can be added to the dom at once?
                let bbox = text.getBBox()
                r.size.height = bbox.height
            } else {
                r.size.width = 0
                r.size.height = height
            }
            console.log(`r.word.length=${r.word.length}, r.size.height=${r.size.height}, height=${height}`)
            // console.log(`TextSource initialized word '${r.word}' box with ${r.size.width}, ${r.size.height} words.`)
            //console.log(r.size)
            r.svg = text
        }
    }

    displayWordBoxes() {
        for(let r of this.wordBoxes) {
            if (r.endOfWrap) // these have not been placed
                break

            let text = r.svg!
            r.origin.x += this.space/2
            r.size.width -= this.space
            text.setAttributeNS("", "x", String(r.origin.x))
            
            // text was placed at (0, 0), hence bbox.y is the negative ascent
            let bbox = text.getBBox()
            r.ascent = -bbox.y

            text.setAttributeNS("", "y", String(r.origin.y+r.ascent))

            // console.log(`display word '${r.word}' at ${r.origin.x},${r.origin.y+r.ascent}`)

            text.setAttributeNS("", "fill", "#000")
        }
    }

    updateSVG() {
        let visible = true
        for(let r of this.wordBoxes) {
            if (r.endOfWrap)
                visible = false
            let text = r.svg!
            if (visible) {
                r.origin.x += this.space/2
                r.size.width -= this.space
                text.setAttributeNS("", "x", String(r.origin.x))
                text.setAttributeNS("", "y", String(r.origin.y+r.ascent))
                text.setAttributeNS("", "fill", "#000")
            } else {
                text.setAttributeNS("", "fill", "none")
            }
        }
    }

    pullBox(): Size | undefined {
        console.log(`TextSource.pullBox(): currrent=${this.current}, rectangles=${this.wordBoxes.length}`)
        if (this.current >= this.wordBoxes.length)
            return undefined
        return this.wordBoxes[this.current].size
    }

    placeBox(origin: Point): void {
        this.wordBoxes[this.current].origin.x = origin.x
        this.wordBoxes[this.current].origin.y = origin.y
        ++this.current
    }

    endOfSlice(): void {
        this.wordBoxes[this.current-1].endOfSlice = true
    }

    endOfLine(): void {
        this.wordBoxes[this.current-1].endOfLine = true
    }

    endOfWrap(): void {
        this.wordBoxes[this.current-1].endOfWrap = true
    }
}
