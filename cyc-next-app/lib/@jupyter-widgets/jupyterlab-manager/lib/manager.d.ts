import * as Backbone from 'backbone';
import { ManagerBase, IClassicComm, IWidgetRegistryData, WidgetModel, WidgetView, IStateOptions } from '@jupyter-widgets/base';
import { IDisposable } from '@lumino/disposable';
import { Widget } from '@lumino/widgets';
import { INotebookModel } from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { Kernel, KernelMessage, Session } from '@jupyterlab/services';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { ISignal } from '@lumino/signaling';
/**
 * The mime type for a widget view.
 */
export declare const WIDGET_VIEW_MIMETYPE = "application/vnd.jupyter.widget-view+json";
/**
 * The mime type for widget state data.
 */
export declare const WIDGET_STATE_MIMETYPE = "application/vnd.jupyter.widget-state+json";
export declare class BackboneViewWrapper extends Widget {
    /**
     * Construct a new `Backbone` wrapper widget.
     *
     * @param view - The `Backbone.View` instance being wrapped.
     */
    constructor(view: Backbone.View<any>);
    onAfterAttach(msg: any): void;
    dispose(): void;
    private _view;
}
/**
 * A widget manager that returns phosphor widgets.
 */
export declare class WidgetManager extends ManagerBase<Widget> implements IDisposable {
    constructor(context: DocumentRegistry.IContext<INotebookModel>, rendermime: IRenderMimeRegistry, settings: WidgetManager.Settings);
    /**
     * Save the widget state to the context model.
     */
    private _saveState;
    /**
     * Default callback handler to emit unhandled kernel messages.
     */
    callbacks(view?: WidgetView): {
        iopub: {
            output: (msg: KernelMessage.IIOPubMessage) => void;
        };
    };
    /**
     * Register a new kernel
     */
    _handleKernelChanged({ oldValue, newValue }: Session.ISessionConnection.IKernelChangedArgs): void;
    _handleKernelConnectionStatusChange(status: Kernel.ConnectionStatus): void;
    _handleKernelStatusChange(status: Kernel.Status): void;
    /**
     * Restore widgets from kernel and saved state.
     */
    restoreWidgets(notebook: INotebookModel, { loadKernel, loadNotebook }?: {
        loadKernel: boolean;
        loadNotebook: boolean;
    }): Promise<void>;
    /**
     * Disconnect the widget manager from the kernel, setting each model's comm
     * as dead.
     */
    disconnect(): void;
    _loadFromKernel(): Promise<void>;
    /**
     * Load widget state from notebook metadata
     */
    _loadFromNotebook(notebook: INotebookModel): Promise<void>;
    /**
     * Return a phosphor widget representing the view
     */
    display_view(msg: any, view: Backbone.View<Backbone.Model>, options: any): Promise<Widget>;
    /**
     * Create a comm.
     */
    _create_comm(target_name: string, model_id: string, data?: any, metadata?: any, buffers?: ArrayBuffer[] | ArrayBufferView[]): Promise<IClassicComm>;
    /**
     * Get the currently-registered comms.
     */
    _get_comm_info(): Promise<any>;
    /**
     * Get whether the manager is disposed.
     *
     * #### Notes
     * This is a read-only property.
     */
    get isDisposed(): boolean;
    /**
     * Dispose the resources held by the manager.
     */
    dispose(): void;
    /**
     * Resolve a URL relative to the current notebook location.
     */
    resolveUrl(url: string): Promise<string>;
    /**
     * Load a class and return a promise to the loaded object.
     */
    protected loadClass(className: string, moduleName: string, moduleVersion: string): Promise<typeof WidgetModel | typeof WidgetView>;
    get context(): DocumentRegistry.IContext<INotebookModel>;
    get rendermime(): IRenderMimeRegistry;
    /**
     * A signal emitted when state is restored to the widget manager.
     *
     * #### Notes
     * This indicates that previously-unavailable widget models might be available now.
     */
    get restored(): ISignal<this, void>;
    /**
     * Whether the state has been restored yet or not.
     */
    get restoredStatus(): boolean;
    /**
     * A signal emitted for unhandled iopub kernel messages.
     *
     */
    get onUnhandledIOPubMessage(): ISignal<this, KernelMessage.IIOPubMessage>;
    register(data: IWidgetRegistryData): void;
    /**
     * Get a model
     *
     * #### Notes
     * Unlike super.get_model(), this implementation always returns a promise and
     * never returns undefined. The promise will reject if the model is not found.
     */
    get_model(model_id: string): Promise<WidgetModel>;
    /**
     * Register a widget model.
     */
    register_model(model_id: string, modelPromise: Promise<WidgetModel>): void;
    /**
     * Close all widgets and empty the widget state.
     * @return Promise that resolves when the widget state is cleared.
     */
    clear_state(): Promise<void>;
    /**
     * Synchronously get the state of the live widgets in the widget manager.
     *
     * This includes all of the live widget models, and follows the format given in
     * the @jupyter-widgets/schema package.
     *
     * @param options - The options for what state to return.
     * @returns Promise for a state dictionary
     */
    get_state_sync(options?: IStateOptions): {
        version_major: number;
        version_minor: number;
        state: {
            [key: string]: any;
        };
    };
    /**
     * Set the dirty state of the notebook model if applicable.
     *
     * TODO: perhaps should also set dirty when any model changes any data
     */
    setDirty(): void;
    private _handleCommOpen;
    private _context;
    private _registry;
    private _rendermime;
    _commRegistration: IDisposable;
    private _restored;
    private _restoredStatus;
    private _initialRestoredStatus;
    private _modelsSync;
    private _settings;
    private _onUnhandledIOPubMessage;
}
export declare namespace WidgetManager {
    type Settings = {
        saveState: boolean;
    };
}
