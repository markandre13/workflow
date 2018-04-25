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

import VectorPath from "./VectorPath"
//import {Point, Size, Rectangle} from "./geometry"
import * as dom from "toad.js/lib/dom"
import {
    Action, Signal, Model, Template, Window,
    RadioButtonBase, RadioStateModel, FatRadioButton,
    TextModel, HtmlModel, BooleanModel, NumberModel, TableModel, SelectionModel,
    TableEditMode,
    View, GenericView, TextView,
    bind, action,
    Dialog} from "toad.js"

import { AccountPreferences } from "./AccountPreferences"

import { ORB } from "corba.js"
import { Client_skel } from "../shared/workflow_skel"
import { Server } from "../shared/workflow_stub"
import { Point, Size, FigureModel } from "../shared/workflow_valuetype"
import * as valuetype from "../shared/workflow_valuetype"

export async function main(url: string) {

    let orb = new ORB()

    orb.register("Client", Client_impl)
    orb.registerValueType("Point", Point)
    orb.registerValueType("Size", Size)
    orb.registerValueType("Figure", Figure)
    orb.registerValueType("Rectangle", figure.Rectangle)
    orb.registerValueType("FigureModel", FigureModel)
    orb.registerValueType("Layer", Layer)
    orb.registerValueType("Board", Board)

    try {
        await orb.connect(url) // FIXME: provide callbacks on ORB like onerror, etc. via getters/setters to WebSocket
    }
    catch(error) {
        document.body.innerHTML = "could not connect to workflow server '"+url+"'. please try again later."
        return
    }
    Client_impl.server = new Server(orb)

    let session=""
    if (document.cookie) {
        let cookies = document.cookie.split(";")
        for(let i=0; i<cookies.length; ++i) {
            let str = cookies[i].trim()
            if (str.indexOf("session=") == 0) {
                session = str.substring(8, str.length)
                break
            }
        }
    }
    Client_impl.server.init(session)
}

class Client_impl extends Client_skel {
    static server?: Server
    server: Server

    constructor(orb: ORB) {
        super(orb)
        console.log("Client_impl.constructor()")
        if (Client_impl.server === undefined)
            throw Error("Client_impl.constructor(): no server")
        this.server = Client_impl.server
    }

    logonScreen(lifetime: number, disclaimer: string, inRemember: boolean, errorMessage: string): void {
        console.log("Client_impl.logonScreen()")

        let template = new Template("logonScreen")

        let logon = template.text("logon", "")
        let password = template.text("password", "")
        let remember = template.boolean("remember", inRemember)
        template.html("disclaimer", disclaimer)
        template.number("lifetime", lifetime, {})
        template.text("message", errorMessage)

        let logonAction = template.action("logon", () => {
            template.clear()
            this.server.logon(logon.value, password.value, remember.value)
        })

        let checkLogonCondition = function() {
            logonAction.enabled = logon.value.trim().length!=0 && password.value.trim().length!=0
        }
        checkLogonCondition()
        logon.modified.add(checkLogonCondition)
        password.modified.add(checkLogonCondition)
    
        dom.erase(document.body)
        dom.add(document.body, template.root)
    }

    homeScreen(cookie: string, avatar: string, email: string, fullname: string, board: Board): void {
        console.log("homeScreen()")

        let homeScreen = dom.instantiateTemplate('homeScreen');
        // msg.board.socket = msg.socket

        if (cookie.length !== 0) {
            document.cookie = cookie
        }
    
        let model = new HtmlModel(`
            <svg height="32" width="32">
                <defs>
                    <clipPath id="mask">
                        <rect x="0" y="0" width="32" height="32" rx="4" ry="4" />
                    </clipPath>
                </defs>
                <rect x="0" y="0" width="32" height="32" rx="4" ry="4" stroke="none" fill="#08f" />
                <image clip-path="url(#mask)" xlink:href="${avatar}" x="2" y="2" width="28px" height="28px" />
            </svg>`)
        bind("avatar", model)
    
        let user = {
            fullname: new TextModel(fullname),
            email: new TextModel(email)
        }
    
        action("account|preferences", () => {
            new AccountPreferences(user)
        })
        action("account|logout", () => {
        })
  
/*
        let toolbar = new Toolbar(dom.find(homeScreen, "#toolbar"), "toolbar");
        let editor = new FigureEditor(dom.find(homeScreen, "#board"), "board", msg.socket, this.classifyBoard(msg.board));

        editor.setTool(toolbar.state.getValue())
        toolbar.state.modified.add(function() {
            editor.setTool(toolbar.state.getValue())
        })

        this.editor = editor
*/
        bind("board", board)

        dom.erase(document.body);
        dom.add(document.body, homeScreen);
    }
}

export function pointPlusSize(point: Point, size: Size): Point {
    return {
        x: point.x+size.width,
        y: point.y+size.height
    }
}

class Rectangle extends valuetype.Rectangle {
  
