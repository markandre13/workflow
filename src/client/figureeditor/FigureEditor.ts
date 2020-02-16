/*
 *  workflow - A collaborative real-time white- and kanban board
 *  Copyright (C) 2020 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { GenericView, Model } from "toad.js"
import { Rectangle, Matrix } from "../../shared/geometry"
import { AbstractPath, Path } from "../paths"
import { Figure } from "../../shared/workflow_valuetype"
import { Tool } from "../figuretools"
import { StrokeAndFillModel } from "../widgets/strokeandfill"
import { ToolModel } from "../figuretools/ToolModel"
import { Layer } from "./Layer"
import { LayerModel } from "./LayerModel"
import { EditorEvent } from "./EditorEvent"
import { Group } from "../figures/Group"

import * as figure from "../figures"

export enum Operation {
    ADD_LAYERS,
    REMOVE_LAYERS,
    ADD_FIGURES,
    REMOVE_FIGURES,
    TRANSFORM_FIGURES,
    MOVE_HANDLE
}

class CacheEntry {
    figure: figure.Figure
    parent?: CacheEntry
    path?: AbstractPath
    svg?: SVGElement
    constructor(figure: figure.Figure, parent: CacheEntry|undefined = undefined) {
        this.figure = figure
        this.parent = parent
        this.path = undefined
        this.svg = undefined
    }
}

export class FigureEditor extends GenericView<LayerModel> {
    scrollView: HTMLDivElement
    bounds: Rectangle
    zoom: number
    svgView: SVGElement
    private tool?: Tool
    toolModel?: ToolModel
    strokeAndFillModel?: StrokeAndFillModel
    mouseButtonIsDown: boolean
    selectedLayer?: Layer
    decorationOverlay: SVGElement
    layer?: SVGElement

    // cache used by updateView()
    cache: Map<number, CacheEntry>

    constructor() {
        super()
        this.cache = new Map<number, CacheEntry>()
        this.mouseButtonIsDown = false
        this.scrollView = document.createElement("div")
        this.scrollView.style.overflow = "scroll"
        this.scrollView.style.background = "#fff"
        this.scrollView.style.width = "100%"
        this.scrollView.style.height = "100%"
        this.scrollView.onmousedown = (mouseEvent: MouseEvent) => {
            mouseEvent.preventDefault()
            this.mouseButtonIsDown = true
            if (this.tool && this.selectedLayer)
                this.tool.mousedown(this.createEditorEvent(mouseEvent))
        }
        this.scrollView.onmousemove = (mouseEvent: MouseEvent) => {
            mouseEvent.preventDefault()
            if (!this.mouseButtonIsDown)
                return
            if (this.tool && this.selectedLayer)
                this.tool.mousemove(this.createEditorEvent(mouseEvent))
        }
        this.scrollView.onmouseup = (mouseEvent: MouseEvent) => {
            mouseEvent.preventDefault()
            this.mouseButtonIsDown = false
            if (this.tool && this.selectedLayer)
                this.tool.mouseup(this.createEditorEvent(mouseEvent))
        }
        this.bounds = new Rectangle()
        this.zoom = 1.0
        this.svgView = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        this.svgView.style.position = "relative"
        this.svgView.style.backgroundColor = "rgb(255,255,255)"
        this.scrollView.appendChild(this.svgView)
        this.decorationOverlay = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.svgView.appendChild(this.decorationOverlay)
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.appendChild(this.scrollView)
    }
    setTool(tool?: Tool) {
        if (tool == this.tool)
            return
        if (this.tool) {
            this.tool.deactivate(this.createEditorEvent())
        }
        this.tool = tool
        if (this.tool)
            this.tool.activate(this.createEditorEvent())
    }
    setModel(model?: Model): void {
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
                this.tool.deactivate(this.createEditorEvent())
            }
            this.strokeAndFillModel = model
            if (this.tool) {
                this.tool.activate(this.createEditorEvent())
            }
        }
        else {
            super.setModel(model as LayerModel)
        }
    }
    updateModel() {
    }
    updateView(data? :any) {
        // called whenever the model is modified
        // console.log(`FigureEditor.updateView(${JSON.stringify(data)})`)
        if (this.model === undefined || this.model.layers.length === 0) {
            return
        }

        this.selectedLayer = this.model.layers[0] as Layer
        if (!this.layer) { // FIXME: this is a kludge to handle one layer, but we want to handle adding/removing multiple layers
            this.layer = document.createElementNS("http://www.w3.org/2000/svg", "g")
            this.svgView.insertBefore(this.layer, this.decorationOverlay)
        }
        let layer = this.layer

        if (data === undefined) {
            // FIXME: notInCache should be always true
            // FIXME: a new model would mean to clear the cache... how 
            // console.log(`### FigureEditor.updateView(): NEW MODEL, FAKE ADD_FIGURES MESSAGE`)
            let operation = Operation.ADD_FIGURES
            let figures = this.model.layers[0].data
                .filter((figure)=>{ 
                    let notInCache = !this.cache.has(figure.id)
                    if (notInCache) {
                        // console.log(`### FigureEditor.updateView(): ADD FIGURE WITH ID ${figure.id} TO THE CACHE`)
                        this.cache.set(figure.id, new CacheEntry(figure as figure.Figure))
                    }
                    return notInCache
                })
                .map((figure)=>{ return figure.id })
            data = {
                operation: Operation.ADD_FIGURES,
                figures: figures
            }
        }

        switch(data.operation) {
            case Operation.ADD_FIGURES:
                for(let id of data.figures) {
                    let cached = this.cache.get(id)
                    if (!cached)
                        throw Error(`FigureEditor error: cache lacks id $id`)
                    if (cached.figure instanceof Group) {
                        throw Error("FigureEditor.updateView(): ADD_FIGURES for groups not implemented yet")
                    }
                    if (!cached.path) {
                        cached.path = cached.figure.getPath() as AbstractPath
                        if (cached.figure.matrix)
                            cached.path.transform(cached.figure.matrix as Matrix)
                    }
                    let svg = cached.figure.updateSVG(cached.path, cached.svg)
                    if (!cached.svg) {
                        layer.appendChild(svg) // FIXME: need to do positional insert 
                        cached.svg = svg
                    }
                }
                break
            case Operation.TRANSFORM_FIGURES:
                for(let id of data.figures) {
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
                    // cached.path = cached.figure.getPath() as AbstractPath
                    // cached.svg = cached.figure.updateSVG(cached.path, cached.svg)

                    // variant ii: update the existing path
                    // console.log(`FigureEditor.updateView(): got transform figures`)
                    let path = cached.path!! as Path
                    // console.log(`  before transform ${JSON.stringify(path)}`)
                    let m = data.matrix as Matrix
                    console.log(`FigureEditor.updateView(): transform path of figure ${id} by rotate ${m.getRotation()}, translate=${m.e}, ${m.f}`)
                    cached.path.transform(data.matrix)
                    // console.log(`  after transform ${JSON.stringify(path)}`)
                    cached.svg = cached.figure.updateSVG(cached.path, cached.svg)

                    // variant iii: add transform to SVGElement
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
    createEditorEvent(mouseEvent?: MouseEvent): EditorEvent {
        if (mouseEvent === undefined) {
            return { editor: this, x: 0, y: 0, shiftKey: false }
        }
        // (e.clientX-r.left, e.clientY-r.top) begins at the upper left corner of the editor window
        //                                     scrolling and origin are ignored
        let r = this.scrollView.getBoundingClientRect()
        let x = (mouseEvent.clientX + 0.5 - r.left + this.scrollView.scrollLeft + this.bounds.origin.x) / this.zoom
        let y = (mouseEvent.clientY + 0.5 - r.top + this.scrollView.scrollTop + this.bounds.origin.y) / this.zoom
        return { editor: this, x: x, y: y, shiftKey: mouseEvent.shiftKey }
    }
    transformSelection(matrix: Matrix): void {
        // console.log("FigureEditor.transformSelection()")
        this.model!.transform(this.selectedLayer!.id, Tool.selection.figureIds(), matrix)
    }
    addFigure(figure: Figure): void {
        this.model!.add(this.selectedLayer!.id, figure)
    }
}
