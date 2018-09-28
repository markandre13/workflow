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

import { OrderedArray } from "./orderedarray"
import {
    Point, Size, Rectangle, Matrix,
    pointPlusSize, pointMinusPoint, pointPlusPoint, pointMultiplyNumber,
    pointMinus, pointEqualsPoint, signedArea, isZero, distancePointToLine
} from "../shared/geometry"
import { Path } from "./path"

import { WordWrapTest } from "./wordwrap/wordwraptest"

// description of an intersection between path segments
export class IntersectionEnd {
    type: string	// 'L'line or 'C'urve, as used in Path // FIXME: enum?
    src: Array<Point>	// data for L or C
    u: number		// position of intersection on src within [0, 1]
    pt: Point		// the actual calculated location of the intersection
    constructor(type: string, src: Array<Point>, u: number, pt: Point) {
        this.type = type
        this.src  = src
        this.u    = u
        this.pt   = pt
    }
}

export class Intersection {
    seg0: IntersectionEnd
    seg1: IntersectionEnd
    
    constructor(t0: string, s0: Array<Point>, u0: number, p0: Point,
                t1: string, s1: Array<Point>, u1: number, p1: Point)
    {
        this.seg0 = new IntersectionEnd(t0, s0, u0, p0)
        this.seg1 = new IntersectionEnd(t1, s1, u1, p1)
    }
}

export function _intersectLineLine(lineA: Array<Point>, lineB: Array<Point>): Point|undefined
{
  let ax = lineA[1].x - lineA[0].x,
      ay = lineA[1].y - lineA[0].y,
      bx = lineB[1].x - lineB[0].x,
      by = lineB[1].y - lineB[0].y,
      cross = ax*by - ay*bx

  if (isZero(cross))
    return undefined
     
  let 
    dx = lineA[0].x - lineB[0].x,
    dy = lineA[0].y - lineB[0].y,
    a = (bx * dy - by * dx) / cross,
    b = (ax * dy - ay * dx) / cross;
  if (a<0.0 || a>1.0 || b<0.0 || b>1.0)
    return undefined
  return new Point(lineA[0].x + a * ax, lineA[0].y + a * ay)
}

export function intersectLineLine(ilist: Array<Intersection>, lineA: Array<Point>, lineB: Array<Point>)
{
  let ax = lineA[1].x - lineA[0].x,
      ay = lineA[1].y - lineA[0].y,
      bx = lineB[1].x - lineB[0].x,
      by = lineB[1].y - lineB[0].y,
      cross = ax*by - ay*bx
  if (isZero(cross))
    return;
     
  let 
    dx = lineA[0].x - lineB[0].x,
    dy = lineA[0].y - lineB[0].y,
    a = (bx * dy - by * dx) / cross,
    b = (ax * dy - ay * dx) / cross;
  if (a<0.0 || a>1.0 || b<0.0 || b>1.0)
    return
  let p = new Point(lineA[0].x + a * ax, lineA[0].y + a * ay)
  ilist.push(new Intersection("L", lineA, a, p,
                              "L", lineB, b, p))
}

// a path is broken down into sweep events for the sweep algorithm
export class SweepEvent
{
    type: string
    p: Array<Point>
    
    constructor(p0: Point, p1: Point) {
        this.type = "L"
        this.p = new Array<Point>()
        this.p.push(p0)
        this.p.push(p1)
    }

    static less(e0: SweepEvent, e1: SweepEvent): boolean {
        if (e0.p[0].y < e1.p[0].y)
            return true
        if (e1.p[0].y < e0.p[0].y)
            return false
        if (e0.p[0].x !== e1.p[0].x)
            return e0.p[0].x < e1.p[0].x
        // see that e0 comes after e1 clockwise
        return signedArea(e0.p[0], e0.p[1], e1.p[1]) < 0
    }
}

// a slice represents a vertical corridor within the path
export class Slice {
    left: Array<SweepEvent>
    right: Array<SweepEvent>
    
    constructor() {
        this.left = new Array<SweepEvent>()
        this.right = new Array<SweepEvent>()
    }
}

