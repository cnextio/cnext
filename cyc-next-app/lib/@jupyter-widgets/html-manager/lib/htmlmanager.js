// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import * as widgets from '../../controls';
import * as base from '../../base';
import * as outputWidgets from './output';
import * as PhosphorWidget from '@lumino/widgets';
import { RenderMimeRegistry, standardRendererFactories } from '@jupyterlab/rendermime';
import { WidgetRenderer, WIDGET_MIMETYPE } from './output_renderers';
export class HTMLManager extends base.ManagerBase {
    constructor(options) {
        super();
        this.loader = options && options.loader;
        this.renderMime = new RenderMimeRegistry({
            initialFactories: standardRendererFactories
        });
        this.renderMime.addFactory({
            safe: false,
            mimeTypes: [WIDGET_MIMETYPE],
            createRenderer: (options) => new WidgetRenderer(options, this)
        }, 0);
    }
    /**
     * Display the specified view. Element where the view is displayed
     * is specified in the `options.el` argument.
     */
    display_view(msg, view, options) {
        return Promise.resolve(view).then((view) => {
            PhosphorWidget.Widget.attach(view.pWidget, options.el);
            view.on('remove', () => {
                console.log('View removed', view);
            });
            return view;
        });
    }
    /**
     * Placeholder implementation for _get_comm_info.
     */
    _get_comm_info() {
        return Promise.resolve({});
    }
    /**
     * Placeholder implementation for _create_comm.
     */
    _create_comm(comm_target_name, model_id, data, metadata, buffers) {
        return Promise.resolve({
            on_close: () => { return; },
            on_msg: () => { return; },
            close: () => { return; }
        });
    }
    /**
     * Load a class and return a promise to the loaded object.
     */
    loadClass(className, moduleName, moduleVersion) {
        return new Promise((resolve, reject) => {
            if (moduleName === '../../base') {
                resolve(base);
            }
            else if (moduleName === '../../controls') {
                resolve(widgets);
            }
            else if (moduleName === '../../output') {
                resolve(outputWidgets);
            }
            else if (this.loader !== undefined) {
                resolve(this.loader(moduleName, moduleVersion));
            }
            else {
                reject(`Could not load module ${moduleName}@${moduleVersion}`);
            }
        }).then((module) => {
            if (module[className]) {
                return module[className];
            }
            else {
                return Promise.reject(`Class ${className} not found in module ${moduleName}@${moduleVersion}`);
            }
        });
    }
}
