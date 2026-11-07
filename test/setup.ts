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

import { beforeAll } from "vitest"
import { initializeCORBAValueTypes } from "client/workflow"

// SVGPathElement.getPathData()/setPathData() are not implemented by browsers.
// The old test runner loaded the polyfill through a shared test page, so make
// sure every test file gets it before the specs run.
beforeAll(async () => {
    await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script")
        script.src = "/polyfill/path-data-polyfill.js"
        script.onload = () => resolve()
        script.onerror = () => reject(new Error("failed to load polyfill/path-data-polyfill.js"))
        document.head.appendChild(script)
    })
})

initializeCORBAValueTypes()
