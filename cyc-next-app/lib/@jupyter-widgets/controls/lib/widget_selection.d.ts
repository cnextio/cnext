import { CoreDescriptionModel } from './widget_core';
import { DescriptionView, DescriptionStyleModel } from './widget_description';
export declare class SelectionModel extends CoreDescriptionModel {
    defaults(): any;
}
export declare class DropdownModel extends SelectionModel {
    defaults(): any;
}
export declare class DropdownView extends DescriptionView {
    /**
     * Public constructor.
     */
    initialize(parameters: any): void;
    /**
     * Called when view is rendered.
     */
    render(): void;
    /**
     * Update the contents of this view
     */
    update(): void;
    _updateOptions(): void;
    events(): {
        [e: string]: string;
    };
    /**
     * Handle when a new value is selected.
     */
    _handle_change(): void;
    listbox: HTMLSelectElement;
}
export declare class SelectModel extends SelectionModel {
    defaults(): any;
}
export declare class SelectView extends DescriptionView {
    /**
     * Public constructor.
     */
    initialize(parameters: any): void;
    /**
     * Called when view is rendered.
     */
    render(): void;
    /**
     * Update the contents of this view
     */
    update(): void;
    updateSelection(options?: any): void;
    _updateOptions(): void;
    events(): {
        [e: string]: string;
    };
    /**
     * Handle when a new value is selected.
     */
    _handle_change(): void;
    listbox: HTMLSelectElement;
}
export declare class RadioButtonsModel extends SelectionModel {
    defaults(): any;
}
export declare class RadioButtonsView extends DescriptionView {
    /**
     * Called when view is rendered.
     */
    render(): void;
    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(options?: any): void;
    /**
     * Adjust Padding to Multiple of Line Height
     *
     * Adjust margins so that the overall height
     * is a multiple of a single line height.
     *
     * This widget needs it because radio options
     * are spaced tighter than individual widgets
     * yet we would like the full widget line up properly
     * when displayed side-by-side with other widgets.
     */
    adjustPadding(e: this): void;
    events(): {
        [e: string]: string;
    };
    /**
     * Handle when a value is clicked.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    _handle_click(event: Event): void;
    container: HTMLDivElement;
}
export declare class ToggleButtonsStyleModel extends DescriptionStyleModel {
    defaults(): any;
    static styleProperties: {
        button_width: {
            selector: string;
            attribute: string;
            default: any;
        };
        font_weight: {
            selector: string;
            attribute: string;
            default: string;
        };
        description_width: {
            selector: string;
            attribute: string;
            default: any;
        };
    };
}
export declare class ToggleButtonsModel extends SelectionModel {
    defaults(): any;
}
export declare class ToggleButtonsView extends DescriptionView {
    initialize(options: any): void;
    /**
     * Called when view is rendered.
     */
    render(): void;
    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(options?: any): void;
    update_style_traits(button?: HTMLButtonElement): void;
    update_button_style(): void;
    set_button_style(): void;
    events(): {
        [e: string]: string;
    };
    /**
     * Handle when a value is clicked.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    _handle_click(event: Event): void;
    private _css_state;
    buttongroup: HTMLDivElement;
}
export declare namespace ToggleButtonsView {
    const classMap: {
        primary: string[];
        success: string[];
        info: string[];
        warning: string[];
        danger: string[];
    };
}
export declare class SelectionSliderModel extends SelectionModel {
    defaults(): any;
}
export declare class SelectionSliderView extends DescriptionView {
    /**
     * Called when view is rendered.
     */
    render(): void;
    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(options?: any): void;
    events(): {
        [e: string]: string;
    };
    updateSelection(): void;
    updateReadout(index: any): void;
    /**
     * Called when the slider value is changing.
     */
    handleSliderChange(e: Event, ui: {
        value?: number;
        values?: number[];
    }): void;
    /**
     * Called when the slider value has changed.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    handleSliderChanged(e: Event, ui: {
        value?: number;
        values?: number[];
    }): void;
    $slider: any;
    slider_container: HTMLDivElement;
    readout: HTMLDivElement;
}
export declare class MultipleSelectionModel extends SelectionModel {
    defaults(): any;
}
export declare class SelectMultipleModel extends MultipleSelectionModel {
    defaults(): any;
}
export declare class SelectMultipleView extends SelectView {
    /**
     * Public constructor.
     */
    initialize(parameters: any): void;
    /**
     * Called when view is rendered.
     */
    render(): void;
    updateSelection(options?: any): void;
    /**
     * Handle when a new value is selected.
     */
    _handle_change(): void;
}
export declare class SelectionRangeSliderModel extends MultipleSelectionModel {
    defaults(): any;
}
export declare class SelectionRangeSliderView extends SelectionSliderView {
    /**
     * Called when view is rendered.
     */
    render(): void;
    updateSelection(): void;
    updateReadout(index: number[]): void;
    /**
     * Called when the slider value is changing.
     */
    handleSliderChange(e: Event, ui: {
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
    $slider: any;
    slider_container: HTMLDivElement;
    readout: HTMLDivElement;
}
