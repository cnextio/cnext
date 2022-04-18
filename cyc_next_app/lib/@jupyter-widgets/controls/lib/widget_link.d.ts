import { WidgetModel, unpack_models } from '@jupyter-widgets/base';
import { CoreWidgetModel } from './widget_core';
export declare class DirectionalLinkModel extends CoreWidgetModel {
    static serializers: {
        target: {
            deserialize: typeof unpack_models;
        };
        source: {
            deserialize: typeof unpack_models;
        };
    };
    defaults(): any;
    initialize(attributes: any, options: {
        model_id: string;
        comm: any;
        widget_manager: any;
    }): void;
    updateValue(sourceModel: WidgetModel, sourceAttr: string, targetModel: WidgetModel, targetAttr: string): void;
    updateBindings(): void;
    cleanup(): void;
    sourceModel: WidgetModel;
    sourceAttr: string;
    targetModel: WidgetModel;
    targetAttr: string;
    private _updating;
}
export declare class LinkModel extends DirectionalLinkModel {
    defaults(): any;
    updateBindings(): void;
    cleanup(): void;
}
