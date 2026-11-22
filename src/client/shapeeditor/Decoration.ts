import type { ShapeEditor } from "./ShapeEditor"
import { Shape } from "../shapes/Shape"
import { Path } from "../paths/Path"
import { Rectangle } from "shared/geometry/Rectangle"
import { PointLike } from "shared/geometry/Point"
import { pointPlusPoint, pointMultiplyNumber, rotatePointAroundPointBy } from "shared/geometry"

const ns = "http://www.w3.org/2000/svg"
const COLOR = "rgb(79,128,255)"
const TRANSPARENT = "rgba(0,0,0,0)"

// keeps a stroke one screen pixel wide, whatever the zoom
export function nonScalingStroke(svg: Element) {
    svg.setAttributeNS("", "vector-effect", "non-scaling-stroke")
}

// the middle of a pixel, so that thin lines are sharp
function pixel(v: number): number {
    return Math.round(v - 0.5) + 0.5
}

// an element of the decoration, which keeps its geometry in canvas units and
// draws itself again when the zoom changes
abstract class Item<E extends SVGElement = SVGElement> {
    constructor(protected readonly decoration: Decoration, readonly element: E) {
        nonScalingStroke(element)
    }
    abstract draw(handleSize: number): void
    show() {
        this.element.style.display = ""
    }
    hide() {
        this.element.style.display = "none"
    }
    remove() {
        this.element.remove()
        this.decoration.forget(this)
    }
}

export class AnchorItem extends Item<SVGRectElement> {
    constructor(decoration: Decoration, element: SVGRectElement, public p: PointLike) {
        super(decoration, element)
    }
    move(p: PointLike) {
        this.p = p
        this.draw(this.decoration.handleSize)
    }
    draw(handleSize: number) {
        this.element.setAttributeNS("", "x", `${pixel(this.p.x - handleSize / 2)}`)
        this.element.setAttributeNS("", "y", `${pixel(this.p.y - handleSize / 2)}`)
        this.element.setAttributeNS("", "width", `${handleSize}`)
        this.element.setAttributeNS("", "height", `${handleSize}`)
    }
}

export class HandleItem extends Item<SVGCircleElement> {
    constructor(decoration: Decoration, element: SVGCircleElement, public p: PointLike) {
        super(decoration, element)
    }
    move(p: PointLike) {
        this.p = p
        this.draw(this.decoration.handleSize)
    }
    draw(handleSize: number) {
        this.element.setAttributeNS("", "cx", `${pixel(this.p.x)}`)
        this.element.setAttributeNS("", "cy", `${pixel(this.p.y)}`)
        this.element.setAttributeNS("", "r", `${handleSize / 2}`)
    }
}

export class LineItem extends Item<SVGLineElement> {
    constructor(decoration: Decoration, element: SVGLineElement, public p0: PointLike, public p1: PointLike) {
        super(decoration, element)
    }
    move(p0: PointLike, p1: PointLike) {
        this.p0 = p0
        this.p1 = p1
        this.draw()
    }
    draw() {
        this.element.setAttributeNS("", "x1", `${this.p0.x}`)
        this.element.setAttributeNS("", "y1", `${this.p0.y}`)
        this.element.setAttributeNS("", "x2", `${this.p1.x}`)
        this.element.setAttributeNS("", "y2", `${this.p1.y}`)
    }
}

// a square handle to scale the selection
export class ScaleItem extends Item<SVGPathElement> {
    constructor(decoration: Decoration, element: SVGPathElement, public center: PointLike) {
        super(decoration, element)
    }
    draw(handleSize: number) {
        const rectangle = new Rectangle(
            pixel(this.center.x - handleSize / 2),
            pixel(this.center.y - handleSize / 2),
            handleSize,
            handleSize
        )
        this.element.setAttributeNS("", "d", new Path().appendRect(rectangle).toString())
    }
}

