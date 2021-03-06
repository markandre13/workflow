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

import { Figure } from "./Figure"
import * as valuetype from "shared/workflow_valuetype"

/**
 * The base class for all figures which have a stroke and/or fill.
 * 
 * These include rectangle, circle, bezier curve, text, etc.
 * but not images, which bring their own color definition.
 */
export abstract class AttributedFigure extends Figure implements valuetype.figure.AttributedFigure {
    stroke!: string
    strokeWidth!: number
    fill!: string
    constructor(init?: Partial<AttributedFigure>) {
        super(init)
        this.stroke = "#000"
        this.strokeWidth = 1.0
        this.fill = "#fff"
    }
}
