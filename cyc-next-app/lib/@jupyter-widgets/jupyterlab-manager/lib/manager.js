// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { ManagerBase, shims, serialize_state } from '@jupyter-widgets/base';
import { Widget } from '@lumino/widgets';
import { Signal } from '@lumino/signaling';
import { valid } from 'semver';
import { SemVerCache } from './semvercache';
/**
 * The mime type for a widget view.
 */
export const WIDGET_VIEW_MIMETYPE = 'application/vnd.jupyter.widget-view+json';
/**
 * The mime type for widget state data.
 */
export const WIDGET_STATE_MIMETYPE = 'application/vnd.jupyter.widget-state+json';
/**
 * The class name added to an BackboneViewWrapper widget.
 */
const BACKBONEVIEWWRAPPER_CLASS = 'jp-BackboneViewWrapper';
export class BackboneViewWrapper extends Widget {
    /**
     * Construct a new `Backbone` wrapper widget.
     *
     * @param view - The `Backbone.View` instance being wrapped.
     */
    constructor(view) {
        super();
        this._view = null;
        this._view = view;
        view.on('remove', () => {
            this.dispose();
        });
        this.addClass(BACKBONEVIEWWRAPPER_CLASS);
        this.node.appendChild(view.el);
    }
    onAfterAttach(msg) {
        this._view.trigger('displayed');
    }
    dispose() {
        this._view = null;
        super.dispose();
    }
}
/**
 * A widget manager that returns phosphor widgets.
 */
