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
import { Shape } from "shared/workflow_valuetype"
import { Tool } from "client/shapetools"
import { StrokeAndFillModel } from "client/app/StrokeAndFilll"
import { ToolModel } from "client/shapetools/ToolModel"
import { Layer } from "./Layer"
import { DrawingModel } from "./DrawingModel"
import { EditorPointerEvent } from "./EditorPointerEvent"
import { EditorKeyboardEvent } from "./EditorKeyboardEvent"
import { Group } from "client/shapes/Group"
import { DrawingEvent } from "./DrawingEvent"

import * as shape from "../shapes"
import { ALL } from "toad.js/appkit/Model"
import { HTMLElementProps } from "toad.jsx/jsx-runtime"
import { ScrollableVectorGraphics } from "./ScrollableVectorGraphics"
import { unitDefinitions } from "client/app/unit/unitDefinitions"
import { action } from "toad.js/appkit/Action"
import { StrokeEndModel } from "client/StrokeEndModel"
import { StrokeEndType } from "shared/workflow"
import { ShapeSelectionModel } from "./ShapeSelectionModel"

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

export const style = document.createElement("style")
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
        /* the selected shape will have the outline */
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
    ADD_SHAPES,
    DELETE_SHAPES,
    BRING_SHAPES_TO_FRONT,
    BRING_SHAPES_TO_BACK,
    BRING_SHAPES_FORWARD,
    BRING_SHAPES_BACKWARD,
    TRANSFORM_SHAPES, // translate, rotate, scale
    UPDATE_SHAPES, // get new path
    MOVE_HANDLE
}

/**
 * The ShapeEditor's Cache
 *
 * the cache maps a shape to its CacheEntry. this is used to
 * * locate shapes (not yet? we use Shape.distance(), which will not work if the shape
 *   is modified later)
 * * store the shape's path (shapes create the path with getPath(), then it undergoes
 *   various transformations (move, scale, deform, perspective, boolean operations, ...),
 *   and is then stored here. this transformed path is then provided to the shape
 *   in the updateSVG() call
 * * stores the shape's SVGElement (shapes create the SVGElement with updateSVG() but do
 *   not store it. this SVG is then also provided so updateSVG() to update an existing SVG.
 *   (storing the SVG outside the shape enables us to have multiple shape editor's displaying
 *   the same shape)
 *
 * this pattern was choosen to be able to transform bitmap images:
 * * the bitmap image shape will provide a path with Shape.getPath()
 * * the shapeeditor will apply all other transformations to to path
 * * the shapeeditor will provide the path during Shape.updateSVG(), where the
 *   shape will then squezze the bitmap into the provided path
 */
type Cache = Map<Shape, CacheEntry>
class CacheEntry {
    private _path?: AbstractPath
    private _bounds?: Rectangle
    /**
     * the SVG shape returned by the shape
     */
    svg?: SVGElement

    shape: shape.Shape
    parent?: CacheEntry
    constructor(shape: shape.Shape, parent: CacheEntry | undefined = undefined) {
        this.shape = shape
        this.parent = parent
        this.path = undefined
        this.svg = undefined
    }

    /**
     * the patch returned by the shape
     */
    get path(): AbstractPath | undefined {
        return this._path
    }
    set path(path: AbstractPath | undefined) {
        this._path = path
        this._bounds = undefined
    }

    // transforms the path in place, so the cached bounds are no longer valid
    transform(matrix: Matrix) {
        this._path?.transform(matrix)
        this._bounds = undefined
    }

    get bounds(): Rectangle | undefined {
        if (this._path === undefined) {
            return undefined
        }
        this._bounds ??= this._path.bounds()
        return this._bounds
    }
}

interface ShapeEditorProps extends HTMLElementProps {
    model?: DrawingModel
    tool?: ToolModel
    strokeandfill?: StrokeAndFillModel
    strokeStart?: StrokeEndModel
    strokeEnd?: StrokeEndModel
}

let instanceCounter = 0

export class ShapeEditor extends ScrollableVectorGraphics {
    instance = ++instanceCounter
    inputCatcher: HTMLDivElement

