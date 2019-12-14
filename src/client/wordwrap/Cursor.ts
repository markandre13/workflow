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

import { Word } from "./Word"

export class Cursor {
    svg: SVGElement
    timer: undefined | number
    cursor: SVGLineElement
    boxes: Array<Word>
    offsetWord: number
    offsetChar: number
    constructor(svg: SVGElement, boxes: Array<Word>) {
        this.svg = svg
        this.boxes = boxes
        this.offsetWord = 0
        this.offsetChar = 0
        this.cursor = this.createCursor()
        this.catchKeyboard()
    }
    createCursor(): SVGLineElement {
        let r = this.boxes[0]
        let cursor = this.cursor = document.createElementNS("http://www.w3.org/2000/svg", "line")
        cursor.setAttributeNS("", "stroke", "#000")
        this.updateCursor()
        this.svg.appendChild(cursor)
        return cursor
    }
    catchKeyboard() {
        window.onkeydown = (e: KeyboardEvent) => {
            e.preventDefault()
            let KEY_LEFT = 37, KEY_UP = 38, KEY_RIGHT = 39, KEY_DOWN = 40
            let r = this.boxes[this.offsetWord]!
            // console.log(`keydown ${e.key} ${e.code} ${e.charCode} ${e.key} ${e.keyCode}`)
            switch (e.keyCode) {
                case KEY_RIGHT:
                    ++this.offsetChar
                    if (this.offsetChar > r.word.length) {
                        if (this.offsetWord >= this.boxes.length) {
                            --this.offsetChar
                            break
                        }
                        this.offsetChar = 0
                        ++this.offsetWord
                    }
                    this.updateCursor()
                    break
                case KEY_LEFT:
                    if (this.offsetWord === 0 && this.offsetChar === 0)
                        break
                    --this.offsetChar
                    if (this.offsetChar < 0) {
                        --this.offsetWord
                        r = this.boxes[this.offsetWord]!
                        this.offsetChar = r.word.length
                    }
                    this.updateCursor()
                    break
            }
        }
    }
    updateCursor() {
        let r = this.boxes[this.offsetWord]!
        let x = r.svg!.getSubStringLength(0, this.offsetChar)
        // set position
        this.cursor.setAttributeNS("", "x1", String(r.origin.x + x))
        this.cursor.setAttributeNS("", "y1", String(r.origin.y))
        this.cursor.setAttributeNS("", "x2", String(r.origin.x + x))
        this.cursor.setAttributeNS("", "y2", String(r.origin.y + r.size.height))
        // disable blinking for 0.5s while moving
        if (this.timer) {
            window.clearTimeout(this.timer)
            this.timer = undefined
        }
        this.cursor.classList.remove("cursor-blink")
        this.timer = window.setTimeout(() => {
            this.cursor.classList.add("cursor-blink")
            this.timer = undefined
        }, 500)
    }
}
