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

import { ORB } from "corba.js"
import * as stub from "../shared/workflow_stub"
import {
    Point, Size, Rectangle, Matrix, pointMinus,
} from "../shared/geometry"

import * as figure from "./figures"
import { Layer } from "./figureeditor/Layer";
import { FigureEditor } from "./figureeditor/FigureEditor";
import { StrokeAndFill } from "./widgets/strokeandfill"
import { ColorSwatch } from "./widgets/colorswatch"

import { testWrap } from "./wordwrap/test"

import { Client_impl } from "./Client_impl"
import { BoardModel } from "./BoardModel"

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
    registerCustomElements();

    let orb = new ORB()
    //    orb.debug = 1

    initializeORB(orb)

    // FIXME: this test should be able to run as a unit test but also create visual output
    if (false) {
        document.body.innerHTML=`<svg id="svg" xmlns="http://www.w3.org/2000/svg" style="border: 1px solid #ddd" width="640" height="480" viewBox="0 0 640 480"></svg>`
        testWrap()
        return
    }

    if (true) {
        document.body.innerHTML=`<svg id="svg" xmlns="http://www.w3.org/2000/svg" style="border: 1px solid #ddd" width="640" height="480" viewBox="0 0 640 480"></svg>`
        testMath()
        return
    }

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

function initializeORB(orb: ORB) {
    orb.registerStubClass(stub.WorkflowServer)
    orb.registerStubClass(stub.Server)
    orb.registerStubClass(stub.Project)
    orb.registerStubClass(stub.Board)
    ORB.registerValueType("Point", Point)
    ORB.registerValueType("Size", Size)
    ORB.registerValueType("Rectangle", Rectangle)
    ORB.registerValueType("Matrix", Matrix)

    ORB.registerValueType("Figure", figure.Figure);
    ORB.registerValueType("figure.AttributedFigure", figure.AttributedFigure)
    ORB.registerValueType("figure.Shape", figure.Shape)
    ORB.registerValueType("figure.Rectangle", figure.Rectangle)
    ORB.registerValueType("figure.Circle", figure.Circle)
    ORB.registerValueType("figure.Group", figure.Group)
    ORB.registerValueType("figure.Transform", figure.Transform)

    //    ORB.registerValueType("FigureModel", FigureModel)
    ORB.registerValueType("Layer", Layer)
    ORB.registerValueType("BoardModel", BoardModel)
}

function registerCustomElements() {
    window.customElements.define("toad-figureeditor", FigureEditor)
    window.customElements.define("toad-strokeandfill", StrokeAndFill)
    window.customElements.define("toad-colorswatch", ColorSwatch)
}

function testMath() {
    let svg = document.getElementById("svg")!

    let r = new Rectangle({origin:{x: 30.5, y:90.5}, size: {width: 80, height: 40}})
    let rectangle0 = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    rectangle0.setAttributeNS("", "stroke", "#000")
    rectangle0.setAttributeNS("", "fill", "#d88")
    rectangle0.setAttributeNS("", "x", String(r.origin.x))
    rectangle0.setAttributeNS("", "width", String(r.size.width))
    rectangle0.setAttributeNS("", "y", String(r.origin.y))
    rectangle0.setAttributeNS("", "height", String(r.size.height))
    svg.appendChild(rectangle0)

    // let m = new DOMMatrix()
    let c = r.center()

    // the order of operations here is reversed
    // m.translateSelf(c.x, c.y, 0)
    // m.rotateSelf(0.0, 0.0, 5)
    // m.translateSelf(-c.x, -c.y, 0)

    // if we pre-multiply, the order of operations follows the logical order
    // let t0 = new DOMMatrix().translateSelf(-c.x, -c.y, 0)
    // let r0 = new DOMMatrix().rotateSelf(0.0, 0.0, 5)
    // let t1 = new DOMMatrix().translateSelf(c.x, c.y, 0)
    // m.preMultiplySelf(t0)
    // m.preMultiplySelf(r0)
    // m.preMultiplySelf(t1)

    let m = new Matrix()
    m.translate(pointMinus(c))
    m.rotate(0.1)
    m.translate(c)

    console.log(`matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`)

    let group = document.createElementNS("http://www.w3.org/2000/svg", "g")
    group.setAttributeNS("", "transform", `matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`)
    let rectangle1 = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    rectangle1.setAttributeNS("", "stroke", "#000")
    rectangle1.setAttributeNS("", "fill", "#88d")
    rectangle1.setAttributeNS("", "x", String(r.origin.x))
    rectangle1.setAttributeNS("", "width", String(r.size.width))
    rectangle1.setAttributeNS("", "y", String(r.origin.y))
    rectangle1.setAttributeNS("", "height", String(r.size.height))
    group.appendChild(rectangle1)
    svg.appendChild(group)
}