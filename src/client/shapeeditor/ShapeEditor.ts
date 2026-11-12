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
import { PointLike } from "shared/geometry/Point"
import { Matrix } from "shared/geometry/Matrix"
import { AbstractPath } from "client/paths"
import { Shape } from "shared/workflow_valuetype"
import { Tool } from "client/shapetools"
import { StrokeAndFillModel } from "client/views/widgets/strokeandfill"
import { ToolModel } from "client/shapetools/ToolModel"
import { Layer } from "./Layer"
import { DrawingModel } from "./DrawingModel"
import { EditorPointerEvent } from "./EditorPointerEvent"
import { EditorKeyboardEvent } from "./EditorKeyboardEvent"
import { Group } from "client/shapes/Group"
import { DrawingEvent } from "./DrawingEvent"

import * as shape from "../shapes"
import { ALL } from "toad.js/appkit/Model"
import { HTMLElementProps, setInitialProperties } from "toad.jsx/jsx-runtime"
import { Size } from "shared/geometry"
import { Editor } from "./Editor"

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

// The ShapeEditor's Cache
// ------------------------
// the cache maps shape.id to a CacheEntry. this is used to
// * locate shapes by id
// * store the shape's path (shapes create the path with getPath(), then it undergoes
//   various transformations (move, scale, deform, perspective, boolean operations, ...),
//   and is then stored here. this transformed path is then provided to the shape
//   in the updateSVG() call
// * stores the shape's SVGElement (shapes create the SVGElement with updateSVG() but do
//   not store it. this SVG is then also provided so updateSVG() to update an existing SVG
//
// this pattern was choosen to be able to transform bitmap images:
// * the bitmap image will provide a path with Shape.getPath()
// * the shapeeditor will apply all other transformations to to path
// * the shapeeditor will provide the path during Shape.updateSVG(), where the
//   shape will then squezze the bitmap into the provided path
type Cache = Map<number, CacheEntry>
class CacheEntry {
    shape: shape.Shape
    parent?: CacheEntry
    path?: AbstractPath
    svg?: SVGElement
    constructor(shape: shape.Shape, parent: CacheEntry | undefined = undefined) {
        this.shape = shape
        this.parent = parent
        this.path = undefined
        this.svg = undefined
    }
}

interface ShapeEditorProps extends HTMLElementProps {
    model?: DrawingModel
    tool?: ToolModel
    strokeandfill?: StrokeAndFillModel
}

export class ShapeEditor extends Editor {
    inputCatcher: HTMLDivElement
    scrollView: HTMLDivElement

    // <g/> to render outlines, handles, anchors when editing
    // * always the last element in svgView
    // * all other elements must be added before this one
    // TODO: for scrolling, transformation is applied to the layer AND decorationOverlay
    //       this might be a stupid idea. especially when we start to have more than one
    //       layer (err... do we want layers at all? shape.Group would serve the same purpose... )
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

    constructor(props?: ShapeEditorProps) {
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

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        this.scrollView.appendChild(this.svg)

        this.decorationOverlay = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.svg.appendChild(this.decorationOverlay)

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
        //         this.model.bringToFront(this.selectedLayer!.id, Tool.selection.shapeIds())
        // })
        // action("object|arrange|back", () => {
        //     if (this.model)
        //         this.model.bringToBack(this.selectedLayer!.id, Tool.selection.shapeIds())
        // })
        // action("object|arrange|forward", () => {
        //     if (this.model)
        //         this.model.bringForward(this.selectedLayer!.id, Tool.selection.shapeIds())
        // })
        // action("object|arrange|backward", () => {
        //     if (this.model)
        //         this.model.bringBackward(this.selectedLayer!.id, Tool.selection.shapeIds())
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
                    Tool.selection.shapeIds(),
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
        // console.log(`ShapeEditor.updateView(${JSON.stringify(xxx)})`)
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
            this.svg.insertBefore(this.layer, this.decorationOverlay)
        }
        let layer = this.layer

        // event is undefined when a model is added or removed
        if (event === undefined) {
            if (this.model) {
                // console.log(`### ShapeEditor.updateView(): NEW MODEL, FAKE ADD_SHAPES MESSAGE`)
                let shapes = this.model.layers[0].data
                    .filter(shape => !this.cache.has(shape.id)) // FIXME: cache should be empty
                    .map(shape => shape.id)
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
                    let notInCache = !this.cache.has(shape.id)
                    if (notInCache) {
                        this.cache.set(shape.id, new CacheEntry(shape))
                    }
                })

                for (let id of event.shapes) {
                    let cached = this.cache.get(id)
                    if (!cached)
                        throw Error(`ShapeEditor.updateView(): ADD_SHAPES cache lacks id ${id}`)
                    if (cached.shape instanceof Group) {
                        throw Error("ShapeEditor.updateView(): ADD_SHAPES for groups not implemented yet")
                    }
                    if (!cached.path) {
                        cached.path = cached.shape.getPath()
                        if (cached.shape.matrix)
                            cached.path.transform(cached.shape.matrix)
                    }
                    let svg = cached.shape.updateSVG(cached.path, layer, cached.svg)
                    if (!cached.svg) {
                        layer.appendChild(svg) // FIXME: need to do positional insert 
                        cached.svg = svg
                    }
                }
                break

