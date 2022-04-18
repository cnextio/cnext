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
import { DOMWidgetView, ViewList } from '../../base';
import { BoxModel } from './widget_box';
import { TabPanel } from './phosphor/tabpanel';
import { Accordion } from './phosphor/accordion';
import { Widget } from '@lumino/widgets';
import { each, ArrayExt } from '@lumino/algorithm';
import { MessageLoop } from '@lumino/messaging';
import * as _ from 'underscore';
import * as utils from './utils';
import $ from 'jquery';
var SelectionContainerModel = /** @class */ (function (_super) {
    __extends(SelectionContainerModel, _super);
    function SelectionContainerModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SelectionContainerModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _model_name: 'SelectionContainerModel',
            selected_index: 0,
            _titles: {}
        });
    };
    return SelectionContainerModel;
}(BoxModel));
export { SelectionContainerModel };
var AccordionModel = /** @class */ (function (_super) {
    __extends(AccordionModel, _super);
    function AccordionModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AccordionModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _model_name: 'AccordionModel',
            _view_name: 'AccordionView'
        });
    };
    return AccordionModel;
}(SelectionContainerModel));
export { AccordionModel };
// We implement our own tab widget since Phoshpor's TabPanel uses an absolute
// positioning BoxLayout, but we want a more an html/css-based Panel layout.
var JupyterPhosphorAccordionWidget = /** @class */ (function (_super) {
    __extends(JupyterPhosphorAccordionWidget, _super);
    function JupyterPhosphorAccordionWidget(options) {
        var _this = this;
        var view = options.view;
        delete options.view;
        _this = _super.call(this, options) || this;
        _this._view = view;
        return _this;
    }
    /**
     * Process the phosphor message.
     *
     * Any custom phosphor widget used inside a Jupyter widget should override
     * the processMessage function like this.
     */
    JupyterPhosphorAccordionWidget.prototype.processMessage = function (msg) {
        _super.prototype.processMessage.call(this, msg);
        this._view.processPhosphorMessage(msg);
    };
    /**
     * Dispose the widget.
     *
     * This causes the view to be destroyed as well with 'remove'
     */
    JupyterPhosphorAccordionWidget.prototype.dispose = function () {
        if (this.isDisposed) {
            return;
        }
        _super.prototype.dispose.call(this);
        if (this._view) {
            this._view.remove();
        }
        this._view = null;
    };
    return JupyterPhosphorAccordionWidget;
}(Accordion));
export { JupyterPhosphorAccordionWidget };
var AccordionView = /** @class */ (function (_super) {
    __extends(AccordionView, _super);
    function AccordionView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AccordionView.prototype._createElement = function (tagName) {
        this.pWidget = new JupyterPhosphorAccordionWidget({ view: this });
        return this.pWidget.node;
    };
    AccordionView.prototype._setElement = function (el) {
        if (this.el || el !== this.pWidget.node) {
            // Accordions don't allow setting the element beyond the initial creation.
            throw new Error('Cannot reset the DOM element.');
        }
        this.el = this.pWidget.node;
        this.$el = $(this.pWidget.node);
    };
    AccordionView.prototype.initialize = function (parameters) {
        var _this = this;
        _super.prototype.initialize.call(this, parameters);
        this.children_views = new ViewList(this.add_child_view, this.remove_child_view, this);
        this.listenTo(this.model, 'change:children', function () { return _this.updateChildren(); });
        this.listenTo(this.model, 'change:selected_index', function () { return _this.update_selected_index(); });
        this.listenTo(this.model, 'change:_titles', function () { return _this.update_titles(); });
    };
    /**
     * Called when view is rendered.
     */
    AccordionView.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        var accordion = this.pWidget;
        accordion.addClass('jupyter-widgets');
        accordion.addClass('widget-accordion');
        accordion.addClass('widget-container');
        accordion.selection.selectionChanged.connect(function (sender) {
            if (!_this.updatingChildren) {
                _this.model.set('selected_index', accordion.selection.index);
                _this.touch();
            }
        });
        this.children_views.update(this.model.get('children'));
        this.update_titles();
        this.update_selected_index();
    };
    /**
     * Update children
     */
    AccordionView.prototype.updateChildren = function () {
        // While we are updating, the index may not be valid, so deselect the
        // tabs before updating so we don't get spurious changes in the index,
        // which would then set off another sync cycle.
        this.updatingChildren = true;
        this.pWidget.selection.index = null;
        this.children_views.update(this.model.get('children'));
        this.update_selected_index();
        this.updatingChildren = false;
    };
    /**
     * Set header titles
     */
    AccordionView.prototype.update_titles = function () {
        var collapsed = this.pWidget.collapseWidgets;
        var titles = this.model.get('_titles');
        for (var i = 0; i < collapsed.length; i++) {
            if (titles[i] !== void 0) {
                collapsed[i].widget.title.label = titles[i];
            }
        }
    };
    /**
     * Make the rendering and selected index consistent.
     */
    AccordionView.prototype.update_selected_index = function () {
        this.pWidget.selection.index = this.model.get('selected_index');
    };
    /**
     * Called when a child is removed from children list.
     */
    AccordionView.prototype.remove_child_view = function (view) {
        this.pWidget.removeWidget(view.pWidget);
        view.remove();
    };
    /**
     * Called when a child is added to children list.
     */
    AccordionView.prototype.add_child_view = function (model, index) {
        // Placeholder widget to keep our position in the tab panel while we create the view.
        var accordion = this.pWidget;
        var placeholder = new Widget();
        placeholder.title.label = this.model.get('_titles')[index] || '';
        accordion.addWidget(placeholder);
        return this.create_child_view(model).then(function (view) {
            var widget = view.pWidget;
            widget.title.label = placeholder.title.label;
            var collapse = accordion.collapseWidgets[accordion.indexOf(placeholder)];
            collapse.widget = widget;
            placeholder.dispose();
            return view;
        }).catch(utils.reject('Could not add child view to box', true));
    };
    AccordionView.prototype.remove = function () {
        this.children_views = null;
        _super.prototype.remove.call(this);
    };
    return AccordionView;
}(DOMWidgetView));
export { AccordionView };
var TabModel = /** @class */ (function (_super) {
    __extends(TabModel, _super);
    function TabModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TabModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _model_name: 'TabModel',
            _view_name: 'TabView'
        });
    };
    return TabModel;
}(SelectionContainerModel));
export { TabModel };
// We implement our own tab widget since Phoshpor's TabPanel uses an absolute
// positioning BoxLayout, but we want a more an html/css-based Panel layout.
var JupyterPhosphorTabPanelWidget = /** @class */ (function (_super) {
    __extends(JupyterPhosphorTabPanelWidget, _super);
    function JupyterPhosphorTabPanelWidget(options) {
        var _this = this;
        var view = options.view;
        delete options.view;
        _this = _super.call(this, options) || this;
        _this._view = view;
        // We want the view's messages to be the messages the tabContents panel
        // gets.
        MessageLoop.installMessageHook(_this.tabContents, function (handler, msg) {
            // There may be times when we want the view's handler to be called
            // *after* the message has been processed by the widget, in which
            // case we'll need to revisit using a message hook.
            _this._view.processPhosphorMessage(msg);
            return true;
        });
        return _this;
    }
    /**
     * Dispose the widget.
     *
     * This causes the view to be destroyed as well with 'remove'
     */
    JupyterPhosphorTabPanelWidget.prototype.dispose = function () {
        if (this.isDisposed) {
            return;
        }
        _super.prototype.dispose.call(this);
        if (this._view) {
            this._view.remove();
        }
        this._view = null;
    };
    return JupyterPhosphorTabPanelWidget;
}(TabPanel));
export { JupyterPhosphorTabPanelWidget };
var TabView = /** @class */ (function (_super) {
    __extends(TabView, _super);
    function TabView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.updatingTabs = false;
        return _this;
    }
    TabView.prototype._createElement = function (tagName) {
        this.pWidget = new JupyterPhosphorTabPanelWidget({
            view: this,
        });
        return this.pWidget.node;
    };
    TabView.prototype._setElement = function (el) {
        if (this.el || el !== this.pWidget.node) {
            // TabViews don't allow setting the element beyond the initial creation.
            throw new Error('Cannot reset the DOM element.');
        }
        this.el = this.pWidget.node;
        this.$el = $(this.pWidget.node);
    };
    /**
     * Public constructor.
     */
    TabView.prototype.initialize = function (parameters) {
        var _this = this;
        _super.prototype.initialize.call(this, parameters);
        this.childrenViews = new ViewList(this.addChildView, function (view) { view.remove(); }, this);
        this.listenTo(this.model, 'change:children', function () { return _this.updateTabs(); });
        this.listenTo(this.model, 'change:_titles', function () { return _this.updateTitles(); });
    };
    /**
     * Called when view is rendered.
     */
    TabView.prototype.render = function () {
        _super.prototype.render.call(this);
        var tabs = this.pWidget;
        tabs.addClass('jupyter-widgets');
        tabs.addClass('widget-container');
        tabs.addClass('widget-tab');
        tabs.tabsMovable = true;
        tabs.tabBar.insertBehavior = 'none'; // needed for insert behavior, see below.
        tabs.tabBar.currentChanged.connect(this._onTabChanged, this);
        tabs.tabBar.tabMoved.connect(this._onTabMoved, this);
        tabs.tabBar.addClass('widget-tab-bar');
        tabs.tabContents.addClass('widget-tab-contents');
        // TODO: expose this option in python
        tabs.tabBar.tabsMovable = false;
        this.updateTabs();
        this.update();
    };
    /**
     * Render tab views based on the current model's children.
     */
    TabView.prototype.updateTabs = function () {
        // While we are updating, the index may not be valid, so deselect the
        // tabs before updating so we don't get spurious changes in the index,
        // which would then set off another sync cycle.
        this.updatingTabs = true;
        this.pWidget.currentIndex = null;
        this.childrenViews.update(this.model.get('children'));
        this.pWidget.currentIndex = this.model.get('selected_index');
        this.updatingTabs = false;
    };
    /**
     * Called when a child is added to children list.
     */
    TabView.prototype.addChildView = function (model, index) {
        // Placeholder widget to keep our position in the tab panel while we create the view.
        var label = this.model.get('_titles')[index] || '';
        var tabs = this.pWidget;
        var placeholder = new Widget();
        placeholder.title.label = label;
        tabs.addWidget(placeholder);
        return this.create_child_view(model).then(function (view) {
            var widget = view.pWidget;
            widget.title.label = placeholder.title.label;
            widget.title.closable = false;
            var i = ArrayExt.firstIndexOf(tabs.widgets, placeholder);
            // insert after placeholder so that if placholder is selected, the
            // real widget will be selected now (this depends on the tab bar
            // insert behavior)
            tabs.insertWidget(i + 1, widget);
            placeholder.dispose();
            return view;
        }).catch(utils.reject('Could not add child view to box', true));
    };
    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    TabView.prototype.update = function () {
        // Update the selected index in the overall update method because it
        // should be run after the tabs have been updated. Otherwise the
        // selected index may not be a valid tab in the tab bar.
        this.updateSelectedIndex();
        return _super.prototype.update.call(this);
    };
    /**
     * Updates the tab page titles.
     */
    TabView.prototype.updateTitles = function () {
        var titles = this.model.get('_titles') || {};
        each(this.pWidget.widgets, function (widget, i) {
            widget.title.label = titles[i] || '';
        });
    };
    /**
     * Updates the selected index.
     */
    TabView.prototype.updateSelectedIndex = function () {
        this.pWidget.currentIndex = this.model.get('selected_index');
    };
    TabView.prototype.remove = function () {
        this.childrenViews = null;
        _super.prototype.remove.call(this);
    };
    TabView.prototype._onTabChanged = function (sender, args) {
        if (!this.updatingTabs) {
            var i = args.currentIndex;
            this.model.set('selected_index', i === -1 ? null : i);
            this.touch();
        }
    };
    /**
     * Handle the `tabMoved` signal from the tab bar.
     */
    TabView.prototype._onTabMoved = function (sender, args) {
        var children = this.model.get('children').slice();
        ArrayExt.move(children, args.fromIndex, args.toIndex);
        this.model.set('children', children);
        this.touch();
    };
    return TabView;
}(DOMWidgetView));
export { TabView };
