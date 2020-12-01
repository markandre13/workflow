import {expect} from "chai"
import {annotate} from "karma-mocha-html-annotations-reporter"

// describe("workflow", function() {
//     describe("wordwrap", function() {
        it("works", function() {
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
            svg.style.border = "1px solid #ddd"
            svg.setAttributeNS("", "width", "320")
            svg.setAttributeNS("", "height", "200")
            svg.setAttributeNS("", "viewBox", "0 0 320 200")

            let text = document.createElementNS("http://www.w3.org/2000/svg", "text")
            text.setAttributeNS("", "fill", "#000")
            text.setAttributeNS("", "x", "2")
            text.setAttributeNS("", "y", "20")
            text.appendChild(document.createTextNode("ZACKY BUMM CRASH"))
            svg.appendChild(text)

            annotate(this, svg)

            // const h = new Hello()      
            // annotate(this, "i am the 1st test out of three WAWE")
            // expect(h.speak()).to.equal(4711)
        })
//         it("fails", function() {
//             // annotate(this, "i am the 2nd test out of three")
//             let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
//             svg.style.border = "1px solid #ddd"
//             svg.setAttributeNS("", "width", "320")
//             svg.setAttributeNS("", "height", "200")
//             svg.setAttributeNS("", "viewBox", "0 0 320 200")

//             let text = document.createElementNS("http://www.w3.org/2000/svg", "text")
//             text.setAttributeNS("", "fill", "#000")
//             text.setAttributeNS("", "x", "2")
//             text.setAttributeNS("", "y", "20")
//             text.appendChild(document.createTextNode("ZACK BUMM CRASH"))
//             svg.appendChild(text)

//             annotate(this, svg)

//             expect(1).to.equal(2)
//         })
//         it("works again", function() {
//             // annotate(this, "i am the 3rd test out of three")
//             let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
//             svg.style.border = "1px solid #ddd"
//             svg.setAttributeNS("", "width", "320")
//             svg.setAttributeNS("", "height", "200")
//             svg.setAttributeNS("", "viewBox", "0 0 320 200")

//             let text = document.createElementNS("http://www.w3.org/2000/svg", "text")
//             text.setAttributeNS("", "fill", "#000")
//             text.setAttributeNS("", "x", "2")
//             text.setAttributeNS("", "y", "20")
//             text.appendChild(document.createTextNode("ZACK BUMM CRASH"))
//             svg.appendChild(text)

//             annotate(this, svg)

//             expect(2).to.equal(2)
//         })
//     })

//     describe("some other tests", function() {
//         it("works", function() {
//         })
//         it("fails", function() {
//             expect(1).to.equal(2)
//         })
//         it("works again", function() {
//             expect(2).to.equal(2)
//         })
//     })
// })
