const expect = chai.expect

// import { Hello } from "../main/hello"

function annotate(test: any, context: string) {
    const currentTest = test.currentTest
    const activeTest = test.test
    const isEachHook = currentTest && /^"(?:before|after)\seach"/.test(activeTest.title);
    const t = isEachHook ? currentTest : activeTest;
    t.context = context
}

describe("wordwrap", function() {
    it("works", function() {
//        const h = new Hello()      
        annotate(this, "i am the 1st test out of three")
//        expect(h.speak()).to.equal(4711)
        expect(2).to.equal(2)
    })
    it("fails", function() {
        annotate(this, "i am the 2nd test out of three")
        expect(1).to.equal(2)
    })
    it("works again", function() {
        annotate(this, "i am the 3rd test out of three")
        expect(2).to.equal(2)
    })
})
