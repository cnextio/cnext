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
// widget_core implements some common patterns for the core widget collection
// that are not to be used directly by third-party widget authors.
import { DOMWidgetModel, WidgetModel } from '../../base';
import { DescriptionModel } from './widget_description';
import { JUPYTER_CONTROLS_VERSION } from './version';
import * as _ from 'underscore';
var CoreWidgetModel = /** @class */ (function (_super) {
    __extends(CoreWidgetModel, _super);
    function CoreWidgetModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CoreWidgetModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _model_name: 'CoreWidgetModel',
            _view_module: '../../controls',
            _model_module: '../../controls',
            _view_module_version: JUPYTER_CONTROLS_VERSION,
            _model_module_version: JUPYTER_CONTROLS_VERSION,
        });
    };
    return CoreWidgetModel;
}(WidgetModel));
export { CoreWidgetModel };
var CoreDOMWidgetModel = /** @class */ (function (_super) {
    __extends(CoreDOMWidgetModel, _super);
    function CoreDOMWidgetModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CoreDOMWidgetModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _model_name: 'CoreDOMWidgetModel',
            _view_module: '../../controls',
            _model_module: '../../controls',
            _view_module_version: JUPYTER_CONTROLS_VERSION,
            _model_module_version: JUPYTER_CONTROLS_VERSION,
        });
    };
    return CoreDOMWidgetModel;
}(DOMWidgetModel));
export { CoreDOMWidgetModel };
var CoreDescriptionModel = /** @class */ (function (_super) {
    __extends(CoreDescriptionModel, _super);
    function CoreDescriptionModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CoreDescriptionModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _model_name: 'CoreDescriptionModel',
            _view_module: '../../controls',
            _model_module: '../../controls',
            _view_module_version: JUPYTER_CONTROLS_VERSION,
            _model_module_version: JUPYTER_CONTROLS_VERSION,
        });
    };
    return CoreDescriptionModel;
}(DescriptionModel));
export { CoreDescriptionModel };
