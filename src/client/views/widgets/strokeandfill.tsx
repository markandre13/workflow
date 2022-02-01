/*
 *  workflow - A collaborative real-time white- and kanban board
 *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { ModelView, Model, ref } from "toad.js"
import { bind } from "client/utils/bind-decorator"

let strokeandfillStyle = document.createElement("style")
strokeandfillStyle.textContent = `
svg {
    top: 0;
    left: 0;
    width: 41px;
    height: 60px;
    background: none;
}
`
export enum StrokeOrFill {
    STROKE,
    FILL,
    NONE,
    BOTH
}

export class StrokeAndFillModel extends Model {
    protected _stroke: string
    protected _fill: string
    protected _strokeOrFill: StrokeOrFill

    constructor() {
        super()
        this._stroke = "#000"
        this._fill = "#fff"
        this._strokeOrFill = StrokeOrFill.STROKE
    }

    set(value: string) {
        switch (this._strokeOrFill) {
            case StrokeOrFill.STROKE:
                this.stroke = value
                break
            case StrokeOrFill.FILL:
                this.fill = value
                break
            case StrokeOrFill.NONE:
                break
            case StrokeOrFill.BOTH:
                this.modified.lock()
                this.stroke = value
                this.fill = value
                this.modified.unlock()
                break
        }
    }

    get() {
        switch (this._strokeOrFill) {
            case StrokeOrFill.STROKE:
                return this.stroke
            case StrokeOrFill.FILL:
                return this.fill
            case StrokeOrFill.NONE:
            case StrokeOrFill.BOTH:
                return ""
        }
    }

    set stroke(value: string) {
        if (value === this._stroke)
            return
        this._stroke = value
        this.modified.trigger()
    }

    get stroke() {
        return this._stroke
    }

    set fill(value: string) {
        if (value === this._fill)
            return
        this._fill = value
        this.modified.trigger()
    }

    get fill() {
        return this._fill
    }

    set strokeOrFill(value: StrokeOrFill) {
        if (value === this._strokeOrFill)
            return
        this._strokeOrFill = value
        this.modified.trigger()
    }

    get strokeOrFill() {
        return this._strokeOrFill
    }
}

// Remove the model and make it a tool operating on Tool.selection
export class StrokeAndFill extends ModelView<StrokeAndFillModel> {
    svg!: SVGElement
    strokeOuterFrame!: SVGRectElement
    strokeElement!: SVGRectElement
    strokeNoneElement!: SVGLineElement
    fillElement!: SVGRectElement
    fillNoneElement!: SVGLineElement
    colorButtonElement!: SVGRectElement
    colorButtonIndicatorElement!: SVGRectElement
    noneButtonIndicatorElement!: SVGRectElement
    strokeHitBox!: SVGRectElement

    stroke: string
    fill: string

    constructor(props?: { model?: StrokeAndFillModel }) {
        super()

        this.stroke = "#000"
        this.fill = "#fff"

        this.svg = <svg>
            {/* fill color */}
            <rect x="0.5" y="0.5" width="27" height="27" stroke="#000" fill="#000" set={ref(this, "fillElement")} onmousedown={this.focusFillBox} />
            <line x1="4" y1="24" x2="24" y2="4" stroke="#f00" strokeWidth="2" strokeLinecap="round" set={ref(this, "fillNoneElement")} />

            {/* stroke color */}
            <rect x="13.5" y="13.5" width="27" height="27" stroke="#000" fill="#fff" set={ref(this, "strokeOuterFrame")} />
            <rect x="15.5" y="15.5" width="23" height="23" stroke="#000" fill="#000" set={ref(this, "strokeElement")} />
            <line x1="16" y1="38" x2="38" y2="16" stroke="#f00" strokeWidth="2" strokeLinecap="round" set={ref(this, "strokeNoneElement")} />
            <rect x="20.5" y="20.5" width="13" height="13" stroke="#fff" fill="#fff" />
            <rect x="21.5" y="21.5" width="11" height="11" stroke="#000" fill="none" />
            <rect x="13.5" y="13.5" width="27" height="27" stroke="rgba(0,0,0,0)" fill="rgba(0,0,0,0)" set={ref(this, "strokeHitBox")} onmousedown={this.focusStrokeBox} />

            {/* swap stroke and fill color */}
            <path d="M 31 2.5 L 34 0 L 34  5 Z M 38.5 10 L 36 7 L 41 7 Z" fill="#000" />
            <path d="M 33.5 2.5 C 38.5 2.5 38.5 2.5 38.5, 7.5" stroke="#000" fill="none" />
            <rect x="30.5" y="0.5" width="10" height="10" stroke="rgba(0,0,0,0)" fill="rgba(0,0,0,0)" onmousedown={this.swapStrokeAndFill} />

            {/* reset to default stroke and fill color */}
            <rect x="4.5" y="32.5" width="7" height="7" stroke="#000" fill="#000" />
            <rect x="6.5" y="34.5" width="3" height="3" stroke="#fff" fill="#fff" />
            <rect x="1.5" y="29.5" width="7" height="7" stroke="#000" fill="#fff" />
            <rect x="1.5" y="29.5" width="10" height="10" stroke="rgba(0,0,0,0)" fill="rgba(0,0,0,0)" onmousedown={this.setDefaultStrokeAndFill} />

            {/* color button */}
            <rect x="0.5" y="46.5" width="13" height="13" stroke="#000" fill="none" set={ref(this, "colorButtonIndicatorElement")} />
            <rect x="3.5" y="49.5" width="7" height="7" stroke="#000" fill="#000" set={ref(this, "colorButtonElement")} />
            <rect x="0.5" y="46.5" width="13" height="13" stroke="rgba(0,0,0,0)" fill="rgba(0,0,0,0)" onmousedown={this.assignColor} />

            {/* none button */}
            <rect x="27.5" y="46.5" width="13" height="13" stroke="#000" fill="none" set={ref(this, "noneButtonIndicatorElement")} />
            <rect x="30.5" y="49.5" width="7" height="7" stroke="#000" fill="#fff" />
            <line x1="32" y1="55" x2="36" y2="51" stroke="#f00" strokeWidth="2" strokeLinecap="round" />
            <rect x="27.5" y="46.5" width="13" height="13" stroke="rgba(0,0,0,0)" fill="rgba(0,0,0,0)" onmousedown={this.assignNone} />
        </svg>

        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.appendChild(document.importNode(strokeandfillStyle, true))
        this.shadowRoot!.appendChild(this.svg)

        if (props && props.model)
            this.setModel(props.model)
    }

    @bind focusFillBox() {
        if (this.model)
            this.model.strokeOrFill = StrokeOrFill.FILL
        // move the fill box in front of the stroke box
        this.svg.removeChild(this.fillElement)
        this.svg.removeChild(this.fillNoneElement)
        this.svg.insertBefore(this.fillNoneElement, this.strokeHitBox.nextSibling)
        this.svg.insertBefore(this.fillElement, this.strokeHitBox.nextSibling)
    }

    @bind focusStrokeBox() {
        if (this.model)
            this.model.strokeOrFill = StrokeOrFill.STROKE
        // move the stroke box in front of the fill box
        this.svg.removeChild(this.fillElement)
        this.svg.removeChild(this.fillNoneElement)
        this.svg.insertBefore(this.fillElement, this.strokeOuterFrame)
        this.svg.insertBefore(this.fillNoneElement, this.strokeOuterFrame)
    }

    @bind swapStrokeAndFill() {
        if (!this.model)
            return
        this.model.modified.lock()

        let akku
        akku = this.model.stroke
        this.model.stroke = this.model.fill
        this.model.fill = akku

        akku = this.stroke
        this.stroke = this.fill
        this.fill = akku

        this.model.modified.trigger()
        this.model.modified.unlock()
    }

    @bind setDefaultStrokeAndFill() {
        if (!this.model)
            return
        this.model.modified.lock()
        this.model.stroke = "#000"
        this.model.fill = "#fff"
        this.model.modified.unlock()
    }

    @bind assignColor() {
        if (!this.model)
            return
        this.model.modified.lock()
        switch (this.model.strokeOrFill) {
            case StrokeOrFill.STROKE:
                this.model.stroke = this.stroke
                break
            case StrokeOrFill.FILL:
                this.model.fill = this.fill
                break
        }
        this.model.modified.trigger() // force assigning the current colors to the selection
        this.model.modified.unlock()
    }

    @bind assignNone() {
        if (!this.model)
            return
        this.model.set("none")
    }

    override updateView() {
        if (!this.model)
            return
        if (this.model.stroke !== "none")
            this.stroke = this.model.stroke
        if (this.model.fill !== "none")
            this.fill = this.model.fill
        this.noneButtonIndicatorElement.setAttributeNS("", "fill", this.model.get() === "none" ? "#888" : "#ddd")
        this.colorButtonIndicatorElement.setAttributeNS("", "fill", this.model.get() !== "none" ? "#888" : "#ddd")
        this.colorButtonElement.setAttributeNS("", "fill", this.model.strokeOrFill === StrokeOrFill.STROKE ? this.stroke : this.fill)
        if (this.model.stroke === "none") {
            this.strokeElement.setAttributeNS("", "fill", "#fff")
            this.strokeElement.setAttributeNS("", "stroke", "#fff")
            this.strokeNoneElement.setAttributeNS("", "stroke", "#f00")
        } else {
            this.strokeElement.setAttributeNS("", "fill", this.model.stroke)
            this.strokeElement.setAttributeNS("", "stroke", this.model.stroke)
            this.strokeNoneElement.setAttributeNS("", "stroke", "none")
        }
        if (this.model.fill === "none") {
            this.fillElement.setAttributeNS("", "fill", "#fff")
            this.fillNoneElement.setAttributeNS("", "stroke", "#f00")
        } else {
            this.fillElement.setAttributeNS("", "fill", this.model.fill)
            this.fillNoneElement.setAttributeNS("", "stroke", "none")
        }
    }
}

StrokeAndFill.define("toad-strokeandfill", StrokeAndFill)