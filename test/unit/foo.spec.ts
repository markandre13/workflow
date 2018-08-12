import { expect } from "chai"

import { ORB } from "corba.js"

import { Point, Size, Rectangle, Matrix } from "shared/geometry"

import { Path } from "client/Path"

describe("figureeditor", function() {
    before(function() {
        ORB.registerValueType("Point", Point)
        ORB.registerValueType("Size", Size)
        ORB.registerValueType("Rectangle", Rectangle)
        ORB.registerValueType("Matrix", Matrix)
    })

    describe("tool", function() {
        describe("transform", function() {
            it("recognize translation", function() {
    
                let point = new Point({x: 17, y: 18})
                console.log(point)

                let path = new Path()
                path.appendRect(new Rectangle({origin: {x: 0, y:0 }, size: { width: 320, height: 200}}))
                path.update()
                console.log(path.svg)
            })
        })
    })
})
