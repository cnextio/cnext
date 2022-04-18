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
import { DescriptionView } from './widget_description';
import { uuid } from './utils';
import * as _ from 'underscore';
/**
 * Class name for a combobox with an invlid value.
 */
var INVALID_VALUE_CLASS = 'jpwidgets-invalidComboValue';
var StringModel = /** @class */ (function (_super) {
    __extends(StringModel, _super);
    function StringModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StringModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            value: '',
            disabled: false,
            placeholder: '\u200b',
            _model_name: 'StringModel'
        });
    };
    return StringModel;
}(CoreDescriptionModel));
export { StringModel };
var HTMLModel = /** @class */ (function (_super) {
    __extends(HTMLModel, _super);
    function HTMLModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HTMLModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _view_name: 'HTMLView',
            _model_name: 'HTMLModel'
        });
    };
    return HTMLModel;
}(StringModel));
export { HTMLModel };
var HTMLView = /** @class */ (function (_super) {
    __extends(HTMLView, _super);
    function HTMLView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Called when view is rendered.
     */
    HTMLView.prototype.render = function () {
        _super.prototype.render.call(this);
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-html');
        this.content = document.createElement('div');
        this.content.classList.add('widget-html-content');
        this.el.appendChild(this.content);
        this.update(); // Set defaults.
    };
    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    HTMLView.prototype.update = function () {
        this.content.innerHTML = this.model.get('value');
        return _super.prototype.update.call(this);
    };
    return HTMLView;
}(DescriptionView));
export { HTMLView };
var HTMLMathModel = /** @class */ (function (_super) {
    __extends(HTMLMathModel, _super);
    function HTMLMathModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HTMLMathModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _view_name: 'HTMLMathView',
            _model_name: 'HTMLMathModel'
        });
    };
    return HTMLMathModel;
}(StringModel));
export { HTMLMathModel };
var HTMLMathView = /** @class */ (function (_super) {
    __extends(HTMLMathView, _super);
    function HTMLMathView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Called when view is rendered.
     */
    HTMLMathView.prototype.render = function () {
        _super.prototype.render.call(this);
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-htmlmath');
        this.content = document.createElement('div');
        this.content.classList.add('widget-htmlmath-content');
        this.el.appendChild(this.content);
        this.update(); // Set defaults.
    };
    /**
     * Update the contents of this view
     */
    HTMLMathView.prototype.update = function () {
        this.content.innerHTML = this.model.get('value');
        this.typeset(this.content);
        return _super.prototype.update.call(this);
    };
    return HTMLMathView;
}(DescriptionView));
export { HTMLMathView };
var LabelModel = /** @class */ (function (_super) {
    __extends(LabelModel, _super);
    function LabelModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LabelModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _view_name: 'LabelView',
            _model_name: 'LabelModel'
        });
    };
    return LabelModel;
}(StringModel));
export { LabelModel };
var LabelView = /** @class */ (function (_super) {
    __extends(LabelView, _super);
    function LabelView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Called when view is rendered.
     */
    LabelView.prototype.render = function () {
        _super.prototype.render.call(this);
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-label');
        this.update(); // Set defaults.
    };
    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    LabelView.prototype.update = function () {
        this.typeset(this.el, this.model.get('value'));
        return _super.prototype.update.call(this);
    };
    return LabelView;
}(DescriptionView));
export { LabelView };
var TextareaModel = /** @class */ (function (_super) {
    __extends(TextareaModel, _super);
    function TextareaModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextareaModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _view_name: 'TextareaView',
            _model_name: 'TextareaModel',
            rows: null,
            continuous_update: true,
        });
    };
    return TextareaModel;
}(StringModel));
export { TextareaModel };
var TextareaView = /** @class */ (function (_super) {
    __extends(TextareaView, _super);
    function TextareaView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Called when view is rendered.
     */
    TextareaView.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-textarea');
        this.textbox = document.createElement('textarea');
        this.textbox.setAttribute('rows', '5');
        this.textbox.id = this.label.htmlFor = uuid();
        this.el.appendChild(this.textbox);
        this.update(); // Set defaults.
        this.listenTo(this.model, 'change:placeholder', function (model, value, options) {
            _this.update_placeholder(value);
        });
        this.update_placeholder();
    };
    TextareaView.prototype.update_placeholder = function (value) {
        value = value || this.model.get('placeholder');
        this.textbox.setAttribute('placeholder', value.toString());
    };
    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    TextareaView.prototype.update = function (options) {
        if (options === undefined || options.updated_view != this) {
            this.textbox.value = this.model.get('value');
            var rows = this.model.get('rows');
            if (rows === null) {
                rows = '';
            }
            this.textbox.setAttribute('rows', rows);
            this.textbox.disabled = this.model.get('disabled');
        }
        return _super.prototype.update.call(this);
    };
    TextareaView.prototype.events = function () {
        return {
            'keydown input': 'handleKeyDown',
            'keypress input': 'handleKeypress',
            'input textarea': 'handleChanging',
            'change textarea': 'handleChanged'
        };
    };
    /**
     * Handle key down
     *
     * Stop propagation so the event isn't sent to the application.
     */
    TextareaView.prototype.handleKeyDown = function (e) {
        e.stopPropagation();
    };
    /**
     * Handles key press
     *
     * Stop propagation so the keypress isn't sent to the application.
     */
    TextareaView.prototype.handleKeypress = function (e) {
        e.stopPropagation();
    };
    /**
     * Triggered on input change
     */
    TextareaView.prototype.handleChanging = function (e) {
        if (this.model.get('continuous_update')) {
            this.handleChanged(e);
        }
    };
    /**
     * Sync the value with the kernel.
     *
     * @param e Event
     */
    TextareaView.prototype.handleChanged = function (e) {
        var target = e.target;
        this.model.set('value', target.value, { updated_view: this });
        this.touch();
    };
    return TextareaView;
}(DescriptionView));
export { TextareaView };
var TextModel = /** @class */ (function (_super) {
    __extends(TextModel, _super);
    function TextModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _view_name: 'TextView',
            _model_name: 'TextModel',
            continuous_update: true,
        });
    };
    return TextModel;
}(StringModel));
export { TextModel };
var TextView = /** @class */ (function (_super) {
    __extends(TextView, _super);
    function TextView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputType = 'text';
        return _this;
    }
    /**
     * Called when view is rendered.
     */
    TextView.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-text');
        this.textbox = document.createElement('input');
        this.textbox.setAttribute('type', this.inputType);
        this.textbox.id = this.label.htmlFor = uuid();
        this.el.appendChild(this.textbox);
        this.update(); // Set defaults.
        this.listenTo(this.model, 'change:placeholder', function (model, value, options) {
            _this.update_placeholder(value);
        });
        this.listenTo(this.model, 'change:description_tooltip', this.update_title);
        this.listenTo(this.model, 'change:description', this.update_title);
        this.update_placeholder();
        this.update_title();
    };
    TextView.prototype.update_placeholder = function (value) {
        this.textbox.setAttribute('placeholder', value || this.model.get('placeholder'));
    };
    TextView.prototype.update_title = function () {
        var title = this.model.get('description_tooltip');
        if (!title) {
            this.textbox.removeAttribute('title');
        }
        else if (this.model.get('description').length === 0) {
            this.textbox.setAttribute('title', title);
        }
    };
    TextView.prototype.update = function (options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        if (options === undefined || options.updated_view !== this) {
            if (this.textbox.value !== this.model.get('value')) {
                this.textbox.value = this.model.get('value');
            }
            this.textbox.disabled = this.model.get('disabled');
        }
        return _super.prototype.update.call(this);
    };
    TextView.prototype.events = function () {
        return {
            'keydown input': 'handleKeyDown',
            'keypress input': 'handleKeypress',
            'input input': 'handleChanging',
            'change input': 'handleChanged'
        };
    };
    /**
     * Handle key down
     *
     * Stop propagation so the keypress isn't sent to the application.
     */
    TextView.prototype.handleKeyDown = function (e) {
        e.stopPropagation();
    };
    /**
     * Handles text submission
     */
    TextView.prototype.handleKeypress = function (e) {
        e.stopPropagation();
        // The submit message is deprecated in widgets 7
        if (e.keyCode === 13) { // Return key
            this.send({ event: 'submit' });
        }
    };
    /**
     * Handles user input.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    TextView.prototype.handleChanging = function (e) {
        if (this.model.get('continuous_update')) {
            this.handleChanged(e);
        }
    };
    /**
     * Handles user input.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    TextView.prototype.handleChanged = function (e) {
        var target = e.target;
        this.model.set('value', target.value, { updated_view: this });
        this.touch();
    };
    return TextView;
}(DescriptionView));
export { TextView };
var PasswordModel = /** @class */ (function (_super) {
    __extends(PasswordModel, _super);
    function PasswordModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PasswordModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _view_name: 'PasswordView',
            _model_name: 'PasswordModel'
        });
    };
    return PasswordModel;
}(TextModel));
export { PasswordModel };
var PasswordView = /** @class */ (function (_super) {
    __extends(PasswordView, _super);
    function PasswordView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputType = 'password';
        return _this;
    }
    return PasswordView;
}(TextView));
export { PasswordView };
/**
 * Combobox widget model class.
 */
