import { IKeyword } from '../Interfaces';
export declare class Keyword implements IKeyword {
    key: string;
    value: any;
    comment: string;
    constructor(key: string, value?: any, comment?: string);
    static isLastLine(line: string): boolean;
}
export declare class KeywordsManager {
    private static getConverterByName(name);
    private static isInt(num);
    private static getConverterByType(type);
    static single(header: Array<Keyword>, key: string): IKeyword;
    static getValue<T>(header: Array<Keyword>, key: string, defaultValue: T): T;
    static hasValue<T>(header: Array<Keyword>, key: string, value: T): boolean;
    static hasValueFromList<T>(header: Array<Keyword>, key: string, values: T[]): boolean;
    static convert(value: any): any;
    static convertBack(value: any, name: string): any;
    static parseKeyword(line: string): IKeyword;
}
