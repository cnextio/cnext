import { DOMWidgetModel, DOMWidgetView, StyleModel } from '@jupyter-widgets/base';
export declare class DescriptionStyleModel extends StyleModel {
    defaults(): any;
    static styleProperties: {
        description_width: {
            selector: string;
            attribute: string;
            default: any;
        };
    };
}
export declare class DescriptionModel extends DOMWidgetModel {
    defaults(): any;
}
export declare class DescriptionView extends DOMWidgetView {
    render(): void;
    typeset(element: HTMLElement, text?: string): void;
    updateDescription(): void;
    label: HTMLLabelElement;
}
/**
 * For backwards compatibility with jupyter-js-widgets 2.x.
 *
 * Use DescriptionModel instead.
 */
export declare class LabeledDOMWidgetModel extends DescriptionModel {
}
/**
 * For backwards compatibility with jupyter-js-widgets 2.x.
 *
 * Use DescriptionView instead.
 */
export declare class LabeledDOMWidgetView extends DescriptionView {
}
