import { FormatDefition } from "./FormatDefition"
import { Unit } from "./Unit"
import { unitDefinitions } from "./unitDefinitions"

function makeFormatDefinition(name: string, unit: Unit, width: number, height: number, bleed: number[]) {
    const scale = unitDefinitions[unit].scale
    return {
        name,
        unit: unit,
        width: width * scale,
        height: height * scale,
        bleed: [bleed[0] * scale, bleed[1] * scale, bleed[2] * scale, bleed[3] * scale,]
    }
}

export const formatDefinitions: FormatDefition[] = [
    { name: "None" },
    { name: "Custom" },
    makeFormatDefinition("A0", Unit.MILLIMETERS, 841, 1189, [25, 25, 30, 25]),
    makeFormatDefinition("A1", Unit.MILLIMETERS, 594, 841, [25, 25, 30, 25]),
    makeFormatDefinition("A2", Unit.MILLIMETERS, 420, 594, [25, 25, 30, 25]),
    makeFormatDefinition("A3", Unit.MILLIMETERS, 297, 420, [25, 25, 30, 25]),
    makeFormatDefinition("A4", Unit.MILLIMETERS, 210, 297, [25, 25, 30, 25]),
    makeFormatDefinition("A5", Unit.MILLIMETERS, 148, 210, [17, 17, 18, 17]),
    makeFormatDefinition("A6", Unit.MILLIMETERS, 105, 148, [12, 12, 13, 12]),
    makeFormatDefinition("A7", Unit.MILLIMETERS, 74, 105, [8, 8, 9, 8]),
    makeFormatDefinition("A8", Unit.MILLIMETERS, 52, 74, [6, 6, 8, 6]),

    makeFormatDefinition("B0", Unit.MILLIMETERS, 1000, 1414, [25, 25, 30, 25]),
    makeFormatDefinition("B1", Unit.MILLIMETERS, 707, 1000, [25, 25, 30, 25]),
    makeFormatDefinition("B2", Unit.MILLIMETERS, 500, 707, [25, 25, 30, 25]),
    makeFormatDefinition("B3", Unit.MILLIMETERS, 353, 500, [25, 25, 30, 25]),
    makeFormatDefinition("B4", Unit.MILLIMETERS, 250, 353, [25, 25, 30, 25]),
    makeFormatDefinition("B5", Unit.MILLIMETERS, 176, 250, [21, 21, 20, 21]),
    makeFormatDefinition("B6", Unit.MILLIMETERS, 125, 176, [15, 15, 14, 15]),
    makeFormatDefinition("B7", Unit.MILLIMETERS, 88, 125, [11, 11, 10, 11]),
    makeFormatDefinition("B8", Unit.MILLIMETERS, 62, 88, [7, 7, 7, 7]),

    makeFormatDefinition("Letter", Unit.INCHES, 8.5, 11, [1, 1, 1.25, 1]),
    makeFormatDefinition("Legal", Unit.INCHES, 8.5, 14, [1, 1, 1.25, 1]),
    makeFormatDefinition("Ledger", Unit.INCHES, 11, 17, [1, 1, 1.25, 1]),
]
