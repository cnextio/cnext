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
/**
 * css properties exposed by the layout widget with their default values.
 */
var css_properties = {
    align_content: null,
    align_items: null,
    align_self: null,
    border: null,
    bottom: null,
    display: null,
    flex: null,
    flex_flow: null,
    height: null,
    justify_content: null,
    justify_items: null,
    left: null,
    margin: null,
    max_height: null,
    max_width: null,
    min_height: null,
    min_width: null,
    overflow: null,
    overflow_x: null,
    overflow_y: null,
    order: null,
    padding: null,
    right: null,
    top: null,
    visibility: null,
    width: null,
    // image-specific
    object_fit: null,
    object_position: null,
    // container
    grid_auto_columns: null,
    grid_auto_flow: null,
    grid_auto_rows: null,
    grid_gap: null,
    grid_template_rows: null,
    grid_template_columns: null,
    grid_template_areas: null,
    // items
    grid_row: null,
    grid_column: null,
    grid_area: null
};
var LayoutModel = /** @class */ (function (_super) {
    __extends(LayoutModel, _super);
    function LayoutModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LayoutModel.prototype.defaults = function () {
        return assign(_super.prototype.defaults.call(this), {
            _model_name: 'LayoutModel',
            _view_name: 'LayoutView'
        }, css_properties);
    };
    return LayoutModel;
}(WidgetModel));
export { LayoutModel };
var LayoutView = /** @class */ (function (_super) {
    __extends(LayoutView, _super);
    function LayoutView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Public constructor
     */
    LayoutView.prototype.initialize = function (parameters) {
        this._traitNames = [];
        _super.prototype.initialize.call(this, parameters);
        // Register the traits that live on the Python side
        for (var _i = 0, _a = Object.keys(css_properties); _i < _a.length; _i++) {
            var key = _a[_i];
            this.registerTrait(key);
        }
    };
    /**
     * Register a CSS trait that is known by the model
     * @param trait
     */
    LayoutView.prototype.registerTrait = function (trait) {
        var _this = this;
        this._traitNames.push(trait);
        // Treat overflow_x and overflow_y as a special case since they are deprecated
        // and interact in special ways with the overflow attribute.
        if (trait === 'overflow_x' || trait === 'overflow_y') {
            // Listen to changes, and set the value on change.
            this.listenTo(this.model, 'change:' + trait, function (model, value) {
                _this.handleOverflowChange(trait, value);
            });
            // Set the initial value on display.
            this.handleOverflowChange(trait, this.model.get(trait));
            return;
        }
        // Listen to changes, and set the value on change.
        this.listenTo(this.model, 'change:' + trait, function (model, value) {
            _this.handleChange(trait, value);
        });
        // Set the initial value on display.
        this.handleChange(trait, this.model.get(trait));
    };
    /**
     * Get the the name of the css property from the trait name
     * @param  model attribute name
     * @return css property name
     */
    LayoutView.prototype.css_name = function (trait) {
        return trait.replace(/_/g, '-');
    };
    /**
     * Handles when a trait value changes
     */
    LayoutView.prototype.handleChange = function (trait, value) {
        // should be synchronous so that we can measure later.
        var parent = this.options.parent;
        if (parent) {
            if (value === null) {
                parent.el.style.removeProperty(this.css_name(trait));
            }
            else {
                parent.el.style[this.css_name(trait)] = value;
            }
        }
        else {
            console.warn('Style not applied because a parent view does not exist');
        }
    };
    /**
     * Handles when the value of overflow_x or overflow_y changes
     */
    LayoutView.prototype.handleOverflowChange = function (trait, value) {
        // This differs from the default handleChange method
        // in that setting `overflow_x` or `overflow_y` to null
        // when `overflow` is null removes the attribute.
        var parent = this.options.parent;
        if (parent) {
            if (value === null) {
                if (this.model.get('overflow') === null) {
                    parent.el.style.removeProperty(this.css_name(trait));
                }
            }
            else {
                parent.el.style[this.css_name(trait)] = value;
            }
        }
        else {
            console.warn('Style not applied because a parent view does not exist');
        }
    };
    /**
     * Remove the styling from the parent view.
     */
    LayoutView.prototype.unlayout = function () {
        var _this = this;
        var parent = this.options.parent;
        this._traitNames.forEach(function (trait) {
            if (parent) {
                parent.el.style.removeProperty(_this.css_name(trait));
            }
            else {
                console.warn('Style not removed because a parent view does not exist');
            }
        }, this);
    };
    return LayoutView;
}(WidgetView));
export { LayoutView };
