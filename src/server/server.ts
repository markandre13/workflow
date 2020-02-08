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

console.log('booting workflow server v0.1')

import * as knex from 'knex'
import * as crypto from "crypto"
//import * as scrypt from "scrypt"
var scrypt = require("scrypt")
var scryptParameters = scrypt.paramsSync(0.1)

import { ORB } from 'corba.js/lib/orb/orb-nodejs' // FIXME corba.js/nodejs corba.js/browser ?
import * as skel from "../shared/workflow_skel"
import * as stub from "../shared/workflow_stub"
import { Figure, FigureModel, BoardModel } from "../shared/workflow_valueimpl"

import * as geometry from "../shared/geometry"
import { Point, Size, Rectangle, Matrix } from "../shared/geometry"

import * as value     from "../shared/workflow_value"
import * as valuetype from "../shared/workflow_valuetype"
import * as valueimpl from "../shared/workflow_valueimpl"

let testing = true

let disclaimer=`Welcome to WorkFlow
        <p>
          For assistance contact the service desk at 721-821-4291<br />
          (ask for help with WorkFlow).
        </p>
        <p>
          MARK-13's internal systems must only be used for conducting
          MARK-13's business or for purposes authorized by MARK-13's
          management.<br />
          Use is subject to audit at any time by MARK-13 management.
        </p>`

console.log('database...');

/*
let board = new Board(10, "Polisens mobila Utrednings STöd Project Board")
let layer = new Layer(20, "Scrible")
layer.data.push(new valuetype.figure.Rectangle(new Point(25.5, 5.5), new Size(50, 80))) // stroke & fill
layer.data.push(new valuetype.figure.Rectangle(new Point(85.5, 45.5), new Size(50, 80)))
board.layers.push(layer)
*/

let db = knex({
    client: "sqlite3",
    useNullAsDefault: true,
    connection: {
        filename: ":memory:",
    }
})

main()

async function main() {
      
    await db.schema.createTable('users', (table) => {
        table.increments("uid").primary()
        table.string("logon", 20).index()
        table.string("password", 96)
        table.binary("sessionkey", 64)
        table.string("fullname", 128)
        table.string("email", 128)
        table.string("avatar", 128)
    })
    
    await db("users").insert([
        { logon: "mark" , password: scrypt.kdfSync("secret", scryptParameters), avatar: "img/avatars/pig.svg",   email: "mhopf@mark13.org", fullname: "Mark-André Hopf" },
        { logon: "tiger", password: scrypt.kdfSync("lovely", scryptParameters), avatar: "img/avatars/tiger.svg", email: "tiger@mark13.org", fullname: "Emma Peel" }
    ])
    
    await db.schema.createTable('projects', (table) => {
        table.increments("pid").primary()
        table.string("name", 128)
        table.string("description")
    })
    await db("projects").insert([
        { name: "Polisens mobila Utrednings STöd", description: "" }
    ])

    await db.schema.createTable('boards', (table) => {
        table.increments("bid").primary()
        table.integer("pid").references("pid").inTable("projects")
        table.string("name", 128)
        table.string("description")
        table.jsonb("layers")
    })
    await db("boards").insert([
        { pid: 1,
          name: "Polisens mobila Utrednings STöd Project Board",
          description: "",
          layers: JSON.stringify([{"#T":"Layer","#V":{"data":[{"#T":"figure.Rectangle","#V":{"id":1,"origin":{"#T":"Point","#V":{"x":25.5,"y":5.5}},"size":{"#T":"Size","#V":{"width":50,"height":80}},"fill": "#f80"}},{"#T":"figure.Rectangle","#V":{"id":2,"origin":{"#T":"Point","#V":{"x":85.5,"y":45.5}},"size":{"#T":"Size","#V":{"width":50,"height":80}},"fill":"#08f"}}],"id":20,"name":"Scrible"}}])
        }
    ])

    let orb = new ORB()
//orb.debug = 1
//    orb.register("Server", Server_impl)
//    orb.register("Project", Project_impl)
//    orb.register("Board", Board_impl)
    orb.registerStubClass(stub.Client)
    orb.registerStubClass(stub.BoardListener)
    ORB.registerValueType("Point", Point)
    ORB.registerValueType("Size", Size)
    ORB.registerValueType("Matrix", Matrix)
    ORB.registerValueType("Rectangle", Rectangle)
    ORB.registerValueType("Figure", Figure)
    ORB.registerValueType("figure.AttributedFigure", figure.AttributedFigure)
    ORB.registerValueType("figure.Rectangle", figure.Rectangle)
    ORB.registerValueType("figure.Circle", figure.Circle)
    ORB.registerValueType("figure.Group", valueimpl.figure.Group)
    ORB.registerValueType("figure.Transform", figure.Transform)
    ORB.registerValueType("FigureModel", FigureModel)
    ORB.registerValueType("BoardModel", valueimpl.BoardModel)
    ORB.registerValueType("Layer", Layer)
    
    orb.bind("WorkflowServer", new WorkflowServer_impl(orb))

    orb.listen("0.0.0.0", 8000)

    console.log("listening...")
}

