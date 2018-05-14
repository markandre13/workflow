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

import * as dom from "toad.js/lib/dom"
import {
    Matrix,
    Action, Signal, Model, Template, Window,
    RadioButtonBase, RadioStateModel, FatRadioButton,
    TextModel, HtmlModel, BooleanModel, NumberModel, TableModel, SelectionModel,
    TableEditMode,
    View, GenericView, TextView,
    bind, action,
    Dialog} from "toad.js"

import { AccountPreferences } from "./AccountPreferences"

import { ORB } from "corba.js"
import * as iface from "../shared/workflow"
import * as skel from "../shared/workflow_skel"
import * as stub from "../shared/workflow_stub"
import { Point, Size, FigureModel } from "../shared/workflow_valuetype"
import * as valuetype from "../shared/workflow_valuetype"

export function pointPlusSize(point: Point, size: Size): Point {
    return {
        x: point.x+size.width,
        y: point.y+size.height
    }
}

export function pointMinusPoint(a: Point, b: Point): Point {
    return new Point({
        x: a.x - b.x,
        y: a.y - b.y
    })
}

class Rectangle extends valuetype.Rectangle {
  
    constructor(rectangle?: valuetype.Rectangle) {
        super(rectangle)
    }
  
    set(x: number, y: number, width: number, height: number): Rectangle {
        this.origin.x = x
        this.origin.y = y
        this.size.width = width
        this.size.height = height
        return this
    }

    expandByPoint(p: Point): Rectangle {
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
        return this
    }
  
    expandByRectangle(r: valuetype.Rectangle): Rectangle {
        if (this.size.width === 0 && this.size.height === 0) {
            this.origin.x = r.origin.x
            this.origin.y = r.origin.y
            this.size.width = r.size.width
            this.size.height = r.size.height
        } else {
            this.expandByPoint(r.origin)
            this.expandByPoint(pointPlusSize(r.origin, r.size))
        }
        return this
    }
    
    inflate(expansion: number): Rectangle {
        this.origin.x -= expansion
        this.origin.y -= expansion
        expansion *= 2.0
        this.size.width += expansion
        this.size.height += expansion
        return this
    }
}

export async function main(url: string) {

    let orb = new ORB()
//    orb.debug = 1

    orb.register("Client", Client_impl)
    orb.registerStub("Project", stub.Project)
    orb.registerStub("Board", stub.Board)
    orb.registerValueType("Point", Point)
    orb.registerValueType("Size", Size)
    orb.registerValueType("Rectangle", Rectangle)
    orb.registerValueType("Figure", Figure)
    orb.registerValueType("figure::Rectangle", figure.Rectangle)
    orb.registerValueType("FigureModel", FigureModel)
    orb.registerValueType("Layer", Layer)
    orb.registerValueType("BoardData", BoardData)

    try {
        await orb.connect(url) // FIXME: provide callbacks on ORB like onerror, etc. via getters/setters to WebSocket
    }
    catch(error) {
        document.body.innerHTML = "could not connect to workflow server '"+url+"'. please try again later."
        return
    }

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

    Client_impl.server = new stub.Server(orb)
    Client_impl.server.init(session)
}

class Client_impl extends skel.Client {
    static server?: stub.Server
    server: stub.Server

    constructor(orb: ORB) {
        super(orb)
        console.log("Client_impl.constructor()")
        if (Client_impl.server === undefined)
            throw Error("Client_impl.constructor(): no server")
        this.server = Client_impl.server
    }

