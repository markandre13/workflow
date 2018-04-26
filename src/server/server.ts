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

import { ORB } from "corba.js/lib/orb-nodejs" // FIXME corba.js/nodejs corba.js/browser ?
import { Server_skel } from "../shared/workflow_skel"
import { Client } from "../shared/workflow_stub"
import { Point, Size, Rectangle, Figure, FigureModel, Layer, Board } from "../shared/workflow_valuetype"
import * as valuetype from "../shared/workflow_valuetype"

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

let board = new Board(10, "Polisens mobila Utrednings STöd Project Board")
let layer = new Layer(20, "Scrible")
layer.data.push(new valuetype.figure.Rectangle(new Point(25.5, 5.5), new Size(50, 80))) // stroke & fill
layer.data.push(new valuetype.figure.Rectangle(new Point(85.5, 45.5), new Size(50, 80)))
board.layers.push(layer)

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
        table.string("logon", 20)
        table.string("password", 96)
        table.string("sessionkey", 64)
        table.string("fullname", 128)
        table.string("email", 128)
        table.string("avatar", 128)
    })
    
    await db("users").insert([
        { logon: "mark" , password: scrypt.kdfSync("secret", scryptParameters), avatar: "img/avatars/pig.svg",   email: "mhopf@mark13.org", fullname: "Mark-André Hopf" },
        { logon: "tiger", password: scrypt.kdfSync("lovely", scryptParameters), avatar: "img/avatars/tiger.svg", email: "tiger@mark13.org", fullname: "Elena Peel" }
    ])

    let orb = new ORB()

    orb.register("Server", Server_impl)
    orb.registerValueType("Point", Point)
    orb.registerValueType("Size", Size)
    orb.registerValueType("Rectangle", Rectangle)
    orb.registerValueType("Figure", Figure)
    orb.registerValueType("figure::Rectangle", valuetype.figure.Rectangle)
    orb.registerValueType("FigureModel", FigureModel)
    orb.registerValueType("Layer", Layer)
    orb.registerValueType("Board", Board)

    orb.listen("0.0.0.0", 8000)

    console.log("listening...")
}

class Server_impl extends Server_skel {
    client: Client

    constructor(orb: ORB) {
        super(orb)
        console.log("Server_impl.constructor()")
        this.client = new Client(orb)
    }
    
    destructor() { // FIXME: corba.js should invoke this method when the connection get's lost?
        console.log("Server_impl.destructor()")
    }
    
    async init(aSession: string) {
        console.log("Server_impl.init()")
        if (aSession.length !== 0) {
            let session = aSession.split(":")
            let logon = session[0]
            let sessionkey = Buffer.from(session[1], 'base64')
            let result = await db.select("uid", "avatar", "email", "fullname", "sessionkey").from("users").where({logon: logon, sessionkey: sessionkey})
            if (result.length === 1) {
                let user = result[0]
                this.client.homeScreen("", user.avatar, user.email, user.fullname, board)
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
            this.client.homeScreen(
                // FIXME: hardcoded server URL
                "session="+logon+":"+base64SessionKey+"; domain=192.168.1.105; path=/~mark/workflow/; max-age="+String(60*60*24*1),
                user.avatar,
                user.email,
                user.fullname,
                board
            )
        } else {
            this.client.logonScreen(30, disclaimer, remember, "Unknown user and/or password. Please try again.")
        }
    }
    
    async translateFigures(delta: Point) {
      console.log("Server_impl.translateFigures(): ", delta)
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