class WorkflowServer_impl extends skel.WorkflowServer {
    async getServer() {
        return new Server_impl(this.orb)
    }
}

class Server_impl extends skel.Server {
    client?: stub.Client
    static projects = new Map<number, Project_impl>()

    constructor(orb: ORB) {
        super(orb)
        console.log("Server_impl.constructor()")
    }
    
    destructor() { // FIXME: corba.js should invoke this method when the connection get's lost?
        console.log("Server_impl.destructor()")
//        this.board.unregisterWatcher(this)
    }
    
    async setClient(client: stub.Client) {
        console.log("Server_impl.setClient()")
        this.client = client
    }
    
    async initializeWebSession(aSession: string) {
        console.log("Server_impl.init()")
        if (testing) {
            this.client!.homeScreen("", "img/avatars/pig.svg", "pig@mark13.org", "Pig")
            return
        }
        if (aSession.length !== 0) {
            let session = aSession.split(":")
            let logon = session[0]
            let sessionkey = Buffer.from(session[1], 'base64')
            let result = await db.select("uid", "avatar", "email", "fullname", "sessionkey").from("users").where({logon: logon, sessionkey: sessionkey})
            if (result.length === 1) {
                let user = result[0]
                this.client!.homeScreen("", user.avatar, user.email, user.fullname)
                return
            }
        }
        this.client!.logonScreen(30, disclaimer, false, "")
    }

    async logon(logon: string, password: string, remember: boolean) {
        console.log("Server_impl.logon()")
        let result = await db.select("uid", "password", "avatar", "email", "fullname").from("users").where("logon", logon)
        if (result.length === 1 && scrypt.verifyKdfSync(result[0].password, password)) {
            const user = result[0]
            const sessionKey = crypto.randomBytes(64)
            await db("users").where("uid", user.uid).update("sessionkey", sessionKey)
            const base64SessionKey = String(Buffer.from(sessionKey).toString("base64"))

//            this.board = board
//            this.board.registerWatcher(this)

            this.client!.homeScreen(
                // FIXME: hardcoded server URL
                "session="+logon+":"+base64SessionKey+"; domain=192.168.1.105; path=/~mark/workflow/; max-age="+String(60*60*24*1),
                user.avatar,
                user.email,
                user.fullname)
        } else {
            this.client!.logonScreen(30, disclaimer, remember, "Unknown user and/or password. Please try again.")
        }
    }
    
    async getProject(projectID: number) {
        console.log("Server_impl.getProject("+projectID+")")
        
        let project = Server_impl.projects.get(projectID)
        if (project) {
            console.log("return active project "+projectID)
            return project
        }
        
        let result = await db.select("pid", "name", "description").from("projects").where({pid: projectID})
        if (result.length !== 1) {
            throw Error("Server_impl.getProject("+projectID+"): no such project")
        }
        console.log("return restored project "+projectID)
        project = new Project_impl(this.orb, result[0])
        Server_impl.projects.set(projectID, project)
        return project
    }
}

interface ProjectData {
    pid: number
    name: string
    description: string
}

class Project_impl extends skel.Project {
    data: ProjectData

    boards: Map<number, Board_impl>

    constructor(orb: ORB, data: ProjectData) {
        super(orb)
        this.data = data
    	this.boards = new Map<number, Board_impl>()
        console.log("Project_impl.constructor()")
    }

    async getBoard(boardID: number) {
        console.log("Project_impl.getBoard("+boardID+")")
        
        let board = this.boards.get(boardID)
        if (board) {
            console.log("return active board "+boardID)
            return board
        }
        let result = await db.select("bid", "name", "description", "layers").from("boards").where({pid: this.data.pid, bid: boardID})
        if (result.length !== 1) {
            throw Error("Project_impl.getBoard("+boardID+"): no such board")
        }

        result[0].layers = this.orb.deserialize(result[0].layers)
        let boardmodel = new valueimpl.BoardModel(result[0])
        board = new Board_impl(this.orb, boardmodel)
        this.boards.set(boardID, board)
        console.log("return restored board "+boardID)
        return board
    }
}

class Board_impl extends skel.Board {
    model: BoardModel
    listeners: Map<stub.BoardListener, EventListener>

    constructor(orb: ORB, model: BoardModel) {
        super(orb)
        this.model = model
        this.listeners = new Map<stub.BoardListener, EventListener>()
        console.log("Board_impl.constructor()")
    }
    
    async addListener(listener: stub.BoardListener) {
        if (this.listeners.has(listener))
            return

        let closing = () => {
            this.removeListener(listener)
        }
        listener.orb.addEventListener("close", closing)
        this.listeners.set(listener, closing)
    }
    
    async removeListener(listener: stub.BoardListener) {
        let closing = this.listeners.get(listener)
        if (closing === undefined)
            return
        this.listeners.delete(listener)
        listener.orb.removeEventListener("close", closing)
    }
    
    async getModel() {
//console.log("Board_impl.getData()")
        return this.model
    }

