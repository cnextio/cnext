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
import { unpack_models } from '../../base';
import { CoreWidgetModel } from './widget_core';
import * as _ from 'underscore';
var DirectionalLinkModel = /** @class */ (function (_super) {
    __extends(DirectionalLinkModel, _super);
    function DirectionalLinkModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DirectionalLinkModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            target: undefined,
            source: undefined,
            _model_name: 'DirectionalLinkModel'
        });
    };
    DirectionalLinkModel.prototype.initialize = function (attributes, options) {
        _super.prototype.initialize.call(this, attributes, options);
        this.on('change', this.updateBindings, this);
        this.updateBindings();
    };
    DirectionalLinkModel.prototype.updateValue = function (sourceModel, sourceAttr, targetModel, targetAttr) {
        if (this._updating) {
            return;
        }
        this._updating = true;
        try {
            if (targetModel) {
                targetModel.set(targetAttr, sourceModel.get(sourceAttr));
                targetModel.save_changes();
            }
        }
        finally {
            this._updating = false;
        }
    };
    DirectionalLinkModel.prototype.updateBindings = function () {
        var _a, _b;
        var _this = this;
        this.cleanup();
        _a = this.get('source') || [null, null], this.sourceModel = _a[0], this.sourceAttr = _a[1];
        _b = this.get('target') || [null, null], this.targetModel = _b[0], this.targetAttr = _b[1];
        if (this.sourceModel) {
            this.listenTo(this.sourceModel, 'change:' + this.sourceAttr, function () {
                _this.updateValue(_this.sourceModel, _this.sourceAttr, _this.targetModel, _this.targetAttr);
            });
            this.updateValue(this.sourceModel, this.sourceAttr, this.targetModel, this.targetAttr);
            this.listenToOnce(this.sourceModel, 'destroy', this.cleanup);
        }
        if (this.targetModel) {
            this.listenToOnce(this.targetModel, 'destroy', this.cleanup);
        }
    };
    DirectionalLinkModel.prototype.cleanup = function () {
        // Stop listening to 'change' and 'destroy' events of the source and target
        if (this.sourceModel) {
            this.stopListening(this.sourceModel, 'change:' + this.sourceAttr, null);
            this.stopListening(this.sourceModel, 'destroy', null);
        }
        if (this.targetModel) {
            this.stopListening(this.targetModel, 'destroy', null);
        }
    };
    DirectionalLinkModel.serializers = __assign(__assign({}, CoreWidgetModel.serializers), { target: { deserialize: unpack_models }, source: { deserialize: unpack_models } });
    return DirectionalLinkModel;
}(CoreWidgetModel));
export { DirectionalLinkModel };
var LinkModel = /** @class */ (function (_super) {
    __extends(LinkModel, _super);
    function LinkModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LinkModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _model_name: 'LinkModel'
        });
    };
    LinkModel.prototype.updateBindings = function () {
        var _this = this;
        _super.prototype.updateBindings.call(this);
        if (this.targetModel) {
            this.listenTo(this.targetModel, 'change:' + this.targetAttr, function () {
                _this.updateValue(_this.targetModel, _this.targetAttr, _this.sourceModel, _this.sourceAttr);
            });
        }
    };
    LinkModel.prototype.cleanup = function () {
        _super.prototype.cleanup.call(this);
        if (this.targetModel) {
            this.stopListening(this.targetModel, 'change:' + this.targetAttr, null);
        }
    };
    return LinkModel;
}(DirectionalLinkModel));
export { LinkModel };
