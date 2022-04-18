// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
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
export var shims;
(function (shims) {
    var services;
    (function (services) {
        /**
         * Public constructor
         * @param jsServicesKernel - @jupyterlab/services Kernel.IKernel instance
         */
        var CommManager = /** @class */ (function () {
            function CommManager(jsServicesKernel) {
                this.targets = Object.create(null);
                this.comms = Object.create(null);
                this.kernel = null;
                this.jsServicesKernel = null;
                this.init_kernel(jsServicesKernel);
            }
            /**
             * Hookup kernel events.
             * @param  {Kernel.IKernel} jsServicesKernel - @jupyterlab/services Kernel.IKernel instance
             */
            CommManager.prototype.init_kernel = function (jsServicesKernel) {
                this.kernel = jsServicesKernel; // These aren't really the same.
                this.jsServicesKernel = jsServicesKernel;
            };
            /**
             * Creates a new connected comm
             */
            CommManager.prototype.new_comm = function (target_name, data, callbacks, metadata, comm_id, buffers) {
                return __awaiter(this, void 0, void 0, function () {
                    var c, comm;
                    return __generator(this, function (_a) {
                        c = this.jsServicesKernel.createComm(target_name, comm_id);
                        comm = new Comm(c);
                        this.register_comm(comm);
                        comm.open(data, callbacks, metadata, buffers);
                        return [2 /*return*/, comm];
                    });
                });
            };
            /**
             * Register a comm target
             * @param  {string} target_name
             * @param  {(Comm, object) => void} f - callback that is called when the
             *                         comm is made.  Signature of f(comm, msg).
             */
            CommManager.prototype.register_target = function (target_name, f) {
                var _this = this;
                var handle = this.jsServicesKernel.registerCommTarget(target_name, function (jsServicesComm, msg) {
                    // Create the comm.
                    var comm = new Comm(jsServicesComm);
                    _this.register_comm(comm);
                    // Call the callback for the comm.
                    try {
                        return f(comm, msg);
                    }
                    catch (e) {
                        comm.close();
                        console.error(e);
                        console.error(new Error('Exception opening new comm'));
                    }
                });
                this.targets[target_name] = handle;
            };
            /**
             * Unregisters a comm target
             * @param  {string} target_name
             */
            CommManager.prototype.unregister_target = function (target_name, f) {
                var handle = this.targets[target_name];
                handle.dispose();
                delete this.targets[target_name];
            };
            /**
             * Register a comm in the mapping
             */
            CommManager.prototype.register_comm = function (comm) {
                this.comms[comm.comm_id] = Promise.resolve(comm);
                comm.kernel = this.kernel;
                return comm.comm_id;
            };
            return CommManager;
        }());
        services.CommManager = CommManager;
        /**
         * Public constructor
         * @param  {IComm} jsServicesComm - @jupyterlab/services IComm instance
         */
        var Comm = /** @class */ (function () {
            function Comm(jsServicesComm) {
                this.jsServicesComm = null;
                this.kernel = null;
                this.jsServicesComm = jsServicesComm;
            }
            Object.defineProperty(Comm.prototype, "comm_id", {
                /**
                 * Comm id
                 * @return {string}
                 */
                get: function () {
                    return this.jsServicesComm.commId;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Comm.prototype, "target_name", {
                /**
                 * Target name
                 * @return {string}
                 */
                get: function () {
                    return this.jsServicesComm.targetName;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Opens a sibling comm in the backend
             * @param  data
             * @param  callbacks
             * @param  metadata
             * @return msg id
             */
            Comm.prototype.open = function (data, callbacks, metadata, buffers) {
                var future = this.jsServicesComm.open(data, metadata, buffers);
                this._hookupCallbacks(future, callbacks);
                return future.msg.header.msg_id;
            };
            /**
             * Sends a message to the sibling comm in the backend
             * @param  data
             * @param  callbacks
             * @param  metadata
             * @param  buffers
             * @return message id
             */
            Comm.prototype.send = function (data, callbacks, metadata, buffers) {
                var future = this.jsServicesComm.send(data, metadata, buffers);
                this._hookupCallbacks(future, callbacks);
                return future.msg.header.msg_id;
            };
            /**
             * Closes the sibling comm in the backend
             * @param  data
             * @param  callbacks
             * @param  metadata
             * @return msg id
             */
            Comm.prototype.close = function (data, callbacks, metadata, buffers) {
                var future = this.jsServicesComm.close(data, metadata, buffers);
                this._hookupCallbacks(future, callbacks);
                return future.msg.header.msg_id;
            };
            /**
             * Register a message handler
             * @param  callback, which is given a message
             */
            Comm.prototype.on_msg = function (callback) {
                this.jsServicesComm.onMsg = callback.bind(this);
            };
            /**
             * Register a handler for when the comm is closed by the backend
             * @param  callback, which is given a message
             */
            Comm.prototype.on_close = function (callback) {
                this.jsServicesComm.onClose = callback.bind(this);
            };
            /**
             * Hooks callback object up with @jupyterlab/services IKernelFuture
             * @param  @jupyterlab/services IKernelFuture instance
             * @param  callbacks
             */
            Comm.prototype._hookupCallbacks = function (future, callbacks) {
                if (callbacks) {
                    future.onReply = function (msg) {
                        if (callbacks.shell && callbacks.shell.reply) {
                            callbacks.shell.reply(msg);
                        }
                        // TODO: Handle payloads.  See https://github.com/jupyter/notebook/blob/master/notebook/static/services/kernels/kernel.js#L923-L947
                    };
                    future.onStdin = function (msg) {
                        if (callbacks.input) {
                            callbacks.input(msg);
                        }
                    };
                    future.onIOPub = function (msg) {
                        if (callbacks.iopub) {
                            if (callbacks.iopub.status && msg.header.msg_type === 'status') {
                                callbacks.iopub.status(msg);
                            }
                            else if (callbacks.iopub.clear_output && msg.header.msg_type === 'clear_output') {
                                callbacks.iopub.clear_output(msg);
                            }
                            else if (callbacks.iopub.output) {
                                switch (msg.header.msg_type) {
                                    case 'display_data':
                                    case 'execute_result':
                                    case 'stream':
                                    case 'error':
                                        callbacks.iopub.output(msg);
                                        break;
                                    default: break;
                                }
                            }
                        }
                    };
                }
            };
            return Comm;
        }());
        services.Comm = Comm;
    })(services = shims.services || (shims.services = {}));
})(shims || (shims = {}));