// the events within a slice which surround a space available for a word to be placed
export class CornerEvents {
    topLeftEvent = -1
    bottomLeftEvent = -1
    topRightEvent = -1
    bottomRightEvent = -1
    
    hasLeftAndRightCorners() {
        return ( this.topLeftEvent != -1 || this.bottomLeftEvent != -1 ) &&
               ( this.topRightEvent != -1 || this.bottomRightEvent != -1 )
    }
}

export interface WordSource {
    pullBox(): Size|undefined
    placeBox(origin: Point): void
}

export class WordWrap {
    // FIXME? all these variables don't need to be class members...
    bounds: Rectangle
    eventQueue: OrderedArray<SweepEvent>

    constructor(path: Path, wordsource?: WordSource) {
        this.bounds = path.bounds()
        
        this.eventQueue = new OrderedArray<SweepEvent>( (a, b) => { return SweepEvent.less(a, b) } )
        this.initializeSweepBuffer(path)
        
        if (wordsource === undefined)
            return
        
        let slices = new Array<Slice>()
        let cursor = new Point(this.bounds.origin.x - 10, this.bounds.origin.y - 10)
        let horizontalSpace = 0
        let lineHeight = 20
        
        let box = wordsource.pullBox()
        
        while(box) {

            let point: Point
            
            if (cursor.y < this.bounds.origin.y) {
                let leftEvent = this.eventQueue.shift()
                let rightEvent = this.eventQueue.shift()
                
                let slice = new Slice()
                slice.left.push(leftEvent)
                slice.right.push(rightEvent)
                slices.push(slice)
                
                let cornerPoint
                if (pointEqualsPoint(leftEvent.p[0], rightEvent.p[0])) {
                    // FIXME? not checking the lower boundary
                    cornerPoint = this.pointForBoxInCorner(box, slice.left[0], slice.right[0])
                    if (cornerPoint !== undefined) {
                        point = cornerPoint
                        horizontalSpace = 0 // none, we neatly fitted into a corner
                        cursor.y = point.y
                    } else {
                        // FIXME: we still have no valid cursor.y
                        throw Error("no cornerPoint")
                    }
                } else {
                    cursor.y = leftEvent.p[0].y
                    // FIXME: code here is copied from below
                    this.reduceSlices(cursor, box, slices)
                    this.extendSlices(cursor, box, slices)
                    if (slices.length===0) {
                        break
                    }
                    let [sliceIndex, cornerEvents] = this.findSpaceAtCursorForBox(cursor, box, slices)
                    let [left, right] = this.leftAndRightForAtCursorForBox(cursor, box, slices, sliceIndex, cornerEvents)
                    point = new Point(left, cursor.y)
                    horizontalSpace = right - left
                    
                    cursor.x = left + box.width
                    horizontalSpace -= box.width
                }
            } else {
                if (slices.length === 0) {
                    console.log("no more slices")
                    break
                }
                horizontalSpace -= box.width
                if (horizontalSpace >= 0) {
                    point = new Point(cursor)
                    cursor.x += box.width
                } else {
                    this.reduceSlices(cursor, box, slices)
                    this.extendSlices(cursor, box, slices)
                    if (slices.length===0) {
                        break
                    }
                    let [sliceIndex, cornerEvents] = this.findSpaceAtCursorForBox(cursor, box, slices)
                    if (sliceIndex !== -1) {
                        if (sliceIndex === 0) // FIXME: test case for this, sliceIndex === 0 should indicate an earlier line break
                            cursor.y += lineHeight as number
                        let [left, right] = this.leftAndRightForAtCursorForBox(cursor, box, slices, sliceIndex, cornerEvents)
                        point = new Point(left, cursor.y)
                        horizontalSpace = right - left
                        cursor.x = left + box.width
                        horizontalSpace -= box.width
                    } else {
                        cursor.x = this.bounds.origin.x - 10
                        cursor.y += lineHeight as number
                        this.reduceSlices(cursor, box, slices)
                        this.extendSlices(cursor, box, slices)
                        if (slices.length===0) {
                            break
                        }
                        [sliceIndex, cornerEvents] = this.findSpaceAtCursorForBox(cursor, box, slices)
                        let [left, right] = this.leftAndRightForAtCursorForBox(cursor, box, slices, sliceIndex, cornerEvents)
                        point = new Point(left, cursor.y)
                        horizontalSpace = right - left
                        cursor.x = left + box.width
                        horizontalSpace -= box.width
                    }
                    if (horizontalSpace < 0)
                        continue
                }
            }
            
            wordsource.placeBox(point)
            box = wordsource.pullBox()
        }
    }
    
