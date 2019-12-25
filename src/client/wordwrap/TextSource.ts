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
import { Word } from "./Word"

export class TextSource implements WordSource {
    rectangles: Array<Word>
    current: number

    space: number // hack
    
    constructor(text: string | undefined = undefined) {
        this.rectangles = new Array<Word>()
        this.current = 0
        this.space = 0
        if (text == undefined)
            text = "Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        let word = ''
        for (let char of text) {
            switch (char) {
                case ' ':
                case '\t':
                case '\r':
                case '\n':
                case '\v':
                    let rectangle = new Word(word.length * 8, 16, word)
                    this.rectangles.push(rectangle)
                    word = ""
                    break
                default:
                    word += char
            }
        }
        if (word.length > 0) {
            let rectangle = new Word(word.length * 8, 16, word)
            this.rectangles.push(rectangle)
        }
    }

    reset() {
        this.current = 0
        for (let w of this.rectangles) {
            w.reset()
            w.size.width += this.space
        }
    }

    initializeWordBoxes(svg: SVGElement) {
        // no whitespace handling yet, hence we just fake it by adding a space to
        // every words box and then center the text in the middle
        let spacer = document.createElementNS("http://www.w3.org/2000/svg", "text")
        spacer.innerHTML = "&nbsp;"
        svg.appendChild(spacer)
        this.space = spacer.getComputedTextLength()
        svg.removeChild(spacer)

        for(let r of this.rectangles) {
            let text = document.createElementNS("http://www.w3.org/2000/svg", "text")
            text.setAttributeNS("", "stroke", "none")
            text.setAttributeNS("", "fill", "none")
            text.setAttributeNS("", "x", "0")
            //text.setAttributeNS("", "width", String(r.size.width))
            text.setAttributeNS("", "y", "0")
            //text.setAttributeNS("", "height", String(r.size.height))
            text.textContent = r.word
            svg.appendChild(text)
            r.size.width = text.getComputedTextLength()+this.space // do it later so all children can be added to the dom at once?
            let bbox = text.getBBox()
            r.size.height = bbox.height
            //console.log(r.size)
            r.svg = text
        }
    }

    displayWordBoxes() {
        for(let r of this.rectangles) {
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

    placeWordBoxes() {
        for(let r of this.rectangles) {
            if (r.endOfWrap) // these have not been placed
                break

            let text = r.svg!
            r.origin.x += this.space/2
            r.size.width -= this.space
            text.setAttributeNS("", "x", String(r.origin.x))
            text.setAttributeNS("", "y", String(r.origin.y+r.ascent))
        }
    }

    pullBox(): Size | undefined {
        if (this.current >= this.rectangles.length)
            return undefined
        return this.rectangles[this.current].size
    }

    placeBox(origin: Point): void {
        this.rectangles[this.current].origin.x = origin.x
        this.rectangles[this.current].origin.y = origin.y
        ++this.current
    }

    endOfSlice(): void {
        this.rectangles[this.current-1].endOfSlice = true
    }

    endOfLine(): void {
        this.rectangles[this.current-1].endOfLine = true
    }

    endOfWrap(): void {
        this.rectangles[this.current-1].endOfWrap = true
    }
}
