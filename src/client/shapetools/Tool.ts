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

import { AbstractPath } from "../paths/AbstractPath"
import { Path } from "../paths/Path"
import { Shape } from "../shapes/Shape"
import { EditorPointerEvent } from "../shapeeditor/EditorPointerEvent"
import { EditorKeyboardEvent } from "../shapeeditor/EditorKeyboardEvent"
import { ShapeSelectionModel } from "../shapeeditor/ShapeSelectionModel"
import { ShapeEditor } from "../shapeeditor/ShapeEditor"
import { pointMultiplyNumber, pointMinus, pointMinusSize, sizeMultiplyNumber, isEqual, pointMinusPoint, squaredLength } from "shared/geometry"
import { Rectangle } from "shared/geometry/Rectangle"
import { PointLike } from "shared/geometry/Point"
import { Matrix } from "shared/geometry/Matrix"
import { parseXML, Tag, TagType, Text } from "client/utils/xml"
import { nonScalingStroke } from "../shapeeditor/Decoration"
import { JSX, replaceChildren } from "toad.jsx/jsx-runtime"

// where a boundary handle is, and how it rotates, in canvas units
export interface BoundaryHandle {
    center: PointLike
    handleDirection: PointLike
    rotation?: { toCenter: PointLike, flipped: boolean, factor: number }
}

export class Tool {
    static selection: ShapeSelectionModel // = new ShapeSelectionModel()
    static cursorPath = "img/cursor/"

    debug = false
    insideHandle?: number

    transformation: Matrix
    boundary: Rectangle
    boundaryTransformation: Matrix

    handles: Map<Shape, Array<AbstractPath>>

    activate(editor: ShapeEditor) { }
    deactivate(editor: ShapeEditor) { }

    pointerEvent(event: EditorPointerEvent) {
        switch (event.type) {
            case "down": return this.pointerdown(event)
            case "move": return this.pointermove(event)
            case "up": return this.pointerup(event)
        }
    }
    pointerdown(event: EditorPointerEvent) { }
    pointermove(event: EditorPointerEvent) { }
    pointerup(event: EditorPointerEvent) { }

    keyEvent(event: EditorKeyboardEvent) {
        switch (event.type) {
            case "down": return this.keydown(event)
            case "up": return this.keyup(event)
        }
    }
    keydown(event: EditorKeyboardEvent) { }
    keyup(event: EditorKeyboardEvent) { }
    clipboard(editor: ShapeEditor, event: ClipboardEvent) { }

    constructor() {
        if (Tool.selection === undefined) Tool.selection = new ShapeSelectionModel() // FIXME: initialization via static doesn't work
        this.transformation = new Matrix()
        this.boundary = new Rectangle()
        this.boundaryTransformation = new Matrix()
        this.handles = new Map<Shape, Array<Path>>()
    }

    updateBoundary() {
        // console.log(`SelectTool.updateBoundary() ENTER`)
        this.boundaryTransformation.identity()
        this.boundary = new Rectangle()

        if (Tool.selection.empty()) {
            // console.log(`SelectTool.updateBoundary() DONE`)
            return
        }

        // get rotation of the selected shapes
        let firstRotation = true
        let rotation = 0.0
        for (let shape of Tool.selection.selection) {
            let r: number
            if (shape.matrix === undefined) {
                r = 0.0
            } else {
                r = shape.matrix.getRotation()
                if (isNaN(r)) {
                    rotation = 0.0
                    break
                }
            }

            if (firstRotation) {
                firstRotation = false
                rotation = r
            } else {
                if (!isEqual(r % (Math.PI / 2), rotation % (Math.PI / 2))) {
                    rotation = 0.0
                    break
                }
            }
        }

        // get boundary of selected shapes in a coordinate system rotated by 'rotation'
        let rotationAroundOrigin = new Matrix()
        rotationAroundOrigin.rotate(rotation)
        let inverseRotationAroundOrigin = new Matrix(rotationAroundOrigin).invert()
        let boundary = new Rectangle()
        let firstEdge = true
        for (let shape of Tool.selection.selection) {
            let shapeBoundary = shape.bounds()
            // console.log(`shape ${shape.id} matrix`, shape.matrix)
            shapeBoundary.forAllEdges((edge) => {
                // console.log(`shape ${shape.id} edge ${edge.x}, ${edge.y}`)
                edge = inverseRotationAroundOrigin.transformPoint(edge)
                if (firstEdge) {
                    firstEdge = false
                    boundary.origin = edge
                } else {
                    boundary.expandByPoint(edge)
                }
            }, shape.matrix)
        }

        // get center in real coordinate system
        let center = rotationAroundOrigin.transformPoint(boundary.center())

        // setup rotated boundary
        this.boundary.origin = pointMinusSize(center, sizeMultiplyNumber(boundary.size, 0.5))
        this.boundary.size = boundary.size

        if (rotation != 0.0) {
            this.boundaryTransformation.translate(pointMinus(center))
            this.boundaryTransformation.rotate(rotation)
            this.boundaryTransformation.translate(center)
        }
        // console.log(`SelectTool.updateBoundary() DONE`)
    }

