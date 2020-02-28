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

import * as value  from "../../shared/workflow_value"
import * as valuetype from "../../shared/workflow_valuetype"
import { Path, AbstractPath } from "../paths"
import { Point, Rectangle, Matrix } from "../../shared/geometry"

export abstract class Figure implements valuetype.Figure
{
    id!: number
    matrix!: Matrix // FIXME in corba.js: should be optional

    public static readonly FIGURE_RANGE = 5.0
    public static readonly HANDLE_RANGE = 5.0
    
    constructor(init?: Partial<value.Figure>) {
        value.initFigure(this, init)
    }

    abstract getPath(): Path
    updateSVG(path: AbstractPath, parentSVG: SVGElement, svg?: SVGElement): SVGElement {
        throw Error("updateSVG is not implemented for this class")
    }
    abstract transform(matrix: Matrix): boolean
    abstract bounds(): Rectangle
    abstract distance(point: Point): number
    abstract getHandlePosition(handleId: number): Point | undefined
    abstract setHandlePosition(handleId: number, position: Point): void
}
