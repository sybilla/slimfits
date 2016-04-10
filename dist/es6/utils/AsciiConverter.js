class RegexTemplates {
    static test(template, value) {
        return new RegExp(template).test(value);
    }
}
RegexTemplates.String = 'A\\d{1,}';
RegexTemplates.Integer = 'I\\d{1,}';
RegexTemplates.Float = 'F\\d{1,}\\.?\\d{0,}';
RegexTemplates.Double = '(D|E)\\d{1,}\\.?\\d{0,}';
export class AsciiConverter {
    static getConverterFor(value, length) {
        if (RegexTemplates.test(RegexTemplates.String, value)) {
            return {
                converter: (x) => x,
                array: new Array(length)
            };
        }
        else if (RegexTemplates.test(RegexTemplates.Integer, value)) {
            return {
                converter: (x) => {
                    return x === '' ? 0 : parseInt(x);
                },
                array: new Int32Array(length)
            };
        }
        else if (RegexTemplates.test(RegexTemplates.Float, value)) {
            return {
                converter: (x) => {
                    return x === '' ? 0 : parseFloat(x);
                },
                array: new Float32Array(length)
            };
        }
        else if (RegexTemplates.test(RegexTemplates.Double, value)) {
            return {
                converter: (x) => {
                    return x === '' ? 0 : parseFloat(x);
                },
                array: new Float64Array(length)
            };
        }
        else {
            throw 'AsciiConvertManager: No converter registered for ' + value;
        }
    }
}
//# sourceMappingURL=AsciiConverter.js.map