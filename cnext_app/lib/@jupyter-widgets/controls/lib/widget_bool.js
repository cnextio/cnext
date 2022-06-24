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
import { CoreDescriptionModel } from './widget_core';
import { DescriptionView } from './widget_description';
import { DOMWidgetView } from '../../base';
import * as _ from 'underscore';
var BoolModel = /** @class */ (function (_super) {
    __extends(BoolModel, _super);
    function BoolModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BoolModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            value: false,
            disabled: false,
            _model_name: 'BoolModel'
        });
    };
    return BoolModel;
}(CoreDescriptionModel));
export { BoolModel };
var CheckboxModel = /** @class */ (function (_super) {
    __extends(CheckboxModel, _super);
    function CheckboxModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CheckboxModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            indent: true,
            _view_name: 'CheckboxView',
            _model_name: 'CheckboxModel'
        });
    };
    return CheckboxModel;
}(CoreDescriptionModel));
export { CheckboxModel };
var CheckboxView = /** @class */ (function (_super) {
    __extends(CheckboxView, _super);
    function CheckboxView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Called when view is rendered.
     */
    CheckboxView.prototype.render = function () {
        _super.prototype.render.call(this);
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-checkbox');
        // adding a zero-width space to the label to help
        // the browser set the baseline correctly
        this.label.innerHTML = '&#8203;';
        // label containing the checkbox and description span
        this.checkboxLabel = document.createElement('label');
        this.checkboxLabel.classList.add('widget-label-basic');
        this.el.appendChild(this.checkboxLabel);
        // checkbox
        this.checkbox = document.createElement('input');
        this.checkbox.setAttribute('type', 'checkbox');
        this.checkboxLabel.appendChild(this.checkbox);
        // span to the right of the checkbox that will render the description
        this.descriptionSpan = document.createElement('span');
        this.checkboxLabel.appendChild(this.descriptionSpan);
        this.listenTo(this.model, 'change:indent', this.updateIndent);
        this.update(); // Set defaults.
        this.updateDescription();
        this.updateIndent();
    };
    /**
     * Overriden from super class
     *
     * Update the description span (rather than the label) since
     * we want the description to the right of the checkbox.
     */
    CheckboxView.prototype.updateDescription = function () {
        // can be called before the view is fully initialized
        if (this.checkboxLabel == null) {
            return;
        }
        var description = this.model.get('description');
        this.descriptionSpan.innerHTML = description;
        this.typeset(this.descriptionSpan);
        this.descriptionSpan.title = description;
        this.checkbox.title = description;
    };
    /**
     * Update the visibility of the label in the super class
     * to provide the optional indent.
     */
    CheckboxView.prototype.updateIndent = function () {
        var indent = this.model.get('indent');
        this.label.style.display = indent ? '' : 'none';
    };
    CheckboxView.prototype.events = function () {
        return {
            'click input[type="checkbox"]': '_handle_click'
        };
    };
    /**
     * Handles when the checkbox is clicked.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    CheckboxView.prototype._handle_click = function () {
        var value = this.model.get('value');
        this.model.set('value', !value, { updated_view: this });
        this.touch();
    };
    /**
     * Update the contents of this view
     *
     * Called when the model is changed. The model may have been
     * changed by another view or by a state update from the back-end.
     */
    CheckboxView.prototype.update = function (options) {
        this.checkbox.checked = this.model.get('value');
        if (options === undefined || options.updated_view != this) {
            this.checkbox.disabled = this.model.get('disabled');
        }
        return _super.prototype.update.call(this);
    };
    return CheckboxView;
}(DescriptionView));
export { CheckboxView };
var ToggleButtonModel = /** @class */ (function (_super) {
    __extends(ToggleButtonModel, _super);
    function ToggleButtonModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ToggleButtonModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _view_name: 'ToggleButtonView',
            _model_name: 'ToggleButtonModel',
            tooltip: '',
            icon: '',
            button_style: ''
        });
    };
    return ToggleButtonModel;
}(BoolModel));
export { ToggleButtonModel };
var ToggleButtonView = /** @class */ (function (_super) {
    __extends(ToggleButtonView, _super);
    function ToggleButtonView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Called when view is rendered.
     */
    ToggleButtonView.prototype.render = function () {
        _super.prototype.render.call(this);
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('jupyter-button');
        this.el.classList.add('widget-toggle-button');
        this.listenTo(this.model, 'change:button_style', this.update_button_style);
        this.set_button_style();
        this.update(); // Set defaults.
    };
    ToggleButtonView.prototype.update_button_style = function () {
        this.update_mapped_classes(ToggleButtonView.class_map, 'button_style');
    };
    ToggleButtonView.prototype.set_button_style = function () {
        this.set_mapped_classes(ToggleButtonView.class_map, 'button_style');
    };
    /**
     * Update the contents of this view
     *
     * Called when the model is changed. The model may have been
     * changed by another view or by a state update from the back-end.
     */
    ToggleButtonView.prototype.update = function (options) {
        if (this.model.get('value')) {
            this.el.classList.add('mod-active');
        }
        else {
            this.el.classList.remove('mod-active');
        }
        if (options === undefined || options.updated_view !== this) {
            this.el.disabled = this.model.get('disabled');
            this.el.setAttribute('title', this.model.get('tooltip'));
            var description = this.model.get('description');
            var icon = this.model.get('icon');
            if (description.trim().length === 0 && icon.trim().length === 0) {
                this.el.innerHTML = '&nbsp;'; // Preserve button height
            }
            else {
                this.el.textContent = '';
                if (icon.trim().length) {
                    var i = document.createElement('i');
                    this.el.appendChild(i);
                    i.classList.add('fa');
                    i.classList.add('fa-' + icon);
                }
                this.el.appendChild(document.createTextNode(description));
            }
        }
        return _super.prototype.update.call(this);
    };
    ToggleButtonView.prototype.events = function () {
        return {
            // Dictionary of events and their handlers.
            'click': '_handle_click'
        };
    };
    /**
     * Handles and validates user input.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    ToggleButtonView.prototype._handle_click = function (event) {
        event.preventDefault();
        var value = this.model.get('value');
        this.model.set('value', !value, { updated_view: this });
        this.touch();
    };
    Object.defineProperty(ToggleButtonView.prototype, "tagName", {
        /**
         * The default tag name.
         *
         * #### Notes
         * This is a read-only attribute.
         */
        get: function () {
            // We can't make this an attribute with a default value
            // since it would be set after it is needed in the
            // constructor.
            return 'button';
        },
        enumerable: true,
        configurable: true
    });
    ToggleButtonView.class_map = {
        primary: ['mod-primary'],
        success: ['mod-success'],
        info: ['mod-info'],
        warning: ['mod-warning'],
        danger: ['mod-danger']
    };
    return ToggleButtonView;
}(DOMWidgetView));
export { ToggleButtonView };
var ValidModel = /** @class */ (function (_super) {
    __extends(ValidModel, _super);
    function ValidModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ValidModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            readout: 'Invalid',
            _view_name: 'ValidView',
            _model_name: 'ValidModel'
        });
    };
    return ValidModel;
}(BoolModel));
export { ValidModel };
var ValidView = /** @class */ (function (_super) {
    __extends(ValidView, _super);
    function ValidView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Called when view is rendered.
     */
    ValidView.prototype.render = function () {
        _super.prototype.render.call(this);
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-valid');
        this.el.classList.add('widget-inline-hbox');
        this.icon = document.createElement('i');
        this.icon.classList.add('fa', 'fa-fw');
        this.el.appendChild(this.icon);
        this.readout = document.createElement('span');
        this.readout.classList.add('widget-valid-readout');
        this.readout.classList.add('widget-readout');
        this.el.appendChild(this.readout);
        this.update();
    };
    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    ValidView.prototype.update = function () {
        this.el.classList.remove('mod-valid');
        this.el.classList.remove('mod-invalid');
        this.icon.classList.remove('fa-check');
        this.icon.classList.remove('fa-times');
        this.readout.textContent = this.model.get('readout');
        if (this.model.get('value')) {
            this.el.classList.add('mod-valid');
            this.icon.classList.add('fa-check');
        }
        else {
            this.el.classList.add('mod-invalid');
            this.icon.classList.add('fa-times');
        }
    };
    return ValidView;
}(DescriptionView));
export { ValidView };