var ComboboxModel = /** @class */ (function (_super) {
    __extends(ComboboxModel, _super);
    function ComboboxModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ComboboxModel.prototype.defaults = function () {
        return __assign(__assign({}, _super.prototype.defaults.call(this)), { _model_name: 'ComboboxModel', _view_name: 'ComboboxView', options: [], ensure_options: false });
    };
    return ComboboxModel;
}(TextModel));
export { ComboboxModel };
/**
 * Combobox widget view class.
 */
var ComboboxView = /** @class */ (function (_super) {
    __extends(ComboboxView, _super);
    function ComboboxView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isInitialRender = true;
        return _this;
    }
    ComboboxView.prototype.render = function () {
        this.datalist = document.createElement('datalist');
        this.datalist.id = uuid();
        _super.prototype.render.call(this);
        this.textbox.setAttribute('list', this.datalist.id);
        this.el.appendChild(this.datalist);
    };
    ComboboxView.prototype.update = function (options) {
        _super.prototype.update.call(this, options);
        if (!this.datalist) {
            return;
        }
        var valid = this.isValid(this.model.get('value'));
        this.highlightValidState(valid);
        // Check if we need to update options
        if ((options !== undefined && options.updated_view) || (!this.model.hasChanged('options') &&
            !this.isInitialRender)) {
            // Value update only, keep current options
            return;
        }
        this.isInitialRender = false;
        var opts = this.model.get('options');
        var optLines = opts.map(function (o) {
            return "<option value=\"" + o + "\"></option>";
        });
        this.datalist.innerHTML = optLines.join('\n');
    };
    ComboboxView.prototype.isValid = function (value) {
        if (true === this.model.get('ensure_option')) {
            var options = this.model.get('options');
            if (options.indexOf(value) === -1) {
                return false;
            }
        }
        return true;
    };
    ComboboxView.prototype.handleChanging = function (e) {
        // Override to validate value
        var target = e.target;
        var valid = this.isValid(target.value);
        this.highlightValidState(valid);
        if (valid) {
            _super.prototype.handleChanging.call(this, e);
        }
    };
    ComboboxView.prototype.handleChanged = function (e) {
        // Override to validate value
        var target = e.target;
        var valid = this.isValid(target.value);
        this.highlightValidState(valid);
        if (valid) {
            _super.prototype.handleChanged.call(this, e);
        }
    };
    ComboboxView.prototype.highlightValidState = function (valid) {
        this.textbox.classList.toggle(INVALID_VALUE_CLASS, !valid);
    };
    return ComboboxView;
}(TextView));
export { ComboboxView };
