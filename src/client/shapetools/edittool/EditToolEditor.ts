import { EditorPointerEvent, EditorKeyboardEvent } from "client/shapeeditor"
import { Matrix } from "shared/geometry"
import { PointLike } from "shared/geometry/Point"
import { Tool } from "../Tool"

export abstract class EditToolEditor {
    shapeToScreen?: Matrix
    screenToShape?: Matrix

    destructor(): void { }
    pointerEvent(event: EditorPointerEvent): boolean { return false }
    keyEvent(event: EditorKeyboardEvent): boolean { return false }

    createAnchor(p: PointLike) {
        return Tool.createAnchor(this.shapeToScreen, p)
    }

    updateAnchor(p: PointLike, svg: SVGRectElement) {
        return Tool.updateAnchor(this.shapeToScreen, p, svg)
    }

    createHandle(p: PointLike) {
        return Tool.createHandle(this.shapeToScreen, p)
    }

    updateHandle(p: PointLike, svg: SVGCircleElement) {
        return Tool.updateHandle(this.shapeToScreen, p, svg)
    }

    createLine(p0: PointLike, p1: PointLike) {
        return Tool.createLine(this.shapeToScreen, p0, p1)
    }

    updateLine(p0: PointLike, p1: PointLike, svg: SVGLineElement) {
        return Tool.updateLine(this.shapeToScreen, p0, p1, svg)
    }
}
