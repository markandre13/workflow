// import type { Editor } from "./Editor"

import { View } from "toad.js/viewkit/View"
import { HTMLElementProps } from "toad.jsx/jsx-runtime"
import { FigureEditor } from "./FigureEditor"

const style = document.createElement("style")
style.textContent = `
    :host {
        display: inline-block;
        position: relative;
        background: #555;
        overflow: hidden;
    }
    .svg {
        display: block;
        width: 100%;
        height: 100%;
    }
    path {
        stroke: #fff;
        stroke-width: 1;
    }
    text {
        fill: #fff;
        font: 10px sans-serif;
    }
`

const ns = "http://www.w3.org/2000/svg"

export type Orientation = "horizontal" | "vertical"

type Kind = "major" | "medium" | "small" | "minor" | "tiny"

interface RulerTick {
    // pixels from the start of the ruler
    pos: number
    kind: Kind
    label?: string
}

const MIN_MAJOR_SPACING_PX = 40
const MAX_LABEL_SPACING_PX = 100
const MIN_TICK_SPACING_PX = 4

const TICK_LENGTH: Record<Kind, number> = { major: 20, medium: 12, small: 9, minor: 6, tiny: 3 }

const SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹"
const SUBSCRIPT = "₀₁₂₃₄₅₆₇₈₉"
const PRECOMPOSED_FRACTIONS: Record<string, string> = {
    "1/2": "½",
    "1/4": "¼",
    "3/4": "¾",
    "1/8": "⅛",
    "3/8": "⅜",
    "5/8": "⅝",
    "7/8": "⅞",
}

const FRACTION_BASE = 2 ** 20

function formatInches(inches: number): string {
    const parts = Math.round(inches * FRACTION_BASE)
    const whole = Math.floor(parts / FRACTION_BASE)
    let numerator = parts % FRACTION_BASE
    if (numerator === 0) {
        return String(whole)
    }

    let denominator = FRACTION_BASE
    while (numerator % 2 === 0) {
        numerator /= 2
        denominator /= 2
    }
    const fraction = PRECOMPOSED_FRACTIONS[`${numerator}/${denominator}`]
        ?? `${toScript(numerator, SUPERSCRIPT)}⁄${toScript(denominator, SUBSCRIPT)}`
    return whole === 0 ? fraction : `${whole}${fraction}`
}

function toScript(n: number, digits: string): string {
    return String(n).split("").map(c => digits[Number(c)]).join("")
}

// the smallest whole number of units, 1, 2 or 5 times a power of ten, whose labels are at least minSpacingPx apart
function niceStep(minSpacingPx: number, perUnit: number, minUnits = 0): number {
    for (let exponent = Math.floor(Math.log10(minSpacingPx / perUnit)) - 1; ; exponent++) {
        for (const m of [1, 2, 5]) {
            const step = m * 10 ** exponent
            if (step >= minUnits && step * perUnit >= minSpacingPx) {
                return step
            }
        }
    }
}

// the smallest power of ten units whose labels are at least minSpacingPx apart
function powerOfTenStep(minSpacingPx: number, perUnit: number): number {
    for (let exponent = Math.floor(Math.log10(minSpacingPx / perUnit)); ; exponent++) {
        const step = 10 ** exponent
        if (step * perUnit >= minSpacingPx) {
            return step
        }
    }
}

// the smallest number of inches dividing the label interval whose ticks are at least 4 pixels apart
function smallestTickInches(labelInches: number, perInch: number): number {
    for (let inches = 1; inches < labelInches; inches++) {
        if (labelInches % inches === 0 && inches * perInch >= MIN_TICK_SPACING_PX) {
            return inches
        }
    }
    return labelInches
}

// imperial units are divided in sixteenths, and other units in tenths. labels are at least 40 pixels apart, and
// imperial labels are at most 100 pixels apart, so that a zoomed-in inch gets fractions. other labels are powers of ten
function rulerTicks(perUnit: number, halves: boolean, origin: number, span: number): RulerTick[] {
    const ticks: RulerTick[] = []
    const at = (value: number) => (value - origin) * perUnit + 0.5

    if (halves && perUnit < MIN_MAJOR_SPACING_PX) {
        const labelInches = niceStep(MIN_MAJOR_SPACING_PX, perUnit, 1)
        const tickInches = smallestTickInches(labelInches, perUnit)
        for (let k = Math.ceil(origin / tickInches); ; k++) {
            const value = k * tickInches
            const pos = at(value)
            if (pos > span) {
                break
            }
            if (value % labelInches === 0) {
                ticks.push({ pos, kind: "major", label: String(value) })
            } else {
                ticks.push({ pos, kind: (value * 2) % labelInches === 0 ? "medium" : "minor" })
            }
        }
    } else if (halves) {
        let divisions = 16
        while (perUnit / divisions > MAX_LABEL_SPACING_PX) {
            divisions *= 2
        }
        let labelDivisions = 1
        while (perUnit / labelDivisions > MAX_LABEL_SPACING_PX) {
            labelDivisions *= 2
        }
        const labelEvery = divisions / labelDivisions
        const sixteenthEvery = divisions / 16
        const stepPx = perUnit / divisions
        const sixteenthPx = perUnit / 16
        for (let k = Math.ceil(origin * divisions); ; k++) {
            const value = k / divisions
            const pos = at(value)
            if (pos > span) {
                break
            }
            let kind: Kind = "tiny"
            if (k % sixteenthEvery === 0) {
                const sixteenth = k / sixteenthEvery
                kind = sixteenth % 16 === 0 ? "major" : sixteenth % 8 === 0 ? "medium" : sixteenth % 4 === 0 ? "small" : "minor"
            }
            if (k % labelEvery === 0) {
                ticks.push({ pos, kind, label: formatInches(value) })
            } else if (kind !== "minor" || sixteenthPx >= MIN_TICK_SPACING_PX) {
                ticks.push({ pos, kind })
            }
            if (labelEvery === 1) {
                const extra = Math.min(3, Math.floor(stepPx / MIN_TICK_SPACING_PX) - 1)
                for (let j = 1; j <= extra; j++) {
                    const fill = at((k + j / (extra + 1)) / divisions)
                    if (fill <= span) {
                        ticks.push({ pos: fill, kind: "tiny" })
                    }
                }
            }
        }
    } else {
        const majorUnit = powerOfTenStep(MIN_MAJOR_SPACING_PX, perUnit)
        for (let k = Math.ceil((origin * 10) / majorUnit); ; k++) {
            const value = (k / 10) * majorUnit
            const pos = at(value)
            if (pos > span) {
                break
            }
            if (k % 10 === 0) {
                ticks.push({ pos, kind: "major", label: String(Number(value.toPrecision(12))) })
            } else {
                ticks.push({ pos, kind: k % 5 === 0 ? "medium" : "minor" })
            }
        }
    }

    return ticks
}