    async logonScreen(lifetime: number, disclaimer: string, inRemember: boolean, errorMessage: string) {
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

    async homeScreen(cookie: string, avatar: string, email: string, fullname: string) {
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
    
        action("account|preferences", () => {
            let user = {
                fullname: new TextModel(fullname),
                email: new TextModel(email)
            }
            new AccountPreferences(user)
        })
        action("account|logout", () => {
        })
  
        // bind("toolselector", toolselector)
        let project = await this.server.getProject(1)
        let board = await project.getBoard(1)
        
        let boarddata = await board.getData() as BoardData // FIXME: getData should also set the listener so that we won't skip a beat
        boarddata.board = board

        let boardListener = new BoardListener_impl(this.orb, boarddata)
        board.addListener(boardListener)

        bind("board", boarddata)

        dom.erase(document.body);
        dom.add(document.body, homeScreen);
    }
}

class Layer extends valuetype.Layer
{
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
    
//    translateFigures(delta: Point) {
//    }
}

abstract class Figure extends valuetype.Figure
{
    public static readonly FIGURE_RANGE = 5.0
    public static readonly HANDLE_RANGE = 5.0
    
    constructor() {
        super()
        console.log("workflow.Figure.constructor()")
    }
}

declare global {
  interface SVGPathElement {
    setPathData(data: any): void
    getPathData(): any
  }
}

export class Path
{
    path: any
    svg: SVGPathElement
  
    constructor() {
        this.path = [];
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "path") as SVGPathElement;
    }

    clear() {
        this.path = []
    }

    update() {
        this.svg.setPathData(this.path)
    }

    move(point: Point) {
        this.path.push({type: 'M', values: [point.x, point.y]})
    }

    line(point: Point) {
        this.path.push({type: 'L', values: [point.x, point.y]})
    }

    close() {
        this.path.push({type: 'Z'})
    }
    
    appendRect(rectangle: any) {
        this.move(rectangle.origin)
        this.line({x: rectangle.origin.x + rectangle.size.width, y: rectangle.origin.y                         })
        this.line({x: rectangle.origin.x + rectangle.size.width, y: rectangle.origin.y + rectangle.size.height })
        this.line({x: rectangle.origin.x                       , y: rectangle.origin.y + rectangle.size.height })
        this.close()
    }
    
    // relativeMove
    // relativeLine
    // relativeCurve
    // append(path)
    transform(matrix: Matrix) {
        for(let segment of this.path) {
            switch(segment.type) {
                case 'M':
                case 'L':
                    segment.values = matrix.transformArrayPoint(segment.values)
                    break
            }
        }
    }

    translate(point: Point) {
        this.transform(new Matrix({
            m11: 1.0, m12: 0.0,
            m21: 0.0, m22: 1.0,
            tX: point.x, tY: point.y
        }))
    }
}

namespace figure {

export class Rectangle extends valuetype.figure.Rectangle
{
    path?: Path
    stroke: string
    fill: string
    
    constructor() {
        super()
        this.stroke = "#000"
        this.fill = "#f80"
    }
    
    translate(delta: Point) {
        if (this.path === undefined)
            return
        this.path.translate(delta)
        this.path.update()
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

    bounds(): valuetype.figure.Rectangle {
        return this
    }
    
    getHandlePosition(i: number): Point | undefined {
        switch(i) {
            case 0: return { x:this.origin.x,                 y:this.origin.y }
            case 1: return { x:this.origin.x+this.size.width, y:this.origin.y }
            case 2: return { x:this.origin.x+this.size.width, y:this.origin.y+this.size.height }
            case 3: return { x:this.origin.x,                 y:this.origin.y+this.size.height }
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
       if (this.path)
           return this.path.svg
       this.path = new Path()
       this.update()
       return this.path.svg
    }

    update(): void {
        if (!this.path)
          return
        
        this.path.clear()
        this.path.appendRect(this)
        this.path.update()

        this.path.svg.setAttributeNS("", "stroke", this.stroke)
        this.path.svg.setAttributeNS("", "fill", this.fill)
    }

}

} // namespace figure

class EditorEvent extends Point {
    editor: FigureEditor
    shiftKey: boolean
    constructor(editor: FigureEditor, opt:any) {
        super()
        this.editor = editor
        this.shiftKey = (opt||opt.shiftKey)?true:false
    }
}

class FigureSelection {
    selection: Set<Figure>
    
