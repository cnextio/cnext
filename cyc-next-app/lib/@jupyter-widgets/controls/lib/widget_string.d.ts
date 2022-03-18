import { CoreDescriptionModel } from './widget_core';
import { DescriptionView } from './widget_description';
export declare class StringModel extends CoreDescriptionModel {
    defaults(): any;
}
export declare class HTMLModel extends StringModel {
    defaults(): any;
}
export declare class HTMLView extends DescriptionView {
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
    content: HTMLDivElement;
}
export declare class HTMLMathModel extends StringModel {
    defaults(): any;
}
export declare class HTMLMathView extends DescriptionView {
    /**
     * Called when view is rendered.
     */
    render(): void;
    /**
     * Update the contents of this view
     */
    update(): void;
    content: HTMLDivElement;
}
export declare class LabelModel extends StringModel {
    defaults(): any;
}
export declare class LabelView extends DescriptionView {
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
}
export declare class TextareaModel extends StringModel {
    defaults(): any;
}
export declare class TextareaView extends DescriptionView {
    /**
     * Called when view is rendered.
     */
    render(): void;
    update_placeholder(value?: string): void;
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
        'input textarea': string;
        'change textarea': string;
    };
    /**
     * Handle key down
     *
     * Stop propagation so the event isn't sent to the application.
     */
    handleKeyDown(e: Event): void;
    /**
     * Handles key press
     *
     * Stop propagation so the keypress isn't sent to the application.
     */
    handleKeypress(e: Event): void;
    /**
     * Triggered on input change
     */
    handleChanging(e: Event): void;
    /**
     * Sync the value with the kernel.
     *
     * @param e Event
     */
    handleChanged(e: Event): void;
    textbox: HTMLTextAreaElement;
}
export declare class TextModel extends StringModel {
    defaults(): any;
}
export declare class TextView extends DescriptionView {
    /**
     * Called when view is rendered.
     */
    render(): void;
    update_placeholder(value?: string): void;
    update_title(): void;
    update(options?: any): void;
    events(): {
        'keydown input': string;
        'keypress input': string;
        'input input': string;
        'change input': string;
    };
    /**
     * Handle key down
     *
     * Stop propagation so the keypress isn't sent to the application.
     */
    handleKeyDown(e: Event): void;
    /**
     * Handles text submission
     */
    handleKeypress(e: KeyboardEvent): void;
    /**
     * Handles user input.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    handleChanging(e: Event): void;
    /**
     * Handles user input.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    handleChanged(e: Event): void;
    protected readonly inputType: string;
    textbox: HTMLInputElement;
}
export declare class PasswordModel extends TextModel {
    defaults(): any;
}
export declare class PasswordView extends TextView {
    protected readonly inputType: string;
}
/**
 * Combobox widget model class.
 */
export declare class ComboboxModel extends TextModel {
    defaults(): any;
}
/**
 * Combobox widget view class.
 */
export declare class ComboboxView extends TextView {
    render(): void;
    update(options?: any): void;
    isValid(value: string): boolean;
    handleChanging(e: KeyboardEvent): void;
    handleChanged(e: KeyboardEvent): void;
    highlightValidState(valid: boolean): void;
    datalist: HTMLDataListElement | undefined;
    isInitialRender: boolean;
}
