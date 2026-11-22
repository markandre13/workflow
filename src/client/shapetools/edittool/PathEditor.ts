import { ShapeEditor, EditorPointerEvent, Operation, EditorKeyboardEvent } from "client/shapeeditor"
import { Path } from "client/shapes/Path"
import { Matrix, mirrorPoint } from "shared/geometry"
import { Tool } from "../Tool"
import { Anchor } from "./Anchor"
import { AnchorElement } from "./AnchorElement"
import { AnchorType } from "./Anchor"
import { EditTool } from "./EditTool"
import { EditToolEditor } from "./EditToolEditor"

export class PathEditor extends EditToolEditor {
    anchors: Anchor[] = [];
    currentAnchor?: Anchor
    insideAnchor?: Anchor
    path: Path
    outline: Path
    editor: ShapeEditor
    tool: EditTool

    outlineSVG: SVGPathElement

    constructor(editor: ShapeEditor, tool: EditTool, path: Path) {
        super()
        this.path = path
        this.editor = editor
        this.tool = tool

        if (path.matrix) {
            this.shapeToScreen = path.matrix
            this.screenToShape = new Matrix(path.matrix).invert()
        }

        // create outline
        const outline = path.clone()
        this.outline = outline
        const outlinePath = outline.getPath()
        if (path.matrix !== undefined)
            outlinePath.transform(path.matrix)
        this.outlineSVG = outlinePath.createSVG()
        this.tool.setOutlineColors(this.outlineSVG)
        this.editor.outline.appendChild(this.outlineSVG)

        // create anchors
        this.createAnchors()
    }

    override get handleSize(): number {
        return this.editor.handleSize
    }

    override zoomChanged(): void {
        this.anchors.forEach(anchor => {
            anchor.zoomChanged()
        })
    }

    override destructor(): void {
        this.anchors.forEach(anchor => {
            anchor.destructor()
        })
        this.anchors.length = 0
        this.editor.outline.removeChild(this.outlineSVG)
    }

    // TODO: this is copied from shape.Path.getPath(), which is covered by tests
    // plan is to create a function which is suitable for both use cases...
    // hm... changes become too many, might want to have a complete new set of tests
    override pointerEvent(event: EditorPointerEvent): boolean {
        if (this.screenToShape) {
            let newEvent = Object.assign({}, event)
            const pos = this.screenToShape.transformPoint(event)
            newEvent.x = pos.x
            newEvent.y = pos.y
            event = newEvent
        }

        if (event.type === "down" && this.insideAnchor) {
            this.currentAnchor = this.insideAnchor
            if (event.altKey) {
                switch (this.currentAnchor.anchorElement) {
                    case AnchorElement.ANCHOR:
                        this.removeBothHandles(this.currentAnchor)
                        break
                    case AnchorElement.BACKWARD_HANDLE:
                        this.removeBackwardHandle(this.currentAnchor)
                        break
                    case AnchorElement.FORWARD_HANDLE:
                        this.removeForwardHandle(this.currentAnchor)
                        break
                }
                return true
            }

            event.editor.style.cursor = `url(${Tool.cursorPath}edit-cursor.svg) 1 1, crosshair`
            this.selectAnchor(event)
            this.updateHandles()

            return true
        }
        if (this.currentAnchor !== undefined) {
            switch (event.type) {
                case "move":
                    this.currentAnchor.moveTo(event)
                    break
                case "up":
                    this.currentAnchor.apply()
                    event.editor.model!.signal.emit({
                        operation: Operation.UPDATE_SHAPES,
                        shapes: [this.currentAnchor!.shape]
                    })
                    this.currentAnchor = undefined
                    this.updateHandles()
                    break
            }
            return true
        }
        return false
    }

    override keyEvent(event: EditorKeyboardEvent): boolean {
        if (!this.currentAnchor) // only set when mouse is pressed
            return false
        switch (event.type) {
            case "down":
                if (event.value === "Alt") {
                    this.changeToAngleAngle(this.currentAnchor)
                }
                break
            case "up":
                if (event.value === "Alt") {
                    this.revert(this.currentAnchor)
                    this.currentAnchor.moveTo(event.editor.pointerNowAt!)
                }
                break
        }
        return true
    }

    private selectAnchor(event: EditorPointerEvent) {
        if (!this.insideAnchor || !this.currentAnchor) {
            throw Error("yikes")
        }
        if (this.insideAnchor.anchorElement === AnchorElement.ANCHOR) {
            if (event.shiftKey) {
                this.currentAnchor.selected = !this.currentAnchor.selected
            } else {
                this.anchors.forEach(anchor => anchor.selected = false)
                this.currentAnchor.selected = true
            }
        }
    }

    private updateHandles() {
        // show/hide handles
        for (let i = 0; i < this.anchors.length; ++i) {
            let backwardHandle = false
            let forwardHandle = false
            if (this.anchors[i] === this.currentAnchor) {
                backwardHandle = true
                forwardHandle = true
            } else if (this.anchors[i].selected) {
                if (i > 0) {
                    backwardHandle = true
                }
                if (i < this.anchors.length - 1) {
                    forwardHandle = true
                }
            } else {
                if (i > 0 && this.anchors[i - 1].selected) {
                    backwardHandle = true
                }
                if (i + 1 < this.anchors.length && this.anchors[i + 1].selected) {
                    forwardHandle = true
                }
            }
            this.anchors[i].setHandles(backwardHandle, forwardHandle)
        }
    }

