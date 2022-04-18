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
import { DOMWidgetView, StyleModel } from '../../base';
import { CoreDOMWidgetModel } from './widget_core';
import { JUPYTER_CONTROLS_VERSION } from './version';
import * as _ from 'underscore';
var ButtonStyleModel = /** @class */ (function (_super) {
    __extends(ButtonStyleModel, _super);
    function ButtonStyleModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ButtonStyleModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _model_name: 'ButtonStyleModel',
            _model_module: '../../controls',
            _model_module_version: JUPYTER_CONTROLS_VERSION,
        });
    };
    ButtonStyleModel.styleProperties = {
        button_color: {
            selector: '',
            attribute: 'background-color',
            default: null
        },
        font_weight: {
            selector: '',
            attribute: 'font-weight',
            default: ''
        }
    };
    return ButtonStyleModel;
}(StyleModel));
export { ButtonStyleModel };
var ButtonModel = /** @class */ (function (_super) {
    __extends(ButtonModel, _super);
    function ButtonModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ButtonModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            description: '',
            tooltip: '',
            disabled: false,
            icon: '',
            button_style: '',
            _view_name: 'ButtonView',
            _model_name: 'ButtonModel',
            style: null
        });
    };
    return ButtonModel;
}(CoreDOMWidgetModel));
export { ButtonModel };
var ButtonView = /** @class */ (function (_super) {
    __extends(ButtonView, _super);
    function ButtonView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Called when view is rendered.
     */
    ButtonView.prototype.render = function () {
        _super.prototype.render.call(this);
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('jupyter-button');
        this.el.classList.add('widget-button');
        this.listenTo(this.model, 'change:button_style', this.update_button_style);
        this.set_button_style();
        this.update(); // Set defaults.
    };
    /**
     * Update the contents of this view
     *
     * Called when the model is changed. The model may have been
     * changed by another view or by a state update from the back-end.
     */
    ButtonView.prototype.update = function () {
        this.el.disabled = this.model.get('disabled');
        this.el.setAttribute('title', this.model.get('tooltip'));
        var description = this.model.get('description');
        var icon = this.model.get('icon');
        if (description.length || icon.length) {
            this.el.textContent = '';
            if (icon.length) {
                var i = document.createElement('i');
                i.classList.add('fa');
                i.classList.add('fa-' + icon);
                if (description.length === 0) {
                    i.classList.add('center');
                }
                this.el.appendChild(i);
            }
            this.el.appendChild(document.createTextNode(description));
        }
        return _super.prototype.update.call(this);
    };
    ButtonView.prototype.update_button_style = function () {
        this.update_mapped_classes(ButtonView.class_map, 'button_style');
    };
    ButtonView.prototype.set_button_style = function () {
        this.set_mapped_classes(ButtonView.class_map, 'button_style');
    };
    /**
     * Dictionary of events and handlers
     */
    ButtonView.prototype.events = function () {
        // TODO: return typing not needed in Typescript later than 1.8.x
        // See http://stackoverflow.com/questions/22077023/why-cant-i-indirectly-return-an-object-literal-to-satisfy-an-index-signature-re and https://github.com/Microsoft/TypeScript/pull/7029
        return { 'click': '_handle_click' };
    };
    /**
     * Handles when the button is clicked.
     */
    ButtonView.prototype._handle_click = function (event) {
        event.preventDefault();
        this.send({ event: 'click' });
    };
    Object.defineProperty(ButtonView.prototype, "tagName", {
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
    ButtonView.class_map = {
        primary: ['mod-primary'],
        success: ['mod-success'],
        info: ['mod-info'],
        warning: ['mod-warning'],
        danger: ['mod-danger']
    };
    return ButtonView;
}(DOMWidgetView));
export { ButtonView };