    getBoundaryHandle(handle: number): BoundaryHandle {
        const m = new Matrix(this.transformation)
        m.append(this.boundaryTransformation)

        let x = this.boundary.origin.x,
            y = this.boundary.origin.y,
            w = this.boundary.size.width,
            h = this.boundary.size.height

        const shapeCenter = m.transformPoint({ x: x + w / 2, y: y + h / 2 })

        let handleDirection: PointLike
        switch (handle % 8) {
            case 0:
                handleDirection = { x: -1, y: -1 }
                break
            case 1:
                handleDirection = { x: 0, y: -1 }
                break
            case 2:
                handleDirection = { x: 1, y: -1 }
                break
            case 3:
                handleDirection = { x: 1, y: 0 }
                break
            case 4:
                handleDirection = { x: 1, y: 1 }
                break
            case 5:
                handleDirection = { x: 0, y: 1 }
                break
            case 6:
                handleDirection = { x: -1, y: 1 }
                break
            case 7:
                handleDirection = { x: -1, y: 0 }
                break
        }
        const origin = m.transformPoint({ x: 0, y: 0 })
        handleDirection = pointMinusPoint(m.transformPoint(handleDirection!), origin)

        //
        // HANDLES FOR ROTATION
        //
        if (handle >= 8) {
            let previous, center
            switch (handle) {
                case 8:
                    previous = m.transformPoint({ x: x, y: y + h })
                    center = m.transformPoint({ x: x, y: y })
                    break
                case 9:
                    previous = m.transformPoint({ x: x, y: y })
                    center = m.transformPoint({ x: x + w / 2, y: y })
                    break
                case 10:
                    previous = m.transformPoint({ x: x, y: y })
                    center = m.transformPoint({ x: x + w, y: y })
                    break
                case 11:
                    previous = m.transformPoint({ x: x + w, y: y })
                    center = m.transformPoint({ x: x + w, y: y + h / 2 })
                    break
                case 12:
                    previous = m.transformPoint({ x: x + w, y: y })
                    center = m.transformPoint({ x: x + w, y: y + h })
                    break
                case 13:
                    previous = m.transformPoint({ x: x + w, y: y + h })
                    center = m.transformPoint({ x: x + w / 2, y: y + h })
                    break
                case 14:
                    previous = m.transformPoint({ x: x + w, y: y + h })
                    center = m.transformPoint({ x: x, y: y + h })
                    break
                case 15:
                    previous = m.transformPoint({ x: x, y: y + h })
                    center = m.transformPoint({ x: x, y: y + h / 2 })
                    break
                default:
                    throw Error("yikes")
            }

            const toCenterX = pointMinusPoint(center, previous)
            const toCenter = pointMultiplyNumber(toCenterX, 1 / Math.sqrt(squaredLength(toCenterX)))

            // the size of the handle in canvas units, per handle size
            const scale1 = m.transformPoint({ x: 0, y: 0 })
            const scale2 = m.transformPoint({ x: 1, y: 0 })
            const factor = Math.sqrt(squaredLength(pointMinusPoint(scale2, scale1)))

            return { center, handleDirection, rotation: { toCenter, flipped: handle % 2 !== 0, factor } }
        }

        //
        // HANDLES FOR SCALING SCALE
        //
        let v = { x: 0, y: 0 } // FIXME: pre-store x in an array
        switch (handle % 8) {
            case 0:
                [x, y] = [x, y]
                v = { x: -1, y: -1 }
                break
            case 1:
                [x, y] = [x + w / 2.0, y]
                v = { x: 0, y: -1 }
                break
            case 2:
                [x, y] = [x + w, y]
                v = { x: 1, y: -1 }
                break
            case 3:
                [x, y] = [x + w, y + h / 2.0]
                v = { x: 1, y: 0 }
                break
            case 4:
                [x, y] = [x + w, y + h]
                v = { x: 1, y: 1 }
                break
            case 5:
                [x, y] = [x + w / 2.0, y + h]
                v = { x: 0, y: 1 }
                break
            case 6:
                [x, y] = [x, y + h]
                v = { x: -1, y: 1 }
                break
            case 7:
                [x, y] = [x, y + h / 2.0]
                v = { x: -1, y: 0 }
                break
        }
        const center = m.transformPoint({ x, y })
        return { center, handleDirection }
    }

