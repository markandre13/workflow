/*
 *  workflow - A collaborative real-time white- and kanban board
 *  Copyright (C) 2018 Mark-André Hopf <mhopf@mark13.org>
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

import { Signal, GenericView, Model, OptionModel, globalController } from "toad.js"
import { Point, Rectangle, Matrix } from "../shared/geometry"
import { Path } from "./Path"
import { Figure, Layer } from "../shared/workflow_valuetype"
import { Tool } from "./tool"

export class ToolModel extends OptionModel<Tool> {
}

export interface LayerModel {
    modified: Signal
    layers: Array<Layer>

    transform(layerID: number, indices: Array<number>, matrix: Matrix): void
}

export class EditorEvent extends Point {
    editor: FigureEditor
    shiftKey: boolean
    constructor(editor: FigureEditor, opt:any) {
        super()
        this.editor = editor
        this.shiftKey = (opt||opt.shiftKey)?true:false
    }
}

export class FigureSelectionModel {
    modified: Signal
    selection: Set<Figure>
    
    constructor() {
        this.modified = new Signal()
        this.selection = new Set<Figure>()
    }
    
    add(figure: Figure): void {
        this.selection.add(figure)
        this.modified.trigger()
    }
    
    has(figure: Figure): boolean {
        return this.selection.has(figure)
    }
    
    empty(): boolean {
        return this.selection.size === 0
    }

    clear(): void {
        this.selection.clear()
        this.modified.trigger()
    }
    
    figureIds(): Array<number> {
        let result = new Array<number>()
        for(let figure of this.selection)
            result.push(figure.id)
        return result
    }
}

export class FigureEditor extends GenericView<LayerModel> {

    scrollView: HTMLDivElement
    bounds: Rectangle
    zoom: number
    
    svgView: SVGElement

    private tool?: Tool
    toolModel?: ToolModel
    
    mouseButtonIsDown: boolean
    
    selectedLayer?: Layer
    decorationOverlay: SVGElement

layer?: SVGElement

    constructor() {
        super()
console.log("FigureEditor.constructor()")        
        this.mouseButtonIsDown = false
        
        this.scrollView = document.createElement("div")
        this.scrollView.style.overflow = "scroll"
        this.scrollView.style.background = "#fd8"
        this.scrollView.style.width="100%"
        this.scrollView.style.height="100%"
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
        this.svgView.style.backgroundColor = "rgb(255,128,0)"
        this.scrollView.appendChild(this.svgView)
        
        this.decorationOverlay = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.svgView.appendChild(this.decorationOverlay)
        
        this.attachShadow({mode: 'open'})
        this.shadowRoot!.appendChild(this.scrollView)
    }
    
    setTool(tool?: Tool) {
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
        } else
        if (model instanceof ToolModel) {
            if (this.toolModel === model)
                return
            this.toolModel = model
            this.toolModel.modified.add( () => {
                this.setTool(this.toolModel!.value)
            }, this)
            this.setTool(this.toolModel!.value)
            return
        } else {
            super.setModel(model as LayerModel)
        }
    }

    updateModel() {
        console.log("FigureEditor.updateModel()")
    }

    updateView() {
        console.log("FigureEditor.updateView()")
        if (this.model === undefined) {
            return
        }
        
        this.selectedLayer = this.model!.layers[0] as Layer

        let layer = document.createElementNS("http://www.w3.org/2000/svg", "g")
this.layer = layer
        for(let figure of this.model!.layers[0].data) {
            layer.appendChild((figure.getPath() as Path).svg)
            this.bounds.expandByRectangle(figure.bounds())
        }
        this.svgView.insertBefore(layer, this.decorationOverlay)

        setTimeout( () => {
            this.bounds.expandByPoint({x: this.scrollView.offsetWidth, y: this.scrollView.offsetHeight})
            this.svgView.style.width  = this.bounds.size.width+"px"
            this.svgView.style.height = this.bounds.size.height+"px"
            this.adjustBounds()
            this.scrollView.scrollLeft = -this.bounds.origin.x
            this.scrollView.scrollTop  = -this.bounds.origin.y
        }, 0)
    }

    adjustBounds(): void {
        if (!this.model)
            return

        let bounds = new Rectangle()
    
        // include the viewing ports center
        bounds.expandByPoint({
            x: this.scrollView.offsetWidth/this.zoom,
            y: this.scrollView.offsetHeight/this.zoom
        })

        // include all figures
        for(let item of this.model.layers[0]!.data)
            bounds.expandByRectangle(item.bounds())

        // include visible areas top, left corner
        bounds.expandByPoint({
            x: this.bounds.origin.x + this.scrollView.scrollLeft,
            y: this.bounds.origin.y + this.scrollView.scrollTop
        })

        // include visible areas bottom, right corner
        bounds.expandByPoint({
            x: this.bounds.origin.x + this.scrollView.scrollLeft + this.scrollView.clientWidth/this.zoom,
            y: this.bounds.origin.y + this.scrollView.scrollTop  + this.scrollView.clientHeight/this.zoom
        })
    
        let x = this.bounds.origin.x + this.scrollView.scrollLeft - bounds.origin.x
        let y = this.bounds.origin.y + this.scrollView.scrollTop  - bounds.origin.y
/*
console.log("adjustBounds after scrolling")
console.log("  old bounds   =("+editor.bounds.origin.x+","+editor.bounds.origin.y+","+editor.bounds.size.width+","+editor.bounds.size.height+")")
console.log("  new bounds   =("+bounds.origin.x+","+bounds.origin.y+","+bounds.size.width+","+bounds.size.height+")")
console.log("  scroll       =("+editor.window.scrollLeft+","+editor.window.scrollTop+")")
console.log("  scroll mapped=("+(editor.bounds.origin.x+editor.window.scrollLeft)+","+(editor.bounds.origin.y+editor.window.scrollTop)+")")
console.log("  new scroll   =("+x+","+y+")")
*/
        let zoomString=String(this.zoom)
        let scale="scale("+zoomString+" "+zoomString+")"
this.layer!.setAttributeNS("", "transform", "translate("+(-bounds.origin.x)+" "+(-bounds.origin.y)+") "+scale)
        this.decorationOverlay.setAttributeNS("", "transform", "translate("+(-bounds.origin.x)+" "+(-bounds.origin.y)+") "+scale)
        this.svgView.style.width  = (bounds.size.width  * this.zoom)+"px"
        this.svgView.style.height = (bounds.size.height * this.zoom)+"px"

        this.scrollView.scrollLeft = x
        this.scrollView.scrollTop  = y

        this.bounds = bounds
    }

    createEditorEvent(mouseEvent?: MouseEvent): EditorEvent {
        if (mouseEvent === undefined) {
            return { editor: this, x:0, y:0, shiftKey: false }
        }
    
        // (e.clientX-r.left, e.clientY-r.top) begins at the upper left corner of the editor window
        //                                     scrolling and origin are ignored
        let r = this.scrollView.getBoundingClientRect()
        let x = (mouseEvent.clientX+0.5 - r.left + this.scrollView.scrollLeft + this.bounds.origin.x)/this.zoom
        let y = (mouseEvent.clientY+0.5 - r.top  + this.scrollView.scrollTop  + this.bounds.origin.y)/this.zoom

        return { editor: this, x: x, y: y, shiftKey: mouseEvent.shiftKey }
    }
    
    transformSelection(matrix: Matrix): void {
        this.model!.transform(this.selectedLayer!.id, Tool.selection.figureIds(), matrix)
    }
}
//window.customElements.define("workflow-board", FigureEditor)