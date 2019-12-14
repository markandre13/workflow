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
    constructor(text: string | undefined = undefined) {
        this.rectangles = new Array<Word>()
        this.current = 0
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
                    // console.log(word)
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
        // this.remaining = remaining
        // this.style = true
        // this.rectangles = new Array<Rectangle>()
    }
    pullBox(): Size | undefined {
        if (this.current >= this.rectangles.length)
            return undefined
        return this.rectangles[this.current].size
        // if (this.remaining === 0)
        //     return undefined
        // --this.remaining
        // this.box = new Size(this.style ? 40 : 20, 20)
        // this.style = !this.style
        // return this.box
        return undefined;
    }
    placeBox(origin: Point): void {
        this.rectangles[this.current].origin.x = origin.x
        this.rectangles[this.current].origin.y = origin.y
        ++this.current
        // let rectangle = new Rectangle(origin, this.box!)
        // this.rectangles.push(rectangle)
    }
}
