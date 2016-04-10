"use strict";
var Interfaces_1 = require('../Interfaces');
var ArrayUtils = (function () {
    function ArrayUtils() {
    }
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
    ArrayUtils.copy = function (source, target, sourceByteOffset, length, type, changeEndian) {
        if (changeEndian === void 0) { changeEndian = true; }
        if (length == 0) {
            throw 'Length of copied array cannot be 0';
        }
        if (type == Interfaces_1.BitPix.Unknown) {
            throw 'Unknown array element type';
        }
        var _a = [new Uint8Array(source), new Uint8Array(target)], sourceBytes = _a[0], targetBytes = _a[1];
        var bytesPerElement = Interfaces_1.BitPixUtils.getByteSize(type);
        var bytesLength = length * bytesPerElement;
        if (changeEndian && bytesPerElement !== 1) {
            for (var i = 0; i < length; i++) {
                // reversing endianess loop
                for (var j = 0; j < bytesPerElement; j++) {
                    targetBytes[bytesPerElement * i + j] = sourceBytes[sourceByteOffset + bytesPerElement * i + (bytesPerElement - (j + 1))];
                }
            }
        }
        else {
            for (var i = 0; i < bytesLength; i++) {
                targetBytes[i] = sourceBytes[sourceByteOffset + i];
            }
        }
    };
    /**
        Generates typed array for given type.
        @static
        @public
        @param {BitPix} bitPix - The type of the array.
        @param {number} length - The length of the array.
        @return {ITypedArray} - Array of given length and type.
        
    */
    ArrayUtils.generateTypedArray = function (bitPix, length) {
        if (length == 0) {
            throw 'Length of created array cannot be 0';
        }
        switch (bitPix) {
            case Interfaces_1.BitPix.Byte:
                {
                    return new Uint8Array(length);
                }
            case Interfaces_1.BitPix.Short:
                {
                    return new Int16Array(length);
                }
            case Interfaces_1.BitPix.Integer:
                {
                    return new Int32Array(length);
                }
            case Interfaces_1.BitPix.Float:
                {
                    return new Float32Array(length);
                }
            case Interfaces_1.BitPix.Double:
                {
                    return new Float64Array(length);
                }
            default:
                throw 'Cannot create array of unknown type';
        }
    };
    // Plucks column elements from buffer and lays them down in continous space
    ArrayUtils.pluckColumn = function (source, target, rows, rowByteWidth, rowByteOffset, width, type, changeEndian) {
        var _a = [new Uint8Array(source), new Uint8Array(target)], sourceBytes = _a[0], targetBytes = _a[1];
        var bytesPerElement = Interfaces_1.BitPixUtils.getByteSize(type);
        if (changeEndian && bytesPerElement !== 1) {
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < width; j++) {
                    for (var k = 0; k < bytesPerElement; k++) {
                        targetBytes[i * width * bytesPerElement + j * bytesPerElement + k]
                            = sourceBytes[i * rowByteWidth + rowByteOffset + j * bytesPerElement + (bytesPerElement - (k + 1))];
                    }
                }
            }
        }
        else {
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < width; j++) {
                    for (var k = 0; k < bytesPerElement; k++) {
                        targetBytes[i * width * bytesPerElement + j * bytesPerElement + k]
                            = sourceBytes[i * rowByteWidth + rowByteOffset + j * bytesPerElement + k];
                    }
                }
            }
        }
    };
    ArrayUtils.chunk = function (buffer, dataType, chunkSize) {
        var chunkByteSize = Interfaces_1.BitPixUtils.getByteSize(dataType) * chunkSize;
        var chunksNumber = buffer.byteLength / chunkByteSize;
        var column = [];
        switch (dataType) {
            case Interfaces_1.BitPix.Byte:
                {
                    for (var i = 0; i < chunksNumber; i++) {
                        column.push(new Uint8Array(buffer, i * chunkByteSize, chunkSize));
                    }
                    return column;
                }
            case Interfaces_1.BitPix.Short:
                {
                    for (var i = 0; i < chunksNumber; i++) {
                        column.push(new Int16Array(buffer, i * chunkByteSize, chunkSize));
                    }
                    return column;
                }
            case Interfaces_1.BitPix.Integer:
                {
                    for (var i = 0; i < chunksNumber; i++) {
                        column.push(new Int32Array(buffer, i * chunkByteSize, chunkSize));
                    }
                    return column;
                }
            case Interfaces_1.BitPix.Float:
                {
                    for (var i = 0; i < chunksNumber; i++) {
                        column.push(new Float32Array(buffer, i * chunkByteSize, chunkSize));
                    }
                    return column;
                }
            case Interfaces_1.BitPix.Double:
                {
                    for (var i = 0; i < chunksNumber; i++) {
                        column.push(new Float64Array(buffer, i * chunkByteSize, chunkSize));
                    }
                    return column;
                }
            default:
                throw 'Cannot create array of unknown type';
        }
    };
    return ArrayUtils;
}());
exports.ArrayUtils = ArrayUtils;
//# sourceMappingURL=ArrayUtils.js.map