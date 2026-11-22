import { Path } from "client/shapes/Path"
import { mirrorPoint, pointPlusPoint, pointMinusPoint, distancePointToPoint, pointMultiplyNumber } from "shared/geometry"
import { PointLike } from "shared/geometry/Point"
import { shape } from "shared/workflow"
import { Tool } from "../Tool"
import { AnchorItem, HandleItem, LineItem } from "client/shapeeditor/Decoration"
import { AnchorElement } from "./AnchorElement"
import { EditTool } from "./EditTool"
import { PathEditor } from "./PathEditor"

export const AnchorType = shape.AnchorType

/** 
 * Anchor wraps the somewhat tedious data structure of shape.Path's anchors
 * modifications will happen on 'outline' and are then copied to 'shape' by
 * calling apply()
 */
export class Anchor {
    tool: EditTool
    editor: PathEditor
    shape: Path
    outline: Path

    _selected: boolean
    anchorElement!: AnchorElement

    // pointers into shape/outlines types and values array
    idxType: number
    idxValue: number

    // decoration managed by this class
    private anchorItem: AnchorItem
    private backwardLine?: LineItem
    private backwardHandleItem?: HandleItem
    private forwardLine?: LineItem
    private forwardHandleItem?: HandleItem

    constructor(tool: EditTool, editor: PathEditor, shape: Path, outline: Path, idxType: number, idxValue: number) {
        this.tool = tool
        this.editor = editor
        this.shape = shape
        this.outline = outline
        this._selected = false
        this.idxType = idxType
        this.idxValue = idxValue

        // HOW TO DO THIS:
        // o each EditToolEditor (PathEditor) manages one shape hence
        // o each EditToolEditor is going to maintain two matrices, one
        //   for screen2shape, one for shape2screen. in case the shape
        //   is part of a group/groups, those are included
        // o now we just need a nice API to handle this
        // o add group/ungroup to be able to write a complete test!
        //   (also, edit usually goes inside the group)
        this.anchorItem = editor.createAnchor(this.pos)
        this.anchorItem.element.style.cursor = `url(${Tool.cursorPath}edit-anchor.svg) 1 1, crosshair`
        this.anchorItem.element.onpointerenter = () => {
            editor.insideAnchor = this
            this.anchorElement = AnchorElement.ANCHOR
        }
        this.anchorItem.element.onpointerleave = () => {
            editor.insideAnchor = undefined
            this.anchorElement = AnchorElement.ANCHOR
        }
    }

    destructor() {
        this.anchorItem.remove()
        this.hideBackwardHandle()
        this.hideForwardHandle()
    }

    get selected(): boolean {
        return this._selected
    }

    set selected(selected: boolean) {
        this._selected = selected
        if (this._selected) {
            this.anchorItem.element.setAttributeNS("", "fill", "rgb(79,128,255)")
        } else {
            this.anchorItem.element.setAttributeNS("", "fill", "#fff")
        }
    }

    setHandles(backwardHandle: boolean, forwardHandle: boolean) {
        backwardHandle ? this.showBackwardHandle() : this.hideBackwardHandle()
        forwardHandle ? this.showForwardHandle() : this.hideForwardHandle()
    }

    updateHandles() {
        if (this.backwardHandleItem) {
            this.showBackwardHandle()
        }
        if (this.forwardHandleItem) {
            this.showForwardHandle()
        }
    }

    showBackwardHandle() {
        switch (this.outline.types[this.idxType]) {
            case AnchorType.ANCHOR_EDGE:
            case AnchorType.ANCHOR_EDGE_ANGLE:
            case AnchorType.CLOSE:
                this.hideBackwardHandle()
                return
            case AnchorType.ANCHOR_ANGLE_EDGE:
            case AnchorType.ANCHOR_SYMMETRIC:
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
            case AnchorType.ANCHOR_ANGLE_ANGLE:
                const pos = { x: this.outline.values[this.idxValue], y: this.outline.values[this.idxValue + 1] }
                if (this.backwardHandleItem) {
                    this.editor.moveLine(this.backwardLine!, this.pos, pos)
                    this.editor.moveHandle(this.backwardHandleItem, pos)
                } else {
                    this.backwardLine = this.editor.createLine(this.pos, pos)
                    this.backwardHandleItem = this.editor.createHandle(pos)
                    this.backwardHandleItem.element.onpointerenter = () => {
                        this.editor.insideAnchor = this
                        this.anchorElement = AnchorElement.BACKWARD_HANDLE
                    }
                    this.backwardHandleItem.element.onpointerleave = () => {
                        this.editor.insideAnchor = undefined
                        this.anchorElement = AnchorElement.BACKWARD_HANDLE
                    }
                    this.backwardHandleItem.element.style.cursor = `url(${Tool.cursorPath}edit-handle.svg) 1 1, crosshair`
                }
        }
    }

