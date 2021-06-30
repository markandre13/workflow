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

import { expect } from "chai"
import { OrderedArray } from "client/OrderedArray"

function less(a:number, b: number): boolean {
    if (a === undefined || b === undefined) {
        throw Error("less encountered undefined")
    }
    return a < b
}

describe("OrderedArray", function() {
    it("two elements in order", function() {
        let array = new OrderedArray<number>( (a:number, b: number) => { return less(a, b) } )
        array.insert(1)
        array.insert(2)
        
        expect(array.length).to.equal(2)
        expect(array.at(0)).to.equal(1)
        expect(array.at(1)).to.equal(2)
    })

    it("two elements in reverse", function() {
        let array = new OrderedArray<number>( (a:number, b: number) => { return less(a, b) } )
        array.insert(2)
        array.insert(1)
        
        expect(array.length).to.equal(2)
        expect(array.at(0)).to.equal(1)
        expect(array.at(1)).to.equal(2)
    })

    it("three elements in order", function() {
        let array = new OrderedArray<number>( (a:number, b: number) => { return less(a, b) } )
        array.insert(1)
        array.insert(2)
        array.insert(3)
        
        expect(array.length).to.equal(3)
        expect(array.at(0)).to.equal(1)
        expect(array.at(1)).to.equal(2)
        expect(array.at(2)).to.equal(3)
    })

    it("three elements in reverse", function() {
        let array = new OrderedArray<number>( (a:number, b: number) => { return less(a, b) } )
        array.insert(3)
        array.insert(2)
        array.insert(1)
        
        expect(array.length).to.equal(3)
        expect(array.at(0)).to.equal(1)
        expect(array.at(1)).to.equal(2)
        expect(array.at(2)).to.equal(3)
    })

    it("three elements, last inserted into middle", function() {
        let array = new OrderedArray<number>( (a:number, b: number) => { return less(a, b) } )
        array.insert(1)
        array.insert(3)
        array.insert(2)
        
        expect(array.length).to.equal(3)
        expect(array.at(0)).to.equal(1)
        expect(array.at(1)).to.equal(2)
        expect(array.at(2)).to.equal(3)
    })
})

