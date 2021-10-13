"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var styled_components_1 = __importDefault(require("styled-components"));
var Styles = {
    Container: styled_components_1.default.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n\t\twidth: 350px;\n\t\theight: 100vh;\n\t\tbackground-color: rgba(24, 24, 24, 0.9975);\n\t\tbackdrop-filter: blur(24px);\n\n\t\tdisplay: flex;\n\t\talign-items: center;\n\t\tjustify-content: center;\n\t\tflex-wrap: wrap;\n\t\tflex-direction: column;\n\t"], ["\n\t\twidth: 350px;\n\t\theight: 100vh;\n\t\tbackground-color: rgba(24, 24, 24, 0.9975);\n\t\tbackdrop-filter: blur(24px);\n\n\t\tdisplay: flex;\n\t\talign-items: center;\n\t\tjustify-content: center;\n\t\tflex-wrap: wrap;\n\t\tflex-direction: column;\n\t"]))),
    Button: styled_components_1.default.button(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n\t\twidth: 100%;\n\t\theight: 65px;\n\t\tbackground: transparent;\n\n\t\tcolor: inherit;\n\t\tfont-family: inherit;\n\t\tborder: none;\n\t\tfont-size: 24px;\n\t\tcursor: pointer;\n\t\ttext-align: left;\n\t\tpadding-left: 34px;\n\t\twhite-space: pre;\n\n\t\topacity: 50%;\n\t\t&:hover {\n\t\t\topacity: 70%;\n\t\t}\n\n\t\t::before {\n\t\t\tcontent: '';\n\t\t\twidth: ", ";\n\t\t\theight: 65px;\n\t\t\tdisplay: block;\n\t\t\tposition: absolute;\n\t\t\ttransform: translateX(-50px) translateY(-16.25px);\n\t\t\tbackground: white;\n\t\t\tmargin: 0;\n\t\t\twhite-space: pre;\n\t\t\tborder-radius: 8px;\n\t\t}\n\t"], ["\n\t\twidth: 100%;\n\t\theight: 65px;\n\t\tbackground: transparent;\n\n\t\tcolor: inherit;\n\t\tfont-family: inherit;\n\t\tborder: none;\n\t\tfont-size: 24px;\n\t\tcursor: pointer;\n\t\ttext-align: left;\n\t\tpadding-left: 34px;\n\t\twhite-space: pre;\n\n\t\topacity: 50%;\n\t\t&:hover {\n\t\t\topacity: 70%;\n\t\t}\n\n\t\t::before {\n\t\t\tcontent: '';\n\t\t\twidth: ", ";\n\t\t\theight: 65px;\n\t\t\tdisplay: block;\n\t\t\tposition: absolute;\n\t\t\ttransform: translateX(-50px) translateY(-16.25px);\n\t\t\tbackground: white;\n\t\t\tmargin: 0;\n\t\t\twhite-space: pre;\n\t\t\tborder-radius: 8px;\n\t\t}\n\t"])), function (props) {
        return props.selected ? '24px' : '0px';
    })
};
var Button = /** @class */ (function (_super) {
    __extends(Button, _super);
    function Button() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            selected: false
        };
        return _this;
    }
    Button.prototype.render = function () {
        var _this = this;
        return react_1.default.createElement(Styles.Button, { onMouseEnter: function () { return _this.setState({ selected: true }); }, onMouseLeave: function () { return _this.setState({ selected: false }); }, selected: this.state.selected }, this.props.Label);
    };
    return Button;
}(react_1.Component));
var LeftBar = /** @class */ (function (_super) {
    __extends(LeftBar, _super);
    function LeftBar() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LeftBar.prototype.render = function () {
        return (react_1.default.createElement(Styles.Container, null,
            react_1.default.createElement(Button, { Label: "Explore" }),
            react_1.default.createElement(Button, { Label: "Genres" }),
            react_1.default.createElement(Button, { Label: "Radio" }),
            react_1.default.createElement(Button, { Label: "Artists" }),
            react_1.default.createElement(Button, { Label: "Albums" }),
            react_1.default.createElement(Button, { Label: "Settings" })));
    };
    return LeftBar;
}(react_1.Component));
exports.default = LeftBar;
var templateObject_1, templateObject_2;
