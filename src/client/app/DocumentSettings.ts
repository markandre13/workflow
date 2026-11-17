import { OptionModel } from "toad.js/appkit/OptionModel"
import { Format } from "./Format"
import { formatDefinitions } from "./formatDefinitions"
import { Orientation } from "./Orientation"
import { Unit } from "./Unit"
import { unitDefinitions } from "./unitDefinitions"
import { NumberModel } from "toad.js/appkit/NumberModel"
import { Model } from "toad.js/appkit/Model"
import { bind } from "client/utils/bind-decorator"

export class DocumentSettings extends Model {
    readonly format = new OptionModel<Format>(Format.A3, formatDefinitions.map((def, index) => [index as Format, def.name]) as any, { label: "Size" })
    readonly orientation = new OptionModel<Orientation>(Orientation.LANDSCAPE, [
        [Orientation.PORTRAIT, "Portrait"],
        [Orientation.LANDSCAPE, "Landscape"],
    ], { label: "Orientation" })
    readonly units = new OptionModel<Unit>(Unit.MILLIMETERS, unitDefinitions.map((def, index) => [index as Unit, def.name]) as any, { label: "Units" })
    readonly width = new NumberModel(0, { label: "Width" })
    readonly height = new NumberModel(0, { label: "Height" })
    readonly top = new NumberModel(0, { label: "Top" })
    readonly right = new NumberModel(0, { label: "Right" })
    readonly bottom = new NumberModel(0, { label: "Bottom" })
    readonly left = new NumberModel(0, { label: "Left" })

    constructor() {
        super()

        for (let child of [this.format, this.orientation]) {
            child.signal.add(this.update)
        }
        this.update()

        const emit = () => this.signal.emit()
        for (let child of [this.width, this.height, this.top, this.right, this.bottom, this.left]) {
            child.signal.add(emit)
        }
    }

    @bind update() {
        if (this.format.value === Format.NONE) {
            return
        }
        if (this.format.value === Format.CUSTOM) {
            return
        }
        this.signal.withLock(() => {
            const def = formatDefinitions[this.format.value]
            this.units.value = def.unit!!
            // TODO: scaling to units should be part of the view, and the units should be part of toad.js
            // TODO: NumberModel should use big decimal, at least for calculations
            // TODO: NumberModel should be able to handle units?
            const scale = unitDefinitions[def.unit!!].scale
            function round(n: number) { return Math.round(n * 100 / scale) / 100 }
            if (this.orientation.value === Orientation.PORTRAIT) {
                this.width.value = round(def.width!!)
                this.height.value = round(def.height!!)
            } else {
                this.width.value = round(def.height!!)
                this.height.value = round(def.width!!)
            }
            this.top.value = round(def.bleed![0])
            this.right.value = round(def.bleed![1])
            this.bottom.value = round(def.bleed![2])
            this.left.value = round(def.bleed![3])
        })
    }
}
