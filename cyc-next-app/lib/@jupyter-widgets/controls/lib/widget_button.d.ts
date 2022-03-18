import { DOMWidgetView, StyleModel } from '@jupyter-widgets/base';
import { CoreDOMWidgetModel } from './widget_core';
export declare class ButtonStyleModel extends StyleModel {
    defaults(): any;
    static styleProperties: {
        button_color: {
            selector: string;
            attribute: string;
            default: any;
        };
        font_weight: {
            selector: string;
            attribute: string;
            default: string;
        };
    };
}
export declare class ButtonModel extends CoreDOMWidgetModel {
    defaults(): any;
}
export declare class ButtonView extends DOMWidgetView {
    /**
     * Called when view is rendered.
     */
    render(): void;
    /**
     * Update the contents of this view
     *
     * Called when the model is changed. The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(): void;
    update_button_style(): void;
    set_button_style(): void;
    /**
     * Dictionary of events and handlers
     */
    events(): {
        [e: string]: string;
    };
    /**
     * Handles when the button is clicked.
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
