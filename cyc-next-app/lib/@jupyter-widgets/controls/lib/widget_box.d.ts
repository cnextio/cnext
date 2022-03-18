import { DOMWidgetView, unpack_models, ViewList, JupyterPhosphorPanelWidget, WidgetModel } from '@jupyter-widgets/base';
import { CoreDOMWidgetModel } from './widget_core';
export declare class BoxModel extends CoreDOMWidgetModel {
    defaults(): any;
    static serializers: {
        children: {
            deserialize: typeof unpack_models;
        };
    };
}
export declare class HBoxModel extends BoxModel {
    defaults(): any;
}
export declare class VBoxModel extends BoxModel {
    defaults(): any;
}
export declare class BoxView extends DOMWidgetView {
    _createElement(tagName: string): HTMLElement;
    _setElement(el: HTMLElement): void;
    initialize(parameters: any): void;
    render(): void;
    update_children(): void;
    update_box_style(): void;
    set_box_style(): void;
    add_child_model(model: WidgetModel): Promise<DOMWidgetView>;
    remove(): void;
    children_views: ViewList<DOMWidgetView>;
    pWidget: JupyterPhosphorPanelWidget;
    static class_map: {
        success: string[];
        info: string[];
        warning: string[];
        danger: string[];
    };
}
export declare class HBoxView extends BoxView {
    /**
     * Public constructor
     */
    initialize(parameters: any): void;
}
export declare class VBoxView extends BoxView {
    /**
     * Public constructor
     */
    initialize(parameters: any): void;
}
export declare class GridBoxView extends BoxView {
    /**
     * Public constructor
     */
    initialize(parameters: any): void;
}
export declare class GridBoxModel extends BoxModel {
    defaults(): any;
}
