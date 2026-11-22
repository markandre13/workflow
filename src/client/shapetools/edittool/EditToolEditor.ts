import { EditorPointerEvent, EditorKeyboardEvent } from "client/shapeeditor"
import { Matrix } from "shared/geometry"
import { PointLike } from "shared/geometry/Point"
import { Tool } from "../Tool"

export abstract class EditToolEditor {
    shapeToScreen?: Matrix
    screenToShape?: Matrix

    abstract get handleSize(): number

    destructor(): void { }
    pointerEvent(event: EditorPointerEvent): boolean { return false }
    keyEvent(event: EditorKeyboardEvent): boolean { return false }
    zoomChanged(): void { }

    createAnchor(p: PointLike) {
        return Tool.createAnchor(this.shapeToScreen, p, this.handleSize)
    }

    updateAnchor(p: PointLike, svg: SVGRectElement) {
        return Tool.updateAnchor(this.shapeToScreen, p, svg, this.handleSize)
    }

    createHandle(p: PointLike) {
        return Tool.createHandle(this.shapeToScreen, p, this.handleSize)
    }

    updateHandle(p: PointLike, svg: SVGCircleElement) {
        return Tool.updateHandle(this.shapeToScreen, p, svg, this.handleSize)
    }

    createLine(p0: PointLike, p1: PointLike) {
        return Tool.createLine(this.shapeToScreen, p0, p1)
    }

    updateLine(p0: PointLike, p1: PointLike, svg: SVGLineElement) {
        return Tool.updateLine(this.shapeToScreen, p0, p1, svg)
    }
}
