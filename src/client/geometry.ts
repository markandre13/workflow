/*
 *  The TOAD JavaScript/TypeScript GUI Library
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

export class Point {
  x: number
  y: number
  
  constructor();
  constructor(x: number, y: number);
  constructor(x?: any, y?: any) {
    this.x = x ? x : 0
    this.y = y ? y : 0
  }
}

export class Size {
  width: number
  height: number
  
  constructor();
  constructor(width: number, height: number);
  constructor(width?: any, height?: any) {
    this.width = width ? width : 0
    this.height = height ? height : 0
  }
}

export function pointPlusSize(p: Point, s: Size): Point {
  return { x: p.x+s.width, y: p.y+s.height }
}

export class Rectangle {
  origin: Point
  size: Size
  
  constructor();
  constructor(origin: Point, size: Size);
  constructor(o?: any, s?: any) {
    this.origin = o ? o : new Point
    this.size = s ? s : new Size
  }
  
  set(x: number, y: number, width: number, height: number) {
    this.origin = new Point(x, y)
    this.size   = new Size(width, height)
  }

  expandByPoint(p: Point): void {
    if (p.x < this.origin.x) {
      this.size.width += this.origin.x - p.x ; this.origin.x = p.x
    } else
    if (p.x > this.origin.x + this.size.width) {
      this.size.width = p.x - this.origin.x
    }
    if (p.y < this.origin.y) {
      this.size.height += this.origin.y - p.y ; this.origin.y = p.y
    } else
    if (p.y > this.origin.y + this.size.height) {
      this.size.height = p.y - this.origin.y
    }
  }
  
  expandByRectangle(r: Rectangle): void {
    this.expandByPoint(r.origin)
    this.expandByPoint(pointPlusSize(r.origin, r.size))
  }
}
