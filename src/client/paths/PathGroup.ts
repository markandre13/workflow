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

import { Matrix } from "../../shared/geometry"
import { AbstractPath } from "./AbstractPath"

export class PathGroup extends AbstractPath {
    private data: Array<AbstractPath>
    private matrix?: Matrix
    constructor(group?: PathGroup) {
        super()
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.data = new Array<AbstractPath>()
        if (group !== undefined) {
            for (let graphic of group.data) {
                this.add(graphic.clone())
            }
            if (group.matrix) {
                this.matrix = new Matrix(group.matrix)
            }
        }
    }
    clone(): AbstractPath {
        return new PathGroup(this)
    }
    add(graphic: AbstractPath): AbstractPath {
        if (this.matrix) {
            graphic.transform(this.matrix) // FIXME: should not modify argument?
        }
        this.data.push(graphic)
        graphic.updateSVG()
        this.svg.appendChild(graphic.svg)
        return this
    }
    setAttributes(attributes: any): AbstractPath {
        for (let graphic of this.data) {
            graphic.setAttributes(attributes)
        }
        return this
    }
    public updateSVG(): void {
        for (let graphic of this.data) {
            graphic.updateSVG()
        }
    }
    public transform(matrix: Matrix): AbstractPath {
        if (!this.matrix)
            this.matrix = new Matrix(matrix)
        else
            this.matrix.append(matrix)
        for (let graphic of this.data) {
            graphic.transform(matrix)
        }
        return this
    }
}
