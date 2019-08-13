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

import { Point } from "../../shared/geometry"
import { Path } from "../paths/Path"
import { Shape } from "./Shape"
import * as valuetype from "../../shared/workflow_valuetype"
import * as value     from "../../shared/workflow_value"

export class Rectangle extends Shape implements valuetype.figure.Rectangle {
    path?: Path
    constructor(init?: Partial<Rectangle>) {
        super(init)
        value.figure.initRectangle(this, init)
    }
    distance(pt: Point): number {
        // FIXME: not final: RANGE and fill="none" need to be considered
        if (this.origin.x <= pt.x && pt.x < this.origin.x + this.size.width &&
            this.origin.y <= pt.y && pt.y < this.origin.y + this.size.height) {
            return -1.0 // even closer than 0
        }
        return Number.MAX_VALUE
    }
    getGraphic(): Graphic {
        if (this.path === undefined) {
            this.path = new Path()
            this.updateGraphic()
        }
        return this.path
    }
    updateGraphic(): void {
        if (!this.path)
            return
        this.path.clear()
        this.path.appendRect(this)
        this.path.updateSVG()
        this.path.svg.setAttributeNS("", "stroke", this.stroke)
        this.path.svg.setAttributeNS("", "fill", this.fill)
    }
}
