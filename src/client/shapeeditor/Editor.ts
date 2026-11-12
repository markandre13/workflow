import { DrawingModel } from "client/shapeeditor"
import { Point } from "shared/geometry"
import { PointLike } from "shared/geometry/Point"
import { Rectangle } from "shared/geometry/Rectangle"
import { Shape } from "shared/workflow_valuetype"
import { ModelView } from "toad.js/viewkit/ModelView"
import { HTMLElementProps } from "toad.jsx"
import { style } from "./ShapeEditor"

export class Editor extends ModelView<DrawingModel> {
    svg: SVGSVGElement
    private shapes: Shape[] = [];

    selected: Shape | undefined = undefined;
    private readonly pointerLastAt = new Point();

    event2Pos(ev: PointerEvent) {
        const pt = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(this.svg.getScreenCTM()!.inverse())
        return { x: pt.x, y: pt.y }
    }

    constructor(props?: HTMLElementProps) {
        super(props)
        const shadow = this.attachShadow({ mode: "open" })
        shadow.appendChild(document.importNode(style, true))

        const ns = "http://www.w3.org/2000/svg"
        this.svg = document.createElementNS(ns, "svg")
        this.svg.classList.add("svg")

        shadow.appendChild(this.svg)

        this.onscroll = () => {
            // while a scrollbar is held, the scroll is applied on release instead
            if (this.scrollbarHeld) {
                return
            }
            this.scrolled()
        }
        // this.onpointerdown = (ev: PointerEvent) => {
        //     ev.preventDefault()
        //     if (this.isOnScrollbar(ev)) {
        //         this.scrollbarHeld = true
        //         return
        //     }
        //     const pos = this.event2Pos(ev)
        //     this.selected = this.shapeAt(pos)
        //     if (this.selected) {
        //         this.setPointerCapture(ev.pointerId)
        //         this.pointerLastAt.set(pos)
        //     }
        // }
        // this.onpointermove = (ev: PointerEvent) => {
        //     ev.preventDefault()
        //     if (this.selected) {
        //         const pos = this.event2Pos(ev)
        //         this.selected.translate({ x: pos.x - this.pointerLastAt.x, y: pos.y - this.pointerLastAt.y })
        //         this.pointerLastAt.set(pos)
        //         this.selected.updateSVG()
        //         this.invalidate()
        //     }
        // }
        // this.onpointerup = (ev: PointerEvent) => {
        //     ev.preventDefault()
        //     if (this.selected) {
        //         this.selected = undefined
        //     }
        // }
    }

    private scrollbarHeld = false;

    // releasing the button ends a scrollbar drag, even when the release happens outside the editor
    private readonly onwindowrelease = () => this.releaseScrollbar();

    override connectedCallback() {
        window.addEventListener("pointerup", this.onwindowrelease)
        window.addEventListener("pointercancel", this.onwindowrelease)
    }

    override disconnectedCallback() {
        window.removeEventListener("pointerup", this.onwindowrelease)
        window.removeEventListener("pointercancel", this.onwindowrelease)
    }

    // the editor is the scroll container, so a press in the scrollbar area is outside the client area
    private isOnScrollbar(ev: PointerEvent): boolean {
        const rect = this.getBoundingClientRect()
        return ev.clientX - rect.left >= this.clientLeft + this.clientWidth ||
            ev.clientY - rect.top >= this.clientTop + this.clientHeight
    }

    private releaseScrollbar() {
        if (!this.scrollbarHeld) {
            return
        }
        this.scrollbarHeld = false
        this.scrolled()
    }

    // update for a scroll that the user caused; scroll events caused by update() itself do not move the position
    private scrolled() {
        const delta = { x: this.scrollLeft - this.scrolledAt.x, y: this.scrollTop - this.scrolledAt.y }
        if (delta.x === 0 && delta.y === 0) {
            return
        }
        this.scrollDelta = { x: delta.x / this._zoom, y: delta.y / this._zoom }
        this.update()
    }

    // add(shape: Shape) {
    //     this.shapes.push(shape)
    //     this.svg.appendChild(shape.updateSVG())
    //     this.invalidate()
    // }
    bbox(): Rectangle | undefined {
        let result: Rectangle | undefined
        for (const shape of this.shapes) {
            const bbox = shape.bounds()
            if (bbox === undefined) {
                continue
            }
            const origin = bbox.origin
            const corner = new Point(bbox.origin.x + bbox.size.width, bbox.origin.y + bbox.size.height)
            if (result === undefined) {
                result = new Rectangle(bbox)
            } else {
                result.expandByPoint(origin).expandByPoint(corner)
            }
        }
        return result
    }

