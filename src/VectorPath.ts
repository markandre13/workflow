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

// https://svgwg.org/specs/paths/#InterfaceSVGPathData
// https://github.com/jarek-foksa/path-data-polyfill.js
declare global {
  interface SVGPathElement {
    setPathData(data: any): void;
    getPathData(): any;
  }
}

export default class VectorPath
{
  path: any
  svg: SVGPathElement
  
  constructor() {
    this.path = [];
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "path") as SVGPathElement;
  }
  clear() {
    this.path = []
  }
  move(x: number, y: number) {
    this.path.push({type: 'M', values: [x, y]});
  }
  line(x: number, y: number) {
    this.path.push({type: 'L', values: [x, y]});
  }
  close() {
    this.path.push({type: 'Z'});
    this.svg.setPathData(this.path);
  }
  translate(dx: number, dy: number) {
    for(let segment of this.path) {
      switch(segment.type) {
        case 'M':
        case 'L':
          segment.values[0] += dx;
          segment.values[1] += dy;
          break;
      }
    }
    this.svg.setPathData(this.path);
  }
}

