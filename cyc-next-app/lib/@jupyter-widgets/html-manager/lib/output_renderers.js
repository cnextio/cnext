// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { Widget } from '@lumino/widgets';
export const WIDGET_MIMETYPE = 'application/vnd.jupyter.widget-view+json';
// Renderer to allow the output widget to render sub-widgets
export class WidgetRenderer extends Widget {
    constructor(options, manager) {
        super();
        this.mimeType = options.mimeType;
        this._manager = manager;
    }
    async renderModel(model) {
        const source = model.data[this.mimeType];
        const modelPromise = this._manager.get_model(source.model_id);
        if (modelPromise) {
            try {
                let wModel = await modelPromise;
                await this._manager.display_model(null, wModel, { el: this.node });
            }
            catch (err) {
                console.log('Error displaying widget');
                console.log(err);
                this.node.textContent = 'Error displaying widget';
                this.addClass('jupyter-widgets');
            }
        }
        else {
            this.node.textContent = 'Error creating widget: could not find model';
            this.addClass('jupyter-widgets');
            return Promise.resolve();
        }
    }
}
