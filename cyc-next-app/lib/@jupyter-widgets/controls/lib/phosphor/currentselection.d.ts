import { ISignal } from '@lumino/signaling';
export declare class Selection<T> {
    constructor(sequence: ReadonlyArray<T>, options?: Selection.IOptions);
    /**
     * A signal emitted when the current item is changed.
     *
     * #### Notes
     * This signal is emitted when the currently selected item is changed either
     * through user or programmatic interaction.
     *
     * Notably, this signal is not emitted when the index of the current item
     * changes due to other items being inserted, removed, or moved, but the
     * current item remains the same. It is only emitted when the actual current
     * item is changed.
     */
    get selectionChanged(): ISignal<Selection<T>, Selection.ISelectionChangedArgs<T>>;
    /**
     * Adjust for setting an item.
     *
     * This should be called *after* the set.
     *
     * @param index - The index set.
     * @param oldValue - The old value at the index.
     */
    adjustSelectionForSet(index: number): void;
    /**
     * Get the currently selected item.
     *
     * #### Notes
     * This will be `null` if no item is selected.
     */
    get value(): T;
    /**
     * Set the currently selected item.
     *
     * #### Notes
     * If the item does not exist in the vector, the currentValue will be set to
     * `null`. This selects the first entry equal to the desired item.
     */
    set value(value: T);
    /**
     * Get the index of the currently selected item.
     *
     * #### Notes
     * This will be `null` if no item is selected.
     */
    get index(): number | null;
    /**
     * Set the index of the currently selected tab.
     *
     * @param index - The index to select.
     *
     * #### Notes
     * If the value is out of range, the index will be set to `null`, which
     * indicates no item is selected.
     */
    set index(index: number | null);
    /**
     * Get the selection behavior when inserting a tab.
     */
    get insertBehavior(): Selection.InsertBehavior;
    /**
     * Set the selection behavior when inserting a tab.
     */
    set insertBehavior(value: Selection.InsertBehavior);
    /**
     * Get the selection behavior when removing a tab.
     */
    get removeBehavior(): Selection.RemoveBehavior;
    /**
     * Set the selection behavior when removing a tab.
     */
    set removeBehavior(value: Selection.RemoveBehavior);
    /**
     * Adjust the current index for a tab insert operation.
     *
     * @param i - The new index of the inserted item.
     * @param j - The inserted item.
     *
     * #### Notes
     * This method accounts for the tab bar's insertion behavior when adjusting
     * the current index and emitting the changed signal. This should be called
     * after the insertion.
     */
    adjustSelectionForInsert(i: number, item: T): void;
    /**
     * Adjust the current index for move operation.
     *
     * @param i - The previous index of the item.
     * @param j - The new index of the item.
     *
     * #### Notes
     * This method will not cause the actual current item to change. It silently
     * adjusts the current index to account for the given move.
     */
    adjustSelectionForMove(i: number, j: number): void;
    /**
     * Clear the selection and history.
     */
    clearSelection(): void;
    /**
     * Adjust the current index for an item remove operation.
     *
     * @param i - The former index of the removed item.
     * @param item - The removed item.
     *
     * #### Notes
     * This method accounts for the remove behavior when adjusting the current
     * index and emitting the changed signal. It should be called after the item
     * is removed.
     */
    adjustSelectionForRemove(i: number, item: T): void;
    /**
     * Set the current value based on the current index.
     */
    private _updateSelectedValue;
    private _array;
    private _index;
    private _value;
    private _previousValue;
    private _insertBehavior;
    private _removeBehavior;
    private _selectionChanged;
}
export declare namespace Selection {
    /**
     * An options object for creating a tab bar.
     */
    interface IOptions {
        /**
         * The selection behavior when inserting a tab.
         *
         * The default is `'select-tab-if-needed'`.
         */
        insertBehavior?: Selection.InsertBehavior;
        /**
         * The selection behavior when removing a tab.
         *
         * The default is `'select-tab-after'`.
         */
        removeBehavior?: Selection.RemoveBehavior;
    }
    /**
     * The arguments object for the `currentChanged` signal.
     */
    interface ISelectionChangedArgs<T> {
        /**
         * The previously selected index.
         */
        previousIndex: number;
        /**
         * The previous selected item.
         */
        previousValue: T;
        /**
         * The currently selected index.
         */
        currentIndex: number;
        /**
         * The currently selected item.
         */
        currentValue: T;
    }
    /**
     * A type alias for the selection behavior on item insert.
     */
    type InsertBehavior = (
    /**
     * The selected item will not be changed.
     */
    'none' | 
    /**
     * The inserted item will be selected.
     */
    'select-item' | 
    /**
     * The inserted item will be selected if the current item is null.
     */
    'select-item-if-needed');
    /**
     * A type alias for the selection behavior on item remove.
     */
    type RemoveBehavior = (
    /**
     * No item will be selected.
     */
    'none' | 
    /**
     * The item after the removed item will be selected if possible.
     */
    'select-item-after' | 
    /**
     * The item before the removed item will be selected if possible.
     */
    'select-item-before' | 
    /**
     * The previously selected item will be selected if possible.
     */
    'select-previous-item');
}
