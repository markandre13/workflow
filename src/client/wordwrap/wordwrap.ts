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

import {
    Point, Size, Rectangle, Matrix,
    pointPlusSize, pointMinusPoint, pointPlusPoint, pointMultiplyNumber,
    pointMinus, pointEqualsPoint, signedArea, isZero, isLessEqual, distancePointToLine,
    intersectsRectLine, lineCrossesRect2
} from "../../shared/geometry"
import { Path } from "../paths"
import { OrderedArray } from "../OrderedArray"

// description of an intersection between path segments
export class IntersectionPoint {
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
    seg0: IntersectionPoint
    seg1: IntersectionPoint
    
    constructor(t0: string, s0: Array<Point>, u0: number, p0: Point,
                t1: string, s1: Array<Point>, u1: number, p1: Point)
    {
        this.seg0 = new IntersectionPoint(t0, s0, u0, p0)
        this.seg1 = new IntersectionPoint(t1, s1, u1, p1)
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
    
    constructor(event: SweepEvent)
    constructor(p0: Point, p1: Point)
    constructor(p0OrEvent: Point|SweepEvent, p1?: Point) {
        if (p1 === undefined) {
            let e = p0OrEvent as SweepEvent
            this.type = e.type
            this.p = new Array<Point>()
            for(let p of e.p) {
                this.p.push(p)
            }
        } else {
            this.type = "L"
            this.p = new Array<Point>()
            this.p.push(p0OrEvent as Point)
            this.p.push(p1)
        }
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

// FIXME: make Array<Slice> a class with print function
export function printSlices(slices: Array<Slice>, asScript = false) {
    return
    if (!asScript) {
        for (let sliceIndex = 0; sliceIndex < slices.length; ++sliceIndex) {
            let slice = slices[sliceIndex]
            console.log(`-------------------------- slice ${sliceIndex}: leftTop=${slice.left[0].p[0].x}, ${slice.left[0].p[0].y}, rightTop=${slice.right[0].p[0].x}, ${slice.right[0].p[0].y}  --------------------------`)
            for (let i = 0; i < slice.left.length; ++i) {
                console.log(`left[${i}]  : ${slice.left[i].p[0].x}, ${slice.left[i].p[0].y} -> ${slice.left[i].p[1].x}, ${slice.left[i].p[1].y}`)
            }
            for (let i = 0; i < slice.right.length; ++i) {
                console.log(`right[${i}]: ${slice.right[i].p[0].x}, ${slice.right[i].p[0].y} -> ${slice.right[i].p[1].x}, ${slice.right[i].p[1].y}`)
            }
        }
    } else {
        console.log("slices = [")
        for(let slice of slices) {
            console.log("    Slice {")
            console.log("        left = [")
            for(let event of slice.left) {
                console.log("            ", event.p[0])
                console.log("            ", event.p[1])
                if (pointEqualsPoint(event.p[0], event.p[1]))
                    console.log("            EVENT IS A SINGULARITY *********************************************************")
            }
            console.log("        ]")
            console.log("        right = [")
            for(let event of slice.right) {
                console.log("            ", event.p[0])
                console.log("            ", event.p[1])
                if (pointEqualsPoint(event.p[0], event.p[1]))
                    console.log("            EVENT IS A SINGULARITY *********************************************************")
            }
            console.log("        ]")
            console.log("    }")
        }
        console.log("]")
    }
}

export function validateSlices(slices: Array<Slice>) {
    let okay = true
    for (let sliceIndex = 0; sliceIndex < slices.length; ++sliceIndex) {
        let slice = slices[sliceIndex]
        for (let i = 0; i < slice.left.length; ++i) {
            if (slice.left[i].p[0].y > slice.left[i].p[1].y) {
                okay = false
                console.log(`!!!!! slice ${sliceIndex}, left ${i}: edge doesn't point down`)
                throw Error()
            }
        }
        for (let i = 0; i < slice.right.length; ++i) {
            if (slice.right[i].p[0].y > slice.right[i].p[1].y) {
                okay = false
                console.log(`!!!!! slice ${sliceIndex}, right ${i}: edge doesn't point down`)
                throw Error()
            }
        }

        let leftIndex = 0, rightIndex = 0
        while(leftIndex < slice.left.length && slice.left[leftIndex].p[0].y < slice.right[rightIndex].p[0].y) {
            ++leftIndex
        }
        while(rightIndex < slice.right.length && slice.left[leftIndex].p[0].y > slice.right[rightIndex].p[0].y) {
            ++rightIndex
        }
        while(leftIndex < slice.left.length &&
              rightIndex < slice.right.length && 
              slice.left[leftIndex].p[0].y == slice.right[rightIndex].p[0].y &&
              slice.left[leftIndex].p[1].y == slice.right[rightIndex].p[1].y)
        {
            ++leftIndex
            ++rightIndex
        }
        if (leftIndex < slice.left.length && rightIndex < slice.right.length) {
            okay = false
            // console.log(`!!!!! slice ${sliceIndex}, left ${leftIndex}, right ${rightIndex}: heights do not fit`)
        }


        // if (slice.left.length != slice.right.length) {
        //     okay = false
        //     console.log(`slice ${sliceIndex}, number of edges on left and right differ`)
        // } else {
        //     for(let i = 0; i < slice.left.length; ++i) {
        //         if (slice.left[i].p[0].y != slice.right[i].p[0].y) {
        //             okay = false
        //             console.log(`slice ${sliceIndex}, top of left and right edges at ${i} differs`)
        //         }
        //         if (slice.left[i].p[0].y != slice.right[i].p[0].y) {
        //             okay = false
        //             console.log(`slice ${sliceIndex}, bottom of left and right edges at ${i} differs`)
        //         }
        //     }
        // }
    }
    if (!okay) {
        // console.log('!!!!! ************ POSSIBLE ERROR *******************')
        // throw Error("validateSlices failed")
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

function overlapsWithSlices(rectangle: Rectangle, slices: Array<Slice>) {
    for(let i=0; i<slices.length; ++i) {
        let slice = slices[i]
        for(let j=0; j<slice.left.length; ++j) {
            if (intersectsRectLine(rectangle, slice.left[j].p))
                return true
        }
        for(let j=0; j<slice.right.length; ++j) {
            if (intersectsRectLine(rectangle, slice.right[j].p))
                return true
        }
    }
    return false
}

export function withinSlices(rectangle: Rectangle, slices: Array<Slice>, trace: boolean = false) {
    if (trace) {
        console.log("WITHINSLICES ------------------------")
        console.log(rectangle)
        console.log(slices)
    }
    let rectTop    = rectangle.origin.y,
        rectBottom = rectTop + rectangle.size.height,
        rectLeft   = rectangle.origin.x,
        rectRight  = rectLeft + rectangle.size.width
    
    // PRECONDITION
    for(let i=0; i<slices.length; ++i) {
        let slice = slices[i]
        if (rectTop < slice.left[0].p[0].y) {
            if (trace)
                console.log("WITHINSLICES => FALSE (1)")
            return false
        }
        if (rectBottom > slice.left[slice.left.length-1].p[1].y) {
            if (trace)
                console.log("WITHINSLICES => FALSE (2)")
            return false
        }
        if (rectTop < slice.right[0].p[0].y) {
            if (trace)
                console.log("WITHINSLICES => FALSE (3)")
            return false
        }
        if (rectBottom > slice.right[slice.right.length-1].p[1].y) {
            if (trace)
                console.log("WITHINSLICES => FALSE (4)")
            return false
        }
    }

    // ALGORITHM
    for(let i=0; i<slices.length; ++i) {
        let slice = slices[i],
            leftOfBoxIsInside = true,
            rightOfBoxIsInside = true
        for(let j=0; j<slice.left.length; ++j) {
            // console.log("---------------------------")
            // console.log("left", j)
            // console.log(slice.left[j].p)
            if (slice.left[j].p[1].y < rectTop) {
                // console.log("too high")
                continue
            }
            if (rectBottom < slice.left[j].p[0].y) {
                // console.log("too low")
                break
            }
            if (rectRight < slice.left[j].p[0].x && rectRight < slice.left[j].p[1].x) {
                // console.log("left of box")
                leftOfBoxIsInside = false
                break
            }
            if (slice.left[j].p[0].x <= rectLeft && slice.left[j].p[1].x <= rectLeft) {
                // console.log("right of box")
                continue
            }
            // console.log("at least one endpoint within rectangle?")
            if (rectangle.contains(slice.left[j].p[0]) || rectangle.contains(slice.left[j].p[1])) {
                // console.log("yes")
                if (trace)
                    console.log("WITHINSLICES => FALSE (5)")
                return false
            }
            // console.log("no")
            // console.log("event crosses rectangle?")
            if (lineCrossesRect2(slice.left[j].p, rectangle)) {
                if (trace) {
                    console.log("WITHINSLICES: LEFT CROSSES RECT")
                    console.log(rectangle)
                    console.log(slice.left[j].p)
                }
                leftOfBoxIsInside = false
                break
            } 
            // console.log("no")
        }
        if (!leftOfBoxIsInside) {
            if (trace)
                console.log("WITHINSLICES: leftOfBoxIsInside")
            continue
        }
        for(let j=0; j<slice.right.length; ++j) {
            if (slice.right[j].p[1].y < rectTop)
                continue
            if (rectBottom < slice.right[j].p[0].y)
                break
            if (slice.right[j].p[0].x < rectLeft && slice.right[j].p[1].x < rectLeft) {
                rightOfBoxIsInside = false
                break
            }
            if (rectRight <= slice.right[j].p[0].x && rectRight <= slice.right[j].p[1].x)
                continue
            if (rectangle.contains(slice.right[j].p[0]) || rectangle.contains(slice.right[j].p[1])) {
                if (trace)
                    console.log("WITHINSLICES => FALSE (6)")
                return false
            }
            if (lineCrossesRect2(slice.right[j].p, rectangle)) {
                if (trace)
                    console.log("WITHINSLICES: RIGHT LINE CROSSES RECT")
                rightOfBoxIsInside = false
                break
            } 
        }
        if (rightOfBoxIsInside) {
            if (trace) {
                console.log(rectangle)
                console.log(slices)
                console.log("WITHINSLICES => TRUE")
            }
            return true
        }
    }
    if (trace)
        console.log("WITHINSLICES => FALSE (7)")
    return false

}

export function appendEventAsNewSlice(slices: Array<Slice>, segment: SweepEvent, sweepBuffer: OrderedArray<SweepEvent>, bounds: Rectangle, trace = false) {
    // console.log(">>>>>>>>>>")
    let top = segment.p[0].y,
        line = [ new Point(bounds.origin.x-10, top),
                 new Point(bounds.origin.x + bounds.size.width+10, top) ],
        intersectionsLeft = new Array<Intersection>(),
        intersectionsRight = new Array<Intersection>()
    let appendNewSliceAtRight = true
    for(let sliceIndex = 0; sliceIndex < slices.length; ++sliceIndex) {
        intersectionsLeft.length = intersectionsRight.length = 0

        // check for intersections with the slice's left side
        if (trace)
            console.log("check for intersections with the slice's left")
        for(let j=0; j<slices[sliceIndex].left.length; ++j) {
            if (slices[sliceIndex].left[j].p[0].y <= top && top <= slices[sliceIndex].left[j].p[1].y) {
                intersectLineLine(intersectionsLeft, line, slices[sliceIndex].left[j].p)
            }
        }
        
        // if new sweep event is left of the slice's left, create a new slice left of the slice
        if (segment.p[0].x < intersectionsLeft[0].seg0.pt.x) {
            if (trace)
                console.log("new segment is outside the slide on the left")
            let newSlice = new Slice()
            newSlice.left.push(segment)
            if (sweepBuffer.length===0)
                throw Error("fuck")
            newSlice.right.push(sweepBuffer.shift())
            slices.splice(sliceIndex, 0, newSlice)
            appendNewSliceAtRight = false
            break
        }
            
        // check for intersections with the slice's right side
        if (trace)
            console.log("check for intersections with the slice's right")
        for(let j=0; j<slices[sliceIndex].right.length; ++j) {
            if (slices[sliceIndex].right[j].p[0].y <= top && top <= slices[sliceIndex].right[j].p[1].y) {
                intersectLineLine(intersectionsRight, line, slices[sliceIndex].right[j].p)
            }
        }
        
        // if new sweep event is left of the slice's right, split the slice into two slices
        if (segment.p[0].x < intersectionsRight[0].seg0.pt.x) {
            if (trace) {
                console.log(`new segment is inside the slice`)
                console.log(segment)
            }

            let newSlice = new Slice()
            let emptySegmentArray = newSlice.left
            
            // the new slice's left becomes the old slice's left
            newSlice.left = slices[sliceIndex].left
            // the new segment becomes the new slice's right HERE WE NEED TO EXTEND SHIT
            
            // COPY FROM THE OLD SLICE'S RIGHT DOWN TO TOP OF SEGMENT
            for(let i=0; i<slices[sliceIndex].right.length && slices[sliceIndex].right[i].p[0].y < top; ++i) {
                newSlice.right.push(new SweepEvent(slices[sliceIndex].right[i]))
            }
            newSlice.right[slices[sliceIndex].right.length-1].p[1] = intersectionsRight[0].seg0.pt
            // console.log('copied old slices right to new slices right and tweaked last point to intersection')
            let s = newSlice.right[slices[sliceIndex].right.length-1]
            // console.log(`${s.p[0].x}, ${s.p[0].y} -> ${s.p[1].x}, ${s.p[1].y}`)

            if (pointEqualsPoint(newSlice.right[slices[sliceIndex].right.length-1].p[0],
                                 newSlice.right[slices[sliceIndex].right.length-1].p[1]))
            {
                newSlice.right.pop()
                // throw Error("singularity")
            }
            newSlice.right.push(segment)
            
            // the old slice's left get's the next segment from the sweep buffer
            slices[sliceIndex].left = emptySegmentArray
                
            // COPY FROM THE OLD SLICE'S LEFT DOWN TO TOP OF SEGMENT
            for(let i=0; i<newSlice.left.length && newSlice.left[i].p[0].y < top; ++i) {
                slices[sliceIndex].left.push(new SweepEvent(newSlice.left[i]))
            }
            slices[sliceIndex].left[slices[sliceIndex].left.length-1].p[1] = intersectionsLeft[0].seg0.pt
            // console.log('copied new slices left to old slices left and tweaked last point to intersection')
            s = slices[sliceIndex].left[slices[sliceIndex].left.length-1]
            // console.log(`${s.p[0].x}, ${s.p[0].y} -> ${s.p[1].x}, ${s.p[1].y}`)

            if (pointEqualsPoint(slices[sliceIndex].left[slices[sliceIndex].left.length-1].p[0],
                                 slices[sliceIndex].left[slices[sliceIndex].left.length-1].p[1]) )
            {
                slices[sliceIndex].left.pop()
                // throw Error("singularity")
            }
            slices[sliceIndex].left.push(sweepBuffer.shift())
            
            // insert the new slice
            slices.splice(sliceIndex, 0, newSlice)
            appendNewSliceAtRight = false
            break
        }
        // console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
    }
    if (appendNewSliceAtRight) {
        // if (this.trace)
        //     console.log("new segment is outside the slide on the right")
        let newSlice = new Slice()
        newSlice.left.push(segment)
        newSlice.right.push(sweepBuffer.shift())
        slices.push(newSlice)
    }
}

// FIXME: find another name for WordSource as it gather to many wordwrap result related functionality
export interface WordSource {
    rectangles: Array<Rectangle>
    pullBox(): Size|undefined
    placeBox(origin: Point): void
    endOfSlice(): void
    endOfLine(): void
    endOfWrap(): void
}

export class WordWrap {
    trace: boolean
    bounds: Rectangle
    sweepBuffer: OrderedArray<SweepEvent>

    /**
     * WordWrap algorithm will place all words provided by wordsource inside path
     */
    constructor(path: Path, wordsource?: WordSource, trace?: boolean) {
        this.trace = trace == true
        this.bounds = path.bounds()

        this.sweepBuffer = new OrderedArray<SweepEvent>( (a, b) => { return SweepEvent.less(a, b) } )
        this.initializeSweepBufferFrom(path)

        if (wordsource === undefined)
            return
        this.placeWordBoxes(wordsource)
    }
    
    private initializeSweepBufferFrom(path: Path) {
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
    
    private addSweepLine(p0: Point, p1: Point) {
        if (isZero(p0.y - p1.y))
            return
            
        if ( ( p0.y > p1.y) ||
             ( p0.y === p1.y && p0.x > p1.x) )
        {
            [p0, p1] = [p1, p0]
        }
        
        let sweepEvent = new SweepEvent(p0, p1)
        this.sweepBuffer.insert(sweepEvent)
    }

    placeWordBoxes(wordsource: WordSource) {
        if (this.trace)
            console.log("WordWrap.placeWordBoxes(): ENTER")
        let slices = new Array<Slice>()

        let horizontalSpace = 0
        let lineHeight = 20 // FIXME: shouldn't be fixed
        
        let box = wordsource.pullBox()
        if (box === undefined) {
            return
        }

        let [sliceIndex, cursor] = this.pointForBoxInSlices(box, slices)
        if (sliceIndex === -1) {
            if (this.trace)
                console.log("WordWrap.placeWordBoxes(): NOT EVEN A FIRST SLICE")
            return
        }

        let cornerEvents = this.findCornersAtCursorForBoxAtSlice(cursor, box, slices[sliceIndex])
        let [left, right] = this.leftAndRightForAtCursorForBox(cursor, box, slices, sliceIndex, cornerEvents)
        horizontalSpace = right - left

        if (this.trace)
            console.log(`WordWrap.placeWordBoxes(): ENTER LOOP, HORIZONTAL SPACE IS ${horizontalSpace}`)
        while (box) {
            // place in horizontal space
            if (isLessEqual(box.width, horizontalSpace)) {
                wordsource.placeBox(cursor)
                cursor.x += box.width
                horizontalSpace -= box.width
                if (this.trace)
                    console.log(`WordWrap.placeWordBoxes(): PLACED BOX, REDUCED HORIZONTAL SPACE TO ${horizontalSpace}`)
                box = wordsource.pullBox()
                continue
            }
            wordsource.endOfSlice()

            // move to next slice
            
            ++sliceIndex
            if (sliceIndex < slices.length) {
                if (this.trace)
                    console.log(`WordWrap.placeWordBoxes(): NOT ENOUGH HORIZONTAL SPACE FOR ${box.width}, MOVE TO SLICE ${sliceIndex}`)
                let cornerEvents = this.findCornersAtCursorForBoxAtSlice(cursor, box, slices[sliceIndex])
                let [left, right] = this.leftAndRightForAtCursorForBox(cursor, box, slices, sliceIndex, cornerEvents)
                horizontalSpace = right - left
                cursor.x = left
                continue
            }
            if (this.trace)
                console.log(`WordWrap.placeWordBoxes(): NOT ENOUGH HORIZONTAL SPACE FOR ${box.width}, LAST SLICE, NEW LINE`)
            wordsource.endOfLine()

            // move to new row
            sliceIndex = -1
            horizontalSpace = 0
            cursor.y += box.height
            this.extendSlices(cursor, box, slices)

            // abort when below bounding box
            if (cursor.y > this.bounds.origin.y + this.bounds.size.height)
                break
        }
        wordsource.endOfWrap()
        if (this.trace)
            console.log("WordWrap.placeWordBoxes(): LEAVE")
    }

    printSlices(slices: Array<Slice>) {
        printSlices(slices)
    }

    validateSlices(slices: Array<Slice>) {
        validateSlices(slices)
    }

    pointForBoxInSlices(box: Size, slices: Array<Slice>): [number, Point] {
        if (this.trace)
            console.log("======================== WordWrap.pointForBoxInSlices ========================")

        let point = new Point(this.bounds.origin)
        while (true) {

            if (this.trace)
                console.log(`-------------------------- extend & level slices to accomodate ${point.y} to ${point.y+box.height} -----------------------------------------`)

            // console.log("####### BEFORE EXTENDSLICES")
            // this.printSlices(slices)
            // this.validateSlices(slices)
            this.extendSlices(point, box, slices)

            // console.log("####### BEFORE SLICE HORIZONTALLY")
            // this.printSlices(slices)
            // this.validateSlices(slices)
            // this.levelSlicesHorizontally(slices)

            // console.log("####### BEFORE MERGE AND DROP")
            // this.printSlices(slices)
            // this.validateSlices(slices)
            // this.mergeAndDropSlices(point, box, slices)

            // console.log("####### AFTER MERGE AND DROP")
            // this.printSlices(slices)
            // this.validateSlices(slices)

            if (slices.length === 0)
                break

            // CRAWL OVER SLICES AND FIND MOST TOP,LEFT ONE
            let rect = new Rectangle(point, box)
            for (let sliceIndex = 0; sliceIndex < slices.length; ++sliceIndex) {
                let slice = slices[sliceIndex]
                for (let leftIndex = 0; leftIndex < slice.left.length; ++leftIndex) {
                    for (let rightIndex = 0; rightIndex < slice.right.length; ++rightIndex) {
                        if (this.trace) {
                            console.log("CHECK ", sliceIndex, leftIndex, rightIndex, slice.left[leftIndex], slice.right[rightIndex])
                        }

                        let possiblePoint = this.pointForBoxInCornerCore(box, slice.left[leftIndex], slice.right[rightIndex])
                        if (possiblePoint !== undefined) {
                            rect.origin = possiblePoint
                            if (withinSlices(rect, slices, this.trace)) {
                                if (this.trace) {
                                    console.log("pointForBoxInSlices => point (1)")
                                }
                                return [sliceIndex, rect.origin]
                            }
                        }

                        possiblePoint = this.pointForBoxAtTop(box, slice.left[leftIndex], slice.right[rightIndex])
                        if (possiblePoint !== undefined) {
                            rect.origin = possiblePoint
                            if (withinSlices(rect, slices, this.trace)) {
                                if (this.trace) {
                                    console.log("pointForBoxInSlices => point (2)")
                                }
                                return [sliceIndex, rect.origin]
                            }
                        }

                        possiblePoint = this.pointForBoxAtEdge(box, slice.left[leftIndex], slice.right[rightIndex])
                        if (possiblePoint !== undefined) {
                            // this.mergeAndDropSlices(possiblePoint, box, slices)
                            this.extendSlices(possiblePoint, box, slices)
                            // this.levelSlicesHorizontally(slices)
                            rect.origin = possiblePoint
                            if (withinSlices(rect, slices)) {
                                if (this.trace) {
                                    console.log("pointForBoxInSlices => point (3)")
                                }
                                return [sliceIndex, rect.origin]
                            }
                        }

                        if (this.trace)
                            console.log(`pointForBoxInSlices point ${point.x}, ${point.y} not within slices (4)`)
                        
                    }
                }
            }
            point.y += box.height
        }

        if (this.trace)
            console.log("pointForBoxInSlices => undefined (5)")
        return [-1, point]

    }

    // FIXME: would withinSlices() also cover the check done here?
    pointForBoxAtTop(box: Size, leftEvent: SweepEvent, rightEvent: SweepEvent): Point | undefined {
        if (this.trace)
            console.log("WordWrap.pointForBoxInCorner")

        if (leftEvent.p[0].y !== rightEvent.p[0].y)
            return undefined

        let leftPoint = leftEvent.p[0],
            leftVector = pointMinusPoint(leftEvent.p[1], leftPoint),
            rightPoint = rightEvent.p[0],
            sweepWidthTop = rightEvent.p[0].x - leftEvent.p[0].x

        // top is not wide enough for box
        if (sweepWidthTop < box.width) // TODO: USE isZero()
            return undefined

        // left side is /
        if (leftVector.x <= 0) { // FIXME: use isZero()?
            if (this.trace)
                console.log("[2] return ", leftEvent.p[0])
            return leftEvent.p[0]
        }

        // left side is \
        let bottomLine = [new Point(this.bounds.origin.x - 10, leftEvent.p[0].y + box.height),
        new Point(this.bounds.origin.x + this.bounds.size.width + 10, leftEvent.p[0].y + box.height)]
        let leftPoint2 = _intersectLineLine(leftEvent.p, bottomLine)
        if (leftPoint2 === undefined)
            throw Error("fuck")
        leftPoint2.y = leftEvent.p[0].y
        if (leftPoint2.x + box.width > rightPoint.x) {
            if (this.trace)
                console.log("NOPE")
            return undefined
        }

        let rightPoint2 = _intersectLineLine(rightEvent.p, bottomLine)
        if (rightPoint2) {
            if (rightPoint2.x - box.width < leftPoint2.x) {
                if (this.trace)
                    console.log("[0] return undefined")
                return undefined
            }
        }
        if (this.trace)
            console.log("[1] return ", leftPoint2)
        return leftPoint2
    }
    
    pointForBoxInCornerCore(box: Size, leftEvent: SweepEvent, rightEvent: SweepEvent): Point | undefined {
        if (this.trace)
            console.log("WordWrap.pointForBoxInCornerCore")

        //             <--- sweepWidthTop -->
        // leftPoint  O                      O rightPoint
        //            |                      |
        // leftVector V                      V rightVector
        //             <- sweepWidthBottom ->
        let leftPoint = leftEvent.p[0],
            leftVector = pointMinusPoint(leftEvent.p[1], leftPoint),
            rightPoint = rightEvent.p[0],
            rightVector = pointMinusPoint(rightEvent.p[1], rightPoint),
            sweepWidthTop    = rightEvent.p[0].x - leftEvent.p[0].x,
            sweepWidthBottom = rightEvent.p[1].x - leftEvent.p[1].x

        if (sweepWidthTop < box.width && sweepWidthBottom < box.width)
            return undefined

        if (this.trace)
            console.log("left and right vector:", leftVector, rightVector)
            
        // case:  \ \
        if (leftVector.x > 0 && rightVector.x > 0) {
            let d = new Point(box.width, -box.height)
            let E = leftVector.y / leftVector.x,
                v = ( leftPoint.y + E * ( rightPoint.x - leftPoint.x - d.x ) + d.y - rightPoint.y ) / ( rightVector.y - E * rightVector.x )
            let p = pointPlusPoint(rightPoint, pointMultiplyNumber(rightVector, v))
            p.x -= box.width
            if (this.trace) {
                console.log("[4] return ", p)
                console.log("p    :", p)
                console.log("left :", leftEvent.p)
                console.log("right:", rightEvent.p)
            }
            return p
        }

        // case:  / /
        if (leftVector.x < 0 && rightVector.x < 0) {
            let d = new Point(box.width, box.height);
            let E = leftVector.y / leftVector.x,
                v = ( leftPoint.y + E * ( rightPoint.x - leftPoint.x - d.x ) + d.y - rightPoint.y ) / ( rightVector.y - E * rightVector.x )
            let p = pointPlusPoint(rightPoint, pointMultiplyNumber(rightVector, v))
            p.x -= box.width
            p.y -= box.height
            if (this.trace)
                console.log("[5] return ", p)
            return p
        }
        
        // case: / \ )
        if (sweepWidthTop < sweepWidthBottom) {
            let rightEventMovedToLeft = [
                new Point(rightEvent.p[0].x - box.width, rightEvent.p[0].y),
                new Point(rightEvent.p[1].x - box.width, rightEvent.p[1].y)
            ]

            let p = _intersectLineLine(leftEvent.p, rightEventMovedToLeft)
            if (p !== undefined) {
                if (this.trace)
                    console.log("[7] return ", p)
                return p
            }
        }
       
        // case: \ /
        if ( ( leftVector.x <= 0 && rightVector.x >=0 ) &&
             isZero(rightEvent.p[0].y - leftEvent.p[0].y) &&
             (rightEvent.p[0].x - leftEvent.p[0].x) >= box.width )
        {
            if (this.trace)
                console.log("[8] return ", leftEvent.p[0])
            return leftEvent.p[0]
        }
            
        if (this.trace)
            console.log("[9] return undefined")
        return undefined
    }

    //            _
    //            \ ----
    //             \    ----
    //              X       ----
    pointForBoxAtEdge(box: Size, leftEvent: SweepEvent, rightEvent: SweepEvent): Point | undefined {
        let yMax = Math.max(leftEvent.p[1].y, rightEvent.p[1].y) + 10
        let verticalLine = [new Point(leftEvent.p[1].x, leftEvent.p[0].y),
                            new Point(leftEvent.p[1].x, yMax)]
        let crossingPoint = _intersectLineLine(verticalLine, rightEvent.p)
        if (crossingPoint === undefined)
            return undefined
        let left = new SweepEvent(crossingPoint, verticalLine[1])
        let right = new SweepEvent(crossingPoint, rightEvent.p[1])
        return this.pointForBoxInCornerCore(box, left, right)
    }
    
    // pull as much slices as are required for current line
    extendSlices(cursor: Point, box: Size, slices: Array<Slice>) {
        // if (this.trace) {
        //     console.log("============== extendSlices =======================")
        //     console.log("  this.sweepBuffer.length = " + this.sweepBuffer.length)
        // }
        let top = cursor.y
        let bottom = cursor.y + box.height
        // if (this.trace) {
        //     console.log("  extend slices to cover y=["+top+" - "+bottom+"]")
        //     console.log("  sweepBuffer has "+this.sweepBuffer.length+" entries")
        // }

        // for all sweep buffer elements within [top - bottom]
        while( !this.sweepBuffer.empty() &&
                this.sweepBuffer.at(0).p[0].y <= bottom )
        {
            // console.log("####### LOOP: BEFORE LEVEL HORIZONTALLY")
            // this.printSlices(slices)
            this.validateSlices(slices)
            this.levelSlicesHorizontally(slices)

            // console.log("####### LOOP: BEFORE MERGE AND DROP SLICES")
            // this.printSlices(slices)
            this.validateSlices(slices)
            this.mergeAndDropSlices(cursor, box, slices)

            // get next sweep event
            let segment: SweepEvent | undefined = this.sweepBuffer.shift()

            // try to use sweep event as continuation of a existing slice
            // console.log("####### LOOP: BEFORE APPEND EVENT TO SLICES")
            // this.printSlices(slices)
            this.validateSlices(slices)
    
            if (this.appendEventToSlices(slices, segment)) {
                // console.log("####### LOOP: ADDED EVENT TO SLICE")
                // this.printSlices(slices)
                this.validateSlices(slices)
                continue
            }
            // console.log("####### LOOP: ADDED NEW SLICE")
            this.appendEventAsNewSlice(slices, segment, this.trace)
            // this.printSlices(slices)
            this.validateSlices(slices)
        }
        // console.log("####### FINISH: BEFORE LEVEL HORIZONTALLY")
        // this.printSlices(slices)
        this.validateSlices(slices)
        this.levelSlicesHorizontally(slices)

        // console.log("####### FINISH: BEFORE MERGE AND DROP SLICES")
        // this.printSlices(slices)
        this.validateSlices(slices)
        this.mergeAndDropSlices(cursor, box, slices)

        // console.log("####### FINISH: BEFORE DROP EVENTS")
        // this.printSlices(slices)
        this.validateSlices(slices)
        this.dropEventsInSlices(cursor, box, slices)

        // console.log("####### FINISH: DONE EXTENDING")
        // this.printSlices(slices)
        this.validateSlices(slices)
    }

    appendEventToSlices(slices: Array<Slice>, segment: SweepEvent): Boolean {
        for(let slice of slices) {
            if (slice.left.length==0) {
                console.log("Upsi, left slice is empty")
            }
            if (slice.right.length==0)
                console.log("Upsi, right slice is empty")
            if ( pointEqualsPoint(slice.left[slice.left.length-1].p[1], segment.p[0]) ) {
                // if(this.trace)
                //     console.log("extend slice on the left")
                slice.left.push(segment)
                return true
            } else
            if ( pointEqualsPoint(slice.right[slice.right.length-1].p[1], segment.p[0]) ) {
                // if (this.trace)
                //     console.log("extend slice on the right")
                slice.right.push(segment)
                return true
            }
        }
        return false
    }

    appendEventAsNewSlice(slices: Array<Slice>, segment: SweepEvent, trace = false) {
        appendEventAsNewSlice(slices, segment, this.sweepBuffer, this.bounds, trace)
    }
    
    // cut events vertically so that left and right event at the same index have the same y values
    levelSlicesHorizontally(slices: Array<Slice>) {
        // if (this.trace)
        //     console.log("levelSlicesHorizontally")
        for(let slice of slices) {
            // if (this.trace)
            //     console.log("  handle a slice")
            for (let index=0; index<slice.left.length; ++index) {
                if ( index >= slice.left.length || index >= slice.right.length )
                    break
                if ( slice.left[index].p[1].y > slice.right[index].p[1].y ) {
                    // if (this.trace)
                    //     console.log("split left event")
                    // split left event
                    let pt = _intersectLineLine(
                        [ new Point( this.bounds.origin.x - 10, slice.right[index].p[1].y),
                          new Point( this.bounds.origin.x + this.bounds.size.width + 10, slice.right[index].p[1].y) ],
                        slice.left[index].p)
                    if (pt === undefined) {
                        console.log(slice.right[index].p[1].y)
                        console.log( slice.left[index].p )
                        throw Error("fuck")
                    }
                    if (!pointEqualsPoint(slice.left[index].p[0], pt)) {
                        let event = new SweepEvent(slice.left[index].p[0], pt)
                        slice.left[index].p[0] = pt
                        slice.left.splice(index, 0, event)
                    }
                } else
                if ( slice.left[index].p[1].y < slice.right[index].p[1].y ) {
                    // if (this.trace)
                    //     console.log("split right event")
                    // split right event
                    let pt = _intersectLineLine(
                        slice.right[index].p,
                        [ new Point( this.bounds.origin.x - 10, slice.left[index].p[1].y),
                          new Point( this.bounds.origin.x + this.bounds.size.width + 10, slice.left[index].p[1].y) ])
                    if (pt === undefined) {
                        console.log(slice.right[index])
                        console.log(slice.left[index].p[1].y)
                        throw Error("failed to split right event on left event")
                    }
                    if (!pointEqualsPoint(slice.right[index].p[0], pt)) {
                        let event = new SweepEvent(slice.right[index].p[0], pt)
                        slice.right[index].p[0] = pt
                        slice.right.splice(index, 0, event)
                    }
                }
            }
        }
    }

    dropEventsInSlices(cursor: Point, box: Size, slices: Array<Slice>) {
        // drop events
        for(let slice of slices) {
            while(slice.left.length>0 && slice.left[0].p[1].y < cursor.y) {
                slice.left.shift()
            }
            while(slice.right.length>0 && slice.right[0].p[1].y < cursor.y) {
                slice.right.shift()
            }
        }
    }
    
    mergeAndDropSlices(cursor: Point, box: Size, slices: Array<Slice>) {
        for(let index=0; index<slices.length;) {
            if ( ( slices[index].left.length  === 0 || slices[index].left [slices[index].left .length-1].p[1].y < cursor.y ) &&
                 ( slices[index].right.length === 0 || slices[index].right[slices[index].right.length-1].p[1].y < cursor.y ) )
            {
                // drop empty slice
                slices.splice(index, 1)
            } else
            if ( slices.length>=2 &&
                 ( slices[index  ].right.length === 0 || slices[index  ].right[slices[index  ].right.length-1].p[1].y < cursor.y) &&
                 ( slices[index+1].left .length === 0 || slices[index+1].left [slices[index+1].left .length-1].p[1].y < cursor.y) )
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
