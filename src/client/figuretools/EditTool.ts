/*
 *  workflow - A collaborative real-time white- and kanban board
 *  Copyright (C) 2018-2022 Mark-André Hopf <mhopf@mark13.org>
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

 import { FigureEditor, EditorPointerEvent } from "../figureeditor"
 import { Tool } from "./Tool"
 import { Path } from "../figures/Path"

 export enum EditToolState {
     NONE,
 }
 
 export class EditTool extends Tool {
     state: EditToolState
 
     constructor() {
         super()
         this.debug = false
         this.state = EditToolState.NONE
     }
     
     override activate(editor: FigureEditor) {
         editor.svgView.style.cursor = "default"
         Tool.setHint(`edit tool: under construction`)
         Tool.selection.modified.add( () => {
             this.updateOutlineOfSelection(editor)
        }, this)
        Tool.selection.modified.trigger()
     }
     
     override deactivate(editor: FigureEditor) {
        Tool.selection.modified.remove(this)
        this.removeOutlines(editor)
        // this.removeDecoration(editor)
     }

     override pointerdown(event: EditorPointerEvent): void {
        let figure = event.editor.selectedLayer!.findFigureAt(event)
        if (figure === undefined) {
            if (!event.shiftKey) {
                Tool.selection.clear()
            }
            // this.state = ArrangeToolState.DRAG_MARQUEE
            return
        }
      
        if (Tool.selection.has(figure)) {
            return
        }

        Tool.selection.modified.lock()
        if (!event.shiftKey)
            Tool.selection.clear()
        Tool.selection.add(figure)
        Tool.selection.modified.unlock()
     }
 }
 