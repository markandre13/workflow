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

import { Point } from "shared/geometry"
import { AbstractPath, Path } from "../paths"
import { Shape } from "./Shape"
import * as valuetype from "shared/workflow_valuetype"
import * as value     from "shared/workflow_value"

import { WordWrap } from "../wordwrap/wordwrap"
import { TextSource } from "../wordwrap/TextSource"
import { Cursor } from "../wordwrap/Cursor"

export class Text extends Shape implements valuetype.figure.Text {
    text!: string
    textSource: TextSource
    cursor!: Cursor
    constructor(init?: Partial<Text>) {
        super(init)
        this.stroke = "none"
        this.fill = "#000"
        // this.strokeWidth = 0.0
        value.figure.initText(this, init)
        // this.text ="Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        this.textSource = new TextSource(this.text)
        
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

    override updateSVG(path: AbstractPath, parentSVG: SVGElement, svg?: SVGElement): SVGElement {
        if (!svg) {
            // console.trace(`Text.updateSVG(): create new SVG group for the text`)
            // console.log(this)
            svg = document.createElementNS("http://www.w3.org/2000/svg", "g")
            svg.style.cursor = "inherit"
            parentSVG.appendChild(svg) // add to parent to that the calculation works

            this.textSource.initializeWordBoxes(svg)
            let wordwrap = new WordWrap(path as Path)
            wordwrap.placeWordBoxes(this.textSource)
            this.textSource.updateSVG()
            this.cursor = new Cursor(svg, wordwrap, this.textSource)
            parentSVG.removeChild(svg) // FIXME: change API so that figures add themselves to the parent
        } else {
            // console.log(`Text.updateSVG(): update existing SVG`)
            this.textSource.reset()
            this.textSource.initializeWordBoxes(svg)
            let wordwrap = new WordWrap(path as Path)
            wordwrap.placeWordBoxes(this.textSource)
            this.textSource.updateSVG()
            this.cursor.updateCursor()
        }
        return svg
    }
}
