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

import { distancePointToLine, isZero } from "shared/geometry"
import { Rectangle } from "shared/geometry/Rectangle"
import { Point } from "shared/geometry/Point"
import { Matrix } from "shared/geometry/Matrix"
import { AbstractPath } from "./AbstractPath"

// import { Intersection, intersectLineLine, intersectCurveLine } from "shared/geometry/Intersection"

import { pointInPolygonWN } from "shared/pointInPolygon"

interface CloseSegment {
    type: 'Z'
    values: undefined
}

interface DrawSegment {
    type: 'M'|'L'|'C'
    values: number[]
}

type Segment = DrawSegment | CloseSegment

export class Path extends AbstractPath {
    data: Array<Segment>
    constructor();
    constructor(path: Path)
    constructor(path: Array<Point>)
    constructor(path?: Path | Array<Point>) {
        super()
        this.data = []
        if (path instanceof Array) {
            this.data.push({ type: 'M', values: [path[0].x, path[0].y] })
            for (let i = 1; i < path.length; ++i) {
                this.data.push({ type: 'L', values: [path[i].x, path[i].y] })
            }
            this.data.push({ type: 'Z', values: undefined })
        }
        else if (path instanceof Path) {
            for (let entry of path.data) {
                switch (entry.type) {
                    case "M":
                        this.data.push({ type: 'M', values: [entry.values![0], entry.values![1]] })
                        break
                    case "L":
                        this.data.push({ type: 'L', values: [entry.values[0], entry.values[1]] })
                        break
                    case "C":
                        this.data.push({ type: 'C', values: [entry.values[0], entry.values[1], entry.values[2], entry.values[3], entry.values[4], entry.values[5]] })
                        break
                    case "Z":
                        this.data.push({ type: 'Z', values: undefined })
                        break
                }
            }
        }
    }
    clone(): AbstractPath {
        return new Path(this)
    }
    override toString() {
        let text = ""
        for (let seg of this.data) {
            switch(seg.type) {
                case 'M':
                    text += `M ${seg.values[0]} ${seg.values[1]} `
                    break
                case 'L':
                    text += `L ${seg.values[0]} ${seg.values[1]} `
                    break
                case 'C':
                    text += `C ${seg.values[0]} ${seg.values[1]} ${seg.values[2]} ${seg.values[3]} ${seg.values[4]} ${seg.values[5]} `
                    break
                case 'Z':
                    text += `Z `
                    break
            }
        }
        return text.substring(0, text.length-1)
    }

    clear(): Path {
        this.data = []
        return this
    }
    empty(): boolean {
        return this.data.length == 0
    }
    contains(point: Point): boolean {
        // const scanLine = [
        //     new Point(Number.MIN_VALUE, point.y),
        //     new Point(Number.MAX_VALUE, point.y)
        // ]
        // for(let entry of this.data) {
        //     let lastPoint!: Point
        //     let firstPoint!: Point
        //     const ilist = Array<Intersection>()
        //     switch(entry.type) {
        //         case "M":
        //             firstPoint = lastPoint = {x: entry.values[0], y: entry.values[1]}
        //             break
        //         case "L": {
        //             const line = [
        //                 lastPoint,
        //                 {x: entry.values[0], y: entry.values[1]}
        //             ]
        //             intersectLineLine(ilist, line, scanLine)
        //             lastPoint = line[1]
        //         } break
        //         case "C": {
        //             let curve = [
        //                 lastPoint,
        //                 {x: entry.values[0], y: entry.values[1]},
        //                 {x: entry.values[2], y: entry.values[3]},
        //                 {x: entry.values[4], y: entry.values[5]}
        //             ]
        //             intersectCurveLine(ilist, curve, scanLine)
        //             lastPoint = curve[3]
        //         } break
        //         case "Z": {
        //             if (entry !== this.data[this.data.length-1])
        //                 throw Error("multiple segments are not implemented yet")
        //             const line = [
        //                 lastPoint,
        //                 firstPoint
        //             ]
        //             intersectLineLine(ilist, line, scanLine)
        //             lastPoint = line[1]
        //         }
        //     }
        // }
        const flat: Point[] = []
        for(let entry of this.data) {
            switch(entry.type) {
                case "M":
                case "L":
                    flat.push({x: entry.values[0], y: entry.values[1]})
                    break
                case "C":
                    throw Error("curves are not implemented yet")
                case "Z":
                    if (entry !== this.data[this.data.length-1])
                        throw Error("multiple segments are not implemented yet")
            }
        }
        flat.push(flat[0])
        if (pointInPolygonWN(point, flat, flat.length-1))
            return true
        for(let i=1; i<flat.length; ++i) {
            if (isZero(distancePointToLine(point, flat[i-1], flat[i]))) {
                return true
            }
        }
        return false
    }
    distance(point: Point) {
        let m!: Point, p0!: Point, p1!: Point, d = Number.MAX_VALUE
        for(let entry of this.data) {
            switch(entry.type) {
                case "M":
                    m = p1 = {x: entry.values[0], y: entry.values[1]}
                    break
                case "L":
                    p0 = p1
                    p1 = {x: entry.values[0], y: entry.values[1]}
                    d = Math.min(distancePointToLine(point, p0, p1), d)
                    break
                case "C":
                    throw Error("curves are not implemented yet")
                case "Z":
                    d = Math.min(distancePointToLine(point, m, p1), d)
            }
        }
        return d;
    }

    // relativeMove
    // relativeLine
    // relativeCurve
    // append(path)
    transform(matrix: Matrix): Path {
        for (let segment of this.data) {
            switch (segment.type) {
                case 'M':
                case 'L':
                    segment.values = matrix.transformArrayPoint(segment.values as [number, number])
                    break
                case 'C': {
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
    move(point: Point): Path
    move(x: number, y: number): Path
    move(pointOrX: Point | number, Y?: number): Path {
        if (typeof pointOrX === "object")
            this.data.push({ type: 'M', values: [pointOrX.x, pointOrX.y] })
        else
            this.data.push({ type: 'M', values: [pointOrX, Y!] })
        return this
    }
    line(point: Point): Path
    line(x: number, y: number): Path
    line(pointOrX: Point | number, Y?: number): Path {
        if (typeof pointOrX === "object")
            this.data.push({ type: 'L', values: [pointOrX.x, pointOrX.y] })
        else
            this.data.push({ type: 'L', values: [pointOrX, Y!] })
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
            this.data.push({ type: 'C', values: [p0OrX0, p1OrY0, p2OrX1, Y1!, X2!, Y2!] })
        } else {
            throw Error("yikes")
        }
        return this
    }
    close(): Path {
        this.data.push({ type: 'Z', values: undefined })
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

    createSVG(stroke="#000", strokeWidth=1, fill="none"): SVGPathElement {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "path")
        svg.setPathData(this.data)
        svg.setAttributeNS("", "stroke-width", String(strokeWidth))
        svg.setAttributeNS("", "stroke", stroke)
        svg.setAttributeNS("", "fill", fill)
        return svg
    }

    updateSVG(parentSVG: SVGElement, svg?: SVGPathElement): SVGPathElement {
        if (!svg)
            svg = document.createElementNS("http://www.w3.org/2000/svg", "path") 
        let svgPath = svg as SVGPathElement
        svgPath.setPathData(this.data)
        return svg
    }
}
