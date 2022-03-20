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

import { FigureEditor } from "./FigureEditor"

type WhitespaceKeyCode = "Enter" | "NumpadEnter" | "Tab" | "Space"
type NavigationKeyCode = "ArrowDown" | "ArrowLeft" | "ArrowRight" | "ArrowUp" | "End" | "Home" | "PageDown" | "PageUp"
type EditingKeys = "Backspace" | "Clear" | "Copy" | "CrSel" | "Cut" | "Delete" | "EraseEof" | "ExSel" | "Insert" | "Paste" | "Redo" | "Undo"
type UIKeys = "Accept" | "Again" | "Attn" | "Cancel" | "ContextMenu" | "Escape" | "Execute" | "Find" | "Finish" | "Help" | "Pause" | "Play" | "Props" | "Select" | "ZoomIn" | "ZoomOut"
type ModifierKeyCode = "Dead" | "ShiftLeft" | "ShiftRight" | "ControlLeft" | "ControlRight" | "AltLeft" | "AltRight" | "MetaLeft" | "MetaRight"
type Alpha = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z"
type AlphaKeyCode = `Key${Alpha}`
type Numeric = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
type NumericKeyCode = `Digit${Numeric}` | `Numpad${Numeric}`
export type KeyCode = WhitespaceKeyCode | NavigationKeyCode | EditingKeys | UIKeys | ModifierKeyCode | AlphaKeyCode | NumericKeyCode

export class EditorKeyboardEvent {
    protected event: KeyboardEvent

    editor: FigureEditor
    type: "down" | "up"
    code: KeyCode
    value: string

    shift: boolean
    ctrl: boolean
    alt: boolean  // macOS: option key
    meta: boolean // macOS: command key, Windows: windows key

    constructor(editor: FigureEditor, event: KeyboardEvent) {
        this.editor = editor
        this.event = event
        this.code = event.code as KeyCode
        this.value = event.key
        this.shift = event.shiftKey
        this.ctrl = event.ctrlKey
        this.alt = event.altKey
        this.meta = event.metaKey
        switch(event.type) {
            case "keydown":
                this.type = "down"
                break
            case "keyup":
                this.type = "up"
                break
            default:
                throw Error(`Unknown KeyboardEvent.type '${event.type}'`)
        }
    }

    preventDefault() {
        this.event.preventDefault()
    }

    stopPropagation() {
        this.event.stopPropagation()
    }

    stopImmediatePropagation() {
        this.event.stopImmediatePropagation()
    }
}
