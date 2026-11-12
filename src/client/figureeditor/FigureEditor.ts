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

import { bind } from "client/utils/bind-decorator"

import { Rectangle } from "shared/geometry/Rectangle"
import { Point, PointLike } from "shared/geometry/Point"
import { Matrix } from "shared/geometry/Matrix"
import { AbstractPath } from "client/paths"
import { Figure } from "shared/workflow_valuetype"
import { Tool } from "client/figuretools"
import { StrokeAndFillModel } from "client/views/widgets/strokeandfill"
import { ToolModel } from "client/figuretools/ToolModel"
import { Layer } from "./Layer"
import { DrawingModel } from "./DrawingModel"
import { EditorPointerEvent } from "./EditorPointerEvent"
import { EditorKeyboardEvent } from "./EditorKeyboardEvent"
import { Group } from "client/figures/Group"
import { DrawingEvent } from "./DrawingEvent"

import * as figure from "../figures"
import { ALL } from "toad.js/appkit/Model"
import { HTMLElementProps, setInitialProperties } from "toad.jsx/jsx-runtime"
import { ModelView } from "toad.js/viewkit/ModelView"
import { Size } from "shared/geometry"

interface InputEventInit extends UIEventInit {
    inputType: string
    data?: string | null
    dataTransfer: DataTransfer | null
    isComposing?: boolean
}

interface InputEvent extends UIEvent {
    readonly inputType: string
    readonly data: string | null
    readonly dataTransfer: DataTransfer | null
    readonly isComposing?: boolean // not on Safari
}
declare var InputEvent: {
    prototype: InputEvent
    new(type: string, eventInitDict?: InputEventInit): InputEvent
}

const style = document.createElement("style")
style.textContent = `
    :host {
        display: inline-block;
        position: relative;
        background: #f80;
        overflow: auto;
    }
    /* workaround for Safari 27.2: it keeps painting a scrollbar that is no longer needed,
       so hide the overflow entirely while the canvas fits */
    :host([fits]) {
        overflow: hidden;
    }
    .svg {
        display: inline-block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #fff;
    }
`

let styleOld = document.createElement("style")
styleOld.textContent = `
    :host: {
        position: relative;
    }

    .stretch {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
    }

    .inputCatcher {
        overflow: hidden;
    }

    .inputCatcher:focus {
        /* the selected figure will have the outline */
        outline: none;
    }

    .scrollView {
        overflow: scroll;
        /* use background color to hide the inputCatcher */
        background: #fff;
    }

    .cursor-blink {
      animation: cursor-blink 1s steps(1, start) infinite;
    }

    @keyframes cursor-blink {
        50% { opacity: 0;       }
            100% { opacity: 1; }
    }
`

export enum Operation {
    ADD_LAYERS,
    REMOVE_LAYERS,
    ADD_FIGURES,
    DELETE_FIGURES,
    BRING_FIGURES_TO_FRONT,
    BRING_FIGURES_TO_BACK,
    BRING_FIGURES_FORWARD,
    BRING_FIGURES_BACKWARD,
    TRANSFORM_FIGURES, // translate, rotate, scale
    UPDATE_FIGURES, // get new path
    MOVE_HANDLE
}

// The FigureEditor's Cache
// ------------------------
// the cache maps figure.id to a CacheEntry. this is used to
// * locate figures by id
// * store the figure's path (figures create the path with getPath(), then it undergoes
//   various transformations (move, scale, deform, perspective, boolean operations, ...),
//   and is then stored here. this transformed path is then provided to the figure
//   in the updateSVG() call
// * stores the figure's SVGElement (figures create the SVGElement with updateSVG() but do
//   not store it. this SVG is then also provided so updateSVG() to update an existing SVG
//
// this pattern was choosen to be able to transform bitmap images:
// * the bitmap image will provide a path with Figure.getPath()
// * the figureeditor will apply all other transformations to to path
// * the figureeditor will provide the path during Figure.updateSVG(), where the
//   figure will then squezze the bitmap into the provided path
type Cache = Map<number, CacheEntry>
class CacheEntry {
    figure: figure.Figure
    parent?: CacheEntry
    path?: AbstractPath
    svg?: SVGElement
    constructor(figure: figure.Figure, parent: CacheEntry | undefined = undefined) {
        this.figure = figure
        this.parent = parent
        this.path = undefined
        this.svg = undefined
    }
}