    constructor() {
        this.selection = new Set<Figure>()
    }
    
    add(figure: Figure): void {
        this.selection.add(figure)
    }
    
    has(figure: Figure): boolean {
        return this.selection.has(figure)
    }
    
    empty(): boolean {
        return this.selection.size === 0
    }

    clear(): void {
        this.selection.clear()
    }
    
    figureIds(): Array<number> {
        let result = new Array<number>()
        for(let figure of this.selection)
            result.push(figure.id)
        return result
    }
}

class Tool {
    static selection = new FigureSelection()

    svgHandles: Map<Figure, Array<Path>>
    svgOutlines: Map<Figure, SVGElement>

    mousedown(e: EditorEvent) { console.log("Tool.mousedown()") }
    mousemove(e: EditorEvent) { console.log("Tool.mousemove()") }
    mouseup(e: EditorEvent) { console.log("Tool.mouseup()") }
    
    constructor() {
        this.svgHandles = new Map<Figure, Array<Path>>()
        this.svgOutlines = new Map<Figure, SVGElement>()
    }

    static createOutlineCopy(svg: SVGElement): SVGElement {
        svg = svg.cloneNode(true) as SVGElement
        svg.setAttributeNS("", "stroke", "rgb(79,128,255)")
        svg.setAttributeNS("", "fill", "none")

console.log(svg.nodeName) // rect

        // FIXME: if it's a group, iterate over all elements
        // FIXME: translate outline by (-1, +1)
        return svg
    }
    
    createOutline(editor: FigureEditor, figure: Figure): void {
        if (this.svgOutlines.has(figure))
            return
        let svgOutline = Tool.createOutlineCopy(figure.createSVG())
        editor.decorationOverlay.appendChild(svgOutline)
        this.svgOutlines.set(figure, svgOutline)
    }
    
    destroyOutline(editor: FigureEditor, figure: Figure): void {
        let svgOutline = this.svgOutlines.get(figure)
        if (svgOutline === undefined)
            return
        editor.decorationOverlay.removeChild(svgOutline)
        this.svgOutlines.delete(figure)
    }
    
    createHandleDecorations(editor: FigureEditor, figure: Figure): void {
        let handles = this.svgHandles.get(figure)
        if (handles === undefined) {
            handles = new Array<Path>()
            this.svgHandles.set(figure, handles)
        } // FIXME: else what?
        for(let i=0; ; ++i) {
            let h = figure.getHandlePosition(i)
            if (h === undefined)
                break
            let path = new Path()
            path.appendRect({
                origin: {
                    x: Math.round(h.x-2.5)+0.5-1,
                    y: Math.round(h.y-2.5)+0.5+1
                },
                size: { width: 5, height: 5 }
            })
            path.update()
            path.svg.setAttributeNS("", "stroke", "rgb(79,128,255)")
            path.svg.setAttributeNS("", "fill", "#fff")
            switch(i) {
                case 0:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-nw.svg) 5 7, move")
                    break
                case 1:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-ne.svg) 5 7, move")
                    break
                case 2:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-se.svg) 5 7, move")
                    break
                case 3:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-sw.svg) 5 7, move")
                    break
            }
            editor.decorationOverlay.appendChild(path.svg)
        }
    }
    
    destroyHandleDecorations(editor: FigureEditor, figure: Figure): void {
        let handles = this.svgHandles.get(figure)
        if (handles === undefined)
            return
        for(let path of handles)
            editor.decorationOverlay.removeChild(path.svg)
        this.svgHandles.delete(figure)
    }
}

class SelectTool extends Tool {
    svgMarquee?: SVGElement
    boundary: Rectangle
    decoration: Array<Path>
    mouseDownAt?: Point

    constructor() {
        super()
        this.boundary = new Rectangle()
        this.decoration = new Array<Path>()
    }

