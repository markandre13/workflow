import { DrawingModel } from "client/figureeditor"
import { ORB } from "corba.js"

export class ImportDrawing {
    constructor(model: DrawingModel, orb: ORB) {
        let uploadOccured = false

        const upload = document.createElement("input")
        upload.type = "file"
        upload.style.display = "none"
        upload.addEventListener("change", async () => {
            uploadOccured = true
            // console.log(upload.files)
            if (upload.files?.length === 1) {
                const file = upload.files[0]
                // console.log(`file: "${file.name}", size ${file.size} bytes`)
                const content = await file.arrayBuffer()
                // console.log(content)
                const loadedLayer = orb.deserialize(content)

                // this is a very nasty hack!
                const layer = model.layers[0]
                model.delete(layer.id, layer.data.map((f) => f.id))
                layer.data = loadedLayer.data
                model.signal.emit(undefined as any)

                // this.close()
            }
        }, false)
        upload.dispatchEvent(new MouseEvent("click"))
    }
}
