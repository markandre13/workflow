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
import { mirrorPoint } from "shared/geometry"
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
    curve(p0: Point, p1: Point, p2: Point) {
        if (this.types.length === 1) {
            // FIXME: this only works on the initial point
            this.types[this.types.length-1] = figure.AnchorType.ANCHOR_EDGE_ANGLE
            this.values.push(p0.x)
            this.values.push(p0.y)
            this.types.push(figure.AnchorType.ANCHOR_ANGLE_EDGE)
            this.values.push(p1.x)
            this.values.push(p1.y)
            this.values.push(p2.x)
            this.values.push(p2.y)
        } else {
            // assert?
            this.types.push(figure.AnchorType.ANCHOR_SMOOTH)
            this.values.push(p1.x)
            this.values.push(p1.y)
            this.values.push(p2.x)
            this.values.push(p2.y)
        }
    }
    // close() { this.path.close() }
  
    override getPath(): RawPath {
        const path = new RawPath()
        let prevType!: figure.AnchorType
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
                    if (idxType === 1 && prevType === figure.AnchorType.ANCHOR_EDGE_ANGLE) {
                        path.move(this.values[idxValue++], this.values[idxValue++])
                        path.curve(
                            this.values[idxValue++], this.values[idxValue++],
                            this.values[idxValue++], this.values[idxValue++],
                            this.values[idxValue++], this.values[idxValue++],                           
                        )
                    }
                    break
                case figure.AnchorType.ANCHOR_SMOOTH:
                    // like svg:path's S: mirror the previous curves last handle on the previous curve's last anchor
                    const m = mirrorPoint(
                        {x: this.values[idxValue-2], y: this.values[idxValue-1]},
                        {x: this.values[idxValue-4], y: this.values[idxValue-3]},
                    )
                    path.curve(
                        m.x, m.y,
                        this.values[idxValue++], this.values[idxValue++],
                        this.values[idxValue++], this.values[idxValue++],                           
                    )
                    break
                case figure.AnchorType.ANCHOR_ANGLE_ANGLE:
                    break
            }
            prevType = this.types[idxType]
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
        svg.setAttributeNS("", "d", (path as RawPath).toString())
        svg.setAttributeNS("", "stroke-width", String(this.strokeWidth))
        svg.setAttributeNS("", "stroke", this.stroke)
        svg.setAttributeNS("", "fill", this.fill)
        return svg
    }

    // TODO: why have a distance method when the RawPath can be used for that?
    override distance(pt: Point): number {
        const path = this.getPath() // FIXME: slow
        // TODO: consider range/scale?
        if (this.fill !== "none" && path.contains(pt)) {
            return -1
        }
        return path.distance(pt)
    }

    // TODO: why have a distance method when the RawPath can be used for that?
    bounds(): Rectangle {
        const path = this.getPath() // FIXME: slow
        return path.bounds()
    }

    transform(transform: Matrix): boolean {
        if (transform.isIdentity()) // FIXME: this should never happen
            return true
        if (!transform.isOnlyTranslateAndScale())
            return false
        let idx = 0
        while(idx<this.values.length) {
            [this.values[idx], this.values[idx+1]] = transform.transformArrayPoint([this.values[idx], this.values[idx+1]])
            idx += 2
        }
        return true
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
                    d += `S ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} `
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
