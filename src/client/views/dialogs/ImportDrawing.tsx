import { DrawingModel } from "client/figureeditor"
import { ORB } from "corba.js"
import { Dialog, Button } from "toad.js"

export class ImportDrawing extends Dialog {
    constructor(model: DrawingModel, orb: ORB) {
        super()

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
                model.delete(layer.id, layer.data.map((f)=>f.id))
                layer.data = loadedLayer.data
                model.signal.emit(undefined as any)

                this.close()
            }
        }, false)

        // we use a trick from
        //   https://stackoverflow.com/questions/34855400/cancel-event-on-input-type-file
        // to closed the dialog in case the upload was cancled:
        // when the file dialog closes, we the focus is returned to the window
        // if there wasn't an upload, we close the dialog
        window.addEventListener("focus", (e: Event) => {
            setTimeout( ()=> {
                if (!uploadOccured && this.shadow)
                    this.close()
            }, 300)
        }, {once: true})

        this.open(<>
            <h1>Import</h1>
            <p>
                <Button action={this.close}>Cancel</Button>
                <Button action={() => {
                    upload.dispatchEvent(new MouseEvent("click"))
                }}>Import</Button>
            </p>
            {upload}
        </>)

        upload.dispatchEvent(new MouseEvent("click"))
    }
}
