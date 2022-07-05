export { uuid, WrappedError, resolvePromisesDict } from '@jupyter-widgets/base';
/**
 * Creates a wrappable Promise rejection function.
 *
 * Creates a function that returns a Promise.reject with a new WrappedError
 * that has the provided message and wraps the original error that
 * caused the promise to reject.
 */
export declare function reject(message: any, log: any): (error: any) => Promise<never>;
/**
 * Apply MathJax rendering to an element, and optionally set its text.
 *
 * If MathJax is not available, make no changes.
 *
 * Parameters
 * ----------
 * element: Node
 * text: optional string
 */
export declare function typeset(element: HTMLElement, text?: string): void;
/**
 * escape text to HTML
 */
export declare function escape_html(text: string): string;
