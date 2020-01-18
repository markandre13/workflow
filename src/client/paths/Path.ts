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
import { AbstractPath } from "./AbstractPath"

declare global {
    interface SVGPathElement {
        setPathData(data: any): void
        getPathData(): any
    }
}

// class PathSegment {
//     type: string
//     values: Array<number> = []
// }

export class Path extends AbstractPath {
    
    data: Array<any>
    constructor();
    constructor(path: Path)
    constructor(path: Array<Point>)
    constructor(path?: Path | Array<Point>) {
        super()
        this.data = []
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "path") as SVGPathElement
        if (path instanceof Array) {
            this.data.push({ type: 'M', values: [path[0].x, path[0].y] })
            for (let i = 1; i < path.length; ++i) {
                this.data.push({ type: 'L', values: [path[i].x, path[i].y] })
            }
            this.data.push({ type: 'Z' })
        }
        else if (path instanceof Path) {
            for (let entry of path.data) {
                switch (entry.type) {
                    case "M":
                        this.data.push({ type: 'M', values: [entry.values[0], entry.values[1]] })
                        break
                    case "L":
                        this.data.push({ type: 'L', values: [entry.values[0], entry.values[1]] })
                        break
                    case "C":
                        this.data.push({ type: 'C', values: [entry.values[0], entry.values[1], entry.values[2], entry.values[3], entry.values[4], entry.values[5]] })
                        break
                    case "Z":
                        this.data.push({ type: 'Z' })
                        break
                }
            }
        }
    }
    clone(): AbstractPath {
        return new Path(this)
    }
    clear(): Path {
        this.data = []
        return this
    }
    empty(): boolean {
        return this.data.length == 0
    }
    // relativeMove
    // relativeLine
    // relativeCurve
    // append(path)
    transform(matrix: Matrix): Path {
        console.log(`Path.transform()`)
        for (let segment of this.data) {
            switch (segment.type) {
                case 'M':
                case 'L':
                    segment.values = matrix.transformArrayPoint(segment.values as [number, number])
                    break
                case 'C':
                    {
                        let pt = matrix.transformArrayPoint([segment.values[0], segment.values[1]])
                        segment.values[0] = pt[0]
                        segment.values[1] = pt[1]
                        pt = matrix.transformArrayPoint([segment.values[2], segment.values[3]])
                        segment.values[2] = pt[0]
                        segment.values[3] = pt[1]
                        pt = matrix.transformArrayPoint([segment.values[4], segment.values[5]])
                        segment.values[4] = pt[0]
                        segment.values[5] = pt[1]
                    }
                    break
            }
        }
        return this
    }
    updateSVG(): void {
        let path = this.svg as SVGPathElement
        path.setPathData(this.data)
    }
    move(point: Point): Path
    move(x: number, y: number): Path
    move(pointOrX: Point | number, Y?: number): Path {
        if (typeof pointOrX === "object")
            this.data.push({ type: 'M', values: [pointOrX.x, pointOrX.y] })
        else
            this.data.push({ type: 'M', values: [pointOrX, Y] })
        return this
    }
    line(point: Point): Path
    line(x: number, y: number): Path
    line(pointOrX: Point | number, Y?: number): Path {
        if (typeof pointOrX === "object")
            this.data.push({ type: 'L', values: [pointOrX.x, pointOrX.y] })
        else
            this.data.push({ type: 'L', values: [pointOrX, Y] })
        return this
    }
    curve(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): Path
    curve(p0: Point, p1: Point, p2: Point): Path;
    curve(p0OrX0: Point | number, p1OrY0: Point | number, p2OrX1: Point | number, Y1?: number, X2?: number, Y2?: number): Path {
        if (typeof p0OrX0 === "object" &&
            typeof p1OrY0 === "object" &&
            typeof p2OrX1 === "object") {
            this.data.push({
                type: 'C', values: [p0OrX0.x, p0OrX0.y,
                p1OrY0.x, p1OrY0.y,
                p2OrX1.x, p2OrX1.y]
            })
        }
        else if (
            typeof p0OrX0 === "number" &&
            typeof p1OrY0 === "number" &&
            typeof p2OrX1 === "number")
        {
            this.data.push({ type: 'C', values: [p0OrX0, p1OrY0, p2OrX1, Y1, X2, Y2] })
        } else {
            throw Error("fuck")
        }
        return this
    }
    close(): Path {
        this.data.push({ type: 'Z' })
        return this
    }
    appendRect(rectangle: any): Path {
        this.move(rectangle.origin)
        this.line(rectangle.origin.x + rectangle.size.width, rectangle.origin.y)
        this.line(rectangle.origin.x + rectangle.size.width, rectangle.origin.y + rectangle.size.height)
        this.line(rectangle.origin.x, rectangle.origin.y + rectangle.size.height)
        this.close()
        return this
    }
    appendCircle(rectangle: any): Path {
        // Michael Goldapp, "Approximation of circular arcs by cubic polynomials"
        // Computer Aided Geometric Design (#8 1991 pp.227-238) Tor Dokken and   
        // Morten Daehlen, "Good Approximations of circles by curvature-continuous
        // Bezier curves" Computer Aided Geometric Design (#7 1990 pp.  33-41).   
        // error is about 0.0273% of the circles radius
        // n := 4 segments, f := (4/3)*tan(pi/(2n))
        let f = 0.552284749831
        let rx = 0.5 * rectangle.size.width, ry = 0.5 * rectangle.size.height, cx = rectangle.origin.x + rx, cy = rectangle.origin.y + ry
        this.move({ x: cx, y: cy - ry })
        this.curve({ x: cx + rx * f, y: cy - ry }, { x: cx + rx, y: cy - ry * f }, { x: cx + rx, y: cy })
        this.curve({ x: cx + rx, y: cy + ry * f }, { x: cx + rx * f, y: cy + ry }, { x: cx, y: cy + ry })
        this.curve({ x: cx - rx * f, y: cy + ry }, { x: cx - rx, y: cy + ry * f }, { x: cx - rx, y: cy })
        this.curve({ x: cx - rx, y: cy - ry * f }, { x: cx - rx * f, y: cy - ry }, { x: cx, y: cy - ry })
        this.close()
        return this
    }
    bounds(): Rectangle {
        let isFirstPoint = true
        let rectangle = new Rectangle()
        for (let segment of this.data) {
            switch (segment.type) {
                case 'M':
                case 'L':
                    if (isFirstPoint) {
                        rectangle.origin.x = segment.values[0]
                        rectangle.origin.y = segment.values[1]
                        isFirstPoint = false
                    }
                    else {
                        rectangle.expandByPoint(new Point({ x: segment.values[0], y: segment.values[1] }))
                    }
                    break
                case 'C':
                    // FIXME: add code
                    break
            }
        }
        return rectangle
    }
}
