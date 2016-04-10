import { Promise } from 'es6-promise';
import { IDataSource, IHdu, IKeyword, IHeaderResult, IDataResult } from './Interfaces';
export declare class FitsReader {
    static readFitsAsync(file: IDataSource): Promise<IHdu[]>;
    static readHeaderAsync(file: IDataSource, offsetBytes: number): Promise<IHeaderResult>;
    static readHduAsync(file: IDataSource, offsetBytes: number): Promise<IHdu>;
    static readDataAsync(file: IDataSource, offsetBytes: number, header: IKeyword[]): Promise<IDataResult>;
    static readDataSize(header: IKeyword[]): number;
}
