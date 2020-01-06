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
import * as valuetype from "../../shared/workflow_valuetype"
import * as value     from "../../shared/workflow_value"
import { AbstractPath } from "../paths/AbstractPath"
import { PathGroup } from "../paths/PathGroup"

export class Group extends Figure implements valuetype.figure.Group {
    childFigures!: Array<Figure>
    constructor(init?: Partial<Group>) {
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
    getPath(): AbstractPath {
        let path = new PathGroup()
        for (let child of this.childFigures) {
            path.add(child.getPath() as AbstractPath)
        }
        return path
    }
}
