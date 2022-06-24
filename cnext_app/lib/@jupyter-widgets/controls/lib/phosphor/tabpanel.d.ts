import { ISignal } from '@lumino/signaling';
import { Panel, TabBar, Widget } from '@lumino/widgets';
/**
 * A panel where visible widgets are stacked atop one another.
 *
 * #### Notes
 * This class provides a convenience wrapper around a [[PanelLayout]].
 */
export declare class EventedPanel extends Panel {
    /**
     * A signal emitted when a widget is removed from the panel.
     */
    get widgetRemoved(): ISignal<EventedPanel, Widget>;
    /**
     * A message handler invoked on a `'child-removed'` message.
     */
    protected onChildRemoved(msg: Widget.ChildMessage): void;
    private _widgetRemoved;
}
/**
 * A widget which combines a `TabBar` and a `EventedPanel`.
 *
 * #### Notes
 * This is a simple panel which handles the common case of a tab bar
 * placed next to a content area. The selected tab controls the widget
 * which is shown in the content area.
 *
 * For use cases which require more control than is provided by this
 * panel, the `TabBar` widget may be used independently.
 *
 * TODO: Support setting the direction??
 */
export declare class TabPanel extends Widget {
    /**
     * Construct a new tab panel.
     *
     * @param options - The options for initializing the tab panel.
     */
    constructor(options?: TabPanel.IOptions);
    /**
     * A signal emitted when the current tab is changed.
     *
     * #### Notes
     * This signal is emitted when the currently selected tab is changed
     * either through user or programmatic interaction.
     *
     * Notably, this signal is not emitted when the index of the current
     * tab changes due to tabs being inserted, removed, or moved. It is
     * only emitted when the actual current tab node is changed.
     */
    get currentChanged(): ISignal<this, TabPanel.ICurrentChangedArgs>;
    /**
     * Get the index of the currently selected tab.
     *
     * #### Notes
     * This will be `null` if no tab is selected.
     */
    get currentIndex(): number | null;
    /**
     * Set the index of the currently selected tab.
     *
     * #### Notes
     * If the index is out of range, it will be set to `null`.
     */
    set currentIndex(value: number | null);
    /**
     * Get the currently selected widget.
     *
     * #### Notes
     * This will be `null` if there is no selected tab.
     */
    get currentWidget(): Widget | null;
    /**
     * Set the currently selected widget.
     *
     * #### Notes
     * If the widget is not in the panel, it will be set to `null`.
     */
    set currentWidget(value: Widget | null);
    /**
     * Get the whether the tabs are movable by the user.
     *
     * #### Notes
     * Tabs can always be moved programmatically.
     */
    get tabsMovable(): boolean;
    /**
     * Set the whether the tabs are movable by the user.
     *
     * #### Notes
     * Tabs can always be moved programmatically.
     */
    set tabsMovable(value: boolean);
    /**
     * The tab bar used by the tab panel.
     *
     * #### Notes
     * Modifying the tab bar directly can lead to undefined behavior.
     */
    readonly tabBar: TabBar<Widget>;
    /**
     * The panel used by the tab panel.
     *
     * #### Notes
     * Modifying the panel directly can lead to undefined behavior.
     */
    readonly tabContents: EventedPanel;
    /**
     * A read-only array of the widgets in the panel.
     */
    get widgets(): ReadonlyArray<Widget>;
    /**
     * Add a widget to the end of the tab panel.
     *
     * @param widget - The widget to add to the tab panel.
     *
     * #### Notes
     * If the widget is already contained in the panel, it will be moved.
     *
     * The widget's `title` is used to populate the tab.
     */
    addWidget(widget: Widget): void;
    /**
     * Insert a widget into the tab panel at a specified index.
     *
     * @param index - The index at which to insert the widget.
     *
     * @param widget - The widget to insert into to the tab panel.
     *
     * #### Notes
     * If the widget is already contained in the panel, it will be moved.
     *
     * The widget's `title` is used to populate the tab.
     */
    insertWidget(index: number, widget: Widget): void;
    /**
     * Handle the `currentChanged` signal from the tab bar.
     */
    private _onCurrentChanged;
    /**
     * Handle the `tabActivateRequested` signal from the tab bar.
     */
    private _onTabActivateRequested;
    /**
     * Handle the `tabCloseRequested` signal from the tab bar.
     */
    private _onTabCloseRequested;
    /**
     * Handle the `tabMoved` signal from the tab bar.
     */
    private _onTabMoved;
    /**
     * Handle the `widgetRemoved` signal from the stacked panel.
     */
    private _onWidgetRemoved;
    private _currentChanged;
}
/**
 * The namespace for the `TabPanel` class statics.
 */
export declare namespace TabPanel {
    /**
     * An options object for initializing a tab panel.
     */
    interface IOptions {
        /**
         * Whether the tabs are movable by the user.
         *
         * The default is `false`.
         */
        tabsMovable?: boolean;
        /**
         * The renderer for the panel's tab bar.
         *
         * The default is a shared renderer instance.
         */
        renderer?: TabBar.IRenderer<Widget>;
    }
    /**
     * The arguments object for the `currentChanged` signal.
     */
    interface ICurrentChangedArgs {
        /**
         * The previously selected index.
         */
        previousIndex: number;
        /**
         * The previously selected widget.
         */
        previousWidget: Widget | null;
        /**
         * The currently selected index.
         */
        currentIndex: number;
        /**
         * The currently selected widget.
         */
        currentWidget: Widget | null;
    }
}