  constructor(origin?: Point, size?: Size) {
    super(origin, size)
  }
  
  set(x: number, y: number, width: number, height: number) {
    this.origin.x = x
    this.origin.y = y
    this.size.width = width
    this.size.height = height
  }

  expandByPoint(p: Point): void {
    if (p.x < this.origin.x) {
      this.size.width += this.origin.x - p.x ; this.origin.x = p.x
    } else
    if (p.x > this.origin.x + this.size.width) {
      this.size.width = p.x - this.origin.x
    }
    if (p.y < this.origin.y) {
      this.size.height += this.origin.y - p.y ; this.origin.y = p.y
    } else
    if (p.y > this.origin.y + this.size.height) {
      this.size.height = p.y - this.origin.y
    }
  }
  
  expandByRectangle(r: Rectangle): void {
    this.expandByPoint(r.origin)
    this.expandByPoint(pointPlusSize(r.origin, r.size))
  }
}

class Board extends valuetype.Board
{
    modified: Signal
    constructor() {
        super()
        console.log("workflow.Board.constructor()")
        this.modified = new Signal()
    }
}

class Layer extends valuetype.Layer
{
    constructor() {
        super()
    }
    
    findFigureAt(point: Point): Figure | undefined {
        let mindist=Number.POSITIVE_INFINITY
        let nearestFigure: Figure | undefined
        for(let index = this.data.length-1; index >= 0; --index) {
            let figure = this.data[index]
            let d = Number(figure.distance(point))
            if (d<mindist) {
                mindist = d;
                nearestFigure = figure
            }
        }
        
        if (mindist>=Figure.FIGURE_RANGE) {
            return undefined
        }
        return nearestFigure
    }
    
}

class Figure extends valuetype.Figure
{
    public static readonly FIGURE_RANGE = 5.0
    public static readonly HANDLE_RANGE = 5.0

    constructor() {
        super()
        console.log("workflow.Figure.constructor()")
    }
}


namespace figure {

export class Rectangle extends valuetype.Rectangle
{
    svg?: SVGElement
    stroke: string
    fill: string
    
    constructor() {
        super()
        this.stroke = "#000"
        this.fill = "#f80"
        console.log("workflow.Board.constructor()")
    }
    
    distance(pt: Point): number {
        // FIXME: not final: RANGE and fill="none" need to be considered
        if (this.origin.x <= pt.x && pt.x < this.origin.x+this.size.width &&
            this.origin.y <= pt.y && pt.y < this.origin.y+this.size.height )
        {
            return -1.0; // even closer than 0
        }
        return Number.MAX_VALUE;
    }

    getHandlePosition(i: number): Point | undefined {
        switch(i) {
            case 0: return { x:this.origin.x,                 y:this.origin.y };
            case 1: return { x:this.origin.x+this.size.width, y:this.origin.y };
            case 2: return { x:this.origin.x+this.size.width, y:this.origin.y+this.size.height };
            case 3: return { x:this.origin.x,                 y:this.origin.y+this.size.height };
        }
        return undefined
    }

    setHandlePosition(handle: number, pt: Point): void {
        if (handle<0 || handle>3)
            throw Error("fuck")

        if (handle==0 || handle==3) {
            this.size.width  += this.origin.x - pt.x;
            this.origin.x=pt.x;
        } else {
            this.size.width  += pt.x - (this.origin.x+this.size.width)
        }
        if (handle==0 || handle==1) {
            this.size.height += this.origin.y - pt.y
            this.origin.y = pt.y
        } else {
            this.size.height += pt.y - (this.origin.y+this.size.height)
        }
    }
    
    createSVG(): SVGElement {
       if (this.svg)
         return this.svg
       this.svg = document.createElementNS("http://www.w3.org/2000/svg", "rect")
       this.update()
       return this.svg
    }

    update(): void {
        if (!this.svg)
          return

        let x0=this.origin.x,
            y0=this.origin.y,
            x1=this.origin.x+this.size.width,
            y1=this.origin.y+this.size.height
        if (x1<x0) [x0,x1] = [x1,x0];
        if (y1<y0) [y0,y1] = [y1,y0];
        
        this.svg.setAttributeNS("", "x", String(x0))
        this.svg.setAttributeNS("", "y", String(y0))
        this.svg.setAttributeNS("", "width", String(x1-x0))
        this.svg.setAttributeNS("", "height", String(y1-y0))
        this.svg.setAttributeNS("", "stroke", this.stroke)
        this.svg.setAttributeNS("", "fill", this.fill)
    }
}

}

class EditorEvent extends Point {
    editor: FigureEditor
    shiftKey: boolean
    constructor(editor: FigureEditor, opt:any) {
        super()
        this.editor = editor
        this.shiftKey = (opt||opt.shiftKey)?true:false
    }
}

class Tool {
    svgHandles: Array<SVGElement>

