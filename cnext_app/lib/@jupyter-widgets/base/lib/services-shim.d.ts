/**
 * This module defines shims for @jupyterlab/services that allows you to use the
 * old comm API.  Use this, @jupyterlab/services, and the widget base manager to
 * embed live widgets in a context outside of the notebook.
 */
import { Kernel, KernelMessage } from '@jupyterlab/services';
/**
 * Callbacks for services shim comms.
 */
export interface ICallbacks {
    shell?: {
        [key: string]: (msg: KernelMessage.IMessage) => void;
    };
    iopub?: {
        [key: string]: (msg: KernelMessage.IMessage) => void;
    };
    input?: (msg: KernelMessage.IMessage) => void;
}
export interface IClassicComm {
    /**
     * Comm id
     * @return {string}
     */
    comm_id: string;
    /**
     * Target name
     * @return {string}
     */
    target_name: string;
    /**
     * Opens a sibling comm in the backend
     * @param  data
     * @param  callbacks
     * @param  metadata
     * @param  buffers
     * @return msg id
     */
    open(data: any, callbacks: any, metadata?: any, buffers?: ArrayBuffer[] | ArrayBufferView[]): string;
    /**
     * Sends a message to the sibling comm in the backend
     * @param  data
     * @param  callbacks
     * @param  metadata
     * @param  buffers
     * @return message id
     */
    send(data: any, callbacks: any, metadata?: any, buffers?: ArrayBuffer[] | ArrayBufferView[]): string;
    /**
     * Closes the sibling comm in the backend
     * @param  data
     * @param  callbacks
     * @param  metadata
     * @param  buffers
     * @return msg id
     */
    close(data?: any, callbacks?: any, metadata?: any, buffers?: ArrayBuffer[] | ArrayBufferView[]): string;
    /**
     * Register a message handler
     * @param  callback, which is given a message
     */
    on_msg(callback: (x: any) => void): void;
    /**
     * Register a handler for when the comm is closed by the backend
     * @param  callback, which is given a message
     */
    on_close(callback: (x: any) => void): void;
}
export declare namespace shims {
    namespace services {
        /**
         * Public constructor
         * @param jsServicesKernel - @jupyterlab/services Kernel.IKernel instance
         */
        class CommManager {
            constructor(jsServicesKernel: Kernel.IKernelConnection);
            /**
             * Hookup kernel events.
             * @param  {Kernel.IKernel} jsServicesKernel - @jupyterlab/services Kernel.IKernel instance
             */
            init_kernel(jsServicesKernel: Kernel.IKernelConnection): void;
            /**
             * Creates a new connected comm
             */
            new_comm(target_name: string, data: any, callbacks: any, metadata: any, comm_id: string, buffers?: ArrayBuffer[] | ArrayBufferView[]): Promise<Comm>;
            /**
             * Register a comm target
             * @param  {string} target_name
             * @param  {(Comm, object) => void} f - callback that is called when the
             *                         comm is made.  Signature of f(comm, msg).
             */
            register_target(target_name: string, f: (comm: Comm, data: {}) => void): void;
            /**
             * Unregisters a comm target
             * @param  {string} target_name
             */
            unregister_target(target_name: string, f: (comm: Comm, data: {}) => void): void;
            /**
             * Register a comm in the mapping
             */
            register_comm(comm: Comm): string;
            targets: any;
            comms: any;
            kernel: Kernel.IKernelConnection;
            jsServicesKernel: Kernel.IKernelConnection;
        }
        /**
         * Public constructor
         * @param  {IComm} jsServicesComm - @jupyterlab/services IComm instance
         */
        class Comm implements IClassicComm {
            constructor(jsServicesComm: Kernel.IComm);
            /**
             * Comm id
             * @return {string}
             */
            get comm_id(): string;
            /**
             * Target name
             * @return {string}
             */
            get target_name(): string;
            /**
             * Opens a sibling comm in the backend
             * @param  data
             * @param  callbacks
             * @param  metadata
             * @return msg id
             */
            open(data: any, callbacks: any, metadata?: any, buffers?: ArrayBuffer[] | ArrayBufferView[]): string;
            /**
             * Sends a message to the sibling comm in the backend
             * @param  data
             * @param  callbacks
             * @param  metadata
             * @param  buffers
             * @return message id
             */
            send(data: any, callbacks: any, metadata?: any, buffers?: ArrayBuffer[] | ArrayBufferView[]): string;
            /**
             * Closes the sibling comm in the backend
             * @param  data
             * @param  callbacks
             * @param  metadata
             * @return msg id
             */
            close(data?: any, callbacks?: any, metadata?: any, buffers?: ArrayBuffer[] | ArrayBufferView[]): string;
            /**
             * Register a message handler
             * @param  callback, which is given a message
             */
            on_msg(callback: (x: any) => void): void;
            /**
             * Register a handler for when the comm is closed by the backend
             * @param  callback, which is given a message
             */
            on_close(callback: (x: any) => void): void;
            /**
             * Hooks callback object up with @jupyterlab/services IKernelFuture
             * @param  @jupyterlab/services IKernelFuture instance
             * @param  callbacks
             */
            _hookupCallbacks(future: Kernel.IShellFuture, callbacks: ICallbacks): void;
            jsServicesComm: Kernel.IComm;
            kernel: Kernel.IKernelConnection;
        }
    }
}