    initializeSweepBuffer(path: Path) {
        let first: Point|undefined, previous: Point|undefined, current: Point|undefined
        for(let segment of path.path) {
            switch(segment.type) {
                case 'M':
                    first = previous = new Point(segment.values[0], segment.values[1])
                    break
                case 'L':
                    current = new Point(segment.values[0], segment.values[1])
                    this.addSweepLine(previous!, current!)
                    previous = current
                    break
                case 'C':
                    break
                case 'Z':
                    this.addSweepLine(previous!, first!)
                    break
            }
        }
    }
    
    addSweepLine(p0: Point, p1: Point) {
        if (isZero(p0.y - p1.y))
            return
            
        if ( ( p0.y > p1.y) ||
             ( p0.y === p1.y && p0.x > p1.x) )
        {
            [p0, p1] = [p1, p0]
        }
        
        let sweepEvent = new SweepEvent(p0, p1)
        this.eventQueue.insert(sweepEvent)
    }
    
    pointForBoxInCorner(box: Size, e0: SweepEvent, e1: SweepEvent): Point | undefined {
        let a = e0.p[0],
            e = pointMinusPoint(e0.p[1], a),
            b = e1.p[0],
            f = pointMinusPoint(e1.p[1], b)
        if (e.x > 0 && f.x > 0) {
            let d = new Point(box.width, -box.height)
            let E = e.y / e.x,
                v = ( a.y + E * ( b.x - a.x - d.x ) + d.y - b.y ) / ( f.y - E * f.x )
            let p = pointPlusPoint(b, pointMultiplyNumber(f, v))
            p.x -= box.width
            return p
        }
        if (e.x < 0 && f.x < 0) {
            let d = new Point(box.width, box.height);
            let E = e.y / e.x,
                v = ( a.y + E * ( b.x - a.x - d.x ) + d.y - b.y ) / ( f.y - E * f.x )
            let p = pointPlusPoint(b, pointMultiplyNumber(f, v))
            p.x -= box.width
            p.y -= box.height
            return p
        }
        
        let line = [ new Point(e1.p[0].x - box.width, e1.p[0].y),
                     new Point(e1.p[1].x - box.width, e1.p[1].y) ]

        let p = _intersectLineLine(e0.p, line)
        if (p !== undefined)
            return p
       
        if ( ( e.x <= 0 && f.x >=0 ) &&
             isZero(e1.p[0].y - e0.p[0].y) &&
             (e1.p[0].x - e0.p[0].x) >= box.width )
        {
            return e0.p[0]
        }
            
        return undefined
    }
    
