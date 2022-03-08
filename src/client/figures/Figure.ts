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

import { Attribute, AttributeType, _Attribute_strokeRGBA, _Attribute_fillRGBA, _Attribute_strokeWidth } from "shared/workflow"
import * as value  from "shared/workflow_value"
import * as valuetype from "shared/workflow_valuetype"
import { Path, AbstractPath } from "../paths"
import { Rectangle } from "shared/geometry/Rectangle"
import { Point } from "shared/geometry/Point"
import { Matrix } from "shared/geometry/Matrix"
import { GIOPDecoder } from "corba.js"
import { parseColor } from "client/utils/color"

/**
 * The base class of a figures like rectangle, circle, bezier curve, text, image, etc
 */
export abstract class Figure implements valuetype.Figure
{
    // each figure has an id shared by all clients
    id!: number

    // each figure has an optional affine transformation
    matrix!: Matrix // FIXME in corba.js: should be optional (as per CORBA every object is optional... :()
    attributes!: Array<Attribute>

    // fixme: move into FigureEditor
    public static readonly FIGURE_RANGE = 5.0
    public static readonly HANDLE_RANGE = 5.0
    // when a pressed point is moved more than this distance, we start dragging
    public static readonly DRAG_START_DISTANCE = 1.0
    
    constructor(init?: Partial<value.Figure>|GIOPDecoder) {
        value.initFigure(this, init)
    }

    protected _getAttribute(type: AttributeType): Attribute | undefined {
        for(let i=0; i<this.attributes.length; ++i) {
            if (this.attributes[i].type === type) {
                return this.attributes[i]
            }
        }
        return undefined
    }

    protected _setAttribute(attribute: Attribute) {
        for(let i=0; i<this.attributes.length; ++i) {
            if (this.attributes[i].type === attribute.type) {
                this.attributes[i] = attribute
                return
            }
        }
        this.attributes.push(attribute)
    }

    protected _clearAttribute(type: AttributeType) {
        for(let i=0; i<this.attributes.length; ++i) {
            if (this.attributes[i].type === type) {
                this.attributes.splice(i, 1)
                return
            }
        }
    }

    get stroke(): string {
        const a = this._getAttribute(AttributeType.STROKE_RGBA)
        if (a?.type !== AttributeType.STROKE_RGBA)
            return "none"
        return `rgba(${a.strokeRGBA.r},${a.strokeRGBA.g},${a.strokeRGBA.b},${a.strokeRGBA.a/255})`
    }

    set stroke(color: string) {
        const rgba = parseColor(color)
        if (rgba === undefined) {
            this._clearAttribute(AttributeType.STROKE_RGBA)
            this._clearAttribute(AttributeType.STROKE_WIDTH)
        } else {
            this._setAttribute({
                type: AttributeType.STROKE_RGBA,
                strokeRGBA: rgba
            })
        }
    }

    get strokeWidth(): number {
        const a = this._getAttribute(AttributeType.STROKE_WIDTH)
        if (a?.type !== AttributeType.STROKE_WIDTH)
            return 1
        return a.strokeWidth
    }

    set strokeWidth(width: number) {
        if (width === 1) {
            this._clearAttribute(AttributeType.STROKE_WIDTH) 
        } else {
            this._setAttribute({
                type: AttributeType.STROKE_WIDTH,
                strokeWidth: width
            })
        }
    }

    get fill(): string {
        const a = this._getAttribute(AttributeType.FILL_RGBA)
        if (a?.type !== AttributeType.FILL_RGBA)
            return "none"
        return `rgba(${a.fillRGBA.r},${a.fillRGBA.g},${a.fillRGBA.b},${a.fillRGBA.a/255})`
    }

    set fill(color: string) {
        const rgba = parseColor(color)
        if (rgba === undefined) {
            this._clearAttribute(AttributeType.FILL_RGBA)
        } else {
            this._setAttribute({
                type: AttributeType.FILL_RGBA,
                fillRGBA: rgba
            })
        }
    }

    /**
     * The figure's outline/path.
     */
    abstract getPath(): Path
    /**
     * create/update the figure's SVGElement
     * @param path The result from getPath() with transformations being applied.
     * @param parentSVG The SVGElement which will be this SVGElement's parent.
     * @param svg The SVGElement from a former invocation of updateSVG().
     */
    updateSVG(path: AbstractPath, parentSVG: SVGElement, svg?: SVGElement): SVGElement {
        throw Error("updateSVG is not implemented for this class")
    }

    /**
     * Return the figure's distance towards 'point'.
     * This is used when selecting figures.
     * Return <=0 when the point is within the figure
     * @param point Point to measure the distance to.
     */
    abstract distance(point: Point): number
    /**
     * Return the figures boundary.
     * (Shouldn't getPath() provide the nessecary data?)
     */
    abstract bounds(): Rectangle
    /**
     * Apply an affine transformation to the figure.
     * This is used to move, scale and shear the figure with the SelectTool.
     * 
     * When the figure can not handle the transform, return 'false'. Then the
     * FigureEditor will apply the transform to the figure's path and track the
     * transformation in Figure.matrix.
     * 
     * The implementation of Shape.transform() can be used as an example for this approach.
     * 
     * @param matrix
     */
    abstract transform(matrix: Matrix): boolean
    /**
     * This is used to display a figure's handles.
     * 
     * It will be called with handleId 0, 1, 2, ... unless 'undefined' is returned.
     * 
     * The implementation of Shape.(get|set)HandlePosition can be used as an example for this approach.
     * @param handleId
     */
    abstract getHandlePosition(handleId: number): Point | undefined
    /**
     * This is used to modify a figure's handles.
     * 
     * The implementation of Shape.(get|set)HandlePosition can be used as an example for this approach.
     * 
     * @param handleId 
     * @param position The position to set the handleId to.
     */
    abstract setHandlePosition(handleId: number, position: Point): void
}
