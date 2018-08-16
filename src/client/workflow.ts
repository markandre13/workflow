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
    Action, Signal, Model, Template,
    TextModel, HtmlModel,
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

import * as geometry from "../shared/geometry"
import {
    Point, Size, Rectangle, Matrix,
    pointPlusSize, pointMinusPoint, pointPlusPoint, pointMultiplyNumber, pointMinus
} from "../shared/geometry"

import * as figure from "./figure"
import { Figure } from "./figure"
import { Graphic, Path } from "./path"

import { Tool, SelectTool, ShapeTool } from "./tool"
import { FigureEditor, ToolModel, Layer, LayerModel } from "./editor"
import { StrokeAndFill, StrokeAndFillModel } from "./strokeandfill"
import { ColorSwatch, ColorSwatchModel } from "./colorswatch"

export async function runtest(test: Function) {
    window.customElements.define("toad-figureeditor", FigureEditor)
    try {
        test()
    }
    catch(error) {
        console.log("error: "+error.message)
    }
}

export async function main(url: string) {

    let orb = new ORB()
//    orb.debug = 1

    window.customElements.define("toad-figureeditor", FigureEditor)
    window.customElements.define("toad-strokeandfill", StrokeAndFill)
    window.customElements.define("toad-colorswatch", ColorSwatch)

    orb.registerStubClass(stub.WorkflowServer)
    orb.registerStubClass(stub.Server)
    orb.registerStubClass(stub.Project)
    orb.registerStubClass(stub.Board)

    ORB.registerValueType("Point", Point)
    ORB.registerValueType("Size", Size)
    ORB.registerValueType("Rectangle", Rectangle)
    ORB.registerValueType("Matrix", Matrix)

    ORB.registerValueType("Figure", figure.Figure)
    ORB.registerValueType("figure.AttributedFigure", figure.AttributedFigure)
    ORB.registerValueType("figure.Shape", figure.Shape)
    ORB.registerValueType("figure.Rectangle", figure.Rectangle)
    ORB.registerValueType("figure.Circle", figure.Circle)
    ORB.registerValueType("figure.Group", figure.Group)
    ORB.registerValueType("figure.Transform", figure.Transform)

//    ORB.registerValueType("FigureModel", FigureModel)
    ORB.registerValueType("Layer", Layer)
    ORB.registerValueType("BoardModel", BoardModel)

    try {
        await orb.connect(url)
    }
    catch(error) {
        document.body.innerHTML = "could not connect to workflow server '"+url+"'. please try again later."
        return
    }
    orb.onclose = () => {
        document.body.innerHTML = "lost connection to workflow server '"+url+"'. please reload."
    }

    let workflowserver = stub.WorkflowServer.narrow(await orb.resolve("WorkflowServer"))
    let sessionServerSide = await workflowserver.getServer()
    let sessionClientSide = new Client_impl(orb, sessionServerSide)
}

class Client_impl extends skel.Client {
    server: stub.Server

    constructor(orb: ORB, server: stub.Server) {
        super(orb)
        console.log("Client_impl.constructor()")
        this.server = server
        server.setClient(this)
        this.initializeSession()
    }
    
    initializeSession() {
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
        this.server.initializeWebSession(session)
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
  
        let toolmodel = new ToolModel()
        toolmodel.add("select", new SelectTool())
        toolmodel.add("rectangle", new ShapeTool(() => { return new figure.Rectangle() }))
        toolmodel.add("circle", new ShapeTool(() => { return new figure.Circle() }))
        toolmodel.stringValue = "select"
        bind("tool", toolmodel)  // for tool buttons
        bind("board", toolmodel) // for figureeditor
        
        let strokeandfillmodel = new StrokeAndFillModel()
        bind("strokeandfill", strokeandfillmodel)
        bind("board", strokeandfillmodel)

        action("setcolor", (data?: any) => {
            strokeandfillmodel.set(data)
        })

        let project = await this.server.getProject(1)
        let board = await project.getBoard(1)
        
        let boardmodel = await board.getModel() as BoardModel // FIXME: getData should also set the listener so that we won't skip a beat
        boardmodel.board = board

        let boardListener = new BoardListener_impl(this.orb, boardmodel)
        board.addListener(boardListener)

        bind("board", boardmodel)

        dom.erase(document.body);
        dom.add(document.body, homeScreen);
    }
}

export class BoardModel extends valueimpl.BoardModel implements LayerModel
{
    modified: Signal
    board?: stub.Board

    constructor() {
        super()
        this.modified = new Signal()
        console.log("BoardModel.constructor()")
    }
    
    // FIXME: too many functions to do stuff
    transform(layerID: number, indices: Array<number>, matrix: Matrix): void {
        this.board!.transform(layerID, indices, matrix)
    }
    
    add(layerID: number, figure: Figure) {
        this.board!.add(layerID, figure)
    }
}

export class BoardListener_impl extends skel.BoardListener {
    boardmodel: BoardModel

    constructor(orb: ORB, boardmodel: BoardModel) {
        super(orb)
        this.boardmodel = boardmodel
    }

    layerById(layerID: number) {
        for(let layer of this.boardmodel.layers) {
            if (layer.id === layerID)
                return layer
        }
        throw Error("BoardListener_impl.layerById(): unknown layer id "+layerID)
    }
    
    async add(layerId: number, figure: Figure) {
        let layer = this.layerById(layerId)
        layer.data.push(figure)
        this.boardmodel.modified.trigger()
    }

    async transform(layerId: number, figureIdArray: Array<number>, matrix: Matrix, newIds: Array<number>) {
        console.log("BoardListener_impl.transform(", figureIdArray, ", ", matrix, ", ", newIds, ")")

        // FIXME: too many casts
        
        let layer = this.layerById(layerId)

        let figureIdSet = new Set<number>()
        for(let id of figureIdArray)
            figureIdSet.add(id)
        
        for(let index in layer.data) {
            let fig = layer.data[index]

            if (!figureIdSet.has(fig.id))
                continue

            if (fig.transform(matrix))
                continue

            let transform = new figure.Transform()
            transform.id = newIds.shift()!
            transform.transform(matrix)
            let oldGraphic = fig.getGraphic() as Graphic

            let oldParentNode = oldGraphic.svg.parentNode!
            let oldNextSibling = oldGraphic.svg.nextSibling
            oldParentNode.removeChild(oldGraphic.svg)

            transform.add(fig)
            let newGraphic = transform.getGraphic() as Graphic
            newGraphic.updateSVG()

            oldParentNode.insertBefore(newGraphic.svg, oldNextSibling)

            layer.data[index] = transform
        }
    }
}
