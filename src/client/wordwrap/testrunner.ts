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

import * as value from "shared/workflow_value"
import { Point, Size, Rectangle, pointEqualsPoint } from "shared/geometry"
import { Path } from "../paths/Path"
import { WordWrap } from "./wordwrap"

export type Placer = (wordwrap: WordWrap, boxes: Array<Size>|undefined, box: Size, svg: SVGElement) => Point|undefined

/**
 * Execute a single wordwrap test along with appending a visual
 * representation to the browser window.
 */
export class WordWrapTestRunner {
    handles = new Array<SVGElement>()
    handleIndex = -1
    decoration = new Array<SVGElement>()
    point?: Point

    placer: Placer

    svg?: SVGElement

    constructor(title: string, path: Path, boxes: Array<Size>|undefined, box: value.Rectangle, trace: boolean, placer: Placer) {
        this.placer = placer
    
        // text measuring might not work when this isn't connected to document.body???
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        svg.style.border = "1px solid #ddd"
        svg.setAttributeNS("", "width", "320")
        svg.setAttributeNS("", "height", "200")
        svg.setAttributeNS("", "viewBox", "0 0 320 200")
        // attach svg to the document so that measuring text dimensions works
        document.body.appendChild(svg)
        document.body.oncontextmenu = (event: Event): boolean => {
            event.preventDefault()
            return false
        }
        if (title !== "VISUAL-UNIT-TEST") {
            let text = document.createElementNS("http://www.w3.org/2000/svg", "text")
            text.setAttributeNS("", "fill", "#000")
            text.setAttributeNS("", "x", "2")
            text.setAttributeNS("", "y", "194")
            text.appendChild(document.createTextNode(title))
            svg.appendChild(text)   
            document.body.appendChild(svg)
        } else {
            this.svg = svg
        }
        
        // path.setAttributes({stroke: "#000", fill: "none"})
        // path.updateSVG()
        svg.appendChild(path.createSVG())
    
        this.createHandles(svg, path)
        svg.onmousedown = (event: MouseEvent) => { this.mouseDown(event, svg, path) }
        svg.onmousemove = (event: MouseEvent) => { this.mouseMove(event, svg, path) }
        svg.onmouseup   = (event: MouseEvent) => { this.mouseUp(event, svg, path) }
    
        this.doWrap(svg, path, boxes, box, trace)
    }

    doWrap(svg: SVGElement, path: Path, boxes?:Array<Size>, expectedLastBox?: value.Rectangle, trace?: boolean) {
        for(let deco of this.decoration) {
            svg.removeChild(deco)
        }
        this.decoration.length = 0
        
        let wordwrap = new WordWrap(path, undefined, trace == true)
        let box = expectedLastBox ? expectedLastBox.size : new Size(80, 40)
        
        let pt
        try {
            pt = this.placer(wordwrap, boxes, box, svg)
            // console.log("PLACER RETURNED POINT", pt)
        }
        catch(e) {
            let text = document.createElementNS("http://www.w3.org/2000/svg", "text")
            text.setAttributeNS("", "fill", "#f00")
            text.setAttributeNS("", "x", "5")        
            text.setAttributeNS("", "y", "16")
            text.textContent = "EXCEPTION"
            svg.appendChild(text)
            console.log(e)
            pt = undefined
            expectedLastBox = new Rectangle(0,0,320,200)
        }

        this.point = pt

        if (pt !== undefined) {
            let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
            rect.setAttributeNS("", "stroke", "#f00")
            rect.setAttributeNS("", "fill", "none")
            rect.setAttributeNS("", "x", String(pt.x))
            rect.setAttributeNS("", "width", String(box.width))
            rect.setAttributeNS("", "y", String(pt.y))
            rect.setAttributeNS("", "height", String(box.height))
            svg.appendChild(rect)
            this.decoration.push(rect)
            if (expectedLastBox && !pointEqualsPoint(pt, expectedLastBox.origin)) {
                svg.style.background="#f88"
            }
        } else {
            if (expectedLastBox && expectedLastBox.origin.x != -1) {
                svg.style.background="#f88"
            }
        }
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
        for(let entry of path.data) {
            if (entry.type === "Z")
                continue
            let handle = this.createHandle(entry.values[0], entry.values[1])
            svg.appendChild(handle)
            this.handles.push(handle)
        }
    }

