#!/usr/local/bin/node --harmony

console.log('booting workflow server v0.1')

import * as WebSocket from "ws"
import * as sqlite3 from "sqlite3"
import * as crypto from "crypto"
//import * as scrypt from "scrypt"
var scrypt = require("scrypt")
var scryptParameters = scrypt.paramsSync(0.1)

import { ORB } from "corba.js/lib/orb-nodejs" // FIXME corba.js/nodejs corba.js/browser ?
import { Server_skel } from "../shared/workflow_skel"
import { Client } from "../shared/workflow_stub"
import { Origin, Size, Figure, Rectangle, FigureModel, Layer, Board } from "../shared/workflow_valuetype"

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
layer.data.push(new Rectangle(new Origin(25.5, 5.5), new Size(50, 80))) // stroke & fill
layer.data.push(new Rectangle(new Origin(85.5, 45.5), new Size(50, 80)))
board.layers.push(layer)

var db = new sqlite3.Database(':memory:');
db.serialize(function() {
  db.run(`CREATE TABLE users (
            uid INT,
            logon VARCHAR(20) PRIMARY KEY,
            password CHAR(96) NOT NULL,
            sessionkey BLOB(64),
            avatar VARCHAR(128),
            email VARCHAR(128),
            fullname VARCHAR(128)
          )`);
  
  let stmt = db.prepare('INSERT INTO users(uid, logon, password, avatar, email, fullname) VALUES (?, ?, ?, ?, ?, ?)');
  
  let hash = scrypt.kdfSync("secret", scryptParameters)
  stmt.run(1, "mark", scrypt.kdfSync("secret", scryptParameters), "img/avatars/pig.svg", "mhopf@mark13.org", "Mark-André Hopf");
  stmt.run(2, "tiger", scrypt.kdfSync("lovely", scryptParameters), "img/avatars/tiger.svg", "tiger@mark13.org", "Elena Peel");
  stmt.finalize();
/*  
  db.each('SELECT name, password FROM users', function(err, row) {
    console.log(err, row);
  });
  
  db.get('SELECT COUNT(*) FROM users WHERE name=? AND password=?', ['mark', 'secret'], function(err, row) {
    console.log(err, row['COUNT(*)']);
  });
*/
});

class Server_impl extends Server_skel {
    client: Client

    constructor(orb: ORB) {
        super(orb)
        console.log("Server_impl.constructor()")
        this.client = new Client(orb)
    }
    
    init(aSession: string): void {
        console.log("Server_impl.init()")
        if (aSession.length !== 0) {
            let session = aSession.split(":")
            let logon = session[0]
            let sessionkey = Buffer.from(session[1], 'base64')
            db.get("SELECT uid, avatar, email, fullname FROM users WHERE logon=? AND sessionkey=?", [logon, sessionkey], (err, row) => {
                if (row === undefined) {
                    this.client.logonScreen(30, disclaimer, false, "")
                } else {
                    this.client.homeScreen(
                        "",
                        row["avatar"],
                        row["email"],
                        row["fullname"],
                        board
                    )
                }
            })
        } else {
            this.client.logonScreen(30, disclaimer, false, "")
        }
    }

    logon(logon: string, password: string, remember: boolean): void {
        console.log("Server_impl.logon()")
        db.get('SELECT password, avatar, email, fullname FROM users WHERE logon=?', [logon], (err, row) => {
            if (row !== undefined && scrypt.verifyKdfSync(row["password"], password)) {
                const sessionKey = crypto.randomBytes(64)
                let stmt = db.prepare("UPDATE users SET sessionkey=? WHERE logon=?")
                stmt.run(sessionKey, logon)
                const base64SessionKey = String(Buffer.from(sessionKey).toString("base64"))
                // cookie: secure="secure" require https?
                this.client.homeScreen(
                    // FIXME: hardcoded server URL
                    "session="+logon+":"+base64SessionKey+"; domain=192.168.1.105; path=/~mark/workflow/; max-age="+String(60*60*24*1),
                    row["avatar"],
                    row["email"],
                    row["fullname"],
                    board
                )
            } else {
                this.client.logonScreen(30, disclaimer, remember, "Unknown user and/or password. Please try again.")
            }
        })
    }
}

let orb = new ORB()

orb.register("Server", Server_impl)
orb.registerValueType("Origin", Origin)
orb.registerValueType("Size", Size)
orb.registerValueType("Figure", Figure)
orb.registerValueType("Rectangle", Rectangle)
orb.registerValueType("FigureModel", FigureModel)
orb.registerValueType("Layer", Layer)
orb.registerValueType("Board", Board)

orb.listen("0.0.0.0", 8000)

console.log("listening...")

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
