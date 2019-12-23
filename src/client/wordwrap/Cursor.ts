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
import { Point } from "../../shared/workflow_valueimpl"

export class Cursor {
    svg: SVGElement
    timer: undefined | number
    position: Point
    xDuringVerticalMovement: undefined | number
    cursor: SVGLineElement
    boxes: Array<Word>
    offsetWord: number
    offsetChar: number

    constructor(svg: SVGElement, boxes: Array<Word>) {
        this.svg = svg
        this.boxes = boxes
        this.position = new Point()
        this.xDuringVerticalMovement = undefined
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
            switch (e.keyCode) { // FIXME: keyCode is marked as deprecated in TypeScript definition
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

            switch (e.keyCode) { // FIXME: keyCode is marked as deprecated in TypeScript definition
                case KEY_DOWN:
                    console.log("keyDown: start")
                    if (this.xDuringVerticalMovement === undefined)
                        this.xDuringVerticalMovement = this.position.x

                    if (this.gotoNextRow()) {
                        console.log("keyDown: found next line")
                        this.gotoCursorHorizontally(this.xDuringVerticalMovement)
                        this.updateCursor()
                    }
                    console.log("keyDown: done")
                    break
                case KEY_UP:
                    console.log("keyDown: start")
                    if (this.xDuringVerticalMovement === undefined)
                        this.xDuringVerticalMovement = this.position.x
                    if (this.gotoPreviousRow()) {
                        console.log("keyDown: found previous line")
                        this.gotoCursorHorizontally(this.xDuringVerticalMovement)
                        this.updateCursor()
                    }
                    console.log("keyDown: done")
                    break
                default:
                    this.xDuringVerticalMovement = undefined    
            }
        }
    }

    // FIXME: name does not indicate position is not changed
    gotoNextRow(): boolean {
        let offsetWord = this.offsetWord
        while(offsetWord < this.boxes.length && !this.boxes[offsetWord++].endOfLine) {}
        if (offsetWord >= this.boxes.length)
            return false
        this.offsetWord = offsetWord
        this.offsetChar = 0
        return true
    }

    gotoPreviousRow(): boolean {
        console.log(`gotoPreviousRow: enter`)
        let offsetWord = this.offsetWord

        console.log(`gotoPreviousRow: goto bol in current line`)
        while(offsetWord > 0 && !this.boxes[offsetWord-1].endOfLine) {
            --offsetWord
        }
        console.log(`gotoPreviousRow: bol offsetWord=${offsetWord}`)

        if (offsetWord == 0)
            return false

        --offsetWord

        console.log(`gotoPreviousRow: goto bol in previous line`)
        while(offsetWord > 0 && !this.boxes[offsetWord-1].endOfLine) {
            --offsetWord
        }
        console.log(`gotoPreviousRow: offsetWord=${offsetWord}`)
        this.offsetWord = offsetWord
        this.offsetChar = 0
        console.log(`gotoPreviousRow: leave`)
        return true
    }

    // FIXME: name does not indicate going from offset(Char|Word) to position.x
    gotoCursorHorizontally(x: number) {
        let offsetWord = this.offsetWord
        let offsetChar = this.offsetChar
        console.log(`gotoCursorHorizontally(): enter with x=${x}, offsetWord=${offsetWord}, offsetChar=${offsetChar}`)
        while(true) {
            let r = this.boxes[offsetWord]
     
            // current position is left of r => stop
            if (x < r.origin.x) {
                console.log("gotoCursorHorizontally: current position is left of r => stop")
                break
            }
            // current position is right of r => next word
            if (x > r.origin.x + r.size.width) {
                if (r.endOfLine) {
                    console.log(`gotoCursorHorizontally: current position ${x} is right of ${r.origin.x + r.size.width} and we are end of line => stop`)
                    offsetChar = r.word.length
                    break
                } else {
                    ++offsetWord
                    console.log(`gotoCursorHorizontally: current position ${x} is right of ${r.origin.x + r.size.width} => next word ${offsetWord}`)
                    continue
                }
            }
            console.log("gotoCursorHorizontally: search within word")
            offsetChar = -1
            let x0=r.origin.x
            for(let i=1; i<=r.word.length; ++i) {
                let x1 = r.origin.x + r.svg!.getSubStringLength(0, i)
                console.log(`i=${i}, x=${x1}`)
                if (x < x1) {
                    console.log(`found character after x=${x}, x0=${x0}, x1=${x1}, compare x1-x >= x-x0 (${x1-x} >= ${x-x0})`)
                    if (x1-x >= x-x0) {
                        offsetChar = i-1
                    } else {
                        offsetChar = i
                    }
                    console.log(`offsetChar=${offsetChar}`)
                    break
                }
                x0 = x1
            }
            if (offsetChar == -1) {
                throw Error("failed to place cursor")
            }
            break
        } //  while(!this.boxes[offsetWord].endOfLine)
        this.offsetWord = offsetWord
        this.offsetChar = offsetChar
        console.log(`gotoCursorHorizontally: offsetWord=${offsetWord}, offsetChar=${offsetChar}`)
    }
    
    updateCursor() {
        let r = this.boxes[this.offsetWord]!
        let x = r.svg!.getSubStringLength(0, this.offsetChar)
        // set position
        this.position.x = r.origin.x + x
        this.position.y = r.origin.y

        console.log(`updateCursor(): offsetWord=${this.offsetWord}, offsetChar=${this.offsetChar}, x=${this.position.x}`)

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
