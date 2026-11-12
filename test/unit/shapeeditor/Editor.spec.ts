import { describe, it, expect } from "vitest"

import { Editor } from "client/shapeeditor/Editor"
import { Rectangle } from "client/shapes"
import { screenSync } from "./screenSync"

let nextId = 1

function rectangle(x: number, y: number, width: number, height: number): Rectangle {
    return new Rectangle({ id: nextId++, origin: { x, y }, size: { width, height } })
}

function reposition(shape: Rectangle, dx: number, dy: number): void {
    shape.origin = { x: shape.origin.x + dx, y: shape.origin.y + dy }
}

class EditorPage {
    readonly editor = new Editor()

    constructor(width = 640, height = 480) {
        this.editor.style.position = "relative"
        this.editor.style.width = `${width}px`
        this.editor.style.height = `${height}px`
    }

    add(...shapes: Rectangle[]): this {
        for (const shape of shapes) {
            this.editor.add(shape)
        }
        return this
    }

    async mount(): Promise<void> {
        document.body.replaceChildren(this.editor)
        await this.settle()
    }

    scrollTo(left?: number, top?: number): void {
        if (left !== undefined) {
            this.editor.scrollLeft = left
        }
        if (top !== undefined) {
            this.editor.scrollTop = top
        }
    }

    reposition(shape: Rectangle, dx: number, dy: number): void {
        reposition(shape, dx, dy)
    }

    moveShape(shape: Rectangle, dx: number, dy: number): void {
        this.reposition(shape, dx, dy)
        this.editor.invalidate()
    }

    async settle(): Promise<void> {
        await screenSync()
    }

    get canvasWidth(): number {
        return this.editor.svg.clientWidth
    }

    get canvasHeight(): number {
        return this.editor.svg.clientHeight
    }
}

