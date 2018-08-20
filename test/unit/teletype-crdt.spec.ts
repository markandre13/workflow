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

const crdt = require("@atom/teletype-crdt")
const {ZERO_POINT} = require('@atom/teletype-crdt/lib/point-helpers')

interface Position {
    row: number
    column: number
}

function dump(data: any, indent: number=1): void {
    let space = ""
    for(let i=0; i<indent; ++i)
        space += "  "
    for(let attribute in data) {
        if (typeof data[attribute] === "object") {
            console.log(space + attribute + " = {")
            dump(data[attribute], indent + 1)
            console.log(space + "}")
        } else {
            console.log(space + attribute + " = " + data[attribute])
        }
    }
}

// class Teletype mimics the API of teletype-client's BufferProxy class
class Teletype {
    siteId: number
    document: any

    constructor(text: string, history: any|undefined, siteId: number) {
        this.siteId = siteId
        this.document = new crdt.Document({siteId: siteId, text: text, history: history})
    }
    
    setTextInRange(oldStart: Position, oldEnd: Position, newText: string) {
        const operations = this.document.setTextInRange(oldStart, oldEnd, newText)
        console.log("broadcast:")
        dump(operations)
        
        this.document.integrateOperations(operations)
        this.document.integrateOperations(operations)
        console.log(this.document.getText())
    }
    
    integrateOperations(operations: any) {
/*
        const {textUpdates, markerUpdates} = this.document.integrateOperations(operations)
        if (this.delegate) this.delegate.updateText(textUpdates)
        // this.emitter.emit('did-update-markers', markerUpdates)
        if (textUpdates.length > 0) {
            this.emitter.emit('did-update-text', {remote: true})
        }
*/
    }
}

xdescribe("teletype-crdt", function() {
    before(function() {
    })
    
    describe("foo", function() {

        it("fuu", function() {
            let teletype = new Teletype("ABCDEFG", undefined, 1)
            teletype.setTextInRange({row: 0, column: 2}, ZERO_POINT, "+++")
        })

        it("bar", function() {
            let replica1 = new crdt.Document({siteId: 1, text: "ABCDEFG"})
            let ops1 = replica1.setTextInRange({row: 0, column: 2}, ZERO_POINT, '+++')
console.log(ops1)
            const {textUpdates, markerUpdates} = replica1.integrateOperations(ops1)
            console.log(textUpdates)
            console.log(markerUpdates)
//            replica1.testLocalDocument = new crdt.LocalDocument(replica1.getText())
            
//            const replica2 = replica1.replicate(2)
//            replica2.testLocalDocument = new LocalDocument(/*replica2.getText()*/)
            
//            replica1.setTextInRange({row: 0, column: 2}, crdt.ZERO_POINT, '+++')
            
//            replica.testLocalDocument.setTextInRange(start, end, text)
//            replica1.setTextInRange(start, end, text, options)
        })
    })
})
