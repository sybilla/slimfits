import { IDataReader, IDataSource, IKeyword } from "../Interfaces";
import { Promise } from 'es6-promise';
export declare class BinaryTableDataReader implements IDataReader {
    canReadData(header: Array<IKeyword>): boolean;
    readDataSize(header: Array<IKeyword>): number;
    private readColumn(source, rows, rowByteWidth, rowByteOffset, width, format);
    readDataAsync(file: IDataSource, offsetBytes: number, header: Array<IKeyword>): Promise<any[][]>;
}
