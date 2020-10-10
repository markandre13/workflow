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

import { Rectangle } from "../../shared/geometry"

export class WordBox extends Rectangle {
    word: string
    ascent: number
    endOfLine: boolean  // to discover line breaks
    endOfSlice: boolean // to discover when to stop drawing selection
    endOfWrap: boolean  // to discover end of visible words
    svg: SVGTextElement | undefined
    constructor(w: number, h: number, word: string) {
        super(0, 0, w, h)
        this.word = word
        this.ascent = 0
        this.endOfLine = false
        this.endOfSlice = false
        this.endOfWrap = false
    }

    reset() {
        this.endOfLine = false
        this.endOfSlice = false
        this.endOfWrap = false
    }
}
