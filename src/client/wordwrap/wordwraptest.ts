import * as value from "../../shared/workflow_value"
import {
    Point, Size, Rectangle, Matrix,
    pointPlusSize, pointMinusPoint, pointPlusPoint, pointMultiplyNumber,
    pointMinus, pointEqualsPoint, signedArea, isZero, distancePointToLine
} from "../../shared/geometry"
import { Path } from "../path"
import { WordWrap, Slice } from "../wordwrap"

export class WordWrapTest {
    handles = new Array<SVGElement>()
    handleIndex = -1
    decoration = new Array<SVGElement>()

    constructor(title: string, path: Path, box: value.Rectangle) {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        svg.style.border = "1px solid #ddd"
        svg.setAttributeNS("", "width", "320")
        svg.setAttributeNS("", "height", "200")
        svg.setAttributeNS("", "viewBox", "0 0 320 200")

        let text = document.createElementNS("http://www.w3.org/2000/svg", "text")
        text.setAttributeNS("", "fill", "#000")
        text.setAttributeNS("", "x", "2")
        text.setAttributeNS("", "y", "194")
        text.appendChild(document.createTextNode(title))
        svg.appendChild(text)

        document.body.oncontextmenu = (event: Event): boolean => {
            event.preventDefault()
            return false
        }
        document.body.appendChild(svg)
        
        path.setAttributes({stroke: "#000", fill: "none"})
        path.updateSVG()
        svg.appendChild(path.svg)
    
        this.createHandles(svg, path)
        svg.onmousedown = (event: MouseEvent) => { this.mouseDown(event, svg, path) }
        svg.onmousemove = (event: MouseEvent) => { this.mouseMove(event, svg, path) }
        svg.onmouseup   = (event: MouseEvent) => { this.mouseUp(event, svg, path) }
    
        this.doWrap(svg, path, box)
    }

    createHandle(x: number, y: number): SVGElement {
        let handle = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        handle.setAttributeNS("", "stroke", "#48f")
        handle.setAttributeNS("", "fill", "none")
        handle.setAttributeNS("", "x", String(x-2.5))
        handle.setAttributeNS("", "y", String(y-2.5))
        handle.setAttributeNS("", "width", "5")
        handle.setAttributeNS("", "height", "5")
        return handle
    }

    createHandles(svg: SVGElement, path: Path) {
        for(let entry of path.path) {
            if (entry.type === "Z")
                continue
            let handle = this.createHandle(entry.values[0], entry.values[1])
            svg.appendChild(handle)
            this.handles.push(handle)
        }
    }

    selectHandle(path: Path, mouseLocation: Point) {
        this.handleIndex = 0
        for(let entry of path.path) {
            if (entry.type !== "Z") {
                let handleBoundary = new Rectangle(entry.values[0]-2.5, entry.values[1]-2.5, 5, 5)
                if (handleBoundary.contains(mouseLocation)) {
                    return
                }
            }
            ++this.handleIndex
        }
        this.handleIndex = -1
    }

    removeHandle(path: Path, mouseLocation: Point): boolean {
        let index = 0
        for(let entry of path.path) {
            if (entry.type !== "Z") {
                let handleBoundary = new Rectangle(entry.values[0]-2.5, entry.values[1]-2.5, 5, 5)
                if (handleBoundary.contains(mouseLocation)) {
                    if (path.path.length <= 4)
                        return true
                    path.path.splice(index, 1)
                    path.path[0].type = "M"
                    path.updateSVG()
                    this.handles[index].parentNode!.removeChild(this.handles[index]!)
                    this.handles.splice(index, 1)
                    return true
                }
            }
            ++index
        }
        return false
    }

