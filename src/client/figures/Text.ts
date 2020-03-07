/*
 *  workflow - A collaborative real-time white- and kanban board
 *  Copyright (C) 2020 Mark-André Hopf <mhopf@mark13.org>
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

import { Point } from "../../shared/geometry"
import { AbstractPath, Path } from "../paths"
import { Figure } from "../figures"
import { Shape } from "./Shape"
import * as valuetype from "../../shared/workflow_valuetype"
import * as value     from "../../shared/workflow_value"

import { WordWrap, Slice, WordSource } from "../wordwrap/wordwrap"
import { TextSource } from "../wordwrap/TextSource"
import { Cursor } from "../wordwrap/Cursor"

export class Text extends Shape implements valuetype.figure.Text {
    text!: string
    cursor!: Cursor
    constructor(init?: Partial<Text>) {
        super(init)
        this.stroke = "none"
        this.fill = "#000"
        // this.strokeWidth = 0.0
        value.figure.initText(this, init)
    }
    distance(pt: Point): number {
        // FIXME: not final: RANGE and fill="none" need to be considered
        if (this.origin.x <= pt.x && pt.x < this.origin.x + this.size.width &&
            this.origin.y <= pt.y && pt.y < this.origin.y + this.size.height) {
            return -1.0 // even closer than 0
        }
        return Number.MAX_VALUE
    }
    getPath(): Path {
        let path = new Path()
        path.appendRect(this)
        return path
    }
    updateSVG(path: AbstractPath, parentSVG: SVGElement, svg?: SVGElement): SVGElement {
        if (!svg) {
            svg = document.createElementNS("http://www.w3.org/2000/svg", "g")
            parentSVG.appendChild(svg)
            let textSource = new TextSource("Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")
            textSource.initializeWordBoxes(svg)
            let wordwrap = new WordWrap(path as Path, textSource)
            wordwrap.placeWordBoxes(textSource)
            textSource.displayWordBoxes()
            this.cursor = new Cursor(svg, wordwrap, textSource)
            parentSVG.removeChild(svg) // FIXME: change API so that figures add themselves to the parent
        } else {
            svg.innerHTML=""
            let textSource = new TextSource("Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")
            textSource.initializeWordBoxes(svg)
            let wordwrap = new WordWrap(path as Path, textSource)
            wordwrap.placeWordBoxes(textSource)
            textSource.displayWordBoxes()
        }
        return svg
    }
}
