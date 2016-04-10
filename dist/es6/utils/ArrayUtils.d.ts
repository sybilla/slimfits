import { ITypedArray, BitPix } from '../Interfaces';
export declare class ArrayUtils {
    /**
        Copies array from source array buffer to target starting from given offset with optional endianess reversal.
        @static
        @public
        @param {ArrayBuffer} source - The source array buffer.
        @param {ArrayBuffer} target - The target array buffer.
        @param {number} sourceByteOffset - Byte offset in the source ArrayBuffer from which to start copying.
        @param {number} length - Length of copied subarray, cannot be 0
        @param {BitPix} type - Type of items being copied, cannot be Unknown
        @param {boolean} changeEndian - Flag indicating whether endianess should be reversed.
        
    */
    static copy(source: ArrayBuffer, target: ArrayBuffer, sourceByteOffset: number, length: number, type: BitPix, changeEndian?: boolean): void;
    /**
        Generates typed array for given type.
        @static
        @public
        @param {BitPix} bitPix - The type of the array.
        @param {number} length - The length of the array.
        @return {ITypedArray} - Array of given length and type.
        
    */
    static generateTypedArray(bitPix: BitPix, length: number): ITypedArray;
    static pluckColumn(source: ArrayBuffer, target: ArrayBuffer, rows: number, rowByteWidth: number, rowByteOffset: number, width: number, type: BitPix, changeEndian: boolean): void;
    static chunk(buffer: ArrayBuffer, dataType: BitPix, chunkSize: number): ITypedArray[];
}
