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

import { Layer } from "./Layer"

export class LocalLayer extends Layer {
    highestFigureId?: number

    createFigureId(): number {
        if (this.highestFigureId === undefined) {
            this.highestFigureId = 0
            for(let figure of this.data) {
                if (figure.id > this.highestFigureId) { // FIXME: recursive
                    this.highestFigureId = figure.id
                }
            }
        }
        return ++this.highestFigureId
    }
}