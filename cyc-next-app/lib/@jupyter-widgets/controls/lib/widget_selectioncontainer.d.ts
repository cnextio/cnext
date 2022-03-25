import { DOMWidgetView, ViewList, JupyterPhosphorWidget, WidgetModel } from '@jupyter-widgets/base';
import { BoxModel } from './widget_box';
import { TabBar } from '@lumino/widgets';
import { TabPanel } from './phosphor/tabpanel';
import { Accordion } from './phosphor/accordion';
import { Widget } from '@lumino/widgets';
import { Message } from '@lumino/messaging';
export declare class SelectionContainerModel extends BoxModel {
    defaults(): any;
}
export declare class AccordionModel extends SelectionContainerModel {
    defaults(): any;
}
export declare class JupyterPhosphorAccordionWidget extends Accordion {
    constructor(options: JupyterPhosphorWidget.IOptions & Accordion.IOptions);
    /**
     * Process the phosphor message.
     *
     * Any custom phosphor widget used inside a Jupyter widget should override
     * the processMessage function like this.
     */
    processMessage(msg: Message): void;
    /**
     * Dispose the widget.
     *
     * This causes the view to be destroyed as well with 'remove'
     */
    dispose(): void;
    private _view;
}
export declare class AccordionView extends DOMWidgetView {
    _createElement(tagName: string): HTMLElement;
    _setElement(el: HTMLElement): void;
    initialize(parameters: any): void;
    /**
     * Called when view is rendered.
     */
    render(): void;
    /**
     * Update children
     */
    updateChildren(): void;
    /**
     * Set header titles
     */
    update_titles(): void;
    /**
     * Make the rendering and selected index consistent.
     */
    update_selected_index(): void;
    /**
     * Called when a child is removed from children list.
     */
    remove_child_view(view: DOMWidgetView): void;
    /**
     * Called when a child is added to children list.
     */
    add_child_view(model: WidgetModel, index: number): Promise<DOMWidgetView>;
    remove(): void;
    children_views: ViewList<DOMWidgetView>;
    pWidget: Accordion;
    updatingChildren: boolean;
}
export declare class TabModel extends SelectionContainerModel {
    defaults(): any;
}
export declare class JupyterPhosphorTabPanelWidget extends TabPanel {
    constructor(options: JupyterPhosphorWidget.IOptions & TabPanel.IOptions);
    /**
     * Dispose the widget.
     *
     * This causes the view to be destroyed as well with 'remove'
     */
    dispose(): void;
    private _view;
}
export declare class TabView extends DOMWidgetView {
    _createElement(tagName: string): HTMLElement;
    _setElement(el: HTMLElement): void;
    /**
     * Public constructor.
     */
    initialize(parameters: any): void;
    /**
     * Called when view is rendered.
     */
    render(): void;
    /**
     * Render tab views based on the current model's children.
     */
    updateTabs(): void;
    /**
     * Called when a child is added to children list.
     */
    addChildView(model: WidgetModel, index: number): Promise<DOMWidgetView>;
    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(): void;
    /**
     * Updates the tab page titles.
     */
    updateTitles(): void;
    /**
     * Updates the selected index.
     */
    updateSelectedIndex(): void;
    remove(): void;
    _onTabChanged(sender: TabBar<Widget>, args: TabBar.ICurrentChangedArgs<Widget>): void;
    /**
     * Handle the `tabMoved` signal from the tab bar.
     */
    _onTabMoved(sender: TabBar<Widget>, args: TabBar.ITabMovedArgs<Widget>): void;
    updatingTabs: boolean;
    childrenViews: ViewList<DOMWidgetView>;
    pWidget: JupyterPhosphorTabPanelWidget;
}
