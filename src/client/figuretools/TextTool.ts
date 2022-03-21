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

/******************************************************************
 * TERMS
 * o decoration: a rectangular frame with the handles (FIXME: frame is missing, TODO: pivot point for rotation as handle)
 * o outline   : an outline of the selected figures
 *               transformations will only be applied to the outline
 *               until the mouse is released, upon which the transformation
 *               is applied to the model/send to the server
 ******************************************************************/

 import { Rectangle } from "shared/geometry/Rectangle"
import { Point } from "shared/geometry/Point"
import { FigureEditor, EditorPointerEvent, EditorKeyboardEvent, Operation } from "../figureeditor"
import { Tool } from "./Tool"
import * as figures from "../figures"
import { TextEditor } from "client/wordwrap/TextEditor"

enum TextCursorType {
    NONE,
    EDIT,
    AREA,
    SHAPE,
    PATH
}

enum TextToolState {
    NONE,
    AREA,
    EDIT
}

export class TextTool extends Tool {
    state: TextToolState
    currentCursor: TextCursorType

    mouseDownAt!: Point
    defs!: SVGDefsElement
    svgRect!: SVGRectElement

    figure!: figures.Text // FIXME: this doesn't work in server mode
    texteditor?: TextEditor

    constructor() {
        super()
        this.state = TextToolState.NONE
        this.currentCursor = TextCursorType.NONE
    }

    override activate(editor: FigureEditor) {
        this.state = TextToolState.NONE
        Tool.setHint(`type tool: <pointer>drag</pointer> to add text area`)
    }

    override deactivate(editor: FigureEditor) {
        this.stopEdit(editor)
        this.setCursor(TextCursorType.NONE, editor.svgView)
        editor.svgView.style.cursor = "default"
        this.removeOutlines(editor)
        this.removeDecoration(editor)
    }

    override pointerdown(event: EditorPointerEvent) {
        let figure = event.editor.selectedLayer!.findFigureAt(event)
        if (figure === undefined) {
            this.state = TextToolState.AREA
            this.startDrawTextArea(event)
        } else {
            if (figure instanceof figures.Text) {
                this.figure = figure
                this.state = TextToolState.EDIT
                this.startEdit(event.editor)
                this.texteditor!.mousedown(event)
                Tool.selection.set(figure)
                this.updateDecorationOfSelection(event.editor)
            } else {
                // create text within shape
            }
        }
    }

    override pointermove(event: EditorPointerEvent) {
        switch (this.state) {
            case TextToolState.EDIT:
                if (event.editor.pointerIsDown) {
                    this.texteditor!.mousemove(event)
                    return
                }
            case TextToolState.NONE:
                this.setCursorBasedOnFigureBelowMouse(event)
                break
            case TextToolState.AREA:
                this.resizeDrawTextArea(event)
                break
        }
    }

    override pointerup(event: EditorPointerEvent) {
        switch (this.state) {
            case TextToolState.AREA:
                this.stopDrawTextArea(event)
                this.createTextArea(event)
                this.state = TextToolState.EDIT
                this.startEdit(event.editor)
                break
        }
    }

    override keydown(event: EditorKeyboardEvent) {
        if (this.state == TextToolState.EDIT) {
            this.texteditor!.keydown(event)
            event.editor.model?.modified.trigger({
                operation: Operation.UPDATE_FIGURES,
                figures: [this.figure.id]
            })
        }
    }

    override clipboard(editor: FigureEditor, event: ClipboardEvent) {
        if (this.state == TextToolState.EDIT) {
            this.texteditor!.clipboard(editor, event)
            editor.model?.modified.trigger({
                operation: Operation.UPDATE_FIGURES,
                figures: [this.figure.id]
            })
        }
    }

