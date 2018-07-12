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

import { Point, Rectangle, Matrix } from "../shared/geometry"
import * as valuetype from "../shared/workflow_valuetype"

declare global {
  interface SVGPathElement {
    setPathData(data: any): void
    getPathData(): any
  }
}

export class Path
{
    path: any
    svg: SVGPathElement
  
    constructor(path?: Path) {
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "path") as SVGPathElement;
        if (path === undefined) {
            this.path = []
        } else {
            this.path = [] // FIXME: improve
            for(let entry of path.path) {
                switch(entry.type) {
                    case "M":
                        this.path.push({type: 'M', values: [entry.values[0], entry.values[1]]})
                        break
                    case "L":
                        this.path.push({type: 'L', values: [entry.values[0], entry.values[1]]})
                        break
                    case "C":
                        this.path.push({type: 'C', values: [entry.values[0], entry.values[1], entry.values[2], entry.values[3], entry.values[4], entry.values[5]]})
                        break
                    case "Z":
                        this.path.push({type: 'Z'})
                        break
                }
            }
        }
    }

    clear() {
        this.path = []
    }

    update() {
        this.svg.setPathData(this.path)
    }

    move(point: Point) {
        this.path.push({type: 'M', values: [point.x, point.y]})
    }

    line(point: Point) {
        this.path.push({type: 'L', values: [point.x, point.y]})
    }
    
    curve(p0: Point, p1: Point, p2: Point) {
        this.path.push({type: 'C', values: [p0.x, p0.y, p1.x, p1.y, p2.x, p2.y]})
    }

    close() {
        this.path.push({type: 'Z'})
    }
    
    appendRect(rectangle: any) { // FIXME: drop any
        this.move(rectangle.origin)
        this.line({x: rectangle.origin.x + rectangle.size.width, y: rectangle.origin.y                         })
        this.line({x: rectangle.origin.x + rectangle.size.width, y: rectangle.origin.y + rectangle.size.height })
        this.line({x: rectangle.origin.x                       , y: rectangle.origin.y + rectangle.size.height })
        this.close()
    }
    
    appendCircle(rectangle: any) { // FIXME: drop any
        // Michael Goldapp, "Approximation of circular arcs by cubic polynomials"
        // Computer Aided Geometric Design (#8 1991 pp.227-238) Tor Dokken and   
        // Morten Daehlen, "Good Approximations of circles by curvature-continuous
        // Bezier curves" Computer Aided Geometric Design (#7 1990 pp.  33-41).   
        // error is about 0.0273% of the circles radius
        // n := 4 segments, f := (4/3)*tan(pi/(2n))
        let f = 0.552284749831;

        let rx = 0.5 * rectangle.size.width,
            ry = 0.5 * rectangle.size.height,
            cx = rectangle.origin.x + rx,
            cy = rectangle.origin.y + ry

        this.move ({x: cx         , y: cy-ry});
        this.curve({x: cx + rx * f, y: cy-ry}, 
                   {x: cx + rx    , y: cy-ry*f},
                   {x: cx + rx    , y: cy})
        this.curve({x: cx + rx    , y: cy+ry*f},
                   {x: cx + rx * f, y: cy+ry},  
                   {x: cx         , y: cy+ry})
        this.curve({x: cx - rx * f, y: cy+ry},  
                   {x: cx - rx    , y: cy+ry*f},
                   {x: cx - rx    , y: cy})
        this.curve({x: cx - rx    , y: cy-ry*f},
                   {x: cx - rx * f, y: cy-ry},  
                   {x: cx         , y: cy-ry})
        this.close() 
    }
    
    bounds(): Rectangle {
        let isFirstPoint = true
        let rectangle = new Rectangle()
        for(let segment of this.path) {
            switch(segment.type) {
                case 'M':
                case 'L':
                    if (isFirstPoint) {
                        rectangle.origin.x = segment.values[0]
                        rectangle.origin.y = segment.values[1]
                        isFirstPoint = false
                    } else {
                        rectangle.expandByPoint(new Point({x: segment.values[0], y: segment.values[1]}))
                    }
                    break
                case 'C':
                    // FIXME: add code
                    break
            }
        }
        return rectangle
    }
    
    // relativeMove
    // relativeLine
    // relativeCurve
    // append(path)
    transform(matrix: Matrix) {
        for(let segment of this.path) {
            switch(segment.type) {
                case 'M':
                case 'L':
                    segment.values = matrix.transformArrayPoint(segment.values)
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
                } break
            }
        }
    }

    translate(point: Point) {
        this.transform(new Matrix({
            m11: 1.0, m12: 0.0,
            m21: 0.0, m22: 1.0,
            tX: point.x, tY: point.y
        }))
    }
}
