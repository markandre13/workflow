export class Origin
{
    x: number
    y: number
    
    constructor(x?: number, y?: number) {
        this.x = x ? x : 0
        this.y = y ? y : 0
    }
}

export class Size {
    width: number
    height: number
    constructor(width?: number, height?: number) {
        this.width = width ? width : 0
        this.height = height ? height : 0
    }
}

export abstract class Figure {
}

export class FigureModel {
    data: Array<Figure>
    constructor() {
        this.data = new Array<Figure>()
    }
}

export class Rectangle extends Figure {
    origin: Origin
    size: Size
    constructor(x?: number, y?: number, width?: number, height?: number) {
        super()
        this.origin = new Origin(x, y)
        this.size   = new Size(width, height)
    }
}

export class Layer extends FigureModel {
  id: number
  name: string
  locked: boolean
  
  constructor(id: number, name: string, locked=false) {
    super()
    this.id = id
    this.name = name
    this.locked = locked !== undefined ? locked : false
  }

  createFigure(msg: any) {
/*
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
*/
  }

  moveFigure(msg: any) {
/*
    // could check access rights here

    this.data[msg.idx].x += msg.x;
    this.data[msg.idx].y += msg.y;

    delete msg.client;
    let json = JSON.stringify(msg);
    for(let client of wss.clients) { // could later reduce this to all clients registered for this board
      client.send(json);
    }
*/
  }

  moveHandle(msg: any) {
/*
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
*/
  }
}

export class Board {
    id: number
    name: string
    layers: Array<Layer>
    constructor(id: number, name: string, layers?: Array<Layer>) {
      this.id = id
      this.name = name
      this.layers = layers ? layers : new Array<Layer>()
    }
}