// a transparent area to rotate the selection, next to a corner or edge handle
export class RotateItem extends Item<SVGPathElement> {
    constructor(
        decoration: Decoration,
        element: SVGPathElement,
        public center: PointLike,
        private readonly toCenter: PointLike,
        private readonly flipped: boolean,
        private readonly factor: number
    ) {
        super(decoration, element)
    }
    draw(handleSize: number) {
        const size = handleSize * this.factor
        const center = this.center
        const start0 = pointPlusPoint(center, pointMultiplyNumber(this.toCenter, -size * 2))
        const start = this.flipped ? rotatePointAroundPointBy(start0, center, -Math.PI / 4) : start0
        const path = new Path()
        path.move(center)
        for (let i = 0, r = Math.PI / 2; i <= 8; ++i, r += Math.PI / 16) {
            path.line(rotatePointAroundPointBy(start, center, r))
        }
        path.close()
        this.element.setAttributeNS("", "d", path.toString())
    }
}

// the frame around the selection, which does not depend on the zoom
export class FrameItem extends Item<SVGPathElement> {
    draw() {}
}

export class MarqueeItem extends Item<SVGRectElement> {
    constructor(decoration: Decoration, element: SVGRectElement, public rectangle: Rectangle) {
        super(decoration, element)
    }
    move(rectangle: Rectangle) {
        this.rectangle = rectangle
        this.draw()
    }
    draw() {
        this.element.setAttributeNS("", "x", `${Math.round(this.rectangle.origin.x) + 0.5}`)
        this.element.setAttributeNS("", "y", `${Math.round(this.rectangle.origin.y) + 0.5}`)
        this.element.setAttributeNS("", "width", `${Math.round(this.rectangle.size.width)}`)
        this.element.setAttributeNS("", "height", `${Math.round(this.rectangle.size.height)}`)
    }
}

/**
 * the anchors, handles, outlines and marquee shown on top of the shapes.
 * everything is kept in canvas units, and the sizes are recalculated from the
 * zoom of the editor, so the decoration looks the same at every zoom.
 */
export class Decoration {
    private readonly items = new Set<Item>()

    constructor(private readonly editor: ShapeEditor) {}

    // the size of anchors and handles in canvas units
    get handleSize(): number {
        return Shape.HANDLE_RANGE / this.editor.zoom
    }

    anchor(p: PointLike): AnchorItem {
        const svg = document.createElementNS(ns, "rect") as SVGRectElement
        svg.setAttributeNS("", "stroke", COLOR)
        svg.setAttributeNS("", "fill", "#fff")
        return this.add(this.editor.decoration, new AnchorItem(this, svg, p))
    }

    handle(p: PointLike): HandleItem {
        const svg = document.createElementNS(ns, "circle") as SVGCircleElement
        svg.setAttributeNS("", "stroke", COLOR)
        svg.setAttributeNS("", "fill", COLOR)
        return this.add(this.editor.decoration, new HandleItem(this, svg, p))
    }

    line(p0: PointLike, p1: PointLike): LineItem {
        const svg = document.createElementNS(ns, "line") as SVGLineElement
        svg.setAttributeNS("", "stroke", COLOR)
        return this.add(this.editor.outline, new LineItem(this, svg, p0, p1))
    }

    scaleHandle(center: PointLike): ScaleItem {
        const svg = new Path().createSVG(COLOR, 1, "#fff")
        return this.add(this.editor.decoration, new ScaleItem(this, svg, center))
    }

    rotateHandle(center: PointLike, toCenter: PointLike, flipped: boolean, factor: number): RotateItem {
        const svg = new Path().createSVG(TRANSPARENT, 1, TRANSPARENT)
        return this.add(this.editor.decoration, new RotateItem(this, svg, center, toCenter, flipped, factor))
    }

    frame(path: Path): FrameItem {
        return this.add(this.editor.outline, new FrameItem(this, path.createSVG(COLOR)))
    }

    marquee(rectangle: Rectangle): MarqueeItem {
        const svg = document.createElementNS(ns, "rect") as SVGRectElement
        svg.setAttributeNS("", "stroke", COLOR)
        svg.setAttributeNS("", "fill", "rgba(79,128,255,0.2)")
        return this.add(this.editor.decoration, new MarqueeItem(this, svg, rectangle))
    }

    // draws all items again, after the zoom changed
    refresh() {
        this.items.forEach(item => item.draw(this.handleSize))
    }

    clear() {
        this.items.forEach(item => item.element.remove())
        this.items.clear()
        this.editor.decoration.replaceChildren()
    }

    forget(item: Item) {
        this.items.delete(item)
    }

    private add<T extends Item>(parent: Element, item: T): T {
        parent.appendChild(item.element)
        this.items.add(item)
        item.draw(this.handleSize)
        return item
    }
}
