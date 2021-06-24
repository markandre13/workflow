import { Operation } from "./FigureEditor"
import { Matrix } from "shared/geometry"

export interface LayerEvent {
    operation: Operation
    figures: number[]
    matrix?: Matrix
}
