import * as unittest from "test/ui/main"
import { ORB } from "corba.js"
import * as toad from "toad.js"
import { Rectangle } from "shared/geometry/Rectangle"
import { Size } from "shared/geometry/Size"
import { Point } from "shared/geometry/Point"
import { Matrix } from "shared/geometry/Matrix"
import { Figure } from "shared/workflow_valuetype"
import * as editor from "client/editor"
import * as figure from "client/figure"
import * as tool from "client/tool"
import { Path } from "client/Path"

class FigureModel extends toad.Model implements editor.LayerModel {
    layers: Array<editor.Layer>
    
    constructor() {
        super()
        this.layers = new Array<editor.Layer>()
    }

    layerById(layerID: number) {
        for(let layer of this.layers) {
            if (layer.id === layerID)
                return layer
        }
        throw Error("BoardListener_impl.layerById(): unknown layer id "+layerID)
    }

    add(layerId: number, figure: Figure): void {
        let layer = this.layerById(layerId)
        layer.data.push(figure)
        this.modified.trigger()
    }

    transform(layerId: number, figureIdArray: Array<number>, matrix: Matrix): void {
        let layer = this.layerById(layerId)

        let figureIdSet = new Set<number>()
        for(let id of figureIdArray)
            figureIdSet.add(id)

        for(let index in layer.data) {
            let fig = layer.data[index]

            if (!figureIdSet.has(fig.id))
                continue

            if (fig.transform(matrix))
                continue

            let transform = new figure.Transform()
//            transform.id = newIds.shift()!
            transform.matrix = new Matrix(matrix)
            transform.children.push(fig)
            let oldPath = fig.getPath() as Path
            let newPath = transform.getPath() as Path
            (oldPath.svg as any).replaceWith(newPath.svg)
//            (f.getPath() as Path).svg.replaceWith(
//                (transform.getPath() as Path).svg
//            )
            layer.data[index] = transform
        }
        this.modified.trigger()
    }
}

let figuremodel: FigureModel | undefined

unittest.register("figureeditor.handles.initialize", () => {
    console.log("executing figureeditor/handles")
    
    ORB.registerValueType("Point", Point)
    ORB.registerValueType("Size", Size)
    ORB.registerValueType("Rectangle", Rectangle)
    ORB.registerValueType("Matrix", Matrix)
    
//    ORB.registerValueType("Figure", Figure)
    ORB.registerValueType("figure.Rectangle", figure.Rectangle)

    figuremodel = new FigureModel()
    let layer = new editor.Layer()
    let shape = new figure.Rectangle({origin: {x: 50.5, y: 50.5}, size: {width: 50, height: 50}})
    layer.data.push(shape)
    figuremodel.layers.push(layer)
    toad.bind("model", figuremodel)

    let toolmodel = new editor.ToolModel()
    toolmodel.add("select", new tool.SelectTool())
    toolmodel.add("rectangle", new tool.ShapeTool(() => { return new figure.Rectangle() }))
    toolmodel.stringValue = "select"
    toad.bind("model", toolmodel)
    
    window.customElements.define("toad-figureeditor", editor.FigureEditor)
    document.body.innerHTML = `<toad-figureeditor model="model" style="position: absolute; top: 0; bottom: 0; left: 0; right: 0"></toad-figureeditor>`
})

unittest.register("figureeditor.handles.get-x-position", () => {
    return (figuremodel!.layers[0]!.data[0]! as figure.Rectangle).origin.x
})

unittest.register("figureeditor.handles.reset-x-position", () => {
    (figuremodel!.layers[0]!.data[0]! as figure.Rectangle).origin.x = 50.5
})
