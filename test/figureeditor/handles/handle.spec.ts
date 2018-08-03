import { expect } from "chai"
import * as puppeteer from "puppeteer"
//import * as toad from "toad.js"

//import { browser } from "test/bootstrap"
import { browser } from "../../bootstrap"

declare module unittest {
    function run(testname: string): any
}

describe("figureeditor", function() {
    beforeEach(function() {
//        toad.unbind()
//        document.body.innerHTML = ""
    })

    describe("handles", function() {
        it("click", async function() {

            const page = await browser.newPage()
            page.on('console', msg=> { console.log('console: ', msg.text()) })
            page.on('error', err=> { console.log('error: ', err) })
            page.on('pageerror', pageerr=> { console.log('page error: ', pageerr) })
            page.on('requestfailed', error=> { console.log('request failed: ', error) })
            
            // set the viewport so we know the dimensions of the screen
            await page.setViewport({ width: 800, height: 600 })

            // go to a page setup for mouse event tracking
            await page.goto("http://127.0.0.1:8080/test/index.html")
            try {
                await page.evaluate(() => unittest.run('figureeditor.handles.initialize') )
                await page.mouse.move(75,75)
                await page.mouse.down()
                await page.mouse.up()
                
                // 48 47 
                // no: 46 46.5 46.9

                for(let i=0; i<1; ++i) {
                    await page.mouse.move(46.9,50)
                    await page.mouse.down()
                    await page.mouse.move(6,50)
                    await page.mouse.up()
                    let x = await page.evaluate(() => unittest.run('figureeditor.handles.get-x-position') )
                    console.log(x)
//                    expect(x).to.equal(10.5)
/*                    
                    
                    await page.mouse.down()
                    await page.mouse.move(52,52)
                    await page.mouse.up()
                    expect(x).to.equal(50.5)
*/
                }
            }
            catch(e) {
                console.log(e.stack)
            }

            await page.screenshot({ path: 'mouse_click.png' })

            
            /*
                strategy for mocha+pupeteer unit tests:
                
                import a utility file to load the page, etc.
                
                a directory containing:
            
                test.spec.ts	-> test execution
                index.html	-> load via pupeteer into browser
                script.ts	-> compile to script.js
                
                we also don't include the bundle but use the compiled source
                and fetch what we need
            */
            
            

            // click an area
//            await page.mouse.click(132, 103, { button: 'left' })

            // the screenshot should show feedback from the page that right part was clicked.
//            await browser.close()
/*

        let html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Workflow</title>
    <script type="application/javascript" src="http://127.0.0.1:8080/polyfill/webcomponents-hi-sd-ce.js"></script>
    <script type="application/javascript" src="http://127.0.0.1:8080/polyfill/path-data-polyfill.js"></script>
    <script type="application/javascript" src="http://127.0.0.1:8080/js/workflow.js"></script>
    <script type="application/javascript">
function theTest() {
    console.log('D-oh!')
    document.body = '<toad-figureeditor model="model"></toad-figureeditor>'
}
    </script>
  </head>
  <body onload="workflow.runtest( () => { theTest() } )"></body>
</html>`
            const page = await browser.newPage()
            page.on("console", msg => {
                for (let i = 0; i < msg.args().length; ++i)
                    console.log(`${i}: ${msg.args()[i]}`)
            })
            page.setContent(html)
            await page.keyboard.type("Ok", {delay: 100})
            browser.close()
*/
        })
    })
})
