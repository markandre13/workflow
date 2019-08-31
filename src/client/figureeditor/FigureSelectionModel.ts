/*
 *  workflow - A collaborative real-time white- and kanban board
 *  Copyright (C) 2018 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Signal } from "toad.js"
import { Figure } from "../../shared/workflow_valuetype"

export class FigureSelectionModel {
    modified: Signal
    selection: Set<Figure>
    constructor() {
        this.modified = new Signal()
        this.selection = new Set<Figure>()
    }
    add(figure: Figure): void {
        this.selection.add(figure)
        this.modified.trigger()
    }
    remove(figure: Figure): void {
        this.selection.delete(figure)
        this.modified.trigger()
    }
    replace(oldFigure: Figure, newFigure: Figure) {
        this.selection.delete(oldFigure)
        this.selection.add(newFigure)
        this.modified.trigger()
    }
    has(figure: Figure): boolean {
        return this.selection.has(figure)
    }
    empty(): boolean {
        return this.selection.size === 0
    }
    clear(): void {
        this.selection.clear()
        this.modified.trigger()
    }
    figureIds(): Array<number> {
        let result = new Array<number>()
        for (let figure of this.selection)
            result.push(figure.id)
        return result
    }
}
