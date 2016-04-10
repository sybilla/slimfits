import { Promise } from 'es6-promise';
export interface IKeyword {
    key: string;
    value: any;
    comment: string;
}
export interface ITypedArray extends ArrayLike<number> {
    BYTES_PER_ELEMENT: number;
    byteLength: number;
    byteOffset: number;
    buffer: ArrayBuffer;
}
export interface IDataReader {
    canReadData(header: Array<IKeyword>): boolean;
    readDataAsync(file: IDataSource, offsetBytes: number, header: Array<IKeyword>): any;
    readDataSize(header: Array<IKeyword>): number;
}
export interface IDataSource {
    initialize(): Promise<any>;
    getByteLength(): number;
    getStringAsync(start: number, length: number): Promise<string>;
    getDataAsync(start: number, length: number, bitPix: BitPix, changeEndian?: boolean): Promise<ITypedArray>;
}
export interface IHdu {
    data: any;
    header: IKeyword[];
    bytesRead: number;
}
export interface IHeaderResult {
    header: IKeyword[];
    bytesRead: number;
}
export interface IDataResult {
    data: any;
    bytesRead: number;
}
export interface IAsciiConverter {
    array: ArrayLike<any>;
    converter: (x: string) => any;
}
/**
    Contains constants describing basic structure of FITS file. Each unit of organization,
    be it header of payload is padded to be a multiple of 2880, which defined to be a block length.
    
    In header each line has constant length of 80 ASCII characters, with 8 bytes for the keyword,
    hence abbreviated key names.
    
    Block length divided by line length gives the maximal count of lines per block: 36.
*/
export declare var Constants: {
    blockLength: number;
    lineLength: number;
    keyLength: number;
    maxKeywordsInBlock: number;
};
export declare enum BitPix {
    Byte = 8,
    Char = 8,
    Short = 16,
    Integer = 32,
    Long = 64,
    Float = -32,
    Double = -64,
    Unknown = 0,
}
export declare class BitPixUtils {
    /**
        Gets size of type in bytes
        @static
        @public
        @param {BitPix} type - The type.
        @return {number} - size in bytes
        
    */
    static getByteSize(type: BitPix): number;
    static getBitPixForLetter(format: string): BitPix;
}
