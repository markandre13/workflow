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

import * as WebSocket from "ws"
import * as knex from "knex"
import * as crypto from "crypto"
//import * as scrypt from "scrypt"
var scrypt = require("scrypt")
var scryptParameters = scrypt.paramsSync(0.1)

import { ORB } from "corba.js/lib/orb/orb-nodejs" // FIXME corba.js/nodejs corba.js/browser ?
import * as iface from "../shared/workflow"
import * as skel from "../shared/workflow_skel"
import * as stub from "../shared/workflow_stub"
import { Point, Size, Matrix, Rectangle, Figure, FigureModel, Layer, BoardData } from "../shared/workflow_valueimpl"
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
          layers: JSON.stringify([{"#T":"Layer","#V":{"data":[{"#T":"figure.Rectangle","#V":{"id":1,"origin":{"#T":"Point","#V":{"x":25.5,"y":5.5}},"size":{"#T":"Size","#V":{"width":50,"height":80}}}},{"#T":"figure.Rectangle","#V":{"id":2,"origin":{"#T":"Point","#V":{"x":85.5,"y":45.5}},"size":{"#T":"Size","#V":{"width":50,"height":80}}}}],"id":20,"name":"Scrible"}}])
        }
    ])

    let orb = new ORB()
//orb.debug = 1
    orb.register("Server", Server_impl)
    orb.register("Project", Project_impl)
    orb.register("Board", Board_impl)
    orb.registerStub("BoardListener", stub.BoardListener)
    ORB.registerValueType("Point", Point)
    ORB.registerValueType("Size", Size)
    ORB.registerValueType("Matrix", Matrix)
    ORB.registerValueType("Rectangle", Rectangle)
    ORB.registerValueType("Figure", Figure)
    ORB.registerValueType("figure.Rectangle", valueimpl.figure.Rectangle)
    ORB.registerValueType("FigureModel", FigureModel)
    ORB.registerValueType("BoardData", valueimpl.BoardData)
    ORB.registerValueType("Layer", Layer)

    orb.listen("0.0.0.0", 8000)

    console.log("listening...")
}

class Server_impl extends skel.Server {
    client: stub.Client

    constructor(orb: ORB) {
        super(orb)
        console.log("Server_impl.constructor()")
        this.client = new stub.Client(orb)
    }
    
    destructor() { // FIXME: corba.js should invoke this method when the connection get's lost?
        console.log("Server_impl.destructor()")
//        this.board.unregisterWatcher(this)
    }
    
    async init(aSession: string) {
        console.log("Server_impl.init()")
        if (testing) {
            this.client.homeScreen("", "img/avatars/pig.svg", "pig@mark13.org", "Pig")
            return
        }
        if (aSession.length !== 0) {
            let session = aSession.split(":")
            let logon = session[0]
            let sessionkey = Buffer.from(session[1], 'base64')
            let result = await db.select("uid", "avatar", "email", "fullname", "sessionkey").from("users").where({logon: logon, sessionkey: sessionkey})
            if (result.length === 1) {
                let user = result[0]
                this.client.homeScreen("", user.avatar, user.email, user.fullname)
                return
            }
        }
        this.client.logonScreen(30, disclaimer, false, "")
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

            this.client.homeScreen(
                // FIXME: hardcoded server URL
                "session="+logon+":"+base64SessionKey+"; domain=192.168.1.105; path=/~mark/workflow/; max-age="+String(60*60*24*1),
                user.avatar,
                user.email,
                user.fullname)
        } else {
            this.client.logonScreen(30, disclaimer, remember, "Unknown user and/or password. Please try again.")
        }
    }
    
    async translateFigures(delta: Point) {
        console.log("Server_impl.translateFigures(): ", delta)
/*
        let project = projectStorage.get(projectID)
        let board = project.get(boardID)
        let layer = board.get(layerID)
        let figure = layer.get(figureID)
        figure.translate(delta)
*/
    }
    
    async getProject(projectID: number) {
        console.log("Server_impl.getProject("+projectID+")")
        
        let result = await db.select("pid", "name", "description").from("projects").where({pid: projectID})
        if (result.length === 1) {
            console.log("got project")
            return new Project_impl(this.orb, result[0])
        }
        throw Error("Server_impl.getProject("+projectID+"): no such project")
    }
}

interface ProjectData {
    pid: number
    name: string
    description: string
}

class Project_impl extends skel.Project {
    data: ProjectData

    constructor(orb: ORB, data: ProjectData) {
        super(orb)
        this.data = data
        console.log("Project_impl.constructor()")
    }

