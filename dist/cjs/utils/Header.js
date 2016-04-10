"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Header = (function () {
    function Header(name, value) {
        this.name = name;
        this.value = value;
    }
    return Header;
}());
exports.Header = Header;
var AcceptRangeHeader = (function (_super) {
    __extends(AcceptRangeHeader, _super);
    function AcceptRangeHeader(from, length) {
        _super.call(this, 'Range', 'bytes=' + from + '-' + (from + length - 1));
        this.from = from;
        this.length = length;
    }
    return AcceptRangeHeader;
}(Header));
exports.AcceptRangeHeader = AcceptRangeHeader;
//# sourceMappingURL=Header.js.map