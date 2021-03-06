import {ValueConverters} from './ValueConverters';
import {IKeyword, Constants} from '../Interfaces';

export class Keyword implements IKeyword {
    constructor(public key: string, public value: any = null, public comment: string = null) {}

    static isLastLine(line: string) {
        return line.indexOf('END     ', 0) === 0;
    }
}

export class KeywordsManager {
    private static getConverterByName (name: string) {
        // first look for exact match
        if (name in ValueConverters.registeredNames) {
            return ValueConverters.registeredNames[name];
        }

        // then look for keywords that start with provided name
        let foundKeys = Object.keys(ValueConverters.registeredPrefixedNames)
            .filter(k => name.indexOf(k) === 0);

        if (foundKeys.length > 0) {
            return ValueConverters.registeredPrefixedNames[foundKeys[0]];
        } else {
            return ValueConverters.defaultConverter;
        }
    }

    private static isInt(num: any) {
        return typeof num === 'number' && parseFloat(num.toString()) === parseInt(num.toString(), 10) && !isNaN(num);
    }

    private static getConverterByType(type: string) {
        if (type in ValueConverters.registeredTypes) {
            return ValueConverters.registeredTypes[type];
        }
        return ValueConverters.defaultConverter;
    }

    public static single(header: Array<Keyword>, key: string): IKeyword {
        return header.filter( k => k.key == key)[0]; // undefined if not found
    }

    public static getValue<T>(header: Array<Keyword>, key: string, defaultValue: T): T {
        let values = header.filter( k => k.key == key);
        return values.length == 0 ? defaultValue : values[0].value;
    }

    public static hasValue<T>(header: Array<Keyword>, key: string, value: T): boolean {
        return header.some( k => k.key == key && k.value == value);
    }

    public static hasValueFromList<T>(header: Array<Keyword>, key: string, values: T[]): boolean {
        return header.some( k => k.key == key && values.indexOf(k.value) > -1);
    }

    public static convert(value: any) {
        let jsType = typeof value;
        if (jsType === 'number') {
            jsType = (KeywordsManager.isInt(value) ? 'int' : 'float');
        }
        if (jsType === 'object' ? value.getMonth : void 0) {
            jsType = 'date';
        }
        return KeywordsManager.getConverterByType(jsType);
    }

    public static convertBack(value: any, name: string) {
        let converter = KeywordsManager.getConverterByName(name);
        return converter.convertBack(value);
    }

    public static parseKeyword(line: string): IKeyword {
        let keyword = new Keyword(line.substring(0, Constants.keyLength).trim());

        if (line.substr(Constants.keyLength, 2) === '= ') {
            if (line.charAt(31) === '/') {
                keyword.value = KeywordsManager.convertBack(line.substr(10, 21).trim(), keyword.key);
                keyword.comment = line.substr(32).trim();
            } else {
                let valueAndComment = line.substr(10, Constants.lineLength - 10);
                let slashIdx = valueAndComment.lastIndexOf(' /');
                let hasNoComment = slashIdx === -1;

                if (hasNoComment) {
                    keyword.value = KeywordsManager.convertBack(valueAndComment.trim(), keyword.key);
                } else {
                    keyword.value = KeywordsManager.convertBack(valueAndComment.substring(0, slashIdx).trim(), keyword.key);
                    keyword.comment = valueAndComment.substring(slashIdx + 1).trim();
                }
            }
        } else {
            let value: string = line.substr(Constants.keyLength, Constants.lineLength - Constants.keyLength);
            keyword.value = KeywordsManager.convertBack(value, keyword.key);
        }

        return keyword;
    }
}