    mousedown(event: EditorEvent) {
        console.log("SelectTool.mousedown()")
            
        this.mouseDownAt = event

        // mouse down on handle?
        // ...

        let figure = event.editor.selectedLayer!.findFigureAt(event)
        
        if (figure === undefined) {
            this.clearDecoration(event.editor)
            for(let figure of Tool.selection.selection)
                this.destroyOutline(event.editor, figure)
            Tool.selection.clear()
            return
        }
        
        if (Tool.selection.has(figure))
            return
        
        if (!event.shiftKey) {
            this.clearDecoration(event.editor)
            for(let figure of Tool.selection.selection)
                this.destroyOutline(event.editor, figure)
            Tool.selection.clear()
        }
            
        Tool.selection.add(figure)

        this.createOutline(event.editor, figure)
        this.updateBoundary()
        this.updateDecoration(event.editor)
    }

    mousemove(event: EditorEvent) {
        console.log("SelectTool.mousemove()")

        if (Tool.selection.empty() && this.svgMarquee === undefined) {
            this.svgMarquee = document.createElementNS("http://www.w3.org/2000/svg", "rect")
            this.svgMarquee.setAttributeNS("", 'stroke', 'rgb(79,128,255)')
            this.svgMarquee.setAttributeNS("", 'fill', 'rgba(79,128,255,0.2)')
            event.editor.decorationOverlay.appendChild(this.svgMarquee)
        }
        if (this.svgMarquee) {
            let x0=this.mouseDownAt!.x, y0=this.mouseDownAt!.y, x1=event.x, y1=event.y
            if (x1<x0) [x0,x1] = [x1,x0]
            if (y1<y0) [y0,y1] = [y1,y0]
            this.svgMarquee.setAttributeNS("", "x", String(Math.round(x0)+0.5)) // FIXME: just a hunch for nice rendering
            this.svgMarquee.setAttributeNS("", "y", String(Math.round(y0)+0.5))
            this.svgMarquee.setAttributeNS("", "width", String(Math.round(x1-x0)))
            this.svgMarquee.setAttributeNS("", "height", String(Math.round(y1-y0)))
            return
        }
        
        // mouse move for handle
        // ...
//        Client_impl.server!.translateFigures(/*selection.selection,*/ new Point(11, 38))
//        event.editor.selectedLayer.translateFigures(new Point(47, 11))

        let delta = pointMinusPoint(event, this.mouseDownAt!)
        for(let decorator of this.decoration) {
            decorator.translate(delta)
            decorator.update()
        }
        event.editor.translateSelection(delta)
        this.mouseDownAt = event
        
/*        
        // translate selection (figures, handles, outline)
        let dx = event.x-this.x;
        let dy = event.y-this.y;
    
        // translate selected figures
        for(let f of this.figure)
            event.editor.activeLayer.sendMoveFigureMessage(f, dx, dy);
    
        // translate the handles (& outline)
        for(let h of this.handler) {
            h.move({x: dx, y: dy});
        }
*/
    }

    mouseup(event: EditorEvent) {
        console.log("SelectTool.mouseup()")
        this.mouseDownAt = undefined
        if (!event.editor.selectedLayer)
            return
        if (this.svgMarquee) {
            event.editor.decorationOverlay.removeChild(this.svgMarquee)
            this.svgMarquee = undefined
        }
    }
    
    /*******************************************************************
     *                                                                 *
     *                           H A N D L E                           *
     *                                                                 *
     *******************************************************************/
    updateBoundary() {
        this.boundary = new Rectangle()
        for(let figure of Tool.selection.selection) {
            this.boundary.expandByRectangle(figure.bounds())
        }
    }
    
    clearDecoration(editor: FigureEditor) {
        for(let decorator of this.decoration) {
            editor.decorationOverlay.removeChild(decorator.svg)
        }
        this.decoration.length = 0
    }
    
