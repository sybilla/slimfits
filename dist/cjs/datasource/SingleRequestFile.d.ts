import { ITypedArray, IDataSource, BitPix } from '../Interfaces';
import { Promise } from 'es6-promise';
export declare class SingleRequestFile implements IDataSource {
    url: string;
    private data;
    constructor(url: string);
    initialize(): Promise<any>;
    getByteLength(): number;
    getStringAsync(start: number, length: number): Promise<string>;
    getDataAsync(start: number, length: number, bitPix: BitPix, changeEndian?: boolean): Promise<ITypedArray>;
}
