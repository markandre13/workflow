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

import { Matrix } from "shared/geometry/Matrix"
import { Shape } from "shared/workflow_valuetype"
import { Layer } from "./Layer"
import { DrawingEvent } from "./DrawingEvent"
import { Model } from "toad.js/appkit/Model"
import { DocumentSettings } from "client/app/DocumentSettings"
import { StrokeEndType } from "shared/workflow"

export abstract class DrawingModel extends Model<DrawingEvent> {
    // modified: Signal<DrawingEvent>
    layers: Layer[] = []

    readonly documentSettings = new DocumentSettings()

    abstract add(layer: Layer, shape: Shape): void
    abstract delete(layer: Layer, shapes: Array<Shape>): void
    abstract setStrokeAndFill(layer: Layer, shapes: Array<Shape>, stroke: string, fill: string): void
    abstract setStrokeEnds(layer: Layer, shapes: Array<Shape>, start: StrokeEndType | undefined, end: StrokeEndType | undefined): void
    abstract transform(layer: Layer, shapes: Array<Shape>, matrix: Matrix): void
    abstract bringToFront(layer: Layer, shapes: Array<Shape>): void
    abstract bringToBack(layer: Layer, shapes: Array<Shape>): void
    abstract bringForward(layer: Layer, shapes: Array<Shape>): void
    abstract bringBackward(layer: Layer, shapes: Array<Shape>): void
}
