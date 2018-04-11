#!/usr/local/bin/node --harmony

console.log('booting workflow server v0.1')

var ws = require('ws')
var sqlite3 = require('sqlite3').verbose()
const crypto = require('crypto')
var scrypt = require('scrypt')
var scryptParameters = scrypt.paramsSync(0.1)

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

class Board {
}

class Layer {
  createFigure(msg) {
    console.log("create figure: '"+msg.type+"'")
    this.data.push(
      { type:'rect', x:msg.x, y:msg.y, width:msg.width, height:msg.height, stroke:msg.stroke, fill:msg.fill }
    )
    msg.idx = this.data.length
    let creator = msg.client
    delete msg.client;

    let json
    msg.creator = true
    json = JSON.stringify(msg)
    creator.send(json)
    msg.creator = false
    json = JSON.stringify(msg)
    for(let client of wss.clients) { // could later reduce this to all clients registered for this board
      if (client === creator)
        continue
      client.send(json);
    }
  }
  moveFigure(msg) {
    // could check access rights here

    this.data[msg.idx].x += msg.x;
    this.data[msg.idx].y += msg.y;

    delete msg.client;
    let json = JSON.stringify(msg);
    for(let client of wss.clients) { // could later reduce this to all clients registered for this board
      client.send(json);
    }
  }
  moveHandle(msg) {
    // could check access rights here
    // FIXME: share this code with the client
    let x0=this.data[msg.idx].x,
        x1=this.data[msg.idx].x+this.data[msg.idx].width,
        y0=this.data[msg.idx].y,
        y1=this.data[msg.idx].y+this.data[msg.idx].height
    switch(msg.hnd) {
      case 0: x0 = msg.x; y0 = msg.y; break;
      case 1: x1 = msg.x; y0 = msg.y; break;
      case 2: x1 = msg.x; y1 = msg.y; break;
      case 3: x0 = msg.x; y1 = msg.y; break;
    }
    if (x1<x0) [x0,x1] = [x1,x0];
    if (y1<y0) [y0,y1] = [y1,y0];
    this.data[msg.idx].x = x0
    this.data[msg.idx].y = y0
    this.data[msg.idx].width = x1-x0
    this.data[msg.idx].height = y1-y0

    delete msg.client;
    let json = JSON.stringify(msg);
    for(let client of wss.clients) { // could later reduce this to all clients registered for this board
      client.send(json);
    }
  }
}

let board = new Board();
board.id = 10;
board.name = 'Polisens mobila Utrednings STöd Project Board';
board.layers = [];

let layer = new Layer();
layer.id = 20;
layer.name = "Scrible";
layer.locked = false;
layer.data = [
  { type:'rect', x:25.5, y:5.5, width:50, height:80, stroke:'#000', fill:'#f00' },
  { type:'rect', x:85.5, y:45.5, width:50, height:80, stroke:'#000', fill:'#f00' }
];
board.layers.push(layer);

var db = new sqlite3.Database(':memory:');
db.serialize(function() {
  db.run('CREATE TABLE users (name VARCHAR(20) PRIMARY KEY, password CHAR(96) NOT NULL, session CHAR(64), avatar VARCHAR(128))');
  
  let stmt = db.prepare('INSERT INTO users(name, password, avatar) VALUES (?, ?, ?)');
  
  let hash = scrypt.kdfSync("secret", scryptParameters)
  stmt.run('mark', scrypt.kdfSync("secret", scryptParameters), "img/avatars/pig.svg");
  stmt.run('gita', scrypt.kdfSync("lovely", scryptParameters), "img/avatars/tiger.svg");
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

console.log('websocket server...');

var wss = new ws.Server({host: '0.0.0.0',port: 8000}, function() {
  console.log("ready")
})

wss.on("error", function(error) {
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
    
  client.on('message', function(message, flags) {
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
  });

  client.on('close', function() {
    console.log("lost client");
  });
});

function init(msg) {
  let loggedOn = false
  if (msg.session) {
    let session = msg.session.split(":")
    session[1] = Buffer.from(session[1], 'base64')
    db.get("SELECT avatar FROM users WHERE name=? AND session=?", session, function(err, row) {
      if (row === undefined)
        return
      loggedOn = true
      msg.client.send(JSON.stringify({
        cmd:'home',
        avatar:row["avatar"],
        board:board
      }))
    })
  }
  if (!loggedOn) {
    msg.client.send(JSON.stringify({
      cmd:'logon-request',
      lifetime: 30,
      disclaimer: disclaimer
    }));
  }
}

function logon(msg) {
  let loggedOn = false
  db.get('SELECT password, avatar FROM users WHERE name=?', [msg.logon], function(err, row) {
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

function createFigure(msg) {
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

function moveFigure(msg) {
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

function moveHandle(msg) {
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
