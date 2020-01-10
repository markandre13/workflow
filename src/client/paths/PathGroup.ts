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
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "g")
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
        // REMOVE FROM SVG
        this.data.length = 0
    }
    add(path: AbstractPath): AbstractPath {
        if (this.matrix) {
            path.transform(this.matrix) // FIXME: should not modify argument?
        }
        this.data.push(path)
        path.updateSVG()
        this.svg.appendChild(path.svg)
        return this
    }
    setAttributes(attributes: any): AbstractPath {
        for (let path of this.data) {
            path.setAttributes(attributes)
        }
        return this
    }
    public updateSVG(): void {
        //for(let x of this.svg.childNodes) {
        // for(let i=0; i<this.svg.children.length; ++i) {
        while(this.svg.children.length>0) {
            this.svg.removeChild(this.svg.children[0])
        }
        for (let path of this.data) {
            path.updateSVG()
            this.svg.appendChild(path.svg)
        }
    }
    public transform(matrix: Matrix): AbstractPath {
        console.log(`PathGroup.transform()`)
        if (!this.matrix)
            this.matrix = new Matrix(matrix)
        else
            this.matrix.prepend(matrix)
        for (let path of this.data) {
            path.transform(matrix)
        }
        return this
    }
}
