import { IKeyword, IDataReader, IDataSource, ITypedArray } from "../Interfaces";
import { Promise } from 'es6-promise';
export declare class RandomGroupsDataReader implements IDataReader {
    canReadData(header: Array<IKeyword>): boolean;
    readDataSize(header: Array<IKeyword>): number;
    readDataAsync(file: IDataSource, offsetBytes: number, header: Array<IKeyword>, changeEndian?: boolean): Promise<{
        params: ITypedArray[];
        data: ITypedArray[];
    }>;
}
