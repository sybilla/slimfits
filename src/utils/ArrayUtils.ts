import {ITypedArray, BitPixUtils, BitPix} from '../Interfaces';

export class ArrayUtils {
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
    public static copy(source: ArrayBuffer, target: ArrayBuffer, sourceByteOffset: number, length: number,
        type: BitPix, changeEndian: boolean = true): void {
        if (length == 0) {
            throw 'Length of copied array cannot be 0';
        }

        if (type == BitPix.Unknown) {
            throw 'Unknown array element type';
        }

        let [sourceBytes, targetBytes] = [new Uint8Array(source), new Uint8Array(target)];
        let bytesPerElement = BitPixUtils.getByteSize(type);
        let bytesLength = length * bytesPerElement;

        if (changeEndian && bytesPerElement !== 1) {
            for (let i = 0; i < length; i++) {
                // reversing endianess loop
                for (let j = 0; j < bytesPerElement; j++) {
                    targetBytes[bytesPerElement * i + j] = sourceBytes[sourceByteOffset + bytesPerElement * i + (bytesPerElement - (j + 1))];
                }
            }
        } else {
            for (let i = 0; i < bytesLength; i++) {
                targetBytes[i] = sourceBytes[sourceByteOffset + i];
            }
        }
    }

    /**
        Generates typed array for given type.
        @static
        @public
        @param {BitPix} bitPix - The type of the array.
        @param {number} length - The length of the array.
        @return {ITypedArray} - Array of given length and type.
        
    */
    public static generateTypedArray(bitPix: BitPix, length: number): ITypedArray {
        if (length == 0) {
            throw 'Length of created array cannot be 0';
        }

        switch (bitPix) {
            case BitPix.Byte:
                {
                    return new Uint8Array(length);
                }
            case BitPix.Short:
                {
                    return new Int16Array(length);
                }
            case BitPix.Integer:
                {
                    return new Int32Array(length);
                }
            case BitPix.Float:
                {
                    return new Float32Array(length);
                }
            case BitPix.Double:
                {
                    return new Float64Array(length);
                }
            default:
                throw 'Cannot create array of unknown type';
        }
    }

    // Plucks column elements from buffer and lays them down in continous space
    public static pluckColumn(source: ArrayBuffer, target: ArrayBuffer, rows: number, rowByteWidth: number,
        rowByteOffset: number, width: number, type: BitPix, changeEndian: boolean) {
        let [sourceBytes, targetBytes] = [new Uint8Array(source), new Uint8Array(target)];
        let bytesPerElement = BitPixUtils.getByteSize(type);
        if (changeEndian && bytesPerElement !== 1) {
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < width; j++) {
                    for (let k = 0; k < bytesPerElement; k++) {
                        targetBytes[i * width * bytesPerElement + j * bytesPerElement + k]
                            = sourceBytes[i * rowByteWidth + rowByteOffset + j * bytesPerElement + (bytesPerElement - (k + 1))];
                    }
                }
            }
        } else {
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < width; j++) {
                    for (let k = 0; k < bytesPerElement; k++) {
                        targetBytes[i * width * bytesPerElement + j * bytesPerElement + k]
                            = sourceBytes[i * rowByteWidth + rowByteOffset + j * bytesPerElement + k];
                    }
                }
            }
        }
    }

    public static chunk(buffer: ArrayBuffer, dataType: BitPix, chunkSize: number): ITypedArray[] {
        let chunkByteSize = BitPixUtils.getByteSize(dataType) * chunkSize;
        let chunksNumber = buffer.byteLength / chunkByteSize;

        let column: Array<ITypedArray> = [];
        switch (dataType) {
            case BitPix.Byte:
                {
                    for (let i = 0; i < chunksNumber; i++) {
                        column.push(new Uint8Array(buffer, i * chunkByteSize, chunkSize));
                    }

                    return column;
                }
            case BitPix.Short:
                {
                    for (let i = 0; i < chunksNumber; i++) {
                        column.push(new Int16Array(buffer, i * chunkByteSize, chunkSize));
                    }

                    return column;
                }
            case BitPix.Integer:
                {
                    for (let i = 0; i < chunksNumber; i++) {
                        column.push(new Int32Array(buffer, i * chunkByteSize, chunkSize));
                    }

                    return column;
                }
            case BitPix.Float:
                {
                    for (let i = 0; i < chunksNumber; i++) {
                        column.push(new Float32Array(buffer, i * chunkByteSize, chunkSize));
                    }

                    return column;
                }
            case BitPix.Double:
                {
                    for (let i = 0; i < chunksNumber; i++) {
                        column.push(new Float64Array(buffer, i * chunkByteSize, chunkSize));
                    }

                    return column;
                }
            default:
                throw 'Cannot create array of unknown type';
        }
    }
}