    updateDecoration(editor: FigureEditor) {
        this.clearDecoration(editor)

        let path = new Path()
        let rectangle = new Rectangle(this.boundary)
        rectangle.inflate(1.0)
        rectangle.origin.x    = Math.round(rectangle.origin.x-0.5)+0.5
        rectangle.origin.y    = Math.round(rectangle.origin.y-0.5)+0.5
        rectangle.size.width  = Math.round(rectangle.size.width)
        rectangle.size.height = Math.round(rectangle.size.height)
        path.appendRect(rectangle)
        path.update()
        path.svg.setAttributeNS("", "stroke", "rgb(79,128,255)")
        path.svg.setAttributeNS("", "fill", "none")
        editor.decorationOverlay.appendChild(path.svg)
        this.decoration.push(path)
    
        for(let i=0; i<16; ++i) {
            let path = new Path()
            path.appendRect(this.getBoundaryHandle(i))
            if (i<8) {
                path.svg.setAttributeNS("", "stroke", "rgb(79,128,255)")
                path.svg.setAttributeNS("", "fill", "#fff")
            } else {
                path.svg.setAttributeNS("", "stroke", "rgba(0,0,0,0)")
                path.svg.setAttributeNS("", "fill", "rgba(0,0,0,0)")
            }
            switch(i) {
                case 0:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-nw.svg) 6 6, move")
                    break
                case 1:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-n.svg) 4 7, move")
                    break
                case 2:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-ne.svg) 6 6, move")
                    break
                case 3:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-e.svg) 7 4, move")
                    break
                case 4:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-se.svg) 6 6, move")
                    break
                case 5:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-s.svg) 4 7, move")
                    break
                case 6:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-sw.svg) 6 6, move")
                    break
                case 7:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-w.svg) 7 4, move")
                    break
                case 8:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-nw.svg) 5 5, move")
                    break
                case 9:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-n.svg) 7 2, move")
                    break
                case 10:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-ne.svg) 8 5, move")
                    break
                case 11:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-e.svg) 5 7, move")
                    break
                case 12:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-se.svg) 8 8, move")
                    break
                case 13:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-s.svg) 7 5, move")
                    break
                case 14:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-sw.svg) 5 8, move")
                    break
                case 15:
                    path.svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-w.svg) 2 7, move")
                    break
            }
            path.update()
            editor.decorationOverlay.appendChild(path.svg)
            this.decoration.push(path)
        }
    }
     
    getBoundaryHandle(handle: number): Rectangle {
        const s = 5.0,
              x0 = this.boundary.origin.x - s/2.0,
              y0 = this.boundary.origin.y - s/2.0,
              x1 = this.boundary.origin.x + this.boundary.size.width - s/2.0,
              y1 = this.boundary.origin.y + this.boundary.size.height - s/2.0,
              w = x1 - x0,
              h = y1 - y0

        let r = new Rectangle()
        switch(handle) {
            case  0: r.set(x0    , y0     , s, s); break;
            case  1: r.set(x0+w/2, y0     , s, s); break;
            case  2: r.set(x0+w  , y0     , s, s); break;
            case  3: r.set(x0+w  , y0+h/2 , s, s); break;
            case  4: r.set(x0+w  , y0+h   , s, s); break;
            case  5: r.set(x0+w/2, y0+h   , s, s); break;
            case  6: r.set(x0    , y0+h   , s, s); break;
            case  7: r.set(x0    , y0+h/2 , s, s); break;

            case  8: r.set(x0    -s, y0    -s, s, s); break;
            case  9: r.set(x0+w/2  , y0    -s, s, s); break;
            case 10: r.set(x0+w  +s, y0    -s, s, s); break;
            case 11: r.set(x0+w  +s, y0+h/2  , s, s); break;
            case 12: r.set(x0+w  +s, y0+h  +s, s, s); break;
            case 13: r.set(x0+w/2  , y0+h  +s, s, s); break;
            case 14: r.set(x0    -s, y0+h  +s, s, s); break;
            case 15: r.set(x0    -s, y0+h/2  , s, s); break;
        }
        r.origin.x = Math.round(r.origin.x-0.5)+0.5
        r.origin.y = Math.round(r.origin.y-0.5)+0.5
        return r
    }
}

