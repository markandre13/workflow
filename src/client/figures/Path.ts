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
import { AbstractPath, Path as RawPath } from "../paths"
import { AttributedFigure } from "./AttributedFigure"
import { figure } from "shared/workflow"
import * as valuetype from "shared/workflow_valuetype"
import * as value     from "shared/workflow_value"

export class Path extends AttributedFigure implements valuetype.figure.Path {
    types!: number[]
    values!: number[]
    constructor(init?: Partial<Path>) {
        if (init instanceof RawPath) {
            super()
            value.figure.initPath(this)
        } else {
            super(init)
            value.figure.initPath(this, init)
        }
    }

    // operations for PenTool
    // add an anchor plus method so change that anchor?
    // addAnchor(x, y)
    // smoothLastAnchor(...)
    // edgeToSmooth // that's symmetric
    // lineTo

    move(point: Point) {
        this.types.push(figure.AnchorType.ANCHOR_EDGE)
        this.values.push(point.x)
        this.values.push(point.y)
    }
    line(point: Point) {
        this.types.push(figure.AnchorType.ANCHOR_EDGE)
        this.values.push(point.x)
        this.values.push(point.y)
    }
    // curve(p0: Point, p1: Point, p2: Point) { this.path.curve(p0, p1, p2) }
    // close() { this.path.close() }
  
    override getPath(): RawPath {
        const path = new RawPath()
        let idxValue = 0
        for(let idxType = 0; idxType < this.types.length; ++idxType) {
            switch(this.types[idxType]) {
                case figure.AnchorType.ANCHOR_EDGE:
                    if (idxType === 0) {
                        path.move(this.values[idxValue++], this.values[idxValue++])
                    } else {
                        path.line(this.values[idxValue++], this.values[idxValue++])
                    }
                    break
                case figure.AnchorType.ANCHOR_EDGE_ANGLE:
                    break
                case figure.AnchorType.ANCHOR_ANGLE_EDGE:
                    break
                case figure.AnchorType.ANCHOR_SMOOTH:
                    break
                case figure.AnchorType.ANCHOR_ANGLE_ANGLE:
                    break
                }
        }
        return path
        // TODO: tweak the outline code to do without? yes, because a path will usually be
        // much larger than those figures which create a path on demand
        // return new RawPath(this.path) 
    }
    override toString() {
        const path = this.getPath()
        if (this.matrix===undefined) {
            return `figure.Path(d="${path}")`
        } else {
            return `figure.Path(matrix=${this.matrix}, d="${path}")`
        }
    }
    override updateSVG(path: AbstractPath, parentSVG: SVGElement, svg?: SVGElement): SVGElement {
        if (!svg)
            svg = document.createElementNS("http://www.w3.org/2000/svg", "path")
        svg.setAttributeNS("", "d", this.getPath().toString())
        svg.setAttributeNS("", "stroke-width", String(this.strokeWidth))
        svg.setAttributeNS("", "stroke", this.stroke)
        svg.setAttributeNS("", "fill", this.fill)
        return svg
    }

    // TODO: why have a distance method when the RawPath can be used for that?
    override distance(pt: Point): number {
        throw Error("yikes")
        // TODO: consider range/scale?
        // if (this.fill !== "none" && this.path.contains(pt)) {
        //     return -1
        // }
        // const d = this.path.distance(pt)
        // return d
    }

    transform(transform: Matrix): boolean {
        throw Error("yikes")
        // if (transform.isIdentity()) // FIXME: this should never happen
        //     return true
        // if (!transform.isOnlyTranslateAndScale())
        //     return false
        // this.path.transform(transform)
        // return true
    }

    bounds(): Rectangle {
        throw Error("yikes")
        // return this.path.bounds()
    }

    getHandlePosition(i: number): Point | undefined {
        // switch (i) {
        //     case 0: return { x: this.origin.x, y: this.origin.y }
        //     case 1: return { x: this.origin.x + this.size.width, y: this.origin.y }
        //     case 2: return { x: this.origin.x + this.size.width, y: this.origin.y + this.size.height }
        //     case 3: return { x: this.origin.x, y: this.origin.y + this.size.height }
        // }
        return undefined
    }

    setHandlePosition(handle: number, pt: Point): void {
        // if (handle < 0 || handle > 3)
        //     throw Error("yikes")
        // if (handle == 0 || handle == 3) {
        //     this.size.width += this.origin.x - pt.x
        //     this.origin.x = pt.x
        // }
        // else {
        //     this.size.width += pt.x - (this.origin.x + this.size.width)
        // }
        // if (handle == 0 || handle == 1) {
        //     this.size.height += this.origin.y - pt.y
        //     this.origin.y = pt.y
        // }
        // else {
        //     this.size.height += pt.y - (this.origin.y + this.size.height)
        // }
    }
    toInternalString() {
        let d = ""
        let idxValue = 0
        for(let idxType = 0; idxType < this.types.length; ++idxType) {
            switch(this.types[idxType]) {
                case figure.AnchorType.ANCHOR_EDGE:
                    d += `E ${this.values[idxValue++]} ${this.values[idxValue++]} `
                    break
                case figure.AnchorType.ANCHOR_EDGE_ANGLE:
                    d += `EA ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} `
                    break
                case figure.AnchorType.ANCHOR_ANGLE_EDGE:
                    d += `AE ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} `
                    break
                case figure.AnchorType.ANCHOR_SMOOTH:
                    d += ` S ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} `
                    break
                case figure.AnchorType.ANCHOR_ANGLE_ANGLE:
                    d += `AA ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} `
                    break
                }
        }
        return d.trimEnd()
    }

    toPathString() {
        return this.getPath().toString()
    }
}
