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

import { ArrangeTool, EditTool, PenTool, TextTool, Tool } from "client/figuretools"
import { LocalDrawingModel } from "client/figureeditor/LocalDrawingModel"
import { Figure } from "client/figures"
import * as figure from "client/figures"
import { FigureEditor, KeyCode, Layer } from "client/figureeditor"
import { Path } from "client/paths"

import {
    pointEqualsPoint, pointPlusPoint, pointMinusPoint, pointMinus, distancePointToPoint
} from "shared/geometry"
import { Rectangle } from "shared/geometry/Rectangle"
import { Point } from "shared/geometry/Point"
import { Matrix } from "shared/geometry/Matrix"
import { EditorPointerEvent } from "client/figureeditor/EditorPointerEvent"

// NOTE: the translation in here is insufficient
// we could also track the modifier keys and emulate keyup events, etc.
//  key       code
//  --------------------------
//  ArrowDown ArrowDown
//  a         KeyA
//  A         KeyA + shift
//  ö         Semicolon
//  ä         Quote
//  Shift     ShiftLeft
//  Shift     ShiftRight
//  CapsLock  CapsLock
//  ' '       Space
//  '!'       Digit1 + shift
function keyCode2keyValue(code: KeyCode, option?: KeyboardOption): string {
    if (code.substr(0, 3) === "Key") {
        if (option?.shift === true)
            return code.substr(3)
        else
            return code.substr(3).toLowerCase()
    }
    if (code.substr(0, 5) === "Digit") {
        return code.substr(5)
    }
    if (code.substr(0, 6) === "Numeric") {
        return code.substr(6)
    }
    switch (code) {
        case "Space":
            return " "
        case "ShiftLeft":
        case "ShiftRight":
            return "Shift"
        case "ControlLeft":
        case "ControlRight":
            return "Control"
        case "AltLeft":
        case "AltRight":
            return "Alt"
        case "MetaLeft":
        case "MetaRight":
            return "Meta"
        case "Enter":
        case "NumpadEnter":
            return "Enter"
    }
    return code
}

interface KeyboardOption {
    shift?: boolean
    ctrl?: boolean
    alt?: boolean
    meta?: boolean // macOS: command key, windows: windows key
}

// PageObject style API for testing FigureEditor
// https://martinfowler.com/bliki/PageObject.html
export class FigureEditorScene {
    figureeditor: FigureEditor
    selectTool: ArrangeTool
    editTool: EditTool
    penTool: PenTool
    textTool: TextTool
    id: number
    model: LocalDrawingModel
    figures: Array<Figure>
    mousePosition: Point
    verbose: boolean

    constructor(verbose = false) {
        this.verbose = verbose
        this.id = 0

        let testFrame = document.getElementById("testframe")
        if (testFrame === null) {
            testFrame = document.createElement("div")
            testFrame.id = "testframe"
            document.body.appendChild(testFrame)
        }

        this.figureeditor = new FigureEditor()
        testFrame.appendChild(this.figureeditor)

        if (Tool.selection)
            Tool.selection.clear()

        this.selectTool = new ArrangeTool()
        this.editTool = new EditTool()
        this.penTool = new PenTool()
        this.textTool = new TextTool()
        this.figureeditor.setTool(this.selectTool)

        Tool.selection.clear()

        let model = new LocalDrawingModel()
        let layer = new Layer()

        model.layers.push(layer)
        this.figureeditor.setModel(model)

        this.model = model
        this.mousePosition = new Point()
        this.figures = []

        this.figureeditor.focus()
    }