    layerById(layerID: number) {
        for(let layer of this.model.layers) {
            if (layer.id === layerID) {
                return layer
            }
        }
        throw Error("Board_impl: layerById("+layerID+"): unknown layer id")
    }
    
    async add(layerID: number, figure: Figure) {
//        console.log("Board_impl.add(): ", figure)
        let layer = this.layerById(layerID)
        figure.id = (layer as Layer).createFigureId()
        layer.data.push(figure)
        for (let listener of this.listeners) {
            listener[0].add(layerID, figure)
        }
    }

    // FIXME: share code with client (BoardListener_impl.transform)
    async transform(layerID: number, figureIdArray: Array<number>, matrix: Matrix) {
//        console.log("Board_impl.transform(", figureIdArray, ", ", matrix, ")")
        let figureIdSet = new Set<number>()
        for(let id of figureIdArray)
            figureIdSet.add(id)
        let newIdArray = new Array<number>()
        
        let layer = this.layerById(layerID)
        for (let index in layer.data) {
            let fig = layer.data[index]
            if (!figureIdSet.has(fig.id))
                continue
                
            if (fig.transform(matrix))
                continue

            let transform = new figure.Transform()
            transform.id = (layer as Layer).createFigureId()
            newIdArray.push(transform.id)
            transform.matrix = new Matrix(matrix)
            transform.childFigures.push(fig)
            layer.data[index] = transform
        }

        for (let listener of this.listeners) {
            listener[0].transform(layerID, figureIdArray, matrix, newIdArray)
        }
    }
}

export class Layer extends FigureModel implements valuetype.Layer {
    id!: number
    name!: string
    highestFigureId?: number

    constructor(init?: Partial<Layer>) {
        super(init)
        value.initLayer(this, init)
    }

    findFigureAt(point: Point): Figure | undefined {
        return undefined
    }
    
    createFigureId(): number {
        if (this.highestFigureId === undefined) {
            this.highestFigureId = 0
            for(let figure of this.data) {
                if (figure.id > this.highestFigureId) { // FIXME: recursive
                    this.highestFigureId = figure.id
                }
            }
        }
        return ++this.highestFigureId
    }
}

// FIXME: share with client
namespace figure {

export abstract class Figure extends valueimpl.Figure
{
    public static readonly FIGURE_RANGE = 5.0
    public static readonly HANDLE_RANGE = 5.0

    constructor(init?: Partial<Figure>) {
        super(init)
        console.log("workflow.Figure.constructor()")
    }
    
    getPath(): Path {
	    throw Error("not implemented")
    }

    updateSVG(path: AbstractPath, svg?: SVGElement): SVGElement {
        throw Error("not implemented")
    }

    distance(pt: Point): number {
        throw Error("not implemented")
    }

    bounds(): geometry.Rectangle {
        throw Error("not implemented")
    }
    
}

export abstract class AttributedFigure extends Figure implements valuetype.figure.AttributedFigure
{
    stroke!: string
    strokeWidth!: number
    fill!: string

    constructor(init?: Partial<AttributedFigure>) {
        super(init)
        value.figure.initAttributedFigure(this, init)
        this.stroke = "#000"
        this.strokeWidth = 1.0
        this.fill = "#fff"
    }
}

export abstract class Shape extends AttributedFigure implements valuetype.figure.Shape
{
    origin!: Point
    size!: Size

    constructor(init?: Partial<Shape>) {
        super(init)
        value.figure.initShape(this, init)
    }

    transform(transform: Matrix): boolean {
        if (!transform.isOnlyTranslateAndScale())
            return false
        this.origin = transform.transformPoint(this.origin)
        this.size   = transform.transformSize(this.size)
        return true
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
}

export class Rectangle extends Shape implements valuetype.figure.Rectangle
{
    constructor(init?: Partial<Rectangle>) {
        super(init)
        value.figure.initRectangle(this, init)
        this.stroke = "#000"
        this.strokeWidth = 1.0
        this.fill = "#fff"
    }
    
}

export class Circle extends Shape implements valuetype.figure.Circle
{
    stroke: string
    fill: string
    
    constructor(init?: Partial<Rectangle>) {
        super(init)
        value.figure.initRectangle(this, init)
        this.stroke = "#000"
        this.fill = "#fff"
    }
    
}

export class Group extends Figure implements valuetype.figure.Group
{
    childFigures!: Array<Figure>

    constructor(init?: Partial<Group>) {
        super(init)
        value.figure.initGroup(this, init)
    }

    transform(transform: Matrix): boolean {
        return true
    }
    
    getHandlePosition(i: number): Point | undefined {
        return undefined
    }

    setHandlePosition(handle: number, pt: Point): void {
    }
}


export class Transform extends Group implements valuetype.figure.Transform {
    matrix!: Matrix

    constructor(init?: Partial<Transform>) {
        super(init)
        value.figure.initTransform(this, init)
    }

    transform(transform: Matrix): boolean {
        this.matrix.append(transform)
        return true
    }
    
    getHandlePosition(i: number): Point | undefined {
        return undefined
    }

    setHandlePosition(handle: number, pt: Point): void {
    }
}


} // namespace figure
