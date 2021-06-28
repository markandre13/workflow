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

import { Matrix } from "shared/geometry"
import { AbstractPath } from "./AbstractPath"

// PathGroup represents a group of paths
// there are two modi this can work
// * transformation of the SVG group containing the children
//   this should also scale line width, patterns, etc.
// * transformation of the paths within the SVG group
//   this should scale the children, but retain line width, patterns, etc.
export class PathGroup extends AbstractPath {
    data: Array<AbstractPath>
    matrix?: Matrix
    constructor(group?: PathGroup) {
        super()
        this.data = new Array<AbstractPath>()
        if (group !== undefined) {
            for (let path of group.data) {
                this.add(path.clone())
            }
            if (group.matrix) {
                this.matrix = new Matrix(group.matrix)
            }
        }
    }
    clone(): AbstractPath {
        return new PathGroup(this)
    }
    clear(): void {
        this.data.length = 0
    }
    add(path: AbstractPath): AbstractPath {
        this.data.push(path)
        return this
    }
    public transform(matrix: Matrix): AbstractPath {
        console.log(`PathGroup.transform()`)
        if (!this.matrix)
            this.matrix = new Matrix(matrix)
        else
            this.matrix.prepend(matrix)
        return this
    }
}
