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

import {
    Template, TextModel, HtmlModel,
    bindModel, action
} from "toad.js"

import { AccountPreferences } from "./AccountPreferences"

import { ORB } from "corba.js"
import * as inf from "shared/workflow"
import * as skel from "shared/workflow_skel"

import { Rectangle, Circle } from "./figures"

import { ArrangeTool, EditTool, PenTool, ShapeTool, TextTool } from "./figuretools"
import { ToolModel } from "./figuretools/ToolModel"
import { StrokeAndFillModel } from "./views/widgets/strokeandfill"

import { BoardModel } from "./BoardModel"
import { BoardListener_impl } from "./BoardListener_impl"
import { LocalDrawingModel } from "./figureeditor/LocalDrawingModel"

import { ColorSwatchModel } from "client/views/widgets/colorswatch"
import { DrawingModel } from "client/figureeditor"

import { homeScreen } from "client/views/pages/homescreen"
import * as xdb from "./utils/indexeddb"
import { Layer } from "./figureeditor/Layer"
import { ExportDrawing } from "./views/dialogs/ExportDrawing"
import { ImportDrawing } from "./views/dialogs/ImportDrawing"

namespace dom {
    export function erase(n: Element): void {
        while (n.firstChild) n.removeChild(n.firstChild)
    }
    export function add(n0: Node, n1: Node): void { n0.appendChild(n1) }
    export function instantiateTemplate(name: string): DocumentFragment {
        return tmpl(name)
    }

    export function tmpl(name: string): DocumentFragment {
        let t = document.querySelector('template[id="' + name + '"]')
        if (!t) {
            throw new Error("failed to find template '" + name + "'")
        }
        let x = t as HTMLTemplateElement
        let z: DocumentFragment = x.content
        let y = document.importNode(z, true)
        return y
    }
}

export class Client_impl extends skel.Client {
    server: inf.Server | undefined

    constructor(orb: ORB, server?: inf.Server) {
        super(orb)
        if (server !== undefined) {
            this.server = server
            server.setClient(this)
            this.initializeSession()
        } else {
            this.offline()
        }
    }

