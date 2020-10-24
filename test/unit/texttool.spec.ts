/*
 *  workflow - A collaborative real-time white- and kanban board
 *  Copyright (C) 2020 Mark-André Hopf <mhopf@mark13.org>
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

import { expect, use } from "chai"
import chaiAlmost = require('chai-almost')
use(chaiAlmost())

import { Point, Rectangle, Matrix, pointPlusSize, pointMinusPoint, pointMinus, pointPlusPoint, sizeMultiplyNumber, rotatePointAroundPointBy } from "shared/geometry"

import { Path } from "client/paths"
import * as figure from "client/figures"
import { Tool, SelectToolState } from "client/figuretools"
import { FigureEditorUser } from "client/figureeditor/FigureEditorUser"

declare global {
    interface SVGPathElement {
        d: string
        setPathData(data: any): void
        getPathData(): any
    }
}

describe("FigureEditor", ()=> {
    describe("TextTool", ()=> {
        describe("Area", ()=> {
            it("create", ()=> {
                // GIVEN
                let test = new FigureEditorUser(true)
                test.selectTextTool()
           
                // WHEN
                test.mouseDownAt(new Point(10, 15))
                test.moveMouseBy(new Point(110, 50))
                test.mouseUp()
        
                // THEN
                test.selectionHasRectangle(new Rectangle(10, 15, 110, 50))

                // test.keydown("A")
            })
        })
    })
})
