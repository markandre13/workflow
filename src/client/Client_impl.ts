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
    Template, TextModel, HtmlModel,
    bind, action,
} from "toad.js"

import { AccountPreferences } from "./AccountPreferences"

import { ORB } from "corba.js"
import * as skel from "../shared/workflow_skel"
import * as stub from "../shared/workflow_stub"

import * as Rectangle from "./figures/Rectangle"
import * as Circle from "./figures/Circle"

import { SelectTool, ShapeTool } from "./figuretools"
import { ToolModel } from "./figuretools/ToolModel"
import { StrokeAndFillModel } from "./widgets/strokeandfill"

import { BoardModel } from "./BoardModel"
import { BoardListener_impl } from "./BoardListener_impl"

// import { testWrap } from "./wordwrap/test"

export class Client_impl extends skel.Client {
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

        if (cookie.length !== 0) {
            document.cookie = cookie
        }

        let homeScreen = dom.instantiateTemplate('homeScreen')
        // msg.board.socket = msg.socket
      
        this.createMenuActions(fullname, email)
        this.createAvatarModel(avatar)
        this.createToolModel() // for figureeditor
        this.createStrokeAndFillModel()
        await this.createBoardModel()

        dom.erase(document.body)
        dom.add(document.body, homeScreen)
    }

    private async createBoardModel() {
        let project = await this.server.getProject(1)
        let board = await project.getBoard(1)
        let boardmodel = await board.getModel() as BoardModel // FIXME: getModel should also set the listener so that we won't skip a beat
        boardmodel.board = board
        let boardListener = new BoardListener_impl(this.orb, boardmodel)
        board.addListener(boardListener)
        bind("board", boardmodel)
    }

    private createMenuActions(fullname: string, email: string) {
        action("account|preferences", () => {
            let user = {
                fullname: new TextModel(fullname),
                email: new TextModel(email)
            };
            new AccountPreferences(user)
        })
        action("account|logout", () => {
        })
    }

    private createStrokeAndFillModel() {
        let strokeandfillmodel = new StrokeAndFillModel()
        bind("strokeandfill", strokeandfillmodel)
        bind("board", strokeandfillmodel)
        action("setcolor", (data?: any) => {
            strokeandfillmodel.set(data)
        })
    }

    private createToolModel() {
        let toolmodel = new ToolModel()
        toolmodel.add("select", new SelectTool())
        toolmodel.add("rectangle", new ShapeTool(() => { return new Rectangle.Rectangle() }))
        toolmodel.add("circle", new ShapeTool(() => { return new Circle.Circle() }))
        toolmodel.stringValue = "select"
        bind("tool", toolmodel) // for tool buttons
        bind("board", toolmodel)
    }

    private createAvatarModel(avatar: string) {
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
    }
}