import { DOMWidgetModel, WidgetModel } from '@jupyter-widgets/base';
import { DescriptionModel } from './widget_description';
export declare class CoreWidgetModel extends WidgetModel {
    defaults(): any;
}
export declare class CoreDOMWidgetModel extends DOMWidgetModel {
    defaults(): any;
}
export declare class CoreDescriptionModel extends DescriptionModel {
    defaults(): any;
}
