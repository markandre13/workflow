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

import { Rectangle } from "shared/geometry/Rectangle"

export class WordBox extends Rectangle {
    word: string
    endOfLine: boolean  // to discover line breaks
    endOfSlice: boolean // to discover when to stop drawing selection
    endOfWrap: boolean  // to discover end of visible words
    svg: SVGTextElement | undefined
    ascent = 0
    constructor(w: number, h: number, word: string) {
        super(0, 0, w, h)
        this.word = word
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
