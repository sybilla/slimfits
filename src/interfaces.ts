import {Promise} from 'es6-promise';

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
    name: string;
    canReadData(header: Array<IKeyword>): boolean;
    readDataAsync(file: IDataSource, offsetBytes: number, header: Array<IKeyword>): Promise<any>;
    readDataSize(header: Array<IKeyword>): number;
}

export interface IDataSource {
    initialize(): Promise<any>;
    getByteLength(): number;
    getStringAsync(start: number, length: number): Promise<string>;
    getDataAsync(start: number, length: number, bitPix: BitPix, changeEndian?: boolean): Promise<ITypedArray>;
}

export interface IHdu {
    data: () => Promise<any>;
    header: IKeyword[];
    bytesRead: number;
}

export interface IHeaderResult {
    header: IKeyword[];
    bytesRead: number;
}


export interface IAsciiConverter {
    array: ArrayLike<any>;
    converter: (x: string) => any;
}

export class DataResult {
    constructor(public data: any, public name: string) {

    }
}

/**
    Contains constants describing basic structure of FITS file. Each unit of organization,
    be it header of payload is padded to be a multiple of 2880, which defined to be a block length.
    
    In header each line has constant length of 80 ASCII characters, with 8 bytes for the keyword,
    hence abbreviated key names. 
    
    Block length divided by line length gives the maximal count of lines per block: 36.   
*/
export var Constants = {
    blockLength: 2880,
    lineLength: 80,
    keyLength: 8,
    maxKeywordsInBlock: 36
};

export enum BitPix {
    Uint8 = 8,
    Char = 8,
    Int16 = 16,
    Int32 = 32,
    Int64 = 64,
    Float32 = -32,
    Float64 = -64,
    Unknown = 0
}

export class BitPixUtils {
    /**
        Gets size of type in bytes
        @static
        @public
        @param {BitPix} type - The type.
        @return {number} - size in bytes
        
    */
    public static getByteSize(type: BitPix): number {
        return Math.abs(type) / 8;
    }

    public static getBitPixForLetter(format: string) {
        switch (format) {
            case 'A':
                return BitPix.Uint8;
            case 'B':
                return BitPix.Uint8;
            case 'I':
                return BitPix.Int16;
            case 'J':
                return BitPix.Int32;
            case 'K':
                return BitPix.Int64;
            case 'E':
                return BitPix.Float32;
            case 'D':
                return BitPix.Float64;
            default:
                throw 'unrecognized format';
        }
    }
}