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

import { ORB } from "corba.js"
import { WsProtocol } from "corba.js/net/browser"

import * as stub from "shared/workflow_stub"
import { Rectangle } from "shared/geometry/Rectangle"
import { Size } from "shared/geometry/Size"
import { Point } from "shared/geometry/Point"
import { Matrix } from "shared/geometry/Matrix"

import * as figure from "./figures.js"

import { Layer } from "./figureeditor/Layer"
import { BoardModel } from "./BoardModel"
import { Client_impl } from "./Client_impl"

export async function main(url: string|undefined = undefined) {
    console.log("WORKFLOW: MAIN")

    const orb = new ORB()
    orb.debug = 1
    orb.addProtocol(new WsProtocol())
    initializeORB(orb)
    initializeCORBAValueTypes()
 
    // if this fails, fall back to serverless
    try {
        const workflowserver = stub.WorkflowServer.narrow(
            await orb.stringToObject(`corbaname::${window.location.hostname}:8809#WorkflowServer`)
        )
        // FIXME: corba.js can't do that yet, but the idea is that the connection re-establishes on it's own
        orb.onclose = () => {
            document.body.innerHTML = "lost connection to workflow server '"+url+"'. please reload."
        }
        const sessionServerSide = await workflowserver.getServer()
        const sessionClientSide = new Client_impl(orb, sessionServerSide)
    }
    catch(e) {
        console.log(`Failed to connect to WorkFlow server, falling back to serverless.`)
        new Client_impl(orb)
    }
}

export function initializeORB(orb: ORB) {
    orb.registerStubClass(stub.WorkflowServer)
    orb.registerStubClass(stub.Server)
    orb.registerStubClass(stub.Project)
    orb.registerStubClass(stub.Board)
}

export function initializeCORBAValueTypes() {
    ORB.registerValueType("Point", Point)
    ORB.registerValueType("Size", Size)
    ORB.registerValueType("Rectangle", Rectangle)
    ORB.registerValueType("Matrix", Matrix)

    ORB.registerValueType("Figure", figure.Figure);
    ORB.registerValueType("figure.AttributedFigure", figure.AttributedFigure)
    ORB.registerValueType("figure.Shape", figure.Shape)
    ORB.registerValueType("figure.Rectangle", figure.Rectangle)
    ORB.registerValueType("figure.Circle", figure.Circle)
    ORB.registerValueType("figure.Text", figure.Text)
    ORB.registerValueType("figure.Group", figure.Group)
    ORB.registerValueType("figure.Transform", figure.Transform)

    // ORB.registerValueType("FigureModel", FigureModel)
    ORB.registerValueType("Layer", Layer)
    ORB.registerValueType("BoardModel", BoardModel)
}

