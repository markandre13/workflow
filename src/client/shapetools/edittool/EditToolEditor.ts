import { EditorPointerEvent, EditorKeyboardEvent } from "client/shapeeditor"
import { AnchorItem, Decoration, HandleItem, LineItem } from "client/shapeeditor/Decoration"
import { Matrix } from "shared/geometry"
import { PointLike } from "shared/geometry/Point"

export abstract class EditToolEditor {
    shapeToScreen?: Matrix
    screenToShape?: Matrix

    abstract get decorations(): Decoration

    destructor(): void { }
    pointerEvent(event: EditorPointerEvent): boolean { return false }
    keyEvent(event: EditorKeyboardEvent): boolean { return false }

    protected toScreen(p: PointLike): PointLike {
        return this.shapeToScreen ? this.shapeToScreen.transformPoint(p) : p
    }

    createAnchor(p: PointLike): AnchorItem {
        return this.decorations.anchor(this.toScreen(p))
    }

    moveAnchor(anchor: AnchorItem, p: PointLike) {
        anchor.move(this.toScreen(p))
    }

    createHandle(p: PointLike): HandleItem {
        return this.decorations.handle(this.toScreen(p))
    }

    moveHandle(handle: HandleItem, p: PointLike) {
        handle.move(this.toScreen(p))
    }

    createLine(p0: PointLike, p1: PointLike): LineItem {
        return this.decorations.line(this.toScreen(p0), this.toScreen(p1))
    }

    moveLine(line: LineItem, p0: PointLike, p1: PointLike) {
        line.move(this.toScreen(p0), this.toScreen(p1))
    }
}
