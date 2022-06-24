// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { INotebookTracker } from '@jupyterlab/notebook';
import { IMainMenu, } from '@jupyterlab/mainmenu';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { ILoggerRegistry } from '@jupyterlab/logconsole';
import { toArray, filter } from '@lumino/algorithm';
import { DisposableDelegate } from '@lumino/disposable';
import { AttachedProperty } from '@lumino/properties';
import { WidgetRenderer } from './renderer';
import { WidgetManager, WIDGET_VIEW_MIMETYPE } from './manager';
import { OutputModel, OutputView, OUTPUT_WIDGET_VERSION } from './output';
import * as base from '@jupyter-widgets/base';
// We import only the version from the specific module in controls so that the
// controls code can be split and dynamically loaded in webpack.
import { JUPYTER_CONTROLS_VERSION } from '@jupyter-widgets/controls/lib/version';
import '@jupyter-widgets/base/css/index.css';
import '@jupyter-widgets/controls/css/widgets-base.css';
import { KernelMessage } from '@jupyterlab/services';
const WIDGET_REGISTRY = [];
/**
 * The cached settings.
 */
const SETTINGS = { saveState: false };
/**
 * Iterate through all widget renderers in a notebook.
 */
function* widgetRenderers(nb) {
    for (let cell of nb.widgets) {
        if (cell.model.type === 'code') {
            for (let codecell of cell.outputArea.widgets) {
                for (let output of toArray(codecell.children())) {
                    if (output instanceof WidgetRenderer) {
                        yield output;
                    }
                }
            }
        }
    }
}
/**
 * Iterate through all matching linked output views
 */
function* outputViews(app, path) {
    let linkedViews = filter(app.shell.widgets(), w => w.id.startsWith('LinkedOutputView-') && w.path === path);
    for (let view of toArray(linkedViews)) {
        for (let outputs of toArray(view.children())) {
            for (let output of toArray(outputs.children())) {
                if (output instanceof WidgetRenderer) {
                    yield output;
                }
            }
        }
    }
}
function* chain(...args) {
    for (let it of args) {
        yield* it;
    }
}
export function registerWidgetManager(context, rendermime, renderers) {
    let wManager = Private.widgetManagerProperty.get(context);
    if (!wManager) {
        wManager = new WidgetManager(context, rendermime, SETTINGS);
        WIDGET_REGISTRY.forEach(data => wManager.register(data));
        Private.widgetManagerProperty.set(context, wManager);
    }
    for (let r of renderers) {
        r.manager = wManager;
    }
    // Replace the placeholder widget renderer with one bound to this widget
    // manager.
    rendermime.removeMimeType(WIDGET_VIEW_MIMETYPE);
    rendermime.addFactory({
        safe: false,
        mimeTypes: [WIDGET_VIEW_MIMETYPE],
        createRenderer: (options) => new WidgetRenderer(options, wManager)
    }, 0);
    return new DisposableDelegate(() => {
        if (rendermime) {
            rendermime.removeMimeType(WIDGET_VIEW_MIMETYPE);
        }
        wManager.dispose();
    });
}
/**
 * The widget manager provider.
 */
const plugin = {
    id: '@jupyter-widgets/jupyterlab-manager:plugin',
    requires: [IRenderMimeRegistry, ISettingRegistry],
    optional: [INotebookTracker, IMainMenu, ILoggerRegistry],
    provides: base.IJupyterWidgetRegistry,
    activate: activateWidgetExtension,
    autoStart: true
};
export default plugin;
function updateSettings(settings) {
    SETTINGS.saveState = settings.get('saveState').composite;
}
/**
 * Activate the widget extension.
 */
function activateWidgetExtension(app, rendermime, settingRegistry, tracker, menu, loggerRegistry) {
    const { commands } = app;
    const bindUnhandledIOPubMessageSignal = (nb) => {
        if (!loggerRegistry) {
            return;
        }
        const wManager = Private.widgetManagerProperty.get(nb.context);
        if (wManager) {
            wManager.onUnhandledIOPubMessage.connect((sender, msg) => {
                const logger = loggerRegistry.getLogger(nb.context.path);
                let level = 'warning';
                if (KernelMessage.isErrorMsg(msg) ||
                    (KernelMessage.isStreamMsg(msg) && msg.content.name === 'stderr')) {
                    level = 'error';
                }
                const data = Object.assign(Object.assign({}, msg.content), { output_type: msg.header.msg_type });
                logger.rendermime = nb.content.rendermime;
                logger.log({ type: 'output', data, level });
            });
        }
    };
    settingRegistry.load(plugin.id).then((settings) => {
        settings.changed.connect(updateSettings);
        updateSettings(settings);
    }).catch((reason) => {
        console.error(reason.message);
    });
    // Add a placeholder widget renderer.
    rendermime.addFactory({
        safe: false,
        mimeTypes: [WIDGET_VIEW_MIMETYPE],
        createRenderer: options => new WidgetRenderer(options)
    }, 0);
    if (tracker) {
        tracker.forEach(panel => {
            registerWidgetManager(panel.context, panel.content.rendermime, chain(widgetRenderers(panel.content), outputViews(app, panel.context.path)));
            bindUnhandledIOPubMessageSignal(panel);
        });
        tracker.widgetAdded.connect((sender, panel) => {
            registerWidgetManager(panel.context, panel.content.rendermime, chain(widgetRenderers(panel.content), outputViews(app, panel.context.path)));
            bindUnhandledIOPubMessageSignal(panel);
        });
    }
    // Add a command for creating a new Markdown file.
    commands.addCommand('@jupyter-widgets/jupyterlab-manager:saveWidgetState', {
        label: 'Save Widget State Automatically',
        execute: args => {
            return settingRegistry
                .set(plugin.id, 'saveState', !SETTINGS.saveState)
                .catch((reason) => {
                console.error(`Failed to set ${plugin.id}: ${reason.message}`);
            });
        },
        isToggled: () => SETTINGS.saveState
    });
    if (menu) {
        menu.settingsMenu.addGroup([
            { command: '@jupyter-widgets/jupyterlab-manager:saveWidgetState' }
        ]);
    }
    WIDGET_REGISTRY.push({
        name: '@jupyter-widgets/base',
        version: base.JUPYTER_WIDGETS_VERSION,
        exports: {
            WidgetModel: base.WidgetModel,
            WidgetView: base.WidgetView,
            DOMWidgetView: base.DOMWidgetView,
            DOMWidgetModel: base.DOMWidgetModel,
            LayoutModel: base.LayoutModel,
            LayoutView: base.LayoutView,
            StyleModel: base.StyleModel,
            StyleView: base.StyleView
        }
    });
    WIDGET_REGISTRY.push({
        name: '@jupyter-widgets/controls',
        version: JUPYTER_CONTROLS_VERSION,
        exports: () => {
            return new Promise((resolve, reject) => {
                require.ensure(['@jupyter-widgets/controls'], (require) => {
                    resolve(require('@jupyter-widgets/controls'));
                }, (err) => {
                    reject(err);
                }, '@jupyter-widgets/controls');
            });
        }
    });
    WIDGET_REGISTRY.push({
        name: '@jupyter-widgets/output',
        version: OUTPUT_WIDGET_VERSION,
        exports: { OutputModel, OutputView }
    });
    return {
        registerWidget(data) {
            WIDGET_REGISTRY.push(data);
        }
    };
}
var Private;
(function (Private) {
    /**
     * A private attached property for a widget manager.
     */
    Private.widgetManagerProperty = new AttachedProperty({
        name: 'widgetManager',
        create: () => undefined
    });
})(Private || (Private = {}));