            case Operation.TRANSFORM_SHAPES:
                for (let id of event.shapes) {
                    let cached = this.cache.get(id)
                    if (!cached)
                        throw Error(`ShapeEditor error: TRANSFORM_SHAPES cache lacks id ${id}`)
                    if (cached.shape instanceof Group) {
                        throw Error("ShapeEditor.updateView(): ADD_SHAPES for groups not implemented yet")
                    }
                    if (!cached.path)
                        throw Error("ShapeEditor.updateView(): expected path in cache")
                    if (!cached.svg)
                        throw Error("ShapeEditor.updateView(): expected svg in cache")

                    // variant i: get a new path
                    // cached.path = cached.shape.getPath()
                    // cached.svg = cached.shape.updateSVG(cached.path, cached.svg)

                    // variant ii: update the existing path
                    // console.log(`ShapeEditor.updateView(): got transform shapes`)
                    let path = cached.path!
                    // console.log(`  before transform ${JSON.stringify(path)}`)
                    let m = event.matrix
                    // console.log(`ShapeEditor.updateView(): transform path of shape ${id} by rotate ${m.getRotation()}, translate=${m.e}, ${m.f}`)
                    cached.path.transform(event.matrix!)
                    // console.log(`  after transform ${JSON.stringify(path)}`)
                    cached.svg = cached.shape.updateSVG(cached.path, layer, cached.svg)

                    // variant iii: add transform to SVGElement
                } break

            case Operation.UPDATE_SHAPES:
                for (let id of event.shapes) {
                    let cached = this.cache.get(id)
                    if (!cached)
                        throw Error(`ShapeEditor error: UPDATE_SHAPES cache lacks id ${id}`)
                    if (cached.shape instanceof Group) {
                        throw Error("ShapeEditor.updateView(): UPDATE_SHAPES for groups not implemented yet")
                    }
                    if (!cached.path)
                        throw Error("ShapeEditor.updateView(): expected path in cache")
                    if (!cached.svg)
                        throw Error("ShapeEditor.updateView(): expected svg in cache")

                    cached.path = cached.shape.getPath()
                    if (cached.shape.matrix)
                        cached.path.transform(cached.shape.matrix)
                    // console.log(`ShapeEditor.updateShape(): shape with id ${id} to ${cached.path}`)
                    cached.svg = cached.shape.updateSVG(cached.path, layer, cached.svg)
                }
                break

            case Operation.DELETE_SHAPES:
                for (let id of event.shapes) {
                    let cached = this.cache.get(id)
                    if (!cached)
                        throw Error(`ShapeEditor error: DELETE_SHAPES cache lacks id ${id}`)
                    if (cached.svg !== undefined)
                        layer.removeChild(cached.svg)
                    this.cache.delete(id)
                }
                break

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

        // update scrollbars
        // FIXME: replace setTimeout(..., 0) with something like, afterRendering(...)
        setTimeout(() => {
            this.bounds.expandByPoint({ x: this.scrollView.offsetWidth, y: this.scrollView.offsetHeight })
            this.svg.style.width = this.bounds.size.width + "px"
            this.svg.style.height = this.bounds.size.height + "px"
            this.adjustBounds()
            this.scrollView.scrollLeft = -this.bounds.origin.x
            this.scrollView.scrollTop = -this.bounds.origin.y
        }, 0)
    }

    protected removeFromLayer(layer: SVGElement, shapes: number[]) {
        const removedShapes: SVGElement[] = []

        for (let id of shapes) {
            let cached = this.cache.get(id)
            if (!cached)
                throw Error(`ShapeEditor error: removeFromLayer() cache lacks id ${id}`)
            if (cached.svg === undefined)
                throw Error("yikes")
            layer.removeChild(cached.svg)
            removedShapes.push(cached.svg)
        }
        return removedShapes
    }

    // Array.from(element.parentNode.children).indexOf(element)
    protected removeFromLayerWithIndex(layer: SVGElement, shapes: number[]): { shapes: SVGElement[], index: number[] } {
        const result: { shapes: SVGElement[], index: number[] } = { shapes: [], index: [] }
        // const removedShapes: SVGElement[] = []

        const index = new Map<Shape, number>()
        this.selectedLayer!.data.forEach((shape, idx) => index.set(shape, idx))

        for (let id of shapes) {
            let cached = this.cache.get(id)
            if (!cached)
                throw Error(`ShapeEditor error: removeFromLayerWithIndex() cache lacks id ${id}`)
            if (cached.svg === undefined)
                throw Error("yikes")
            layer.removeChild(cached.svg)
            result.shapes.push(cached.svg)
            result.index.push(index.get(cached.shape)!)
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
        // include all shapes
        for (let shape of this.model.layers[0]!.data) {
            bounds.expandByRectangle(shape.bounds())
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
        this.svg.style.width = (bounds.size.width * this.zoom) + "px"
        this.svg.style.height = (bounds.size.height * this.zoom) + "px"
        this.scrollView.scrollLeft = x
        this.scrollView.scrollTop = y
        this.bounds = bounds
    }

    transformSelection(matrix: Matrix): void {
        // console.log("ShapeEditor.transformSelection()")
        this.model!.transform(this.selectedLayer!.id, Tool.selection.shapeIds(), matrix)
    }

    deleteSelection(): void {
        this.model!.delete(this.selectedLayer!.id, Tool.selection.shapeIds())
    }

    addShape(shape: Shape): void {
        this.model!.add(this.selectedLayer!.id, shape)
    }

    getPath(shape: Shape): Path | undefined {
        return this.cache.get(shape.id)?.path
    }

    getSVG(shape: Shape): SVGElement | undefined {
        return this.cache.get(shape.id)?.svg
    }

    override focus(options?: FocusOptions) {
        this.inputCatcher.focus(options)
    }

    //
    // POINTER
    //

    @bind pointerDown(pointerEvent: PointerEvent) {
        console.log(`ShapeEditor.pointerDown()`)
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
                throw Error(`ShapeEditor.createEditorPointerEvent(): unexpected event type '${event.type}'`)
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

ShapeEditor.define("toad-shapeeditor", ShapeEditor)