class BoardData extends valuetype.BoardData
{
    modified: Signal
    board?: stub.Board

    constructor() {
        super()
        this.modified = new Signal()
        console.log("BoardData.constructor()")
    }
    
    // FIXME: too many translate functions to do stuff
    translate(layerID: number, indices: Array<number>, delta: Point): void {
        this.board!.translate(layerID, indices, delta)
    }
}

class BoardListener_impl extends skel.BoardListener {
    boarddata: BoardData

    constructor(orb: ORB, boarddata: BoardData) {
        super(orb)
        this.boarddata = boarddata
    }

    async translate(layerID: number, figureIDs: Array<number>, delta: Point) {
//        console.log("BoardListener_impl.translate(", figureIDs, ", ", delta, ")")
        // FIXME: too many loops
        for(let layer of this.boarddata.layers) {
            if (layer.id === layerID) {
                for(let id of figureIDs) {
                    for(let figure of layer.data) {
                        if (id === figure.id) {
                            figure.translate(delta)
                        }
                    }
                }
            }
        }
    }
}

class FigureEditor extends GenericView<BoardData> {

    scrollView: HTMLDivElement
    bounds: Rectangle
    zoom: number
    
    svgView: SVGElement

    tool?: Tool
    mouseButtonIsDown: boolean
    
    selectedLayer?: Layer
    decorationOverlay: SVGElement

layer?: SVGElement

    constructor() {
        super()
        
        this.tool = new SelectTool()
        this.mouseButtonIsDown = false
        
        this.scrollView = document.createElement("div")
        this.scrollView.style.overflow = "scroll"
        this.scrollView.style.background = "#fd8"
        this.scrollView.style.width="100%"
        this.scrollView.style.height="100%"
        this.scrollView.onmousedown = (mouseEvent: MouseEvent) => {
            this.mouseButtonIsDown = true
            if (this.tool && this.selectedLayer)
                this.tool.mousedown(this.createEditorEvent(mouseEvent))
        }
        this.scrollView.onmousemove = (mouseEvent: MouseEvent) => {
            if (!this.mouseButtonIsDown)
                return
            if (this.tool && this.selectedLayer)
                this.tool.mousemove(this.createEditorEvent(mouseEvent))
        }
        this.scrollView.onmouseup = (mouseEvent: MouseEvent) => {
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
    updateModel() {
        console.log("BoardView.updateModel()")
    }

    updateView() {
        console.log("BoardView.updateView()")
        if (this.model === undefined) {
            return
        }
        
        this.selectedLayer = this.model!.layers[0] as Layer

        let layer = document.createElementNS("http://www.w3.org/2000/svg", "g")
this.layer = layer
        for(let figure of this.model!.layers[0].data) {
            layer.appendChild(figure.createSVG())
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
/*
    let editor = this;
    let board  = this.board
    let svg    = this.svg
    let layer  = this.layer
*/    
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

    createEditorEvent(e: MouseEvent): EditorEvent {
    
        // (e.clientX-r.left, e.clientY-r.top) begins at the upper left corner of the editor window
        //                                     scrolling and origin are ignored
    
        let r = this.scrollView.getBoundingClientRect()

        let x = (e.clientX+0.5 - r.left + this.scrollView.scrollLeft + this.bounds.origin.x)/this.zoom
        let y = (e.clientY+0.5 - r.top  + this.scrollView.scrollTop  + this.bounds.origin.y)/this.zoom

        return {editor: this, x: x, y: y, shiftKey: e.shiftKey}
    }
    
    translateSelection(delta: Point): void {
        this.model!.translate(this.selectedLayer!.id, Tool.selection.figureIds(), delta)
    }
}
window.customElements.define("workflow-board", FigureEditor)