    findSpaceAtCursorForBox(cursor: Point, box: Size, slices: Array<Slice>): [number, CornerEvents] {
    
        let horizontalTopLine    = [ new Point(this.bounds.origin.x-10, cursor.y),
                                     new Point(this.bounds.origin.x+this.bounds.size.width+10, cursor.y) ],
            horizontalBottomLine = [ new Point(this.bounds.origin.x-10, cursor.y+box.height),
                                     new Point(this.bounds.origin.x+this.bounds.size.width+10, cursor.y+box.height) ]

        for(let index=0; index<slices.length; ++index) { // FIXME: could be optimized by using the last index from findSpaceAtCursorFoxBox instead of 0
            let cornerEvents = this.findCornersAtCursorForBoxAtSlice(cursor, box, slices[index])
            if (!cornerEvents.hasLeftAndRightCorners()) {
                throw Error("findSpaceAtCursorForBox(): we did not find enough corners in the current slices")
            }
            
            // check that the slice is the next one by being right of cursor.x

            let intersections = new Array<Intersection>()

            if (cornerEvents.topLeftEvent !== -1) {
                intersectLineLine(intersections, slices[index].left[cornerEvents.topLeftEvent].p, horizontalTopLine)
                if (intersections.length !== 1)
                    throw Error("fuck")
                if (cursor.x < intersections[0].seg0.pt.x) {
                    return [index, cornerEvents]
                }
            } else {
                intersectLineLine(intersections, slices[index].left[cornerEvents.bottomLeftEvent].p, horizontalBottomLine)
                if (intersections.length !== 1)
                    throw Error("fuck")
                if (cursor.x < intersections[0].seg0.pt.x) {
                    return [index, cornerEvents]
                }
            }

        }
        return [-1, new CornerEvents()]
    }

    // pull as much slices as are required for current line
    extendSlices(cursor: Point, box: Size, slices: Array<Slice>) {
        let top = cursor.y
        let bottom = cursor.y + box.height
        while( this.eventQueue.length > 0 &&
               ( (top <= this.eventQueue.at(0).p[0].y && this.eventQueue.at(0).p[0].y <= bottom) ||
                 (top <= this.eventQueue.at(0).p[1].y && this.eventQueue.at(0).p[1].y <= bottom) ) )
        {
            let segment: SweepEvent | undefined = this.eventQueue.shift()
            for(let slice of slices) {
                if ( pointEqualsPoint(slice.left[slice.left.length-1].p[1], segment.p[0]) ) {
//                    console.log("extend slice on the left")
                    slice.left.push(segment)
                    segment = undefined
                    break
                } else
                if ( pointEqualsPoint(slice.right[slice.right.length-1].p[1], segment.p[0]) ) {
//                    console.log("extend slice on the right")
                    slice.right.push(segment)
                    segment = undefined
                    break
                }
            }
            if (segment === undefined)
                continue
            
//            console.log("create a new slice")
            let top = segment.p[0].y,
                line = [ new Point(this.bounds.origin.x-10, top),
                         new Point(this.bounds.origin.x+this.bounds.size.width+10, top) ],
                intersectionsLeft = new Array<Intersection>(),
                intersectionsRight = new Array<Intersection>()
            let appendAtEnd = true
            for(let index = 0; index<slices.length; ++index) {
                intersectionsLeft.length = intersectionsRight.length = 0
                for(let j=0; j<slices[index].left.length; ++j) {
                    if (slices[index].left[j].p[0].y <= top && top <= slices[index].left[j].p[1].y) {
                        intersectLineLine(intersectionsLeft, line, slices[index].left[j].p)
                    }
                }
                if (intersectionsLeft.length !== 1)
                    throw Error("fuck")
                    
                if (segment.p[0].x < intersectionsLeft[0].seg0.pt.x) {
                    // insert splice before index
                    let newSlice = new Slice()
                    newSlice.left.push(segment)
                    if (this.eventQueue.length===0)
                        throw Error("fuck")
                    newSlice.right.push(this.eventQueue.shift())
                    slices.splice(index, 0, newSlice)
                    appendAtEnd = false
                    break
                }
                    
                for(let j=0; j<slices[index].right.length; ++j) {
                    if (slices[index].right[j].p[0].y <= top && top <= slices[index].right[j].p[1].y) {
                        intersectLineLine(intersectionsRight, line, slices[index].right[j].p)
                    }
                }
                if (intersectionsRight.length !== 1)
                    throw Error("fuck")
                    
                if (segment.p[0].x < intersectionsRight[0].seg0.pt.x) {
                    // split slice
                    let newSlice = new Slice()
                    let emptySegmentArray = newSlice.left
                    newSlice.left = slices[index].left
                    newSlice.right.push(segment)
                    slices[index].left = emptySegmentArray
                    if (this.eventQueue.length===0)
                        throw Error("fuck")
                    slices[index].left.push(this.eventQueue.shift())
                    slices.splice(index, 0, newSlice)
                    appendAtEnd = false
                    break
                }
            }
            if (appendAtEnd) {
                // append splice
                let newSlice = new Slice()
                newSlice.left.push(segment)
                if (this.eventQueue.length===0)
                    throw Error("fuck")
                newSlice.right.push(this.eventQueue.shift())
                slices.push(newSlice)
            }
        }
    }
    