    /**
     * <g/> to render outlines, handles, anchors when editing
     * * always the last element in svgView
     * * all other elements must be added before this one
     * TODO: for scrolling, transformation is applied to the layer AND decorationOverlay
     *       this might be a stupid idea. especially when we start to have more than one
     *       layer (err... do we want layers at all? shape.Group would serve the same purpose... )
     *       so, if we can use the transformations on the <svg/> directly, we could get rid of
     *       the decorationOverlay and use this.outline and this.decoration directly
     */
    private overlay: SVGGElement
    /**
     * the <g/> to show outlines
     * always the second to last element in svgView
     */
    outline: SVGGElement
    /**
     * the <g/> to show anchors, handles, ...
     * always the last element in svgView
     */
    decoration: SVGGElement

    /**
     * to render the paper and bleed
     */
    documentOutline: SVGGElement

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

    constructor(props?: ShapeEditorProps) {
        super(props)

        this.cache = new Map<Shape, CacheEntry>()
        this.pointerIsDown = false

        // the input catcher's task is to catch events for this view
        this.inputCatcher = document.createElement("div")
        this.id = "input-catcher"
        this.inputCatcher.classList.add("stretch")
        this.inputCatcher.classList.add("inputCatcher")
        this.inputCatcher.contentEditable = "true"
        this.inputCatcher.addEventListener("keydown", this.inputCatcherKeyDown)
        this.inputCatcher.addEventListener("keyup", this.inputCatcherKeyUp)
        this.inputCatcher.addEventListener("cut", this.clipboard)
        this.inputCatcher.addEventListener("copy", this.clipboard)
        this.inputCatcher.addEventListener("paste", this.clipboard)

        this.addEventListener("pointerdown", this.pointerDown)
        this.addEventListener("pointermove", this.pointerMove)
        this.addEventListener("pointerup", this.pointerUp)

        // this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        // this.scrollView.appendChild(this.svg)

        this.overlay = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.overlay.id = "overlay"
        this.svg.appendChild(this.overlay)

        this.documentOutline = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.documentOutline.id = "overlay-document"
        this.overlay.appendChild(this.documentOutline)

        this.outline = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.outline.id = "overlay-outline"
        this.overlay.appendChild(this.outline)

        this.decoration = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.decoration.id = "overlay-decoration"
        this.overlay.appendChild(this.decoration)

        // console.log(this.shadowRoot)
        this.shadowRoot!.append(this.inputCatcher)
        // this.shadowRoot!.insertBefore(this.inputCatcher, this.svg)
        this.svg.appendChild(this.overlay)

        // FIXME: we've overloaded setModel but it's called by the super class which causes some issues, so we do it here again
        // setInitialProperties(this, props) // this was the earlier workaround???
        this.setModel(undefined)
        if (props?.tool) {
            this.setModel(props.tool as any)
        }
        if (props?.strokeandfill) {
            this.setModel(props.strokeandfill as any)
        }
        this.setModel(props?.model)

        //
        // handle stroke ends
        //

        // update selected shapes when stroke models change
        const updateStrokeEnds = () => {
            this.model!.setStrokeEnds(
                this.selectedLayer!,
                Tool.selection.shapes(),
                props?.strokeStart?.value,
                props?.strokeEnd?.value
            )
        }
        props?.strokeStart?.signal.add(updateStrokeEnds)
        props?.strokeEnd?.signal.add(updateStrokeEnds)

        // update stroke models when a single shape is selected
        if (Tool.selection === undefined) Tool.selection = new ShapeSelectionModel()
        Tool.selection.modified.add(() => {
            if (Tool.selection.selection.size !== 1) {
                return
            }
            const [shape] = Tool.selection.selection
            props?.strokeStart?.signal.lock()
            props?.strokeEnd?.signal.lock()
            if (props?.strokeStart) {
                props.strokeStart.value = shape.strokeStart ?? StrokeEndType.NONE
            }
            if (props?.strokeEnd) {
                props.strokeEnd.value = shape.strokeEnd ?? StrokeEndType.NONE
            }
            props?.strokeStart?.signal.unlock()
            props?.strokeEnd?.signal.unlock()
        }, this)

        action("object|arrange|front", () => {
            this.model?.bringToFront(this.selectedLayer!, Tool.selection.shapes())
        })
        action("object|arrange|back", () => {
            this.model?.bringToBack(this.selectedLayer!, Tool.selection.shapes())
        })
        action("object|arrange|forward", () => {
            this.model?.bringForward(this.selectedLayer!, Tool.selection.shapes())
        })
        action("object|arrange|backward", () => {
            this.model?.bringBackward(this.selectedLayer!, Tool.selection.shapes())
        })
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
                    this.selectedLayer!,
                    Tool.selection.shapes(),
                    this.strokeAndFillModel!.stroke,
                    this.strokeAndFillModel!.fill
                )
            }, this)
        }
        else {
            if (this.model !== model) {
                this.model?.documentSettings.signal.remove(this)

                super.setModel(model as DrawingModel)
                this.selectedLayer = model.layers[0]

                this.model?.documentSettings.signal.add(this.updatePaper, this)
                this.updatePaper()
            }
        }
        this.invalidate()
    }

    /**
     * Draw frame representing the document's size and bleed
     */
    @bind updatePaper(): void {
        if (this.documentOutline) {
            if (this.model === undefined) {
                this.documentOutline.replaceChildren()
                return
            }

            const ds = this.model.documentSettings
            const scale = unitDefinitions[ds.units.value].scale

            const paper = document.createElementNS("http://www.w3.org/2000/svg", "rect")
            paper.setAttributeNS(null, "x", "0.5")
            paper.setAttributeNS(null, "y", "0.5")
            paper.setAttributeNS(null, "width", Math.ceil(ds.width.value * scale).toString())
            paper.setAttributeNS(null, "height", Math.ceil(ds.height.value * scale).toString())
            paper.setAttributeNS(null, "stroke", "#000")
            paper.setAttributeNS(null, "fill", "none")

            const bleed = document.createElementNS("http://www.w3.org/2000/svg", "rect")
            bleed.setAttributeNS(null, "x", (Math.floor(ds.left.value * scale) + 0.5).toString())
            bleed.setAttributeNS(null, "y", (Math.floor(ds.top.value * scale) + 0.5).toString())
            bleed.setAttributeNS(null, "width", Math.ceil((ds.width.value - ds.left.value - ds.right.value) * scale).toString())
            bleed.setAttributeNS(null, "height", Math.ceil((ds.height.value - ds.top.value - ds.bottom.value) * scale).toString())
            bleed.setAttributeNS(null, "stroke", "#000")
            bleed.setAttributeNS(null, "fill", "none")

            this.documentOutline.replaceChildren(paper, bleed)
        }
    }

    override update(): void {
        this.updateView(undefined as any)
        // super.update()
    }

    // called whenever the model is modified
    override updateView(xxx: DrawingEvent) {
        // console.log(`ShapeEditor[${this.instance}].updateView(${JSON.stringify(xxx)})`)
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
            this.svg.insertBefore(this.layer, this.overlay)
        }
        let layer = this.layer

        // event is undefined when a model is added or removed
        if (event === undefined) {
            if (this.model) {
                // console.log(`### ShapeEditor.updateView(): NEW MODEL, FAKE ADD_SHAPES MESSAGE`)
                let shapes = this.model.layers[0].data
                    .filter(shape => !this.cache.has(shape)) // FIXME: cache should be empty
                event = {
                    operation: Operation.ADD_SHAPES,
                    shapes: shapes
                }
            } else {
                throw Error(`ShapeEditor.updateView(): handling of removing a model hasn't been implemented yet`)
                // TODO: clear cache, etc.
            }
        }

        switch (event.operation) {
            case Operation.ADD_SHAPES:
                // add new shapes to cache
                this.model.layers[0].data.forEach((shape) => {
                    let notInCache = !this.cache.has(shape)
                    if (notInCache) {
                        this.cache.set(shape, new CacheEntry(shape))
                    }
                })

                for (let shape of event.shapes) {
                    let cached = this.cache.get(shape)
                    if (!cached) {
                        throw Error(`ShapeEditor.updateView(): ADD_SHAPES cache lacks shape ${shape.id}`)
                    }
                    if (cached.shape instanceof Group) {
                        throw Error("ShapeEditor.updateView(): ADD_SHAPES for groups not implemented yet")
                    }
                    if (!cached.path) {
                        cached.path = cached.shape.getPath()
                        if (cached.shape.matrix) {
                            cached.transform(cached.shape.matrix)
                        }
                    }
                    let svg = cached.shape.updateSVG(cached.path, layer, cached.svg)
                    if (!cached.svg) {
                        layer.appendChild(svg) // FIXME: need to do positional insert 
                        cached.svg = svg
                    }
                }
                break

            case Operation.TRANSFORM_SHAPES:
                for (let shape of event.shapes) {
                    let cached = this.cache.get(shape)
                    if (!cached) {
                        throw Error(`ShapeEditor error: TRANSFORM_SHAPES cache lacks shape ${shape.id}`)
                    }
                    if (cached.shape instanceof Group) {
                        throw Error("ShapeEditor.updateView(): ADD_SHAPES for groups not implemented yet")
                    }
                    if (!cached.path) {
                        throw Error("ShapeEditor.updateView(): expected path in cache")
                    }
                    if (!cached.svg) {
                        throw Error("ShapeEditor.updateView(): expected svg in cache")
                    }

                    // variant i: get a new path
                    // cached.path = cached.shape.getPath()
                    // cached.svg = cached.shape.updateSVG(cached.path, cached.svg)

                    // variant ii: update the existing path
                    // console.log(`ShapeEditor.updateView(): got transform shapes`)
                    let path = cached.path!
                    // console.log(`  before transform ${JSON.stringify(path)}`)
                    let m = event.matrix
                    // console.log(`ShapeEditor.updateView(): transform path of shape ${id} by rotate ${m.getRotation()}, translate=${m.e}, ${m.f}`)
                    cached.transform(event.matrix!)
                    // console.log(`  after transform ${JSON.stringify(path)}`)
                    cached.svg = cached.shape.updateSVG(cached.path, layer, cached.svg)

                    // variant iii: add transform to SVGElement
                } break

            case Operation.UPDATE_SHAPES:
                for (let shape of event.shapes) {
                    let cached = this.cache.get(shape)
                    if (!cached) {
                        throw Error(`ShapeEditor error: UPDATE_SHAPES cache lacks shape ${shape.id}`)
                    }
                    if (cached.shape instanceof Group) {
                        throw Error("ShapeEditor.updateView(): UPDATE_SHAPES for groups not implemented yet")
                    }
                    if (!cached.path) {
                        throw Error("ShapeEditor.updateView(): expected path in cache")
                    }
                    if (!cached.svg) {
                        throw Error("ShapeEditor.updateView(): expected svg in cache")
                    }

                    cached.path = cached.shape.getPath()
                    if (cached.shape.matrix) {
                        cached.transform(cached.shape.matrix)
                    }
                    // console.log(`ShapeEditor.updateShape(): shape with id ${id} to ${cached.path}`)
                    cached.svg = cached.shape.updateSVG(cached.path, layer, cached.svg)
                }
                break

            case Operation.DELETE_SHAPES: {
                let deletedFromSelection = false
                for (let shape of event.shapes) {
                    let cached = this.cache.get(shape)
                    if (!cached) {
                        throw Error(`ShapeEditor error: DELETE_SHAPES cache lacks shape ${shape.id}`)
                    }
                    if (Tool.selection.has(cached.shape)) {
                        Tool.selection.remove(cached.shape)
                        deletedFromSelection = true
                    }

                    if (cached.svg !== undefined) {
                        layer.removeChild(cached.svg)
                    }
                    this.cache.delete(shape)
                }
                if (deletedFromSelection && this.tool) {
                    this.tool.deactivate(this)
                    this.tool.activate(this)
                }
            } break

            case Operation.BRING_SHAPES_TO_FRONT: {
                const shapes = this.removeFromLayer(layer, event.shapes)
                shapes.forEach(e => layer.appendChild(e))
            } break

            case Operation.BRING_SHAPES_TO_BACK: {
                const shapes = this.removeFromLayer(layer, event.shapes)
                if (layer.childNodes.length === 0) {
                    shapes.reverse()
                    shapes.forEach(e => layer.appendChild(e))
                } else {
                    const front = layer.childNodes[0]
                    shapes.forEach(e => layer.insertBefore(e, front))
                }
            } break

            case Operation.BRING_SHAPES_FORWARD: {
                const removed = this.removeFromLayerWithIndex(layer, event.shapes)
                for (let i = 0; i < removed.shapes.length; ++i) {
                    if (removed.index[i] < layer.childNodes.length) {
                        layer.insertBefore(removed.shapes[i], layer.childNodes[removed.index[i]])
                    } else {
                        layer.appendChild(removed.shapes[i])
                    }
                }
            } break

            case Operation.BRING_SHAPES_BACKWARD: {
                const removed = this.removeFromLayerWithIndex(layer, event.shapes)
                for (let i = 0; i < event.shapes.length; ++i) {
                    let idx = removed.index[i]
                    if (idx < 0)
                        idx = 0
                    layer.insertBefore(removed.shapes[i], layer.childNodes[idx])
                }
            } break

        }
        super.update()
    }

    override bbox(): Rectangle | undefined {
        let result: Rectangle | undefined
        for (const pair of this.cache) {
            const bounds = pair[1].bounds
            if (bounds === undefined) {
                continue
            }
            const origin = new Point(bounds.origin.x, bounds.origin.y)
            const corner = new Point(bounds.origin.x + bounds.size.width, bounds.origin.y + bounds.size.height)
            if (result === undefined) {
                // copy, so that expanding the result does not change the cached bounds
                result = new Rectangle({ origin: { x: origin.x, y: origin.y }, size: { width: bounds.size.width, height: bounds.size.height } })
            } else {
                result.expandByPoint(origin).expandByPoint(corner)
            }
        }
        return result
    }

    protected removeFromLayer(layer: SVGElement, shapes: Shape[]) {
        const removedShapes: SVGElement[] = []

        for (let shape of shapes) {
            let cached = this.cache.get(shape)
            if (!cached)
                throw Error(`ShapeEditor error: removeFromLayer() cache lacks shape ${shape.id}`)
            if (cached.svg === undefined)
                throw Error("yikes")
            layer.removeChild(cached.svg)
            removedShapes.push(cached.svg)
        }
        return removedShapes
    }

    // Array.from(element.parentNode.children).indexOf(element)
    protected removeFromLayerWithIndex(layer: SVGElement, shapes: Shape[]): { shapes: SVGElement[], index: number[] } {
        const result: { shapes: SVGElement[], index: number[] } = { shapes: [], index: [] }
        // const removedShapes: SVGElement[] = []

        const index = new Map<Shape, number>()
        this.selectedLayer!.data.forEach((shape, idx) => index.set(shape, idx))

        for (let shape of shapes) {
            let cached = this.cache.get(shape)
            if (!cached)
                throw Error(`ShapeEditor error: removeFromLayerWithIndex() cache lacks shape ${shape.id}`)
            if (cached.svg === undefined)
                throw Error("yikes")
            layer.removeChild(cached.svg)
            result.shapes.push(cached.svg)
            result.index.push(index.get(cached.shape)!)
        }
        return result
    }

    transformSelection(matrix: Matrix): void {
        // console.log("ShapeEditor.transformSelection()")
        this.model!.transform(this.selectedLayer!, Tool.selection.shapes(), matrix)
    }

    deleteSelection(): void {
        this.model!.delete(this.selectedLayer!, Tool.selection.shapes())
    }

    addShape(shape: Shape): void {
        this.model!.add(this.selectedLayer!, shape)
    }

    // size of anchors and handles in canvas units, so that they keep their size on screen at every zoom
    get handleSize(): number {
        return shape.Shape.HANDLE_RANGE / this.zoom
    }

    override zoomTo(zoom: number) {
        super.zoomTo(zoom)
        this.tool?.zoomChanged(this)
    }

    getPath(shape: Shape): Path | undefined {
        return this.cache.get(shape)?.path
    }

    getSVG(shape: Shape): SVGElement | undefined {
        return this.cache.get(shape)?.svg
    }

    override focus(options?: FocusOptions) {
        this.inputCatcher.focus(options)
    }

    //
    // POINTER
    //

    @bind pointerDown(pointerEvent: PointerEvent) {
        // the scrollbar is handled by ScrollableVectorGraphics, so a press on it must not start a shape interaction
        if (this.isOnScrollbar(pointerEvent)) {
            return
        }
        // console.log(`ShapeEditor[${this.instance}].pointerDown()`)

        this.setPointerCapture(pointerEvent.pointerId)

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
                throw Error(`ShapeEditor.createEditorPointerEvent(): unexpected event type '${event.type}'`)
        }
        // (e.clientX-r.left, e.clientY-r.top) begins at the upper left corner of the editor window
        //                                     scrolling and origin are ignored
        let r = this.getBoundingClientRect()
        // let x = (event.clientX + 0.5 - r.left + this.scrollLeft) / this.zoom
        // let y = (event.clientY + 0.5 - r.top + this.scrollTop) / this.zoom
        const pos = this.event2Pos(event)
        return {
            editor: this,
            x: pos.x,
            y: pos.y,
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

ShapeEditor.define("tx-shapeeditor", ShapeEditor)
