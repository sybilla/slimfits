import { ITypedArray, IDataSource, BitPix } from '../Interfaces';
import { Promise } from 'es6-promise';
export declare class MultipleRequestFile implements IDataSource {
    url: string;
    private size;
    constructor(url: string);
    private static parseHeaders(headerStr);
    initialize(): Promise<any>;
    getByteLength(): number;
    getStringAsync(start: number, byteLength: number): Promise<string>;
    getDataAsync(start: number, length: number, bitPix: BitPix, changeEndian?: boolean): Promise<ITypedArray>;
}
