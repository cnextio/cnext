import * as base from '@jupyter-widgets/base';
import { RenderMimeRegistry } from '@jupyterlab/rendermime';
export declare class HTMLManager extends base.ManagerBase<HTMLElement> {
    constructor(options?: {
        loader?: (moduleName: string, moduleVersion: string) => Promise<any>;
    });
    /**
     * Display the specified view. Element where the view is displayed
     * is specified in the `options.el` argument.
     */
    display_view(msg: any, view: any, options: {
        el: HTMLElement;
    }): Promise<any>;
    /**
     * Placeholder implementation for _get_comm_info.
     */
    _get_comm_info(): Promise<{}>;
    /**
     * Placeholder implementation for _create_comm.
     */
    _create_comm(comm_target_name: string, model_id: string, data?: any, metadata?: any, buffers?: ArrayBuffer[] | ArrayBufferView[]): Promise<any>;
    /**
     * Load a class and return a promise to the loaded object.
     */
    protected loadClass(className: string, moduleName: string, moduleVersion: string): Promise<any>;
    /**
     * Renderers for contents of the output widgets
     *
     * Defines how outputs in the output widget should be rendered.
     */
    renderMime: RenderMimeRegistry;
    /**
     * A loader for a given module name and module version, and returns a promise to a module
     */
    loader: (moduleName: string, moduleVersion: string) => Promise<any>;
}
