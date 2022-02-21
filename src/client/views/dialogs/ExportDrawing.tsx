import { Layer } from "client/figureeditor/Layer"
import { ORB } from "corba.js"
import { Dialog, Button, TextModel, Text } from "toad.js"

export class ExportDrawing extends Dialog {
    constructor(filename: string, layer: Layer, orb: ORB) {
        super()
        const filenameModel = new TextModel(filename)
        const download = document.createElement("a")
        download.type = "text/plain"
        download.style.display = "hidden"

        this.open(<>
            <h1>Export</h1>
            <p>
                <Text model={filenameModel} />
            </p>
            <p>
                <Button action={this.close}>Cancel</Button>
                <Button action={() => {
                    download.download = filenameModel.value
                    download.href = URL.createObjectURL(new Blob([orb.serialize(layer)]))
                    download.dispatchEvent(new MouseEvent("click"))
                    this.close()
                }}>Export</Button>
            </p>
            {download}
        </>)
    }
}
