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

import { GenericView, Model } from "toad.js"
import { Path } from "./Path"
import { Point } from "../shared/geometry"

let strokeandfillStyle = document.createElement("style")
strokeandfillStyle.textContent=`
svg {
    top: 0;
    left: 0;
    width: 41px;
    height: 60px;
    background: none;
}
`
export class StrokeAndFillModel extends Model
{
    _stroke: string
    _fill: string
    
    constructor() {
        super()
        this._stroke = "#000"
        this._fill = "#fff"
    }
    
    set stroke(value: string) {
        if (value == this._stroke)
            return
        this._stroke = value
        this.modified.trigger()
    }
    
    get stroke() {
        return this._stroke
    }

    set fill(value: string) {
        if (value == this._fill)
            return
        this._fill = value
        this.modified.trigger()
    }
    
    get fill() {
        return this._fill
    }
}

export class StrokeAndFill extends GenericView<StrokeAndFillModel> {
    strokeElement: SVGRectElement
    fillElement: SVGRectElement

    constructor() {
        super()

        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")

        let fill = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        for(let n of [
            ["x", "0.5"],
            ["y", "0.5"],
            ["width", "27"],
            ["height", "27"],
            ["stroke", "#000"],
            ["fill", "#fff"]])
        {
            fill.setAttributeNS("", n[0], n[1])
        }
        svg.appendChild(fill);
        this.fillElement = fill
        
        let stroke = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        for(let n of [
            ["x", "13.5"],
            ["y", "13.5"],
            ["width", "27"],
            ["height", "27"],
            ["stroke", "#000"],
            ["fill", "#fff"]])
        {
            stroke.setAttributeNS("", n[0], n[1])
        }
        svg.appendChild(stroke);

        let stroke2 = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        for(let n of [
            ["x", "15.5"],
            ["y", "15.5"],
            ["width", "23"],
            ["height", "23"],
            ["stroke", "#000"],
            ["fill", "#000"]])
        {
            stroke2.setAttributeNS("", n[0], n[1])
        }
        svg.appendChild(stroke2);
        this.strokeElement = stroke2

        let stroke3 = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        for(let n of [
            ["x", "20.5"],
            ["y", "20.5"],
            ["width", "13"],
            ["height", "13"],
            ["stroke", "#fff"],
            ["fill", "#fff"]])
        {
            stroke3.setAttributeNS("", n[0], n[1])
        }
        svg.appendChild(stroke3);

        let stroke4 = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        for(let n of [
            ["x", "21.5"],
            ["y", "21.5"],
            ["width", "11"],
            ["height", "11"],
            ["stroke", "#000"],
            ["fill", "none"]])
        {
            stroke4.setAttributeNS("", n[0], n[1])
        }
        svg.appendChild(stroke4);

        let strokeHitBox = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        for(let n of [
            ["x", "13.5"],
            ["y", "13.5"],
            ["width", "27"],
            ["height", "27"],
            ["stroke", "rgba(0,0,0,0)"],
            ["fill", "rgba(0,0,0,0)"]])
        {
            strokeHitBox.setAttributeNS("", n[0], n[1])
        }
        svg.appendChild(strokeHitBox);

        let swapFillAndStroke = new Path()
        swapFillAndStroke.move(31, 2.5)
        swapFillAndStroke.line(34, 0)
        swapFillAndStroke.line(34, 5)
        swapFillAndStroke.close();

        swapFillAndStroke.move(38.5, 10)
        swapFillAndStroke.line(36, 7)
        swapFillAndStroke.line(41, 7)
        swapFillAndStroke.close()
        
        swapFillAndStroke.update()
        swapFillAndStroke.svg.setAttributeNS("", "stroke-width", "1")
        svg.appendChild(swapFillAndStroke.svg)

        swapFillAndStroke = new Path()
        swapFillAndStroke.move(33.5, 2.5)
        swapFillAndStroke.curve(38.5, 2.5,
                                38.5, 2.5,
                                38.5, 7.5)
        swapFillAndStroke.update()
        swapFillAndStroke.svg.setAttributeNS("", "stroke", "#000")
        swapFillAndStroke.svg.setAttributeNS("", "stroke-width", "1")
        swapFillAndStroke.svg.setAttributeNS("", "fill", "none")
        svg.appendChild(swapFillAndStroke.svg)
        
        let swapFillAndStrokeHitBox = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        for(let n of [
            ["x", "30.5"],
            ["y", "0.5"],
            ["width", "10"],
            ["height", "10"],
            ["stroke", "rgba(0,0,0,0)"],
            ["fill", "rgba(0,0,0,0)"]])
        {
            swapFillAndStrokeHitBox.setAttributeNS("", n[0], n[1])
        }
        svg.appendChild(swapFillAndStrokeHitBox);
        
        let defaultFillAndStroke = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        for(let n of [
            ["x", "4.5"],
            ["y", "32.5"],
            ["width", "7"],
            ["height", "7"],
            ["stroke", "#000"],
            ["fill", "#000"]])
        {
            defaultFillAndStroke.setAttributeNS("", n[0], n[1])
        }
        svg.appendChild(defaultFillAndStroke)

        let defaultFillAndStroke2 = document.createElementNS("http://www.w3.org/2000/svg", "rect")

        for(let n of [
            ["x", "6.5"],
            ["y", "34.5"],
            ["width", "3"],
            ["height", "3"],
            ["stroke", "#fff"],
            ["fill", "#fff"]])
        {
            defaultFillAndStroke2.setAttributeNS("", n[0], n[1])
        }
        svg.appendChild(defaultFillAndStroke2)

        let defaultFillAndStroke3 = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        for(let n of [
            ["x", "1.5"],
            ["y", "29.5"],
            ["width", "7"],
            ["height", "7"],
            ["stroke", "#000"],
            ["fill", "#fff"]])
        {
            defaultFillAndStroke3.setAttributeNS("", n[0], n[1])
        }
        svg.appendChild(defaultFillAndStroke3)

        let defaultFillAndStrokeHitBox = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        for(let n of [
            ["x", "1.5"],
            ["y", "29.5"],
            ["width", "10"],
            ["height", "10"],
            ["stroke", "rgba(0,0,0,0)"],
            ["fill", "rgba(0,0,0,0)"]])
        {
            defaultFillAndStrokeHitBox.setAttributeNS("", n[0], n[1])
        }
        svg.appendChild(defaultFillAndStrokeHitBox);

        let colorButton = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        for(let n of [
            ["x", "0.5"],
            ["y", "46.5"],
            ["width", "13"],
            ["height", "13"],
            ["stroke", "#000"],
            ["fill", "none"]])
        {
            colorButton.setAttributeNS("", n[0], n[1])
        }
        svg.appendChild(colorButton)

        let colorButton1 = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        for(let n of [
            ["x", "3.5"],
            ["y", "49.5"],
            ["width", "7"],
            ["height", "7"],
            ["stroke", "#000"],
            ["fill", "#000"]])
        {
            colorButton1.setAttributeNS("", n[0], n[1])
        }
        svg.appendChild(colorButton1)

        let noneButton = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        for(let n of [
            ["x", "27.5"],
            ["y", "46.5"],
            ["width", "13"],
            ["height", "13"],
            ["stroke", "#000"],
            ["fill", "none"]])
        {
            noneButton.setAttributeNS("", n[0], n[1])
        }
        svg.appendChild(noneButton)

        let noneButton1 = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        for(let n of [
            ["x", "30.5"],
            ["y", "49.5"],
            ["width", "7"],
            ["height", "7"],
            ["stroke", "#000"],
            ["fill", "#fff"]])
        {
            noneButton1.setAttributeNS("", n[0], n[1])
        }
        svg.appendChild(noneButton1)

        let noneButton2 = document.createElementNS("http://www.w3.org/2000/svg", "line")
        for(let n of [
            ["x1", "32"],
            ["y1", "55"],
            ["x2", "36"],
            ["y2", "51"],
            ["stroke", "#f00"],
            ["stroke-width", "2"],
            ["stroke-linecap", "round"]])
        {
            noneButton2.setAttributeNS("", n[0], n[1])
        }
        svg.appendChild(noneButton2)

        fill.onmousedown = () => {
            svg.removeChild(fill)
            svg.insertBefore(fill, strokeHitBox.nextSibling)
        }

        strokeHitBox.onmousedown = () => {
            svg.removeChild(fill)
            svg.insertBefore(fill, stroke)
        }
        
        swapFillAndStrokeHitBox.onmousedown = () => {
            if (!this.model)
                return
            this.model.modified.lock()
            let akku = this.model.stroke
            this.model.stroke = this.model.fill
            this.model.fill = akku
            this.model.modified.unlock()
        }
        
        defaultFillAndStrokeHitBox.onmousedown = () => {
            if (!this.model)
                return
            this.model.modified.lock()
            this.model.stroke = "#000"
            this.model.fill = "#fff"
            this.model.modified.unlock()
        }

        this.attachShadow({mode: 'open'})
        this.shadowRoot!.appendChild(document.importNode(strokeandfillStyle, true))
        this.shadowRoot!.appendChild(svg)
    }
    
    updateModel() {
        if (this.model) {
            console.log("strokeandfill update model")
        }
    }
    
    updateView() {
        if (this.model) {
            console.log("strokeandfill update view")
            this.strokeElement.setAttributeNS("", "fill", this.model.stroke)
            this.strokeElement.setAttributeNS("", "stroke", this.model.stroke)
            this.fillElement.setAttributeNS("", "fill", this.model.fill)
        }
    }
}
