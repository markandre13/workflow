declare module "chai-as-promised" {
    const chaiAsPromised: Chai.ChaiPlugin
    export default chaiAsPromised
}

declare namespace Chai {
    interface Assertion {
        fulfilled: Promise<void>
        rejected: Promise<void>
        rejectedWith(errorLike?: unknown, errMsgMatcher?: string | RegExp, message?: string): Promise<void>
        eventually: Assertion
    }
}
