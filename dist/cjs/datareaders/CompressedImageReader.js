"use strict";
var Interfaces_1 = require("../Interfaces");
var KeywordsManager_1 = require("../utils/KeywordsManager");
var Rice_1 = require("../utils/Rice");
var es6_promise_1 = require('es6-promise');
var CompressedImageReader = (function () {
    function CompressedImageReader() {
    }
    CompressedImageReader.prototype.canReadData = function (header) {
        return KeywordsManager_1.KeywordsManager.hasValueFromList(header, "XTENSION", ["BINTABLE", "A3DTABLE"]) &&
            KeywordsManager_1.KeywordsManager.hasValue(header, "ZIMAGE", true);
    };
    CompressedImageReader.prototype.readDataSize = function (header) {
        var pCountLength = KeywordsManager_1.KeywordsManager.getValue(header, "PCOUNT", 0);
        var rowsCount = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS2", 0);
        var pointerWidth = Interfaces_1.BitPixUtils.getByteSize(Interfaces_1.BitPix.Integer);
        var pointerTableByteLength = 2 * rowsCount * pointerWidth;
        return Math.ceil((pCountLength + pointerTableByteLength) / Interfaces_1.Constants.blockLength) * Interfaces_1.Constants.blockLength;
    };
    CompressedImageReader.convertToTiles = function (pointers, compressedData) {
        var tiles = [];
        var rowsCount = pointers.length / 2;
        for (var i = 0; i < rowsCount; i++) {
            tiles.push(new Uint8Array(compressedData.buffer, pointers[2 * i + 1], pointers[2 * i]));
        }
        return tiles;
    };
    CompressedImageReader.riceExtract = function (compressedTile, blockSize, bytePix) {
        return compressedTile;
    };
    CompressedImageReader.prototype.readDataAsync = function (file, offsetBytes, header) {
        var rowsCount = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS2", 0);
        var rowLength = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS1", 0);
        var fieldsCount = KeywordsManager_1.KeywordsManager.getValue(header, "TFIELDS", 0);
        var rowElementsCount = 0;
        var regex = new RegExp("\\d{0,}\\D");
        var arrayTFORM = new RegExp("([01]{0,1})([PQ])([ABIJKED])\\((\\d+)\\)");
        var heapOffset = KeywordsManager_1.KeywordsManager.getValue(header, "THEAP", 0);
        var heapSize = KeywordsManager_1.KeywordsManager.getValue(header, "PCOUNT", 0);
        var gCountLength = KeywordsManager_1.KeywordsManager.getValue(header, "GCOUNT", 0);
        var compressionType = KeywordsManager_1.KeywordsManager.getValue(header, "ZCMPTYPE", "");
        var containsVariableArray = header.filter(function (k) { return k.key.indexOf("TFORM") == 0; }).some(function (kv) { return arrayTFORM.test(kv.value); });
        if (containsVariableArray) {
            var imageInfo = header.filter(function (k) { return (k.key.indexOf("TFORM") == 0) && arrayTFORM.test(k.value); })[0];
            var result = arrayTFORM.exec(imageInfo.value);
            var pointerFormat = result[2];
            var elementFormat = result[3];
            var count = parseInt(result[4]);
            if (pointerFormat !== "P") {
                throw "Pointer format other than Int32 unsupported";
            }
            if (elementFormat !== "B") {
                throw "Element format other than Byte currently unsupported";
            }
            if (compressionType !== "RICE_1") {
                throw "Decompression other than Rice is not currently supported";
            }
            var ztiles = header.filter(function (k) { return k.key.indexOf("ZTILE") == 0 && (k.key !== "ZTILE"); });
            var tileLinearSize = ztiles.reduce(function (x, y) { return x * y.value; }, 1);
            var riceBlockSize = KeywordsManager_1.KeywordsManager.getValue(header, "ZVAL1", 32);
            var riceByteWidth = KeywordsManager_1.KeywordsManager.getValue(header, "ZVAL2", 4);
            var bitpix = KeywordsManager_1.KeywordsManager.getValue(header, "ZBITPIX", Interfaces_1.BitPix.Unknown);
            var pointerWidth = Interfaces_1.BitPixUtils.getByteSize(Interfaces_1.BitPix.Integer);
            var pointerTableLength = 2 * rowsCount;
            var pointerTableByteLength = pointerTableLength * pointerWidth;
            var promises = [
                file.getDataAsync(offsetBytes, pointerTableLength, Interfaces_1.BitPix.Integer),
                file.getDataAsync(offsetBytes + pointerTableByteLength, heapSize, Interfaces_1.BitPix.Byte)
            ];
            return es6_promise_1.Promise.all(promises).then(function (results) {
                var tiles = CompressedImageReader.convertToTiles(results[0], results[1]);
                var uncompressed = [];
                var tileByteSize = riceBlockSize / 8 * tileLinearSize;
                var uncompressedBuffer = new ArrayBuffer(tileByteSize * tiles.length); // so tiles occupy one place in memory
                var bscale = KeywordsManager_1.KeywordsManager.getValue(header, "BSCALE", 1);
                var bzero = KeywordsManager_1.KeywordsManager.getValue(header, "BZERO", 0);
                if (riceByteWidth == Interfaces_1.BitPixUtils.getByteSize(Interfaces_1.BitPix.Integer)) {
                    uncompressed = tiles.map(function (tile, index) {
                        var out = new Int32Array(uncompressedBuffer, index * tileByteSize, tileLinearSize);
                        Rice_1.Rice.fits_rdecomp(tile, out, riceBlockSize);
                        var i = tile.length;
                        while (i--) {
                            out[i] = bscale * out[i] + bzero;
                        }
                        return out;
                    });
                }
                else if (riceByteWidth == Interfaces_1.BitPixUtils.getByteSize(Interfaces_1.BitPix.Short)) {
                    uncompressed = tiles.map(function (tile, index) {
                        var out = new Int16Array(uncompressedBuffer, index * tileByteSize, tileLinearSize);
                        Rice_1.Rice.fits_rdecomp_short(tile, out, riceBlockSize);
                        var i = tile.length;
                        while (i--) {
                            out[i] = bscale * out[i] + bzero;
                        }
                        return out;
                    });
                }
                else if (riceByteWidth == Interfaces_1.BitPixUtils.getByteSize(Interfaces_1.BitPix.Byte)) {
                    uncompressed = tiles.map(function (tile, index) {
                        var out = new Uint8Array(uncompressedBuffer, index * tileByteSize, tileLinearSize);
                        Rice_1.Rice.fits_rdecomp_byte(tile, out, riceBlockSize);
                        var i = tile.length;
                        while (i--) {
                            out[i] = bscale * out[i] + bzero;
                        }
                        return out;
                    });
                }
                return uncompressed;
            });
        }
        else {
            throw "Compressed image should have one variable column.";
        }
    };
    return CompressedImageReader;
}());
exports.CompressedImageReader = CompressedImageReader;
//# sourceMappingURL=CompressedImageReader.js.map