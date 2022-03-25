import { WidgetModel, WidgetView } from './widget';
export declare class StyleModel extends WidgetModel {
    defaults(): any;
    static styleProperties: {
        [s: string]: IStyleProperty;
    };
}
interface IStyleProperty {
    attribute: string;
    selector: string;
    default: string;
}
export declare class StyleView extends WidgetView {
    /**
     * Public constructor
     */
    initialize(parameters: WidgetView.InitializeParameters): void;
    /**
     * Register a CSS trait that is known by the model
     * @param trait
     */
    registerTrait(trait: string): void;
    /**
     * Handles when a trait value changes
     */
    handleChange(trait: string, value: any): void;
    /**
     * Apply styles for all registered traits
     */
    style(): void;
    /**
     * Remove the styling from the parent view.
     */
    unstyle(): void;
    private _traitNames;
}
export {};