    private extent: { x0: number; y0: number; x1: number; y1: number}  | undefined
    private panTarget: { x: number; y: number}  | undefined
    private _zoom = 1;

    // screen pixels per canvas unit
    get zoom(): number {
        return this._zoom
    }
    private scrollDelta = { x: 0, y: 0 };
    private scrolledAt = { x: 0, y: 0 };
    _invalid = false;
    private frame: number | undefined
    invalidate() {
        if (this._invalid) {
            return
        }
        this._invalid = true
        this.frame = requestAnimationFrame(() => this.update())
    }

    update() {
        if (this.frame !== undefined) {
            cancelAnimationFrame(this.frame)
            this.frame = undefined
        }
        this._invalid = false
        const bbox = this.bbox()
        if (bbox === undefined) {
            this.svg.style.left = ""
            this.svg.style.top = ""
            this.svg.style.width = ""
            this.svg.style.height = ""
            this.svg.removeAttribute("viewBox")
            this.dispatchEvent(new Event("viewchange"))
            return
        }
        // the SVG always covers at least the visible area and never shrinks, except that a user scroll
        // may shrink each edge toward the content by at most the distance scrolled
        const prev = this.extent
        const scrolledX = this.scrollDelta.x !== 0
        const scrolledY = this.scrollDelta.y !== 0
        const dx = Math.abs(this.scrollDelta.x)
        const dy = Math.abs(this.scrollDelta.y)
        this.scrollDelta = { x: 0, y: 0 }
        const fit = {
            x0: Math.min(bbox.origin.x, 0),
            y0: Math.min(bbox.origin.y, 0),
            x1: bbox.origin.x + bbox.size.width,
            y1: bbox.origin.y + bbox.size.height,
        }
        // resizing can clamp the scroll position, so keep the one from before the resize
        const scrollX = this.scrollLeft
        const scrollY = this.scrollTop
        // a pan decides the visible area itself, because the scroll position cannot reach past the old canvas
        const pan = this.panTarget
        this.panTarget = undefined
        const zoom = this._zoom
        const visibleX = pan ? pan.x : prev === undefined ? 0 : Math.floor(prev.x0) + scrollX / zoom
        const visibleY = pan ? pan.y : prev === undefined ? 0 : Math.floor(prev.y0) + scrollY / zoom
        // the canvas never starts or ends before the currently visible area, so the scroll position is not clamped
        this.extent = prev === undefined ? fit : {
            x0: Math.min(visibleX, !scrolledX || fit.x0 <= prev.x0 ? fit.x0 : Math.min(fit.x0, prev.x0 + dx)),
            y0: Math.min(visibleY, !scrolledY || fit.y0 <= prev.y0 ? fit.y0 : Math.min(fit.y0, prev.y0 + dy)),
            x1: !scrolledX || fit.x1 >= prev.x1 ? fit.x1 : Math.max(fit.x1, prev.x1 - dx),
            y1: !scrolledY || fit.y1 >= prev.y1 ? fit.y1 : Math.max(fit.y1, prev.y1 - dy),
        }
        const { x0, y0 } = this.extent
        // the visible area is part of the canvas, but a scrollbar takes space from it. Decide each scrollbar from the
        // box size (which the scrollbars do not change), so the sizes settle in one step instead of oscillating
        const thickness = Editor.scrollbarThickness()
        const boxW = this.offsetWidth
        const boxH = this.offsetHeight
        const extent = this.extent
        const layout = (hBar: boolean, vBar: boolean) => {
            // the view is in pixels, the canvas in canvas units
            const viewW = boxW - (vBar ? thickness : 0)
            const viewH = boxH - (hBar ? thickness : 0)
            const x1 = Math.max(extent.x1, visibleX + viewW / zoom)
            const y1 = Math.max(extent.y1, visibleY + viewH / zoom)
            // for the DOM, adjust bbox to integers
            return {
                x: Math.floor(x0),
                y: Math.floor(y0),
                w: Math.ceil(x1) - Math.floor(x0),
                h: Math.ceil(y1) - Math.floor(y0),
                viewW,
                viewH,
            }
        }
        // a scrollbar only ever turns on, so this stops after at most two steps
        let hBar = false
        let vBar = false
        let rb = layout(hBar, vBar)
        for (; ;) {
            const needH = rb.w * zoom > rb.viewW
            const needV = rb.h * zoom > rb.viewH
            if (needH === hBar && needV === vBar) {
                break
            }
            hBar ||= needH
            vBar ||= needV
            rb = layout(hBar, vBar)
        }
        this.applyLayout(rb, hBar, vBar, visibleX, visibleY, zoom)
    }

