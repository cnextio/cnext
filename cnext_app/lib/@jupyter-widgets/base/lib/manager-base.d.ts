import * as services from '@jupyterlab/services';
import { DOMWidgetView, WidgetModel, WidgetView, DOMWidgetModel } from './widget';
import { IClassicComm, ICallbacks } from './services-shim';
/**
 * The control comm target name.
 */
export declare const CONTROL_COMM_TARGET = "jupyter.widget.control";
/**
 * The supported version for the control comm channel.
 */
export declare const CONTROL_COMM_PROTOCOL_VERSION = "1.0.0";
/**
 * Time (in ms) after which we consider the control comm target not responding.
 */
export declare const CONTROL_COMM_TIMEOUT = 4000;
/**
 * The options for a model.
 *
 * #### Notes
 * Either a comm or a model_id must be provided.
 */
export interface ModelOptions {
    /**
     * Target name of the widget model to create.
     */
    model_name: string;
    /**
     * Module name of the widget model to create.
     */
    model_module: string;
    /**
     * Semver version requirement for the model module.
     */
    model_module_version: string;
    /**
     * Target name of the widget view to create.
     */
    view_name?: string;
    /**
     * Module name of the widget view to create.
     */
    view_module?: string;
    /**
     * Semver version requirement for the view module.
     */
    view_module_version?: string;
    /**
     * Comm object associated with the widget.
     */
    comm?: any;
    /**
     * The model id to use. If not provided, the comm id of the comm is used.
     */
    model_id?: string;
}
/**
 * The options for a connected model.
 *
 * This gives all of the information needed to instantiate a comm to a new
 * widget on the kernel side (so view information is mandatory).
 *
 * #### Notes
 * Either a comm or a model_id must be provided.
 */
export interface WidgetOptions {
    /**
     * Target name of the widget model to create.
     */
    model_name: string;
    /**
     * Module name of the widget model to create.
     */
    model_module: string;
    /**
     * Semver version requirement for the model module.
     */
    model_module_version: string;
    /**
     * Target name of the widget view to create.
     */
    view_name: string;
    /**
     * Module name of the widget view to create.
     */
    view_module: string;
    /**
     * Semver version requirement for the view module.
     */
    view_module_version: string;
    /**
     * Comm object associated with the widget.
     */
    comm?: IClassicComm;
    /**
     * The model id to use. If not provided, the comm id of the comm is used.
     */
    model_id?: string;
}
/**
 * Manager abstract base class
 */
