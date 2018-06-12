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
    Action, Signal, Model, Template, Window,
    RadioButtonBase, RadioStateModel, FatRadioButton,
    TextModel, HtmlModel, BooleanModel, NumberModel, TableModel, SelectionModel,
    TableEditMode,
    View, GenericView, TextView,
    bind, action,
    Dialog
} from "toad.js"

import { AccountPreferences } from "./AccountPreferences"

import { ORB } from "corba.js"
import * as iface from "../shared/workflow"
import * as skel from "../shared/workflow_skel"
import * as stub from "../shared/workflow_stub"
import * as valueimpl from "../shared/workflow_valueimpl"
import { FigureModel } from "../shared/workflow_valueimpl"
import * as valuetype from "../shared/workflow_valuetype"

import * as geometry from "./geometry"
import { Point, Size, Rectangle, Matrix } from "./geometry"

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

export function pointPlusPoint(a: Point, b: Point): Point {
    return new Point({
        x: a.x + b.x,
        y: a.y + b.y
    })
}

export function pointMultiplyNumber(a: Point, b: number): Point {
    return new Point({
        x: a.x * b,
        y: a.y * b
    })
}

export function pointMinus(a: Point) {
    return new Point({
        x: -a.x,
        y: -a.y
    })
}

export async function main(url: string) {

    let orb = new ORB()
//    orb.debug = 1

    orb.register("Client", Client_impl)
    orb.registerStub("Project", stub.Project)
    orb.registerStub("Board", stub.Board)

    ORB.registerValueType("Point", Point)
    ORB.registerValueType("Size", Size)
    ORB.registerValueType("Matrix", Matrix)
    ORB.registerValueType("Rectangle", Rectangle)

    ORB.registerValueType("figure.Figure", figure.Figure)
    ORB.registerValueType("figure.Rectangle", figure.Rectangle)
    ORB.registerValueType("figure.Group", figure.Transform)
    ORB.registerValueType("figure.Transform", figure.Transform)

    ORB.registerValueType("FigureModel", FigureModel)
    ORB.registerValueType("Layer", Layer)
    ORB.registerValueType("BoardData", BoardData)

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

declare global {
  interface SVGPathElement {
    setPathData(data: any): void
    getPathData(): any
  }
}

namespace figure {

export abstract class Figure extends valueimpl.Figure
{
    public static readonly FIGURE_RANGE = 5.0
    public static readonly HANDLE_RANGE = 5.0
    
    constructor(init?: Partial<Figure>) {
        super(init)
        console.log("workflow.Figure.constructor()")
    }
}

export abstract class Shape extends Figure implements valuetype.figure.Shape
{
    origin!: Point
    size!: Size

    constructor(init?: Partial<Shape>) {
        super(init)
        valuetype.figure.initShape(this, init)
    }
}

export class Rectangle extends Shape implements valuetype.figure.Rectangle
{
    path?: Path
    stroke: string
    fill: string
    
    constructor(init?: Partial<Rectangle>) {
        super(init)
        valuetype.figure.initRectangle(this, init)
        this.stroke = "#000"
        this.fill = "#f80"
    }
    
    translate(delta: Point) { // FIXME: store
        if (this.path === undefined)
            return
        this.path.translate(delta)
        this.path.update()
    }

    transform(transform: Matrix): boolean {
        if (!transform.isOnlyTranslateAndScale())
            return false
        this.origin = transform.transformPoint(this.origin)
        this.size   = transform.transformSize(this.size)
        this.update()
        return true
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

    bounds(): geometry.Rectangle {
        return new geometry.Rectangle(this)
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
    
    getPath(): Path {
       if (this.path === undefined) {
           this.path = new Path()
           this.update()
       }
       return this.path
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

export class Group extends Figure implements valuetype.figure.Group
{
    children!: Array<Figure>

    constructor(init?: Partial<Group>) {
        super(init)
        valuetype.figure.initGroup(this, init)
    }

    translate(delta: Point) { // FIXME: store
        throw Error("not yet implemented")
    }

    transform(transform: Matrix): boolean {
        return true
    }
    
    distance(pt: Point): number {
        throw Error("not yet implemented")
    }

    bounds(): geometry.Rectangle {
        throw Error("not yet implemented")
    }
    
    getHandlePosition(i: number): Point | undefined {
        return undefined
    }

    setHandlePosition(handle: number, pt: Point): void {
    }
    
    getPath(): Path {
       throw Error("not yet implemented")
    }

    update(): void {
    }
}

export class Transform extends Group implements valuetype.figure.Transform {
    path?: Path
    matrix!: Matrix

    constructor(init?: Partial<Transform>) {
        super(init)
        valuetype.figure.initTransform(this, init)
    }

    translate(delta: Point) { // FIXME: store
        this.matrix.translate(delta)
        if (this.path) {
            this.path.translate(delta)
            this.path.update()
        }
    }

    transform(transform: Matrix): boolean {
        this.matrix.append(transform)
        if (this.path) {
            this.path.transform(transform)
            this.path.update()
        }
        return true
    }
    
    distance(pt: Point): number {
        let m = new Matrix(this.matrix)
        m.invert()
        pt = m.transformPoint(pt)
        return this.children[0].distance(pt)
    }

    bounds(): geometry.Rectangle {
        let path = new Path()
        path.appendRect(this.children[0].bounds())
        path.transform(this.matrix)
        return path.bounds()
    }
    
    getHandlePosition(i: number): Point | undefined {
        return undefined
    }

    setHandlePosition(handle: number, pt: Point): void {
    }
    
    getPath(): Path {
       if (this.path === undefined) {
           let path = this.children[0]!.getPath() as Path
           this.path = new Path(path)
           this.path.transform(this.matrix)
           this.path.update()
       }
       return this.path
    }

    update(): void {
    }
}

} // namespace figure

type Figure = figure.Figure
const Figure = figure.Figure

class Layer extends valueimpl.Layer
{
    findFigureAt(point: Point): Figure | undefined {
        let mindist=Number.POSITIVE_INFINITY
        let nearestFigure: figure.Figure | undefined
        for(let index = this.data.length-1; index >= 0; --index) {
            let figure = this.data[index]
            let d = Number(figure.distance(point))
            if (d < mindist) {
                mindist = d;
                nearestFigure = figure
            }
        }
        
        if (mindist >= Figure.FIGURE_RANGE) {
            return undefined
        }
        return nearestFigure
    }
    
//    translateFigures(delta: Point) {
//    }
}

export class Path
{
    path: any
    svg: SVGPathElement
  
    constructor(path?: Path) {
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "path") as SVGPathElement;
        if (path === undefined) {
            this.path = []
        } else {
            this.path = [] // FIXME: improve
            for(let entry of path.path) {
                switch(entry.type) {
                    case "M":
                        this.path.push({type: 'M', values: [entry.values[0], entry.values[1]]})
                        break
                    case "L":
                        this.path.push({type: 'L', values: [entry.values[0], entry.values[1]]})
                        break
                    case "Z":
                        this.path.push({type: 'Z'})
                    
                }
            }
        }
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
    
    bounds(): Rectangle {
        let isFirstPoint = true
        let rectangle = new Rectangle()
        for(let segment of this.path) {
            switch(segment.type) {
                case 'M':
                case 'L':
                    if (isFirstPoint) {
                        rectangle.origin.x = segment.values[0]
                        rectangle.origin.y = segment.values[1]
                        isFirstPoint = false
                    } else {
                        rectangle.expandByPoint(new Point({x: segment.values[0], y: segment.values[1]}))
                    }
                    break
            }
        }
        return rectangle
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

    handles: Map<Figure, Array<Path>>
    outlines: Map<Figure, Path>

    mousedown(e: EditorEvent) { console.log("Tool.mousedown()") }
    mousemove(e: EditorEvent) { console.log("Tool.mousemove()") }
    mouseup(e: EditorEvent) { console.log("Tool.mouseup()") }
    
    constructor() {
        this.handles = new Map<Figure, Array<Path>>()
        this.outlines = new Map<Figure, Path>()
    }

    static createOutlineCopy(aPath: Path): Path {
        let path = new Path(aPath)
        path.update()
        path.svg.setAttributeNS("", "stroke", "rgb(79,128,255)")
        path.svg.setAttributeNS("", "fill", "none")
        // FIXME: if it's a group, iterate over all elements
        // FIXME: translate outline by (-1, +1)
        return path
    }
    
    createOutline(editor: FigureEditor, figure: Figure): void {
        if (this.outlines.has(figure))
            return
        let outline = Tool.createOutlineCopy(figure.getPath() as Path)
        editor.decorationOverlay.appendChild(outline.svg)
        this.outlines.set(figure, outline)
    }
    
    destroyOutline(editor: FigureEditor, figure: Figure): void {
        let outline = this.outlines.get(figure)
        if (outline === undefined)
            return
        editor.decorationOverlay.removeChild(outline.svg)
        this.outlines.delete(figure)
    }
    
    createHandleDecorations(editor: FigureEditor, figure: Figure): void {
        let handles = this.handles.get(figure)
        if (handles === undefined) {
            handles = new Array<Path>()
            this.handles.set(figure, handles)
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
        let handles = this.handles.get(figure)
        if (handles === undefined)
            return
        for(let path of handles)
            editor.decorationOverlay.removeChild(path.svg)
        this.handles.delete(figure)
    }
}

enum State {
    NONE,
    DRAG_MARQUEE,
    MOVE_HANDLE,
    MOVE_SELECTION
}

class SelectTool extends Tool {
    state: State

    boundary: Rectangle
    decoration: Array<Path>
    mouseDownAt?: Point

    svgMarquee?: SVGElement
    
    selectedHandle: number
    handleStart: Point
    oldBoundary: Rectangle
    transformation: Matrix

    rotationCenter: Point
    rotationStartDirection: number

    constructor() {
        super()
        this.state = State.NONE
        this.boundary = new Rectangle()
        this.decoration = new Array<Path>()
        
        this.selectedHandle = 0
        this.handleStart = new Point()
        this.oldBoundary = new Rectangle()
        this.transformation = new Matrix()
        this.rotationCenter = new Point()
        this.rotationStartDirection = 0
    }

    mousedown(event: EditorEvent) {
        console.log("SelectTool.mousedown()")
            
        this.mouseDownAt = event

        if (this.downHandle(event)) {
            console.log("down handle")
            return
        }
        console.log("not handle")

        this.transformation.identity()

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
        switch(this.state) {
            case State.MOVE_HANDLE:
                this.moveHandle(event)
                return
        }

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
        this.transformation.identity()
        this.transformation.translate(delta)
        this.updateOutline(event.editor)
        event.editor.transformSelection(this.transformation)
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
        switch(this.state) {
            case State.DRAG_MARQUEE:
                break
            case State.MOVE_HANDLE:
                this.moveHandle(event)
                this.stopHandle(event)
                return
            case State.MOVE_SELECTION:
                break
        }
        this.mouseDownAt = undefined
        if (!event.editor.selectedLayer)
            return
        if (this.svgMarquee) {
            event.editor.decorationOverlay.removeChild(this.svgMarquee)
            this.svgMarquee = undefined
        }
    }

    updateOutline(editor: FigureEditor) {
        // FIXME: improve
        let outlines = this.outlines
        this.outlines = new Map<Figure, Path>()
        for(let [figure, path] of outlines) {
            editor.decorationOverlay.removeChild(path.svg)
            this.createOutline(editor, figure)
        }
        for(let [figure, path] of this.outlines) {
            path.transform(this.transformation)
            path.update()
        }
    }
    
    updateBoundary() {
        this.boundary = new Rectangle()
        for(let figure of Tool.selection.selection) {
            this.boundary.expandByRectangle(figure.bounds())
        }
//        this.boundary.inflate(1.0)
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
        rectangle.origin.x    = Math.round(rectangle.origin.x-0.5)+0.5
        rectangle.origin.y    = Math.round(rectangle.origin.y-0.5)+0.5
        rectangle.size.width  = Math.round(rectangle.size.width)
        rectangle.size.height = Math.round(rectangle.size.height)
        path.appendRect(rectangle)
        path.transform(this.transformation)
        path.update()
        path.svg.setAttributeNS("", "stroke", "rgb(79,128,255)")
        path.svg.setAttributeNS("", "fill", "none")
        editor.decorationOverlay.appendChild(path.svg)
        this.decoration.push(path)
    
        for(let handle=0; handle<16; ++handle) {
            let path = new Path()
            path.appendRect(this.getBoundaryHandle(handle))
            path.update()
            if (handle<8) {
                path.svg.setAttributeNS("", "stroke", "rgb(79,128,255)")
                path.svg.setAttributeNS("", "fill", "#fff")
            } else {
                path.svg.setAttributeNS("", "stroke", "rgba(0,0,0,0)")
                path.svg.setAttributeNS("", "fill", "rgba(0,0,0,0)")
            }
            this.setCursorForHandle(handle, path.svg)
            editor.decorationOverlay.appendChild(path.svg)
            this.decoration.push(path)
        }
    }
     
    /*******************************************************************
     *                                                                 *
     *                           H A N D L E                           *
     *                                                                 *
     *******************************************************************/

    getBoundaryHandle(handle: number): Rectangle {
        const s = 5.0
        let   x = this.boundary.origin.x,
              y = this.boundary.origin.y,
              w = this.boundary.size.width,
              h = this.boundary.size.height

        switch(handle % 8) {
            case  0: [x, y] = [x       ,y      ]; break
            case  1: [x, y] = [x+w/2.0, y      ]; break
            case  2: [x, y] = [x+w    , y      ]; break
            case  3: [x, y] = [x+w    , y+h/2.0]; break
            case  4: [x, y] = [x+w    , y+h    ]; break
            case  5: [x, y] = [x+w/2.0, y+h    ]; break
            case  6: [x, y] = [x      , y+h    ]; break
            case  7: [x, y] = [x      , y+h/2.0]; break
        }
        let r = new Rectangle()
        r.set(x, y, s, s)
        r.origin = this.transformation.transformPoint(r.origin)
        r.origin.x -= s/2.0
        r.origin.y -= s/2.0

        // for handle <= 7 move away from center by one pixel
        // for handle > 7, move away from center by one + s pixel
        let center = this.transformation.transformPoint(this.boundary.center())
        let v = pointMinusPoint(r.origin, center)
        
        let ax = Math.abs(v.x),
            ay = Math.abs(v.y)
        let a = (ax > ay) ? ax : ay
        if (a !== 0) { // FIXME: test
          v.y /= a
          v.x /= a
        }
        if (handle>=8)
            v = pointMultiplyNumber(v, s)
        r.origin = pointPlusPoint(r.origin, v)
        
        r.origin.x = Math.round(r.origin.x-0.5)+0.5
        r.origin.y = Math.round(r.origin.y-0.5)+0.5
        
        return r
    }
    
    setCursorForHandle(handle: number, svg: SVGElement) {
        switch(handle) {
            case 0:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-nw.svg) 6 6, move")
                break
            case 1:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-n.svg) 4 7, move")
                break
            case 2:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-ne.svg) 6 6, move")
                break
            case 3:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-e.svg) 7 4, move")
                break
            case 4:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-se.svg) 6 6, move")
                break
            case 5:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-s.svg) 4 7, move")
                break
            case 6:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-sw.svg) 6 6, move")
                break
            case 7:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-resize-w.svg) 7 4, move")
                break
            case 8:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-nw.svg) 5 5, move")
                break
            case 9:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-n.svg) 7 2, move")
                break
            case 10:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-ne.svg) 8 5, move")
                break
            case 11:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-e.svg) 5 7, move")
                break
            case 12:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-se.svg) 8 8, move")
                break
            case 13:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-s.svg) 7 5, move")
                break
            case 14:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-sw.svg) 5 8, move")
                break
            case 15:
                svg.setAttributeNS("", "style", "cursor: url(img/cursor/select-rotate-w.svg) 2 7, move")
                break
        }
    }
    
    downHandle(event: EditorEvent): boolean {
        if (Tool.selection.empty())
            return false
        for(let handle = 0; handle<16; ++handle) {
            let rectangle = this.getBoundaryHandle(handle)
            if (rectangle.contains(event)) {
                this.state = State.MOVE_HANDLE
                this.selectedHandle = handle
                this.handleStart = event
                this.transformation.identity()
                this.oldBoundary = new Rectangle(this.boundary)
                if (handle >= 8) {
                    this.rotationCenter = this.boundary.center()
                    this.rotationStartDirection = Math.atan2(event.y - this.rotationCenter.y,
                                                             event.x - this.rotationCenter.x)
                }
                return true
            }
        }
        return false
    }
    
    moveHandle(event: EditorEvent) {
        if (this.selectedHandle < 8)
            this.moveHandle2Scale(event)
        else
            this.moveHandle2Rotate(event)
    }
    
    moveHandle2Scale(event: EditorEvent) {
        let x0 = this.boundary.origin.x,
            y0 = this.boundary.origin.y,
            x1 = x0 + this.boundary.size.width,
            y1 = y0 + this.boundary.size.height,
            ox0 = this.oldBoundary.origin.x,
            oy0 = this.oldBoundary.origin.y,
            ox1 = ox0 + this.oldBoundary.size.width,
            oy1 = oy0 + this.oldBoundary.size.height

        switch(this.selectedHandle) {
            case 0: [x0, y0] = [event.x, event.y]; break
            case 1: y0 = event.y; break
            case 2: [x1, y0] = [event.x, event.y]; break
            case 3: x1 = event.x; break
            case 4: [x1, y1] = [event.x, event.y]; break
            case 5: y1 = event.y; break
            case 6: [x0, y1] = [event.x, event.y]; break
            case 7: x0 = event.x; break
        }
            
        let sx = (x1-x0) / (ox1 - ox0),
            sy = (y1-y0) / (oy1 - oy0)
        let X0, OX0, Y0, OY0
        // if (event.editor.getMatrix()) {
        //   ...
        // } else {
            X0 = x0; Y0 = y0
            OX0 = ox0; OY0 = oy0
        // }
        this.transformation.identity()
        this.transformation.translate({x: -OX0, y: -OY0})
        this.transformation.scale(sx, sy)
        this.transformation.translate({x: X0, y: Y0})
        
        this.updateOutline(event.editor)
        this.updateDecoration(event.editor)
    }
    
    moveHandle2Rotate(event: EditorEvent) {
        let rotd = Math.atan2(event.y - this.rotationCenter.y, event.x - this.rotationCenter.x)
        rotd -= this.rotationStartDirection
        let center = this.rotationCenter
        // if (event.editor.getMatrix()) {
        //   ...
        // }
        this.transformation.identity()
        this.transformation.translate(pointMinus(center))
        this.transformation.rotate(rotd)
        this.transformation.translate(center)
        
        this.updateOutline(event.editor)
        this.updateDecoration(event.editor)
    }
    
    stopHandle(event: EditorEvent) {
        this.state = State.NONE
        event.editor.transformSelection(this.transformation)
    }
}

