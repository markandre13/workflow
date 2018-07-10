import { Point, Rectangle, Matrix } from "../shared/geometry"

declare global {
  interface SVGPathElement {
    setPathData(data: any): void
    getPathData(): any
  }
}

export class Path
{
    path: any
    svg: SVGPathElement
  
    constructor(path?: Path) {
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "path") as SVGPathElement;
        if (path === undefined) {
            this.path = []
        } else {
            this.path = [] // FIXME: improve
            for(let entry of path.path) {
                switch(entry.type) {
                    case "M":
                        this.path.push({type: 'M', values: [entry.values[0], entry.values[1]]})
                        break
                    case "L":
                        this.path.push({type: 'L', values: [entry.values[0], entry.values[1]]})
                        break
                    case "Z":
                        this.path.push({type: 'Z'})
                    
                }
            }
        }
    }

    clear() {
        this.path = []
    }

    update() {
        this.svg.setPathData(this.path)
    }

    move(point: Point) {
        this.path.push({type: 'M', values: [point.x, point.y]})
    }

    line(point: Point) {
        this.path.push({type: 'L', values: [point.x, point.y]})
    }

    close() {
        this.path.push({type: 'Z'})
    }
    
    appendRect(rectangle: any) {
        this.move(rectangle.origin)
        this.line({x: rectangle.origin.x + rectangle.size.width, y: rectangle.origin.y                         })
        this.line({x: rectangle.origin.x + rectangle.size.width, y: rectangle.origin.y + rectangle.size.height })
        this.line({x: rectangle.origin.x                       , y: rectangle.origin.y + rectangle.size.height })
        this.close()
    }
    
    bounds(): Rectangle {
        let isFirstPoint = true
        let rectangle = new Rectangle()
        for(let segment of this.path) {
            switch(segment.type) {
                case 'M':
                case 'L':
                    if (isFirstPoint) {
                        rectangle.origin.x = segment.values[0]
                        rectangle.origin.y = segment.values[1]
                        isFirstPoint = false
                    } else {
                        rectangle.expandByPoint(new Point({x: segment.values[0], y: segment.values[1]}))
                    }
                    break
            }
        }
        return rectangle
    }
    
    // relativeMove
    // relativeLine
    // relativeCurve
    // append(path)
    transform(matrix: Matrix) {
        for(let segment of this.path) {
            switch(segment.type) {
                case 'M':
                case 'L':
                    segment.values = matrix.transformArrayPoint(segment.values)
                    break
            }
        }
    }

    translate(point: Point) {
        this.transform(new Matrix({
            m11: 1.0, m12: 0.0,
            m21: 0.0, m22: 1.0,
            tX: point.x, tY: point.y
        }))
    }
}
