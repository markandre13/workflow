import { UnitDefinition } from "./UnitDefinition"

export const unitDefinitions: UnitDefinition[] = [{
    name: "Pixels",
    symbol: "px",
    scale: 1,
    halves: false
}, {
    name: "Points", // 1/72in
    symbol: "pt",
    scale: 1,
    halves: false
}, {
    name: "Picas",
    symbol: "pc",
    scale: 12,
    halves: false
}, {
    name: "Inches",
    symbol: "in",
    scale: 72,
    halves: true
}, {
    name: "Feet",
    symbol: "ft",
    scale: 72 * 12,
    halves: true
}, {
    name: "Yards", // 1yd = 3ft
    symbol: "yd",
    scale: 72 * 12 * 3,
    halves: true
}, {
    name: "Millimeters",
    symbol: "mm",
    scale: 1 / 25.4 * 72,
    halves: false
}, {
    name: "Centimeters",
    symbol: "cm",
    scale: 1 / 25.4 * 72 * 10,
    halves: false
}, {
    name: "Meters",
    symbol: "m",
    scale: 1 / 25.4 * 72 * 100,
    halves: false
}]
