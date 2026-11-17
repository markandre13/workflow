import { NumberModel } from "toad.js/appkit/NumberModel"
import { Button, ButtonVariant } from "toad.js/viewkit/Button"
import { closeModalDialog, openModalDialog } from "toad.js/viewkit/dialog"
import { Fragment } from "toad.jsx/jsx-runtime"
import { Form, FormField, FormHelp, FormLabel } from "toad.js/viewkit/Form"
import { RadioButton } from "toad.js/viewkit/RadioButton"
import { FormSelect } from "toad.js/viewkit/FormSelect"
import { FormText } from "toad.js/viewkit/FormText"
import { DocumentSettings } from "client/app/DocumentSettings"
import { Orientation } from "client/app/Orientation"

export class DocumentSettingsDialog {
    // TODO: take width, height, bleed and unit as input
    constructor(model: DocumentSettings) {
        openModalDialog(() => <>
            <h1>Document Settings</h1>
            <Form>
                <FormSelect model={model.format} />

                <FormLabel model={model.orientation} />
                <FormField>
                    <RadioButton model={model.orientation} value={Orientation.PORTRAIT} />
                    <RadioButton model={model.orientation} value={Orientation.LANDSCAPE} />
                </FormField>
                <FormHelp model={model.orientation} />

                <FormSelect model={model.units} />
                <FormText model={model.width} />
                <FormText model={model.height} />

                <h4>Bleed</h4>
                <FormText model={model.left} />
                <FormText model={model.right} />
                <FormText model={model.top} />
                <FormText model={model.bottom} />
            </Form>
            <p>
                <Button action={closeModalDialog}>Cancel</Button>
                <Button variant={ButtonVariant.PRIMARY} action={() => {
                    closeModalDialog()
                }}>Ok</Button>
            </p>
        </> as Fragment)
    }
}