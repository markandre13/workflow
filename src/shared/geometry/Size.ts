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

import * as value from "../workflow_value"
import { GIOPDecoder } from "corba.js"

export class Size implements value.Size {
    width!: number
    height!: number

    constructor()
    constructor(size: Partial<Size>)
    constructor(width: number, height: number)
    constructor(decoder: GIOPDecoder)
    constructor(widthOrSize?: number | Partial<Size> | GIOPDecoder, height?: number) {
        if (widthOrSize instanceof GIOPDecoder) {
            value.initSize(this, widthOrSize)
        }
        else if (widthOrSize === undefined) {
            value.initSize(this)
        }
        else if (typeof widthOrSize === "object") {
            value.initSize(this, widthOrSize)
        } else {
            value.initSize(this, { width: widthOrSize, height: height! })
        }
    }
    toString() {
        return `Size(${this.width}, ${this.height})`
    }
}
