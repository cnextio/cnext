import { CoreDescriptionModel } from './widget_core';
import { DescriptionView } from './widget_description';
import { DOMWidgetView } from '@jupyter-widgets/base';
export declare class BoolModel extends CoreDescriptionModel {
    defaults(): any;
}
export declare class CheckboxModel extends CoreDescriptionModel {
    defaults(): any;
}
export declare class CheckboxView extends DescriptionView {
    /**
     * Called when view is rendered.
     */
    render(): void;
    /**
     * Overriden from super class
     *
     * Update the description span (rather than the label) since
     * we want the description to the right of the checkbox.
     */
    updateDescription(): void;
    /**
     * Update the visibility of the label in the super class
     * to provide the optional indent.
     */
    updateIndent(): void;
    events(): {
        [e: string]: string;
    };
    /**
     * Handles when the checkbox is clicked.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    _handle_click(): void;
    /**
     * Update the contents of this view
     *
     * Called when the model is changed. The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(options?: any): void;
    checkbox: HTMLInputElement;
    checkboxLabel: HTMLLabelElement;
    descriptionSpan: HTMLSpanElement;
}
export declare class ToggleButtonModel extends BoolModel {
    defaults(): any;
}
export declare class ToggleButtonView extends DOMWidgetView {
    /**
     * Called when view is rendered.
     */
    render(): void;
    update_button_style(): void;
    set_button_style(): void;
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
    /**
     * Handles and validates user input.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    _handle_click(event: MouseEvent): void;
    /**
     * The default tag name.
     *
     * #### Notes
     * This is a read-only attribute.
     */
    get tagName(): string;
    el: HTMLButtonElement;
    static class_map: {
        primary: string[];
        success: string[];
        info: string[];
        warning: string[];
        danger: string[];
    };
}
export declare class ValidModel extends BoolModel {
    defaults(): any;
}
export declare class ValidView extends DescriptionView {
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
    update(): void;
    readout: HTMLSpanElement;
    icon: HTMLElement;
}
