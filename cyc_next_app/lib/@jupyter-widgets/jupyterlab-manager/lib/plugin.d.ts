import { DocumentRegistry } from '@jupyterlab/docregistry';
import { INotebookModel } from '@jupyterlab/notebook';
import { JupyterFrontEndPlugin } from '@jupyterlab/application';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { DisposableDelegate } from '@lumino/disposable';
import { WidgetRenderer } from './renderer';
import * as base from '@jupyter-widgets/base';
import '@jupyter-widgets/base/css/index.css';
import '@jupyter-widgets/controls/css/widgets-base.css';
export declare function registerWidgetManager(context: DocumentRegistry.IContext<INotebookModel>, rendermime: IRenderMimeRegistry, renderers: IterableIterator<WidgetRenderer>): DisposableDelegate;
/**
 * The widget manager provider.
 */
declare const plugin: JupyterFrontEndPlugin<base.IJupyterWidgetRegistry>;
export default plugin;
