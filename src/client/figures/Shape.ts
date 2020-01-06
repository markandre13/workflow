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

import { Point, Size, Rectangle, Matrix } from "../../shared/geometry"
import { AttributedFigure } from "./AttributedFigure"

import * as valuetype from "../../shared/workflow_valuetype"
import * as value     from "../../shared/workflow_value"

export abstract class Shape extends AttributedFigure implements valuetype.figure.Shape {
    origin!: Point
    size!: Size
    constructor(init?: Partial<Shape>) {
        super(init)
        value.figure.initShape(this, init)
    }
    transform(transform: Matrix): boolean {
        if (!transform.isOnlyTranslateAndScale())
            return false
        this.origin = transform.transformPoint(this.origin)
        this.size = transform.transformSize(this.size)
        return true
    }
    bounds(): Rectangle {
        return new Rectangle(this)
    }
    getHandlePosition(i: number): Point | undefined {
        switch (i) {
            case 0: return { x: this.origin.x, y: this.origin.y }
            case 1: return { x: this.origin.x + this.size.width, y: this.origin.y }
            case 2: return { x: this.origin.x + this.size.width, y: this.origin.y + this.size.height }
            case 3: return { x: this.origin.x, y: this.origin.y + this.size.height }
        }
        return undefined
    }
    setHandlePosition(handle: number, pt: Point): void {
        if (handle < 0 || handle > 3)
            throw Error("fuck")
        if (handle == 0 || handle == 3) {
            this.size.width += this.origin.x - pt.x
            this.origin.x = pt.x
        }
        else {
            this.size.width += pt.x - (this.origin.x + this.size.width)
        }
        if (handle == 0 || handle == 1) {
            this.size.height += this.origin.y - pt.y
            this.origin.y = pt.y
        }
        else {
            this.size.height += pt.y - (this.origin.y + this.size.height)
        }
    }
}
