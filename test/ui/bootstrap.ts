import * as puppeteer from "puppeteer"
import * as httpServer from "http-server"

export var browser: puppeteer.Browser
export var httpd: any

console.log("bootstrap.ts has been included")

// puppeteer options
const opts = {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
//  slowMo: 100,
    timeout: 100000
}

before(async function () {
    console.log("before()")
    browser = await puppeteer.launch(opts)
    httpd = httpServer.createServer()
    httpd.listen(8080, "127.0.0.1")
})

// close browser and reset global variables
after(function () {
    httpd.close()
    browser.close()
})