export declare abstract class ManagerBase<T> {
    /**
     * Display a DOMWidgetView for a particular model.
     */
    display_model(msg: services.KernelMessage.IMessage, model: DOMWidgetModel, options?: any): Promise<T>;
    /**
     * Display a DOMWidget view.
     *
     * #### Notes
     * This must be implemented by a subclass. The implementation must trigger the view's displayed
     * event after the view is on the page: `view.trigger('displayed')`
     */
    abstract display_view(msg: services.KernelMessage.IMessage, view: DOMWidgetView, options: any): Promise<T>;
    /**
     * Modifies view options. Generally overloaded in custom widget manager
     * implementations.
     */
    setViewOptions(options?: any): any;
    /**
     * Creates a promise for a view of a given model
     *
     * Make sure the view creation is not out of order with
     * any state updates.
     */
    create_view(model: DOMWidgetModel, options: any): Promise<DOMWidgetView>;
    /**
     * callback handlers specific to a view
     */
    callbacks(view?: WidgetView): ICallbacks;
    /**
     * Get a promise for a model by model id.
     *
     * #### Notes
     * If a model is not found, undefined is returned (NOT a promise). However,
     * the calling code should also deal with the case where a rejected promise
     * is returned, and should treat that also as a model not found.
     */
    get_model(model_id: string): Promise<WidgetModel> | undefined;
    /**
     * Returns true if the given model is registered, otherwise false.
     *
     * #### Notes
     * This is a synchronous way to check if a model is registered.
     */
    has_model(model_id: string): boolean;
    /**
     * Handle when a comm is opened.
     */
    handle_comm_open(comm: IClassicComm, msg: services.KernelMessage.ICommOpenMsg): Promise<WidgetModel>;
    /**
     * Create a comm and new widget model.
     * @param  options - same options as new_model but comm is not
     *                          required and additional options are available.
     * @param  serialized_state - serialized model attributes.
     */
    new_widget(options: WidgetOptions, serialized_state?: any): Promise<WidgetModel>;
    register_model(model_id: string, modelPromise: Promise<WidgetModel>): void;
    /**
     * Create and return a promise for a new widget model
     *
     * @param options - the options for creating the model.
     * @param serialized_state - attribute values for the model.
     *
     * @example
     * widget_manager.new_model({
     *      model_name: 'IntSlider',
     *      model_module: '@jupyter-widgets/controls',
     *      model_module_version: '1.0.0',
     *      model_id: 'u-u-i-d'
     * }).then((model) => { console.log('Create success!', model); },
     *  (err) => {console.error(err)});
     *
     */
    new_model(options: ModelOptions, serialized_state?: any): Promise<WidgetModel>;
    _make_model(options: ModelOptions, serialized_state?: any): Promise<WidgetModel>;
    /**
     * Fetch all widgets states from the kernel using the control comm channel
     * If this fails (control comm handler not implemented kernel side),
     * it will fall back to `_loadFromKernelModels`.
     *
     * This is a utility function that can be used in subclasses.
     */
    protected _loadFromKernel(): Promise<void>;
    /**
     * Old implementation of fetching widget models one by one using
     * the request_state message on each comm.
     *
     * This is a utility function that can be used in subclasses.
     */
    protected _loadFromKernelModels(): Promise<void>;
    /**
     * Close all widgets and empty the widget state.
     * @return Promise that resolves when the widget state is cleared.
     */
    clear_state(): Promise<void>;
    /**
     * Asynchronously get the state of the widget manager.
     *
     * This includes all of the widget models, and follows the format given in
     * the @jupyter-widgets/schema package.
     *
     * @param options - The options for what state to return.
     * @returns Promise for a state dictionary
     */
    get_state(options?: IStateOptions): Promise<any>;
    /**
     * Set the widget manager state.
     *
     * @param state - a Javascript object conforming to the application/vnd.jupyter.widget-state+json spec.
     *
     * Reconstructs all of the widget models in the state, merges that with the
     * current manager state, and then attempts to redisplay the widgets in the
     * state.
     */
    set_state(state: any): Promise<WidgetModel[]>;
    /**
     * Disconnect the widget manager from the kernel, setting each model's comm
     * as dead.
     */
    disconnect(): void;
    /**
     * Resolve a URL relative to the current notebook location.
     *
     * The default implementation just returns the original url.
     */
    resolveUrl(url: string): Promise<string>;
    /**
     * The comm target name to register
     */
    readonly comm_target_name = "jupyter.widget";
    /**
     * Load a class and return a promise to the loaded object.
     */
    protected abstract loadClass(className: string, moduleName: string, moduleVersion: string): Promise<typeof WidgetModel | typeof WidgetView>;
    /**
     * Create a comm which can be used for communication for a widget.
     *
     * If the data/metadata is passed in, open the comm before returning (i.e.,
     * send the comm_open message). If the data and metadata is undefined, we
     * want to reconstruct a comm that already exists in the kernel, so do not
     * open the comm by sending the comm_open message.
     *
     * @param comm_target_name Comm target name
     * @param model_id The comm id
     * @param data The initial data for the comm
     * @param metadata The metadata in the open message
     */
    protected abstract _create_comm(comm_target_name: string, model_id: string, data?: any, metadata?: any, buffers?: ArrayBuffer[] | ArrayBufferView[]): Promise<IClassicComm>;
    protected abstract _get_comm_info(): Promise<{}>;
    /**
     * Filter serialized widget state to remove any ID's already present in manager.
     *
     * @param {*} state Serialized state to filter
     *
     * @returns {*} A copy of the state, with its 'state' attribute filtered
     */
    protected filterExistingModelState(serialized_state: any): any;
    /**
     * Dictionary of model ids and model instance promises
     */
    private _models;
}
export interface IStateOptions {
    /**
     * Drop model attributes that are equal to their default value.
     *
     * @default false
     */
    drop_defaults?: boolean;
}
/**
 * Serialize an array of widget models
 *
 * #### Notes
 * The return value follows the format given in the
 * @jupyter-widgets/schema package.
 */
export declare function serialize_state(models: WidgetModel[], options?: IStateOptions): {
    version_major: number;
    version_minor: number;
    state: {
        [key: string]: any;
    };
};
