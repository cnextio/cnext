import { CoreDescriptionModel } from './widget_core';
import { DescriptionView, DescriptionStyleModel } from './widget_description';
import { DOMWidgetView } from '@jupyter-widgets/base';
import 'jquery-ui/ui/widgets/slider';
export declare class IntModel extends CoreDescriptionModel {
    defaults(): any;
}
export declare class BoundedIntModel extends IntModel {
    defaults(): any;
}
export declare class SliderStyleModel extends DescriptionStyleModel {
    defaults(): any;
    static styleProperties: {
        handle_color: {
            selector: string;
            attribute: string;
            default: any;
        };
        description_width: {
            selector: string;
            attribute: string;
            default: any;
        };
    };
}
export declare class IntSliderModel extends BoundedIntModel {
    defaults(): any;
    initialize(attributes: any, options: {
        model_id: string;
        comm: any;
        widget_manager: any;
    }): void;
    update_readout_format(): void;
    readout_formatter: any;
}
export declare class IntRangeSliderModel extends IntSliderModel {
}
export declare abstract class BaseIntSliderView extends DescriptionView {
    render(): void;
    update(options?: any): void;
    /**
     * Returns true if the readout box content overflows.
     */
    readout_overflow(): boolean;
    /**
     * Write value to a string
     */
    abstract valueToString(value: number | number[]): string;
    /**
     * Parse value from a string
     */
    abstract stringToValue(text: string): number | number[];
    events(): {
        [e: string]: string;
    };
    handleKeyDown(e: KeyboardEvent): void;
    /**
     * this handles the entry of text into the contentEditable label first, the
     * value is checked if it contains a parseable value then it is clamped
     * within the min-max range of the slider finally, the model is updated if
     * the value is to be changed
     *
     * if any of these conditions are not met, the text is reset
     */
    abstract handleTextChange(): void;
    /**
     * Called when the slider value is changing.
     */
    abstract handleSliderChange(e: any, ui: {
        value?: number;
        values?: number[];
    }): void;
    /**
     * Called when the slider value has changed.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    abstract handleSliderChanged(e: Event, ui: {
        value?: number;
        values?: number[];
    }): void;
    /**
     * Validate the value of the slider before sending it to the back-end
     * and applying it to the other views on the page.
     */
    _validate_slide_value(x: number): number;
    $slider: any;
    slider_container: HTMLElement;
    readout: HTMLDivElement;
    model: IntSliderModel;
    _parse_value: typeof parseInt;
}
export declare class IntRangeSliderView extends BaseIntSliderView {
    update(options?: any): void;
    /**
     * Write value to a string
     */
    valueToString(value: number[]): string;
    /**
     * Parse value from a string
     */
    stringToValue(text: string): number[];
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
    handleSliderChange(e: any, ui: {
        values: number[];
    }): void;
    /**
     * Called when the slider value has changed.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    handleSliderChanged(e: Event, ui: {
        values: number[];
    }): void;
    _range_regex: RegExp;
}
export declare class IntSliderView extends BaseIntSliderView {
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
    handleSliderChange(e: any, ui: {
        value: number;
    }): void;
    /**
     * Called when the slider value has changed.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    handleSliderChanged(e: Event, ui: {
        value?: any;
    }): void;
}
export declare class IntTextModel extends IntModel {
    defaults(): any;
}
export declare class BoundedIntTextModel extends BoundedIntModel {
    defaults(): any;
}
export declare class IntTextView extends DescriptionView {
    render(): void;
    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(options?: any): void;
    events(): {
        'keydown input': string;
        'keypress input': string;
        'keyup input': string;
        'input input': string;
        'change input': string;
    };
    /**
     * Handle key down
     *
     * Stop propagation so the event isn't sent to the application.
     */
    handleKeyDown(e: KeyboardEvent): void;
    /**
     * Handles key press
     */
    handleKeypress(e: KeyboardEvent): void;
    /**
     * Handle key up
     */
    handleKeyUp(e: KeyboardEvent): void;
    /**
     * Call the submit handler if continuous update is true and we are not
     * obviously incomplete.
     */
    handleChanging(e: Event): void;
    /**
     * Applies validated input.
     */
    handleChanged(e: Event): void;
    _parse_value: typeof parseInt;
    _default_step: string;
    textbox: HTMLInputElement;
}
export declare class ProgressStyleModel extends DescriptionStyleModel {
    defaults(): any;
    static styleProperties: {
        bar_color: {
            selector: string;
            attribute: string;
            default: any;
        };
        description_width: {
            selector: string;
            attribute: string;
            default: any;
        };
    };
}
export declare class IntProgressModel extends BoundedIntModel {
    defaults(): any;
}
export declare class ProgressView extends DescriptionView {
    initialize(parameters: any): void;
    render(): void;
    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(): void;
    update_bar_style(): void;
    set_bar_style(): void;
    progress: HTMLDivElement;
    bar: HTMLDivElement;
    static class_map: {
        success: string[];
        info: string[];
        warning: string[];
        danger: string[];
    };
}
export declare class PlayModel extends BoundedIntModel {
    defaults(): any;
    initialize(attributes: any, options: {
        model_id: string;
        comm: any;
        widget_manager: any;
    }): void;
    loop(): void;
    schedule_next(): void;
    stop(): void;
    pause(): void;
    play(): void;
    repeat(): void;
}
export declare class PlayView extends DOMWidgetView {
    render(): void;
    update(): void;
    update_playing(): void;
    update_repeat(): void;
    playButton: HTMLButtonElement;
    pauseButton: HTMLButtonElement;
    stopButton: HTMLButtonElement;
    repeatButton: HTMLButtonElement;
    model: PlayModel;
}
