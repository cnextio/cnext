// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
export { uuid, WrappedError, resolvePromisesDict } from '../../base';
import { WrappedError } from '../../base';
/**
 * Creates a wrappable Promise rejection function.
 *
 * Creates a function that returns a Promise.reject with a new WrappedError
 * that has the provided message and wraps the original error that
 * caused the promise to reject.
 */
export function reject(message, log) {
    return function promiseRejection(error) {
        var wrapped_error = new WrappedError(message, error);
        if (log) {
            console.error(wrapped_error);
        }
        return Promise.reject(wrapped_error);
    };
}
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
export function typeset(element, text) {
    if (text !== void 0) {
        element.textContent = text;
    }
    if (window.MathJax !== void 0) {
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, element]);
    }
}
/**
 * escape text to HTML
 */
export function escape_html(text) {
    var esc = document.createElement('div');
    esc.textContent = text;
    return esc.innerHTML;
}
