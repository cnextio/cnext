import { ISignal } from '@lumino/signaling';
import { Panel, Widget } from '@lumino/widgets';
import { Selection } from './currentselection';
/**
 * A panel that supports a collapsible header, made from the widget's title.
 * Clicking on the title expands or contracts the widget.
 */
export declare class Collapse extends Widget {
    constructor(options: Collapse.IOptions);
    dispose(): void;
    get widget(): Widget;
    set widget(widget: Widget);
    get collapsed(): boolean;
    set collapsed(value: boolean);
    toggle(): void;
    get collapseChanged(): ISignal<Collapse, void>;
    private _collapse;
    private _uncollapse;
    /**
     * Handle the DOM events for the Collapse widget.
     *
     * @param event - The DOM event sent to the panel.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the panel's DOM node. It should
     * not be called directly by user code.
     */
    handleEvent(event: Event): void;
    private _evtClick;
    /**
     * Handle the `changed` signal of a title object.
     */
    private _onTitleChanged;
    private _onChildDisposed;
    private _collapseChanged;
    _collapsed: boolean;
    _content: Panel;
    _widget: Widget;
    _header: Widget;
}
export declare namespace Collapse {
    interface IOptions extends Widget.IOptions {
        widget: Widget;
    }
}
/**
 * A panel that supports a collapsible header, made from the widget's title.
 * Clicking on the title expands or contracts the widget.
 */
export declare class Accordion extends Panel {
    constructor(options?: Accordion.IOptions);
    /**
     * A read-only sequence of the widgets in the panel.
     *
     * #### Notes
     * This is a read-only property.
     */
    get collapseWidgets(): ReadonlyArray<Collapse>;
    get selection(): Selection<Collapse>;
    indexOf(widget: Widget): number;
    /**
     * Add a widget to the end of the accordion.
     *
     * @param widget - The widget to add to the accordion.
     *
     * @returns The Collapse widget wrapping the added widget.
     *
     * #### Notes
     * The widget will be wrapped in a CollapsedWidget.
     */
    addWidget(widget: Widget): Widget;
    /**
     * Insert a widget at the specified index.
     *
     * @param index - The index at which to insert the widget.
     *
     * @param widget - The widget to insert into to the accordion.
     *
     * #### Notes
     * If the widget is already contained in the panel, it will be moved.
     */
    insertWidget(index: number, widget: Widget): void;
    removeWidget(widget: Widget): void;
    private _wrapWidget;
    private _onCollapseChange;
    private _onSelectionChanged;
    private _selection;
}
export declare namespace Accordion {
    type IOptions = Panel.IOptions;
}