    selectHandle(path: Path, mouseLocation: Point) {
        this.handleIndex = 0
        for(let entry of path.data) {
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
        // let index = 0
        // for(let entry of path.data) {
        //     if (entry.type !== "Z") {
        //         let handleBoundary = new Rectangle(entry.values[0]-2.5, entry.values[1]-2.5, 5, 5)
        //         if (handleBoundary.contains(mouseLocation)) {
        //             if (path.data.length <= 4)
        //                 return true
        //             path.data.splice(index, 1)
        //             path.data[0].type = "M"
        //             path.updateSVG()
        //             this.handles[index].parentNode!.removeChild(this.handles[index]!)
        //             this.handles.splice(index, 1)
        //             return true
        //         }
        //     }
        //     ++index
        // }
        return false
    }

    insertHandle(path: Path, mouseLocation: Point) {
        // let index = 0, p0, p1, pm
        // for(let entry of path.data) {
        //     if (entry.type !== "Z") {
        //         p0 = p1
        //         p1 = new Point(entry.values[0], entry.values[1])
        //         if (entry.type === "M") {
        //             pm = p1
        //         }
        //     } else {
        //         p0 = p1
        //         p1 = pm
        //     }
        //     if (p0 !== undefined) {
        //         if (distancePointToLine(mouseLocation, p0, p1!) < 2.5) {
        //             console.log("insert point")
        //             path.data.splice(index, 0, {
        //                 type: "L",
        //                 values: [mouseLocation.x, mouseLocation.y]
        //             })
        //             path.data[0].type = "M"
        //             path.data[1].type = "L"
        //             path.updateSVG()
                    
        //             let handle = this.createHandle(mouseLocation.x, mouseLocation.y)
        //             this.handles[0].parentNode!.appendChild(handle)
        //             this.handles.splice(index, 0, handle)
                    
        //             return true
        //         }
        //     }
        //     ++index
        // }
        // return false
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
    for(let entry of path.data) {
        if (entry.type === "M" || entry.type === "L") {
            text += `        {x: ${entry.values[0]}, y: ${entry.values[1]}},\n`
        }
    }
    let point = this.point
    if (point == undefined) {
        point = new Point(-1, -1)
    }
    text += `    ],
    box: { origin: { x: ${point.x}, y: ${point.y} }, size: { width: ?, height: ? } }
}`
                debug.innerText = text
                } break
            case 2:
                // if (this.removeHandle(path, mouseLocation)) {
                //     this.doWrap(svg, path)
                //     return
                // }
                // if (this.insertHandle(path, mouseLocation)) {
                //     this.doWrap(svg, path)
                //     return
                // }
                break
        }
    }
        
    mouseMove(event: MouseEvent, svg: SVGElement, path: Path) {
       event.preventDefault()
       let boundary = svg.getBoundingClientRect()
       let mouseLocation = new Point(event.x - boundary.left, event.y - boundary.top)
    //    if (this.handleIndex !== -1) {
    //         this.handles[this.handleIndex].setAttributeNS("", "x", String(Math.round(mouseLocation.x)-2.5))
    //         this.handles[this.handleIndex].setAttributeNS("", "y", String(Math.round(mouseLocation.y)-2.5))
    //         path.data[this.handleIndex].values = [mouseLocation.x, mouseLocation.y]
    //         path.updateSVG()
    //         this.doWrap(svg, path)
    //     }
    }
            
    mouseUp(event: MouseEvent, svg: SVGElement, path: Path) {
        event.preventDefault()
        this.mouseMove(event, svg, path)
        if (this.handleIndex !== -1) {
            this.handleIndex = -1
            return
        }
    }

}
