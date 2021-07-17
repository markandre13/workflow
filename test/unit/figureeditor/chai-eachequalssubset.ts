import { Assertion } from "chai"

declare global {
    namespace Chai {
        interface Assertion {
            eachEqualsSubset(expected: any[]): Assertion
        }
    }
}

export = chaiEachEqualsSubset

function chaiEachEqualsSubset(chai: Chai.ChaiStatic, utils: Chai.ChaiUtils): void {
    Assertion.addMethod('eachEqualsSubset', function (expectation) {
        // console.log("eachEqualsSubset")
        // console.log(this)
        // console.log(expectation)

        let failMessage = "unknown mismatch", negatedFailMessage = "unknown mismatch"
        let okay = true
        if (this._obj instanceof Array && expectation instanceof Array) {
            if (this._obj.length === expectation.length) {
                let expect = "["
                let got = "["
                for (let i = 0; i < this._obj.length; ++i) {
                    if (i !== 0) {
                        expect += ", "
                        got += ", "
                    }
                    expect += `${i}:{`
                    got += `${i}:{`
                    Object.getOwnPropertyNames(expectation[i]).forEach((key, idx) => {
                        if (idx !== 0) {
                            expect += ", "
                            got += ", "
                        }
                        expect += `${key}:${expectation[i][key]}`
                        if (key in this._obj[i]) {
                            got += `${key}:${this._obj[i][key]}`
                            if (this._obj[i][key] !== expectation[i][key]) {
                                okay = false
                            }
                        } else {
                            got += `not ${key}`
                            okay = false
                        }
                    })
                    expect += `}`
                    got += `}`
                }
                expect += "]"
                got += "]"
                failMessage = `expected each of ${got} to respectivly be a subset of ${expect}.`
                negatedFailMessage = `expected not each of ${got} to respectivly to be a subset of ${expect}.`
            } else {
                okay = false
                failMessage = `expected #{this} to have ${expectation.length} elements.`
                negatedFailMessage = `expected #{this} to not have ${expectation.length} elements`
            }
        } else {
            okay = false
            failMessage = negatedFailMessage = "expected #{this} to be an array."
        }

        this.assert(okay, failMessage, negatedFailMessage, expectation, this._obj, false)
    })
}
