// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import * as utils from './utils';
import { PromiseDelegate, } from '@lumino/coreutils';
import { PROTOCOL_VERSION } from './version';
var PROTOCOL_MAJOR_VERSION = PROTOCOL_VERSION.split('.', 1)[0];
/**
 * The control comm target name.
 */
export var CONTROL_COMM_TARGET = 'jupyter.widget.control';
/**
 * The supported version for the control comm channel.
 */
export var CONTROL_COMM_PROTOCOL_VERSION = '1.0.0';
/**
 * Time (in ms) after which we consider the control comm target not responding.
 */
export var CONTROL_COMM_TIMEOUT = 4000;
/**
 * Manager abstract base class
 */
var ManagerBase = /** @class */ (function () {
    function ManagerBase() {
        /**
         * The comm target name to register
         */
        this.comm_target_name = 'jupyter.widget';
        /**
         * Dictionary of model ids and model instance promises
         */
        this._models = Object.create(null);
    }
    /**
     * Display a DOMWidgetView for a particular model.
     */
    ManagerBase.prototype.display_model = function (msg, model, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this.create_view(model, options).then(function (view) { return _this.display_view(msg, view, options); }).catch(utils.reject('Could not create view', true));
    };
    /**
     * Modifies view options. Generally overloaded in custom widget manager
     * implementations.
     */
    ManagerBase.prototype.setViewOptions = function (options) {
        if (options === void 0) { options = {}; }
        return options;
    };
    ManagerBase.prototype.create_view = function (model, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var viewPromise = model.state_change = model.state_change.then(function () {
            return _this.loadClass(model.get('_view_name'), model.get('_view_module'), model.get('_view_module_version')).then(function (ViewType) {
                var view = new ViewType({
                    model: model,
                    options: _this.setViewOptions(options)
                });
                view.listenTo(model, 'destroy', view.remove);
                return Promise.resolve(view.render()).then(function () { return view; });
            }).catch(utils.reject('Could not create a view for model id ' + model.model_id, true));
        });
        var id = utils.uuid();
        model.views[id] = viewPromise;
        viewPromise.then(function (view) {
            view.once('remove', function () { delete view.model.views[id]; }, _this);
        });
        return model.state_change;
    };
    /**
     * callback handlers specific to a view
     */
    ManagerBase.prototype.callbacks = function (view) {
        return {};
    };
    /**
     * Get a promise for a model by model id.
     *
     * #### Notes
     * If a model is not found, undefined is returned (NOT a promise). However,
     * the calling code should also deal with the case where a rejected promise
     * is returned, and should treat that also as a model not found.
     */
    ManagerBase.prototype.get_model = function (model_id) {
        // TODO: Perhaps we should return a Promise.reject if the model is not
        // found. Right now this isn't a true async function because it doesn't
        // always return a promise.
        return this._models[model_id];
    };
    /**
     * Returns true if the given model is registered, otherwise false.
     *
     * #### Notes
     * This is a synchronous way to check if a model is registered.
     */
    ManagerBase.prototype.has_model = function (model_id) {
        return this._models[model_id] !== undefined;
    };
    /**
     * Handle when a comm is opened.
     */
    ManagerBase.prototype.handle_comm_open = function (comm, msg) {
        var protocolVersion = (msg.metadata || {}).version || '';
        if (protocolVersion.split('.', 1)[0] !== PROTOCOL_MAJOR_VERSION) {
            var error = "Wrong widget protocol version: received protocol version '" + protocolVersion + "', but was expecting major version '" + PROTOCOL_MAJOR_VERSION + "'";
            console.error(error);
            return Promise.reject(error);
        }
        var data = msg.content.data;
        var buffer_paths = data.buffer_paths || [];
        // Make sure the buffers are DataViews
        var buffers = (msg.buffers || []).map(function (b) {
            if (b instanceof DataView) {
                return b;
            }
            else {
                return new DataView(b instanceof ArrayBuffer ? b : b.buffer);
            }
        });
        utils.put_buffers(data.state, buffer_paths, buffers);
        return this.new_model({
            model_name: data.state['_model_name'],
            model_module: data.state['_model_module'],
            model_module_version: data.state['_model_module_version'],
            comm: comm
        }, data.state).catch(utils.reject('Could not create a model.', true));
    };
    /**
     * Create a comm and new widget model.
     * @param  options - same options as new_model but comm is not
     *                          required and additional options are available.
     * @param  serialized_state - serialized model attributes.
     */
    ManagerBase.prototype.new_widget = function (options, serialized_state) {
        var _this = this;
        if (serialized_state === void 0) { serialized_state = {}; }
        var commPromise;
        // we check to make sure the view information is provided, to help catch
        // backwards incompatibility errors.
        if (options.view_name === undefined
            || options.view_module === undefined
            || options.view_module_version === undefined) {
            return Promise.reject('new_widget(...) must be given view information in the options.');
        }
        // If no comm is provided, a new comm is opened for the jupyter.widget
        // target.
        if (options.comm) {
            commPromise = Promise.resolve(options.comm);
        }
        else {
            commPromise = this._create_comm(this.comm_target_name, options.model_id, {
                state: {
                    _model_module: options.model_module,
                    _model_module_version: options.model_module_version,
                    _model_name: options.model_name,
                    _view_module: options.view_module,
                    _view_module_version: options.view_module_version,
                    _view_name: options.view_name
                },
            }, { version: PROTOCOL_VERSION });
        }
        // The options dictionary is copied since data will be added to it.
        var options_clone = __assign({}, options);
        // Create the model. In the case where the comm promise is rejected a
        // comm-less model is still created with the required model id.
        return commPromise.then(function (comm) {
            // Comm Promise Resolved.
            options_clone.comm = comm;
            var widget_model = _this.new_model(options_clone, serialized_state);
            return widget_model.then(function (model) {
                model.sync('create', model);
                return model;
            });
        }, function () {
            // Comm Promise Rejected.
            if (!options_clone.model_id) {
                options_clone.model_id = utils.uuid();
            }
            return _this.new_model(options_clone, serialized_state);
        });
    };
    ManagerBase.prototype.register_model = function (model_id, modelPromise) {
        var _this = this;
        this._models[model_id] = modelPromise;
        modelPromise.then(function (model) {
            model.once('comm:close', function () {
                delete _this._models[model_id];
            });
        });
    };
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
    ManagerBase.prototype.new_model = function (options, serialized_state) {
        if (serialized_state === void 0) { serialized_state = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var model_id, modelPromise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (options.model_id) {
                            model_id = options.model_id;
                        }
                        else if (options.comm) {
                            model_id = options.model_id = options.comm.comm_id;
                        }
                        else {
                            throw new Error('Neither comm nor model_id provided in options object. At least one must exist.');
                        }
                        modelPromise = this._make_model(options, serialized_state);
                        // this call needs to happen before the first `await`, see note in `set_state`:
                        this.register_model(model_id, modelPromise);
                        return [4 /*yield*/, modelPromise];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ManagerBase.prototype._make_model = function (options, serialized_state) {
        if (serialized_state === void 0) { serialized_state = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var model_id, model_promise, ModelType, error_1, attributes, modelOptions, widget_model;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        model_id = options.model_id;
                        model_promise = this.loadClass(options.model_name, options.model_module, options.model_module_version);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, model_promise];
                    case 2:
                        ModelType = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Could not instantiate widget');
                        throw error_1;
                    case 4:
                        if (!ModelType) {
                            throw new Error("Cannot find model module " + options.model_module + "@" + options.model_module_version + ", " + options.model_name);
                        }
                        return [4 /*yield*/, ModelType._deserialize_state(serialized_state, this)];
                    case 5:
                        attributes = _a.sent();
                        modelOptions = {
                            widget_manager: this,
                            model_id: model_id,
                            comm: options.comm,
                        };
                        widget_model = new ModelType(attributes, modelOptions);
                        widget_model.name = options.model_name;
                        widget_model.module = options.model_module;
                        return [2 /*return*/, widget_model];
                }
            });
        });
    };
    /**
     * Fetch all widgets states from the kernel using the control comm channel
     * If this fails (control comm handler not implemented kernel side),
     * it will fall back to `_loadFromKernelModels`.
     *
     * This is a utility function that can be used in subclasses.
     */
    ManagerBase.prototype._loadFromKernel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, buffers, initComm_1, error_2, states, bufferPaths, bufferGroups, i, _a, widget_id, path, b, widget_comms;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this._create_comm(CONTROL_COMM_TARGET, utils.uuid(), {}, { version: CONTROL_COMM_PROTOCOL_VERSION })];
                    case 1:
                        initComm_1 = _b.sent();
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                initComm_1.on_msg(function (msg) {
                                    data = msg['content']['data'];
                                    if (data.method !== 'update_states') {
                                        console.warn("\n                        Unknown " + data.method + " message on the Control channel\n                        ");
                                        return;
                                    }
                                    buffers = (msg.buffers || []).map(function (b) {
                                        if (b instanceof DataView) {
                                            return b;
                                        }
                                        else {
                                            return new DataView(b instanceof ArrayBuffer ? b : b.buffer);
                                        }
                                    });
                                    resolve(null);
                                });
                                initComm_1.on_close(function () { return reject('Control comm was closed too early'); });
                                // Send a states request msg
                                initComm_1.send({ method: 'request_states' }, {});
                                // Reject if we didn't get a response in time
                                setTimeout(function () { return reject('Control comm did not respond in time'); }, CONTROL_COMM_TIMEOUT);
                            })];
                    case 2:
                        _b.sent();
                        initComm_1.close();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _b.sent();
                        console.warn('Failed to fetch ipywidgets through the "jupyter.widget.control" comm channel, fallback to fetching individual model state. Reason:', error_2);
                        // Fall back to the old implementation for old ipywidgets backend versions (ipywidgets<=7.6)
                        return [2 /*return*/, this._loadFromKernelModels()];
                    case 4:
                        states = data.states;
                        bufferPaths = {};
                        bufferGroups = {};
                        // Group buffers and buffer paths by widget id
                        for (i = 0; i < data.buffer_paths.length; i++) {
                            _a = data.buffer_paths[i], widget_id = _a[0], path = _a.slice(1);
                            b = buffers[i];
                            if (!bufferPaths[widget_id]) {
                                bufferPaths[widget_id] = [];
                                bufferGroups[widget_id] = [];
                            }
                            bufferPaths[widget_id].push(path);
                            bufferGroups[widget_id].push(b);
                        }
                        return [4 /*yield*/, Promise.all(Object.keys(states).map(function (widget_id) { return __awaiter(_this, void 0, void 0, function () {
                                var comm, _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            if (!this.has_model(widget_id)) return [3 /*break*/, 1];
                                            _a = undefined;
                                            return [3 /*break*/, 3];
                                        case 1: return [4 /*yield*/, this._create_comm('jupyter.widget', widget_id)];
                                        case 2:
                                            _a = _b.sent();
                                            _b.label = 3;
                                        case 3:
                                            comm = _a;
                                            return [2 /*return*/, { widget_id: widget_id, comm: comm }];
                                    }
                                });
                            }); }))];
                    case 5:
                        widget_comms = _b.sent();
                        return [4 /*yield*/, Promise.all(widget_comms.map(function (_a) {
                                var widget_id = _a.widget_id, comm = _a.comm;
                                return __awaiter(_this, void 0, void 0, function () {
                                    var state, model, error_3;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                state = states[widget_id];
                                                // Put binary buffers
                                                if (widget_id in bufferPaths) {
                                                    utils.put_buffers(state, bufferPaths[widget_id], bufferGroups[widget_id]);
                                                }
                                                _b.label = 1;
                                            case 1:
                                                _b.trys.push([1, 6, , 7]);
                                                if (!comm) return [3 /*break*/, 3];
                                                // This must be the first await in the code path that
                                                // reaches here so that registering the model promise in
                                                // new_model can register the widget promise before it may
                                                // be required by other widgets.
                                                return [4 /*yield*/, this.new_model({
                                                        model_name: state.model_name,
                                                        model_module: state.model_module,
                                                        model_module_version: state.model_module_version,
                                                        model_id: widget_id,
                                                        comm: comm,
                                                    }, state.state)];
                                            case 2:
                                                // This must be the first await in the code path that
                                                // reaches here so that registering the model promise in
                                                // new_model can register the widget promise before it may
                                                // be required by other widgets.
                                                _b.sent();
                                                return [3 /*break*/, 5];
                                            case 3: return [4 /*yield*/, this.get_model(widget_id)];
                                            case 4:
                                                model = _b.sent();
                                                model.set_state(state.state);
                                                _b.label = 5;
                                            case 5: return [3 /*break*/, 7];
                                            case 6:
                                                error_3 = _b.sent();
                                                // Failed to create a widget model, we continue creating other models so that
                                                // other widgets can render
                                                console.error(error_3);
                                                return [3 /*break*/, 7];
                                            case 7: return [2 /*return*/];
                                        }
                                    });
                                });
                            }))];
                    case 6:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Old implementation of fetching widget models one by one using
     * the request_state message on each comm.
     *
     * This is a utility function that can be used in subclasses.
     */
    ManagerBase.prototype._loadFromKernelModels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var comm_ids, widgets_info;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._get_comm_info()];
                    case 1:
                        comm_ids = _a.sent();
                        return [4 /*yield*/, Promise.all(Object.keys(comm_ids).map(function (comm_id) { return __awaiter(_this, void 0, void 0, function () {
                                var comm, msg_id, info;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (this.has_model(comm_id)) {
                                                return [2 /*return*/];
                                            }
                                            return [4 /*yield*/, this._create_comm(this.comm_target_name, comm_id)];
                                        case 1:
                                            comm = _a.sent();
                                            msg_id = '';
                                            info = new PromiseDelegate();
                                            comm.on_msg(function (msg) {
                                                if (msg.parent_header.msg_id === msg_id &&
                                                    msg.header.msg_type === 'comm_msg' &&
                                                    msg.content.data.method === 'update') {
                                                    var data = msg.content.data;
                                                    var buffer_paths = data.buffer_paths || [];
                                                    var buffers = msg.buffers || [];
                                                    utils.put_buffers(data.state, buffer_paths, buffers);
                                                    info.resolve({ comm: comm, msg: msg });
                                                }
                                            });
                                            msg_id = comm.send({
                                                method: 'request_state',
                                            }, this.callbacks(undefined));
                                            return [2 /*return*/, info.promise];
                                    }
                                });
                            }); }))];
                    case 2:
                        widgets_info = _a.sent();
                        // We put in a synchronization barrier here so that we don't have to
                        // topologically sort the restored widgets. `new_model` synchronously
                        // registers the widget ids before reconstructing their state
                        // asynchronously, so promises to every widget reference should be available
                        // by the time they are used.
                        return [4 /*yield*/, Promise.all(widgets_info.map(function (widget_info) { return __awaiter(_this, void 0, void 0, function () {
                                var content;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!widget_info) {
                                                return [2 /*return*/];
                                            }
                                            content = widget_info.msg.content;
                                            return [4 /*yield*/, this.new_model({
                                                    model_name: content.data.state._model_name,
                                                    model_module: content.data.state._model_module,
                                                    model_module_version: content.data.state._model_module_version,
                                                    comm: widget_info.comm,
                                                }, content.data.state)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 3:
                        // We put in a synchronization barrier here so that we don't have to
                        // topologically sort the restored widgets. `new_model` synchronously
                        // registers the widget ids before reconstructing their state
                        // asynchronously, so promises to every widget reference should be available
                        // by the time they are used.
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close all widgets and empty the widget state.
     * @return Promise that resolves when the widget state is cleared.
     */
    ManagerBase.prototype.clear_state = function () {
        var _this = this;
        return utils.resolvePromisesDict(this._models).then(function (models) {
            Object.keys(models).forEach(function (id) { return models[id].close(); });
            _this._models = Object.create(null);
        });
    };
    /**
     * Asynchronously get the state of the widget manager.
     *
     * This includes all of the widget models, and follows the format given in
     * the @jupyter-widgets/schema package.
     *
     * @param options - The options for what state to return.
     * @returns Promise for a state dictionary
     */
    ManagerBase.prototype.get_state = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var modelPromises = Object.keys(this._models).map(function (id) { return _this._models[id]; });
        return Promise.all(modelPromises).then(function (models) {
            return serialize_state(models, options);
        });
    };
    /**
     * Set the widget manager state.
     *
     * @param state - a Javascript object conforming to the application/vnd.jupyter.widget-state+json spec.
     *
     * Reconstructs all of the widget models in the state, merges that with the
     * current manager state, and then attempts to redisplay the widgets in the
     * state.
     */
    ManagerBase.prototype.set_state = function (state) {
        var _this = this;
        // Check to make sure that it's the same version we are parsing.
        if (!(state.version_major && state.version_major <= 2)) {
            throw 'Unsupported widget state format';
        }
        var models = state.state;
        // Recreate all the widget models for the given widget manager state.
        var all_models = this._get_comm_info().then(function (live_comms) {
            /* Note: It is currently safe to just loop over the models in any order,
               given that the following holds (does at the time of writing):
               1: any call to `new_model` with state registers the model promise (e.g. with `register_model`)
                  synchronously (before it's first `await` statement).
               2: any calls to a model constructor or the `set_state` method on a model,
                  happens asynchronously (in a `then` clause, or after an `await` statement).

              Without these assumptions, one risks trying to set model state with a reference
              to another model that doesn't exist yet!
            */
            return Promise.all(Object.keys(models).map(function (model_id) {
                // First put back the binary buffers
                var decode = { 'base64': utils.base64ToBuffer, 'hex': utils.hexToBuffer };
                var model = models[model_id];
                var modelState = model.state;
                if (model.buffers) {
                    var bufferPaths = model.buffers.map(function (b) { return b.path; });
                    // put_buffers expects buffers to be DataViews
                    var buffers = model.buffers.map(function (b) { return new DataView(decode[b.encoding](b.data)); });
                    utils.put_buffers(model.state, bufferPaths, buffers);
                }
                // If the model has already been created, set its state and then
                // return it.
                if (_this.has_model(model_id)) {
                    return _this.get_model(model_id).then(function (model) {
                        // deserialize state
                        return model.constructor._deserialize_state(modelState || {}, _this).then(function (attributes) {
                            model.set_state(attributes); // case 2
                            return model;
                        });
                    });
                }
                var modelCreate = {
                    model_id: model_id,
                    model_name: model.model_name,
                    model_module: model.model_module,
                    model_module_version: model.model_module_version
                };
                if (live_comms.hasOwnProperty(model_id)) { // live comm
                    // This connects to an existing comm if it exists, and
                    // should *not* send a comm open message.
                    return _this._create_comm(_this.comm_target_name, model_id).then(function (comm) {
                        modelCreate.comm = comm;
                        return _this.new_model(modelCreate); // No state, so safe wrt. case 1
                    });
                }
                else {
                    return _this.new_model(modelCreate, modelState); // case 1
                }
            }));
        });
        return all_models;
    };
    /**
     * Disconnect the widget manager from the kernel, setting each model's comm
     * as dead.
     */
    ManagerBase.prototype.disconnect = function () {
        var _this = this;
        Object.keys(this._models).forEach(function (i) {
            _this._models[i].then(function (model) { model.comm_live = false; });
        });
    };
    /**
     * Resolve a URL relative to the current notebook location.
     *
     * The default implementation just returns the original url.
     */
    ManagerBase.prototype.resolveUrl = function (url) {
        return Promise.resolve(url);
    };
    /**
     * Filter serialized widget state to remove any ID's already present in manager.
     *
     * @param {*} state Serialized state to filter
     *
     * @returns {*} A copy of the state, with its 'state' attribute filtered
     */
    ManagerBase.prototype.filterExistingModelState = function (serialized_state) {
        var _this = this;
        var models = serialized_state.state;
        models = Object.keys(models)
            .filter(function (model_id) { return !_this.has_model(model_id); })
            .reduce(function (res, model_id) {
            res[model_id] = models[model_id];
            return res;
        }, {});
        return __assign(__assign({}, serialized_state), { state: models });
    };
    return ManagerBase;
}());
export { ManagerBase };
/**
 * Serialize an array of widget models
 *
 * #### Notes
 * The return value follows the format given in the
 * @jupyter-widgets/schema package.
 */
export function serialize_state(models, options) {
    if (options === void 0) { options = {}; }
    var state = {};
    models.forEach(function (model) {
        var model_id = model.model_id;
        var split = utils.remove_buffers(model.serialize(model.get_state(options.drop_defaults)));
        var buffers = split.buffers.map(function (buffer, index) {
            return {
                data: utils.bufferToBase64(buffer),
                path: split.buffer_paths[index],
                encoding: 'base64'
            };
        });
        state[model_id] = {
            model_name: model.name,
            model_module: model.module,
            model_module_version: model.get('_model_module_version'),
            state: split.state
        };
        // To save space, only include the buffers key if we have buffers
        if (buffers.length > 0) {
            state[model_id].buffers = buffers;
        }
    });
    return { version_major: 2, version_minor: 0, state: state };
}
