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

import { Action, ActionView, Model } from "toad.js"
import { Point, Rectangle } from "shared/geometry"

let strokeandfillStyle = document.createElement("style")
strokeandfillStyle.textContent=`
svg {
    top: 0;
    botton: 0;
    left: 0;
    right: 0;
    background: none;
}
`
export class ColorSwatchModel extends Model
{
    data: any
        
    constructor() {
        super()
            
        this.data = [
          [  0,   0,   0, ""],
          [128, 128, 128, ""],
          [191, 191, 191, ""],
          [255, 255, 255, ""],

          [128,   0,   0, ""],
          [255,   0,   0, ""],
          [255, 128,   0, ""],
//          [255, 128, 128, ""],
          [255, 205, 148, ""],

          [255, 255,   0, ""],
          [  0, 255,   0, ""],
          [  0, 128,   0, ""],
          [  0, 128, 128, ""],

          [  0, 255, 255, ""],
          [  0, 128, 255, ""],
          [  0,   0, 255, ""],
          [  0,   0, 128, ""],

          [128,   0, 128, ""],
          [128,   0, 255, ""],
          [128, 128, 255, ""],
          [255,   0, 255, ""],

          [255,   0, 128, ""],
          [255, 128, 255, ""],
          [255, 255, 128, ""], // out
          [128, 128,   0, ""], // ugly

          [128, 255,   0, ""], // out
          [128, 255, 128, ""], // out
          [  0, 255, 128, ""], // out
          [128, 255, 255, ""],
        ]
    }
}

export class ColorSwatch extends ActionView {

    constructor(props?: {model: ColorSwatchModel, action: Action}) {
        super()
        
        let model = props?.model ? props.model : new ColorSwatchModel()
        this.action = props?.action

        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        
        let x=0, y=0
        for(let color of model.data) {
            let box = document.createElementNS("http://www.w3.org/2000/svg", "rect")
            for(let n of [
                ["x", String(1+x*10)],
                ["y", String(1+y*10)],
                ["width", "9"],
                ["height", "9"],
                ["stroke", "none"],
                ["fill", "rgb("+color[0]+","+color[1]+","+color[2]+")"]])
            {
                box.setAttributeNS("", n[0], n[1])
            }
            svg.appendChild(box);
            ++x;
            if (x>=4) {
                x = 0
                ++y;
            }
        }
        
        svg.onmousedown = (mouseEvent: MouseEvent) => {
            if (this.action === undefined)
                return

            let bounds = svg.getBoundingClientRect()
            let mousePosition = new Point({x: mouseEvent.x - bounds.left, y: mouseEvent.y - bounds.top})

            let x=0, y=0
            for(let color of model.data) {
                // FIXME: Point and Rectangle should really provide constructors with coordinates
                let box = new Rectangle({origin: {x: 1+x*10, y: 1+y*10}, size: { width: 9, height: 9}})
                if (box.contains(mousePosition)) {
                    // console.log("got color ", color)
                    this.action.trigger("rgb("+color[0]+","+color[1]+","+color[2]+")")
                    break;
                }
                ++x;
                if (x>=4) {
                    x = 0
                    ++y;
                }
            }
        }

        this.attachShadow({mode: 'open'})
        this.shadowRoot!.appendChild(document.importNode(strokeandfillStyle, true))
        this.shadowRoot!.appendChild(svg)
    }
}

ColorSwatch.define("toad-colorswatch", ColorSwatch)