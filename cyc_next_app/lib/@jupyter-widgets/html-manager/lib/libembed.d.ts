import 'font-awesome/css/font-awesome.css';
import '@lumino/widgets/style/index.css';
import '@jupyter-widgets/controls/css/widgets-base.css';
import { HTMLManager } from './index';
/**
 * Render the inline widgets inside a DOM element.
 *
 * @param managerFactory A function that returns a new HTMLManager
 * @param element (default document.documentElement) The document element in which to process for widget state.
 */
export declare function renderWidgets(managerFactory: () => HTMLManager, element?: HTMLElement): void;
