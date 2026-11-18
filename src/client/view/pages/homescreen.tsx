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

import { StrokeAndFill } from "client/view/widgets/strokeandfill"
import { ColorSwatch } from "client/view/widgets/colorswatch"
import { ShapeEditor } from "client/shapeeditor"

import { StrokeAndFillModel } from "../widgets/strokeandfill"
import { ColorSwatchModel } from "../widgets/colorswatch"
import { ToolModel } from "client/shapetools/ToolModel"
import { DrawingModel } from "client/shapeeditor"
import { HtmlModel } from "toad.js/appkit/HtmlModel"
import { Fragment, JSX, makeRef } from "toad.jsx"
import { Select } from "toad.js/viewkit/Select"
import { ToolButton } from "toad.js/viewkit/ToolButton"
import { Menu } from "toad.js/menu/Menu"
import { Action } from "toad.js/appkit/Action"
import { Ruler } from "client/shapeeditor/Ruler"
import { OptionModel } from "toad.js/appkit/OptionModel"
import { PointLike } from "shared/geometry/Point"

// this are the arrow types https://en.wikipedia.org/wiki/Xfig used to offer
enum ArrowType {
    NONE,
    SIMPLE,
    EMPTY,
    FILLED,
    EMPTY_CONCAVE,
    FILLED_CONCAVE,
    EMPTY_CONVEX,
    FILLED_CONVEX,
}

function makeArrowOption(type: ArrowType, left: boolean = true): [ArrowType, JSX.Element] {
    let fill: string
    switch (type) {
        case ArrowType.FILLED:
        case ArrowType.FILLED_CONCAVE:
        case ArrowType.FILLED_CONVEX:
            fill = "#fff"
            break
        default:
            fill = "none"
    }
    let p0: PointLike, p1: PointLike
    if (left) {
        p0 = { x: 2, y: 4.5 }
        p1 = { x: 12, y: 4.5 }
    } else {
        p0 = { x: 12, y: 4.5 }
        p1 = { x: 2, y: 4.5 }
    }
    return [type, <div>
        <svg width="14" height="10">
            <path stroke="#fff" fill={fill} d={arrow2path(type, p0, p1, 9, 9)} />
        </svg>
    </div>]
}

const arrowLeft = new OptionModel(ArrowType.NONE, [
    makeArrowOption(ArrowType.NONE),
    makeArrowOption(ArrowType.SIMPLE),
    makeArrowOption(ArrowType.EMPTY),
    makeArrowOption(ArrowType.FILLED),
    makeArrowOption(ArrowType.EMPTY_CONCAVE),
    makeArrowOption(ArrowType.FILLED_CONCAVE),
    makeArrowOption(ArrowType.EMPTY_CONVEX),
    makeArrowOption(ArrowType.FILLED_CONVEX),
])
const arrowRight = new OptionModel(ArrowType.NONE, [
    makeArrowOption(ArrowType.NONE, false),
    makeArrowOption(ArrowType.SIMPLE, false),
    makeArrowOption(ArrowType.EMPTY, false),
    makeArrowOption(ArrowType.FILLED, false),
    makeArrowOption(ArrowType.EMPTY_CONCAVE, false),
    makeArrowOption(ArrowType.FILLED_CONCAVE, false),
    makeArrowOption(ArrowType.EMPTY_CONVEX, false),
    makeArrowOption(ArrowType.FILLED_CONVEX, false),
])

// TODO: make this part of OptionModel & add key=... as an alternative to ToolButton?
function k2v(model: ToolModel, aKey: string) {
    let valueOut
    model.forEach((value, key, index) => {
        if (key == aKey) {
            valueOut = value
        }
    })
    if (valueOut === undefined) {
        let txt = ""
        model.forEach((value, label, index) => {
            txt += `${label}, `
        })
        if (txt.length === 0) {
            txt = "no values"
        } else {
            txt = txt.substring(0, txt.length - 2)
        }
        console.log(`did not find key '${aKey}' in model (${txt})`)
        valueOut = undefined as any
    }
    return valueOut
}

