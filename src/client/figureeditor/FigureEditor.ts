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

import { bind } from "bind-decorator"
import { HTMLElementProps, setInitialProperties } from "toad.js"
import { ModelView } from "toad.js"

import { Rectangle, Matrix } from "shared/geometry"
import { AbstractPath } from "client/paths"
import { Figure } from "shared/workflow_valuetype"
import { Tool } from "client/figuretools"
import { StrokeAndFillModel } from "client/views/widgets/strokeandfill"
import { ToolModel } from "client/figuretools/ToolModel"
import { Layer } from "./Layer"
import { LayerModel } from "./LayerModel"
import { EditorMouseEvent } from "./EditorMouseEvent"
import { EditorKeyboardEvent } from "./EditorKeyboardEvent"
import { Group } from "client/figures/Group"
import { LayerEvent } from "./LayerEvent"

import * as figure from "../figures"

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

let style = document.createElement("style")
style.textContent = `
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
    model?: LayerModel
    tool?: ToolModel
}

export class FigureEditor extends ModelView<LayerModel> {
    inputCatcher: HTMLDivElement
    scrollView: HTMLDivElement
    bounds: Rectangle
    zoom: number
    svgView: SVGElement
    tool?: Tool
    toolModel?: ToolModel
    strokeAndFillModel?: StrokeAndFillModel
    mouseButtonIsDown: boolean
    selectedLayer?: Layer
    decorationOverlay: SVGElement
    layer?: SVGElement

    cache: Cache

    constructor(props?: FigureEditorProps) {
        super()

        this.cache = new Map<number, CacheEntry>()
        this.mouseButtonIsDown = false
        this.bounds = new Rectangle()
        this.zoom = 1.0

        this.inputCatcher = document.createElement("div")
        this.inputCatcher.classList.add("stretch")
        this.inputCatcher.classList.add("inputCatcher")
        this.inputCatcher.contentEditable = "true"
        this.inputCatcher.addEventListener("keydown", this.inputCatcherKeyDown)
        this.inputCatcher.addEventListener("cut", this.clipboard)
        this.inputCatcher.addEventListener("copy", this.clipboard)
        this.inputCatcher.addEventListener("paste", this.clipboard)
        
        this.scrollView = document.createElement("div")
        this.scrollView.classList.add("stretch")
        this.scrollView.classList.add("scrollView")

        this.scrollView.addEventListener("mousedown", this.mouseDown)
        this.scrollView.addEventListener("mousemove", this.mouseMove)
        this.scrollView.addEventListener("mouseup", this.mouseUp)

        this.svgView = document.createElementNS("http://www.w3.org/2000/svg", "svg")

        this.decorationOverlay = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.svgView.appendChild(this.decorationOverlay)
        this.scrollView.appendChild(this.svgView)

        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.appendChild(document.importNode(style, true))
        this.shadowRoot!.appendChild(this.inputCatcher)
        this.shadowRoot!.appendChild(this.scrollView)

        setInitialProperties(this, props)
        if (props?.tool)
            this.setModel(props.tool as any)
    }

    setTool(tool?: Tool) {
        if (tool == this.tool)
            return
        if (this.tool) {
            this.tool.deactivate(this.createEditorMouseEvent())
        }
        this.tool = tool
        if (this.tool)
            this.tool.activate(this.createEditorMouseEvent())
    }

    override setModel(model?: LayerModel): void {
        if (model === undefined) {
            if (this.toolModel) {
                this.toolModel.modified.remove(this)
                this.toolModel = undefined
            }
            super.setModel(undefined)
        }
        else if (model instanceof ToolModel) {
            if (this.toolModel === model)
                return
            this.toolModel = model
            this.toolModel.modified.add(() => {
                this.setTool(this.toolModel!.value)
            }, this)
            this.setTool(this.toolModel!.value)
        }
        else if (model instanceof StrokeAndFillModel) {
            if (this.strokeAndFillModel === model)
                return
            if (this.tool) {
                this.tool.deactivate(this.createEditorMouseEvent())
            }
            this.strokeAndFillModel = model
            if (this.tool) {
                this.tool.activate(this.createEditorMouseEvent())
            }
        }
        else {
            super.setModel(model as LayerModel)
        }
    }

    // called whenever the model is modified
    override updateView(event?: LayerEvent) {
        // console.log(`FigureEditor.updateView(${JSON.stringify(event)})`)
        if (this.model === undefined || this.model.layers.length === 0) {
            return
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
                        throw Error(`FigureEditor error: cache lacks id $id`)
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
                        throw Error(`FigureEditor error: cache lacks id $id`)
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
                    cached.svg = cached.figure.updateSVG(cached.path, layer, cached.svg)
                }
                break
            case Operation.DELETE_FIGURES:
                for (let id of event.figures) {
                    let cached = this.cache.get(id)
                    if (!cached)
                        throw Error(`FigureEditor error: cache lacks id $id`)
                    if (cached.svg !== undefined)
                        layer.removeChild(cached.svg)
                    this.cache.delete(id)
                }
                break
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
        for (let item of this.model.layers[0]!.data)
            bounds.expandByRectangle(item.bounds())
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
    // MOUSE
    //

    @bind mouseDown(mouseEvent: MouseEvent) {
        console.log(`FigureEditor.mouseDown()`)
        console.log(this.tool)
        console.log(this.selectedLayer)

        this.inputCatcher.focus({ preventScroll: true })
        mouseEvent.preventDefault()

        this.mouseButtonIsDown = true
        if (this.tool && this.selectedLayer)
            this.tool.mousedown(this.createEditorMouseEvent(mouseEvent))
    }

    @bind mouseMove(mouseEvent: MouseEvent) {
        mouseEvent.preventDefault()
        if (this.tool && this.selectedLayer)
            this.tool.mousemove(this.createEditorMouseEvent(mouseEvent))
    }

    @bind mouseUp(mouseEvent: MouseEvent) {
        mouseEvent.preventDefault()
        this.mouseButtonIsDown = false
        if (this.tool && this.selectedLayer)
            this.tool.mouseup(this.createEditorMouseEvent(mouseEvent))
    }

    protected createEditorMouseEvent(mouseEvent?: MouseEvent): EditorMouseEvent {
        if (mouseEvent === undefined) {
            return { editor: this, x: 0, y: 0, shiftKey: false, mouseDown: false }
        }
        // (e.clientX-r.left, e.clientY-r.top) begins at the upper left corner of the editor window
        //                                     scrolling and origin are ignored
        let r = this.scrollView.getBoundingClientRect()
        let x = (mouseEvent.clientX + 0.5 - r.left + this.scrollView.scrollLeft + this.bounds.origin.x) / this.zoom
        let y = (mouseEvent.clientY + 0.5 - r.top + this.scrollView.scrollTop + this.bounds.origin.y) / this.zoom
        return { editor: this, x: x, y: y, shiftKey: mouseEvent.shiftKey, mouseDown: this.mouseButtonIsDown }
    }

    //
    // KEYBOARD
    //

    @bind inputCatcherKeyDown(e: KeyboardEvent) {
        if (e.metaKey !== true && e.key !== "Dead" && this.tool && this.selectedLayer) {
            this.tool.keydown(new EditorKeyboardEvent(this, e))
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
