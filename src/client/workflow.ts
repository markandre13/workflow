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

import { View } from "toad.js"
import { ORB } from "corba.js"


import * as stub from "shared/workflow_stub"
import { Point, Size, Rectangle, Matrix } from "shared/geometry"

// SyntaxError: Importing binding name 'default' cannot be resolved by star export entries
import * as figure from "./figures.js"
// import { Figure } from "./figures"

import { Layer } from "./figureeditor/Layer"
import { BoardModel } from "./BoardModel"
import { Client_impl } from "./Client_impl"

import { FigureEditor } from "./figureeditor/FigureEditor"
import { StrokeAndFill } from "./views/widgets/strokeandfill"
import { ColorSwatch } from "./views/widgets/colorswatch"


export async function main(url: string|undefined = undefined) {
    console.log("WORKFLOW: MAIN")
    registerHTMLCustomElements();

    const orb = new ORB()
    // orb.debug = 1
     // orb.addProtocol(new BrowserWsProtocol(url))
    initializeORB(orb)
    initializeCORBAValueTypes()
   
    if (url === undefined) {
        // openFile()
        new Client_impl(orb)
        return
    }

//     // try {
//     //     await orb.connect(url)
//     // }
//     // catch(error) {
//     //     document.body.innerHTML = "could not connect to workflow server '"+url+"'. please try again later."
//     //     return
//     // }
//     orb.onclose = () => {
//         document.body.innerHTML = "lost connection to workflow server '"+url+"'. please reload."
//     }
//     // hm... how to squeze websocket into the corbname: url? => we don't?
//     let workflowserver = stub.WorkflowServer.narrow(await orb.resolve("corbaname::ws:0#WorkflowServer"))
    // let sessionServerSide = await workflowserver.getServer()
//     let sessionClientSide = new Client_impl(orb, sessionServerSide)
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

    // //    ORB.registerValueType("FigureModel", FigureModel)
    ORB.registerValueType("Layer", Layer)
    ORB.registerValueType("BoardModel", BoardModel)
}

export function registerHTMLCustomElements() {
    View.define("toad-figureeditor", FigureEditor)
    View.define("toad-strokeandfill", StrokeAndFill)
    View.define("toad-colorswatch", ColorSwatch)
}

