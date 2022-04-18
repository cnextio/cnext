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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { DOMWidgetView, unpack_models, ViewList, JupyterPhosphorPanelWidget } from '../../base';
import { CoreDOMWidgetModel } from './widget_core';
import { reject } from './utils';
import { ArrayExt } from '@lumino/algorithm';
import { MessageLoop } from '@lumino/messaging';
import { Widget } from '@lumino/widgets';
import * as _ from 'underscore';
import $ from 'jquery';
var BoxModel = /** @class */ (function (_super) {
    __extends(BoxModel, _super);
    function BoxModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BoxModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _view_name: 'BoxView',
            _model_name: 'BoxModel',
            children: [],
            box_style: ''
        });
    };
    BoxModel.serializers = __assign(__assign({}, CoreDOMWidgetModel.serializers), { children: { deserialize: unpack_models } });
    return BoxModel;
}(CoreDOMWidgetModel));
export { BoxModel };
var HBoxModel = /** @class */ (function (_super) {
    __extends(HBoxModel, _super);
    function HBoxModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HBoxModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _view_name: 'HBoxView',
            _model_name: 'HBoxModel',
        });
    };
    return HBoxModel;
}(BoxModel));
export { HBoxModel };
var VBoxModel = /** @class */ (function (_super) {
    __extends(VBoxModel, _super);
    function VBoxModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VBoxModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _view_name: 'VBoxView',
            _model_name: 'VBoxModel',
        });
    };
    return VBoxModel;
}(BoxModel));
export { VBoxModel };
var BoxView = /** @class */ (function (_super) {
    __extends(BoxView, _super);
    function BoxView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BoxView.prototype._createElement = function (tagName) {
        this.pWidget = new JupyterPhosphorPanelWidget({ view: this });
        return this.pWidget.node;
    };
    BoxView.prototype._setElement = function (el) {
        if (this.el || el !== this.pWidget.node) {
            // Boxes don't allow setting the element beyond the initial creation.
            throw new Error('Cannot reset the DOM element.');
        }
        this.el = this.pWidget.node;
        this.$el = $(this.pWidget.node);
    };
    BoxView.prototype.initialize = function (parameters) {
        _super.prototype.initialize.call(this, parameters);
        this.children_views = new ViewList(this.add_child_model, null, this);
        this.listenTo(this.model, 'change:children', this.update_children);
        this.listenTo(this.model, 'change:box_style', this.update_box_style);
        this.pWidget.addClass('jupyter-widgets');
        this.pWidget.addClass('widget-container');
        this.pWidget.addClass('widget-box');
    };
    BoxView.prototype.render = function () {
        _super.prototype.render.call(this);
        this.update_children();
        this.set_box_style();
    };
    BoxView.prototype.update_children = function () {
        this.children_views.update(this.model.get('children')).then(function (views) {
            // Notify all children that their sizes may have changed.
            views.forEach(function (view) {
                MessageLoop.postMessage(view.pWidget, Widget.ResizeMessage.UnknownSize);
            });
        });
    };
    BoxView.prototype.update_box_style = function () {
        this.update_mapped_classes(BoxView.class_map, 'box_style');
    };
    BoxView.prototype.set_box_style = function () {
        this.set_mapped_classes(BoxView.class_map, 'box_style');
    };
    BoxView.prototype.add_child_model = function (model) {
        var _this = this;
        // we insert a dummy element so the order is preserved when we add
        // the rendered content later.
        var dummy = new Widget();
        this.pWidget.addWidget(dummy);
        return this.create_child_view(model).then(function (view) {
            // replace the dummy widget with the new one.
            var i = ArrayExt.firstIndexOf(_this.pWidget.widgets, dummy);
            _this.pWidget.insertWidget(i, view.pWidget);
            dummy.dispose();
            return view;
        }).catch(reject('Could not add child view to box', true));
    };
    BoxView.prototype.remove = function () {
        this.children_views = null;
        _super.prototype.remove.call(this);
    };
    BoxView.class_map = {
        success: ['alert', 'alert-success'],
        info: ['alert', 'alert-info'],
        warning: ['alert', 'alert-warning'],
        danger: ['alert', 'alert-danger']
    };
    return BoxView;
}(DOMWidgetView));
export { BoxView };
var HBoxView = /** @class */ (function (_super) {
    __extends(HBoxView, _super);
    function HBoxView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Public constructor
     */
    HBoxView.prototype.initialize = function (parameters) {
        _super.prototype.initialize.call(this, parameters);
        this.pWidget.addClass('widget-hbox');
    };
    return HBoxView;
}(BoxView));
export { HBoxView };
var VBoxView = /** @class */ (function (_super) {
    __extends(VBoxView, _super);
    function VBoxView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Public constructor
     */
    VBoxView.prototype.initialize = function (parameters) {
        _super.prototype.initialize.call(this, parameters);
        this.pWidget.addClass('widget-vbox');
    };
    return VBoxView;
}(BoxView));
export { VBoxView };
var GridBoxView = /** @class */ (function (_super) {
    __extends(GridBoxView, _super);
    function GridBoxView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Public constructor
     */
    GridBoxView.prototype.initialize = function (parameters) {
        _super.prototype.initialize.call(this, parameters);
        this.pWidget.addClass('widget-gridbox');
        // display needn't be set to flex and grid 
        this.pWidget.removeClass('widget-box');
    };
    return GridBoxView;
}(BoxView));
export { GridBoxView };
var GridBoxModel = /** @class */ (function (_super) {
    __extends(GridBoxModel, _super);
    function GridBoxModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GridBoxModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _view_name: 'GridBoxView',
            _model_name: 'GridBoxModel',
        });
    };
    return GridBoxModel;
}(BoxModel));
export { GridBoxModel };