    // cut events vertically so that left and right event at the same index have the same y values
    levelSlicesHorizontally(slices: Array<Slice>) {
        for(let slice of slices) {
            for (let index=0; index<slice.left.length; ++index) {

                if ( slice.left[index].p[1].y > slice.right[index].p[1].y ) {
                    // split left event
                    let pt = _intersectLineLine(
                        slice.left[index].p,
                        [ new Point( this.bounds.origin.x - 10, slice.right[index].p[1].y),
                          new Point( this.bounds.origin.x + this.bounds.size.width + 10, slice.right[index].p[1].y) ])
                    if (pt === undefined) {
                        console.log(slice.right[index].p[1].y)
                        console.log( slice.left[index].p )
                        throw Error("fuck")
                    }
                    let event = new SweepEvent(slice.left[index].p[0], pt)
                    slice.left[index].p[0] = pt
                    slice.left.splice(index, 0, event)
                } else
                if ( slice.left[index].p[1].y < slice.right[index].p[1].y ) {
                    // split right event
                    let pt = _intersectLineLine(
                        slice.right[index].p,
                        [ new Point( this.bounds.origin.x - 10, slice.left[index].p[1].y),
                          new Point( this.bounds.origin.x + this.bounds.size.width + 10, slice.left[index].p[1].y) ])
                    if (pt === undefined)
                        throw Error("fuck")
                    let event = new SweepEvent(slice.right[index].p[0], pt)
                    slice.right[index].p[0] = pt
                    slice.right.splice(index, 0, event)
                }
            }
        }
    }
    
    reduceSlices(cursor: Point, box: Size, slices: Array<Slice>) {
        for(let slice of slices) {
            while(slice.left.length>0 && slice.left[0].p[1].y < cursor.y) {
                slice.left.shift()
            }
            while(slice.right.length>0 && slice.right[0].p[1].y < cursor.y) {
                slice.right.shift()
            }
        }

        for(let index=0; index<slices.length;) {
            if ( slices[index].left.length === 0 && slices[index].right.length === 0 ) {
                // drop empty slice
                slices.splice(index, 1)
            } else
            if ( slices.length>=2 &&
                 slices[index  ].right.length === 0 &&
                 slices[index+1].left.length === 0 )
            {
                // merge slices
                slices[index].right = slices[index+1].right
                slices.splice(index+1, 1)
            } else {
                ++index
            }
        }
    }
    
