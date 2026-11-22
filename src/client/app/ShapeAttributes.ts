import { StrokeEndType } from "shared/workflow"
import { OptionModel } from "toad.js/appkit/OptionModel"
import { NumberModel } from "toad.js/appkit/NumberModel"
import { StrokeAndFillModel } from "./StrokeAndFilll"
import { StrokeEndModel } from "client/StrokeEndModel"
import { makeArrowOption } from "client/view/pages/makeArrowOption"

/**
 * the attributes which the user chooses in the toolbar. they are applied to the selected shapes
 * and are updated from the selection.
 */
export class ShapeAttributes {
    readonly strokeAndFill = new StrokeAndFillModel()
    readonly strokeStart: StrokeEndModel = new OptionModel(StrokeEndType.NONE, [
        makeArrowOption(StrokeEndType.NONE),
        makeArrowOption(StrokeEndType.SIMPLE),
        makeArrowOption(StrokeEndType.EMPTY),
        makeArrowOption(StrokeEndType.FILLED),
        makeArrowOption(StrokeEndType.EMPTY_CONCAVE),
        makeArrowOption(StrokeEndType.FILLED_CONCAVE),
        makeArrowOption(StrokeEndType.EMPTY_CONVEX),
        makeArrowOption(StrokeEndType.FILLED_CONVEX),
    ])
    readonly strokeEnd: StrokeEndModel = new OptionModel(StrokeEndType.NONE, [
        makeArrowOption(StrokeEndType.NONE, false),
        makeArrowOption(StrokeEndType.SIMPLE, false),
        makeArrowOption(StrokeEndType.EMPTY, false),
        makeArrowOption(StrokeEndType.FILLED, false),
        makeArrowOption(StrokeEndType.EMPTY_CONCAVE, false),
        makeArrowOption(StrokeEndType.FILLED_CONCAVE, false),
        makeArrowOption(StrokeEndType.EMPTY_CONVEX, false),
        makeArrowOption(StrokeEndType.FILLED_CONVEX, false),
    ])
    readonly strokeWidth = new NumberModel(1, { label: "Stroke Width", min: 1, max: 32, step: 1 })
}
