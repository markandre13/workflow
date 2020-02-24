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

export class Text extends Shape implements valuetype.figure.Text {
    text!: string
    constructor(init?: Partial<Text>) {
        super(init)
        this.stroke = "none"
        this.fill = "#000"
        // this.strokeWidth = 0.0
        value.figure.initText(this, init)

        this.size.height = 25
        this.size.width = this.text.length * 12
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
    updateSVG(path: AbstractPath, svg?: SVGElement): SVGElement {
        if (!svg)
            svg = document.createElementNS("http://www.w3.org/2000/svg", "text") 
        let svgPath = svg as SVGTextElement
        let p = path as Path
        svgPath.textContent = this.text
        svg.setAttributeNS("", "stroke-width", String(this.strokeWidth))
        svg.setAttributeNS("", "stroke", this.stroke)
        svg.setAttributeNS("", "fill", this.fill)
        svg.setAttributeNS("", "x", p.data[0].values[0])
        svg.setAttributeNS("", "y", p.data[0].values[1])
        return svg
    }
}
