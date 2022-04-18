import { CoreDOMWidgetModel } from './widget_core';
import { DOMWidgetView, unpack_models, ViewList, JupyterPhosphorPanelWidget } from '@jupyter-widgets/base';
import { Panel } from '@lumino/widgets';
export declare class ControllerButtonModel extends CoreDOMWidgetModel {
    defaults(): any;
}
/**
 * Very simple view for a gamepad button.
 */
export declare class ControllerButtonView extends DOMWidgetView {
    render(): void;
    update(): void;
    support: HTMLDivElement;
    bar: HTMLDivElement;
    label: HTMLDivElement;
}
export declare class ControllerAxisModel extends CoreDOMWidgetModel {
    defaults(): any;
}
/**
 * Very simple view for a gamepad axis.
 */
export declare class ControllerAxisView extends DOMWidgetView {
    render(): void;
    update(): void;
    support: HTMLDivElement;
    bullet: HTMLDivElement;
    label: HTMLDivElement;
}
export declare class ControllerModel extends CoreDOMWidgetModel {
    static serializers: {
        buttons: {
            deserialize: typeof unpack_models;
        };
        axes: {
            deserialize: typeof unpack_models;
        };
    };
    defaults(): any;
    initialize(attributes: any, options: any): void;
    /**
     * Waits for a gamepad to be connected at the provided index.
     * Once one is connected, it will start the update loop, which
     * populates the update of axes and button values.
     */
    wait_loop(): void;
    /**
     * Given a native gamepad object, returns a promise for a dictionary of
     * controls, of the form
     * {
     *     buttons: list of Button models,
     *     axes: list of Axis models,
     * }
     */
    setup(pad: Gamepad): Promise<import("@jupyter-widgets/base").Dict<ControllerButtonModel[]>>;
    /**
     * Update axes and buttons values, until the gamepad is disconnected.
     * When the gamepad is disconnected, this.reset_gamepad is called.
     */
    update_loop(): void;
    /**
     * Resets the gamepad attributes, and start the wait_loop.
     */
    reset_gamepad(): void;
    /**
     * Creates a gamepad button widget.
     */
    _create_button_model(index: number): Promise<ControllerButtonModel>;
    /**
     * Creates a gamepad axis widget.
     */
    _create_axis_model(index: number): Promise<ControllerAxisModel>;
    readout: string;
}
/**
 * A simple view for a gamepad.
 */
export declare class ControllerView extends DOMWidgetView {
    _createElement(tagName: string): HTMLElement;
    _setElement(el: HTMLElement): void;
    initialize(parameters: any): void;
    render(): void;
    update_label(): void;
    add_button(model: ControllerButtonModel): Promise<ControllerButtonView>;
    add_axis(model: ControllerAxisModel): Promise<ControllerAxisView>;
    remove(): void;
    button_views: ViewList<ControllerButtonView>;
    axis_views: ViewList<ControllerAxisView>;
    label: HTMLDivElement;
    axis_box: Panel;
    button_box: Panel;
    model: ControllerModel;
    pWidget: JupyterPhosphorPanelWidget;
}