    leftAndRightForAtCursorForBox(cursor: Point, box: Size, slices: Array<Slice>, sliceIndex: number, cornerEvents: CornerEvents): [number, number] {
        let topY = cursor.y,
            bottomY = cursor.y + box.height,
            horizontalTopLine    = [ new Point(this.bounds.origin.x-10, topY),
                                     new Point(this.bounds.origin.x+this.bounds.size.width+10, topY) ],
            horizontalBottomLine = [ new Point(this.bounds.origin.x-10, bottomY),
                                     new Point(this.bounds.origin.x+this.bounds.size.width+10, bottomY) ],
            topLeft, topRight, bottomLeft, bottomRight

        if (cornerEvents.topLeftEvent !== -1) {
            let intersections = new Array<Intersection>()
            intersectLineLine(intersections, slices[sliceIndex].left[cornerEvents.topLeftEvent].p, horizontalTopLine)
            if (intersections.length !== 1)
                throw Error("fuck")
            topLeft = intersections[0].seg0.pt.x
        }

        if (cornerEvents.topRightEvent !== -1) {
            let intersections = new Array<Intersection>()
            intersectLineLine(intersections, slices[sliceIndex].right[cornerEvents.topRightEvent].p, horizontalTopLine)
            if (intersections.length !== 1)
                throw Error("fuck")
            topRight = intersections[0].seg0.pt.x
        }

        if (cornerEvents.bottomLeftEvent !== -1) {
            let intersections = new Array<Intersection>()
            intersectLineLine(intersections, slices[sliceIndex].left[cornerEvents.bottomLeftEvent].p, horizontalBottomLine)
            if (intersections.length !== 1)
                throw Error("fuck")
            bottomLeft = intersections[0].seg0.pt.x
        }

        if (cornerEvents.bottomRightEvent !== -1) {
            let intersections = new Array<Intersection>()
            intersectLineLine(intersections, slices[sliceIndex].right[cornerEvents.bottomRightEvent].p, horizontalBottomLine)
            if (intersections.length !== 1)
                throw Error("fuck")
            bottomRight = intersections[0].seg0.pt.x
        }

        let left, right
        if (topLeft === undefined) {
            left = bottomLeft
        } else
        if (bottomLeft == undefined) {
            left = topLeft
        } else {
            left = Math.max(topLeft, bottomLeft)
        }
        
        if (topRight === undefined) {
            right = bottomRight
        } else
        if (bottomRight === undefined) {
            right = topRight
        } else {
            right = Math.min(topRight, bottomRight)
        }
        
        return [left!, right!]
    }
    
    findCornersAtCursorForBoxAtSlice(cursor: Point, box: Size, slice: Slice): CornerEvents {

        let topY = cursor.y
        let bottomY = cursor.y + box.height

        let cornerEvents = new CornerEvents()
        
        for(let index=0; index<slice.left.length; ++index) {
            if (slice.left[index].p[0].y <= topY && topY <= slice.left[index].p[1].y) {
                cornerEvents.topLeftEvent = index
            }
            if (slice.left[index].p[0].y <= bottomY && bottomY <= slice.left[index].p[1].y) {
                cornerEvents.bottomLeftEvent = index
                break
            }
        }

        for(let index=0; index<slice.right.length; ++index) {
            if (slice.right[index].p[0].y <= topY && topY <= slice.right[index].p[1].y) {
                cornerEvents.topRightEvent = index
            }
            if (slice.right[index].p[0].y <= bottomY && bottomY <= slice.right[index].p[1].y) {
                cornerEvents.bottomRightEvent = index
                break
            }
        }

        return cornerEvents
    }
}

// FIXME: we should create a wordwrap/ directory and split this file

// FIXME: IDL should write interfaces with only attributes and interfaces with attributes and methods...
interface IRectangle {
    origin: Point
    size: Size
}

interface SliderTest {
    title: string
    polygon: Array<Point>
    box: IRectangle
}

// draw the expected box and the result
// mark image when test failed to execute
// line breaks, headings
// middle mouse, dump test data for copy'n pasting it back?

