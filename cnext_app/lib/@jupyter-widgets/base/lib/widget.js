// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import * as utils from './utils';
import * as backbonePatch from './backbone-patch';
import * as Backbone from 'backbone';
import $ from 'jquery';
import { NativeView } from './nativeview';
import { Widget, Panel } from '@lumino/widgets';
import { MessageLoop } from '@lumino/messaging';
import { JUPYTER_WIDGETS_VERSION } from './version';
/**
 * Replace model ids with models recursively.
 */
export function unpack_models(value, manager) {
    if (Array.isArray(value)) {
        var unpacked_1 = [];
        value.forEach(function (sub_value, key) {
            unpacked_1.push(unpack_models(sub_value, manager));
        });
        return Promise.all(unpacked_1);
    }
    else if (value instanceof Object) {
        var unpacked_2 = {};
        Object.keys(value).forEach(function (key) {
            unpacked_2[key] = unpack_models(value[key], manager);
        });
        return utils.resolvePromisesDict(unpacked_2);
    }
    else if (typeof value === 'string' && value.slice(0, 10) === 'IPY_MODEL_') {
        // get_model returns a promise already
        return manager.get_model(value.slice(10, value.length));
    }
    else {
        return Promise.resolve(value);
    }
}
var WidgetModel = /** @class */ (function (_super) {
    __extends(WidgetModel, _super);
    function WidgetModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * The default attributes.
     */
    WidgetModel.prototype.defaults = function () {
        return {
            _model_module: '@jupyter-widgets/base',
            _model_name: 'WidgetModel',
            _model_module_version: JUPYTER_WIDGETS_VERSION,
            _view_module: '@jupyter-widgets/base',
            _view_name: null,
            _view_module_version: JUPYTER_WIDGETS_VERSION,
            _view_count: null,
        };
    };
    /**
     * Test to see if the model has been synced with the server.
     *
     * #### Notes
     * As of backbone 1.1, backbone ignores `patch` if it thinks the
     * model has never been pushed.
     */
    WidgetModel.prototype.isNew = function () {
        return false;
    };
    /**
     * Constructor
     *
     * Initializes a WidgetModel instance. Called by the Backbone constructor.
     *
     * Parameters
     * ----------
     * widget_manager : WidgetManager instance
     * model_id : string
     *      An ID unique to this model.
     * comm : Comm instance (optional)
     */
    WidgetModel.prototype.initialize = function (attributes, options) {
        this._expectedEchoMsgIds = {};
        this._attrsToUpdate = {};
        _super.prototype.initialize.call(this, attributes, options);
        // Attributes should be initialized here, since user initialization may depend on it
        this.widget_manager = options.widget_manager;
        this.model_id = options.model_id;
        var comm = options.comm;
        this.views = Object.create(null);
        this.state_change = Promise.resolve();
        this._closed = false;
        this._state_lock = null;
        this._msg_buffer = null;
        this._msg_buffer_callbacks = null;
        this._pending_msgs = 0;
        // _buffered_state_diff must be created *after* the super.initialize
        // call above. See the note in the set() method below.
        this._buffered_state_diff = {};
        if (comm) {
            // Remember comm associated with the model.
            this.comm = comm;
            // Hook comm messages up to model.
            comm.on_close(this._handle_comm_closed.bind(this));
            comm.on_msg(this._handle_comm_msg.bind(this));
            this.comm_live = true;
        }
        else {
            this.comm_live = false;
        }
    };
    Object.defineProperty(WidgetModel.prototype, "comm_live", {
        get: function () {
            return this._comm_live;
        },
        set: function (x) {
            this._comm_live = x;
            this.trigger('comm_live_update');
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Send a custom msg over the comm.
     */
    WidgetModel.prototype.send = function (content, callbacks, buffers) {
        if (this.comm !== undefined) {
            var data = { method: 'custom', content: content };
            this.comm.send(data, callbacks, {}, buffers);
        }
    };
    /**
     * Close model
     *
     * @param comm_closed - true if the comm is already being closed. If false, the comm will be closed.
     *
     * @returns - a promise that is fulfilled when all the associated views have been removed.
     */
    WidgetModel.prototype.close = function (comm_closed) {
        var _this = this;
        if (comm_closed === void 0) { comm_closed = false; }
        // can only be closed once.
        if (this._closed) {
            return;
        }
        this._closed = true;
        if (this.comm && !comm_closed) {
            this.comm.close();
        }
        this.stopListening();
        this.trigger('destroy', this);
        if (this.comm) {
            delete this.comm;
        }
        // Delete all views of this model
        var views = Object.keys(this.views).map(function (id) {
            return _this.views[id].then(function (view) { return view.remove(); });
        });
        delete this.views;
        return Promise.all(views).then(function () { return; });
    };
    /**
     * Handle when a widget comm is closed.
     */
    WidgetModel.prototype._handle_comm_closed = function (msg) {
        this.trigger('comm:close');
        this.close(true);
    };
    /**
     * Handle incoming comm msg.
     */
    WidgetModel.prototype._handle_comm_msg = function (msg) {
        var _this = this;
        var data = msg.content.data;
        var method = data.method;
        // tslint:disable-next-line:switch-default
        switch (method) {
            case 'update':
            case 'echo_update':
                this.state_change = this.state_change
                    .then(function () {
                    var _a, _b, _c;
                    var state = data.state;
                    var buffer_paths = (_a = data.buffer_paths, (_a !== null && _a !== void 0 ? _a : []));
                    // Make sure the buffers are DataViews
                    var buffers = (_c = (_b = msg.buffers) === null || _b === void 0 ? void 0 : _b.slice(0, buffer_paths.length), (_c !== null && _c !== void 0 ? _c : [])).map(function (b) {
                        if (b instanceof DataView) {
                            return b;
                        }
                        else {
                            return new DataView(b instanceof ArrayBuffer ? b : b.buffer);
                        }
                    });
                    utils.put_buffers(state, buffer_paths, buffers);
                    if (msg.parent_header && method === 'echo_update') {
                        var msgId_1 = msg.parent_header.msg_id;
                        // we may have echos coming from other clients, we only care about
                        // dropping echos for which we expected a reply
                        var expectedEcho = Object.keys(state).filter(function (attrName) {
                            return _this._expectedEchoMsgIds.hasOwnProperty(attrName);
                        });
                        expectedEcho.forEach(function (attrName) {
                            // Skip echo messages until we get the reply we are expecting.
                            var isOldMessage = _this._expectedEchoMsgIds[attrName] !== msgId_1;
                            if (isOldMessage) {
                                // Ignore an echo update that comes before our echo.
                                delete state[attrName];
                            }
                            else {
                                // we got our echo confirmation, so stop looking for it
                                delete _this._expectedEchoMsgIds[attrName];
                                // Start accepting echo updates unless we plan to send out a new state soon
                                if (_this._msg_buffer !== null &&
                                    Object.prototype.hasOwnProperty.call(_this._msg_buffer, attrName)) {
                                    delete state[attrName];
                                }
                            }
                        });
                    }
                    return _this.constructor._deserialize_state(state, _this.widget_manager);
                }).then(function (state) {
                    _this.set_state(state);
                }).catch(utils.reject("Could not process update msg for model id: " + this.model_id, true));
                return this.state_change;
            case 'custom':
                this.trigger('msg:custom', data.content, msg.buffers);
                return Promise.resolve();
        }
    };
    /**
     * Handle when a widget is updated from the backend.
     *
     * This function is meant for internal use only. Values set here will not be propagated on a sync.
     */
    WidgetModel.prototype.set_state = function (state) {
        this._state_lock = state;
        try {
            this.set(state);
        }
        catch (e) {
            console.error("Error setting state: " + e.message);
        }
        finally {
            this._state_lock = null;
        }
    };
    /**
     * Get the serializable state of the model.
     *
     * If drop_default is truthy, attributes that are equal to their default
     * values are dropped.
     */
    WidgetModel.prototype.get_state = function (drop_defaults) {
        var fullState = this.attributes;
        if (drop_defaults) {
            // if defaults is a function, call it
            var d = this.defaults;
            var defaults_1 = (typeof d === 'function') ? d.call(this) : d;
            var state_1 = {};
            Object.keys(fullState).forEach(function (key) {
                if (!(utils.isEqual(fullState[key], defaults_1[key]))) {
                    state_1[key] = fullState[key];
                }
            });
            return state_1;
        }
        else {
            return __assign({}, fullState);
        }
    };
    /**
     * Handle status msgs.
     *
     * execution_state : ('busy', 'idle', 'starting')
     */
    WidgetModel.prototype._handle_status = function (msg) {
        if (this.comm !== void 0) {
            if (msg.content.execution_state === 'idle') {
                this._pending_msgs--;
                // Send buffer if one is waiting and we are below the throttle.
                if (this._msg_buffer !== null
                    && this._pending_msgs < 1) {
                    var msgId = this.send_sync_message(this._msg_buffer, this._msg_buffer_callbacks);
                    this.rememberLastUpdateFor(msgId);
                    this._msg_buffer = null;
                    this._msg_buffer_callbacks = null;
                }
            }
        }
    };
    /**
     * Create msg callbacks for a comm msg.
     */
    WidgetModel.prototype.callbacks = function (view) {
        return this.widget_manager.callbacks(view);
    };
    /**
     * Set one or more values.
     *
     * We just call the super method, in which val and options are optional.
     * Handles both "key", value and {key: value} -style arguments.
     */
    WidgetModel.prototype.set = function (key, val, options) {
        // Call our patched backbone set. See #1642 and #1643.
        var return_value = backbonePatch.set.call(this, key, val, options);
        // Backbone only remembers the diff of the most recent set()
        // operation.  Calling set multiple times in a row results in a
        // loss of change information.  Here we keep our own running diff.
        //
        // We don't buffer the state set in the constructor (including
        // defaults), so we first check to see if we've initialized _buffered_state_diff.
        // which happens after the constructor sets attributes at creation.
        if (this._buffered_state_diff !== void 0) {
            var attrs = this.changedAttributes() || {};
            // The state_lock lists attributes that are currently being changed
            // right now from a kernel message. We don't want to send these
            // non-changes back to the kernel, so we delete them out of attrs if
            // they haven't changed from their state_lock value.
            // The state lock could be null or undefined (if set is being called from
            // the initializer).
            if (this._state_lock) {
                for (var _i = 0, _a = Object.keys(this._state_lock); _i < _a.length; _i++) {
                    var key_1 = _a[_i];
                    if (attrs[key_1] === this._state_lock[key_1]) {
                        delete attrs[key_1];
                    }
                }
            }
            this._buffered_state_diff = utils.assign(this._buffered_state_diff, attrs);
        }
        return return_value;
    };
    /**
     * Handle sync to the back-end.  Called when a model.save() is called.
     *
     * Make sure a comm exists.
     *
     * Parameters
     * ----------
     * method : create, update, patch, delete, read
     *   create/update always send the full attribute set
     *   patch - only send attributes listed in options.attrs, and if we
     *   are queuing up messages, combine with previous messages that have
     *   not been sent yet
     * model : the model we are syncing
     *   will normally be the same as `this`
     * options : dict
     *   the `attrs` key, if it exists, gives an {attr: value} dict that
     *   should be synced, otherwise, sync all attributes.
     *
     */
    WidgetModel.prototype.sync = function (method, model, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        // the typing is to return `any` since the super.sync method returns a JqXHR, but we just return false if there is an error.
        if (this.comm === undefined) {
            throw 'Syncing error: no comm channel defined';
        }
        var attrs = (method === 'patch') ? options.attrs : model.get_state(options.drop_defaults);
        // The state_lock lists attributes that are currently being changed
        // right now from a kernel message. We don't want to send these
        // non-changes back to the kernel, so we delete them out of attrs if
        // they haven't changed from their state_lock value.
        // The state lock could be null or undefined (if this is triggered
        // from the initializer).
        if (this._state_lock) {
            for (var _i = 0, _a = Object.keys(this._state_lock); _i < _a.length; _i++) {
                var key = _a[_i];
                if (attrs[key] === this._state_lock[key]) {
                    delete attrs[key];
                }
            }
        }
        Object.keys(attrs).forEach(function (attrName) {
            _this._attrsToUpdate[attrName] = true;
        });
        var msgState = this.serialize(attrs);
        if (Object.keys(msgState).length > 0) {
            // If this message was sent via backbone itself, it will not
            // have any callbacks.  It's important that we create callbacks
            // so we can listen for status messages, etc...
            var callbacks = options.callbacks || this.callbacks();
            // Check throttle.
            if (this._pending_msgs >= 1) {
                // The throttle has been exceeded, buffer the current msg so
                // it can be sent once the kernel has finished processing
                // some of the existing messages.
                // Combine updates if it is a 'patch' sync, otherwise replace updates
                switch (method) {
                    case 'patch':
                        this._msg_buffer = utils.assign(this._msg_buffer || {}, msgState);
                        break;
                    case 'update':
                    case 'create':
                        this._msg_buffer = msgState;
                        break;
                    default:
                        throw 'unrecognized syncing method';
                }
                this._msg_buffer_callbacks = callbacks;
            }
            else {
                // We haven't exceeded the throttle, send the message like
                // normal.
                var msgId = this.send_sync_message(attrs, callbacks);
                this.rememberLastUpdateFor(msgId);
                // Since the comm is a one-way communication, assume the message
                // arrived and was processed successfully.
                // Don't call options.success since we don't have a model back from
                // the server. Note that this means we don't have the Backbone
                // 'sync' event.
            }
        }
    };
    WidgetModel.prototype.rememberLastUpdateFor = function (msgId) {
        var _this = this;
        Object.keys(this._attrsToUpdate).forEach(function (attrName) {
            _this._expectedEchoMsgIds[attrName] = msgId;
        });
        this._attrsToUpdate = {};
    };
    /**
     * Serialize widget state.
     *
     * A serializer is a function which takes in a state attribute and a widget,
     * and synchronously returns a JSONable object. The returned object will
     * have toJSON called if possible, and the final result should be a
     * primitive object that is a snapshot of the widget state that may have
     * binary array buffers.
     */
    WidgetModel.prototype.serialize = function (state) {
        var serializers = this.constructor.serializers || {};
        for (var _i = 0, _a = Object.keys(state); _i < _a.length; _i++) {
            var k = _a[_i];
            try {
                if (serializers[k] && serializers[k].serialize) {
                    state[k] = (serializers[k].serialize)(state[k], this);
                }
                else {
                    // the default serializer just deep-copies the object
                    state[k] = JSON.parse(JSON.stringify(state[k]));
                }
                if (state[k] && state[k].toJSON) {
                    state[k] = state[k].toJSON();
                }
            }
            catch (e) {
                console.error('Error serializing widget state attribute: ', k);
                throw e;
            }
        }
        return state;
    };
    /**
     * Send a sync message to the kernel.
     */
    WidgetModel.prototype.send_sync_message = function (state, callbacks) {
        var _this = this;
        if (callbacks === void 0) { callbacks = {}; }
        if (!this.comm) {
            return '';
        }
        try {
            callbacks.iopub = callbacks.iopub || {};
            var statuscb_1 = callbacks.iopub.status;
            callbacks.iopub.status = function (msg) {
                _this._handle_status(msg);
                if (statuscb_1) {
                    statuscb_1(msg);
                }
            };
            // split out the binary buffers
            var split = utils.remove_buffers(state);
            var msgId = this.comm.send({
                method: 'update',
                state: split.state,
                buffer_paths: split.buffer_paths
            }, callbacks, {}, split.buffers);
            this._pending_msgs++;
            return msgId;
        }
        catch (e) {
            console.error('Could not send widget sync message', e);
        }
        return '';
    };
    /**
     * Push this model's state to the back-end
     *
     * This invokes a Backbone.Sync.
     */
    WidgetModel.prototype.save_changes = function (callbacks) {
        if (this.comm_live) {
            var options = { patch: true };
            if (callbacks) {
                options.callbacks = callbacks;
            }
            this.save(this._buffered_state_diff, options);
            this._buffered_state_diff = {};
        }
    };
    /**
     * on_some_change(['key1', 'key2'], foo, context) differs from
     * on('change:key1 change:key2', foo, context).
     * If the widget attributes key1 and key2 are both modified,
     * the second form will result in foo being called twice
     * while the first will call foo only once.
     */
    WidgetModel.prototype.on_some_change = function (keys, callback, context) {
        var scope = this;
        this.on('change', function () {
            if (keys.some(scope.hasChanged, scope)) {
                callback.apply(context, arguments);
            }
        }, this);
    };
    /**
     * Serialize the model.  See the deserialization function at the top of this file
     * and the kernel-side serializer/deserializer.
     */
    WidgetModel.prototype.toJSON = function (options) {
        return "IPY_MODEL_" + this.model_id;
    };
    /**
     * Returns a promise for the deserialized state. The second argument
     * is an instance of widget manager, which is required for the
     * deserialization of widget models.
     */
    WidgetModel._deserialize_state = function (state, manager) {
        var serializers = this.serializers;
        var deserialized;
        if (serializers) {
            deserialized = {};
            for (var k in state) {
                if (serializers[k] && serializers[k].deserialize) {
                    deserialized[k] = (serializers[k].deserialize)(state[k], manager);
                }
                else {
                    deserialized[k] = state[k];
                }
            }
        }
        else {
            deserialized = state;
        }
        return utils.resolvePromisesDict(deserialized);
    };
    return WidgetModel;
}(Backbone.Model));
export { WidgetModel };
var DOMWidgetModel = /** @class */ (function (_super) {
    __extends(DOMWidgetModel, _super);
    function DOMWidgetModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DOMWidgetModel.prototype.defaults = function () {
        return utils.assign(_super.prototype.defaults.call(this), {
            _dom_classes: []
            // We do not declare defaults for the layout and style attributes.
            // Those defaults are constructed on the kernel side and synced here
            // as needed, and our code here copes with those attributes being
            // undefined. See
            // https://github.com/jupyter-widgets/ipywidgets/issues/1620 and
            // https://github.com/jupyter-widgets/ipywidgets/pull/1621
        });
    };
    DOMWidgetModel.serializers = __assign(__assign({}, WidgetModel.serializers), { layout: { deserialize: unpack_models }, style: { deserialize: unpack_models } });
    return DOMWidgetModel;
}(WidgetModel));
export { DOMWidgetModel };
var WidgetView = /** @class */ (function (_super) {
    __extends(WidgetView, _super);
    /**
     * Public constructor.
     */
    function WidgetView(options) {
        return _super.call(this, options) || this;
    }
    /**
     * Initializer, called at the end of the constructor.
     */
    WidgetView.prototype.initialize = function (parameters) {
        var _this = this;
        this.listenTo(this.model, 'change', function () {
            var changed = Object.keys(_this.model.changedAttributes() || {});
            if (changed[0] === '_view_count' && changed.length === 1) {
                // Just the view count was updated
                return;
            }
            _this.update();
        });
        this.options = parameters.options;
        this.once('remove', function () {
            if (typeof (_this.model.get('_view_count')) === 'number') {
                _this.model.set('_view_count', _this.model.get('_view_count') - 1);
                _this.model.save_changes();
            }
        });
        this.once('displayed', function () {
            if (typeof (_this.model.get('_view_count')) === 'number') {
                _this.model.set('_view_count', _this.model.get('_view_count') + 1);
                _this.model.save_changes();
            }
        });
        this.displayed = new Promise(function (resolve, reject) {
            _this.once('displayed', resolve);
        });
    };
    /**
     * Triggered on model change.
     *
     * Update view to be consistent with this.model
     */
    WidgetView.prototype.update = function (options) {
        return;
    };
    /**
     * Render a view
     *
     * @returns the view or a promise to the view.
     */
    WidgetView.prototype.render = function () {
        return;
    };
    /**
     * Create and promise that resolves to a child view of a given model
     */
    WidgetView.prototype.create_child_view = function (child_model, options) {
        if (options === void 0) { options = {}; }
        options = __assign({ parent: this }, options);
        return this.model.widget_manager.create_view(child_model, options)
            .catch(utils.reject('Could not create child view', true));
    };
    /**
     * Create msg callbacks for a comm msg.
     */
    WidgetView.prototype.callbacks = function () {
        return this.model.callbacks(this);
    };
    /**
     * Send a custom msg associated with this view.
     */
    WidgetView.prototype.send = function (content, buffers) {
        this.model.send(content, this.callbacks(), buffers);
    };
    WidgetView.prototype.touch = function () {
        this.model.save_changes(this.callbacks());
    };
    WidgetView.prototype.remove = function () {
        // Raise a remove event when the view is removed.
        _super.prototype.remove.call(this);
        this.trigger('remove');
        return this;
    };
    return WidgetView;
}(NativeView));
export { WidgetView };
var JupyterPhosphorWidget = /** @class */ (function (_super) {
    __extends(JupyterPhosphorWidget, _super);
    function JupyterPhosphorWidget(options) {
        var _this = this;
        var view = options.view;
        delete options.view;
        _this = _super.call(this, options) || this;
        _this._view = view;
        return _this;
    }
    /**
     * Dispose the widget.
     *
     * This causes the view to be destroyed as well with 'remove'
     */
    JupyterPhosphorWidget.prototype.dispose = function () {
        if (this.isDisposed) {
            return;
        }
        _super.prototype.dispose.call(this);
        if (this._view) {
            this._view.remove();
        }
        this._view = null;
    };
    /**
     * Process the phosphor message.
     *
     * Any custom phosphor widget used inside a Jupyter widget should override
     * the processMessage function like this.
     */
    JupyterPhosphorWidget.prototype.processMessage = function (msg) {
        _super.prototype.processMessage.call(this, msg);
        this._view.processPhosphorMessage(msg);
    };
    return JupyterPhosphorWidget;
}(Widget));
export { JupyterPhosphorWidget };
var JupyterPhosphorPanelWidget = /** @class */ (function (_super) {
    __extends(JupyterPhosphorPanelWidget, _super);
    function JupyterPhosphorPanelWidget(options) {
        var _this = this;
        var view = options.view;
        delete options.view;
        _this = _super.call(this, options) || this;
        _this._view = view;
        return _this;
    }
    /**
     * Process the phosphor message.
     *
     * Any custom phosphor widget used inside a Jupyter widget should override
     * the processMessage function like this.
     */
    JupyterPhosphorPanelWidget.prototype.processMessage = function (msg) {
        _super.prototype.processMessage.call(this, msg);
        this._view.processPhosphorMessage(msg);
    };
    /**
     * Dispose the widget.
     *
     * This causes the view to be destroyed as well with 'remove'
     */
    JupyterPhosphorPanelWidget.prototype.dispose = function () {
        if (this.isDisposed) {
            return;
        }
        _super.prototype.dispose.call(this);
        if (this._view) {
            this._view.remove();
        }
        this._view = null;
    };
    return JupyterPhosphorPanelWidget;
}(Panel));
export { JupyterPhosphorPanelWidget };
var DOMWidgetView = /** @class */ (function (_super) {
    __extends(DOMWidgetView, _super);
    function DOMWidgetView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Public constructor
     */
    DOMWidgetView.prototype.initialize = function (parameters) {
        var _this = this;
        _super.prototype.initialize.call(this, parameters);
        this.listenTo(this.model, 'change:_dom_classes', function (model, new_classes) {
            var old_classes = model.previous('_dom_classes');
            _this.update_classes(old_classes, new_classes);
        });
        this.layoutPromise = Promise.resolve();
        this.listenTo(this.model, 'change:layout', function (model, value) {
            _this.setLayout(value, model.previous('layout'));
        });
        this.stylePromise = Promise.resolve();
        this.listenTo(this.model, 'change:style', function (model, value) {
            _this.setStyle(value, model.previous('style'));
        });
        this.displayed.then(function () {
            _this.update_classes([], _this.model.get('_dom_classes'));
            _this.setLayout(_this.model.get('layout'));
            _this.setStyle(_this.model.get('style'));
        });
        this._comm_live_update();
        this.listenTo(this.model, 'comm_live_update', function () {
            _this._comm_live_update();
        });
    };
    DOMWidgetView.prototype.setLayout = function (layout, oldLayout) {
        var _this = this;
        if (layout) {
            this.layoutPromise = this.layoutPromise.then(function (oldLayoutView) {
                if (oldLayoutView) {
                    oldLayoutView.unlayout();
                    _this.stopListening(oldLayoutView.model);
                    oldLayoutView.remove();
                }
                return _this.create_child_view(layout).then(function (view) {
                    // Trigger the displayed event of the child view.
                    return _this.displayed.then(function () {
                        view.trigger('displayed');
                        _this.listenTo(view.model, 'change', function () {
                            // Post (asynchronous) so layout changes can take
                            // effect first.
                            MessageLoop.postMessage(_this.pWidget, Widget.ResizeMessage.UnknownSize);
                        });
                        MessageLoop.postMessage(_this.pWidget, Widget.ResizeMessage.UnknownSize);
                        return view;
                    });
                }).catch(utils.reject('Could not add LayoutView to DOMWidgetView', true));
            });
        }
    };
    DOMWidgetView.prototype.setStyle = function (style, oldStyle) {
        var _this = this;
        if (style) {
            this.stylePromise = this.stylePromise.then(function (oldStyleView) {
                if (oldStyleView) {
                    oldStyleView.unstyle();
                    _this.stopListening(oldStyleView.model);
                    oldStyleView.remove();
                }
                return _this.create_child_view(style).then(function (view) {
                    // Trigger the displayed event of the child view.
                    return _this.displayed.then(function () {
                        view.trigger('displayed');
                        // Unlike for the layout attribute, style changes don't
                        // trigger phosphor resize messages.
                        return view;
                    });
                }).catch(utils.reject('Could not add styleView to DOMWidgetView', true));
            });
        }
    };
    /**
     * Update the DOM classes applied to an element, default to this.el.
     */
    DOMWidgetView.prototype.update_classes = function (old_classes, new_classes, el) {
        if (el === undefined) {
            el = this.el;
        }
        utils.difference(old_classes, new_classes).map(function (c) {
            if (el.classList) { // classList is not supported by IE for svg elements
                el.classList.remove(c);
            }
            else {
                el.setAttribute('class', el.getAttribute('class').replace(c, ''));
            }
        });
        utils.difference(new_classes, old_classes).map(function (c) {
            if (el.classList) { // classList is not supported by IE for svg elements
                el.classList.add(c);
            }
            else {
                el.setAttribute('class', el.getAttribute('class').concat(' ', c));
            }
        });
    };
    /**
     * Update the DOM classes applied to the widget based on a single
     * trait's value.
     *
     * Given a trait value classes map, this function automatically
     * handles applying the appropriate classes to the widget element
     * and removing classes that are no longer valid.
     *
     * Parameters
     * ----------
     * class_map: dictionary
     *  Dictionary of trait values to class lists.
     *  Example:
     *      {
     *          success: ['alert', 'alert-success'],
     *          info: ['alert', 'alert-info'],
     *          warning: ['alert', 'alert-warning'],
     *          danger: ['alert', 'alert-danger']
     *      };
     * trait_name: string
     *  Name of the trait to check the value of.
     * el: optional DOM element handle, defaults to this.el
     *  Element that the classes are applied to.
     */
    DOMWidgetView.prototype.update_mapped_classes = function (class_map, trait_name, el) {
        var key = this.model.previous(trait_name);
        var old_classes = class_map[key] ? class_map[key] : [];
        key = this.model.get(trait_name);
        var new_classes = class_map[key] ? class_map[key] : [];
        this.update_classes(old_classes, new_classes, el || this.el);
    };
    DOMWidgetView.prototype.set_mapped_classes = function (class_map, trait_name, el) {
        var key = this.model.get(trait_name);
        var new_classes = class_map[key] ? class_map[key] : [];
        this.update_classes([], new_classes, el || this.el);
    };
    DOMWidgetView.prototype._setElement = function (el) {
        if (this.pWidget) {
            this.pWidget.dispose();
        }
        this.$el = el instanceof $ ? el : $(el);
        this.el = this.$el[0];
        this.pWidget = new JupyterPhosphorWidget({
            node: el,
            view: this
        });
    };
    DOMWidgetView.prototype.remove = function () {
        if (this.pWidget) {
            this.pWidget.dispose();
        }
        return _super.prototype.remove.call(this);
    };
    DOMWidgetView.prototype.processPhosphorMessage = function (msg) {
        // tslint:disable-next-line:switch-default
        switch (msg.type) {
            case 'after-attach':
                this.trigger('displayed');
                break;
        }
    };
    DOMWidgetView.prototype._comm_live_update = function () {
        if (this.model.comm_live) {
            this.pWidget.removeClass('jupyter-widgets-disconnected');
        }
        else {
            this.pWidget.addClass('jupyter-widgets-disconnected');
        }
    };
    return DOMWidgetView;
}(WidgetView));
export { DOMWidgetView };
