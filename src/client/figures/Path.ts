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
import * as value from "shared/workflow_value"

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

    //
    // Add and edit anchors
    //

    addEdge(p0: Point) {
        this.types.push(figure.AnchorType.ANCHOR_EDGE)
        this.values.push(p0.x)
        this.values.push(p0.y)
    }
    changeEdgeToSymmetric(backwardHandle: Point) {
        if (this.types.length === 0)
            throw Error(`figure.Path.changeEdgeToSymmetric(): figure is empty`)
        if (this.types[this.types.length - 1] !== figure.AnchorType.ANCHOR_EDGE) {
            throw Error(`figure.Path.changeEdgeToSymmetric(): last anchor is not an edge`)
        }
        this.types[this.types.length - 1] = figure.AnchorType.ANCHOR_SYMMETRIC
        const x = this.values[this.values.length-2]
        const y = this.values[this.values.length-1]
        this.values[this.values.length-2] = backwardHandle.x
        this.values[this.values.length-1] = backwardHandle.y
        this.values.push(x)
        this.values.push(y)
    }
    changeSymmetricToSmoothAngleAngle(forwardHandle: Point) {
        if (this.types.length === 0)
            throw Error(`figure.Path.changeSymmetricToSmoothAngleAngle(): figure is empty`)
        if (this.types[this.types.length - 1] !== figure.AnchorType.ANCHOR_SYMMETRIC) {
            throw Error(`figure.Path.changeSymmetricToSmoothAngleAngle(): last anchor is not symmetric`)
        }
        this.types[this.types.length - 1] = figure.AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE
        this.values.push(forwardHandle.x)
        this.values.push(forwardHandle.y)
    }
    changeEdgeToSmoothAngleAngle(backwardHandle: Point, forwardHandle: Point) {
        if (this.types.length === 0)
            throw Error(`figure.Path.changeEdgeToSmoothAngleAngle(): figure is empty`)
        if (this.types[this.types.length - 1] !== figure.AnchorType.ANCHOR_EDGE) {
            throw Error(`figure.Path.changeEdgeToSmoothAngleAngle(): last anchor is not an edge`)
        }
        this.types[this.types.length - 1] = figure.AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE
        const anchor = {x: this.values[this.values.length-2], y: this.values[this.values.length-1]}
        this.values[this.values.length-2] = backwardHandle.x
        this.values[this.values.length-1] = backwardHandle.y
        this.values.push(anchor.x)
        this.values.push(anchor.y)
        this.values.push(forwardHandle.x)
        this.values.push(forwardHandle.y)
    }
    changeSmoothAngleAngleToSymmetric() {
        if (this.types.length === 0)
            throw Error(`figure.Path.changeSmoothAngleAngleToSymmetric(): figure is empty`)
        if (this.types[this.types.length - 1] !== figure.AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE) {
            throw Error(`figure.Path.changeSmoothAngleAngleToSymmetric(): unexpected last anchor type ${figure.AnchorType[this.types[this.types.length - 1]]}`)
        }
        this.types[this.types.length - 1] = figure.AnchorType.ANCHOR_SYMMETRIC
        const anchor = {x: this.values[this.values.length-4], y: this.values[this.values.length-3]}
        const forwardHandle = {x: this.values[this.values.length-2], y: this.values[this.values.length-1]}
        const backwardHandle = mirrorPoint(anchor, forwardHandle)
        this.values[this.values.length-4] = backwardHandle.x
        this.values[this.values.length-3] = backwardHandle.y
        this.values.length -= 2
    }
    // updateSmoothAngleAngle(backwardHandle: Point) {
    //     if (this.types.length === 0)
    //         throw Error(`figure.Path.changeEdgeToSymmetric(): figure is empty`)
    //     if (this.types[this.types.length - 1] !== figure.AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE) {
    //         throw Error(`figure.Path.changeEdgeToSymmetric(): last anchor is not an edge`)
    //     }
    //     this.values[this.values.length-2] = backwardHandle.x
    //     this.values[this.values.length-1] = backwardHandle.y
    // }
    updateSymmetric(backwardHandle: Point) {
        if (this.types.length === 0)
            throw Error(`figure.Path.updateSymmetric(): figure is empty`)
        if (this.types[this.types.length - 1] !== figure.AnchorType.ANCHOR_SYMMETRIC) {
            throw Error(`figure.Path.updateSymmetric(): last anchor is not symmetric`)
        }
        this.values[this.values.length-4] = backwardHandle.x
        this.values[this.values.length-3] = backwardHandle.y
    }
    updateAngleEdge(index: number, backwardHandle: Point) {
        if (this.types.length === 0)
            throw Error(`figure.Path.updateAngleEdge(): figure is empty`)
        if (this.types[0] !== figure.AnchorType.ANCHOR_ANGLE_EDGE) {
            throw Error(`figure.Path.updateAngleEdge(): last anchor is not symmetric`)
        }
        this.values[0] = backwardHandle.x
        this.values[1] = backwardHandle.y
    }
    changeEdgeToEdgeAngle(p0: Point) {
        if (this.types.length === 0)
            throw Error(`figure.Path.changeEdgeToEdgeAngle(): figure is empty`)
        if (this.types[this.types.length - 1] !== figure.AnchorType.ANCHOR_EDGE) {
            throw Error(`figure.Path.changeEdgeToEdgeAngle(): last anchor is not an edge`)
        }
        this.types[this.types.length - 1] = figure.AnchorType.ANCHOR_EDGE_ANGLE
        this.values.push(p0.x)
        this.values.push(p0.y)
    }
    changeAngleEdgeToSymmetric() {
        if (this.types.length === 1) // FIXME: hack not reflected in method name
            return
        if (this.types.length === 0)
            throw Error(`figure.Path.changeAngleEdgeToSmooth(): figure is empty`)
        if (this.types[this.types.length - 1] !== figure.AnchorType.ANCHOR_ANGLE_EDGE) {
            // return
            throw Error(`figure.Path.changeAngleEdgeToSmooth(): last anchor is not an angle-edge ${figure.AnchorType[this.types[this.types.length - 1]]}`)
        }
        this.types[this.types.length - 1] = figure.AnchorType.ANCHOR_SYMMETRIC
    }
    changeEdgeAngleToSmooth(index: number, beforeAnchor: Point, afterAnchor: Point) {
        if (index !== 0) {
            throw Error("figure.Path.changeEdgeAngleToAngleAngle(): index !== 0 not implemented yet")
        }
        if (this.types.length === 0) {
            throw Error(`figure.Path.changeEdgeAngleToAngleAngle(): figure is empty`)
        }
        if (this.types[index] !== figure.AnchorType.ANCHOR_EDGE_ANGLE) {
            throw Error(`figure.Path.changeEdgeAngleToAngleAngle(): anchor is not edge-angle ${figure.AnchorType[this.types[index]]}`)
        }
        this.types[index] = figure.AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE
        this.values = [beforeAnchor.x, beforeAnchor.y].concat(this.values)
        this.values[4] = afterAnchor.x
        this.values[5] = afterAnchor.y
    }
    updateSmooth(index: number, beforeAnchor: Point, afterAnchor: Point) {
        if (index !== 0) {
            throw Error("figure.Path.updateSmooth(): index !== 0 not implemented yet")
        }
        if (this.types.length === 0) {
            throw Error(`figure.Path.updateSmooth(): figure is empty`)
        }
        if (this.types[index] !== figure.AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE) {
            throw Error(`figure.Path.updateSmooth(): anchor is not smooth angle-angle ${figure.AnchorType[this.types[index]]}`)
        }
        this.values[0] = beforeAnchor.x
        this.values[1] = beforeAnchor.y
        this.values[4] = afterAnchor.x
        this.values[5] = afterAnchor.y
    }
    changeEdgeToAngleEdge(index: number, p0: Point) {
        if (index !== 0) {
            throw Error("figure.Path.changeEdgeAngleToAngleAngle(): index !== 0 not implemented yet")
        }
        if (this.types.length === 0) {
            throw Error(`figure.Path.changeEdgeAngleToAngleAngle(): figure is empty`)
        }
        if (this.types[index] !== figure.AnchorType.ANCHOR_EDGE) {
            throw Error(`figure.Path.changeEdgeAngleToAngleAngle(): anchor is not edge ${figure.AnchorType[this.types[index]]}`)
        }
        this.types[index] = figure.AnchorType.ANCHOR_ANGLE_EDGE
        this.values = [p0.x, p0.y].concat(this.values)
    }
    changeEdgeAngleToAngleAngle(index: number, p0: Point) {
        if (index !== 0) {
            throw Error("figure.Path.changeEdgeAngleToAngleAngle(): index !== 0 not implemented yet")
        }
        if (this.types.length === 0) {
            throw Error(`figure.Path.changeEdgeAngleToAngleAngle(): figure is empty`)
        }
        if (this.types[index] !== figure.AnchorType.ANCHOR_EDGE_ANGLE) {
            throw Error(`figure.Path.changeEdgeAngleToAngleAngle(): anchor is not edge-angle ${figure.AnchorType[this.types[index]]}`)
        }
        this.types[index] = figure.AnchorType.ANCHOR_ANGLE_ANGLE
        this.values = [p0.x, p0.y].concat(this.values)
    }

    addEdgeAngle(p0: Point, p1: Point) {
        this.types.push(figure.AnchorType.ANCHOR_EDGE_ANGLE)
        this.values.push(p0.x)
        this.values.push(p0.y)
        this.values.push(p1.x)
        this.values.push(p1.y)
    }
    addAngleEdge(p0: Point, p1: Point) {
        this.types.push(figure.AnchorType.ANCHOR_ANGLE_EDGE)
        this.values.push(p0.x)
        this.values.push(p0.y)
        this.values.push(p1.x)
        this.values.push(p1.y)
    }
    addSymmetric(p0: Point, p1: Point) {
        this.types.push(figure.AnchorType.ANCHOR_SYMMETRIC)
        this.values.push(p0.x)
        this.values.push(p0.y)
        this.values.push(p1.x)
        this.values.push(p1.y)
    }
    addAngleAngle(p0: Point, p1: Point, p2: Point) {
        this.types.push(figure.AnchorType.ANCHOR_ANGLE_ANGLE)
        this.values.push(p0.x)
        this.values.push(p0.y)
        this.values.push(p1.x)
        this.values.push(p1.y)
        this.values.push(p2.x)
        this.values.push(p2.y)
    }
    addClose() {
        this.types.push(figure.AnchorType.CLOSE)
    }

    override getPath(): RawPath {
        const path = new RawPath()
        let prevType: figure.AnchorType | undefined
        let idxValue = 0
        for (let idxType = 0; idxType < this.types.length; ++idxType) {
            // console.log(`getPath(): type=${figure.AnchorType[this.types[idxType]]}, idxType=${idxType}, idxValue=${idxValue}`)

            let prevValue = idxValue
            let type = this.types[idxType]
            if (type === figure.AnchorType.CLOSE) {
                idxValue = 0
                type = this.types[0]
            }

            switch (type) {
                case figure.AnchorType.ANCHOR_EDGE:
                    switch (prevType) {
                        case undefined:
                            path.move(this.values[idxValue++], this.values[idxValue++])
                            break
                        case figure.AnchorType.ANCHOR_EDGE:
                        case figure.AnchorType.ANCHOR_ANGLE_EDGE:
                            path.line(this.values[idxValue++], this.values[idxValue++])
                            break
                        case figure.AnchorType.ANCHOR_EDGE_ANGLE:
                        case figure.AnchorType.ANCHOR_ANGLE_ANGLE:
                        case figure.AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
                            path.curve(
                                this.values[prevValue - 2], this.values[prevValue - 1],
                                this.values[idxValue], this.values[idxValue + 1],
                                this.values[idxValue], this.values[idxValue + 1]
                            )
                            idxValue += 2
                            break
                        case figure.AnchorType.ANCHOR_SYMMETRIC: {
                            const p0 = { x: this.values[prevValue - 4], y: this.values[prevValue - 3] }
                            const p1 = { x: this.values[prevValue - 2], y: this.values[prevValue - 1] }
                            const m = mirrorPoint(p1, p0)
                            path.curve(
                                m.x, m.y,
                                this.values[idxValue], this.values[idxValue + 1],
                                this.values[idxValue], this.values[idxValue + 1]
                            )
                            idxValue += 2
                        } break
                        default:
                            throw Error("yikes 0")
                    }
                    break
                case figure.AnchorType.ANCHOR_EDGE_ANGLE:
                    switch (prevType) {
                        case undefined:
                            path.move(this.values[idxValue++], this.values[idxValue++])
                            idxValue += 2
                            break
                        case figure.AnchorType.ANCHOR_EDGE:
                        case figure.AnchorType.ANCHOR_ANGLE_EDGE:
                            path.line(this.values[idxValue++], this.values[idxValue++])
                            idxValue += 2
                            break
                        case figure.AnchorType.ANCHOR_EDGE_ANGLE:
                        case figure.AnchorType.ANCHOR_ANGLE_ANGLE:
                        case figure.AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE: {
                            path.curve(
                                this.values[prevValue - 2], this.values[prevValue - 1],
                                this.values[idxValue], this.values[idxValue + 1],
                                this.values[idxValue], this.values[idxValue + 1])
                            idxValue += 4
                        } break
                        case figure.AnchorType.ANCHOR_SYMMETRIC: {
                            const p0 = { x: this.values[prevValue - 4], y: this.values[prevValue - 3] }
                            const p1 = { x: this.values[prevValue - 2], y: this.values[prevValue - 1] }
                            const m = mirrorPoint(p1, p0)
                            path.curve(
                                m.x, m.y,
                                this.values[idxValue], this.values[idxValue + 1],
                                this.values[idxValue], this.values[idxValue + 1])
                            idxValue += 4
                        } break
                        default:
                            throw Error("yikes 1")
                    }
                    break
                case figure.AnchorType.ANCHOR_ANGLE_EDGE:
                    switch (prevType) {
                        case undefined:
                            idxValue += 2
                            path.move(this.values[idxValue++], this.values[idxValue++])
                            break
                        case figure.AnchorType.ANCHOR_EDGE_ANGLE:
                        case figure.AnchorType.ANCHOR_EDGE:
                        case figure.AnchorType.ANCHOR_ANGLE_EDGE:
                        case figure.AnchorType.ANCHOR_ANGLE_ANGLE:
                        case figure.AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
                            path.curve(
                                this.values[prevValue - 2], this.values[prevValue - 1],
                                this.values[idxValue++], this.values[idxValue++],
                                this.values[idxValue++], this.values[idxValue++],
                            )
                            break
                        case figure.AnchorType.ANCHOR_SYMMETRIC: {
                            const p0 = { x: this.values[prevValue - 4], y: this.values[prevValue - 3] }
                            const p1 = { x: this.values[prevValue - 2], y: this.values[prevValue - 1] }
                            const m = mirrorPoint(p1, p0)
                            path.curve(
                                m.x, m.y,
                                this.values[idxValue++], this.values[idxValue++],
                                this.values[idxValue++], this.values[idxValue++]
                            )
                        } break
                        default:
                            throw Error(`yikes`)
                    }
                    break
                case figure.AnchorType.ANCHOR_SYMMETRIC:
                    // like svg:path's S: mirror the previous curves last handle on the previous curve's last anchor
                    switch (prevType) {
                        case undefined:
                            idxValue += 2
                            path.move(this.values[idxValue++], this.values[idxValue++])
                            break
                        case figure.AnchorType.ANCHOR_EDGE:
                        case figure.AnchorType.ANCHOR_EDGE_ANGLE:
                        case figure.AnchorType.ANCHOR_ANGLE_EDGE:
                        case figure.AnchorType.ANCHOR_ANGLE_ANGLE:
                        case figure.AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE: {
                            path.curve(
                                this.values[prevValue - 2], this.values[prevValue - 1],
                                this.values[idxValue++], this.values[idxValue++],
                                this.values[idxValue++], this.values[idxValue++],
                            )
                        } break
                        case figure.AnchorType.ANCHOR_SYMMETRIC: {
                            const p0 = { x: this.values[prevValue - 4], y: this.values[prevValue - 3] }
                            const p1 = { x: this.values[prevValue - 2], y: this.values[prevValue - 1] }
                            const m = mirrorPoint(p1, p0)
                            path.curve(
                                m.x, m.y,
                                this.values[idxValue++], this.values[idxValue++],
                                this.values[idxValue++], this.values[idxValue++]
                            )
                        } break
                        default:
                            throw Error(`yikes 3: ${figure.AnchorType[prevType!]} -> ANCHOR_SMOOTH in ${this.toInternalString()}`)
                    }
                    break
                case figure.AnchorType.ANCHOR_ANGLE_ANGLE:
                case figure.AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
                    switch (prevType) {
                        case undefined:
                            idxValue += 2
                            path.move(this.values[idxValue++], this.values[idxValue++])
                            idxValue += 2
                            break
                        case figure.AnchorType.ANCHOR_EDGE:
                        case figure.AnchorType.ANCHOR_EDGE_ANGLE:
                        case figure.AnchorType.ANCHOR_ANGLE_EDGE:
                        case figure.AnchorType.ANCHOR_ANGLE_ANGLE:
                        case figure.AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE: {
                            path.curve(
                                this.values[prevValue - 2], this.values[prevValue - 1],
                                this.values[idxValue], this.values[idxValue + 1],
                                this.values[idxValue + 2], this.values[idxValue + 3]
                            )
                            idxValue += 6    
                        } break
                        case figure.AnchorType.ANCHOR_SYMMETRIC: {
                            const p0 = { x: this.values[prevValue - 4], y: this.values[prevValue - 3] }
                            const p1 = { x: this.values[prevValue - 2], y: this.values[prevValue - 1] }
                            const m = mirrorPoint(p1, p0)
                            path.curve(
                                m.x, m.y,
                                this.values[idxValue], this.values[idxValue + 1],
                                this.values[idxValue + 2], this.values[idxValue + 3]
                            )
                            idxValue += 6    
                        } break
                        default:
                            throw Error("yikes 4")
                    }
                    break
            }
            prevType = type
            if (this.types[idxType] === figure.AnchorType.CLOSE) {
                path.close()
            }
        }
        return path
    }
    override toString() {
        const path = this.getPath()
        if (this.matrix === undefined) {
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
        while (idx < this.values.length) {
            [this.values[idx], this.values[idx + 1]] = transform.transformArrayPoint([this.values[idx], this.values[idx + 1]])
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
        for (let idxType = 0; idxType < this.types.length; ++idxType) {
            switch (this.types[idxType]) {
                case figure.AnchorType.ANCHOR_EDGE:
                    d += `E ${this.values[idxValue++]} ${this.values[idxValue++]} `
                    break
                case figure.AnchorType.ANCHOR_EDGE_ANGLE:
                    d += `EA ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} `
                    break
                case figure.AnchorType.ANCHOR_ANGLE_EDGE:
                    d += `AE ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} `
                    break
                case figure.AnchorType.ANCHOR_SYMMETRIC:
                    d += `S ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} `
                    break
                case figure.AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
                    d += `SAA ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} `
                    break   
                case figure.AnchorType.ANCHOR_ANGLE_ANGLE:
                    d += `AA ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} ${this.values[idxValue++]} `
                    break
                case figure.AnchorType.CLOSE:
                    d += `Z `
            }
        }
        return d.trimEnd()
    }

    toPathString() {
        return this.getPath().toString()
    }
}