export function homeScreen(
    drawing: DrawingModel,
    tool: ToolModel,
    strokeandfill: StrokeAndFillModel,
    colorswatch: ColorSwatchModel,
    avatar: HtmlModel
): Fragment {
    // FIXME: let ColorSwatch take a closure
    // FIXME: make it possible to use Action directly
    const setcolor = new Action((data?: any) => {
        strokeandfill.set(data)
    })
    let editor = makeRef<ShapeEditor>(), vruler = makeRef<Ruler>(), hruler = makeRef<Ruler>()
    let dom = (
        <>
            <Menu
                style={{ position: "absolute", left: "0px", right: "0", top: "0" }}
                config={[
                    {
                        name: "file",
                        label: "File",
                        sub: [
                            {
                                name: "new",
                                label: "New",
                                sub: [
                                    { name: "board", label: "Board" },
                                    { name: "card", label: "Card" },
                                    { name: "document", label: "Document" },
                                ],
                            },
                            { name: "import", label: "Import" },
                            { name: "export", label: "Export" },
                            { name: "delete", label: "Delete" },
                            { name: "document-settings", label: "Document Settings" },
                            { name: "permissions", label: "Permissions" },
                        ],
                    },
                    {
                        name: "edit",
                        label: "Edit",
                        sub: [
                            { name: "undo", label: "Undo", shortcut: "Ctrl+Z" },
                            { name: "redo", label: "Redo", shortcut: "Ctrl+Y" },
                            { name: "cut", label: "Cut", shortcut: "Ctrl+X" },
                            { name: "copy", label: "Copy", shortcut: "Ctrl+C" },
                            { name: "paste", label: "Paste", shortcut: "Ctrl+V" },
                            { name: "delete", label: "Delete", shortcut: "Del" },
                            { name: "deselect-all", label: "Deselect All", shortcut: "Ctrl+Shift+A" },
                            { name: "select-all", label: "Select All", shortcut: "Ctrl+A" },
                        ],
                    },
                    {
                        name: "object",
                        label: "Object",
                        sub: [
                            {
                                name: "transform",
                                label: "Transform",
                                sub: [
                                    { name: "again", label: "Transform Again", shortcut: "Ctrl+D" },
                                    { name: "move", label: "Move", shortcut: "Ctrl+Shift+M" },
                                    { name: "rotate", label: "Rotate" },
                                    { name: "mirror", label: "Mirror" },
                                    { name: "scale", label: "Scale" },
                                    { name: "shear", label: "Shear" },
                                ],
                            },
                            {
                                name: "arrange",
                                label: "Arrange",
                                sub: [
                                    { name: "front", label: "Bring To Front", shortcut: "Ctrl+Shift+]" },
                                    { name: "back", label: "Bring To Back", shortcut: "Ctrl+Shift+[" },
                                    { name: "forward", label: "Bring Forward", shortcut: "Ctrl+]" },
                                    { name: "backward", label: "Bring Backward", shortcut: "Ctrl+[" },
                                ],
                            },
                            { name: "group", label: "Group" },
                            { name: "ungroup", label: "Ungroup" },
                        ],
                    },
                    {
                        name: "type",
                        label: "Type",
                        sub: [
                            {
                                name: "font",
                                label: "Font",
                                sub: [
                                    { name: "family", label: "Family" },
                                    { name: "bold", label: "Bold", shortcut: "Ctrl+B" },
                                    { name: "italics", label: "Italics", shortcut: "Ctrl+I" },
                                    { name: "underline", label: "Underline", shortcut: "Ctrl+U" },
                                    { name: "stroke", label: "Stroke" },
                                    { name: "bigger", label: "Bigger", shortcut: "Ctrl++" },
                                    { name: "smaller", label: "Smaller", shortcut: "Ctrl+-" },
                                ],
                            },
                            {
                                name: "text",
                                label: "Text",
                                sub: [
                                    { name: "left", label: "Left" },
                                    { name: "center", label: "Center" },
                                    { name: "right", label: "Right" },
                                ],
                            },
                        ],
                    },
                    { space: true },
                    { name: "help", label: "Help" },
                    { name: "settings", label: "Settings" },
                    // {
                    //     name: "account",
                    //     label: "Account",
                    //     model: avatar,
                    //     sub: [
                    //         { name: "preferences", label: "Preferences" },
                    //         { name: "logout", label: "Logout" },
                    //     ],
                    // },
                ]}
            />

            /* Control Panel */
            <div style={{ position: "absolute", left: "0px", right: "0", top: "26px" }}>
                <Select model={arrowLeft} style={{ width: "60px" }} />
                <Select model={arrowRight} style={{ width: "60px" }} />
            </div>

            /* Toolbar */
            <img src="img/logo.svg" width="44" height="30" style={{ position: "absolute", left: "3px", top: "58px" }} />
            <div style={{
                position: "absolute", left: "1px", top: "83px", width: "48px", bottom: "24px",
                background: "var(--tx-gray-400)"
            }}>
                <ToolButton model={tool} value={k2v(tool, "arrange")} title="Arrange (V)">
                    <img src="img/tool/select.svg" />
                </ToolButton>
                <ToolButton model={tool} value={k2v(tool, "edit")} title="Edit (A)">
                    <img src="img/tool/direct.svg" />
                </ToolButton>
                <ToolButton model={tool} value={k2v(tool, "pen")} title="Technical Pen (P)">
                    <img src="img/tool/pen.svg" />
                </ToolButton>
                <ToolButton model={tool} value={k2v(tool, "nib")} title="Nib Pen (N)">
                    <img src="img/tool/nib.svg" />
                </ToolButton>
                <ToolButton model={tool} value={k2v(tool, "rectangle")} title="Rectangle (M)">
                    <img src="img/tool/rectangle.svg" />
                </ToolButton>
                <ToolButton model={tool} value={k2v(tool, "circle")} title="Ellipse (L)">
                    <img src="img/tool/circle.svg" />
                </ToolButton>
                <ToolButton model={tool} value={k2v(tool, "text")} title="Type (T)">
                    <img src="img/tool/text.svg" />
                </ToolButton>
                <ToolButton model={tool} value={k2v(tool, "zoom")} title="Zoom (Z)">
                    <img src="img/tool/zoom.svg" />
                </ToolButton>
                <StrokeAndFill model={strokeandfill} />
                <ColorSwatch model={colorswatch} action={setcolor} />
            </div>

            <Ruler ref={hruler} style={{ position: "absolute", left: "69px", right: "0px", top: "58px", height: "20px" }} />
            <Ruler ref={vruler} orientation="vertical" style={{ position: "absolute", left: "49px", width: "20px", top: "78px", bottom: "24px" }} />
            <ShapeEditor
                ref={editor}
                model={drawing}
                tool={tool}
                strokeandfill={strokeandfill}
                style={{ position: "absolute", left: "69px", right: "0px", top: "78px", bottom: "24px" }}
            />

            <div id="hint" style={{ position: "absolute", left: "0", right: "0", height: "24px", bottom: "0" }}></div>
            {/* <div style={{ position: "absolute", left: "48px", right: "0", top: "0" }}> */}

        </>
    ) as Fragment

    hruler.current.documentSettings = drawing.documentSettings
    vruler.current.documentSettings = drawing.documentSettings
    hruler.current.attach(editor.current)
    vruler.current.attach(editor.current)
    return dom
}

