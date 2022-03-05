/*
 *  XML Parser
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

export enum TagType {
    Start = 1,	// <tag>
    End,        // </tag>
    Empty       // <tag/>
}

export class Node {
    filename: string
    col: number
    row: number
    constructor(filename: string, row: number, column: number) {
        this.filename = filename
        this.row = row
        this.col = column
    }
    printTree(indent: number) {
    }
    toString(): string {
        throw Error(`toString() is not implemented (${this.filename}:${this.row}:${this.col})`)
    }
    innerText(): string {
        throw Error(`innerText() is not implemented (${this.filename}:${this.row}:${this.col})`)
    }
}

export class Text extends Node {
    text: string
    constructor(filename: string, row: number, column: number) {
        super(filename, row, column)
        this.text = ""
    }
    override toString(): string {
        return this.text
    }
    override innerText(): string {
        return this.text
    }
    override printTree(indent: number) {
        let indentStr = ""
        for(let i=0; i<indent; ++i)
            indentStr = `${indentStr}    `
        console.log(`${indentStr}text: ${this.text}`)
    }
}

export class Comment extends Node {
    text: string
    constructor(filename: string, row: number, column: number) {
        super(filename, row, column)
        this.text = ""
    }
    override toString(): string {
        return `<!--${this.text}-->`
    }
    override innerText(): string {
        return this.toString()
    }
    override printTree(indent: number) {
        let indentStr = ""
        for(let i=0; i<indent; ++i)
            indentStr = `${indentStr}    `
        console.log(`${indentStr}comment: ${this.text}`)
    }
}

export class CData extends Node {
    text: string
    constructor(filename: string, row: number, column: number) {
        super(filename, row, column)
        this.text = ""
    }
    override toString(): string {
        return `<![CDATA[${this.text}]]>`
    }
    override innerText(): string {
        return this.toString()
    }
    override printTree(indent: number) {
        let indentStr = ""
        for(let i=0; i<indent; ++i)
            indentStr = `${indentStr}    `
        console.log(`${indentStr}cdata: ${this.text}`)
    }
}

export class Tag extends Node {
    name: string
    type: TagType
    attributes: Map<string, string>
    children: Array<Node>
    constructor(filename: string, row: number, column: number) {
        super(filename, row, column)
        this.name = ""
        this.type = TagType.Start
        this.attributes = new Map<string, string>()
        this.children = new Array<Node>()
    }
    
    addAttribute(key: string, value: string): void {
        this.attributes.set(key, value)
    }

    getAttributeOrUndefined(key: string): string|undefined {
        return this.attributes.get(key)
    }

    getAttribute(key: string): string {
        let value = this.getAttributeOrUndefined(key)
        if (value === undefined)
            throw Error(`missing attribute '${key}'`)
        return value
    }

    clearAttribute(key: string) {
        this.attributes.delete(key)
    }
   
    pushFront(node: Node) {
        this.children.unshift(node)
    }

    pushBack(node: Node) {
        this.children.push(node)
    }
    
    getChildOrUndefined(name: string): Tag|undefined {
        let match: Tag|undefined = undefined
        for (let child of this.children) {
            if (child instanceof Tag && child.name === name) {
                if (match !== undefined)
                    throw Error(`tag '${name}' has multiple occurences'`)
                match = child
            }
        }
        return match
    }

    getChild(name: string): Tag {
        let match = this.getChildOrUndefined(name)
        if (match === undefined)
            throw Error(`missing tag '${name}'`)
        return match
    }

    forAll(name: string, closure: (tag: Tag) => void): void {
        if (name === this.name) {
            closure(this)
        }
        for (let child of this.children) {
            if (child instanceof Tag) {
                child.forAll(name, closure)
            }
        }
    }
        
    override toString(): string {
        let text = `<${this.name}`
        
        for (let [key, value] of this.attributes)
            text = `${text} ${key}="${value}"`
        
        if (this.type === TagType.Empty) {
            text += "/"
        } else {
            text += ">"
            for (let child of this.children)
                text += child.toString()
            text = `${text}</${this.name}`
        }
        text += ">"
        return text
    }
    override innerText(): string {
        let text = ""
        for (let child of this.children)
            text += child.toString()
        return text
    }

    override printTree(indent: number) {
        let indentStr = ""
        for(let i=0; i<indent; ++i)
            indentStr = `${indentStr}    `
        console.log(`${indentStr}tag: ${this.name}`)
        for (let child of this.children)
            child.printTree(indent + 1)
    }

}

export class Document extends Tag {
    constructor(filename: string) {
        super(filename, 1, 1)
    }
    override toString(): string {
        let text = ""
        for (let child of this.children)
            text += child.toString()
        return text
    }
    override printTree(indent: number) {
        let indentStr = ""
        for(let i=0; i<indent; ++i)
            indentStr = `${indentStr}    `
        console.log(`${indentStr}document`)
        for (let child of this.children)
            child.printTree(indent + 1)
    }
}

class XMLLexer {
    filename: string
    data: string
    pos: number
    col: number
    row: number
    state: number
    
    constructor(filename: string, data: string) {
        this.filename = filename
        this.data = data
        this.pos = 0
        this.col = 1
        this.row = 1
        this.state = 0
    }

    error(message: string) {
        throw Error(`${message} (${this.filename}:${this.row}:${this.col})`)
    }
    
    getc(): string|undefined {
        if (this.pos >= this.data.length)
            return undefined
        return this.data[this.pos++]
    }
    
    ungetc() {
        --this.pos
        if (this.data.charCodeAt(this.pos) == 0x0a) {
            this.col = 0
            for(let i = this.pos; i>=0 && this.data.charCodeAt(this.pos) != 0x0a; --i) {
                ++this.col
            }
            --this.row
        }
    }

    isWhiteSpace(code: number): boolean {
        return code == 0x20 ||  // space
               code == 0x09 ||  // tab
               code == 0x0d ||  // carriage return (either ignored to treated as line feed)
               code == 0x0a     // line feed
    }
    
    isNameStartChar(code: number): boolean {
        return code === 0x3a ||                       // :
               code === 0x5f ||                       // _
               (code >= 0x41 && code <= 0x5a ) ||     // A-Z
               (code >= 0x61 && code <= 0x7a ) ||     // a-z
               (code >= 0xc0 && code <= 0xd6 ) ||
               (code >= 0xd8 && code <= 0xf6 ) ||
               (code >= 0xf8 && code <= 0x2FF ) ||
               (code >= 0x370 && code <= 0x37d ) ||
               (code >= 0x37f && code <= 0x1fff) ||
               (code >= 0x200c && code <= 0x200d) ||
               (code >= 0x2070 && code <= 0x218F) ||
               (code >= 0x2C00 && code <= 0x2fef) ||
               (code >= 0x3001 && code <= 0xd7ff) ||
               (code >= 0xf900 && code <= 0xfdcf) ||
               (code >= 0xfdf0 && code <= 0xfffd) ||
               (code >= 0x10000 && code <= 0xeffff)
    }
    
    isNameChar(code: number): boolean {
        return this.isNameStartChar(code) ||
               code === 0x2d ||                       // -
               code === 0x2e ||                       // .
               (code >= 0x30 && code <= 0x39) ||      // 0-9
               code == 0xb7 ||			              // · (middle dot)
               (code >= 0x0300 && code <= 0x036f) ||
               (code >= 0x203f && code <= 0x2040)
    }
    
    lex(): Node | undefined  {
        let state = 0
        let tag: Tag | undefined = undefined
        let text: Text | undefined = undefined
        let comment: Comment | undefined = undefined
        let cdata: CData | undefined = undefined
        let attrName = ""
        let attrValue = ""
        while (true) {
            let char = this.getc()
            if (char === undefined) {
                if (state === 2) {
                    return text
                }
                return
            }
            let code = char.charCodeAt(0)
            if (code === 0x0a) {
                ++this.row
                this.col = 1
            } else {
                ++this.col
            }

        //    console.log(`[${state}] '${char}' ${code}`)

            switch (state) {
                // tag, comment, cdata, doctype
                case 0: // ?
                    switch (char) {
                        case '<':
                            state = 1
                            break
                        default:
                            text = new Text(this.filename, this.row, this.col)
                            text.text += char
                            state = 2
                            break
                    }
                    break

                case 1: // <?
                    switch (char) {
                        case '!': // comment, cdata
                            state = 13
                            break
                        case '?': // prolog
                            state = 11
                            break
                        case '/':
                            state = 3
                            break
                        default:
                            if (!this.isNameStartChar(code))
                                this.error(`Expected tag name, comment or prolog after '<'`)
                            tag = new Tag(this.filename, this.row, this.col)
                            tag.name += char
                            state = 4
                            break
                    }
                    break

                // text
                case 2: // T?
                    if (char === "<") {
                        this.ungetc()
                        return text
                    }
                    text!.text += char
                    break

                // tag
                case 3: // </?
                    if (!this.isNameStartChar(code))
                        this.error(`Expected tag name after '</'`)
                    tag = new Tag(this.filename, this.row, this.col)
                    tag.type = TagType.End
                    tag.name += char
                    state = 4
                    break

                case 4: //<T?
                    if (char === "/") {
                        tag!.type = TagType.Empty
                        state = 5
                    } else
                    if (char === ">") {
                        return tag
                    } else
                    if (this.isNameChar(code)) {
                        tag!.name += char
                    } else
                    if (this.isWhiteSpace(code)) {
                        state = 6
                    } else {
                        tag!.name += char
                    }
                    break

                case 5: //<T /?
                    if (char != ">")
                        this.error(`Expected '>' at end of tag`)
                    return tag

                case 6: //<T ?
                    if (this.isWhiteSpace(code))
                        break
                    if (this.isNameStartChar(code)) {
                        attrName += char
                        state = 7
                    } else
                    if (char === "/") {
                        tag!.type = TagType.Empty
                        state = 5
                    } else
                    if (char === ">") {
                        return tag
                    }
                    break

                case 7: // <T A?
                    if (this.isNameChar(code)) {
                        attrName += char
                        break
                    } else {
                        state = 8
                    }
                case 8: // <T A?
                    if (this.isWhiteSpace(code))
                        break
                    if (char === "=") {
                        state = 9
                        break
                    }
                    this.error(`Expected '=' after attribute name`)
                case 9: // <T A=?
                    if (this.isWhiteSpace(code))
                        break
                    if (char === '"') {
                        state = 10
                        break
                    }
                    this.error(`Expected '"' after '='`)
                case 10: // <T A="?>
                    if (char === '"') {
                        tag!.addAttribute(attrName, attrValue)
                        state = 6
                        attrName = ""
                        attrValue = ""
                    } else {
                        attrValue += char
                    }
                    break
                    
                // crude skipping of skip <?...?>
                case 11: // <?
                    if (char == "?")
                        state = 12
                    break
                case 12:
                    switch(char) {
                        case ">":
                            state = 0
                            break
                        case "?":
                            break
                        default:
                            state = 11
                    }
                    break
                    
                case 13: // <!?
                    switch(char) {
                        case "-":
                            state = 14
                            break
                        case "[":
                            state = 30
                            break
                    }
                    break
                    
                case 14: // <!-
                    if (char !== "-")
                        this.error("Expected '-' after '<!-'")
                    state = 15
                    comment = new Comment(this.filename, this.row, this.col)
                    break
                case 15: // <!--?
                    if (char == "-") 
                        state = 16
                    else
                        comment!.text += char
                    break
                case 16: // <!--...-?>
                    if (char == "-") {
                        state = 17
                    } else {
                        comment!.text += "-" + char
                        state = 15
                    }
                    break
                case 17:
                    if (char != ">")
                        this.error("'--' is only allowed in comment to close them")
                    return comment
                    
                case 30: // <![?
                    cdata = new CData(this.filename, this.row, this.col)
                    if (char != "C")
                        this.error("Expected 'C' after <![")
                    state = 31
                    break
                case 31: // <![C?
                    if (char != "D")
                        this.error("Expected 'D' after <![C")
                    state = 32
                    break
                case 32: // <![CD?
                    if (char != "A")
                        this.error("Expected 'A' after <![CD")
                    state = 33
                    break
                case 33: // <![CDA?
                    if (char != "T")
                        this.error("Expected 'T' after <![CDA")
                    state = 34
                    break
                case 34: // <![CDAT?
                    if (char != "A")
                        this.error("Expected 'A' after <![DAT")
                    state = 35
                    break
                case 35: // <![CDATA?
                    if (char != "[")
                        this.error("Expected '[' after <![CDATA")
                    state = 36
                    break
                case 36: // <![CDATA[...?
                    if (char === "]")
                        state = 37
                    else
                        cdata!.text += char
                    break
                case 37: // <![CDATA[...]?
                    if (char === "]") {
                        state = 38
                    } else {
                        cdata!.text += "]" + char
                        state = 36
                    }
                    break
                case 38: // <![CDATA[...]]?
                    if (char === ">") {
                        return cdata
                    } else {
                        cdata!.text += "]]" + char
                        state = 36
                    }
                    break
            }
        }
    }
}

export function parseXML(filename: string, data: string) {
    let lexer = new XMLLexer(filename, data)
    let tagStack = new Array<Tag>()
    let parent = new Document(filename)
    tagStack.push(parent)
    while(true) {
        let token = lexer.lex()
        if (token === undefined)
            break
        if (token instanceof Tag) {
            switch(token.type) {
                case TagType.Start:
                    parent.children.push(token)
                    tagStack.push(token)
                    parent = token
                    break
                case TagType.End:
                    let last = tagStack.pop()
                    if (last === undefined || tagStack.length < 1)
                        throw Error(`unexpected closing tag ${token.name} (${token.filename}:${token.row}:${token.col})`)
                    if (last.name !== token.name)
                        throw Error(`wrong closing tag: expected ${token.name} but got ${last.name} (${token.filename}:${token.row}:${token.col})`)
                    parent = tagStack[tagStack.length - 1]
                    break
                case TagType.Empty:
                    parent.children.push(token)
                    break
            }
        } else {
            parent.children.push(token)
        }
    }
    if (tagStack.length !== 1)
        throw Error(`missing ${tagStack.length -1} closing tags`)
    return tagStack[0]
}