    private initializeSession() {
        let session = ""
        if (document.cookie) {
            let cookies = document.cookie.split(";")
            for (let i = 0; i < cookies.length; ++i) {
                let str = cookies[i].trim()
                if (str.indexOf("session=") == 0) {
                    session = str.substring(8, str.length)
                    break
                }
            }
        }
        this.server!!.initializeWebSession(session)
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
            this.server!!.logon(logon.value, password.value, remember.value)
        })

        let checkLogonCondition = function () {
            logonAction.enabled = logon.value.trim().length != 0 && password.value.trim().length != 0
        }
        checkLogonCondition()
        logon.signal.add(checkLogonCondition)
        password.signal.add(checkLogonCondition)

        dom.erase(document.body)
        dom.add(document.body, template.root)
    }

    async homeScreen(cookie: string, avatar: string, email: string, fullname: string) {
        console.log("homeScreen()")

        this.createMenuActions(fullname, email)
        this.createAvatarModel(avatar)
        // this.createToolModel() // for figureeditor
        // this.createStrokeAndFillModel()
        const model = await this.createBoardModel()

        const homeScreen = this.getHomeScreen(model)

        if (cookie.length !== 0) {
            document.cookie = cookie
        }

        // let homeScreen = dom.instantiateTemplate('homeScreen')
        // msg.board.socket = msg.socket

        dom.erase(document.body)
        // homeScreen.appendTo(document.body)
        // dom.add(document.body, homeScreen)

        // this.createMenuActions("Maria Doe", "user@localhost")
        // this.createAvatarModel("img/avatars/whale.svg")
        // this.createToolModel() // for figureeditor
        // this.createStrokeAndFillModel()

        homeScreen.appendTo(document.body)
    }

    getHomeScreen(model: DrawingModel) {
        // MODEL
        const tool = this.createToolModel()
        const strokeandfill = this.createStrokeAndFillModel()
        
        const colorswatch = new ColorSwatchModel()
        const avatar = this.createAvatarModel("img/avatars/whale.svg") // FIXME: hack which only works only for offline

        // VIEW FIXME: move into separate file
        return homeScreen(model, tool, strokeandfill, colorswatch, avatar)
    }

    private async createBoardModel() {
        let project = await this.server!.getProject(1)
        let board = await project.getBoard(1)
        let boardmodel = await board.getModel() as BoardModel // FIXME: getModel should also set the listener so that we won't skip a beat
        boardmodel.board = board
        let boardListener = new BoardListener_impl(this.orb, boardmodel)
        board.addListener(boardListener)
        bindModel("board", boardmodel)
        return boardmodel
    }

    private async offline() {
        // console.log("offline()")

        let model = new LocalDrawingModel()
        let layer = new Layer()

        try {
            const db = await xdb.openDatabase("workflow2", 1, (event: IDBVersionChangeEvent) => {
                const db = (event.target as IDBOpenDBRequest).result
                if (event.oldVersion < 1) {
                    console.log(`IndexedDB: update to version 1`)
                    db.createObjectStore("document", {keyPath: "name"})
                } else {
                    console.log(`IndexedDB: no update required. on version 1`)
                }
            })
            const page = await xdb.get(db, "document", "Untitled.wf") as {name: string, content: ArrayBuffer}

            if (page === undefined) {
                console.log("CREATE INITIAL PAGE")
                await xdb.add(db, "document", {name: "Untitled.wf", content: new ArrayBuffer(0)})
            } else {
                console.log("FOUND PREVIOUS PAGE")
                // console.log(page)
                if (page.content.byteLength > 0) {
                    try {
                        const layer2 = this.orb.deserialize(page.content) as Layer
                        layer.data = layer2.data
                    }
                    catch(error) {
                        console.log(`Failed to deserialize 'Untitled.wf': ${error}`) 
                    }
                }
            }
            model.signal.add( () => {
                console.log("SAVE")
                xdb.put(db, "document", {name: "Untitled.wf", content: this.orb.serialize(layer)})
            })
        }
        catch(error) {
            console.log(`Failed to access workflow's IndexedDB: ${error}`)
            console.log(error)
            console.log(`Deleting IndexedDB`)
            await xdb.deleteDatabase("workflow")
            await xdb.deleteDatabase("workflow2")
            let layer = new Layer()
        }

        model.layers.push(layer)
        bindModel("board", model)

        // FIXME: move into figure editor?
        action("file|export", () => {
            new ExportDrawing("Untitled.wf", layer, this.orb)
        })
        action("file|import", () => {
            new ImportDrawing(model, this.orb)
        })
        action("file|delete", async ()=> {
            let all: number[] = []
            for (let figure of model.layers[0].data) {
                all.push(figure.id)
            }
            model.delete(model.layers[0].id, all)
            await xdb.deleteDatabase("workflow")
            await xdb.deleteDatabase("workflow2")           
        })

        const homeScreen = this.getHomeScreen(model)

        // this.createMenuActions("Maria Doe", "user@localhost")
        // this.createAvatarModel("img/avatars/whale.svg")
        // this.createToolModel() // for figureeditor
        // this.createStrokeAndFillModel()

        dom.erase(document.body)
        homeScreen.appendTo(document.body)
    }

    private createMenuActions(fullname: string, email: string) {
        action("account|preferences", () => {
            let user = {
                fullname: new TextModel(fullname),
                email: new TextModel(email)
            }
            new AccountPreferences(user)
        })
        action("account|logout", () => {
        })
    }

    private createStrokeAndFillModel(): StrokeAndFillModel {
        const strokeandfillmodel = new StrokeAndFillModel()
        bindModel("strokeandfill", strokeandfillmodel)
        bindModel("board", strokeandfillmodel)
        action("setcolor", (data?: any) => {
            strokeandfillmodel.set(data)
        })
        return strokeandfillmodel
    }

    private createToolModel(): ToolModel {
        const arrangeTool = new ArrangeTool()
        let toolmodel = new ToolModel(arrangeTool, [
            [arrangeTool, "arrange"],
            [new EditTool(), "edit"],
            [new PenTool(), "pen"],
            [new ShapeTool(Rectangle), "rectangle"],
            [new ShapeTool(Circle), "circle"],
            [new TextTool(), "text"]
        ])
        bindModel("tool", toolmodel) // for tool buttons
        bindModel("board", toolmodel)
        return toolmodel
    }

    private createAvatarModel(avatar: string): HtmlModel {
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
        bindModel("avatar", model)
        return model
    }
}