    mousedown(e: EditorEvent) { console.log("Tool.mousedown()") }
    mousemove(e: EditorEvent) { console.log("Tool.mousemove()") }
    mouseup(e: EditorEvent) { console.log("Tool.mouseup()") }
    
    constructor() {
        this.svgHandles = new Array<SVGElement>()
    }

    createSVGHandleRect(x: number, y: number): SVGElement {
        let handle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        handle.setAttributeNS("", "x", String(Math.round(x-2.5)+0.5)); // FIXME: just a hunch for nice rendering
        handle.setAttributeNS("", "y", String(Math.round(y-2.5)+0.5));
        handle.setAttributeNS("", "width", "5");
        handle.setAttributeNS("", "height", "5");
        handle.setAttributeNS("", "stroke", "rgb(79,128,255)");
        handle.setAttributeNS("", "fill", "#fff");
        // handle.setAttributeNS(null, 'cursor', 'crosshair');
        handle.setAttributeNS("", "style", "cursor:move");
        // handle.setAttributeNS(null, 'style', "cursor: url('cursor.svg'), auto");
        return handle;
    }
    
    select(editor: FigureEditor, figure: Figure): void {
/*
        this.editor = editor;
        this.rect = rect;
        this.handle = -1;
        this.handles = [];
*/
/*
        this.outline = Object.assign(new FRectangle(), this.rect) // FIXME: Figure.clone
        this.outline.svg = undefined
        this.outline.stroke = "rgb(79,128,255)"
        this.outline.fill   = "none"
        this.outline.move({x:-1, y:1})
        editor.decoLayer.appendChild(this.outline.createSVG())
*/    
        for(let i=0; ; ++i) {
            let h = figure.getHandlePosition(i)
            if (h === undefined)
                break
            let svgHandle = this.createSVGHandleRect(h.x-1, h.y+1)
            this.svgHandles.push(svgHandle)
            editor.decorationOverlay.appendChild(svgHandle)
        }
    }
}

class SelectTool extends Tool {
    constructor() {
        super()
    }
    mousedown(event: EditorEvent) {
        console.log("SelectTool.mousedown()")
        if (!event.editor.selectedLayer)
            return
        let figure = event.editor.selectedLayer.findFigureAt(event)
        console.log("found ", figure)
        if (figure !== undefined)
            this.select(event.editor, figure)
    }
}

class FigureEditor extends GenericView<Board> {

    scrollView: HTMLDivElement
    bounds: Rectangle
    zoom: number
    
    svgView: SVGElement

    tool?: Tool
    selectedLayer?: Layer
    decorationOverlay: SVGElement

    constructor() {
        super()
        
        this.tool = new SelectTool()
        
        this.scrollView = document.createElement("div")
        this.scrollView.style.overflow = "scroll"
        this.scrollView.style.background = "#fd8"
        this.scrollView.style.width="100%"
        this.scrollView.style.height="100%"
        this.scrollView.onmousedown = (mouseEvent: MouseEvent) => {
            if (this.tool)
                this.tool.mousedown(this.createEditorEvent(mouseEvent))
        }
        this.scrollView.onmousemove = (mouseEvent: MouseEvent) => {
            if (this.tool)
                this.tool.mousemove(this.createEditorEvent(mouseEvent))
        }
        this.scrollView.onmouseup = (mouseEvent: MouseEvent) => {
            if (this.tool)
                this.tool.mouseup(this.createEditorEvent(mouseEvent))
        }
        this.bounds = new Rectangle()
        this.zoom = 1.0
        
        this.svgView = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        this.scrollView.appendChild(this.svgView)
        
        this.decorationOverlay = document.createElementNS("http://www.w3.org/2000/svg", "g")
        this.svgView.appendChild(this.decorationOverlay)
        
        this.attachShadow({mode: 'open'})
        this.shadowRoot!.appendChild(this.scrollView)
    }
    updateModel() {
        console.log("BoardView.updateModel()")
    }

    updateView() {
        console.log("BoardView.updateView()")
        if (this.model === undefined) {
            return
        }
        
        this.selectedLayer = this.model!.layers[0]

        let layer = document.createElementNS("http://www.w3.org/2000/svg", "g")
        for(let figure of this.model!.layers[0].data) {
            layer.appendChild(figure.createSVG())
        }
        this.svgView.insertBefore(layer, this.decorationOverlay)
    }

    createEditorEvent(e: MouseEvent): EditorEvent {
    
        // (e.clientX-r.left, e.clientY-r.top) begins at the upper left corner of the editor window
        //                                     scrolling and origin are ignored
    
        let r = this.scrollView.getBoundingClientRect()

        let x = (e.clientX+0.5 - r.left + this.scrollView.scrollLeft + this.bounds.origin.x)/this.zoom
        let y = (e.clientY+0.5 - r.top  + this.scrollView.scrollTop  + this.bounds.origin.y)/this.zoom

        return {editor: this, x: x, y: y, shiftKey: e.shiftKey}
  }

}
window.customElements.define("workflow-board", FigureEditor)
