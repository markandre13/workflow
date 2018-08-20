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

export class OrderedArray<T> {
    private array: Array<T>
    private order: (a: T, b: T) => boolean

    constructor(order: (a: T, b: T) => boolean) {
        this.array = new Array<T>()
        this.order = order
    }

    insert(element: T) {
        let firstIndex = 0,
            lastIndex = this.array.length,
            middleIndex = Math.floor( (lastIndex + firstIndex) / 2 )
        while(firstIndex < lastIndex) {
            if (this.order(element, this.array[middleIndex])) {
                lastIndex = middleIndex - 1
            } else
            if (this.order(this.array[middleIndex], element)) {
                firstIndex = middleIndex + 1
            } else {
                return
            }
            middleIndex = Math.floor( (lastIndex + firstIndex) / 2 )
        }

        if (middleIndex >= this.array.length) {
            this.array.push(element)
        } else
        if (middleIndex < 0) {
            // FIXME: not covered by current test cases
            this.array.splice(0, 0, element)
        } else
        if (this.order(element, this.array[middleIndex])) {
            this.array.splice(middleIndex, 0, element)
        } else {
            this.array.splice(middleIndex+1, 0, element)
        }
    }

    at(index: number): T {
        return this.array[index]
    }

    shift(): T|undefined {
        return this.array.shift()
    }

    get length() {
        return this.array.length
    }
    set length(a) {
        this.array.length = a
    }
}
