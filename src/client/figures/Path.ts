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
import * as valuetype from "shared/workflow_valuetype"
import * as value     from "shared/workflow_value"
import { GIOPDecoder } from "corba.js"

export class PathSegment implements value.figure.PathSegment {
    type!: string
    data!: number[]

    constructor(init?: Partial<PathSegment>|GIOPDecoder)
    {
        value.figure.initPathSegment(this, init)
    }
    toString() {
        return `PathSegment(type: '${this.type}', data: ${this.data})`
    }
}

export class Path extends AttributedFigure implements valuetype.figure.Path {
    segments!: PathSegment[] // TODO: we could also implement RawPath???
    path: RawPath
    constructor(init?: Partial<Path> | RawPath) {
        if (init instanceof RawPath) {
            super()
            value.figure.initPath(this)
            this.path = new RawPath(init)
        } else {
            super(init)
            value.figure.initPath(this, init)
            this.path = new RawPath()
        }
        this.segments = this.path.data as any
    }

    move(point: Point) { this.path.move(point) }
    line(point: Point) { this.path.line(point) }
    curve(p0: Point, p1: Point, p2: Point) { this.path.curve(p0, p1, p2) }
    close() { this.path.close() }
  
    override getPath(): RawPath {
        // TODO: tweak the outline code to do without? yes, because a path will usually be
        // much larger than those figures which create a path on demand
        return new RawPath(this.path) 
    }
    override toString() {
        if (this.matrix===undefined) {
            return `figure.Path(d="${this.path}")`
        } else {
            return `figure.Path(matrix=${this.matrix}, d="${this.path}")`
        }
    }
    override updateSVG(path: AbstractPath, parentSVG: SVGElement, svg?: SVGElement): SVGElement {
        if (!svg)
            svg = document.createElementNS("http://www.w3.org/2000/svg", "path")

        const svgPath = svg as SVGPathElement
        svgPath.setPathData((path as RawPath).data)
        svg.setAttributeNS("", "stroke-width", String(this.strokeWidth))
        svg.setAttributeNS("", "stroke", this.stroke)
        svg.setAttributeNS("", "fill", this.fill)
        return svg
    }

    override distance(pt: Point): number {
        // TODO: consider range/scale?
        if (this.fill !== "none" && this.path.contains(pt)) {
            return -1
        }
        const d = this.path.distance(pt)
        console.log(`distance of ${pt.x}, ${pt.y} to curve is ${d}`)
        return d
    }

    transform(transform: Matrix): boolean {
        if (transform.isIdentity()) // FIXME: this should never happen
            return true
        if (!transform.isOnlyTranslateAndScale())
            return false
        this.path.transform(transform)
        return true
    }

    bounds(): Rectangle {
        return this.path.bounds()
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
}
