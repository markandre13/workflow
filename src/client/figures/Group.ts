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
import { Point } from "shared/geometry/Point"
import { Matrix } from "shared/geometry/Matrix"
import { Figure } from "./Figure"
import * as valuetype from "shared/workflow_valuetype"
import * as value     from "shared/workflow_value"
import { Path } from "../paths/Path"

export class Group extends Figure implements valuetype.figure.Group {
    childFigures!: Array<Figure>
    constructor(init?: Partial<value.figure.Group>) {
        super(init)
        value.figure.initGroup(this, init)
    }
    add(figure: Figure) {
        this.childFigures.push(figure)
    }
    transform(transform: Matrix): boolean {
        return false
    }
    distance(pt: Point): number {
        throw Error("not yet implemented")
    }
    bounds(): Rectangle {
        throw Error("not yet implemented")
    }
    getHandlePosition(i: number): Point | undefined {
        return undefined
    }
    setHandlePosition(handle: number, pt: Point): void {
    }
    getPath(): Path {
        throw Error("nope")
        // let path = new PathGroup()
        // for (let child of this.childFigures) {
        //     path.add(child.getPath())
        // }
        // return path
    }
}
