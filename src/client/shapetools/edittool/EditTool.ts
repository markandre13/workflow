import { ShapeEditor, EditorPointerEvent, EditorKeyboardEvent } from "client/shapeeditor"
import { Path } from "client/shapes/Path"
import { Tool } from "../Tool"
import { EditToolEditor } from "./EditToolEditor"
import { EditToolState } from "./EditToolState"
import { PathEditor } from "./PathEditor"

export class EditTool extends Tool {
    state: EditToolState
    constructor() {
        super()
        this.debug = false
        this.state = EditToolState.NONE
    }

    override activate(editor: ShapeEditor) {
        Tool.setHint(`edit tool: under construction, use pointer with <ctrl/> to smooth or with <alt/> to sharpen edges`)
        editor.svg.style.cursor = `url(${Tool.cursorPath}edit.svg) 1 1, crosshair`
        Tool.selection.modified.add(() => {
            this.updateSelection(editor)
        }, this)
        Tool.selection.modified.emit()
    }

    override deactivate(editor: ShapeEditor) {
        editor.svg.style.cursor = "default"
        this.removeEditors(editor)
        Tool.selection.modified.remove(this)
        this.removeDecoration(editor)
        this.removeOutlines(editor)
    }

    override pointerEvent(event: EditorPointerEvent): void {
        for (let i = 0; i < this.editors.length; ++i) {
            if (this.editors[i].pointerEvent(event)) {
                return
            }
        }

        switch (this.state) {
            case EditToolState.NONE:
                switch (event.type) {
                    case "down": {
                        let shape = event.editor.selectedLayer!.findShapeAt(event)
                        if (shape === undefined) {
                            if (!event.shiftKey) {
                                Tool.selection.clear()
                            }
                            // this.state = ArrangeToolState.DRAG_MARQUEE
                            return
                        }

                        if (Tool.selection.has(shape)) {
                            if (event.shiftKey) {
                                Tool.selection.remove(shape)
                            }
                            return
                        }

                        if (event.shiftKey) {
                            Tool.selection.add(shape)
                        } else {
                            Tool.selection.set(shape)
                        }
                    } break
                }break
        }
    }

    override keyEvent(event: EditorKeyboardEvent): void {
        for (let i = 0; i < this.editors.length; ++i) {
            if (this.editors[i].keyEvent(event)) {
                return
            }
        }
    }

    editors: EditToolEditor[] = [];

    override zoomChanged(): void {
        this.editors.forEach(editor => {
            editor.zoomChanged()
        })
    }

    updateSelection(editor: ShapeEditor) {
        this.removeEditors(editor)
        this.addEditors(editor)
    }

    removeEditors(editor: ShapeEditor) {
        this.editors.forEach(editor => {
            editor.destructor()
        })
        this.editors.length = 0
    }

    addEditors(editor: ShapeEditor) {
        Tool.selection.selection.forEach(shape => {
            // TODO: move into shape.Path, etc. once this works
            if (shape instanceof Path) {
                this.editors.push(new PathEditor(editor, this, shape))
            }
        })
    }
}
