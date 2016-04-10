import { IDataReader, IDataSource, IKeyword, ITypedArray } from "../Interfaces";
import { Promise } from 'es6-promise';
export declare class CompressedImageReader implements IDataReader {
    canReadData(header: Array<IKeyword>): boolean;
    readDataSize(header: Array<IKeyword>): number;
    private static convertToTiles(pointers, compressedData);
    private static riceExtract(compressedTile, blockSize, bytePix);
    readDataAsync(file: IDataSource, offsetBytes: number, header: Array<IKeyword>): Promise<ITypedArray[]>;
}
