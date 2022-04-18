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
import { CoreDescriptionModel } from './widget_core';
import { DescriptionView, DescriptionStyleModel } from './widget_description';
import { DOMWidgetView } from '../../base';
import { uuid } from './utils';
import { format } from 'd3-format';
import * as _ from 'underscore';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/slider';
var IntModel = /** @class */ (function (_super) {
    __extends(IntModel, _super);
    function IntModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IntModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _model_name: 'IntModel',
            value: 0,
        });
    };
    return IntModel;
}(CoreDescriptionModel));
export { IntModel };
var BoundedIntModel = /** @class */ (function (_super) {
    __extends(BoundedIntModel, _super);
    function BoundedIntModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BoundedIntModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _model_name: 'BoundedIntModel',
            max: 100,
            min: 0
        });
    };
    return BoundedIntModel;
}(IntModel));
export { BoundedIntModel };
var SliderStyleModel = /** @class */ (function (_super) {
    __extends(SliderStyleModel, _super);
    function SliderStyleModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SliderStyleModel.prototype.defaults = function () {
        return __assign(__assign({}, _super.prototype.defaults.call(this)), { _model_name: 'SliderStyleModel' });
    };
    SliderStyleModel.styleProperties = __assign(__assign({}, DescriptionStyleModel.styleProperties), { handle_color: {
            selector: '.ui-slider-handle',
            attribute: 'background-color',
            default: null
        } });
    return SliderStyleModel;
}(DescriptionStyleModel));
export { SliderStyleModel };
var IntSliderModel = /** @class */ (function (_super) {
    __extends(IntSliderModel, _super);
    function IntSliderModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IntSliderModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _model_name: 'IntSliderModel',
            _view_name: 'IntSliderView',
            step: 1,
            orientation: 'horizontal',
            readout: true,
            readout_format: 'd',
            continuous_update: true,
            style: null,
            disabled: false,
        });
    };
    IntSliderModel.prototype.initialize = function (attributes, options) {
        _super.prototype.initialize.call(this, attributes, options);
        this.on('change:readout_format', this.update_readout_format, this);
        this.update_readout_format();
    };
    IntSliderModel.prototype.update_readout_format = function () {
        this.readout_formatter = format(this.get('readout_format'));
    };
    return IntSliderModel;
}(BoundedIntModel));
export { IntSliderModel };
var IntRangeSliderModel = /** @class */ (function (_super) {
    __extends(IntRangeSliderModel, _super);
    function IntRangeSliderModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return IntRangeSliderModel;
}(IntSliderModel));
export { IntRangeSliderModel };
var BaseIntSliderView = /** @class */ (function (_super) {
    __extends(BaseIntSliderView, _super);
    function BaseIntSliderView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._parse_value = parseInt;
        return _this;
    }
    BaseIntSliderView.prototype.render = function () {
        _super.prototype.render.call(this);
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-slider');
        this.el.classList.add('widget-hslider');
        (this.$slider = $('<div />'))
            .slider({
            slide: this.handleSliderChange.bind(this),
            stop: this.handleSliderChanged.bind(this)
        })
            .addClass('slider');
        // Put the slider in a container
        this.slider_container = document.createElement('div');
        this.slider_container.classList.add('slider-container');
        this.slider_container.appendChild(this.$slider[0]);
        this.el.appendChild(this.slider_container);
        this.readout = document.createElement('div');
        this.el.appendChild(this.readout);
        this.readout.classList.add('widget-readout');
        this.readout.contentEditable = 'true';
        this.readout.style.display = 'none';
        // Set defaults.
        this.update();
    };
    BaseIntSliderView.prototype.update = function (options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        if (options === undefined || options.updated_view !== this) {
            // JQuery slider option keys.  These keys happen to have a
            // one-to-one mapping with the corresponding keys of the model.
            var jquery_slider_keys = ['step', 'disabled'];
            var that_1 = this;
            that_1.$slider.slider({});
            jquery_slider_keys.forEach(function (key) {
                var model_value = that_1.model.get(key);
                if (model_value !== undefined) {
                    that_1.$slider.slider('option', key, model_value);
                }
            });
            if (this.model.get('disabled')) {
                this.readout.contentEditable = 'false';
            }
            else {
                this.readout.contentEditable = 'true';
            }
            var max = this.model.get('max');
            var min = this.model.get('min');
            if (min <= max) {
                if (max !== undefined) {
                    this.$slider.slider('option', 'max', max);
                }
                if (min !== undefined) {
                    this.$slider.slider('option', 'min', min);
                }
            }
            // WORKAROUND FOR JQUERY SLIDER BUG.
            // The horizontal position of the slider handle
            // depends on the value of the slider at the time
            // of orientation change.  Before applying the new
            // workaround, we set the value to the minimum to
            // make sure that the horizontal placement of the
            // handle in the vertical slider is always
            // consistent.
            var orientation_1 = this.model.get('orientation');
            this.$slider.slider('option', 'orientation', orientation_1);
            // Use the right CSS classes for vertical & horizontal sliders
            if (orientation_1 === 'vertical') {
                this.el.classList.remove('widget-hslider');
                this.el.classList.add('widget-vslider');
                this.el.classList.remove('widget-inline-hbox');
                this.el.classList.add('widget-inline-vbox');
            }
            else {
                this.el.classList.remove('widget-vslider');
                this.el.classList.add('widget-hslider');
                this.el.classList.remove('widget-inline-vbox');
                this.el.classList.add('widget-inline-hbox');
            }
            var readout = this.model.get('readout');
            if (readout) {
                this.readout.style.display = '';
                this.displayed.then(function () {
                    if (that_1.readout_overflow()) {
                        that_1.readout.classList.add('overflow');
                    }
                    else {
                        that_1.readout.classList.remove('overflow');
                    }
                });
            }
            else {
                this.readout.style.display = 'none';
            }
        }
        return _super.prototype.update.call(this);
    };
    /**
     * Returns true if the readout box content overflows.
     */
    BaseIntSliderView.prototype.readout_overflow = function () {
        return this.readout.scrollWidth > this.readout.clientWidth;
    };
    BaseIntSliderView.prototype.events = function () {
        return {
            // Dictionary of events and their handlers.
            'slide': 'handleSliderChange',
            'slidestop': 'handleSliderChanged',
            'blur [contentEditable=true]': 'handleTextChange',
            'keydown [contentEditable=true]': 'handleKeyDown'
        };
    };
    BaseIntSliderView.prototype.handleKeyDown = function (e) {
        if (e.keyCode === 13) { /* keyboard keycodes `enter` */
            e.preventDefault();
            this.handleTextChange();
        }
    };
    /**
     * Validate the value of the slider before sending it to the back-end
     * and applying it to the other views on the page.
     */
    BaseIntSliderView.prototype._validate_slide_value = function (x) {
        return Math.floor(x);
    };
    return BaseIntSliderView;
}(DescriptionView));
export { BaseIntSliderView };
var IntRangeSliderView = /** @class */ (function (_super) {
    __extends(IntRangeSliderView, _super);
    function IntRangeSliderView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // range numbers can be separated by a hyphen, colon, or an en-dash
        _this._range_regex = /^\s*([+-]?\d+)\s*[-:–]\s*([+-]?\d+)/;
        return _this;
    }
    IntRangeSliderView.prototype.update = function (options) {
        _super.prototype.update.call(this, options);
        this.$slider.slider('option', 'range', true);
        // values for the range case are validated python-side in
        // _Bounded{Int,Float}RangeWidget._validate
        var value = this.model.get('value');
        this.$slider.slider('option', 'values', value.slice());
        this.readout.textContent = this.valueToString(value);
        if (this.model.get('value') !== value) {
            this.model.set('value', value, { updated_view: this });
            this.touch();
        }
    };
    /**
     * Write value to a string
     */
    IntRangeSliderView.prototype.valueToString = function (value) {
        var format = this.model.readout_formatter;
        return value.map(function (v) {
            return format(v);
        }).join(' – ');
    };
    /**
     * Parse value from a string
     */
    IntRangeSliderView.prototype.stringToValue = function (text) {
        // ranges can be expressed either 'val-val' or 'val:val' (+spaces)
        var match = this._range_regex.exec(text);
        if (match) {
            return [this._parse_value(match[1]), this._parse_value(match[2])];
        }
        else {
            return null;
        }
    };
    /**
     * this handles the entry of text into the contentEditable label first, the
     * value is checked if it contains a parseable value then it is clamped
     * within the min-max range of the slider finally, the model is updated if
     * the value is to be changed
     *
     * if any of these conditions are not met, the text is reset
     */
    IntRangeSliderView.prototype.handleTextChange = function () {
        var value = this.stringToValue(this.readout.textContent);
        var vmin = this.model.get('min');
        var vmax = this.model.get('max');
        // reject input where NaN or lower > upper
        if (value === null ||
            isNaN(value[0]) ||
            isNaN(value[1]) ||
            (value[0] > value[1])) {
            this.readout.textContent = this.valueToString(this.model.get('value'));
        }
        else {
            // clamp to range
            value = [Math.max(Math.min(value[0], vmax), vmin),
                Math.max(Math.min(value[1], vmax), vmin)];
            if ((value[0] !== this.model.get('value')[0]) ||
                (value[1] !== this.model.get('value')[1])) {
                this.readout.textContent = this.valueToString(value);
                this.model.set('value', value, { updated_view: this });
                this.touch();
            }
            else {
                this.readout.textContent = this.valueToString(this.model.get('value'));
            }
        }
    };
    /**
     * Called when the slider value is changing.
     */
    IntRangeSliderView.prototype.handleSliderChange = function (e, ui) {
        var actual_value = ui.values.map(this._validate_slide_value);
        this.readout.textContent = this.valueToString(actual_value);
        // Only persist the value while sliding if the continuous_update
        // trait is set to true.
        if (this.model.get('continuous_update')) {
            this.handleSliderChanged(e, ui);
        }
    };
    /**
     * Called when the slider value has changed.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    IntRangeSliderView.prototype.handleSliderChanged = function (e, ui) {
        var actual_value = ui.values.map(this._validate_slide_value);
        this.model.set('value', actual_value, { updated_view: this });
        this.touch();
    };
    return IntRangeSliderView;
}(BaseIntSliderView));
export { IntRangeSliderView };
var IntSliderView = /** @class */ (function (_super) {
    __extends(IntSliderView, _super);
    function IntSliderView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IntSliderView.prototype.update = function (options) {
        _super.prototype.update.call(this, options);
        var min = this.model.get('min');
        var max = this.model.get('max');
        var value = this.model.get('value');
        if (value > max) {
            value = max;
        }
        else if (value < min) {
            value = min;
        }
        this.$slider.slider('option', 'value', value);
        this.readout.textContent = this.valueToString(value);
        if (this.model.get('value') !== value) {
            this.model.set('value', value, { updated_view: this });
            this.touch();
        }
    };
    /**
     * Write value to a string
     */
    IntSliderView.prototype.valueToString = function (value) {
        var format = this.model.readout_formatter;
        return format(value);
    };
    /**
     * Parse value from a string
     */
    IntSliderView.prototype.stringToValue = function (text) {
        return this._parse_value(text);
    };
    /**
     * this handles the entry of text into the contentEditable label first, the
     * value is checked if it contains a parseable value then it is clamped
     * within the min-max range of the slider finally, the model is updated if
     * the value is to be changed
     *
     * if any of these conditions are not met, the text is reset
     */
    IntSliderView.prototype.handleTextChange = function () {
        var value = this.stringToValue(this.readout.textContent);
        var vmin = this.model.get('min');
        var vmax = this.model.get('max');
        if (isNaN(value)) {
            this.readout.textContent = this.valueToString(this.model.get('value'));
        }
        else {
            value = Math.max(Math.min(value, vmax), vmin);
            if (value !== this.model.get('value')) {
                this.readout.textContent = this.valueToString(value);
                this.model.set('value', value, { updated_view: this });
                this.touch();
            }
            else {
                this.readout.textContent = this.valueToString(this.model.get('value'));
            }
        }
    };
    /**
     * Called when the slider value is changing.
     */
    IntSliderView.prototype.handleSliderChange = function (e, ui) {
        var actual_value = this._validate_slide_value(ui.value);
        this.readout.textContent = this.valueToString(actual_value);
        // Only persist the value while sliding if the continuous_update
        // trait is set to true.
        if (this.model.get('continuous_update')) {
            this.handleSliderChanged(e, ui);
        }
    };
    /**
     * Called when the slider value has changed.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    IntSliderView.prototype.handleSliderChanged = function (e, ui) {
        var actual_value = this._validate_slide_value(ui.value);
        this.model.set('value', actual_value, { updated_view: this });
        this.touch();
    };
    return IntSliderView;
}(BaseIntSliderView));
export { IntSliderView };
var IntTextModel = /** @class */ (function (_super) {
    __extends(IntTextModel, _super);
    function IntTextModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IntTextModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _model_name: 'IntTextModel',
            _view_name: 'IntTextView',
            disabled: false,
            continuous_update: false,
        });
    };
    return IntTextModel;
}(IntModel));
export { IntTextModel };
var BoundedIntTextModel = /** @class */ (function (_super) {
    __extends(BoundedIntTextModel, _super);
    function BoundedIntTextModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BoundedIntTextModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _model_name: 'BoundedIntTextModel',
            _view_name: 'IntTextView',
            disabled: false,
            continuous_update: false,
            step: 1,
        });
    };
    return BoundedIntTextModel;
}(BoundedIntModel));
export { BoundedIntTextModel };
var IntTextView = /** @class */ (function (_super) {
    __extends(IntTextView, _super);
    function IntTextView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._parse_value = parseInt;
        _this._default_step = '1';
        return _this;
    }
    IntTextView.prototype.render = function () {
        _super.prototype.render.call(this);
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-text');
        this.textbox = document.createElement('input');
        this.textbox.type = 'number';
        this.textbox.required = true;
        this.textbox.id = this.label.htmlFor = uuid();
        this.el.appendChild(this.textbox);
        this.update(); // Set defaults.
    };
    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    IntTextView.prototype.update = function (options) {
        if (options === undefined || options.updated_view !== this) {
            var value = this.model.get('value');
            if (this._parse_value(this.textbox.value) !== value) {
                this.textbox.value = value.toString();
            }
            if (this.model.get('min') !== undefined) {
                this.textbox.min = this.model.get('min');
            }
            if (this.model.get('max') !== undefined) {
                this.textbox.max = this.model.get('max');
            }
            if (this.model.get('step') !== undefined
                && this.model.get('step') !== null) {
                this.textbox.step = this.model.get('step');
            }
            else {
                this.textbox.step = this._default_step;
            }
            this.textbox.disabled = this.model.get('disabled');
        }
        return _super.prototype.update.call(this);
    };
    IntTextView.prototype.events = function () {
        return {
            'keydown input': 'handleKeyDown',
            'keypress input': 'handleKeypress',
            'keyup input': 'handleKeyUp',
            'input input': 'handleChanging',
            'change input': 'handleChanged'
        };
    };
    /**
     * Handle key down
     *
     * Stop propagation so the event isn't sent to the application.
     */
    IntTextView.prototype.handleKeyDown = function (e) {
        e.stopPropagation();
    };
    /**
     * Handles key press
     */
    IntTextView.prototype.handleKeypress = function (e) {
        if (/[e,. ]/.test(String.fromCharCode(e.keyCode))) {
            e.preventDefault();
        }
    };
    /**
     * Handle key up
     */
    IntTextView.prototype.handleKeyUp = function (e) {
        if (e.altKey || e.ctrlKey) {
            return;
        }
        var target = e.target;
        /* remove invalid characters */
        var value = target.value;
        value = value.replace(/[e,.\s]/g, "");
        if (value.length >= 1) {
            var subvalue = value.substr(1);
            value = value[0] + subvalue.replace(/[+-]/g, "");
        }
        if (target.value != value) {
            e.preventDefault();
            target.value = value;
        }
    };
    /**
     * Call the submit handler if continuous update is true and we are not
     * obviously incomplete.
     */
    IntTextView.prototype.handleChanging = function (e) {
        var target = e.target;
        var trimmed = target.value.trim();
        if (trimmed === '' || (['-', '-.', '.', '+.', '+'].indexOf(trimmed) >= 0)) {
            // incomplete number
            return;
        }
        if (this.model.get('continuous_update')) {
            this.handleChanged(e);
        }
    };
    /**
     * Applies validated input.
     */
    IntTextView.prototype.handleChanged = function (e) {
        var target = e.target;
        var numericalValue = this._parse_value(target.value);
        // If parse failed, reset value to value stored in model.
        if (isNaN(numericalValue)) {
            target.value = this.model.get('value');
        }
        else {
            // Handle both the unbounded and bounded case by
            // checking to see if the max/min properties are defined
            var boundedValue = numericalValue;
            if (this.model.get('max') !== undefined) {
                boundedValue = Math.min(this.model.get('max'), boundedValue);
            }
            if (this.model.get('min') !== undefined) {
                boundedValue = Math.max(this.model.get('min'), boundedValue);
            }
            if (boundedValue !== numericalValue) {
                target.value = boundedValue;
                numericalValue = boundedValue;
            }
            // Apply the value if it has changed.
            if (numericalValue !== this.model.get('value')) {
                this.model.set('value', numericalValue, { updated_view: this });
                this.touch();
            }
        }
    };
    return IntTextView;
}(DescriptionView));
export { IntTextView };
var ProgressStyleModel = /** @class */ (function (_super) {
    __extends(ProgressStyleModel, _super);
    function ProgressStyleModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ProgressStyleModel.prototype.defaults = function () {
        return __assign(__assign({}, _super.prototype.defaults.call(this)), { _model_name: 'ProgressStyleModel' });
    };
    ProgressStyleModel.styleProperties = __assign(__assign({}, DescriptionStyleModel.styleProperties), { bar_color: {
            selector: '.progress-bar',
            attribute: 'background-color',
            default: null
        } });
    return ProgressStyleModel;
}(DescriptionStyleModel));
export { ProgressStyleModel };
var IntProgressModel = /** @class */ (function (_super) {
    __extends(IntProgressModel, _super);
    function IntProgressModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IntProgressModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _model_name: 'IntProgressModel',
            _view_name: 'ProgressView',
            orientation: 'horizontal',
            bar_style: '',
            style: null
        });
    };
    return IntProgressModel;
}(BoundedIntModel));
export { IntProgressModel };
var ProgressView = /** @class */ (function (_super) {
    __extends(ProgressView, _super);
    function ProgressView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ProgressView.prototype.initialize = function (parameters) {
        _super.prototype.initialize.call(this, parameters);
        this.listenTo(this.model, 'change:bar_style', this.update_bar_style);
        this.pWidget.addClass('jupyter-widgets');
    };
    ProgressView.prototype.render = function () {
        _super.prototype.render.call(this);
        var orientation = this.model.get('orientation');
        var className = orientation === 'horizontal' ?
            'widget-hprogress' : 'widget-vprogress';
        this.el.classList.add(className);
        this.progress = document.createElement('div');
        this.progress.classList.add('progress');
        this.progress.style.position = 'relative';
        this.el.appendChild(this.progress);
        this.bar = document.createElement('div');
        this.bar.classList.add('progress-bar');
        this.bar.style.position = 'absolute';
        this.bar.style.bottom = '0px';
        this.bar.style.left = '0px';
        this.progress.appendChild(this.bar);
        // Set defaults.
        this.update();
        this.set_bar_style();
    };
    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    ProgressView.prototype.update = function () {
        var value = this.model.get('value');
        var max = this.model.get('max');
        var min = this.model.get('min');
        var orientation = this.model.get('orientation');
        var percent = 100.0 * (value - min) / (max - min);
        if (orientation === 'horizontal') {
            this.el.classList.remove('widget-inline-vbox');
            this.el.classList.remove('widget-vprogress');
            this.el.classList.add('widget-inline-hbox');
            this.el.classList.add('widget-hprogress');
            this.bar.style.width = percent + '%';
            this.bar.style.height = '100%';
        }
        else {
            this.el.classList.remove('widget-inline-hbox');
            this.el.classList.remove('widget-hprogress');
            this.el.classList.add('widget-inline-vbox');
            this.el.classList.add('widget-vprogress');
            this.bar.style.width = '100%';
            this.bar.style.height = percent + '%';
        }
        return _super.prototype.update.call(this);
    };
    ProgressView.prototype.update_bar_style = function () {
        this.update_mapped_classes(ProgressView.class_map, 'bar_style', this.bar);
    };
    ProgressView.prototype.set_bar_style = function () {
        this.set_mapped_classes(ProgressView.class_map, 'bar_style', this.bar);
    };
    ProgressView.class_map = {
        success: ['progress-bar-success'],
        info: ['progress-bar-info'],
        warning: ['progress-bar-warning'],
        danger: ['progress-bar-danger']
    };
    return ProgressView;
}(DescriptionView));
export { ProgressView };
var PlayModel = /** @class */ (function (_super) {
    __extends(PlayModel, _super);
    function PlayModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PlayModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _model_name: 'PlayModel',
            _view_name: 'PlayView',
            _playing: false,
            _repeat: false,
            show_repeat: true,
            interval: 100,
            step: 1,
            disabled: false,
        });
    };
    PlayModel.prototype.initialize = function (attributes, options) {
        _super.prototype.initialize.call(this, attributes, options);
    };
    PlayModel.prototype.loop = function () {
        if (this.get('_playing')) {
            var next_value = this.get('value') + this.get('step');
            if (next_value <= this.get('max')) {
                this.set('value', next_value);
                this.schedule_next();
            }
            else {
                if (this.get('_repeat')) {
                    this.set('value', this.get('min'));
                    this.schedule_next();
                }
                else {
                    this.set('_playing', false);
                }
            }
            this.save_changes();
        }
    };
    PlayModel.prototype.schedule_next = function () {
        window.setTimeout(this.loop.bind(this), this.get('interval'));
    };
    PlayModel.prototype.stop = function () {
        this.set('_playing', false);
        this.set('value', this.get('min'));
        this.save_changes();
    };
    PlayModel.prototype.pause = function () {
        this.set('_playing', false);
        this.save_changes();
    };
    PlayModel.prototype.play = function () {
        this.set('_playing', true);
        if (this.get('value') == this.get('max')) {
            // if the value is at the end, reset if first, and then schedule the next
            this.set('value', this.get('min'));
            this.schedule_next();
            this.save_changes();
        }
        else {
            // otherwise directly start with the next value
            // loop will call save_changes in this case
            this.loop();
        }
    };
    PlayModel.prototype.repeat = function () {
        this.set('_repeat', !this.get('_repeat'));
        this.save_changes();
    };
    return PlayModel;
}(BoundedIntModel));
export { PlayModel };
var PlayView = /** @class */ (function (_super) {
    __extends(PlayView, _super);
    function PlayView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PlayView.prototype.render = function () {
        _super.prototype.render.call(this);
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-play');
        this.playButton = document.createElement('button');
        this.pauseButton = document.createElement('button');
        this.stopButton = document.createElement('button');
        this.repeatButton = document.createElement('button');
        this.playButton.className = 'jupyter-button';
        this.pauseButton.className = 'jupyter-button';
        this.stopButton.className = 'jupyter-button';
        this.repeatButton.className = 'jupyter-button';
        this.el.appendChild(this.playButton); // Toggle button with playing
        this.el.appendChild(this.pauseButton); // Disable if not playing
        this.el.appendChild(this.stopButton); // Disable if not playing
        this.el.appendChild(this.repeatButton); // Always enabled, but may be hidden
        var playIcon = document.createElement('i');
        playIcon.className = 'fa fa-play';
        this.playButton.appendChild(playIcon);
        var pauseIcon = document.createElement('i');
        pauseIcon.className = 'fa fa-pause';
        this.pauseButton.appendChild(pauseIcon);
        var stopIcon = document.createElement('i');
        stopIcon.className = 'fa fa-stop';
        this.stopButton.appendChild(stopIcon);
        var repeatIcon = document.createElement('i');
        repeatIcon.className = 'fa fa-retweet';
        this.repeatButton.appendChild(repeatIcon);
        this.playButton.onclick = this.model.play.bind(this.model);
        this.pauseButton.onclick = this.model.pause.bind(this.model);
        this.stopButton.onclick = this.model.stop.bind(this.model);
        this.repeatButton.onclick = this.model.repeat.bind(this.model);
        this.listenTo(this.model, 'change:_playing', this.update_playing);
        this.listenTo(this.model, 'change:_repeat', this.update_repeat);
        this.listenTo(this.model, 'change:show_repeat', this.update_repeat);
        this.update_playing();
        this.update_repeat();
        this.update();
    };
    PlayView.prototype.update = function () {
        var disabled = this.model.get('disabled');
        this.playButton.disabled = disabled;
        this.pauseButton.disabled = disabled;
        this.stopButton.disabled = disabled;
        this.repeatButton.disabled = disabled;
        this.update_playing();
    };
    PlayView.prototype.update_playing = function () {
        var playing = this.model.get('_playing');
        var disabled = this.model.get('disabled');
        if (playing) {
            if (!disabled) {
                this.pauseButton.disabled = false;
            }
            this.playButton.classList.add('mod-active');
        }
        else {
            if (!disabled) {
                this.pauseButton.disabled = true;
            }
            this.playButton.classList.remove('mod-active');
        }
    };
    PlayView.prototype.update_repeat = function () {
        var repeat = this.model.get('_repeat');
        this.repeatButton.style.display = this.model.get('show_repeat') ? this.playButton.style.display : 'none';
        if (repeat) {
            this.repeatButton.classList.add('mod-active');
        }
        else {
            this.repeatButton.classList.remove('mod-active');
        }
    };
    return PlayView;
}(DOMWidgetView));
export { PlayView };
