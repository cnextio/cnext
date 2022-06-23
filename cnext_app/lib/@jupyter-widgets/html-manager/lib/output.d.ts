import * as outputBase from '@jupyter-widgets/output';
import { Panel } from '@lumino/widgets';
import { OutputAreaModel } from '@jupyterlab/outputarea';
import { HTMLManager } from './htmlmanager';
import '../css/output.css';
export declare class OutputModel extends outputBase.OutputModel {
    defaults(): any;
    initialize(attributes: any, options: any): void;
    get outputs(): OutputAreaModel;
    clear_output(wait?: boolean): void;
    setOutputs(model?: any, value?: any, options?: any): void;
    private _outputs;
    widget_manager: HTMLManager;
}
export declare class OutputView extends outputBase.OutputView {
    _createElement(tagName: string): HTMLElement;
    _setElement(el: HTMLElement): void;
    render(): void;
    model: OutputModel;
    private _outputView;
    pWidget: Panel;
}
