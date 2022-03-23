import { DescriptionView } from './widget_description';
import { CoreDescriptionModel } from './widget_core';
export declare function serialize_date(value: Date): {
    year: number;
    month: number;
    date: number;
};
export interface SerializedDate {
    /**
     * Full year
     */
    year: number;
    /**
     * Zero-based month (0 means January, 11 means December)
     */
    month: number;
    /**
     * Day of month
     */
    date: number;
}
export declare function deserialize_date(value: SerializedDate): Date;
export declare class DatePickerModel extends CoreDescriptionModel {
    static serializers: {
        value: {
            serialize: typeof serialize_date;
            deserialize: typeof deserialize_date;
        };
    };
    defaults(): any;
}
export declare class DatePickerView extends DescriptionView {
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
    private _picker_change;
    private _picker_focusout;
    private _datepicker;
}
