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
import { ArrayExt } from '@lumino/algorithm';
import { Signal } from '@lumino/signaling';
import { Panel, PanelLayout, Widget } from '@lumino/widgets';
import { Selection } from './currentselection';
/**
 * The class name added to Collapse instances.
 */
var COLLAPSE_CLASS = 'p-Collapse';
/**
 * The class name added to a Collapse's header.
 */
var COLLAPSE_HEADER_CLASS = 'p-Collapse-header';
/**
 * The class name added to a Collapse's contents.
 */
var COLLAPSE_CONTENTS_CLASS = 'p-Collapse-contents';
/**
 * The class name added to a Collapse when it is opened
 */
var COLLAPSE_CLASS_OPEN = 'p-Collapse-open';
/**
 * A panel that supports a collapsible header, made from the widget's title.
 * Clicking on the title expands or contracts the widget.
 */
var Collapse = /** @class */ (function (_super) {
    __extends(Collapse, _super);
    function Collapse(options) {
        var _this = _super.call(this, options) || this;
        _this._collapseChanged = new Signal(_this);
        _this.addClass(COLLAPSE_CLASS);
        _this._header = new Widget();
        _this._header.addClass(COLLAPSE_HEADER_CLASS);
        _this._header.node.addEventListener('click', _this);
        // Fontawesome icon for caret
        var icon = document.createElement('i');
        icon.classList.add('fa', 'fa-fw', 'fa-caret-right');
        _this._header.node.appendChild(icon);
        // Label content
        _this._header.node.appendChild(document.createElement('span'));
        _this._content = new Panel();
        _this._content.addClass(COLLAPSE_CONTENTS_CLASS);
        var layout = new PanelLayout();
        _this.layout = layout;
        layout.addWidget(_this._header);
        layout.addWidget(_this._content);
        if (options.widget) {
            _this.widget = options.widget;
        }
        _this.collapsed = false;
        return _this;
    }
    Collapse.prototype.dispose = function () {
        if (this.isDisposed) {
            return;
        }
        _super.prototype.dispose.call(this);
        this._header = null;
        this._widget = null;
        this._content = null;
    };
    Object.defineProperty(Collapse.prototype, "widget", {
        get: function () {
            return this._widget;
        },
        set: function (widget) {
            var oldWidget = this._widget;
            if (oldWidget) {
                oldWidget.disposed.disconnect(this._onChildDisposed, this);
                oldWidget.title.changed.disconnect(this._onTitleChanged, this);
                oldWidget.parent = null;
            }
            this._widget = widget;
            widget.disposed.connect(this._onChildDisposed, this);
            widget.title.changed.connect(this._onTitleChanged, this);
            this._onTitleChanged(widget.title);
            this._content.addWidget(widget);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Collapse.prototype, "collapsed", {
        get: function () {
            return this._collapsed;
        },
        set: function (value) {
            // TODO: should we have this check here?
            if (value === this._collapsed) {
                return;
            }
            if (value) {
                this._collapse();
            }
            else {
                this._uncollapse();
            }
        },
        enumerable: true,
        configurable: true
    });
    Collapse.prototype.toggle = function () {
        this.collapsed = !this.collapsed;
    };
    Object.defineProperty(Collapse.prototype, "collapseChanged", {
        get: function () {
            return this._collapseChanged;
        },
        enumerable: true,
        configurable: true
    });
    Collapse.prototype._collapse = function () {
        this._collapsed = true;
        if (this._content) {
            this._content.hide();
        }
        this.removeClass(COLLAPSE_CLASS_OPEN);
        this._header.node.children[0].classList.add('fa-caret-right');
        this._header.node.children[0].classList.remove('fa-caret-down');
        this._collapseChanged.emit(void 0);
    };
    Collapse.prototype._uncollapse = function () {
        this._collapsed = false;
        if (this._content) {
            this._content.show();
        }
        this.addClass(COLLAPSE_CLASS_OPEN);
        this._header.node.children[0].classList.add('fa-caret-down');
        this._header.node.children[0].classList.remove('fa-caret-right');
        this._collapseChanged.emit(void 0);
    };
    /**
     * Handle the DOM events for the Collapse widget.
     *
     * @param event - The DOM event sent to the panel.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the panel's DOM node. It should
     * not be called directly by user code.
     */
    Collapse.prototype.handleEvent = function (event) {
        switch (event.type) {
            case 'click':
                this._evtClick(event);
                break;
            default:
                break;
        }
    };
    Collapse.prototype._evtClick = function (event) {
        this.toggle();
    };
    /**
     * Handle the `changed` signal of a title object.
     */
    Collapse.prototype._onTitleChanged = function (sender) {
        this._header.node.children[1].textContent = this._widget.title.label;
    };
    Collapse.prototype._onChildDisposed = function (sender) {
        this.dispose();
    };
    return Collapse;
}(Widget));
export { Collapse };
/**
 * The class name added to Accordion instances.
 */
var ACCORDION_CLASS = 'p-Accordion';
/**
 * The class name added to an Accordion child.
 */
var ACCORDION_CHILD_CLASS = 'p-Accordion-child';
var ACCORDION_CHILD_ACTIVE_CLASS = 'p-Accordion-child-active';
/**
 * A panel that supports a collapsible header, made from the widget's title.
 * Clicking on the title expands or contracts the widget.
 */
var Accordion = /** @class */ (function (_super) {
    __extends(Accordion, _super);
    function Accordion(options) {
        var _this = _super.call(this, options) || this;
        _this._selection = new Selection(_this.widgets);
        _this._selection.selectionChanged.connect(_this._onSelectionChanged, _this);
        _this.addClass(ACCORDION_CLASS);
        return _this;
    }
    Object.defineProperty(Accordion.prototype, "collapseWidgets", {
        /**
         * A read-only sequence of the widgets in the panel.
         *
         * #### Notes
         * This is a read-only property.
         */
        /*  get widgets(): ISequence<Widget> {
            return new ArraySequence(toArray(map((this.layout as PanelLayout).widgets, (w: Collapse) => w.widget)));
          }
        */
        get: function () {
            return this.layout.widgets;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Accordion.prototype, "selection", {
        get: function () {
            return this._selection;
        },
        enumerable: true,
        configurable: true
    });
    Accordion.prototype.indexOf = function (widget) {
        return ArrayExt.findFirstIndex(this.collapseWidgets, function (w) { return w.widget === widget; });
    };
    /**
     * Add a widget to the end of the accordion.
     *
     * @param widget - The widget to add to the accordion.
     *
     * @returns The Collapse widget wrapping the added widget.
     *
     * #### Notes
     * The widget will be wrapped in a CollapsedWidget.
     */
    Accordion.prototype.addWidget = function (widget) {
        var collapse = this._wrapWidget(widget);
        collapse.collapsed = true;
        _super.prototype.addWidget.call(this, collapse);
        this._selection.adjustSelectionForInsert(this.widgets.length - 1, collapse);
        return collapse;
    };
    /**
     * Insert a widget at the specified index.
     *
     * @param index - The index at which to insert the widget.
     *
     * @param widget - The widget to insert into to the accordion.
     *
     * #### Notes
     * If the widget is already contained in the panel, it will be moved.
     */
    Accordion.prototype.insertWidget = function (index, widget) {
        var collapse = this._wrapWidget(widget);
        collapse.collapsed = true;
        _super.prototype.insertWidget.call(this, index, collapse);
        this._selection.adjustSelectionForInsert(index, collapse);
    };
    Accordion.prototype.removeWidget = function (widget) {
        var index = this.indexOf(widget);
        if (index >= 0) {
            var collapse = this.collapseWidgets[index];
            widget.parent = null;
            collapse.dispose();
            this._selection.adjustSelectionForRemove(index, null);
        }
    };
    Accordion.prototype._wrapWidget = function (widget) {
        var collapse = new Collapse({ widget: widget });
        collapse.addClass(ACCORDION_CHILD_CLASS);
        collapse.collapseChanged.connect(this._onCollapseChange, this);
        return collapse;
    };
    Accordion.prototype._onCollapseChange = function (sender) {
        if (!sender.collapsed) {
            this._selection.value = sender;
        }
        else if (this._selection.value === sender && sender.collapsed) {
            this._selection.value = null;
        }
    };
    Accordion.prototype._onSelectionChanged = function (sender, change) {
        // Collapse previous widget, open current widget
        var pv = change.previousValue;
        var cv = change.currentValue;
        if (pv) {
            pv.collapsed = true;
            pv.removeClass(ACCORDION_CHILD_ACTIVE_CLASS);
        }
        if (cv) {
            cv.collapsed = false;
            cv.addClass(ACCORDION_CHILD_ACTIVE_CLASS);
        }
    };
    return Accordion;
}(Panel));
export { Accordion };
