import { IDataReader, IDataSource, IKeyword } from "../Interfaces";
import { Promise } from 'es6-promise';
export declare class AsciiTableDataReader implements IDataReader {
    canReadData(header: Array<IKeyword>): boolean;
    readDataSize(header: Array<IKeyword>): number;
    readDataAsync(file: IDataSource, offsetBytes: number, header: Array<IKeyword>): Promise<ArrayLike<any>[]>;
}