export class WidgetManager extends ManagerBase {
    constructor(context, rendermime, settings) {
        var _a, _b;
        super();
        this._registry = new SemVerCache();
        this._restored = new Signal(this);
        this._restoredStatus = false;
        this._initialRestoredStatus = false;
        this._modelsSync = new Map();
        this._onUnhandledIOPubMessage = new Signal(this);
        this._context = context;
        this._rendermime = rendermime;
        // Set _handleCommOpen so `this` is captured.
        this._handleCommOpen = async (comm, msg) => {
            let oldComm = new shims.services.Comm(comm);
            await this.handle_comm_open(oldComm, msg);
        };
        context.sessionContext.kernelChanged.connect((sender, args) => {
            this._handleKernelChanged(args);
        });
        context.sessionContext.statusChanged.connect((sender, args) => {
            this._handleKernelStatusChange(args);
        });
        context.sessionContext.connectionStatusChanged.connect((sender, args) => {
            this._handleKernelConnectionStatusChange(args);
        });
        if ((_a = context.sessionContext.session) === null || _a === void 0 ? void 0 : _a.kernel) {
            this._handleKernelChanged({ name: 'kernel', oldValue: null, newValue: (_b = context.sessionContext.session) === null || _b === void 0 ? void 0 : _b.kernel });
        }
        this.restoreWidgets(this._context.model);
        this._settings = settings;
        context.saveState.connect((sender, saveState) => {
            if (saveState === 'started' && settings.saveState) {
                this._saveState();
            }
        });
    }
    /**
     * Save the widget state to the context model.
     */
    _saveState() {
        const state = this.get_state_sync({ drop_defaults: true });
        this._context.model.metadata.set('widgets', {
            'application/vnd.jupyter.widget-state+json': state
        });
    }
    /**
     * Default callback handler to emit unhandled kernel messages.
     */
    callbacks(view) {
        return {
            iopub: {
                output: (msg) => {
                    this._onUnhandledIOPubMessage.emit(msg);
                }
            }
        };
    }
    /**
     * Register a new kernel
     */
    _handleKernelChanged({ oldValue, newValue }) {
        if (oldValue) {
            oldValue.removeCommTarget(this.comm_target_name, this._handleCommOpen);
        }
        if (newValue) {
            newValue.registerCommTarget(this.comm_target_name, this._handleCommOpen);
        }
    }
    _handleKernelConnectionStatusChange(status) {
        if (status === 'connected') {
            // Only restore if our initial restore at construction is finished
            if (this._initialRestoredStatus) {
                // We only want to restore widgets from the kernel, not ones saved in the notebook.
                this.restoreWidgets(this._context.model, { loadKernel: true, loadNotebook: false });
            }
        }
    }
    _handleKernelStatusChange(status) {
        if (status === 'restarting') {
            this.disconnect();
        }
    }
    /**
     * Restore widgets from kernel and saved state.
     */
    async restoreWidgets(notebook, { loadKernel, loadNotebook } = { loadKernel: true, loadNotebook: true }) {
        if (loadKernel) {
            await this._loadFromKernel();
        }
        if (loadNotebook) {
            await this._loadFromNotebook(notebook);
        }
        this._restoredStatus = true;
        this._initialRestoredStatus = true;
        this._restored.emit();
    }
    /**
     * Disconnect the widget manager from the kernel, setting each model's comm
     * as dead.
     */
    disconnect() {
        super.disconnect();
        this._restoredStatus = false;
    }
    async _loadFromKernel() {
        var _a;
        if (!this.context.sessionContext) {
            return;
        }
        await this.context.sessionContext.ready;
        if (((_a = this.context.sessionContext.session) === null || _a === void 0 ? void 0 : _a.kernel.handleComms) === false) {
            return;
        }
        return super._loadFromKernel();
    }
    /**
     * Load widget state from notebook metadata
     */
    async _loadFromNotebook(notebook) {
        const widget_md = notebook.metadata.get('widgets');
        // Restore any widgets from saved state that are not live
        if (widget_md && widget_md[WIDGET_STATE_MIMETYPE]) {
            let state = widget_md[WIDGET_STATE_MIMETYPE];
            state = this.filterExistingModelState(state);
            await this.set_state(state);
        }
    }
    /**
     * Return a phosphor widget representing the view
     */
    async display_view(msg, view, options) {
        return view.pWidget || new BackboneViewWrapper(view);
    }
    /**
     * Create a comm.
     */
    async _create_comm(target_name, model_id, data, metadata, buffers) {
        var _a;
        let kernel = (_a = this._context.sessionContext.session) === null || _a === void 0 ? void 0 : _a.kernel;
        if (!kernel) {
            throw new Error('No current kernel');
        }
        let comm = kernel.createComm(target_name, model_id);
        if (data || metadata) {
            comm.open(data, metadata, buffers);
        }
        return new shims.services.Comm(comm);
    }
    /**
     * Get the currently-registered comms.
     */
    async _get_comm_info() {
        var _a;
        let kernel = (_a = this._context.sessionContext.session) === null || _a === void 0 ? void 0 : _a.kernel;
        if (!kernel) {
            throw new Error('No current kernel');
        }
        const reply = await kernel.requestCommInfo({ target_name: this.comm_target_name });
        if (reply.content.status === 'ok') {
            return reply.content.comms;
        }
        else {
            return {};
        }
    }
    /**
     * Get whether the manager is disposed.
     *
     * #### Notes
     * This is a read-only property.
     */
    get isDisposed() {
        return this._context === null;
    }
    /**
     * Dispose the resources held by the manager.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        if (this._commRegistration) {
            this._commRegistration.dispose();
        }
        this._context = null;
    }
    /**
     * Resolve a URL relative to the current notebook location.
     */
    async resolveUrl(url) {
        const partial = await this.context.urlResolver.resolveUrl(url);
        return this.context.urlResolver.getDownloadUrl(partial);
    }
    /**
     * Load a class and return a promise to the loaded object.
     */
    async loadClass(className, moduleName, moduleVersion) {
        // Special-case the Jupyter base and controls packages. If we have just a
        // plain version, with no indication of the compatible range, prepend a ^ to
        // get all compatible versions. We may eventually apply this logic to all
        // widget modules. See issues #2006 and #2017 for more discussion.
        if ((moduleName === '@jupyter-widgets/base'
            || moduleName === '@jupyter-widgets/controls')
            && valid(moduleVersion)) {
            moduleVersion = `^${moduleVersion}`;
        }
        const mod = this._registry.get(moduleName, moduleVersion);
        if (!mod) {
            throw new Error(`Module ${moduleName}, semver range ${moduleVersion} is not registered as a widget module`);
        }
        let module;
        if (typeof mod === 'function') {
            module = await mod();
        }
        else {
            module = await mod;
        }
        const cls = module[className];
        if (!cls) {
            throw new Error(`Class ${className} not found in module ${moduleName}`);
        }
        return cls;
    }
    get context() {
        return this._context;
    }
    get rendermime() {
        return this._rendermime;
    }
    /**
     * A signal emitted when state is restored to the widget manager.
     *
     * #### Notes
     * This indicates that previously-unavailable widget models might be available now.
     */
    get restored() {
        return this._restored;
    }
    /**
     * Whether the state has been restored yet or not.
     */
    get restoredStatus() {
        return this._restoredStatus;
    }
    /**
     * A signal emitted for unhandled iopub kernel messages.
     *
     */
    get onUnhandledIOPubMessage() {
        return this._onUnhandledIOPubMessage;
    }
    register(data) {
        this._registry.set(data.name, data.version, data.exports);
    }
    /**
     * Get a model
     *
     * #### Notes
     * Unlike super.get_model(), this implementation always returns a promise and
     * never returns undefined. The promise will reject if the model is not found.
     */
    async get_model(model_id) {
        const modelPromise = super.get_model(model_id);
        if (modelPromise === undefined) {
            throw new Error('widget model not found');
        }
        return modelPromise;
    }
    /**
     * Register a widget model.
     */
    register_model(model_id, modelPromise) {
        super.register_model(model_id, modelPromise);
        // Update the synchronous model map
        modelPromise.then(model => {
            this._modelsSync.set(model_id, model);
            model.once('comm:close', () => {
                this._modelsSync.delete(model_id);
            });
        });
        this.setDirty();
    }
    /**
     * Close all widgets and empty the widget state.
     * @return Promise that resolves when the widget state is cleared.
     */
    async clear_state() {
        await super.clear_state();
        this._modelsSync = new Map();
        this.setDirty();
    }
    /**
     * Synchronously get the state of the live widgets in the widget manager.
     *
     * This includes all of the live widget models, and follows the format given in
     * the @jupyter-widgets/schema package.
     *
     * @param options - The options for what state to return.
     * @returns Promise for a state dictionary
     */
    get_state_sync(options = {}) {
        const models = [];
        for (let model of this._modelsSync.values()) {
            if (model.comm_live) {
                models.push(model);
            }
        }
        return serialize_state(models, options);
    }
    /**
     * Set the dirty state of the notebook model if applicable.
     *
     * TODO: perhaps should also set dirty when any model changes any data
     */
    setDirty() {
        if (this._settings.saveState) {
            this._context.model.dirty = true;
        }
    }
}