    setCursorForHandle(h: number, handle: { handleDirection: PointLike }, svg: SVGElement) {
        const r1 = Math.atan2(handle.handleDirection.y, handle.handleDirection.x)
        const r2 = r1 + (13 - 7.5) / 16 * 2 * Math.PI
        let r3 = (Math.round(r2 / (2 * Math.PI) * 8) + 8) % 8

        // console.log(`h=${h}, r1=${r1}, r2=${r2}, r3=${r3}`)

        if (h >= 8)
            r3 += 8

        switch (r3) {
            case 0:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-nw.svg) 6 6, move`)
                break
            case 1:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-n.svg) 4 7, move`)
                break
            case 2:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-ne.svg) 6 6, move`)
                break
            case 3:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-e.svg) 7 4, move`)
                break
            case 4:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-se.svg) 6 6, move`)
                break
            case 5:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-s.svg) 4 7, move`)
                break
            case 6:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-sw.svg) 6 6, move`)
                break
            case 7:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-resize-w.svg) 7 4, move`)
                break
            case 8:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-nw.svg) 5 5, move`)
                break
            case 9:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-n.svg) 7 2, move`)
                break
            case 10:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-ne.svg) 8 5, move`)
                break
            case 11:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-e.svg) 5 7, move`)
                break
            case 12:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-se.svg) 8 8, move`)
                break
            case 13:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-s.svg) 7 5, move`)
                break
            case 14:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-sw.svg) 5 8, move`)
                break
            case 15:
                svg.setAttributeNS("", "style", `cursor: url(${Tool.cursorPath}select-rotate-w.svg) 2 7, move`)
                break
        }
    }

    /*******************************************************************
     *                                                                 *
     *             O U T L I N E   &   D E C O R A T I O N             *
     *                                                                 *
     *******************************************************************/

    // NOTE: might want to generalize this in the future to be available
    //       for all tools, plugable for different look/device requirements,
    //       handles could be distinguished into corner, curve, ...

    updateOutlineAndDecorationOfSelection(editor: ShapeEditor): void {
        // console.log(`Tool.updateOutlineAndDecorationOfSelection() for selection of ${Tool.selection.selection.size} shapes`)
        this.updateOutlineOfSelection(editor)
        this.updateDecorationOfSelection(editor)
    }

    updateOutlineOfSelection(editor: ShapeEditor): void {
        // console.log(`Tool.updateOutlineAndDecorationOfSelection() for selection of ${Tool.selection.selection.size} shapes`)
        this.removeOutlines(editor)
        this.createOutlines(editor)
    }

    updateDecorationOfSelection(editor: ShapeEditor): void {
        // console.log(`Tool.updateOutlineAndDecorationOfSelection() for selection of ${Tool.selection.selection.size} shapes`)
        this.removeDecoration(editor)
        this.createDecoration(editor)
    }

    createOutlines(editor: ShapeEditor): void { // FIXME: rename into createOutlinesForSelection()
        // this.outline.setAttributeNS("", "transform", "translate(-1, 1)")

        for (let shape of Tool.selection.selection) {
            editor.outline.appendChild(this.createOutline(editor, shape))
        }

    }

    createOutline(editor: ShapeEditor, shape: Shape) {
        let path = shape.getPath()
        if (shape.matrix !== undefined)
            path.transform(shape.matrix)
        path.transform(this.transformation)
        let svg = path.updateSVG(editor.outline, undefined)
        this.setOutlineColors(svg)
        return svg
    }

    removeOutlines(editor: ShapeEditor): void {
        editor.outline.replaceChildren()
    }

    setOutlineColors(svg: SVGElement): void {
        if (svg instanceof SVGGElement) {
            // for(let child of svg.childNodes) {
            for (let i = 0; i < svg.childNodes.length; ++i) {
                let child = svg.childNodes[i] as SVGElement
                this.setOutlineColors(child)
            }
        } else {
            svg.setAttributeNS("", "stroke-width", "1")
            svg.setAttributeNS("", "stroke", "#4f80ff")
            svg.setAttributeNS("", "fill", "none")
            nonScalingStroke(svg)
        }
    }

    updateDecoration(editor: ShapeEditor) {
        this.removeDecoration(editor)
        this.createDecoration(editor)
    }

    createDecoration(editor: ShapeEditor) {
        if (Tool.selection.empty())
            return

        this.updateBoundary() // FIXME: side effect
        this.createDecorationRectangle(editor)
        this.createDecorationHandles(editor)
    }

    createDecorationRectangle(editor: ShapeEditor) {
        // adjust boundary to nice looking screen coordinates
        let rectangle = new Rectangle(this.boundary)
        rectangle.origin.x = Math.round(rectangle.origin.x - 0.5) + 0.5
        rectangle.origin.y = Math.round(rectangle.origin.y - 0.5) + 0.5
        rectangle.size.width = Math.round(rectangle.size.width)
        rectangle.size.height = Math.round(rectangle.size.height)

        // convert to path
        let path = new Path()
        path.appendRect(rectangle)

        // transform path to screen
        let m = new Matrix(this.transformation)
        m.append(this.boundaryTransformation)
        path.transform(m)

        editor.decorations.frame(path)
    }

    createDecorationHandles(editor: ShapeEditor) {
        for (let h = 15; h >= 0; --h) {
            const handle = this.getBoundaryHandle(h)
            // rotation handles are transparent, they can be clicked but not seen
            const item = handle.rotation
                ? editor.decorations.rotateHandle(handle.center, handle.rotation.toCenter, handle.rotation.flipped, handle.rotation.factor)
                : editor.decorations.scaleHandle(handle.center)
            this.setCursorForHandle(h, handle, item.element)
            item.element.onpointerenter = () => {
                this.insideHandle = h
            }
            item.element.onpointerleave = () => {
                this.insideHandle = undefined
            }
        }
    }

    // FIXME: this belongs in ShapeEditor
    removeDecoration(editor: ShapeEditor) {
        editor.decorations.clear()
    }

    static setHint(hint: string | JSX.Element) {
        const hintView = document.getElementById("hint")
        if (!hintView) {
            return
        }
        if (typeof hint === "string") {
            const xml = parseXML("Tool.setHint()", hint)
            Tool.transform(xml)
            hintView.innerHTML = xml.toString()
        } else {
            replaceChildren(hintView, hint)
        }
    }

    static clearHint() {
        const hintView = document.getElementById("hint")
        if (!hintView)
            return
        hintView.innerHTML = ``
    }

    static transform(xml: Tag) {
        xml.forAll("pointer", (tag: Tag) => {
            tag.name = "span"
            tag.addAttribute("class", "action")
        })
        xml.forAll("ctrl", (tag: Tag) => {
            tag.name = "kbd"
            tag.type = TagType.Start
            const text = new Text(tag.filename, tag.row, tag.col)
            if (navigator.appVersion.indexOf("Macintosh") !== -1) {
                text.text = " ^ " // aka. ctrl, control
            } else {
                text.text = "ctrl"
            }
            tag.pushBack(text)
        })
        xml.forAll("alt", (tag: Tag) => {
            tag.name = "kbd"
            tag.type = TagType.Start
            const text = new Text(tag.filename, tag.row, tag.col)
            if (navigator.appVersion.indexOf("Macintosh") !== -1) {
                text.text = "⌥" // aka. opt, option
            } else {
                text.text = "alt"
            }
            tag.pushBack(text)
        })
        xml.forAll("meta", (tag: Tag) => {
            tag.name = "kbd"
            tag.type = TagType.Start
            const text = new Text(tag.filename, tag.row, tag.col)
            if (navigator.appVersion.indexOf("Macintosh") !== -1) {
                text.text = "⌘" // aka. cmd, command
            } else {
                text.text = "⊞" // aka. windows, linux key
            }
            tag.pushBack(text)
        })
        xml.forAll("shift", (tag: Tag) => {
            tag.name = "kbd"
            tag.type = TagType.Start
            const text = new Text(tag.filename, tag.row, tag.col)
            text.text = "⇧"
            tag.pushBack(text)
        })
        xml.forAll("enter", (tag: Tag) => {
            tag.name = "kbd"
            tag.type = TagType.Start
            const text = new Text(tag.filename, tag.row, tag.col)
            text.text = "↩"
            tag.pushBack(text)
        })
        xml.forAll("esc", (tag: Tag) => {
            tag.name = "kbd"
            tag.type = TagType.Start
            const text = new Text(tag.filename, tag.row, tag.col)
            text.text = "esc"
            tag.pushBack(text)
        })

        return xml
    }
}