    protected setCursor(type: TextCursorType, svg: SVGElement) {
        if (this.currentCursor === type)
            return
        this.currentCursor = type
        svg.style.cursor = ""
        switch (type) {
            case TextCursorType.NONE:
                svg.style.cursor = "default"
                break
            case TextCursorType.EDIT:
                svg.style.cursor = `url(${Tool.cursorPath}text-edit.svg) 9 12, move`
                break
            case TextCursorType.AREA:
                svg.style.cursor = `url(${Tool.cursorPath}text-area.svg) 9 12, move`
                break
            case TextCursorType.SHAPE:
                svg.style.cursor = `url(${Tool.cursorPath}text-shape.svg) 9 12, move`
                break
            case TextCursorType.PATH:
                svg.style.cursor = `url(${Tool.cursorPath}text-path.svg) 9 12, move`
                break
        }
    }

    protected setCursorBasedOnFigureBelowMouse(event: EditorPointerEvent) {
        let figure = event.editor.selectedLayer!.findFigureAt(event)
        // console.log(`at ${event.x},${event.y} found ${figure}`)
        if (figure === undefined) {
            this.setCursor(TextCursorType.AREA, event.editor.svgView)
        } else {
            if (figure instanceof figures.Text) {
                this.setCursor(TextCursorType.EDIT, event.editor.svgView)
            } else {
                this.setCursor(TextCursorType.SHAPE, event.editor.svgView)
            }
        }
    }

    //
    // Edit
    //

    startEdit(editor: FigureEditor) {
        this.stopEdit(editor)
        this.texteditor = new TextEditor(editor, this.figure)
    }

    stopEdit(editor: FigureEditor) {
        if (this.texteditor === undefined)
            return
        this.texteditor.stop()
        this.texteditor = undefined
        editor.model?.modified.trigger({
            operation: Operation.UPDATE_FIGURES,
            figures: [this.figure.id]
        })
    }

    //
    // TextArea
    //

    protected startDrawTextArea(event: EditorPointerEvent) {
        this.mouseDownAt = event
        // create text area
        this.defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
        this.defs.innerHTML =
            `<pattern id="textToolPattern"
                x="0" y="0" width="100" height="4"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)">
               <line x1="0" y1="0" x2="100" y2="0" style="stroke: rgb(79,128,255)" />
            </pattern>`
        event.editor.svgView.appendChild(this.defs)

        this.svgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        this.svgRect.setAttributeNS("", 'stroke', 'rgb(79,128,255)')
        this.svgRect.setAttributeNS("", 'fill', 'url(#textToolPattern)')
        event.editor.decorationOverlay.appendChild(this.svgRect)
    }

    protected resizeDrawTextArea(event: EditorPointerEvent) {
        let x0 = this.mouseDownAt!.x, y0 = this.mouseDownAt!.y, x1 = event.x, y1 = event.y
        if (x1 < x0) [x0, x1] = [x1, x0]
        if (y1 < y0) [y0, y1] = [y1, y0]
        this.svgRect!.setAttributeNS("", "x", `${Math.round(x0) + 0.5}`) // FIXME: just a hunch for nice rendering
        this.svgRect!.setAttributeNS("", "y", `${Math.round(y0) + 0.5}`)
        this.svgRect!.setAttributeNS("", "width", `${Math.round(x1 - x0)}`)
        this.svgRect!.setAttributeNS("", "height", `${Math.round(y1 - y0)}`)
    }

    protected stopDrawTextArea(event: EditorPointerEvent) {
        event.editor.decorationOverlay.removeChild(this.svgRect)
        event.editor.svgView.removeChild(this.defs)
    }

    protected createTextArea(event: EditorPointerEvent) {
        let x0 = this.mouseDownAt!.x,
            y0 = this.mouseDownAt!.y,
            x1 = event.x,
            y1 = event.y

        if (x1 < x0) [x0, x1] = [x1, x0]
        if (y1 < y0) [y0, y1] = [y1, y0]

        // we add the figure here
        let rect = new Rectangle(x0, y0, x1 - x0, y1 - y0)
        this.figure = new figures.Text(rect)
        event.editor.addFigure(this.figure)

        Tool.selection.set(this.figure)
        this.updateDecorationOfSelection(event.editor)
    }
}
