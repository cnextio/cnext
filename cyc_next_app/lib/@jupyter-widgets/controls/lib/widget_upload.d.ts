import { CoreDOMWidgetModel } from './widget_core';
import { DOMWidgetView } from '@jupyter-widgets/base';
export declare class FileUploadModel extends CoreDOMWidgetModel {
    defaults(): any;
    static serializers: {
        data: {
            serialize: (buffers: any) => any[];
        };
    };
}
export declare class FileUploadView extends DOMWidgetView {
    el: HTMLButtonElement;
    fileInput: HTMLInputElement;
    fileReader: FileReader;
    get tagName(): string;
    render(): void;
    update(): void;
    update_button_style(): void;
    set_button_style(): void;
    static class_map: {
        primary: string[];
        success: string[];
        info: string[];
        warning: string[];
        danger: string[];
    };
}
