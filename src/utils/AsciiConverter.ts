import {IAsciiConverter} from '../Interfaces';

class RegexTemplates {
    public static String: string = 'A\\d{1,}';
    public static Integer: string = 'I\\d{1,}';
    public static Float: string = 'F\\d{1,}\\.?\\d{0,}';
    public static Double: string = '(D|E)\\d{1,}\\.?\\d{0,}';

    public static test(template: string, value: string): boolean {
        return new RegExp(template).test(value);
    }
}

export class AsciiConverter {
    public static getConverterFor(value: string, length: number): IAsciiConverter  {
        if (RegexTemplates.test(RegexTemplates.String, value)) {
            return {
                converter: (x: string) => x,
                array : new Array<string>(length)
            };
        } else if (RegexTemplates.test(RegexTemplates.Integer, value)) {
            return {
                converter: (x: string) => {
                    return x === '' ? 0 : parseInt(x, 10);
                },
                array : new Int32Array(length)
            };
        } else if (RegexTemplates.test(RegexTemplates.Float, value)) {
            return {
                converter: (x: string) => {
                    return x === '' ? 0 : parseFloat(x);
                },
                array : new Float32Array(length)
            };
        } else if (RegexTemplates.test(RegexTemplates.Double, value)) {
            return {
                converter: (x: string) => {
                    return x === '' ? 0 : parseFloat(x);
                },
                array : new Float64Array(length)
            };
        } else {
            throw new Error('AsciiConvertManager: No converter registered for ' + value);
        }
    }
}
