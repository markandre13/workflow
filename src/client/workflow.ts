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

import * as shape from "./shapes"
import { Path } from "./shapes/Path.js"

import { Layer } from "./shapeeditor/Layer.js"
import { BoardModel } from "./BoardModel"
import { Client_impl } from "./Client_impl"

import { loadFont } from "toad.js/util/loadFont"
import { loadStyle } from "toad.js/util/loadStyle"

import { Rectangle as RectangleShape } from "./shapes"
import { ShapeEditor } from "client/shapeeditor"


export async function main(url: string | undefined = undefined) {
    console.log("WORKFLOW: MAIN")

    loadFont()
    loadStyle()

    const orb = new ORB()
    orb.debug = 1
    orb.addProtocol(new WsProtocol())
    initializeORB(orb)
    initializeCORBAValueTypes()

    // if this fails, fall back to serverless
    // try {
    //     const workflowserver = stub.WorkflowServer.narrow(
    //         await orb.stringToObject(`corbaname::${window.location.hostname}:8809#WorkflowServer`)
    //     )
    //     // FIXME: corba.js can't do that yet, but the idea is that the connection re-establishes on it's own
    //     orb.onclose = () => {
    //         document.body.innerHTML = "lost connection to workflow server '"+url+"'. please reload."
    //     }
    //     const sessionServerSide = await workflowserver.getServer()
    //     const sessionClientSide = new Client_impl(orb, sessionServerSide)
    // }
    // catch(e) {
    // console.log(`Failed to connect to WorkFlow server, falling back to serverless.`)
    new Client_impl(orb)
    // }

    // await testCase()
}

function screenSync() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            resolve("success")
        })
    })
}

async function testCase() {

    const editor = document.querySelector("tx-shapeeditor") as ShapeEditor
    const model = editor.model!

    // begin test case
    await screenSync()
    const r = new RectangleShape({ id: 1, origin: { x: -50.5, y: 70.5 }, size: { width: 80, height: 20 } })
    console.log(`A editor.scrollLeft = ${editor.scrollLeft}, viewbox.x=${editor.svg.viewBox.baseVal.x}`)
    // expect: editor.scrollLeft = 0, editor.svg.viewBox.baseVal.x = 0

    // add rectangle left outside the window
    r.stroke = "#000"
    r.strokeWidth = 1
    r.fill = "#f80"
    model.add(editor.selectedLayer!.id, r)
    await screenSync()
    console.log(`B editor.scrollLeft = ${editor.scrollLeft}, viewbox.x=${editor.svg.viewBox.baseVal.x}`)
    // expect: editor.scrollLeft = 51, editor.svg.viewBox.baseVal.x = -51

    // scroll left
    editor.scrollLeft = 0
    await screenSync()
    console.log(`C editor.scrollLeft = ${editor.scrollLeft}, viewbox.x=${editor.svg.viewBox.baseVal.x}`)
    // expect: editor.scrollLeft = 0, editor.svg.viewBox.baseVal.x = -51

    // delete rectangle
    model.delete(editor.selectedLayer!.id, [r.id])
    await screenSync()
    console.log(`D editor.scrollLeft = ${editor.scrollLeft}, viewbox.x=${editor.svg.viewBox.baseVal.x}`)

    // FIXME: editor has scrolled back (editor.scrollLeft = 0, editor.svg.viewBox.baseVal.x = 0)
    // expect: editor.scrollLeft = 0, editor.svg.viewBox.baseVal.x = -51
    // got   : editor.scrollLeft = 0, editor.svg.viewBox.baseVal.x = 0

    // end test case
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

    ORB.registerValueType("Shape", shape.Shape)
    ORB.registerValueType("shape.BoxShape", shape.BoxShape)
    ORB.registerValueType("shape.Rectangle", shape.Rectangle)
    ORB.registerValueType("shape.Circle", shape.Circle)
    ORB.registerValueType("shape.Text", shape.Text)
    ORB.registerValueType("shape.Path", Path)
    ORB.registerValueType("shape.Group", shape.Group)
    ORB.registerValueType("shape.Transform", shape.Transform)

    // ORB.registerValueType("ShapeModel", ShapeModel)
    ORB.registerValueType("Layer", Layer)
    ORB.registerValueType("BoardModel", BoardModel)
}