interface RulerProps extends HTMLElementProps {
    orientation?: Orientation
}

export class Ruler extends View {
    svg!: SVGSVGElement
    orientation: Orientation = "horizontal"
    private editor?: FigureEditor
    private panAt: { x: number, y: number } | undefined
    private _unit = 1
    private _halves = false

    // pixels per unit of the labels
    get unit(): number {
        return this._unit
    }

    set unit(pixels: number) {
        this._unit = pixels
        this.update()
    }

    // imperial units are divided in sixteenths, metric and other units in tenths
    get halves(): boolean {
        return this._halves
    }

    set halves(halves: boolean) {
        this._halves = halves
        this.update()
    }

    constructor(props?: RulerProps) {
        super(props)
        if (props?.orientation) {
            this.orientation = props.orientation
        }

        const shadow = this.attachShadow({ mode: "open" })
        shadow.appendChild(document.importNode(style, true))

        this.svg = document.createElementNS(ns, "svg")
        this.svg.classList.add("svg")
        shadow.appendChild(this.svg)

        new ResizeObserver(() => this.update()).observe(this)

        // dragging with the middle button pans the editor; the middle button does not auto-scroll here
        this.onmousedown = (ev: MouseEvent) => {
            if (ev.button === 1) {
                ev.preventDefault()
            }
        }
        this.onpointerdown = (ev: PointerEvent) => {
            if (ev.button !== 1 || this.editor === undefined) {
                return
            }
            ev.preventDefault()
            this.setPointerCapture(ev.pointerId)
            this.panAt = { x: ev.clientX, y: ev.clientY }
        }
        this.onpointermove = (ev: PointerEvent) => {
            if (this.panAt === undefined || this.editor === undefined) {
                return
            }
            ev.preventDefault()
            const dx = ev.clientX - this.panAt.x
            const dy = ev.clientY - this.panAt.y
            this.panAt = { x: ev.clientX, y: ev.clientY }
            // content follows the pointer, and the canvas grows or shrinks to cover the view
            if (this.orientation === "vertical") {
                this.editor.pan(0, dy)
            } else {
                this.editor.pan(dx, 0)
            }
        }
        this.onpointerup = () => {
            this.panAt = undefined
        }
        this.onpointercancel = () => {
            this.panAt = undefined
        }
    }

    attach(editor: FigureEditor) {
        this.editor = editor
        editor.addEventListener("viewchange", () => this.update())
        // scrolling changes the origin right away, even when the editor defers its update until the button is released
        editor.addEventListener("scroll", () => this.update())
        this.update()
    }

    update() {
        const width = this.clientWidth
        const height = this.clientHeight
        const vertical = this.orientation === "vertical"
        const span = vertical ? height : width
        const zoom = this.editor?.zoom ?? 1
        // the editor shows canvas coordinates from viewBox (its SVG origin) plus the scroll offset in canvas units,
        // which are pixels. labels are in the unit, so the origin and the spacing are converted to it
        const originPx = this.editor === undefined ? 0 : vertical
            ? this.editor.svgView.viewBox.baseVal.y + this.editor.scrollTop / zoom
            : this.editor.svgView.viewBox.baseVal.x + this.editor.scrollLeft / zoom
        const origin = originPx / this._unit
        const perUnit = zoom * this._unit
        if (!(perUnit > 0)) {
            const empty = document.createElementNS(ns, "path")
            empty.setAttribute("d", "")
            this.svg.replaceChildren(empty)
            return
        }
        let ticks = ""
        const labels: SVGTextElement[] = []
        for (const tick of rulerTicks(perUnit, this._halves, origin, span)) {
            const length = TICK_LENGTH[tick.kind]
            ticks += vertical
                ? `M${width - 0.5} ${tick.pos}H${width - length}`
                : `M${tick.pos} ${height}V${height - length}`
            if (tick.label !== undefined) {
                const label = document.createElementNS(ns, "text")
                if (vertical) {
                    label.setAttribute("transform", `translate(${width - 13} ${tick.pos - 0.5}) rotate(-90)`)
                } else {
                    label.setAttribute("x", `${tick.pos + 2}`)
                    label.setAttribute("y", "10")
                }
                label.textContent = tick.label
                labels.push(label)
            }
        }

        const path = document.createElementNS(ns, "path")
        path.setAttribute("d", ticks)
        this.svg.replaceChildren(path, ...labels)
    }
}

window.customElements.define("tx-ruler", Ruler)
