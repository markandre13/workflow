import { Layer } from "client/figureeditor/Layer"
import { ORB } from "corba.js"
import { TextModel } from "toad.js/appkit/TextModel"
import { closeModalDialog, openModalDialog } from "toad.js/viewkit/dialog"
import { TextField } from "toad.js/viewkit/TextField"
import { Button } from "toad.js/viewkit/Button"

export class ExportDrawing {
    constructor(filename: string, layer: Layer, orb: ORB) {
        const filenameModel = new TextModel(filename)
        const download = document.createElement("a")
        download.type = "text/plain"
        download.style.display = "hidden"

        openModalDialog(() => <>
            <h1>Export</h1>
            <p>
                <TextField model={filenameModel} />
            </p>
            <p>
                <Button action={closeModalDialog}>Cancel</Button>
                <Button action={() => {
                    download.download = filenameModel.value
                    download.href = URL.createObjectURL(new Blob([orb.serialize(layer)]))
                    download.dispatchEvent(new MouseEvent("click"))
                    closeModalDialog()
                }}>Export</Button>
            </p>
            {download}
        </>)
    }
}
