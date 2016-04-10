define(["require", "exports", "../Interfaces", "../utils/KeywordsManager", "../utils/ArrayUtils"], function (require, exports, Interfaces_1, KeywordsManager_1, ArrayUtils_1) {
    "use strict";
    var BinaryTableDataReader = (function () {
        function BinaryTableDataReader() {
        }
        BinaryTableDataReader.prototype.canReadData = function (header) {
            return KeywordsManager_1.KeywordsManager.hasValueFromList(header, "XTENSION", ["BINTABLE", "A3DTABLE"]) &&
                !KeywordsManager_1.KeywordsManager.hasValue(header, "ZIMAGE", true);
        };
        BinaryTableDataReader.prototype.readDataSize = function (header) {
            var rowsCount = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS2", 1);
            var rowByteLength = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS1", 1);
            return Math.ceil(rowByteLength * rowsCount / Interfaces_1.Constants.blockLength) * Interfaces_1.Constants.blockLength;
        };
        BinaryTableDataReader.prototype.readColumn = function (source, rows, rowByteWidth, rowByteOffset, width, format) {
            if (width == 0) {
                return [];
            }
            var dataType = format == "A" ? Interfaces_1.BitPix.Byte : Interfaces_1.BitPixUtils.getBitPixForLetter(format);
            var buffer = new ArrayBuffer(Interfaces_1.BitPixUtils.getByteSize(dataType) * rows * width);
            ArrayUtils_1.ArrayUtils.pluckColumn(source, buffer, rows, rowByteWidth, rowByteOffset, width, dataType, true);
            var chunks = ArrayUtils_1.ArrayUtils.chunk(buffer, dataType, width);
            return format == "A" ? chunks.map(function (x) { return String.fromCharCode.apply(null, x); }) : chunks;
        };
        BinaryTableDataReader.prototype.readDataAsync = function (file, offsetBytes, header) {
            var _this = this;
            var rowsCount = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS2", 0);
            var rowByteLength = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS1", 0);
            var rowByteOffset = 0;
            var isValidTFORM = new RegExp("\\d+\\w");
            var converters = header.filter(function (k) { return k.key.indexOf("TFORM") === 0 && isValidTFORM.test(k.value); }).map(function (k) {
                var format = k.value.substr(k.value.length - 1, 1);
                var count = parseInt(k.value.substr(0, k.value.length - 1));
                var byteOffset = rowByteOffset;
                var dataType = format == "A" ? Interfaces_1.BitPix.Byte : Interfaces_1.BitPixUtils.getBitPixForLetter(format);
                rowByteOffset += count * Interfaces_1.BitPixUtils.getByteSize(dataType);
                return { format: format, count: count, byteOffset: byteOffset };
            });
            return file.getDataAsync(offsetBytes, rowsCount * rowByteLength, Interfaces_1.BitPix.Byte).then(function (data) {
                return converters.map(function (conv) {
                    return _this.readColumn(data.buffer, rowsCount, rowByteLength, conv.byteOffset, conv.count, conv.format);
                });
            });
        };
        return BinaryTableDataReader;
    }());
    exports.BinaryTableDataReader = BinaryTableDataReader;
});
//# sourceMappingURL=BinaryTableDataReader.js.map