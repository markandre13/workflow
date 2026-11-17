import { describe, it, expect } from "vitest"

import { Ruler, Orientation } from "client/shapeeditor/Ruler"
import { Layer, ShapeEditor } from "client/shapeeditor"
import { LocalDrawingModel } from "client/shapeeditor/LocalDrawingModel"
import { DocumentSettings } from "client/app/DocumentSettings"
import { Unit } from "client/app/Unit"
import { unitDefinitions } from "client/app/unitDefinitions"
import { Rectangle } from "client/shapes"
import { screenSync } from "./screenSync"

let nextId = 1

function rectangle(x: number, y: number, width: number, height: number): Rectangle {
    return new Rectangle({ id: nextId++, origin: { x, y }, size: { width, height } })
}

class RulerPage {
    readonly editor = new ShapeEditor()
    readonly ruler = new Ruler()

    constructor(orientation: Orientation = "horizontal") {
        const model = new LocalDrawingModel()
        model.layers.push(new Layer())
        this.editor.setModel(model)
        this.ruler.orientation = orientation
        if (orientation === "horizontal") {
            this.ruler.style.width = "640px"
            this.ruler.style.height = "20px"
        } else {
            this.ruler.style.width = "20px"
            this.ruler.style.height = "480px"
        }
        this.editor.style.position = "relative"
        this.editor.style.width = "640px"
        this.editor.style.height = "480px"
    }

    add(...shapes: Rectangle[]): this {
        for (const shape of shapes) {
            this.editor.addShape(shape)
        }
        return this
    }

    async mount(): Promise<void> {
        document.body.replaceChildren(this.ruler, this.editor)
        // shapes measure themselves while attached, so lay out again now that they are
        this.editor.invalidate()
        this.ruler.attach(this.editor)
        await this.settle()
    }

    async settle(): Promise<void> {
        await screenSync()
        await screenSync()
    }

    setUnits(units: Unit): void {
        const settings = new DocumentSettings()
        settings.units.value = units
        this.ruler.documentSettings = settings
    }

    labels(): SVGTextElement[] {
        return Array.from(this.ruler.shadowRoot!.querySelectorAll("text"))
    }
}

