import { expect } from "chai"

import { ORB } from "corba.js"

import { Point, Size, Rectangle, Matrix } from "shared/geometry"

import { Path } from "client/Path"

describe("something", function() {
    it("more", function() {
    
        ORB.registerValueType("Point", Point)
        ORB.registerValueType("Size", Size)
        ORB.registerValueType("Rectangle", Rectangle)
        ORB.registerValueType("Matrix", Matrix)
    
        let point = new Point({x: 17, y: 18})
        console.log(point)

        let path = new Path()
        path.appendCircle(new Rectangle({origin: {x: 0, y:0 }, size: { width: 320, height: 200}}))
//        path.update()
        console.log(path.svg)
    })
})
