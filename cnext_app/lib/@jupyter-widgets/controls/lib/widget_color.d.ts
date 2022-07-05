import { CoreDescriptionModel } from './widget_core';
import { DescriptionView } from './widget_description';
export declare class ColorPickerModel extends CoreDescriptionModel {
    defaults(): any;
}
export declare class ColorPickerView extends DescriptionView {
    render(): void;
    /**
     * Update the contents of this view
     *
     * Called when the model is changed. The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(options?: any): void;
    events(): {
        [e: string]: string;
    };
    private _update_value;
    private _update_concise;
    private _picker_change;
    private _text_change;
    private _validate_color;
    private _color_container;
    private _textbox;
    private _colorpicker;
}
