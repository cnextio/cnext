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
import { DOMWidgetModel, DOMWidgetView } from '../../base';
export var OUTPUT_WIDGET_VERSION = '1.0.0';
var OutputModel = /** @class */ (function (_super) {
    __extends(OutputModel, _super);
    function OutputModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OutputModel.prototype.defaults = function () {
        return __assign(__assign({}, _super.prototype.defaults.call(this)), { _model_name: 'OutputModel', _view_name: 'OutputView', _model_module: '../../output', _view_module: '../../output', _model_module_version: OUTPUT_WIDGET_VERSION, _view_module_version: OUTPUT_WIDGET_VERSION });
    };
    return OutputModel;
}(DOMWidgetModel));
export { OutputModel };
var OutputView = /** @class */ (function (_super) {
    __extends(OutputView, _super);
    function OutputView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OutputView;
}(DOMWidgetView));
export { OutputView };
