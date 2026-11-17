import { Unit } from "./Unit"

export interface FormatDefition {
    readonly name: string
    readonly unit?: Unit
    readonly width?: number
    readonly height?: number
    readonly bleed?: number[]
}
