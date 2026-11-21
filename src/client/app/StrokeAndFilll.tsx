import { StrokeOrFill } from "client/app/StrokeOrFill"
import { Model } from "toad.js/appkit/Model"

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
                this.signal.withLock(() => {
                    this.stroke = value
                    this.fill = value
                })
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
        if (value === this._stroke) return
        this._stroke = value
        this.signal.emit()
    }

    get stroke() {
        return this._stroke
    }

    set fill(value: string) {
        if (value === this._fill) return
        this._fill = value
        this.signal.emit()
    }

    get fill() {
        return this._fill
    }

    set strokeOrFill(value: StrokeOrFill) {
        if (value === this._strokeOrFill) return
        this._strokeOrFill = value
        this.signal.emit()
    }

    get strokeOrFill() {
        return this._strokeOrFill
    }
}