interface FigureEditorProps extends HTMLElementProps {
    model?: DrawingModel
    tool?: ToolModel
    strokeandfill?: StrokeAndFillModel
}

export class Editor extends ModelView<DrawingModel> {
    svg: SVGSVGElement
    private shapes: Figure[] = []

    selected: Figure | undefined = undefined
    private readonly pointerLastAt = new Point()

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

    private scrollbarHeld = false

    // releasing the button ends a scrollbar drag, even when the release happens outside the editor
    private readonly onwindowrelease = () => this.releaseScrollbar()

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

    // add(shape: Figure) {
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

    private extent: { x0: number, y0: number, x1: number, y1: number } | undefined
    private panTarget: { x: number, y: number } | undefined
    private _zoom = 1

    // screen pixels per canvas unit
    get zoom(): number {
        return this._zoom
    }
    private scrollDelta = { x: 0, y: 0 }
    private scrolledAt = { x: 0, y: 0 }
    _invalid = false
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
        for (;;) {
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

    private applyLayout(rb: { x: number, y: number, w: number, h: number }, hBar: boolean, vBar: boolean, visibleX: number, visibleY: number, zoom: number) {
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
    private visibleOrigin(): { x: number, y: number } | undefined {
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

    public static readonly FIGURE_RANGE = 5.0

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

    shapeAt(pt: PointLike): Figure | undefined {
        let mindist = Number.POSITIVE_INFINITY
        let nearestFigure: Figure | undefined
        for (let index = this.shapes.length - 1; index >= 0; --index) {
            let figure = this.shapes[index]
            let pointInFigureSpace
            if (figure.matrix !== undefined) {
                // pointInFigureSpace = new Matrix(figure.matrix).invert().transformPoint(point)
                throw Error("yikes")
            } else {
                pointInFigureSpace = pt
            }
            let d = figure.distance(pointInFigureSpace)
            if (d < mindist) {
                mindist = d
                nearestFigure = figure
            }
        }
        if (mindist >= Editor.FIGURE_RANGE) {
            return undefined
        }
        return nearestFigure
    }
}

export class FigureEditor extends Editor {
    inputCatcher: HTMLDivElement
    scrollView: HTMLDivElement

    svgView: SVGSVGElement         // the <svg/> within the scrollView

    // <g/> to render outlines, handles, anchors when editing
    // * always the last element in svgView
    // * all other elements must be added before this one
    // TODO: for scrolling, transformation is applied to the layer AND decorationOverlay
    //       this might be a stupid idea. especially when we start to have more than one
    //       layer (err... do we want layers at all? figure.Group would serve the same purpose... )
    //       so, if we can use the transformations on the <svg/> directly, we could get rid of
    //       the decorationOverlay and use this.outline and this.decoration directly
    private decorationOverlay: SVGGElement
    // the <g/> to show outlines
    // * always the second to last element in svgView
    outline: SVGGElement
    // the <g/> to show anchors, handles, ...
    // * always the last element in svgView
    decoration: SVGGElement

    bounds: Rectangle // bounds of whut?
    // zoom: number // zoom factor

    tool?: Tool // current tool
    toolModel?: ToolModel // all available tools

    strokeAndFillModel?: StrokeAndFillModel

    // some additional mouse data commonly used by the tools
    pointerDownAt?: PointLike
    pointerNowAt?: PointLike
    pointerIsDown: boolean // TODO: reuse mouseDownAt for this

    selectedLayer?: Layer
    layer?: SVGElement

    cache: Cache

    constructor(props?: FigureEditorProps) {
        super(props)

        this.cache = new Map<number, CacheEntry>()
        this.pointerIsDown = false
        this.bounds = new Rectangle()
        // this.zoom = 1.0

        // the input catcher's task is to catch events for this view
        this.inputCatcher = document.createElement("div")
        this.inputCatcher.classList.add("stretch")
        this.inputCatcher.classList.add("inputCatcher")
        this.inputCatcher.contentEditable = "true"
        this.inputCatcher.addEventListener("keydown", this.inputCatcherKeyDown)
        this.inputCatcher.addEventListener("keyup", this.inputCatcherKeyUp)
        this.inputCatcher.addEventListener("cut", this.clipboard)
        this.inputCatcher.addEventListener("copy", this.clipboard)
        this.inputCatcher.addEventListener("paste", this.clipboard)

        this.scrollView = document.createElement("div")
        this.scrollView.classList.add("stretch")
        this.scrollView.classList.add("scrollView")
        this.scrollView.addEventListener("pointerdown", this.pointerDown)
        this.scrollView.addEventListener("pointermove", this.pointerMove)
        this.scrollView.addEventListener("pointerup", this.pointerUp)

        this.svgView = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        this.scrollView.appendChild(this.svgView)

        this.decorationOverlay = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.svgView.appendChild(this.decorationOverlay)

        this.outline = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.decorationOverlay.appendChild(this.outline)

        this.decoration = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.decorationOverlay.appendChild(this.decoration)

        // this.attachShadow({ mode: 'open' })
        // this.shadowRoot!.appendChild(document.importNode(style, true))
        // this.shadowRoot!.appendChild(this.inputCatcher)
        // this.shadowRoot!.appendChild(this.scrollView)

        // setInitialProperties(this, props)
        if (props?.tool)
            this.setModel(props.tool as any)
        if (props?.strokeandfill)
            this.setModel(props.strokeandfill as any)

        // FIXME: get menubar actions working again
        // action("object|arrange|front", () => {
        //     if (this.model)
        //         this.model.bringToFront(this.selectedLayer!.id, Tool.selection.figureIds())
        // })
        // action("object|arrange|back", () => {
        //     if (this.model)
        //         this.model.bringToBack(this.selectedLayer!.id, Tool.selection.figureIds())
        // })
        // action("object|arrange|forward", () => {
        //     if (this.model)
        //         this.model.bringForward(this.selectedLayer!.id, Tool.selection.figureIds())
        // })
        // action("object|arrange|backward", () => {
        //     if (this.model)
        //         this.model.bringBackward(this.selectedLayer!.id, Tool.selection.figureIds())
        // })
    }

    setTool(tool?: Tool) {
        if (tool === this.tool)
            return
        if (this.tool) {
            Tool.clearHint()
            this.tool.deactivate(this)
        }
        this.tool = tool
        if (this.tool) {
            if (this.isConnected) {
                this.tool.activate(this)
            } else {
                window.setTimeout(() => { this!.tool!.activate(this) }, 0)
            }
        }
    }

    override setModel(model?: DrawingModel | ToolModel | StrokeAndFillModel): void {
        if (model === undefined) {
            if (this.toolModel) {
                this.toolModel.signal.remove(this)
                this.toolModel = undefined
            }
            if (this.strokeAndFillModel) {
                this.strokeAndFillModel.signal.remove(this)
                this.strokeAndFillModel = undefined
            }
            super.setModel(undefined)
        }
        else if (model instanceof ToolModel) {
            if (this.toolModel === model)
                return
            this.toolModel = model
            this.toolModel.signal.add(() => {
                this.setTool(this.toolModel!.value)
            }, this)
            this.setTool(this.toolModel!.value)
        }
        else if (model instanceof StrokeAndFillModel) {
            if (this.strokeAndFillModel === model)
                return
            this.strokeAndFillModel = model
            this.strokeAndFillModel.signal.add(() => {
                this.model!.setStrokeAndFill(
                    this.selectedLayer!.id,
                    Tool.selection.figureIds(),
                    this.strokeAndFillModel!.stroke,
                    this.strokeAndFillModel!.fill
                )
            }, this)
        }
        else {
            super.setModel(model as DrawingModel)
        }
    }

    // called whenever the model is modified
    override updateView(xxx: DrawingEvent) {
        // console.log(`FigureEditor.updateView(${JSON.stringify(xxx)})`)
        if (this.model === undefined || this.model.layers.length === 0) {
            return
        }

        let event: DrawingEvent | undefined
        if (typeof xxx === "object") {
            if ("type" in xxx && xxx.type === ALL) {
                event = undefined
            } else {
                event = xxx
            }
        }

        this.selectedLayer = this.model.layers[0]
        if (!this.layer) { // FIXME: this is a kludge to handle one layer, but we want to handle adding/removing multiple layers
            this.layer = document.createElementNS("http://www.w3.org/2000/svg", "g")
            this.layer.style.cursor = "inherit"
            this.svgView.insertBefore(this.layer, this.decorationOverlay)
        }
        let layer = this.layer

        // event is undefined when a model is added or removed
        if (event === undefined) {
            if (this.model) {
                // console.log(`### FigureEditor.updateView(): NEW MODEL, FAKE ADD_FIGURES MESSAGE`)
                let figures = this.model.layers[0].data
                    .filter(figure => !this.cache.has(figure.id)) // FIXME: cache should be empty
                    .map(figure => figure.id)
                event = {
                    operation: Operation.ADD_FIGURES,
                    figures: figures
                }
            } else {
                throw Error(`FigureEditor.updateView(): handling of removing a model hasn't been implemented yet`)
                // TODO: clear cache, etc.
            }
        }

        switch (event.operation) {
            case Operation.ADD_FIGURES:
                // add new figures to cache
                this.model.layers[0].data.forEach((figure) => {
                    let notInCache = !this.cache.has(figure.id)
                    if (notInCache) {
                        this.cache.set(figure.id, new CacheEntry(figure))
                    }
                })

                for (let id of event.figures) {
                    let cached = this.cache.get(id)
                    if (!cached)
                        throw Error(`FigureEditor.updateView(): ADD_FIGURES cache lacks id ${id}`)
                    if (cached.figure instanceof Group) {
                        throw Error("FigureEditor.updateView(): ADD_FIGURES for groups not implemented yet")
                    }
                    if (!cached.path) {
                        cached.path = cached.figure.getPath()
                        if (cached.figure.matrix)
                            cached.path.transform(cached.figure.matrix)
                    }
                    let svg = cached.figure.updateSVG(cached.path, layer, cached.svg)
                    if (!cached.svg) {
                        layer.appendChild(svg) // FIXME: need to do positional insert 
                        cached.svg = svg
                    }
                }
                break

            case Operation.TRANSFORM_FIGURES:
                for (let id of event.figures) {
                    let cached = this.cache.get(id)
                    if (!cached)
                        throw Error(`FigureEditor error: TRANSFORM_FIGURES cache lacks id ${id}`)
                    if (cached.figure instanceof Group) {
                        throw Error("FigureEditor.updateView(): ADD_FIGURES for groups not implemented yet")
                    }
                    if (!cached.path)
                        throw Error("FigureEditor.updateView(): expected path in cache")
                    if (!cached.svg)
                        throw Error("FigureEditor.updateView(): expected svg in cache")

                    // variant i: get a new path
                    // cached.path = cached.figure.getPath()
                    // cached.svg = cached.figure.updateSVG(cached.path, cached.svg)

                    // variant ii: update the existing path
                    // console.log(`FigureEditor.updateView(): got transform figures`)
                    let path = cached.path!
                    // console.log(`  before transform ${JSON.stringify(path)}`)
                    let m = event.matrix
                    // console.log(`FigureEditor.updateView(): transform path of figure ${id} by rotate ${m.getRotation()}, translate=${m.e}, ${m.f}`)
                    cached.path.transform(event.matrix!)
                    // console.log(`  after transform ${JSON.stringify(path)}`)
                    cached.svg = cached.figure.updateSVG(cached.path, layer, cached.svg)

                    // variant iii: add transform to SVGElement
                } break

            case Operation.UPDATE_FIGURES:
                for (let id of event.figures) {
                    let cached = this.cache.get(id)
                    if (!cached)
                        throw Error(`FigureEditor error: UPDATE_FIGURES cache lacks id ${id}`)
                    if (cached.figure instanceof Group) {
                        throw Error("FigureEditor.updateView(): UPDATE_FIGURES for groups not implemented yet")
                    }
                    if (!cached.path)
                        throw Error("FigureEditor.updateView(): expected path in cache")
                    if (!cached.svg)
                        throw Error("FigureEditor.updateView(): expected svg in cache")

                    cached.path = cached.figure.getPath()
                    if (cached.figure.matrix)
                        cached.path.transform(cached.figure.matrix)
                    // console.log(`FigureEditor.updateFigure(): figure with id ${id} to ${cached.path}`)
                    cached.svg = cached.figure.updateSVG(cached.path, layer, cached.svg)
                }
                break

            case Operation.DELETE_FIGURES:
                for (let id of event.figures) {
                    let cached = this.cache.get(id)
                    if (!cached)
                        throw Error(`FigureEditor error: DELETE_FIGURES cache lacks id ${id}`)
                    if (cached.svg !== undefined)
                        layer.removeChild(cached.svg)
                    this.cache.delete(id)
                }
                break

            case Operation.BRING_FIGURES_TO_FRONT: {
                const figures = this.removeFromLayer(layer, event.figures)
                figures.forEach(e => layer.appendChild(e))
            } break

            case Operation.BRING_FIGURES_TO_BACK: {
                const figures = this.removeFromLayer(layer, event.figures)
                if (layer.childNodes.length === 0) {
                    figures.reverse()
                    figures.forEach(e => layer.appendChild(e))
                } else {
                    const front = layer.childNodes[0]
                    figures.forEach(e => layer.insertBefore(e, front))
                }
            } break

            case Operation.BRING_FIGURES_FORWARD: {
                const removed = this.removeFromLayerWithIndex(layer, event.figures)
                for (let i = 0; i < removed.figures.length; ++i) {
                    if (removed.index[i] < layer.childNodes.length) {
                        layer.insertBefore(removed.figures[i], layer.childNodes[removed.index[i]])
                    } else {
                        layer.appendChild(removed.figures[i])
                    }
                }
            } break

            case Operation.BRING_FIGURES_BACKWARD: {
                const removed = this.removeFromLayerWithIndex(layer, event.figures)
                for (let i = 0; i < event.figures.length; ++i) {
                    let idx = removed.index[i]
                    if (idx < 0)
                        idx = 0
                    layer.insertBefore(removed.figures[i], layer.childNodes[idx])
                }
            } break

        }

        // update scrollbars
        // FIXME: replace setTimeout(..., 0) with something like, afterRendering(...)
        setTimeout(() => {
            this.bounds.expandByPoint({ x: this.scrollView.offsetWidth, y: this.scrollView.offsetHeight })
            this.svgView.style.width = this.bounds.size.width + "px"
            this.svgView.style.height = this.bounds.size.height + "px"
            this.adjustBounds()
            this.scrollView.scrollLeft = -this.bounds.origin.x
            this.scrollView.scrollTop = -this.bounds.origin.y
        }, 0)
    }

    protected removeFromLayer(layer: SVGElement, figures: number[]) {
        const removedFigures: SVGElement[] = []

        for (let id of figures) {
            let cached = this.cache.get(id)
            if (!cached)
                throw Error(`FigureEditor error: removeFromLayer() cache lacks id ${id}`)
            if (cached.svg === undefined)
                throw Error("yikes")
            layer.removeChild(cached.svg)
            removedFigures.push(cached.svg)
        }
        return removedFigures
    }

    // Array.from(element.parentNode.children).indexOf(element)
    protected removeFromLayerWithIndex(layer: SVGElement, figures: number[]): { figures: SVGElement[], index: number[] } {
        const result: { figures: SVGElement[], index: number[] } = { figures: [], index: [] }
        // const removedFigures: SVGElement[] = []

        const index = new Map<Figure, number>()
        this.selectedLayer!.data.forEach((figure, idx) => index.set(figure, idx))

        for (let id of figures) {
            let cached = this.cache.get(id)
            if (!cached)
                throw Error(`FigureEditor error: removeFromLayerWithIndex() cache lacks id ${id}`)
            if (cached.svg === undefined)
                throw Error("yikes")
            layer.removeChild(cached.svg)
            result.figures.push(cached.svg)
            result.index.push(index.get(cached.figure)!)
        }
        return result
    }

    adjustBounds(): void {
        if (!this.model)
            return
        let bounds = new Rectangle()
        // include the viewing ports center
        bounds.expandByPoint({
            x: this.scrollView.offsetWidth / this.zoom,
            y: this.scrollView.offsetHeight / this.zoom
        })
        // include all figures
        for (let figure of this.model.layers[0]!.data) {
            bounds.expandByRectangle(figure.bounds())
        }
        // include visible areas top, left corner
        bounds.expandByPoint({
            x: this.bounds.origin.x + this.scrollView.scrollLeft,
            y: this.bounds.origin.y + this.scrollView.scrollTop
        })
        // include visible areas bottom, right corner
        bounds.expandByPoint({
            x: this.bounds.origin.x + this.scrollView.scrollLeft + this.scrollView.clientWidth / this.zoom,
            y: this.bounds.origin.y + this.scrollView.scrollTop + this.scrollView.clientHeight / this.zoom
        })
        let x = this.bounds.origin.x + this.scrollView.scrollLeft - bounds.origin.x
        let y = this.bounds.origin.y + this.scrollView.scrollTop - bounds.origin.y
        /*
        console.log("adjustBounds after scrolling")
        console.log("  old bounds   =("+editor.bounds.origin.x+","+editor.bounds.origin.y+","+editor.bounds.size.width+","+editor.bounds.size.height+")")
        console.log("  new bounds   =("+bounds.origin.x+","+bounds.origin.y+","+bounds.size.width+","+bounds.size.height+")")
        console.log("  scroll       =("+editor.window.scrollLeft+","+editor.window.scrollTop+")")
        console.log("  scroll mapped=("+(editor.bounds.origin.x+editor.window.scrollLeft)+","+(editor.bounds.origin.y+editor.window.scrollTop)+")")
        console.log("  new scroll   =("+x+","+y+")")
        */
        let zoomString = String(this.zoom)
        let scale = "scale(" + zoomString + " " + zoomString + ")"
        this.layer!.setAttributeNS("", "transform", "translate(" + (-bounds.origin.x) + " " + (-bounds.origin.y) + ") " + scale)
        this.decorationOverlay.setAttributeNS("", "transform", "translate(" + (-bounds.origin.x) + " " + (-bounds.origin.y) + ") " + scale)
        this.svgView.style.width = (bounds.size.width * this.zoom) + "px"
        this.svgView.style.height = (bounds.size.height * this.zoom) + "px"
        this.scrollView.scrollLeft = x
        this.scrollView.scrollTop = y
        this.bounds = bounds
    }

    transformSelection(matrix: Matrix): void {
        // console.log("FigureEditor.transformSelection()")
        this.model!.transform(this.selectedLayer!.id, Tool.selection.figureIds(), matrix)
    }

    deleteSelection(): void {
        this.model!.delete(this.selectedLayer!.id, Tool.selection.figureIds())
    }

    addFigure(figure: Figure): void {
        this.model!.add(this.selectedLayer!.id, figure)
    }

    getPath(figure: Figure): Path | undefined {
        return this.cache.get(figure.id)?.path
    }

    getSVG(figure: Figure): SVGElement | undefined {
        return this.cache.get(figure.id)?.svg
    }

    override focus(options?: FocusOptions) {
        this.inputCatcher.focus(options)
    }

    //
    // POINTER
    //

    @bind pointerDown(pointerEvent: PointerEvent) {
        console.log(`FigureEditor.pointerDown()`)
        // console.log(this.tool)
        // console.log(this.selectedLayer)

        this.scrollView.setPointerCapture(pointerEvent.pointerId)

        this.inputCatcher.focus({ preventScroll: true })
        pointerEvent.preventDefault()

        this.pointerIsDown = true
        if (this.tool && this.selectedLayer) {
            const editorEvent = this.createEditorPointerEvent(pointerEvent)
            this.pointerDownAt = editorEvent
            this.tool.pointerEvent(editorEvent)
        }
    }

    @bind pointerMove(pointerEvent: PointerEvent) {
        pointerEvent.preventDefault()
        if (this.tool && this.selectedLayer) {
            const editorEvent = this.createEditorPointerEvent(pointerEvent)
            this.pointerNowAt = editorEvent
            this.tool.pointerEvent(editorEvent)
        }
    }

    @bind pointerUp(pointerEvent: PointerEvent) {
        pointerEvent.preventDefault()
        this.pointerIsDown = false
        if (this.tool && this.selectedLayer) {
            this.tool.pointerEvent(this.createEditorPointerEvent(pointerEvent))
            this.pointerDownAt = undefined
        }
    }

    protected createEditorPointerEvent(event: PointerEvent): EditorPointerEvent {
        let type: "move" | "down" | "up"
        switch (event.type) {
            case "pointermove":
                type = "move"
                break
            case "pointerdown":
                type = "down"
                break
            case "pointerup":
                type = "up"
                break
            default:
                throw Error(`FigureEditor.createEditorPointerEvent(): unexpected event type '${event.type}'`)
        }
        // (e.clientX-r.left, e.clientY-r.top) begins at the upper left corner of the editor window
        //                                     scrolling and origin are ignored
        let r = this.scrollView.getBoundingClientRect()
        let x = (event.clientX + 0.5 - r.left + this.scrollView.scrollLeft + this.bounds.origin.x) / this.zoom
        let y = (event.clientY + 0.5 - r.top + this.scrollView.scrollTop + this.bounds.origin.y) / this.zoom
        return {
            editor: this,
            x: x,
            y: y,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
            ctrlKey: event.ctrlKey,
            pressure: event.pressure,
            tiltX: event.tiltX,
            tiltY: event.tiltY,
            twist: event.twist,
            pointerId: event.pointerId,
            pointerType: event.pointerType,
            pointerDown: this.pointerIsDown,
            type: type
        }
    }

    //
    // KEYBOARD
    //

    @bind inputCatcherKeyDown(e: KeyboardEvent) {
        if (e.metaKey !== true && e.key !== "Dead" && this.tool && this.selectedLayer) {
            this.tool.keyEvent(new EditorKeyboardEvent(this, e))
            // clear the input catcher so we do not accumulate data we do not need.
            // NOTE: do not clear it when e.key === "Dead" because the input method
            // uses the content to compose the character.
            // NOTE: there are some situations where dead key suddenly stops working
            //       the if statement might be wrong...?
            this.inputCatcher.textContent = ""
        }
        // TODO: we might want some deadkeys
    }

    @bind inputCatcherKeyUp(e: KeyboardEvent) {
        if (e.metaKey !== true && e.key !== "Dead" && this.tool && this.selectedLayer) {
            this.tool.keyEvent(new EditorKeyboardEvent(this, e))
            // clear the input catcher so we do not accumulate data we do not need.
            // NOTE: do not clear it when e.key === "Dead" because the input method
            // uses the content to compose the character.
            // NOTE: there are some situations where dead key suddenly stops working
            //       the if statement might be wrong...?
            this.inputCatcher.textContent = ""
        }
    }

    //
    // CLIPBOARD
    //

    @bind clipboard(event: ClipboardEvent) {
        if (this.tool && this.selectedLayer)
            this.tool.clipboard(this, event)
    }
}

FigureEditor.define("toad-figureeditor", FigureEditor)