const sliderTest: SliderTest[] = [
{
    title: "left dent",
    polygon: [
        {x: 115, y: 100},
        {x: 160, y:  20},
        {x: 205, y: 100},
        {x: 160, y: 180},
        {x: 140, y: 180},
    ],
    box: { origin: { x: 0, y: 0 }, size: { width: 80, height: 40 } }
}, {
    title: "connected",
    polygon: [
        {x: 115, y: 100},
        {x: 160, y:  20},
        {x: 205, y: 100},
        {x: 160, y: 180},
//        {x: 140, y: 180},
    ],
    box: { origin: { x: 0, y: 0 }, size: { width: 80, height: 40 } }
}, {
    title: "narrow/open/left&right/inside",
    polygon: [
        {x: 110, y: 180},
        {x: 160, y:  20},
        {x: 210, y: 180},
    ],
    box: { origin: { x: 0, y: 0 }, size: { width: 80, height: 40 } }
}, {
    title: "narrow/open/right",
    polygon: [
        {x:  10, y:  20},
        {x: 310, y: 180},
        {x: 170, y: 180},
    ],
    box: { origin: { x: 0, y: 0 }, size: { width: 80, height: 40 } }
}, {
    title: "narrow/open/left",
    polygon: [
        {x: 310, y:  20},
        {x: 150, y: 180},
        {x:  10, y: 180},
    ],
    box: { origin: { x: 0, y: 0 }, size: { width: 80, height: 40 } }
}, {
    title: "edge/open/left&right/inside",
    polygon: [
        {x:  70, y: 180},
        {x: 160, y:  20},
        {x: 250, y: 180},
    ],
    box: { origin: { x: 0, y: 0 }, size: { width: 80, height: 40 } }
}, {
    title: "edge/open/right",
    polygon: [
        {x:  10, y:  20},
        {x: 310, y: 180},
        {x: 100, y: 180},
    ],
    box: { origin: { x: 0, y: 0 }, size: { width: 80, height: 40 } }
}, {
    title: "edge/open/left",
    polygon: [
        {x: 310, y:  20},
        {x: 220, y: 180},
        {x:  10, y: 180},
    ],
    box: { origin: { x: 0, y: 0 }, size: { width: 80, height: 40 } }
}, {
    title: "median/open/left&right/wide",
    polygon: [
        {x:  70, y: 180},
        {x: 150, y:  20},
        {x: 170, y:  20},
        {x: 250, y: 180},
    ],
    box: { origin: { x: 0, y: 0 }, size: { width: 80, height: 40 } }
}, {
    title: "median/open/right",
    polygon: [
        {x:  10, y:  20},
        {x:  30, y:  20},
        {x: 310, y: 180},
        {x: 100, y: 180},
    ],
    box: { origin: { x: 0, y: 0 }, size: { width: 80, height: 40 } }
}, {
    title: "median/open/left",
    polygon: [
        {x: 290, y:  20},
        {x: 310, y:  20},
        {x: 220, y: 180},
        {x:  10, y: 180},
    ],
    box: { origin: { x: 0, y: 0 }, size: { width: 80, height: 40 } }
}, {
    title: "wide/open/left&right/wide",
    polygon: [
        {x:  70, y: 180},
        {x: 110, y:  20},
        {x: 210, y:  20},
        {x: 250, y: 180},
    ],
    box: { origin: { x: 0, y: 0 }, size: { width: 80, height: 40 } }
}, {
    title: "wide/open/right",
    polygon: [
        {x:  10, y:  20},
        {x: 120, y:  20},
        {x: 310, y: 180},
        {x: 100, y: 180},
    ],
    box: { origin: { x: 0, y: 0 }, size: { width: 80, height: 40 } }
}, {
    title: "wide/open/left",
    polygon: [
        {x: 200, y:  20},
        {x: 310, y:  20},
        {x: 220, y: 180},
        {x:  10, y: 180},
    ],
    box: { origin: { x: 0, y: 0 }, size: { width: 80, height: 40 } }

}]

class BoxSource implements WordSource {
    remaining: number
    style: boolean
    box?: Size
    rectangles: Array<Rectangle>
    
    constructor(remaining = 4096) {
        this.remaining = remaining
        this.style = true
        this.rectangles = new Array<Rectangle>()
    }

    pullBox(): Size|undefined {
        if (this.remaining === 0)
            return undefined
        --this.remaining
        this.box = new Size(this.style ? 40 : 20, 20)
        return this.box
    }

    placeBox(origin: Point): void {
        let rectangle = new Rectangle(origin, this.box!)
        this.rectangles.push(rectangle)
        let path = new Path()
        path.appendRect(rectangle)
        path.setAttributes({stroke: this.style ? "#f00" : "#f80", fill: "none"})
        path.updateSVG()
        document.getElementById("svg")!.appendChild(path.svg)
        this.style = !this.style
    }
}


export function testWrap() {
    document.body.innerHTML=""

    for(let test of sliderTest) {
        let path = new Path()
        for(let point of test.polygon) {
            if (path.empty())
                path.move(point)
            else
                path.line(point)
        }
        path.close()
        new WordWrapTest(test.title, path)
    }
}