    sleep(milliseconds: number = 500) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('success')
            }, milliseconds)
        })
    }

    // semantic operations

    selectSelectTool() { this.figureeditor.setTool(this.selectTool) }
    selectPenTool() { this.figureeditor.setTool(this.penTool) }
    selectTextTool() { this.figureeditor.setTool(this.textTool) }

    addFigure(figure: Figure): void {
        if (this.verbose)
            console.log("### ADD FIGURE")
        this.model.add(0, figure)
        this.figures.push(figure)
    }

    addRectangle(rectangle?: Rectangle, center?: Point, radiant?: number): void {
        if (this.verbose)
            console.log("### ADD RECTANGLE")
        if (rectangle === undefined)
            rectangle = new Rectangle()
        let fig = new figure.Rectangle(rectangle)
        fig.id = ++this.id
        fig.stroke = "#000"
        fig.fill = "rgba(255,0,0,0.2)"
        if (center !== undefined && radiant !== undefined) {
            let transform = new Matrix()
            transform.translate(pointMinus(center))
            transform.rotate(radiant)
            transform.translate(center)
            fig.matrix = transform
        } else
            if (center !== undefined) {
                let transform = new Matrix()
                transform.translate(center)
                fig.matrix = transform
            }
        this.model.add(0, fig)
        this.figures.push(fig)
    }

    selectFigure(index = 0, shift = true): void {
        if (this.verbose)
            console.log("### SELECT FIGURE")
        this.clickInsideFigure(index, shift)
        if (!Tool.selection.has(this.figures[index]))
            throw Error(`could not select figure ${index}`)
        // expect(Tool.selection.has(this.figures[index])).to.be.true
    }

    selectionHasPoint(point: Point): void {
        if (Tool.selection.empty())
            throw Error("Error: selection decoration is empty")
        let msg = ""
        for (let i of [0, 2, 4, 6]) {
            const handleInfo = this.figureeditor.tool!.getBoundaryHandle(i)
            if (handleInfo.path.contains(point))
                return
            msg = `${msg} (${handleInfo.path.data})`
        }
        throw Error(`Selection decoration has no edge (${point.x}, ${point.y}). We have ${msg}`)
    }

    selectionHasRectangle(rectangle: Rectangle, center?: Point, radiant?: number): void {
        // console.log("=== selectionHasRectangle ===")
        // console.log("transformation", this.selectTool.transformation)
        // console.log("boundary", this.selectTool.boundary)
        // console.log("boundaryTransformation", this.selectTool.boundaryTransformation)

        let transform: Matrix | undefined = undefined
        if (center !== undefined && radiant !== undefined) {
            transform = new Matrix()
            transform.translate(pointMinus(center))
            transform.rotate(radiant)
            transform.translate(center)
        }

        rectangle.forAllEdges((edge) => {
            this.selectionHasPoint(edge)
        }, transform)
    }

    renderHasPoint(point: Point): void {
        let msg = ""
        for (let [id, ce] of this.figureeditor.cache) {
            for (let segment of (ce.path as Path).data) {
                switch (segment.type) {
                    case 'M':
                    case 'L':
                        if (pointEqualsPoint(point, { x: segment.values[0], y: segment.values[1] }))
                            return
                        msg = `${msg} (${segment.values[0]}, ${segment.values[1]})`
                        break
                    case 'C':
                        throw Error("not implemented yet")
                        break
                }
            }
        }
        throw Error(`Rendered path has no edge (${point.x}, ${point.y}). We have ${msg}`)
    }

    renderHasRectangle(rectangle: Rectangle, center?: Point, radiant?: number): void {
        let transform: Matrix | undefined = undefined
        if (center !== undefined && radiant !== undefined) {
            transform = new Matrix()
            transform.translate(pointMinus(center))
            transform.rotate(radiant)
            transform.translate(center)
        }

        rectangle.forAllEdges((edge) => {
            this.renderHasPoint(edge)
        }, transform)
    }

    outlineHasPoint(point: Point): void {
        let outline = this.selectTool.outline!!
        let msg = ""
        for (let i = 0; i < outline.childNodes.length; ++i) {
            let path = outline.childNodes[i] as SVGPathElement
            let data = path.getPathData()
            for (let segment of data) {
                switch (segment.type) {
                    case 'M':
                    case 'L':
                        if (pointEqualsPoint(point, { x: segment.values[0], y: segment.values[1] }))
                            return
                        msg = `${msg} (${segment.values[0]}, ${segment.values[1]})`
                        break
                    case 'C':
                        throw Error("not implemented yet")
                        break
                }
            }
        }
        throw Error(`Outline path has no edge (${point.x}, ${point.y}). We have ${msg}`)
    }

    outlineHasRectangle(rectangle: Rectangle, center?: Point, radiant?: number): void {
        let transform: Matrix | undefined = undefined
        if (center !== undefined && radiant !== undefined) {
            transform = new Matrix()
            transform.translate(pointMinus(center))
            transform.rotate(radiant)
            transform.translate(center)
        }

        rectangle.forAllEdges((edge) => {
            this.outlineHasPoint(edge)
        }, transform)
    }

    pointerDownAt(point: Point, shift = true): void {
        if (this.verbose)
            console.log(`### POINTER DOWN AT ${point.x}, ${point.y}`)
        this.mousePosition = new Point(point)
        this.figureeditor.mouseIsDown = true
        this.figureeditor.mouseDownAt = point
        this.figureeditor.tool!.pointerEvent({
            x: this.mousePosition.x,
            y: this.mousePosition.y,
            editor: this.figureeditor,
            type: "down",
            pointerDown: true,
            shiftKey: shift,
            altKey: false,
            metaKey: false,
            ctrlKey: false,
            pointerId: 0,
            pointerType: "mouse",
            pressure: 1,
            tiltX: 0,
            tiltY: 0,
            twist: 0
        })
    }

    pointerTo(point: Point, shift = true) {
        if (this.verbose)
            console.log(`### MOVE POINTER TO ${point.x}, ${point.y}`)
        this.mousePosition = new Point(point)
        this.figureeditor.tool!.pointerEvent({
            x: this.mousePosition.x,
            y: this.mousePosition.y,
            editor: this.figureeditor,
            type: "move",
            pointerDown: true,
            shiftKey: shift,
            altKey: false,
            metaKey: false,
            ctrlKey: false,
            pointerId: 0,
            pointerType: "mouse",
            pressure: 1,
            tiltX: 0,
            tiltY: 0,
            twist: 0
        })
    }

    movePointerBy(translation: Point, shift = true): void {
        if (this.verbose)
            console.log(`### MOVE POINTER BY ${translation.x}, ${translation.y}`)
        this.mousePosition = pointPlusPoint(this.mousePosition, translation)
        this.figureeditor.tool!.pointerEvent({
            x: this.mousePosition.x,
            y: this.mousePosition.y,
            editor: this.figureeditor,
            type: "move",
            pointerDown: true,
            shiftKey: shift,
            altKey: false,
            metaKey: false,
            ctrlKey: false,
            pointerId: 0,
            pointerType: "mouse",
            pressure: 1,
            tiltX: 0,
            tiltY: 0,
            twist: 0
        })
    }

    pointerUp(shift = true): void {
        if (this.verbose)
            console.log(`### POINTER UP`)
        this.figureeditor.mouseIsDown = false
        this.figureeditor.tool!.pointerEvent({
            x: this.mousePosition.x,
            y: this.mousePosition.y,
            editor: this.figureeditor,
            type: "up",
            pointerDown: true,
            shiftKey: shift,
            altKey: false,
            metaKey: false,
            ctrlKey: false,
            pointerId: 0,
            pointerType: "mouse",
            pressure: 1,
            tiltX: 0,
            tiltY: 0,
            twist: 0
        })
    }

    pointerClickAt(point: Point, shift = false): void {
        if (this.verbose)
            console.log(`### POINTER CLICK AT ${point}`)
        this.pointerDownAt(point, shift)
        this.pointerUp(shift)
    }

    clickInsideFigure(index = 0, shift = false): void {
        if (this.verbose)
            console.log(`### CLICK INSIDE FIGURE ${index}`)
        this.pointerDownAt(this.centerOfFigure(index), shift)
        this.pointerUp(shift)
    }

    centerOfFigure(index = 0): Point {
        let f = this.figures[index]
        let center = f.bounds().center()
        if (f.matrix)
            center = f.matrix.transformPoint(center)
        return center
    }

    centerOfNWScaleHandle(index = 0): Point {
        // let range = figure.Figure.HANDLE_RANGE/2
        // return this.figures[index].origin // pointMinusPoint(this.figure.bounds().origin, new Point({x: range, y: range}))
        // return this.figures[index].getHandlePosition(0)
        return this.figures[index].bounds().origin
    }

    centerOfNWRotateHandle(index = 0): Point {
        // return this.figures[index].getHandlePosition(0)
        let handleRange = figure.Figure.HANDLE_RANGE
        return pointMinusPoint(this.figures[index].bounds().origin, { x: handleRange, y: handleRange })
    }

    createTextArea() {
        this.selectTextTool()
        this.pointerDownAt(new Point(10, 15))
        this.movePointerBy(new Point(110, 50))
        this.pointerUp()
    }

    private getActiveElement(): Element | null {
        let active = document.activeElement
        while (active?.shadowRoot?.activeElement) {
            active = active.shadowRoot.activeElement
        }
        return active
    }

    private dispatchEvent(event: Event) {
        let active = this.getActiveElement()
        active?.dispatchEvent(event)
    }

    keydown(keycode: KeyCode, option?: KeyboardOption): void {
        if (this.verbose)
            console.log(`### KEY DOWN ${keycode}`)

        let event = new KeyboardEvent("keydown", {
            key: keyCode2keyValue(keycode, option),
            code: keycode,
            altKey: option?.alt,
            shiftKey: option?.shift,
            ctrlKey: option?.ctrl,
            metaKey: option?.meta,
            composed: true,
            cancelable: true,
            bubbles: true,
        })
        this.dispatchEvent(event)
    }

    keyup(keycode: KeyCode, option?: KeyboardOption): void {
        if (this.verbose)
            console.log(`### KEY UP ${keycode}`)

        let event = new KeyboardEvent("keyup", {
            key: keyCode2keyValue(keycode, option),
            code: keycode,
            altKey: option?.alt,
            shiftKey: option?.shift,
            ctrlKey: option?.ctrl,
            metaKey: option?.meta,
            composed: true,
            cancelable: true,
            bubbles: true,
        })
        this.dispatchEvent(event)
    }

    async cut(): Promise<string | undefined> {
        return this.cutNCopy("cut")
    }

    async copy(): Promise<string | undefined> {
        return this.cutNCopy("copy")
    }

    protected async cutNCopy(type: "cut" | "copy"): Promise<string | undefined> {
        return new Promise<string | undefined>((resolve, reject) => {
            const dataTransfer = new DataTransfer()
            const event = new ClipboardEvent(type, {
                clipboardData: dataTransfer
            })
            this.dispatchEvent(event)
            if (event.clipboardData!.items.length === 0) {
                resolve(undefined)
            } else {
                const item = Array.from(event.clipboardData!.items).filter(event => event.kind === "string" && event.type === "text/plain").shift()
                if (item)
                    item.getAsString(resolve)
                else
                    reject("Got clipboard data without text/plain.")
            }
        })
    }

    paste(text: string) {
        const dataTransfer = new DataTransfer()
        dataTransfer.setData('text/plain', text)
        const event = new ClipboardEvent("paste", {
            clipboardData: dataTransfer
        })
        this.dispatchEvent(event)
        return this.sleep(0)
    }

    //
    // New methods for pentool.spec.ts
    //

    getAnchorHandleCount() {
        let a = 0, h = 0
        const decorations = this.figureeditor.shadowRoot?.getElementById("pen-tool-decoration")!
        for (let i = 0; i < decorations.children.length; ++i) {
            if (decorations.children[i] instanceof SVGRectElement &&
                (decorations.children[i] as SVGRectElement).style.display !== "none") {
                ++a
            }
            if (decorations.children[i] instanceof SVGCircleElement &&
                (decorations.children[i] as SVGCircleElement).style.display !== "none") {
                ++h
            }
        }
        return [a, h]
    }

    hasAnchorAt(point: Point) {
        const decorations = this.figureeditor.shadowRoot?.getElementById("pen-tool-decoration")!
        for (let i = 0; i < decorations.children.length; ++i) {
            const child = decorations.children[i]
            if (child instanceof SVGRectElement && child.style.display !== "none") {
                const r = new Rectangle(
                    Number.parseFloat(child.getAttributeNS(null, "x")!),
                    Number.parseFloat(child.getAttributeNS(null, "y")!),
                    Number.parseFloat(child.getAttributeNS(null, "width")!),
                    Number.parseFloat(child.getAttributeNS(null, "height")!)
                )
                if (r.inside(point)) {
                    return true
                }
            }
        }
        return false
    }

    hasHandleAt(anchor: Point, handle: Point) {
        const decorations = this.figureeditor.shadowRoot?.getElementById("pen-tool-decoration")!
        for (let i = 0; i < this.penTool._handles.length; ++i) {
            const circle = this.penTool._handles[i]
            if (circle !== undefined &&
                circle.style.display !== "none" &&
                circle.parentElement == decorations) {
                const cx = Number.parseFloat(circle.getAttributeNS(null, "cx")!)
                const cy = Number.parseFloat(circle.getAttributeNS(null, "cy")!)
                const r = Number.parseFloat(circle.getAttributeNS(null, "r")!)
                if (distancePointToPoint({ x: cx, y: cy }, handle) <= r) {
                    const line = this.penTool.lines[i]
                    const p0 = {
                        x: Number.parseFloat(line.getAttributeNS(null, "x1")!),
                        y: Number.parseFloat(line.getAttributeNS(null, "y1")!)
                    }
                    const p1 = {
                        x: Number.parseFloat(line.getAttributeNS(null, "x2")!),
                        y: Number.parseFloat(line.getAttributeNS(null, "y2")!)
                    }
                    if (distancePointToPoint(p0, anchor) > 1) {
                        break
                    }
                    if (distancePointToPoint(p1, handle) > 1) {
                        break
                    }
                    return true
                }
            }
        }
        console.error(`expected anchor (${anchor.x}, ${anchor.y}) to handle (${handle.x}, ${handle.y})`)
        for (let i = 0; i < this.penTool._handles.length; ++i) {
            const circle = this.penTool._handles[i]
            if (circle === undefined || circle.style.display === "none") {
                continue
            }
            const cx = Number.parseFloat(circle.getAttributeNS(null, "cx")!)
            const cy = Number.parseFloat(circle.getAttributeNS(null, "cy")!)
            const r = Number.parseFloat(circle.getAttributeNS(null, "r")!)
            const line = this.penTool.lines[i]
            const x1 = Number.parseFloat(line.getAttributeNS(null, "x1")!)
            const y1 = Number.parseFloat(line.getAttributeNS(null, "y1")!)
            const x2 = Number.parseFloat(line.getAttributeNS(null, "x2")!)
            const y2 = Number.parseFloat(line.getAttributeNS(null, "y2")!)
            console.log(`  have line(${x1}, ${y1} - ${x2}, ${y2}) to handle (${cx}, ${cy})`)
        }
        return false
    }
}
