import {TypedArray, BitPixUtils, BitPix} from '../interfaces';

export class ArrayUtils {
    /**
     *  Copies array from source array buffer to target starting from given offset with optional endianess reversal.
     *  @static
     *  @public
     *  @param {ArrayBuffer} source - The source array buffer.
     *  @param {ArrayBuffer} target - The target array buffer.
     *  @param {number} sourceByteOffset - Byte offset in the source ArrayBuffer from which to start copying.
     *  @param {number} length - Length of copied subarray, cannot be 0
     *  @param {BitPix} type - Type of items being copied, cannot be Unknown
     *  @param {boolean} changeEndian - Flag indicating whether endianess should be reversed.
     */
    public static copy(
        source: ArrayBufferLike,
        target: ArrayBufferLike,
        sourceByteOffset: number,
        length: number,
        type: BitPix,
        changeEndian = true,
        targetByteOffset = 0): void {
        if (length === 0) {
            throw new Error('Length of copied array cannot be 0');
        }

        if (type === BitPix.Unknown) {
            throw new Error('Unknown array element type');
        }

        const [sourceBytes, targetBytes] = [new Uint8Array(source), new Uint8Array(target)];
        const bytesPerElement = BitPixUtils.getByteSize(type);
        const bytesLength = length * bytesPerElement;

        if (changeEndian && bytesPerElement !== 1) {
            for (let i = 0; i < length; i++) {
                // reversing endianess loop
                for (let j = 0; j < bytesPerElement; j++) {
                    const offset = sourceByteOffset + bytesPerElement * i + (bytesPerElement - (j + 1));
                    targetBytes[targetByteOffset + bytesPerElement * i + j] = sourceBytes[offset];
                }
            }
        } else {
            for (let i = 0; i < bytesLength; i++) {
                targetBytes[targetByteOffset + i] = sourceBytes[sourceByteOffset + i];
            }
        }
    }

    /**
     *  Generates typed array for given type.
     *  @static
     *  @public
     *  @param {BitPix} bitPix - The type of the array.
     *  @param {number} length - The length of the array.
     *  @return {ITypedArray} - Array of given length and type.
     */
    public static generateTypedArray(bitPix: BitPix, length: number): TypedArray {
        if (length === 0) {
            throw new Error('Length of created array cannot be 0');
        }

        switch (bitPix) {
            case BitPix.Uint8:
                {
                    return new Uint8Array(length);
                }
            case BitPix.Int16:
                {
                    return new Int16Array(length);
                }
            case BitPix.Int32:
                {
                    return new Int32Array(length);
                }
            case BitPix.Float32:
                {
                    return new Float32Array(length);
                }
            case BitPix.Float64:
                {
                    return new Float64Array(length);
                }
            default:
                throw new Error('Cannot create array of unknown type');
        }
    }

    // Plucks column elements from buffer and lays them down in continous space
    public static pluckColumn(
        source: ArrayBufferLike,
        target: ArrayBufferLike,
        rows: number,
        rowByteWidth: number,
        rowByteOffset: number,
        width: number,
        type: BitPix,
        changeEndian: boolean) {
        const [sourceBytes, targetBytes] = [new Uint8Array(source), new Uint8Array(target)];
        const bytesPerElement = BitPixUtils.getByteSize(type);
        if (changeEndian && bytesPerElement !== 1) {
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < width; j++) {
                    const targetOffset = (i * width + j) * bytesPerElement;
                    const sourceOffset = i * rowByteWidth + rowByteOffset + j * bytesPerElement;
                    for (let k = 0; k < bytesPerElement; k++) {
                        targetBytes[targetOffset + k] = sourceBytes[sourceOffset + (bytesPerElement - (k + 1))];
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

    public static chunk(buffer: ArrayBufferLike, dataType: BitPix, chunkSize: number): TypedArray[] {
        const chunkByteSize = BitPixUtils.getByteSize(dataType) * chunkSize;
        const chunksNumber = buffer.byteLength / chunkByteSize;

        const column: TypedArray[] = [];
        switch (dataType) {
            case BitPix.Uint8:
                {
                    for (let i = 0; i < chunksNumber; i++) {
                        column.push(new Uint8Array(buffer, i * chunkByteSize, chunkSize));
                    }

                    return column;
                }
            case BitPix.Int16:
                {
                    for (let i = 0; i < chunksNumber; i++) {
                        column.push(new Int16Array(buffer, i * chunkByteSize, chunkSize));
                    }

                    return column;
                }
            case BitPix.Int32:
                {
                    for (let i = 0; i < chunksNumber; i++) {
                        column.push(new Int32Array(buffer, i * chunkByteSize, chunkSize));
                    }

                    return column;
                }
            case BitPix.Float32:
                {
                    for (let i = 0; i < chunksNumber; i++) {
                        column.push(new Float32Array(buffer, i * chunkByteSize, chunkSize));
                    }

                    return column;
                }
            case BitPix.Float64:
                {
                    for (let i = 0; i < chunksNumber; i++) {
                        column.push(new Float64Array(buffer, i * chunkByteSize, chunkSize));
                    }

                    return column;
                }
            default:
                throw new Error('Cannot create array of unknown type');
        }
    }
}
