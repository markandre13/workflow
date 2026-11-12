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

import { Signal } from "toad.js/reactive/Signal"
import { Shape } from "../shapes"

export class ShapeSelectionModel {
    modified: Signal
    selection: Set<Shape>
    constructor() {
        this.modified = new Signal()
        this.selection = new Set<Shape>()
    }
    set(shape: Shape): void {
        this.selection.clear()
        this.selection.add(shape)
        this.modified.emit()
    }
    add(shape: Shape): void {
        this.selection.add(shape)
        this.modified.emit()
    }
    remove(shape: Shape): void {
        this.selection.delete(shape)
        this.modified.emit()
    }
    replace(oldShape: Shape, newShape: Shape) {
        this.selection.delete(oldShape)
        this.selection.add(newShape)
        this.modified.emit()
    }
    has(shape: Shape): boolean {
        return this.selection.has(shape)
    }
    empty(): boolean {
        return this.selection.size === 0
    }
    clear(): void {
        this.selection.clear()
        this.modified.emit()
    }
    shapeIds(): Array<number> {
        let result = new Array<number>()
        for (let shape of this.selection)
            result.push(shape.id)
        return result
    }
}
