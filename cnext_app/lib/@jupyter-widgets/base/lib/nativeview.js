// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/*
 This file contains substantial portions of https://github.com/akre54/Backbone.NativeView/blob/521188d9554b53d95d70ed34f878d8ac9fc10df2/backbone.nativeview.js, which has the following license:

(c) 2015 Adam Krebs, Jimmy Yuen Ho Wong
Backbone.NativeView may be freely distributed under the MIT license.

Copyright (c) 2014 Adam Krebs

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/
import * as Backbone from 'backbone';
// Caches a local reference to `Element.prototype` for faster access.
var ElementProto = Element.prototype; // : typeof Element = (typeof Element !== 'undefined' && Element.prototype) || {};
// Find the right `Element#matches` for IE>=9 and modern browsers.
var matchesSelector = ElementProto.matches ||
    ElementProto['webkitMatchesSelector'] ||
    ElementProto['mozMatchesSelector'] ||
    ElementProto['msMatchesSelector'] ||
    ElementProto['oMatchesSelector'] ||
    function matches(selector) {
        /* tslint:disable:no-invalid-this */
        var matches = (this.document || this.ownerDocument).querySelectorAll(selector);
        var i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) {
            continue;
        }
        return i > -1;
        /* tslint:enable:no-invalid-this */
    };
var NativeView = /** @class */ (function (_super) {
    __extends(NativeView, _super);
    function NativeView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NativeView.prototype._removeElement = function () {
        this.undelegateEvents();
        if (this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
    };
    // Apply the `element` to the view.
    NativeView.prototype._setElement = function (element) {
        this.el = element;
    };
    // Set a hash of attributes to the view's `el`. We use the "prop" version
    // if available, falling back to `setAttribute` for the catch-all.
    NativeView.prototype._setAttributes = function (attrs) {
        for (var attr in attrs) {
            attr in this.el ? this.el[attr] = attrs[attr] : this.el.setAttribute(attr, attrs[attr]);
        }
    };
    /**
     * Make an event delegation handler for the given `eventName` and `selector`
     * and attach it to `this.el`.
     * If selector is empty, the listener will be bound to `this.el`. If not, a
     * new handler that will recursively traverse up the event target's DOM
     * hierarchy looking for a node that matches the selector. If one is found,
     * the event's `delegateTarget` property is set to it and the return the
     * result of calling bound `listener` with the parameters given to the
     * handler.
     *
     * This does not properly handle selectors for things like focus and blur (see
     * https://github.com/jquery/jquery/blob/7d21f02b9ec9f655583e898350badf89165ed4d5/src/event.js#L442
     * for some similar exceptional cases).
     */
    NativeView.prototype.delegate = function (eventName, selector, listener) {
        if (typeof selector !== 'string') {
            listener = selector;
            selector = null;
        }
        // We have to initialize this here, instead of in the constructor, because the
        // super constructor eventually calls this method before we get a chance to initialize
        // this._domEvents to an empty list.
        if (this._domEvents === void 0) {
            this._domEvents = [];
        }
        var root = this.el;
        var handler = selector ? function (e) {
            var node = e.target || e.srcElement;
            for (; node && node !== root; node = node.parentNode) {
                if (matchesSelector.call(node, selector)) {
                    e.delegateTarget = node;
                    if (listener.handleEvent) {
                        return listener.handleEvent(e);
                    }
                    else {
                        return listener(e);
                    }
                }
            }
        } : listener;
        this.el.addEventListener(eventName, handler, false);
        this._domEvents.push({ eventName: eventName, handler: handler, listener: listener, selector: selector });
        return handler;
    };
    // Remove a single delegated event. Either `eventName` or `selector` must
    // be included, `selector` and `listener` are optional.
    NativeView.prototype.undelegate = function (eventName, selector, listener) {
        if (typeof selector === 'function') {
            listener = selector;
            selector = null;
        }
        if (this.el && this._domEvents) {
            var handlers = this._domEvents.slice();
            var i = handlers.length;
            while (i--) {
                var item = handlers[i];
                var match = item.eventName === eventName &&
                    (listener ? item.listener === listener : true) &&
                    (selector ? item.selector === selector : true);
                if (!match) {
                    continue;
                }
                this.el.removeEventListener(item.eventName, item.handler, false);
                this._domEvents.splice(i, 1);
            }
        }
        return this;
    };
    // Remove all events created with `delegate` from `el`
    NativeView.prototype.undelegateEvents = function () {
        if (this.el && this._domEvents) {
            var len = this._domEvents.length;
            for (var i = 0; i < len; i++) {
                var item = this._domEvents[i];
                this.el.removeEventListener(item.eventName, item.handler, false);
            }
            this._domEvents.length = 0;
        }
        return this;
    };
    return NativeView;
}(Backbone.View));
export { NativeView };