class BoardData extends valueimpl.BoardData
{
    modified: Signal
    board?: stub.Board

    constructor() {
        super()
        this.modified = new Signal()
        console.log("BoardData.constructor()")
    }
    
    // FIXME: too many functions to do stuff
    transform(layerID: number, indices: Array<number>, matrix: Matrix): void {
        this.board!.transform(layerID, indices, matrix)
    }
}

class BoardListener_impl extends skel.BoardListener {
    boarddata: BoardData

    constructor(orb: ORB, boarddata: BoardData) {
        super(orb)
        this.boarddata = boarddata
    }

    async transform(layerID: number, figureIDs: Array<number>, matrix: Matrix) {
//        console.log("BoardListener_impl.transform(", figureIDs, ", ", matrix, ")")
        // FIXME: too many loops
        // FIXME: too many casts
        for(let layer of this.boarddata.layers) {
            if (layer.id === layerID) {
                for(let id of figureIDs) {
                    for(let index in layer.data) {
                        let f = layer.data[index]
                        if (id === f.id) {
                            if (!f.transform(matrix)) {
                                let transform = new figure.Transform()
                                transform.matrix = new Matrix(matrix)
                                transform.children.push(f)
                                let oldPath = f.getPath() as Path
                                let newPath = transform.getPath() as Path
                                (oldPath.svg as any).replaceWith(newPath.svg)
//                                (f.getPath() as Path).svg.replaceWith(
//                                    (transform.getPath() as Path).svg
//                                )
                                layer.data[index] = transform
                                // ...
                            }
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
    
    transformSelection(matrix: Matrix): void {
console.log("FigureEditor.transformSelection(): ", Tool.selection.figureIds())
        this.model!.transform(this.selectedLayer!.id, Tool.selection.figureIds(), matrix)
    }
}
window.customElements.define("workflow-board", FigureEditor)
