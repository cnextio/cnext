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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { CoreDOMWidgetModel } from './widget_core';
import { DOMWidgetView } from '../../base';
import * as _ from 'underscore';
var FileUploadModel = /** @class */ (function (_super) {
    __extends(FileUploadModel, _super);
    function FileUploadModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FileUploadModel.prototype.defaults = function () {
        return _.extend(_super.prototype.defaults.call(this), {
            _model_name: 'FileUploadModel',
            _view_name: 'FileUploadView',
            _counter: 0,
            accept: '',
            description: 'Upload',
            tooltip: '',
            disabled: false,
            icon: 'upload',
            button_style: '',
            multiple: false,
            metadata: [],
            data: [],
            error: '',
            style: null
        });
    };
    FileUploadModel.serializers = __assign(__assign({}, CoreDOMWidgetModel.serializers), { data: { serialize: function (buffers) { return __spreadArrays(buffers); } } });
    return FileUploadModel;
}(CoreDOMWidgetModel));
export { FileUploadModel };
var FileUploadView = /** @class */ (function (_super) {
    __extends(FileUploadView, _super);
    function FileUploadView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(FileUploadView.prototype, "tagName", {
        get: function () {
            return 'button';
        },
        enumerable: true,
        configurable: true
    });
    FileUploadView.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-upload');
        this.el.classList.add('jupyter-button');
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.style.display = 'none';
        this.el.appendChild(this.fileInput);
        this.el.addEventListener('click', function () {
            _this.fileInput.click();
        });
        this.fileInput.addEventListener('click', function () {
            _this.fileInput.value = '';
        });
        this.fileInput.addEventListener('change', function () {
            var promisesFile = [];
            Array.from(_this.fileInput.files).forEach(function (file) {
                promisesFile.push(new Promise(function (resolve, reject) {
                    var metadata = {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        lastModified: file.lastModified,
                    };
                    _this.fileReader = new FileReader();
                    _this.fileReader.onload = function (event) {
                        var buffer = event.target.result;
                        resolve({
                            buffer: buffer,
                            metadata: metadata,
                            error: '',
                        });
                    };
                    _this.fileReader.onerror = function () {
                        reject();
                    };
                    _this.fileReader.onabort = _this.fileReader.onerror;
                    _this.fileReader.readAsArrayBuffer(file);
                }));
            });
            Promise.all(promisesFile)
                .then(function (contents) {
                var metadata = [];
                var li_buffer = [];
                contents.forEach(function (c) {
                    metadata.push(c.metadata);
                    li_buffer.push(c.buffer);
                });
                var counter = _this.model.get('_counter');
                _this.model.set({
                    _counter: counter + contents.length,
                    metadata: metadata,
                    data: li_buffer,
                    error: '',
                });
                _this.touch();
            })
                .catch(function (err) {
                console.error('error in file upload: %o', err);
                _this.model.set({
                    error: err,
                });
                _this.touch();
            });
        });
        this.listenTo(this.model, 'change:button_style', this.update_button_style);
        this.set_button_style();
        this.update(); // Set defaults.
    };
    FileUploadView.prototype.update = function () {
        this.el.disabled = this.model.get('disabled');
        this.el.setAttribute('title', this.model.get('tooltip'));
        var description = this.model.get('description') + " (" + this.model.get('_counter') + ")";
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
        this.fileInput.accept = this.model.get('accept');
        this.fileInput.multiple = this.model.get('multiple');
        return _super.prototype.update.call(this);
    };
    FileUploadView.prototype.update_button_style = function () {
        this.update_mapped_classes(FileUploadView.class_map, 'button_style', this.el);
    };
    FileUploadView.prototype.set_button_style = function () {
        this.set_mapped_classes(FileUploadView.class_map, 'button_style', this.el);
    };
    FileUploadView.class_map = {
        primary: ['mod-primary'],
        success: ['mod-success'],
        info: ['mod-info'],
        warning: ['mod-warning'],
        danger: ['mod-danger']
    };
    return FileUploadView;
}(DOMWidgetView));
export { FileUploadView };
