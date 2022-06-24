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
import { assign } from './utils';
import { WidgetModel, WidgetView } from './widget';
var StyleModel = /** @class */ (function (_super) {
    __extends(StyleModel, _super);
    function StyleModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StyleModel.prototype.defaults = function () {
        var Derived = this.constructor;
        return assign(_super.prototype.defaults.call(this), {
            _model_name: 'StyleModel',
            _view_name: 'StyleView',
        }, Object.keys(Derived.styleProperties).reduce(function (obj, key) {
            obj[key] = Derived.styleProperties[key].default;
            return obj;
        }, {}));
    };
    StyleModel.styleProperties = {};
    return StyleModel;
}(WidgetModel));
export { StyleModel };
var StyleView = /** @class */ (function (_super) {
    __extends(StyleView, _super);
    function StyleView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Public constructor
     */
    StyleView.prototype.initialize = function (parameters) {
        this._traitNames = [];
        _super.prototype.initialize.call(this, parameters);
        // Register the traits that live on the Python side
        var ModelType = this.model.constructor;
        for (var _i = 0, _a = Object.keys(ModelType.styleProperties); _i < _a.length; _i++) {
            var key = _a[_i];
            this.registerTrait(key);
        }
        // Set the initial styles
        this.style();
    };
    /**
     * Register a CSS trait that is known by the model
     * @param trait
     */
    StyleView.prototype.registerTrait = function (trait) {
        var _this = this;
        this._traitNames.push(trait);
        // Listen to changes, and set the value on change.
        this.listenTo(this.model, 'change:' + trait, function (model, value) {
            _this.handleChange(trait, value);
        });
    };
    /**
     * Handles when a trait value changes
     */
    StyleView.prototype.handleChange = function (trait, value) {
        // should be synchronous so that we can measure later.
        var parent = this.options.parent;
        if (parent) {
            var ModelType = this.model.constructor;
            var styleProperties = ModelType.styleProperties;
            var attribute = styleProperties[trait].attribute;
            var selector = styleProperties[trait].selector;
            var elements = selector ? parent.el.querySelectorAll(selector) : [parent.el];
            if (value === null) {
                for (var i = 0; i !== elements.length; ++i) {
                    elements[i].style.removeProperty(attribute);
                }
            }
            else {
                for (var i = 0; i !== elements.length; ++i) {
                    elements[i].style[attribute] = value;
                }
            }
        }
        else {
            console.warn('Style not applied because a parent view does not exist');
        }
    };
    /**
     * Apply styles for all registered traits
     */
    StyleView.prototype.style = function () {
        for (var _i = 0, _a = this._traitNames; _i < _a.length; _i++) {
            var trait = _a[_i];
            this.handleChange(trait, this.model.get(trait));
        }
    };
    /**
     * Remove the styling from the parent view.
     */
    StyleView.prototype.unstyle = function () {
        var parent = this.options.parent;
        var ModelType = this.model.constructor;
        var styleProperties = ModelType.styleProperties;
        this._traitNames.forEach(function (trait) {
            if (parent) {
                var attribute = styleProperties[trait].attribute;
                var selector = styleProperties[trait].selector;
                var elements = selector ? parent.el.querySelectorAll(selector) : [parent.el];
                for (var i = 0; i !== elements.length; ++i) {
                    elements[i].style.removeProperty(attribute);
                }
            }
            else {
                console.warn('Style not removed because a parent view does not exist');
            }
        }, this);
    };
    return StyleView;
}(WidgetView));
export { StyleView };
