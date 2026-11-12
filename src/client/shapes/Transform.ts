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
import { PointLike } from "shared/geometry/Point"
import { Matrix } from "shared/geometry/Matrix"
import { Path } from "client/paths/Path"
import { Shape } from "./Shape"
import { Group } from "./Group"
import * as valuetype from "shared/workflow_valuetype"
import * as value from "shared/workflow_value"

// TODO: get rid of this class and move the functionality into Group
export class Transform extends Group implements valuetype.shape.Transform {
    constructor(init?: Partial<Transform>) {
        super(init)
        value.shape.initTransform(this, init)
    }
    override add(shape: Shape) {
        this.childShapes.push(shape)
    }
    override transform(matrix: Matrix): boolean {
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
    override distance(pt: PointLike): number {
        let m = new Matrix(this.matrix)
        m.invert()
        pt = m.transformPoint(pt)
        return this.childShapes[0].distance(pt)
    }
    override bounds(): Rectangle {
        let path = new Path()
        path.appendRect(this.childShapes[0].bounds())
        path.transform(this.matrix)
        return path.bounds()
    }
    override getHandlePosition(i: number): PointLike | undefined {
        return undefined
    }
    override setHandlePosition(handle: number, pt: PointLike): void {
    }
    override getPath(): Path {
        let path = super.getPath()
        path.transform(this.matrix)
        return path
    }
}
