import { ITypedArray, IDataSource, BitPix } from "../Interfaces";
import { Promise } from 'es6-promise';
export declare class BlobFile implements IDataSource {
    private file;
    url: string;
    constructor(file: File);
    initialize(): Promise<any>;
    getByteLength(): number;
    getStringAsync(start: number, length: number): Promise<string>;
    getDataAsync(start: number, length: number, bitPix: BitPix, changeEndian?: boolean): Promise<ITypedArray>;
}
