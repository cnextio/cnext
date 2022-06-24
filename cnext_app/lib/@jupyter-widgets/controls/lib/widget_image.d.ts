import { DOMWidgetView } from '@jupyter-widgets/base';
import { CoreDOMWidgetModel } from './widget_core';
export declare class ImageModel extends CoreDOMWidgetModel {
    defaults(): any;
    static serializers: {
        value: {
            serialize: (value: any) => DataView;
        };
    };
}
export declare class ImageView extends DOMWidgetView {
    render(): void;
    update(): void;
    remove(): void;
    /**
     * The default tag name.
     *
     * #### Notes
     * This is a read-only attribute.
     */
    get tagName(): string;
    el: HTMLImageElement;
}
