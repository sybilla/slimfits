import { IDataReader, IDataSource, IKeyword, ITypedArray } from "../Interfaces";
import { Promise } from 'es6-promise';
export declare class SimpleDataReader implements IDataReader {
    canReadData(header: Array<IKeyword>): boolean;
    readDataSize(header: Array<IKeyword>): number;
    readDataAsync(file: IDataSource, offsetBytes: number, header: Array<IKeyword>, changeEndian?: boolean): Promise<ITypedArray>;
}
