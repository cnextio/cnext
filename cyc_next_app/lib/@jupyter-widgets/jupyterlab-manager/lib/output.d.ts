import * as outputBase from '@jupyter-widgets/output';
import { JupyterPhosphorWidget } from '@jupyter-widgets/base';
import { Message } from '@lumino/messaging';
import { Panel } from '@lumino/widgets';
import { WidgetManager } from './manager';
import { OutputAreaModel, OutputArea } from '@jupyterlab/outputarea';
import { KernelMessage, Session } from '@jupyterlab/services';
export declare const OUTPUT_WIDGET_VERSION = "1.0.0";
export declare class OutputModel extends outputBase.OutputModel {
    defaults(): any;
    initialize(attributes: any, options: any): void;
    /**
     * Register a new kernel
     */
    _handleKernelChanged({ oldValue }: Session.ISessionConnection.IKernelChangedArgs): void;
    /**
     * Reset the message id.
     */
    reset_msg_id(): void;
    add(msg: KernelMessage.IIOPubMessage): void;
    clear_output(wait?: boolean): void;
    get outputs(): OutputAreaModel;
    setOutputs(model?: any, value?: any, options?: any): void;
    widget_manager: WidgetManager;
    private _msgHook;
    private _outputs;
}
export declare class JupyterPhosphorPanelWidget extends Panel {
    constructor(options: JupyterPhosphorWidget.IOptions & Panel.IOptions);
    /**
     * Process the phosphor message.
     *
     * Any custom phosphor widget used inside a Jupyter widget should override
     * the processMessage function like this.
     */
    processMessage(msg: Message): void;
    /**
     * Dispose the widget.
     *
     * This causes the view to be destroyed as well with 'remove'
     */
    dispose(): void;
    private _view;
}
export declare class OutputView extends outputBase.OutputView {
    _createElement(tagName: string): HTMLElement;
    _setElement(el: HTMLElement): void;
    /**
     * Called when view is rendered.
     */
    render(): void;
    remove(): any;
    model: OutputModel;
    _outputView: OutputArea;
    pWidget: Panel;
}
