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
    bindModel as bind, action
} from "toad.js"

import { AccountPreferences } from "./AccountPreferences"

import { ORB } from "corba.js"
import * as inf from "shared/workflow"
import * as skel from "shared/workflow_skel"

import * as Rectangle from "./figures/Rectangle"
import * as Circle from "./figures/Circle"

import { SelectTool, ShapeTool, TextTool } from "./figuretools"
import { ToolModel } from "./figuretools/ToolModel"
import { StrokeAndFillModel } from "./views/widgets/strokeandfill"

import { BoardModel } from "./BoardModel"
import { BoardListener_impl } from "./BoardListener_impl"
import { LocalDrawingModel } from "./figureeditor/LocalDrawingModel"

import { ColorSwatchModel } from "client/views/widgets/colorswatch"
import { DrawingModel } from "client/figureeditor"

import { homeScreen } from "client/views/pages/homescreen"
import { IndexedDB, ObjectStore } from "./utils/indexeddb"
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
        logon.modified.add(checkLogonCondition)
        password.modified.add(checkLogonCondition)

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
        bind("board", boardmodel)
        return boardmodel
    }

    private async offline() {
        // console.log("offline()")

        let model = new LocalDrawingModel()
        let layer = new Layer()
        
        const db = new IndexedDB()
        // await db.delete("workflow")
        const store = new ObjectStore<{name: string, content: string}>(db, "document", (db: IDBDatabase) => {
            const objectStore = db.createObjectStore("document", {
                // keyPath: "id",
                autoIncrement: true
            })
            objectStore.createIndex("name", "name", { unique: false })
        })
        await db.open("workflow", 2)
        const page = await store.get(1)
        if (page === undefined) {
            // console.log("CREATE INITIAL PAGE")
            await store.add({name: "Untitled.wf", content: ""})
        } else {
            // console.log("FOUND PREVIOUS PAGE")
            // console.log(page)
            if (page.content !== "") {
                const layer2 = this.orb.deserialize(page.content) as Layer
                layer.data = layer2.data
            }
        }
        model.modified.add( () => {
            // console.log("SAVE")
            store.put({name: "Untitled.wf", content: this.orb.serialize(layer)}, 1)
        })

        model.layers.push(layer)
        bind("board", model)

        // FIXME: move into figure editor?
        action("file|export", () => {
            new ExportDrawing("Untitled.wf", layer, this.orb)
        })
        action("file|import", () => {
            new ImportDrawing(model, this.orb)
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
        let strokeandfillmodel = new StrokeAndFillModel()
        bind("strokeandfill", strokeandfillmodel)
        bind("board", strokeandfillmodel)
        action("setcolor", (data?: any) => {
            strokeandfillmodel.set(data)
        })
        return strokeandfillmodel
    }

    private createToolModel(): ToolModel {
        let toolmodel = new ToolModel()
        toolmodel.add("select", new SelectTool())
        toolmodel.add("rectangle", new ShapeTool(Rectangle.Rectangle))
        toolmodel.add("circle", new ShapeTool(Circle.Circle))
        toolmodel.add("text", new TextTool())
        toolmodel.stringValue = "select"
        bind("tool", toolmodel) // for tool buttons
        bind("board", toolmodel)
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
        bind("avatar", model)
        return model
    }
}
