import * as puppeteer from "puppeteer"
import * as httpServer from "http-server"

export var browser: puppeteer.Browser
export var httpd: any

// puppeteer options
const opts = {
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  headless: true,
//  slowMo: 100,
  timeout: 100000
}

// expose variables
before(async function () {
console.log("start daemons")
  browser = await puppeteer.launch(opts)
  httpd = httpServer.createServer()
  httpd.listen(8080, "127.0.0.1")
console.log("started daemons")
})

// close browser and reset global variables
after(function () {
console.log("terminate daemons")
  httpd.close()
  browser.close()
console.log("terminated daemons")
})
