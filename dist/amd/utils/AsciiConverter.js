define(["require", "exports"], function (require, exports) {
    "use strict";
    var RegexTemplates = (function () {
        function RegexTemplates() {
        }
        RegexTemplates.test = function (template, value) {
            return new RegExp(template).test(value);
        };
        RegexTemplates.String = 'A\\d{1,}';
        RegexTemplates.Integer = 'I\\d{1,}';
        RegexTemplates.Float = 'F\\d{1,}\\.?\\d{0,}';
        RegexTemplates.Double = '(D|E)\\d{1,}\\.?\\d{0,}';
        return RegexTemplates;
    }());
    var AsciiConverter = (function () {
        function AsciiConverter() {
        }
        AsciiConverter.getConverterFor = function (value, length) {
            if (RegexTemplates.test(RegexTemplates.String, value)) {
                return {
                    converter: function (x) { return x; },
                    array: new Array(length)
                };
            }
            else if (RegexTemplates.test(RegexTemplates.Integer, value)) {
                return {
                    converter: function (x) {
                        return x === '' ? 0 : parseInt(x);
                    },
                    array: new Int32Array(length)
                };
            }
            else if (RegexTemplates.test(RegexTemplates.Float, value)) {
                return {
                    converter: function (x) {
                        return x === '' ? 0 : parseFloat(x);
                    },
                    array: new Float32Array(length)
                };
            }
            else if (RegexTemplates.test(RegexTemplates.Double, value)) {
                return {
                    converter: function (x) {
                        return x === '' ? 0 : parseFloat(x);
                    },
                    array: new Float64Array(length)
                };
            }
            else {
                throw 'AsciiConvertManager: No converter registered for ' + value;
            }
        };
        return AsciiConverter;
    }());
    exports.AsciiConverter = AsciiConverter;
});
//# sourceMappingURL=AsciiConverter.js.map