    hideBackwardHandle() {
        if (this.backwardHandleItem) {
            this.backwardLine!.remove()
            this.backwardHandleItem.remove()
            this.backwardHandleItem = undefined
            this.backwardLine = undefined
        }
    }

    showForwardHandle() {
        let anchor, pos
        switch (this.outline.types[this.idxType]) {
            case AnchorType.ANCHOR_EDGE:
            case AnchorType.ANCHOR_ANGLE_EDGE:
            case AnchorType.CLOSE:
                this.hideForwardHandle()
                return
            case AnchorType.ANCHOR_EDGE_ANGLE:
                anchor = { x: this.outline.values[this.idxValue], y: this.outline.values[this.idxValue + 1] }
                pos = { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
                break
            case AnchorType.ANCHOR_SYMMETRIC:
                const backwardHandle = { x: this.outline.values[this.idxValue], y: this.outline.values[this.idxValue + 1] }
                anchor = { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
                pos = mirrorPoint(anchor, backwardHandle)
                break
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
            case AnchorType.ANCHOR_ANGLE_ANGLE:
                anchor = { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
                pos = { x: this.outline.values[this.idxValue + 4], y: this.outline.values[this.idxValue + 5] }
        }

        if (this.forwardHandleItem) {
            this.editor.moveLine(this.forwardLine!, anchor, pos)
            this.editor.moveHandle(this.forwardHandleItem, pos)
        } else {
            this.forwardLine = this.editor.createLine(anchor, pos)
            this.forwardHandleItem = this.editor.createHandle(pos)
            this.forwardHandleItem.element.onpointerenter = () => {
                this.editor.insideAnchor = this
                this.anchorElement = AnchorElement.FORWARD_HANDLE
            }
            this.forwardHandleItem.element.onpointerleave = () => {
                this.editor.insideAnchor = undefined
                this.anchorElement = AnchorElement.FORWARD_HANDLE
            }
            this.forwardHandleItem.element.style.cursor = `url(${Tool.cursorPath}edit-handle.svg) 1 1, crosshair`
        }
    }

    hideForwardHandle() {
        if (this.forwardHandleItem) {
            this.forwardLine!.remove()
            this.forwardHandleItem.remove()
            this.forwardHandleItem = undefined
            this.forwardLine = undefined
        }
    }

    get length(): number {
        return this.lengthOfType(this.shape.types[this.idxType])
    }

    public lengthOfType(type: shape.AnchorType) {
        switch (type) {
            case AnchorType.ANCHOR_EDGE:
                return 2
            case AnchorType.ANCHOR_EDGE_ANGLE:
            case AnchorType.ANCHOR_ANGLE_EDGE:
            case AnchorType.ANCHOR_SYMMETRIC:
                return 4
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
            case AnchorType.ANCHOR_ANGLE_ANGLE:
                return 6
            case AnchorType.CLOSE:
                return 0
        }
    }

    get pos(): PointLike {
        switch (this.outline.types[this.idxType]) {
            case AnchorType.ANCHOR_EDGE:
            case AnchorType.ANCHOR_EDGE_ANGLE:
                return { x: this.outline.values[this.idxValue], y: this.outline.values[this.idxValue + 1] }
            case AnchorType.ANCHOR_ANGLE_EDGE:
            case AnchorType.ANCHOR_SYMMETRIC:
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
            case AnchorType.ANCHOR_ANGLE_ANGLE:
                return { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
            case AnchorType.CLOSE:
                throw Error(`anchor type CLOSE has no position to get`)
        }
    }

    moveTo(point: PointLike) {
        switch (this.anchorElement) {
            case AnchorElement.ANCHOR:
                this.pos = point
                break
            case AnchorElement.BACKWARD_HANDLE:
                this.backwardHandle = point
                break
            case AnchorElement.FORWARD_HANDLE:
                this.forwardHandle = point
                break
        }
    }

    set pos(point: PointLike) {
        switch (this.outline.types[this.idxType]) {
            case AnchorType.ANCHOR_EDGE: {
                this.outline.values[this.idxValue] = point.x
                this.outline.values[this.idxValue + 1] = point.y
            } break
            case AnchorType.ANCHOR_EDGE_ANGLE: {
                const anchor = { x: this.outline.values[this.idxValue], y: this.outline.values[this.idxValue + 1] }
                let backwardHandle = { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
                backwardHandle = pointPlusPoint(point, pointMinusPoint(backwardHandle, anchor))
                this.outline.values[this.idxValue] = point.x
                this.outline.values[this.idxValue + 1] = point.y
                this.outline.values[this.idxValue + 2] = backwardHandle.x
                this.outline.values[this.idxValue + 3] = backwardHandle.y
            } break
            case AnchorType.ANCHOR_ANGLE_EDGE:
            case AnchorType.ANCHOR_SYMMETRIC: {
                let forwardHandle = { x: this.outline.values[this.idxValue], y: this.outline.values[this.idxValue + 1] }
                const anchor = { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
                forwardHandle = pointPlusPoint(point, pointMinusPoint(forwardHandle, anchor))
                this.outline.values[this.idxValue] = forwardHandle.x
                this.outline.values[this.idxValue + 1] = forwardHandle.y
                this.outline.values[this.idxValue + 2] = point.x
                this.outline.values[this.idxValue + 3] = point.y
            } break
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE:
            case AnchorType.ANCHOR_ANGLE_ANGLE: {
                let forwardHandle = { x: this.outline.values[this.idxValue], y: this.outline.values[this.idxValue + 1] }
                const anchor = { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
                let backwardHandle = { x: this.outline.values[this.idxValue + 4], y: this.outline.values[this.idxValue + 5] }
                backwardHandle = pointPlusPoint(point, pointMinusPoint(backwardHandle, anchor))
                forwardHandle = pointPlusPoint(point, pointMinusPoint(forwardHandle, anchor))
                this.outline.values[this.idxValue] = forwardHandle.x
                this.outline.values[this.idxValue + 1] = forwardHandle.y
                this.outline.values[this.idxValue + 2] = point.x
                this.outline.values[this.idxValue + 3] = point.y
                this.outline.values[this.idxValue + 4] = backwardHandle.x
                this.outline.values[this.idxValue + 5] = backwardHandle.y
            } break
            case AnchorType.CLOSE:
                throw Error(`anchor type CLOSE has no position to set`)
        }

        this.editor.moveAnchor(this.anchorItem, point)
        this.updateHandles()

        const path = this.outline.getPath()
        if (this.shape.matrix)
            path.transform(this.shape.matrix)
        path.updateSVG(this.editor.editor.outline, this.editor.outlineSVG)
    }

    set backwardHandle(point: PointLike) {
        switch (this.outline.types[this.idxType]) {
            case AnchorType.ANCHOR_EDGE:
                throw Error("anchor type EDGE has no backward handle to set")
            case AnchorType.ANCHOR_EDGE_ANGLE:
                throw Error("anchor type EDGE_ANGLE has no backward handle to set")
            case AnchorType.CLOSE:
                throw Error(`anchor type CLOSE has no backward handle to set`)
            case AnchorType.ANCHOR_ANGLE_EDGE:
            case AnchorType.ANCHOR_SYMMETRIC:
            case AnchorType.ANCHOR_ANGLE_ANGLE: {
                this.outline.values[this.idxValue] = point.x
                this.outline.values[this.idxValue + 1] = point.y
            } break
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE: {
                const backwardHandle = point
                const anchor = { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
                let forwardHandle = { x: this.outline.values[this.idxValue + 4], y: this.outline.values[this.idxValue + 5] }
                const back = distancePointToPoint(anchor, backwardHandle)
                const forward = distancePointToPoint(anchor, forwardHandle)
                const d = pointMultiplyNumber(pointMinusPoint(backwardHandle, anchor), forward / back)
                forwardHandle = pointMinusPoint(anchor, d)
                this.outline.values[this.idxValue] = backwardHandle.x
                this.outline.values[this.idxValue + 1] = backwardHandle.y
                this.outline.values[this.idxValue + 4] = forwardHandle.x
                this.outline.values[this.idxValue + 5] = forwardHandle.y
            } break
        }

        this.updateHandles()
        const path = this.outline.getPath()
        if (this.shape.matrix) {
            path.transform(this.shape.matrix)
        }
        path.updateSVG(this.editor.editor.outline, this.editor.outlineSVG)
    }

    set forwardHandle(point: PointLike) {
        switch (this.outline.types[this.idxType]) {
            case AnchorType.ANCHOR_EDGE:
                throw Error("anchor type EDGE has no forward handle to set")
            case AnchorType.ANCHOR_ANGLE_EDGE:
                throw Error("anchor type ANGLE_EDGE has no forward handle to set")
            case AnchorType.CLOSE:
                throw Error(`anchor type CLOSE has no forward handle to set`)
            case AnchorType.ANCHOR_EDGE_ANGLE: {
                this.outline.values[this.idxValue + 2] = point.x
                this.outline.values[this.idxValue + 3] = point.y
            } break
            case AnchorType.ANCHOR_SYMMETRIC: {
                const anchor = { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
                const forwardHandle = point
                const backwardHandle = mirrorPoint(anchor, forwardHandle)
                this.outline.values[this.idxValue] = backwardHandle.x
                this.outline.values[this.idxValue + 1] = backwardHandle.y
            } break
            case AnchorType.ANCHOR_ANGLE_ANGLE: {
                this.outline.values[this.idxValue + 4] = point.x
                this.outline.values[this.idxValue + 5] = point.y
            } break
            case AnchorType.ANCHOR_SMOOTH_ANGLE_ANGLE: {
                let backwardHandle = { x: this.outline.values[this.idxValue], y: this.outline.values[this.idxValue + 1] }
                const anchor = { x: this.outline.values[this.idxValue + 2], y: this.outline.values[this.idxValue + 3] }
                let forwardHandle = point
                const back = distancePointToPoint(anchor, backwardHandle)
                const forward = distancePointToPoint(anchor, forwardHandle)
                const d = pointMultiplyNumber(pointMinusPoint(forwardHandle, anchor), back / forward)
                backwardHandle = pointMinusPoint(anchor, d)
                this.outline.values[this.idxValue] = backwardHandle.x
                this.outline.values[this.idxValue + 1] = backwardHandle.y
                this.outline.values[this.idxValue + 4] = forwardHandle.x
                this.outline.values[this.idxValue + 5] = forwardHandle.y
            } break
        }

        this.updateHandles()
        const path = this.outline.getPath()
        if (this.shape.matrix)
            path.transform(this.shape.matrix)
        path.updateSVG(this.editor.editor.outline, this.editor.outlineSVG)
    }

    apply() {
        this.copyAnchorFromTo(this.outline, this.shape)
    }

    revert() {
        this.copyAnchorFromTo(this.shape, this.outline)
    }

    protected copyAnchorFromTo(source: Path, destination: Path) {
        const oldLength = this.lengthOfType(destination.types[this.idxType])
        const newLength = this.lengthOfType(source.types[this.idxType])
        if (oldLength !== newLength) {
            if (oldLength < newLength) {
                destination.values.splice(this.idxValue, 0, ...new Array(newLength - oldLength).fill(0))
            } else {
                destination.values.splice(this.idxValue, oldLength - newLength)
            }
        }
        const end = this.idxValue + newLength
        for (let i = this.idxValue; i < end; ++i) {
            destination.values[i] = source.values[i]
        }
        destination.types[this.idxType] = source.types[this.idxType]
    }
}
