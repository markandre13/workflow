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

import { Fragment, Menu, ToolButton, action } from "toad.js"
import { StrokeAndFill } from "client/views/widgets/strokeandfill"
import { ColorSwatch } from "client/views/widgets/colorswatch"
import { FigureEditor } from "client/figureeditor"

import { HtmlModel } from "toad.js"
import { StrokeAndFillModel } from "../widgets/strokeandfill"
import { ColorSwatchModel } from "../widgets/colorswatch"
import { ToolModel } from "client/figuretools/ToolModel"
import { DrawingModel } from "client/figureeditor"

export function homeScreen(model: DrawingModel, tool: ToolModel, strokeandfill: StrokeAndFillModel, colorswatch: ColorSwatchModel, avatar: HtmlModel): Fragment {
    // FIXME: let ColorSwatch take a closure
    // FIXME: make it possible to use Action directly
    const setcolor = action("setcolor", (data?: any) => {
        strokeandfill.set(data)
    })
    return <>
            <img src="img/logo.svg" width="44" height="44" style={{ position: "absolute", left: "2px", top: "2px" }} />
            <div style={{ position: "absolute", left: 0, width: "41px", top: "49px", bottom: "32px", backgroundColor: "#e3dbdb" }}>
                <ToolButton model={tool} value="select" img="img/tool/select.svg" />
                <ToolButton model={tool} value="line" img="img/tool/line.svg" />
                <ToolButton model={tool} value="freehand" img="img/tool/freehand.svg" />
                <ToolButton model={tool} value="rectangle" img="img/tool/rectangle.svg" />
                <ToolButton model={tool} value="circle" img="img/tool/circle.svg" />
                <ToolButton model={tool} value="text" img="img/tool/text.svg" />
                <ToolButton model={tool} value="state" img="img/tool/state.svg" />
                <ToolButton model={tool} value="transition" img="img/tool/transition.svg" />
                <StrokeAndFill model={strokeandfill} />
                <ColorSwatch model={colorswatch} action={setcolor} />
            </div>
            <FigureEditor model={model} tool={tool} strokeandfill={strokeandfill} style={{position: "absolute", left: "41px", right: "0px", top: "49px", bottom: "32px"}} />
            <div id="debug" style={{ position: "absolute", left: "0", right: "0", height: "32px", bottom: "0", backgroundColor: "silver" }}></div>
            <div style={{ position: "absolute", left: "48px", right: "0", top: "0" }}>
            <Menu config={[
                {name: "file", label: "File", sub: [
                    {name: "new", label: "New", sub: [
                        {name: "board", label: "Board"},
                        {name: "card", label: "Card"},
                        {name: "document", label: "Document"},
                    ]},
                    {name: "import", label: "Import"},
                    {name: "export", label: "Export"},
                    {name: "delete", label: "Delete"},
                    {name: "permissions", label: "Permissions"},
                ]},
                {name: "edit", label: "Edit", sub: [
                    {name: "undo", label: "Undo", shortcut: "Ctrl+Z"},
                    {name: "redo", label: "Redo", shortcut: "Ctrl+Y"},
                    {name: "cut", label: "Cut", shortcut: "Ctrl+X"},
                    {name: "copy", label: "Copy", shortcut: "Ctrl+C"},
                    {name: "paste", label: "Paste", shortcut: "Ctrl+V"},
                    {name: "delete", label: "Delete", shortcut: "Del"},
                    {name: "deselect-all", label: "Deselect All", shortcut: "Ctrl+Shift+A"},
                    {name: "select-all", label: "Select All", shortcut: "Ctrl+A"},
                ]},
                {name: "object", label: "Object", sub: [
                    {name: "transform", label: "Transform", sub: [
                        {name: "again", label: "Transform Again", shortcut: "Ctrl+D"},
                        {name: "move", label: "Move", shortcut: "Ctrl+Shift+M"},
                        {name: "rotate", label: "Rotate"},
                        {name: "mirror", label: "Mirror"},
                        {name: "scale", label: "Scale"},
                        {name: "shear", label: "Shear"},
                    ]},
                    {name: "arrange", label: "Arrange", sub: [
                        {name: "front", label: "Bring To Front", shortcut: "Ctrl+Shift+]"},
                        {name: "back", label: "Bring To Back", shortcut: "Ctrl+Shift+["},
                        {name: "forward", label: "Bring Forward", shortcut: "Ctrl+]"},
                        {name: "backward", label: "Bring Backward", shortcut: "Ctrl+["},
                    ]},
                    {name: "group", label: "Group"},
                    {name: "ungroup", label: "Ungroup"},
                ]},
                {name: "type", label: "Type", sub: [
                    {name: "font", label: "Font", sub: [
                        {name: "family", label: "Family"},
                        {name: "bold", label: "Bold", shortcut: "Ctrl+B"},
                        {name: "italics", label: "Italics", shortcut: "Ctrl+I"},
                        {name: "underline", label: "Underline", shortcut: "Ctrl+U"},
                        {name: "stroke", label: "Stroke"},
                        {name: "bigger", label: "Bigger", shortcut: "Ctrl++"},
                        {name: "smaller", label: "Smaller", shortcut: "Ctrl+-"},
                    ]},
                    {name: "text", label: "Text", sub: [
                        {name: "left", label: "Left"},
                        {name: "center", label: "Center"},
                        {name: "right", label: "Right"},
                    ]},
                ]},
                {space: true},
                {name: "help", label: "Help"},
                {name: "settings", label: "Settings"},
                {name: "account", label: "Account", model: avatar, sub: [
                    {name: "preferences", label: "Preferences"},
                    {name: "logout", label: "Logout"},
                ]},
            ]}/>
            </div>
        </> as Fragment
}