export interface IKeyword {
    key: string;
    value: any;
    comment: string;
}

export type TypedArray = Uint8Array | Int8Array| Uint16Array | Int16Array |
                        Uint32Array | Int32Array  | Float32Array | Float64Array;

export interface IDataReader {
    name: string;
    canReadData(header: IKeyword[]): boolean;
    readDataAsync(file: IDataSource, offsetBytes: number, header: IKeyword[]): Promise<any>;
    readDataSize(header: IKeyword[]): number;
}

export interface IDataSource {
    initialize(): Promise<boolean>;
    getByteLength(): number;
    getStringAsync(start: number, length: number): Promise<string>;
    getDataAsync(start: number, length: number, bitPix: BitPix, changeEndian?: boolean): Promise<TypedArray>;
}

export interface IHdu {
    data: () => Promise<any|void>;
    header: IKeyword[];
    bytesRead: number;
}

export interface IHeaderResult {
    header: IKeyword[];
    bytesRead: number;
}

export interface IAsciiConverter {
    array: TypedArray | string[];
    converter: (x: string) => any;
}

export class DataResult {
    constructor(public data: any, public name: string) {

    }
}

/**
 *  Contains constants describing basic structure of FITS file. Each unit of organization,
 *  be it header of payload is padded to be a multiple of 2880, which defined to be a block length.
 *
 *  In header each line has constant length of 80 ASCII characters, with 8 bytes for the keyword,
 *  hence abbreviated key names.
 *
 *  Block length divided by line length gives the maximal count of lines per block: 36.
 */
export const Constants = {
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
     *  Gets size of type in bytes
     *  @static
     *  @public
     *  @param {BitPix} type - The type.
     *  @return {number} - size in bytes
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
                throw new Error('unrecognized format');
        }
    }
}