describe("Ruler", () => {
    describe("without an editor", () => {
        it("labels every 100 units starting at 0", async () => {
            const ruler = new Ruler()
            ruler.style.width = "640px"
            ruler.style.height = "20px"
            document.body.replaceChildren(ruler)
            await screenSync()
            ruler.update()

            const labels = Array.from(ruler.shadowRoot!.querySelectorAll("text")).map(t => t.textContent)
            expect(labels).to.deep.equal(["0", "100", "200", "300", "400", "500", "600"])
        })
    })

    describe("horizontal, attached to an editor", () => {
        it("starts at 0 when the canvas starts at the left edge", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(1000, 0, 10, 10),
            )
            await page.mount()

            expect(page.editor.scrollLeft).to.equal(0)
            const first = page.labels()[0]
            expect(first.textContent).to.equal("0")
            expect(first.getAttribute("x")).to.equal("2.5")
        })

        it("starts at 0 when the canvas extends to negative x", async () => {
            const page = new RulerPage().add(
                rectangle(-50, 240, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            await page.mount()

            expect(page.editor.scrollLeft).to.equal(50)
            const first = page.labels()[0]
            expect(first.textContent).to.equal("0")
            expect(first.getAttribute("x")).to.equal("2.5")
        })

        it("follows the editor when it is scrolled", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(1000, 0, 10, 10),
            )
            await page.mount()

            page.editor.scrollLeft = 100
            await page.settle()

            expect(page.editor.scrollLeft).to.equal(100)
            const first = page.labels()[0]
            expect(first.textContent).to.equal("100")
            expect(first.getAttribute("x")).to.equal("2.5")
        })
    })

    describe("unit", () => {
        // the x positions of the ticks, in pixels, from the path data
        function tickPositions(page: RulerPage): number[] {
            const d = page.ruler.shadowRoot!.querySelector("path")!.getAttribute("d")!
            return d.split("M").slice(1).map(entry => parseFloat(entry))
        }

        it("labels are in the unit, spaced by its size in pixels", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            await page.mount()
            const millimeter = 72 / 25.4
            page.setUnits(Unit.MILLIMETERS)

            const labels = page.labels()
            expect(labels[0].textContent).to.equal("0")
            expect(labels[1].textContent).to.equal("100")
            const x = labels.map(label => parseFloat(label.getAttribute("x")!))
            expect(x[1] - x[0]).to.be.closeTo(100 * millimeter, 0.01)
        })

        it("large units get a label per unit and finer ticks between them", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            await page.mount()
            page.setUnits(Unit.INCHES)

            const labels = page.labels()
            expect(labels.slice(0, 3).map(label => label.textContent)).to.deep.equal(["0", "1", "2"])
            const x = labels.map(label => parseFloat(label.getAttribute("x")!))
            expect(x[1] - x[0]).to.be.closeTo(72, 0.01)
        })

        it("ticks inside a label interval are whole subdivisions of the unit", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            await page.mount()
            page.setUnits(Unit.INCHES)

            // sixteen ticks per inch, 4.5 pixels apart, so the tick path has one move per tick
            const d = page.ruler.shadowRoot!.querySelector("path")!.getAttribute("d")!
            const moves = d.split("M").length - 1
            expect(moves).to.equal(Math.floor((640 - 0.5) / 4.5) + 1)
        })

        it("pixels at 100% have ten ticks between labels", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            await page.mount()
            page.setUnits(Unit.PIXELS)

            const x = tickPositions(page)
            expect(x[1] - x[0]).to.be.closeTo(10, 0.01)
            expect(x[10] - x[0]).to.be.closeTo(100, 0.01)
        })

        it("metric labels are powers of ten, so at 100 pixels per unit they are every unit", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            page.editor.zoomTo(100 / unitDefinitions[Unit.MILLIMETERS].scale)
            await page.mount()
            page.setUnits(Unit.MILLIMETERS)

            const labels = page.labels()
            expect(labels.slice(0, 3).map(label => label.textContent)).to.deep.equal(["0", "1", "2"])
            const x = labels.map(label => parseFloat(label.getAttribute("x")!))
            expect(x[1] - x[0]).to.be.closeTo(100, 0.01)
        })

        it("imperial units below 40 pixels are labelled in whole inches", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            page.editor.zoomTo(20 / unitDefinitions[Unit.INCHES].scale)
            await page.mount()
            page.setUnits(Unit.INCHES)

            // two inches is 40 pixels, so labels are every two inches and ticks every inch
            const labels = page.labels()
            expect(labels.slice(0, 3).map(label => label.textContent)).to.deep.equal(["0", "2", "4"])
            const x = tickPositions(page)
            expect(x[1] - x[0]).to.be.closeTo(20, 0.01)
        })

        it("zoomed-in imperial labels are fractions of an inch", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            page.editor.zoomTo(200 / unitDefinitions[Unit.INCHES].scale)
            await page.mount()
            page.setUnits(Unit.INCHES)

            // an inch is 200 pixels, so labels are every half inch, 100 pixels apart
            const labels = page.labels()
            expect(labels.slice(0, 3).map(label => label.textContent)).to.deep.equal(["0", "½", "1"])
            const x = labels.map(label => parseFloat(label.getAttribute("x")!))
            expect(x[1] - x[0]).to.be.closeTo(100, 0.01)
        })

        it("tick lengths step down from major to tiny", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            await page.mount()
            page.setUnits(Unit.INCHES)

            // the sixteenth ticks are 4.5 pixels apart: the inch is major, the half inch medium, the quarter small,
            // and the eighths in between minor
            const d = page.ruler.shadowRoot!.querySelector("path")!.getAttribute("d")!
            const lengths = [...d.matchAll(/M[\d.]+ ([\d.]+)V([\d.]+)/g)].map(m => parseFloat(m[1]) - parseFloat(m[2]))
            expect(lengths[0]).to.equal(20)
            expect(lengths[1]).to.equal(6)
            expect(lengths[2]).to.equal(6)
            expect(lengths[4]).to.equal(9)
            expect(lengths[8]).to.equal(12)
            expect(lengths[16]).to.equal(20)
        })

        it("pixels at 66.7% have ten ticks between labels", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            await page.mount()
            page.editor.zoomTo(2 / 3)
            page.setUnits(Unit.PIXELS)

            // a label is 100 pixels, 66.7 on screen, so ticks are 6.7 pixels apart
            const x = tickPositions(page)
            expect(x[1] - x[0]).to.be.closeTo(10 * 2 / 3, 0.01)
            expect(x[10] - x[0]).to.be.closeTo(100 * 2 / 3, 0.01)
        })

        it("imperial units are divided in halves down to sixteenths", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            await page.mount()
            page.setUnits(Unit.INCHES)

            // an inch is 72 pixels: 16 sixteenths of 4.5 pixels each
            const x = tickPositions(page)
            expect(x[0]).to.equal(0.5)
            expect(x[1]).to.equal(5)
            expect(x[16]).to.equal(72.5)
        })

        it("metric units are divided in tens", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            await page.mount()
            // a centimeter at 2x is 56.7 pixels, so its tenths are 5.67 pixels apart
            page.editor.zoomTo(2)
            const centimeter = 1 / 25.4 * 72 * 10
            page.setUnits(Unit.CENTIMETERS)

            const x = tickPositions(page)
            expect(x[1] - x[0]).to.be.closeTo(centimeter / 10 * 2, 0.01)
            expect(x[10] - x[0]).to.be.closeTo(centimeter * 2, 0.01)
        })

        it("no two ticks are closer than 4 pixels at any unit size", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            await page.mount()
            for (const units of [Unit.MILLIMETERS, Unit.INCHES]) {
                page.setUnits(units)
                for (let unit = 0.01; unit < 5000; unit *= 1.3) {
                    page.editor.zoomTo(unit / unitDefinitions[units].scale)
                    page.ruler.update()
                    const x = tickPositions(page)
                    for (let i = 1; i < x.length; i++) {
                        expect(x[i] - x[i - 1], `units ${units}, unit ${unit}, tick ${i}`).to.be.greaterThanOrEqual(4 - 1e-9)
                    }
                }
            }
        })

        it("no more than four ticks of one length are next to each other", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            await page.mount()
            for (const units of [Unit.PIXELS, Unit.INCHES, Unit.FEET, Unit.MILLIMETERS]) {
                page.setUnits(units)
                const d = page.ruler.shadowRoot!.querySelector("path")!.getAttribute("d")!
                // each tick is "M<x> <height>V<end>", so its length is the height less the end
                const lengths = [...d.matchAll(/M[\d.]+ ([\d.]+)V([\d.]+)/g)].map(m => parseFloat(m[1]) - parseFloat(m[2]))
                let run = 0
                for (let i = 0; i < lengths.length; i++) {
                    run = i > 0 && lengths[i] === lengths[i - 1] ? run + 1 : 1
                    expect(run, `units ${units}, tick ${i}`).to.be.lessThanOrEqual(4)
                }
            }
        })
    })

    describe("zoomed editor", () => {
        it("labels are spaced by the zoom, every 100 canvas units at 2x", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            await page.mount()
            page.editor.zoomTo(2)

            const labels = page.labels()
            expect(labels.length).to.be.greaterThan(1)
            const x = labels.map(label => parseFloat(label.getAttribute("x")!))
            expect(x[1] - x[0]).to.equal(200)
        })
    })

    describe("panning with the middle button", () => {
        function pointer(button: number, x: number, y: number) {
            return { button, clientX: x, clientY: y, pointerId: 1, preventDefault() {} } as unknown as PointerEvent
        }

        it("dragging the horizontal ruler scrolls the canvas by the opposite of the drag", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(1000, 0, 10, 10),
            )
            await page.mount()
            page.ruler.setPointerCapture = () => {}

            page.ruler.onpointerdown!(pointer(1, 100, 10))
            page.ruler.onpointermove!(pointer(1, 80, 10))
            page.ruler.onpointermove!(pointer(1, 60, 10))
            page.ruler.onpointerup!(pointer(1, 60, 10))

            expect(page.editor.scrollLeft).to.equal(40)
            expect(page.editor.scrollTop).to.equal(0)
        })

        it("dragging the vertical ruler scrolls the canvas by the opposite of the drag", async () => {
            const page = new RulerPage("vertical").add(
                rectangle(0, 0, 10, 10),
                rectangle(0, 1000, 10, 10),
            )
            await page.mount()
            page.editor.scrollTop = 100
            await page.settle()
            page.ruler.setPointerCapture = () => {}

            page.ruler.onpointerdown!(pointer(1, 10, 200))
            page.ruler.onpointermove!(pointer(1, 10, 230))
            page.ruler.onpointerup!(pointer(1, 10, 230))

            expect(page.editor.scrollTop).to.equal(70)
            expect(page.editor.scrollLeft).to.equal(0)
        })

        it("dragging past the left edge grows the canvas and dragging back shrinks it", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            await page.mount()
            page.ruler.setPointerCapture = () => {}
            expect(page.editor.svg.getAttribute("viewBox")).to.equal("0 0 640 480")

            // dragging right shows the canvas left of the origin
            page.ruler.onpointerdown!(pointer(1, 100, 10))
            page.ruler.onpointermove!(pointer(1, 200, 10))
            expect(page.editor.svg.getAttribute("viewBox")).to.equal("-100 0 740 480")
            expect(page.editor.scrollLeft).to.equal(0)

            // dragging back removes the extra room
            page.ruler.onpointermove!(pointer(1, 100, 10))
            page.ruler.onpointerup!(pointer(1, 100, 10))
            expect(page.editor.svg.getAttribute("viewBox")).to.equal("0 0 640 480")
            expect(page.editor.scrollLeft).to.equal(0)
        })

        it("dragging past the right edge grows the canvas and dragging back shrinks it", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            await page.mount()
            page.ruler.setPointerCapture = () => {}

            page.ruler.onpointerdown!(pointer(1, 200, 10))
            page.ruler.onpointermove!(pointer(1, 100, 10))
            expect(page.editor.svg.getAttribute("viewBox")).to.equal("0 0 740 480")
            expect(page.editor.scrollLeft).to.equal(100)

            page.ruler.onpointermove!(pointer(1, 200, 10))
            page.ruler.onpointerup!(pointer(1, 200, 10))
            expect(page.editor.svg.getAttribute("viewBox")).to.equal("0 0 640 480")
            expect(page.editor.scrollLeft).to.equal(0)
        })

        it("dragging the vertical ruler past the top edge grows the canvas", async () => {
            const page = new RulerPage("vertical").add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            await page.mount()
            page.ruler.setPointerCapture = () => {}

            page.ruler.onpointerdown!(pointer(1, 10, 100))
            page.ruler.onpointermove!(pointer(1, 10, 200))
            expect(page.editor.svg.getAttribute("viewBox")).to.equal("0 -100 640 580")
            expect(page.editor.scrollTop).to.equal(0)

            page.ruler.onpointermove!(pointer(1, 10, 100))
            page.ruler.onpointerup!(pointer(1, 10, 100))
            expect(page.editor.svg.getAttribute("viewBox")).to.equal("0 0 640 480")
        })

        it("the left button does not pan", async () => {
            const page = new RulerPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(1000, 0, 10, 10),
            )
            await page.mount()
            page.ruler.setPointerCapture = () => {}

            page.ruler.onpointerdown!(pointer(0, 100, 10))
            page.ruler.onpointermove!(pointer(0, 60, 10))
            page.ruler.onpointerup!(pointer(0, 60, 10))

            expect(page.editor.scrollLeft).to.equal(0)
        })
    })

    describe("vertical, attached to an editor", () => {
        it("starts at 0 when the canvas starts at the top edge", async () => {
            const page = new RulerPage("vertical").add(
                rectangle(0, 0, 10, 10),
                rectangle(0, 1000, 10, 10),
            )
            await page.mount()

            expect(page.editor.scrollTop).to.equal(0)
            const first = page.labels()[0]
            expect(first.textContent).to.equal("0")
            expect(first.getAttribute("transform")).to.equal("translate(7 0) rotate(-90)")
        })

        it("starts at 0 when the canvas extends to negative y", async () => {
            const page = new RulerPage("vertical").add(
                rectangle(-10, -50, 10, 10),
                rectangle(0, 430, 10, 10),
            )
            await page.mount()

            expect(page.editor.scrollTop).to.equal(50)
            const first = page.labels()[0]
            expect(first.textContent).to.equal("0")
            expect(first.getAttribute("transform")).to.equal("translate(7 0) rotate(-90)")
        })

        it("follows the editor when it is scrolled", async () => {
            const page = new RulerPage("vertical").add(
                rectangle(0, 0, 10, 10),
                rectangle(0, 1000, 10, 10),
            )
            await page.mount()

            page.editor.scrollTop = 100
            await page.settle()

            expect(page.editor.scrollTop).to.equal(100)
            const first = page.labels()[0]
            expect(first.textContent).to.equal("100")
            expect(first.getAttribute("transform")).to.equal("translate(7 0) rotate(-90)")
        })
    })
})
