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

import { Path } from "./Path"
export class AttributedPath extends Path {
    stroke: string
    strokeWidth: number
    fill: string
    constructor(path?: AttributedPath) {
        super(path as Path)
        this.stroke = "#000"
        this.strokeWidth = 1.0
        this.fill = "#fff"
        this.svg.setAttributeNS("", "stroke", this.stroke)
        this.svg.setAttributeNS("", "stroke-width", String(this.strokeWidth))
        this.svg.setAttributeNS("", "fill", this.fill)
    }
    updateSVG() {
        super.updateSVG()
        this.svg.setAttributeNS("", "stroke", this.stroke)
        this.svg.setAttributeNS("", "stroke-width", String(this.strokeWidth))
        this.svg.setAttributeNS("", "fill", this.fill)
    }
}