    // TODO: add unit test
    changeToAngleAngle(anchor: Anchor) {
        switch (this.outline.types[anchor.idxType]) {
            case AnchorType.ANCHOR_SYMMETRIC: {
                this.outline.types[anchor.idxType] = AnchorType.ANCHOR_ANGLE_ANGLE
                const h0 = { x: this.outline.values[anchor.idxValue], y: this.outline.values[anchor.idxValue + 1] }
                const a = { x: this.outline.values[anchor.idxValue + 2], y: this.outline.values[anchor.idxValue + 3] }
                const h1 = mirrorPoint(a, h0)
                this.outline.values.splice(anchor.idxValue + 4, 0, h1.x, h1.y)
                this.updateAnchors()
            } break
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE: {
                this.outline.types[anchor.idxType] = AnchorType.ANCHOR_ANGLE_ANGLE
            } break
            default:
                throw Error("yikes")
        }
    }

    // TODO: add unit test!
    removeBackwardHandle(anchor: Anchor) {
        switch (this.outline.types[anchor.idxType]) {
            case AnchorType.ANCHOR_ANGLE_EDGE:
                this.outline.types[anchor.idxType] = AnchorType.ANCHOR_EDGE
                this.outline.values.splice(anchor.idxValue, 2)
                break
            case AnchorType.ANCHOR_SYMMETRIC: {
                this.outline.types[anchor.idxType] = AnchorType.ANCHOR_EDGE_ANGLE
                const h0 = { x: this.outline.values[anchor.idxValue], y: this.outline.values[anchor.idxValue + 1] }
                const a = { x: this.outline.values[anchor.idxValue + 2], y: this.outline.values[anchor.idxValue + 3] }
                const h1 = mirrorPoint(a, h0)
                this.outline.values[anchor.idxValue] = a.x
                this.outline.values[anchor.idxValue + 1] = a.y
                this.outline.values[anchor.idxValue + 2] = h1.x
                this.outline.values[anchor.idxValue + 3] = h1.y
            } break
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
            case AnchorType.ANCHOR_ANGLE_ANGLE:
                this.outline.types[anchor.idxType] = AnchorType.ANCHOR_EDGE_ANGLE
                this.outline.values.splice(anchor.idxValue, 2)
                break
        }
        const path = this.outline.getPath()
        if (this.path.matrix)
            path.transform(this.path.matrix)
        path.updateSVG(this.editor.outline, this.outlineSVG)

        this.currentAnchor!.apply()
        this.updateAnchors()
    }

    // TODO: add unit test!
    removeForwardHandle(anchor: Anchor) {
        switch (this.outline.types[anchor.idxType]) {
            case AnchorType.ANCHOR_EDGE_ANGLE:
                this.outline.types[anchor.idxType] = AnchorType.ANCHOR_EDGE
                this.outline.values.splice(anchor.idxValue + 2, 2)
                break
            case AnchorType.ANCHOR_SYMMETRIC:
                this.outline.types[anchor.idxType] = AnchorType.ANCHOR_ANGLE_EDGE
                break
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
            case AnchorType.ANCHOR_ANGLE_ANGLE:
                this.outline.types[anchor.idxType] = AnchorType.ANCHOR_ANGLE_EDGE
                this.outline.values.splice(anchor.idxValue + 4, 2)
                break
        }
        const path = this.outline.getPath()
        if (this.path.matrix)
            path.transform(this.path.matrix)
        path.updateSVG(this.editor.outline, this.outlineSVG)

        this.currentAnchor!.apply()
        this.updateAnchors()
    }

    // TODO: add unit test!
    removeBothHandles(anchor: Anchor) {
        switch (this.outline.types[anchor.idxType]) {
            case AnchorType.ANCHOR_EDGE_ANGLE:
                this.outline.values.splice(anchor.idxValue + 2, 2)
                break
            case AnchorType.ANCHOR_ANGLE_EDGE:
            case AnchorType.ANCHOR_SYMMETRIC:
                this.outline.values.splice(anchor.idxValue, 2)
                break
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
            case AnchorType.ANCHOR_ANGLE_ANGLE:
                this.outline.values[anchor.idxValue] = this.outline.values[anchor.idxValue + 2]
                this.outline.values[anchor.idxValue + 1] = this.outline.values[anchor.idxValue + 3]
                this.outline.values.splice(anchor.idxValue + 2, 4)
                break
        }
        this.outline.types[anchor.idxType] = AnchorType.ANCHOR_EDGE
        const path = this.outline.getPath()
        if (this.path.matrix)
            path.transform(this.path.matrix)
        path.updateSVG(this.editor.outline, this.outlineSVG)

        this.currentAnchor!.apply()
        this.updateAnchors()
    }

    revert(anchor: Anchor) {
        anchor.revert()
        this.updateAnchors()
    }

    protected createAnchors() {
        let idxValue = 0
        for (let idxType = 0; idxType < this.path.types.length; ++idxType) {
            if (this.path.types[idxType] !== AnchorType.CLOSE) {
                const anchor = new Anchor(this.tool, this, this.path, this.outline, idxType, idxValue)
                idxValue += anchor.length
                this.anchors.push(anchor)
            }
        }
    }

    protected updateAnchors() {
        let idxAnchor = 0, idxValue = 0
        for (let idxType = 0; idxType < this.outline.types.length; ++idxType) {
            const type = this.outline.types[idxType]
            if (type !== AnchorType.CLOSE) {
                const anchor = this.anchors[idxAnchor++]
                const length = anchor.lengthOfType(type)
                anchor.idxValue = idxValue
                idxValue += length
            }
        }
    }
}
