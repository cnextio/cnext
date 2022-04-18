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
import { DOMWidgetModel, DOMWidgetView, StyleModel } from '../../base';
import { typeset } from './utils';
import { JUPYTER_CONTROLS_VERSION } from './version';
var DescriptionStyleModel = /** @class */ (function (_super) {
    __extends(DescriptionStyleModel, _super);
    function DescriptionStyleModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DescriptionStyleModel.prototype.defaults = function () {
        return __assign(__assign({}, _super.prototype.defaults.call(this)), { _model_name: 'DescriptionStyleModel', _model_module: '../../controls', _model_module_version: JUPYTER_CONTROLS_VERSION });
    };
    DescriptionStyleModel.styleProperties = {
        description_width: {
            selector: '.widget-label',
            attribute: 'width',
            default: null
        },
    };
    return DescriptionStyleModel;
}(StyleModel));
export { DescriptionStyleModel };
var DescriptionModel = /** @class */ (function (_super) {
    __extends(DescriptionModel, _super);
    function DescriptionModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DescriptionModel.prototype.defaults = function () {
        return __assign(__assign({}, _super.prototype.defaults.call(this)), { _model_name: 'DescriptionModel', _view_name: 'DescriptionView', _view_module: '../../controls', _model_module: '../../controls', _view_module_version: JUPYTER_CONTROLS_VERSION, _model_module_version: JUPYTER_CONTROLS_VERSION, description: '', description_tooltip: null });
    };
    return DescriptionModel;
}(DOMWidgetModel));
export { DescriptionModel };
var DescriptionView = /** @class */ (function (_super) {
    __extends(DescriptionView, _super);
    function DescriptionView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DescriptionView.prototype.render = function () {
        this.label = document.createElement('label');
        this.el.appendChild(this.label);
        this.label.className = 'widget-label';
        this.label.style.display = 'none';
        this.listenTo(this.model, 'change:description', this.updateDescription);
        this.listenTo(this.model, 'change:description_tooltip', this.updateDescription);
        this.updateDescription();
    };
    DescriptionView.prototype.typeset = function (element, text) {
        this.displayed.then(function () { return typeset(element, text); });
    };
    DescriptionView.prototype.updateDescription = function () {
        var description = this.model.get('description');
        var description_tooltip = this.model.get('description_tooltip');
        if (description_tooltip === null) {
            description_tooltip = description;
        }
        if (description.length === 0) {
            this.label.style.display = 'none';
        }
        else {
            this.label.innerHTML = description;
            this.typeset(this.label);
            this.label.style.display = '';
        }
        this.label.title = description_tooltip;
    };
    return DescriptionView;
}(DOMWidgetView));
export { DescriptionView };
/**
 * For backwards compatibility with jupyter-js-widgets 2.x.
 *
 * Use DescriptionModel instead.
 */
var LabeledDOMWidgetModel = /** @class */ (function (_super) {
    __extends(LabeledDOMWidgetModel, _super);
    function LabeledDOMWidgetModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return LabeledDOMWidgetModel;
}(DescriptionModel));
export { LabeledDOMWidgetModel };
/**
 * For backwards compatibility with jupyter-js-widgets 2.x.
 *
 * Use DescriptionView instead.
 */
var LabeledDOMWidgetView = /** @class */ (function (_super) {
    __extends(LabeledDOMWidgetView, _super);
    function LabeledDOMWidgetView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return LabeledDOMWidgetView;
}(DescriptionView));
export { LabeledDOMWidgetView };