    async getBoard(boardID: number) {
        console.log("Project_impl.getBoard("+boardID+")")
        
        let result = await db.select("bid", "name", "description", "layers").from("boards").where({pid: this.data.pid, bid: boardID})
        if (result.length === 1) {
            console.log("got board")
            result[0].layers = this.orb.deserialize(result[0].layers)
            let boarddata = new valueimpl.BoardData(result[0])
            return new Board_impl(this.orb, boarddata)
        }
        throw Error("Project_impl.getBoard("+boardID+"): no such board")
    }
}

class Board_impl extends skel.Board {
    data: BoardData
    listeners: Set<stub.BoardListener>

    constructor(orb: ORB, data: BoardData) {
        super(orb)
        this.data = data
        this.listeners = new Set<stub.BoardListener>()
        console.log("Board_impl.constructor()")
    }
    
    async getData() {
        return this.data
    }

    async addListener(listener: stub.BoardListener) {
        if (this.listeners.has(listener))
            return
        this.listeners.add(listener)
//        listener.orb.addEventListener("close", () => {
//            this.removeListener(listener)
//        })
    }
    
    async removeListener(listener: stub.BoardListener) {
        if (!this.listeners.has(listener))
            return
        this.listeners.delete(listener)
//        listener.orb.deleteEventListener("close", ...)
    }
    
    async transform(layerID: number, figureIDs: Array<number>, matrix: Matrix) {
//        console.log("Board_impl.transform(", figureIDs, ", ", matrix, ")")
        for (let listener of this.listeners)
            listener.transform(layerID, figureIDs, matrix)
    }
}


/*

var wss = new WebSocket.Server({host: '0.0.0.0',port: 8000}, function() {
  console.log("ready")
})

wss.on("error", function(error: any) {
  switch(error.code) {
    case "EADDRINUSE":
      console.log("error: another server is already running at "+error.address+":"+error.port)
      break
    default:
      console.log("error", error)
  }
})

wss.on('connection', function(client) {
  console.log("got client");

  client.on('open', function() {
    console.log("open");
  });
    
  client.onmessage = function(message: any) {
console.log("got "+message)
    var msg = JSON.parse(message);
    msg.client = client;
    switch(msg.cmd) {
      case 'init': init(msg); break;
      case 'logon': logon(msg); break;
      case 'create': createFigure(msg); break;
      case 'move': moveFigure(msg); break;
      case 'hndl': moveHandle(msg); break;
      case 'enter':
      case 'pointer':
      case 'leave': {
        delete msg.client;
        let json = JSON.stringify(msg);
        for(let client of wss.clients) { // could later reduce this to all clients registered for this board
          // TODO: skip sender
          client.send(json);
        }
        } break;
      
      default:
        delete msg.client;
        console.log("unknown message", msg);
    }
  }

  client.on('close', function() {
    console.log("lost client");
  });
});

function init(msg: any) {
}

function logon(msg: any) {
  let loggedOn = false
  db.get('SELECT password, avatar, email, fullname FROM users WHERE name=?', [msg.logon], function(err, row) {
    if (row === undefined)
        return
    if (scrypt.verifyKdfSync(row["password"], msg.password)) {
      const sessionKey = crypto.randomBytes(64)
      let stmt = db.prepare("UPDATE users SET session=? WHERE name=?")
      stmt.run(sessionKey, msg.logon)
      const base64SessionKey = new Buffer(sessionKey).toString("base64")
      // cookie: secure="secure" require https?
      msg.client.send(JSON.stringify({
        cmd:'home',
        cookie: "session="+msg.logon+":"+base64SessionKey+"; domain=192.168.1.105; path=/~mark/workflow/; max-age="+String(60*60*24*1),
        avatar:row["avatar"],
        email:row["email"],
        fullname:row["fullname"],
        board:board
      }));
      loggedOn = true
    }
  })
  if (!loggedOn) {
    msg.client.send(JSON.stringify({
      cmd:'logon-request',
      lifetime: 30,
      disclaimer: disclaimer,
      msg: 'Unknown user and/or password. Please try again.'
    }));
  }
}

function createFigure(msg: any) {
  if (msg.board!=board.id) {
    console.log("create: unexpected board id "+msg.board);
    return;
  }
  if (msg.layer!=board.layers[0].id) {
    console.log("create: unexpected layer id "+msg.layer);
    return;
  }
  board.layers[0].createFigure(msg);
}

function moveFigure(msg: any) {
  if (msg.board!=board.id) {
    console.log("move: unexpected board id "+msg.board);
    return;
  }
  if (msg.layer!=board.layers[0].id) {
    console.log("move: unexpected layer id "+msg.layer);
    return;
  }
  board.layers[0].moveFigure(msg);
}

function moveHandle(msg: any) {
  if (msg.board!=board.id) {
    console.log("move: unexpected board id "+msg.board);
    return;
  }
  if (msg.layer!=board.layers[0].id) {
    console.log("move: unexpected layer id "+msg.layer);
    return;
  }
  board.layers[0].moveHandle(msg);
}

*/