    insertHandle(path: Path, mouseLocation: Point) {
        let index = 0, p0, p1, pm
        for(let entry of path.path) {
            if (entry.type !== "Z") {
                p0 = p1
                p1 = new Point(entry.values[0], entry.values[1])
                if (entry.type === "M") {
                    pm = p1
                }
            } else {
                p0 = p1
                p1 = pm
            }
            if (p0 !== undefined) {
                if (distancePointToLine(mouseLocation, p0, p1!) < 2.5) {
                    console.log("insert point")
                    path.path.splice(index, 0, {
                        type: "L",
                        values: [mouseLocation.x, mouseLocation.y]
                    })
                    path.path[0].type = "M"
                    path.path[1].type = "L"
                    path.updateSVG()
                    
                    let handle = this.createHandle(mouseLocation.x, mouseLocation.y)
                    this.handles[0].parentNode!.appendChild(handle)
                    this.handles.splice(index, 0, handle)
                    
                    return true
                }
            }
            ++index
        }
        return false
    }

    mouseDown(event: MouseEvent, svg: SVGElement, path: Path) {
        event.preventDefault()
        let boundary = svg.getBoundingClientRect()
        let mouseLocation = new Point(event.x - boundary.left, event.y - boundary.top)
        switch(event.button) {
            case 0:
                this.selectHandle(path, mouseLocation)
                break
            case 1: {
                let debug = document.getElementById("debug")!
                let text = `{
    title: "?",
    polygon: [\n`
    for(let entry of path.path) {
        if (entry.type === "M" || entry.type === "L") {
            text += `        {x: ${entry.values[0]}, y: ${entry.values[1]}},\n`
        }
    }
    text += `    ],
    box: { origin: { x: ?, y: ? }, size: { width: ?, height: ? } }
}`
                debug.innerText = text
                } break
            case 2:
                if (this.removeHandle(path, mouseLocation)) {
                    this.doWrap(svg, path)
                    return
                }
                if (this.insertHandle(path, mouseLocation)) {
                    this.doWrap(svg, path)
                    return
                }
                break
        }
    }
        
    mouseMove(event: MouseEvent, svg: SVGElement, path: Path) {
       event.preventDefault()
       let boundary = svg.getBoundingClientRect()
       let mouseLocation = new Point(event.x - boundary.left, event.y - boundary.top)
       if (this.handleIndex !== -1) {
            this.handles[this.handleIndex].setAttributeNS("", "x", String(Math.round(mouseLocation.x)-2.5))
            this.handles[this.handleIndex].setAttributeNS("", "y", String(Math.round(mouseLocation.y)-2.5))
            path.path[this.handleIndex].values = [mouseLocation.x, mouseLocation.y]
            path.updateSVG()
            this.doWrap(svg, path)
        }
    }
            
    mouseUp(event: MouseEvent, svg: SVGElement, path: Path) {
        event.preventDefault()
        this.mouseMove(event, svg, path)
        if (this.handleIndex !== -1) {
            this.handleIndex = -1
            return
        }
    }

    doWrap(svg: SVGElement, path: Path, theBox?: value.Rectangle) {
        for(let deco of this.decoration) {
            svg.removeChild(deco)
        }
        this.decoration.length = 0
        
        let wordwrap = new WordWrap(path)
        let box = theBox ? theBox.size : new Size(80, 40)
        
        let slices = new Array<Slice>()
        wordwrap.extendSlices(new Point(0,0), box, slices)
        
        wordwrap.levelSlicesHorizontally(slices)
        
        const color = ["#f00", "#f80", "#0f0", "#00f", "#08f"]

        let pt = wordwrap.pointForBoxInCorner2(box, slices)
        if (pt !== undefined) {
            let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
            rect.setAttributeNS("", "stroke", color[0])
            rect.setAttributeNS("", "fill", "none")
            rect.setAttributeNS("", "x", String(pt.x))
            rect.setAttributeNS("", "width", String(box.width))
            rect.setAttributeNS("", "y", String(pt.y))
            rect.setAttributeNS("", "height", String(box.height))
            svg.appendChild(rect)
            this.decoration.push(rect)
            if (theBox && !pointEqualsPoint(pt, theBox.origin)) {
                console.log(pt)
                svg.style.background="#f88"
            }
        } else {
            if (theBox && theBox.origin.x != -1) {
                svg.style.background="#f88"
            }
        }
    }
}