function arrow2path(
    type: ArrowType,
    p1: PointLike,
    p2: PointLike,
    w: number,
    h: number
) {
    const d = Math.atan2(p2.y - p1.y, p2.x - p1.x)

    let height = h
    const width = 0.5 * w

    const p0 = {
        x: Math.cos(d) * height + p1.x,
        y: Math.sin(d) * height + p1.y
    }

    const p = Array(4)
    p[0] = p1

    const r = 90.0 / 360.0 * (2.0 * Math.PI)
    p[1] = {
        x: p0.x + Math.cos(d - r) * width,
        y: p0.y + Math.sin(d - r) * width
    }
    p[3] = {
        x: p0.x + Math.cos(d + r) * width,
        y: p0.y + Math.sin(d + r) * width
    }

    switch (type) {
        case ArrowType.NONE:
            return ""
        case ArrowType.SIMPLE:
            return `M ${p[1].x} ${p[1].y} L ${p[0].x} ${p[0].y} L ${p[3].x} ${p[3].y}`
        case ArrowType.EMPTY:
        case ArrowType.FILLED:
            p[2] = p0
            break
        case ArrowType.EMPTY_CONCAVE:
        case ArrowType.FILLED_CONCAVE:
            height -= height / 3
            p[2] = {
                x: Math.cos(d) * height + p1.x,
                y: Math.sin(d) * height + p1.y
            }
            break
        case ArrowType.EMPTY_CONVEX:
        case ArrowType.FILLED_CONVEX:
            height += height / 3
            p[2] = {
                x: Math.cos(d) * height + p1.x,
                y: Math.sin(d) * height + p1.y
            }
            break
    }
    return `M ${p[0].x} ${p[0].y} L ${p[1].x} ${p[1].y} L ${p[2].x} ${p[2].y} L ${p[3].x} ${p[3].y} Z`
}