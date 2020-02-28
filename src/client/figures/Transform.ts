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

import { Point, Rectangle, Matrix } from "../../shared/geometry"
import { Figure } from "./Figure"
import { Group } from "./Group"
import * as valuetype from "../../shared/workflow_valuetype"
import * as value     from "../../shared/workflow_value"
// import { AbstractPath } from "../paths/AbstractPath"
import { PathGroup } from "../paths/PathGroup"
import { Path } from "../paths/Path"

export class Transform extends Group implements valuetype.figure.Transform {
    matrix!: Matrix // FIXME?: why store a matrix here when there's also one in ext.Group?
    constructor(init?: Partial<Transform>) {
        super(init)
        value.figure.initTransform(this, init)
    }
    add(figure: Figure) {
        this.childFigures.push(figure)
    }
    transform(matrix: Matrix): boolean {
        this.matrix.prepend(matrix)
        return true
    }
    appendMatrix(matrix: Matrix): boolean {
        this.matrix.append(matrix)
        return true
    }
    prependMatrix(matrix: Matrix): boolean {
        this.matrix.prepend(matrix)
        return true
    }
    distance(pt: Point): number {
        let m = new Matrix(this.matrix)
        m.invert()
        pt = m.transformPoint(pt)
        return this.childFigures[0].distance(pt)
    }
    bounds(): Rectangle {
        let path = new Path()
        path.appendRect(this.childFigures[0].bounds())
        path.transform(this.matrix)
        return path.bounds()
    }
    getHandlePosition(i: number): Point | undefined {
        return undefined
    }
    setHandlePosition(handle: number, pt: Point): void {
    }
    getPath(): Path {
        let path = super.getPath()
        path.transform(this.matrix)
        return path
    }
}