describe("Editor", () => {
    describe("update()", () => {
        describe("overflow with content filling the whole screen and SVG's origin in the editor's upper, left corner", () => {
            it("left", async () => {
                const page = new EditorPage().add(
                    rectangle(0, 0, 10, 10),
                    rectangle(630, 470, 10, 10),
                    // shape outside the visible area's left
                    rectangle(-50, 240, 10, 10),
                )
                await page.mount()

                expect(page.editor.scrollLeft).to.equal(50)
                expect(page.editor.scrollTop).to.equal(0)
                expect(page.canvasWidth).to.equal(640 + 50)
                expect(page.canvasHeight).to.equal(480)
            })

            it("right", async () => {
                const page = new EditorPage().add(
                    rectangle(0, 0, 10, 10),
                    rectangle(630, 470, 10, 10),
                    // shape outside the visible area's right
                    rectangle(680, 240, 10, 10),
                )
                await page.mount()

                expect(page.editor.scrollLeft).to.equal(0)
                expect(page.editor.scrollTop).to.equal(0)
                expect(page.canvasWidth).to.equal(640 + 50)
                expect(page.canvasHeight).to.equal(480)
            })

            it("top", async () => {
                // shape above the visible area's top
                const page = new EditorPage().add(
                    rectangle(0, 0, 10, 10),
                    rectangle(630, 470, 10, 10),
                    rectangle(320, -50, 10, 10),
                )
                await page.mount()

                expect(page.editor.scrollLeft).to.equal(0)
                expect(page.editor.scrollTop).to.equal(50)
                expect(page.canvasWidth).to.equal(640)
                expect(page.canvasHeight).to.equal(480 + 50)
            })

            it("bottom", async () => {
                // shape below the visible area's bottom
                const page = new EditorPage().add(
                    rectangle(0, 0, 10, 10),
                    rectangle(630, 470, 10, 10),
                    rectangle(320, -50, 10, 10),
                )
                await page.mount()

                expect(page.editor.scrollLeft).to.equal(0)
                expect(page.editor.scrollTop).to.equal(50)
                expect(page.canvasWidth).to.equal(640)
                expect(page.canvasHeight).to.equal(480 + 50)
            })
        })

        describe("overflow with content less than the whole screen and SVG's origin in the editor's upper, left corner", () => {
            it("left", async () => {
                const page = new EditorPage().add(rectangle(-50, 240, 10, 10))
                await page.mount()

                expect(page.editor.scrollLeft).to.equal(50)
                expect(page.editor.scrollTop).to.equal(0)
                expect(page.canvasWidth).to.equal(640 + 50)
            })

            it("right", async () => {
                const page = new EditorPage().add(rectangle(680, 240, 10, 10))
                await page.mount()

                expect(page.editor.scrollLeft).to.equal(0)
                expect(page.editor.scrollTop).to.equal(0)
                expect(page.canvasWidth).to.equal(640 + 50)
            })

            it("top", async () => {
                const page = new EditorPage().add(rectangle(320, -50, 10, 10))
                await page.mount()

                expect(page.editor.scrollLeft).to.equal(0)
                expect(page.editor.scrollTop).to.equal(50)
                expect(page.canvasHeight).to.equal(480 + 50)
            })

            it("bottom", async () => {
                const page = new EditorPage().add(rectangle(320, -50, 10, 10))
                await page.mount()

                expect(page.editor.scrollLeft).to.equal(0)
                expect(page.editor.scrollTop).to.equal(50)
                expect(page.canvasHeight).to.equal(480 + 50)
            })
        })

        describe("update does not move the screen content for the user", () => {
            it("left", async () => {
                const shape = rectangle(-50, 240, 10, 10)
                const page = new EditorPage().add(
                    rectangle(50, 50, 10, 10),
                    rectangle(630 - 50, 470 - 50, 10, 10),
                    shape,
                )
                await page.mount()

                expect(page.editor.scrollLeft).to.equal(50)
                expect(page.editor.scrollTop).to.equal(0)
                expect(page.canvasWidth).to.equal(640 + 50)
                expect(page.canvasHeight).to.equal(480)

                page.scrollTo(-50)
                page.moveShape(shape, 100, 0)
                await page.settle()

                expect(page.editor.scrollLeft).to.equal(0)
                expect(page.editor.scrollTop).to.equal(0)
                expect(page.canvasWidth).to.equal(640)
                expect(page.canvasHeight).to.equal(480)
            })

            it("right", async () => {
                const shape = rectangle(680, 240, 10, 10)
                const page = new EditorPage().add(
                    rectangle(50, 50, 10, 10),
                    rectangle(630 - 50, 470 - 50, 10, 10),
                    shape,
                )
                await page.mount()

                expect(page.editor.scrollLeft).to.equal(0)
                expect(page.editor.scrollTop).to.equal(0)
                expect(page.canvasWidth).to.equal(640 + 50)
                expect(page.canvasHeight).to.equal(480)

                page.scrollTo(50)
                page.moveShape(shape, -100, 0)
                await page.settle()

                expect(page.editor.scrollLeft).to.equal(50)
                expect(page.editor.scrollTop).to.equal(0)
                expect(page.canvasWidth).to.equal(690)
                expect(page.canvasHeight).to.equal(480)
            })

            it("top", async () => {
                const shape = rectangle(320, -50, 10, 10)
                const page = new EditorPage().add(
                    rectangle(50, 50, 10, 10),
                    rectangle(630 - 50, 470 - 50, 10, 10),
                    shape,
                )
                await page.mount()

                expect(page.editor.scrollLeft).to.equal(0)
                expect(page.editor.scrollTop).to.equal(50)
                expect(page.canvasWidth).to.equal(640)
                expect(page.canvasHeight).to.equal(480 + 50)

                page.scrollTo(undefined, -50)
                page.moveShape(shape, 0, 100)
                await page.settle()

                expect(page.editor.scrollLeft).to.equal(0)
                expect(page.editor.scrollTop).to.equal(0)
                expect(page.canvasWidth).to.equal(640)
                expect(page.canvasHeight).to.equal(480)
            })

            it("bottom", async () => {
                const shape = rectangle(320, 500, 10, 10)
                const page = new EditorPage().add(
                    rectangle(50, 50, 10, 10),
                    rectangle(630 - 50, 470 - 50, 10, 10),
                    shape,
                )
                await page.mount()

                expect(page.editor.scrollLeft).to.equal(0)
                expect(page.editor.scrollTop).to.equal(0)
                expect(page.canvasWidth).to.equal(640)
                expect(page.canvasHeight).to.equal(510)

                page.scrollTo(undefined, 30)
                page.moveShape(shape, 0, -100)
                await page.settle()

                expect(page.editor.scrollLeft).to.equal(0)
                expect(page.editor.scrollTop).to.equal(30)
                expect(page.canvasWidth).to.equal(640)
                expect(page.canvasHeight).to.equal(510)
            })
        })

        describe("update shrinks the area when scrolling", () => {
            it("left", async () => {
                const shape = rectangle(-50, 240, 10, 10)
                const page = new EditorPage().add(
                    rectangle(50, 50, 10, 10),
                    rectangle(630 - 50, 470 - 50, 10, 10),
                    shape,
                )
                await page.mount()

                expect(page.editor.scrollLeft).to.equal(50)
                expect(page.editor.scrollTop).to.equal(0)
                expect(page.canvasWidth).to.equal(640 + 50)
                expect(page.canvasHeight).to.equal(480)

                page.scrollTo(-50)
                page.moveShape(shape, 100, 0)
                await page.settle()

                expect(page.editor.scrollLeft).to.equal(0)
                expect(page.editor.scrollTop).to.equal(0)
                expect(page.canvasWidth).to.equal(640)
                expect(page.canvasHeight).to.equal(480)

                // when scrolling
                page.scrollTo(50)
                await page.settle()

                expect(page.editor.scrollLeft).to.equal(0)
                expect(page.editor.scrollTop).to.equal(0)
                expect(page.canvasWidth).to.equal(640)
                expect(page.canvasHeight).to.equal(480)
            })

            it("right", async () => {
                const shape = rectangle(680, 240, 10, 10)
                const page = new EditorPage().add(
                    rectangle(50, 50, 10, 10),
                    rectangle(630 - 50, 470 - 50, 10, 10),
                    shape,
                )
                await page.mount()

                expect(page.canvasWidth).to.equal(640 + 50)

                page.scrollTo(20)
                page.reposition(shape, -100, 0)
                await page.settle()

                expect(page.canvasWidth).to.equal(640 + 30)
                expect(page.editor.scrollLeft).to.equal(20)
            })

            it("top", async () => {
                const shape = rectangle(320, -50, 10, 10)
                const page = new EditorPage().add(
                    rectangle(50, 50, 10, 10),
                    rectangle(630 - 50, 470 - 50, 10, 10),
                    shape,
                )
                await page.mount()

                expect(page.canvasHeight).to.equal(480 + 50)

                page.scrollTo(undefined, 20)
                page.reposition(shape, 0, 100)
                await page.settle()

                expect(page.canvasHeight).to.equal(480)
                expect(page.editor.scrollTop).to.equal(0)
            })

            it("bottom", async () => {
                const shape = rectangle(320, 500, 10, 10)
                const page = new EditorPage().add(
                    rectangle(50, 50, 10, 10),
                    rectangle(630 - 50, 470 - 50, 10, 10),
                    shape,
                )
                await page.mount()

                expect(page.canvasHeight).to.equal(510)

                page.scrollTo(undefined, 20)
                page.reposition(shape, 0, -100)
                await page.settle()

                expect(page.canvasHeight).to.equal(500)
                expect(page.editor.scrollTop).to.equal(20)
            })

            it("user can scroll content larger than the visible area", async () => {
                const page = new EditorPage().add(
                    rectangle(0, 0, 10, 10),
                    rectangle(1000, 0, 10, 10),
                )
                await page.mount()

                page.scrollTo(200)
                await page.settle()

                expect(page.editor.scrollLeft).to.equal(200)
            })

            it("shrinks by at most the amount scrolled", async () => {
                const shape = rectangle(-50, 240, 10, 10)
                const page = new EditorPage().add(
                    rectangle(50, 50, 10, 10),
                    rectangle(630 - 50, 470 - 50, 10, 10),
                    shape,
                )
                await page.mount()

                expect(page.canvasWidth).to.equal(640 + 50)

                page.scrollTo(40)
                page.reposition(shape, 50, 0)
                await page.settle()

                expect(page.canvasWidth).to.equal(640 + 30)
                expect(page.editor.scrollLeft).to.equal(30)
            })
        })
    })

    describe("update fits the canvas to moved shapes", () => {
        it("canvas grows when a shape moves outside and shrinks when it moves back", async () => {
            const shape = rectangle(-50, 240, 10, 10)
            const page = new EditorPage().add(
                rectangle(50, 50, 10, 10),
                rectangle(630 - 50, 470 - 50, 10, 10),
                shape,
            )
            await page.mount()

            expect(page.canvasWidth).to.equal(640 + 50)

            page.moveShape(shape, 300, 0)
            await page.settle()

            expect(page.canvasWidth).to.equal(640)

            page.moveShape(shape, 400, 0)
            await page.settle()

            expect(page.canvasWidth).to.equal(640 + 20)

            page.moveShape(shape, -400, 0)
            await page.settle()

            expect(page.canvasWidth).to.equal(640)
        })

        it("moving a shape back from outside does not scroll the content", async () => {
            const shape = rectangle(-50, 240, 10, 10)
            const page = new EditorPage().add(
                rectangle(50, 50, 10, 10),
                rectangle(630 - 50, 470 - 50, 10, 10),
                shape,
            )
            await page.mount()

            page.moveShape(shape, 750, 0)
            await page.settle()

            page.scrollTo(page.editor.scrollWidth - page.editor.clientWidth)
            await page.settle()

            // screen position of the canvas origin
            const originOnScreen = () => page.editor.svg.getBoundingClientRect().left - page.editor.svg.viewBox.baseVal.x * page.editor.zoom
            const before = originOnScreen()

            page.moveShape(shape, -750, 0)
            await page.settle()

            expect(originOnScreen()).to.equal(before)
        })

        it("canvas does not shrink on the left when a shape moves back while scrolled to the left", async () => {
            const shape = rectangle(-50, 240, 10, 10)
            const page = new EditorPage().add(
                rectangle(50, 50, 10, 10),
                rectangle(630 - 50, 470 - 50, 10, 10),
                shape,
            )
            await page.mount()

            page.moveShape(shape, -700, 0)
            await page.settle()

            page.scrollTo(0)
            await page.settle()

            const before = page.canvasWidth

            page.moveShape(shape, 700, 0)
            await page.settle()

            expect(page.canvasWidth).to.equal(before)
        })

        it("canvas does not shrink on the top when a shape moves back while scrolled to the top", async () => {
            const shape = rectangle(320, -50, 10, 10)
            const page = new EditorPage().add(
                rectangle(50, 50, 10, 10),
                rectangle(630 - 50, 470 - 50, 10, 10),
                shape,
            )
            await page.mount()

            page.moveShape(shape, 0, -700)
            await page.settle()

            page.scrollTo(undefined, 0)
            await page.settle()

            const before = page.canvasHeight

            page.moveShape(shape, 0, 700)
            await page.settle()

            expect(page.canvasHeight).to.equal(before)
        })
    })

    describe("shapeAt(pt: PointLike): Shape | undefined", () => {
        it("object in the middle of the screen", async () => {
            const shape = rectangle(320, 240, 10, 10)
            const page = new EditorPage().add(shape)
            await page.mount()

            expect(page.editor.shapeAt({ x: 325, y: 245 })).to.equal(shape)
        })

        it("object left outside the screen", async () => {
            const shape = rectangle(-50, 240, 10, 10)
            const page = new EditorPage().add(shape)
            await page.mount()

            expect(page.editor.shapeAt({ x: -45, y: 245 })).to.equal(shape)
        })
    })

    describe("zoom", () => {
        it("zooming in keeps the canvas point in the middle of the viewport in the middle", async () => {
            const page = new EditorPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            await page.mount()

            page.editor.zoomTo(2)

            // the middle of the 640x480 viewport is canvas (320, 240); at 2x it shows 320x240 canvas units
            expect(page.editor.zoom).to.equal(2)
            expect(page.editor.svg.style.width).to.equal("1280px")
            expect(page.editor.svg.style.height).to.equal("960px")
            expect(page.editor.scrollLeft).to.equal(320)
            expect(page.editor.scrollTop).to.equal(240)
        })

        it("zooming back out returns to the original view", async () => {
            const page = new EditorPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            await page.mount()

            page.editor.zoomTo(2)
            page.editor.zoomTo(1)

            expect(page.editor.svg.getAttribute("viewBox")).to.equal("0 0 640 480")
            expect(page.editor.scrollLeft).to.equal(0)
            expect(page.editor.scrollTop).to.equal(0)
        })

        it("panning moves the view by the pointer distance in canvas units", async () => {
            const page = new EditorPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(630, 470, 10, 10),
            )
            await page.mount()
            page.editor.zoomTo(2)
            const before = page.editor.scrollLeft

            // dragging the content left by 20 pixels moves the view right by 10 canvas units
            page.editor.pan(-20, 0)

            expect(page.editor.scrollLeft).to.equal(before + 20)
        })
    })

    describe("scrolling", () => {
        it("a scroll that does not start on a scrollbar updates right away", async () => {
            const page = new EditorPage().add(
                rectangle(0, 0, 10, 10),
                rectangle(1000, 0, 10, 10),
            )
            await page.mount()

            let updates = 0
            page.editor.addEventListener("viewchange", () => updates++)
            page.editor.onpointerdown!({
                button: 0,
                pointerId: 1,
                clientX: 100,
                clientY: 100,
                preventDefault() {},
            } as unknown as PointerEvent)

            page.editor.scrollLeft = 30
            await page.settle()

            expect(updates).to.equal(1)
        })
    })

    describe("sizing the canvas", () => {
        it("one pixel past the left edge widens the canvas by one pixel", async () => {
            const page = new EditorPage(620, 480).add(
                rectangle(50, 50, 10, 10),
                rectangle(630 - 50, 470 - 50, 10, 10),
                rectangle(-1, 240, 10, 10),
            )
            await page.mount()

            expect(page.canvasWidth).to.equal(621)
            expect(page.canvasHeight).to.equal(480)
            expect(page.editor.svg.getAttribute("viewBox")).to.equal("-1 0 621 480")
        })

        it("workaround for Safari 27.2: hides overflow while the canvas fits and scrolls when it does not", async () => {
            const page = new EditorPage(620, 480).add(rectangle(50, 50, 10, 10))
            await page.mount()

            expect(page.editor.hasAttribute("fits")).to.equal(true)
            expect(getComputedStyle(page.editor).overflow).to.equal("hidden")

            page.editor.add(rectangle(700, 50, 10, 10))
            await page.settle()

            expect(page.editor.hasAttribute("fits")).to.equal(false)
            expect(getComputedStyle(page.editor).overflow).to.equal("auto")
        })

        it("update() settles on the same canvas size when called again", async () => {
            const page = new EditorPage(620, 480).add(
                rectangle(50, 50, 10, 10),
                rectangle(-1, 240, 10, 10),
            )
            await page.mount()
            const before = page.editor.svg.getAttribute("viewBox")

            for (let i = 0; i < 4; i++) {
                page.editor.update()
            }

            expect(page.editor.svg.getAttribute("viewBox")).to.equal(before)
            expect(page.canvasWidth).to.equal(621)
            expect(page.canvasHeight).to.equal(480)
        })
    })

    it("bbox is undefined without shapes", () => {
        const editor = document.createElement("tx-editor") as Editor
        expect(editor.bbox()).toBeUndefined()
    })

    it("bbox encloses all shapes", () => {
        const editor = document.createElement("tx-editor") as Editor
        document.body.appendChild(editor)
        const first = rectangle(10, 20, 30, 40)
        const second = rectangle(100, 50, 60, 70)
        editor.add(first)
        editor.add(second)

        const bbox = editor.bbox()!
        expect(bbox.origin.x).toBeLessThanOrEqual(Math.min(first.origin.x, second.origin.x))
        expect(bbox.origin.y).toBeLessThanOrEqual(Math.min(first.origin.y, second.origin.y))
        expect(bbox.origin.x + bbox.size.width).toBeGreaterThanOrEqual(second.origin.x + second.size.width)
        expect(bbox.origin.y + bbox.size.height).toBeGreaterThanOrEqual(second.origin.y + second.size.height)
        editor.remove()
    })

    it("svg fills the host element", () => {
        const editor = document.createElement("tx-editor")
        editor.style.width = "320px"
        editor.style.height = "240px"
        document.body.appendChild(editor)

        const svg = editor.shadowRoot!.querySelector("svg")!
        const host = editor.getBoundingClientRect()
        const rect = svg.getBoundingClientRect()

        expect(rect.width).toBe(host.width)
        expect(rect.height).toBe(host.height)
        editor.remove()
    })

    it("includes the style element in its shadow root", () => {
        const editor = document.createElement("tx-editor")
        const style = editor.shadowRoot!.querySelector("style")!
        expect(style.textContent).toContain(":host")
    })
})