    private applyLayout(rb: { x: number; y: number; w: number; h: number} , hBar: boolean, vBar: boolean, visibleX: number, visibleY: number, zoom: number) {
        // the viewBox stays in canvas units, so the SVG's pixel size is the canvas size times the zoom
        this.svg.style.width = `${rb.w * zoom}px`
        this.svg.style.height = `${rb.h * zoom}px`
        this.svg.setAttribute("viewBox", `${rb.x} ${rb.y} ${rb.w} ${rb.h}`)
        // workaround for Safari 27.2: see the :host([fits]) rule in the style above
        this.toggleAttribute("fits", !hBar && !vBar)
        // the canvas always covers the visible area, so the scroll position is not clamped
        this.scrollLeft = (visibleX - rb.x) * zoom
        this.scrollTop = (visibleY - rb.y) * zoom
        this.scrolledAt = { x: this.scrollLeft, y: this.scrollTop }
        this.dispatchEvent(new Event("viewchange"))
    }

    // move the visible area by (dx, dy) screen pixels, dragging the content along
    pan(dx: number, dy: number) {
        const visible = this.visibleOrigin()
        if (visible === undefined) {
            return
        }
        this.viewTo(visible.x - dx / this._zoom, visible.y - dy / this._zoom)
    }

    // zoom around the center of the viewport, so the canvas point in the middle stays in the middle
    zoomTo(zoom: number) {
        const visible = this.visibleOrigin()
        if (visible === undefined) {
            this._zoom = zoom
            this.invalidate()
            return
        }
        const center = {
            x: visible.x + this.clientWidth / 2 / this._zoom,
            y: visible.y + this.clientHeight / 2 / this._zoom,
        }
        this._zoom = zoom
        this.viewTo(center.x - this.clientWidth / 2 / zoom, center.y - this.clientHeight / 2 / zoom)
    }

    // the canvas coordinates at the top left of the visible area
    private visibleOrigin(): { x: number; y: number}  | undefined {
        const e = this.extent
        if (e === undefined || this.bbox() === undefined) {
            return undefined
        }
        return {
            x: Math.floor(e.x0) + this.scrollLeft / this._zoom,
            y: Math.floor(e.y0) + this.scrollTop / this._zoom,
        }
    }

    // show the canvas from (x, y), growing or shrinking it to cover the visible area and the content
    private viewTo(x: number, y: number) {
        const bbox = this.bbox()
        if (bbox === undefined) {
            return
        }
        // the canvas is the union of the content and the new visible area, so it shrinks back when panning home
        const fit = {
            x0: Math.min(bbox.origin.x, 0),
            y0: Math.min(bbox.origin.y, 0),
            x1: bbox.origin.x + bbox.size.width,
            y1: bbox.origin.y + bbox.size.height,
        }
        this.extent = {
            x0: Math.min(x, fit.x0),
            y0: Math.min(y, fit.y0),
            x1: Math.max(x + this.clientWidth / this._zoom, fit.x1),
            y1: Math.max(y + this.clientHeight / this._zoom, fit.y1),
        }
        // apply now instead of on the next frame, so a large pan or zoom is not clamped to the old scroll range
        if (this.frame !== undefined) {
            cancelAnimationFrame(this.frame)
            this.frame = undefined
        }
        this.panTarget = { x, y }
        this.update()
    }

    public static readonly SHAPE_RANGE = 5.0;

    private static thickness: number | undefined

    // the width of a vertical scrollbar, which is the height of a horizontal one. zero when scrollbars take no space
    private static scrollbarThickness(): number {
        if (Editor.thickness === undefined) {
            const probe = document.createElement("div")
            probe.style.cssText = "position: absolute; top: -9999px; width: 100px; height: 100px; overflow: scroll"
            document.body.appendChild(probe)
            Editor.thickness = probe.offsetWidth - probe.clientWidth
            probe.remove()
        }
        return Editor.thickness
    }

    shapeAt(pt: PointLike): Shape | undefined {
        let mindist = Number.POSITIVE_INFINITY
        let nearestShape: Shape | undefined
        for (let index = this.shapes.length - 1; index >= 0; --index) {
            let shape = this.shapes[index]
            let pointInShapeSpace
            if (shape.matrix !== undefined) {
                // pointInShapeSpace = new Matrix(shape.matrix).invert().transformPoint(point)
                throw Error("yikes")
            } else {
                pointInShapeSpace = pt
            }
            let d = shape.distance(pointInShapeSpace)
            if (d < mindist) {
                mindist = d
                nearestShape = shape
            }
        }
        if (mindist >= Editor.SHAPE_RANGE) {
            return undefined
        }
        return nearestShape
    }
}
