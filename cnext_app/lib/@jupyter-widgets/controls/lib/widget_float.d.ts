import { CoreDescriptionModel } from './widget_core';
import { IntSliderView, IntRangeSliderView, IntTextView, BaseIntSliderView } from './widget_int';
export declare class FloatModel extends CoreDescriptionModel {
    defaults(): any;
}
export declare class BoundedFloatModel extends FloatModel {
    defaults(): any;
}
export declare class FloatSliderModel extends BoundedFloatModel {
    defaults(): any;
    initialize(attributes: any, options: {
        model_id: string;
        comm?: any;
        widget_manager: any;
    }): void;
    update_readout_format(): void;
    readout_formatter: any;
}
export declare class FloatLogSliderModel extends BoundedFloatModel {
    defaults(): any;
    initialize(attributes: any, options: {
        model_id: string;
        comm: any;
        widget_manager: any;
    }): void;
    update_readout_format(): void;
    readout_formatter: any;
}
export declare class FloatRangeSliderModel extends FloatSliderModel {
}
export declare class FloatSliderView extends IntSliderView {
    /**
     * Validate the value of the slider before sending it to the back-end
     * and applying it to the other views on the page.
     */
    _validate_slide_value(x: any): any;
    _parse_value: typeof parseFloat;
}
export declare class FloatLogSliderView extends BaseIntSliderView {
    update(options?: any): void;
    /**
     * Write value to a string
     */
    valueToString(value: number): string;
    /**
     * Parse value from a string
     */
    stringToValue(text: string): number;
    /**
     * this handles the entry of text into the contentEditable label first, the
     * value is checked if it contains a parseable value then it is clamped
     * within the min-max range of the slider finally, the model is updated if
     * the value is to be changed
     *
     * if any of these conditions are not met, the text is reset
     */
    handleTextChange(): void;
    /**
     * Called when the slider value is changing.
     */
    handleSliderChange(e: Event, ui: {
        value: any;
    }): void;
    /**
     * Called when the slider value has changed.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    handleSliderChanged(e: Event, ui: {
        value: any;
    }): void;
    _validate_slide_value(x: any): any;
    _parse_value: typeof parseFloat;
}
export declare class FloatRangeSliderView extends IntRangeSliderView {
    /**
     * Validate the value of the slider before sending it to the back-end
     * and applying it to the other views on the page.
     */
    _validate_slide_value(x: any): any;
    _parse_value: typeof parseFloat;
    _range_regex: RegExp;
}
export declare class FloatTextModel extends FloatModel {
    defaults(): any;
}
export declare class BoundedFloatTextModel extends BoundedFloatModel {
    defaults(): any;
}
export declare class FloatTextView extends IntTextView {
    _parse_value: typeof parseFloat;
    _default_step: string;
    /**
     * Handle key press
     */
    handleKeypress(e: KeyboardEvent): void;
    /**
     * Handle key up
     */
    handleKeyUp(e: KeyboardEvent): void;
}
export declare class FloatProgressModel extends BoundedFloatModel {
    defaults(): any;
}
