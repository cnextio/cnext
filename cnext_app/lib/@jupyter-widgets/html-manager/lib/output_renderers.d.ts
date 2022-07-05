import { Widget } from '@lumino/widgets';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { HTMLManager } from './htmlmanager';
export declare const WIDGET_MIMETYPE = "application/vnd.jupyter.widget-view+json";
export declare class WidgetRenderer extends Widget implements IRenderMime.IRenderer {
    constructor(options: IRenderMime.IRendererOptions, manager: HTMLManager);
    renderModel(model: IRenderMime.IMimeModel): Promise<void>;
    /**
     * The mimetype being rendered.
     */
    readonly mimeType: string;
    private _manager;
}
