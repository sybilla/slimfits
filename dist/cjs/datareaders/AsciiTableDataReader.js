"use strict";
var Interfaces_1 = require("../Interfaces");
var KeywordsManager_1 = require("../utils/KeywordsManager");
var AsciiConverter_1 = require("../utils/AsciiConverter");
var AsciiTableDataReader = (function () {
    function AsciiTableDataReader() {
    }
    AsciiTableDataReader.prototype.canReadData = function (header) {
        return KeywordsManager_1.KeywordsManager.hasValue(header, "XTENSION", "TABLE");
    };
    AsciiTableDataReader.prototype.readDataSize = function (header) {
        var rowsCount = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS2", 1);
        var rowLength = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS1", 1);
        return Math.ceil(rowLength * rowsCount / Interfaces_1.Constants.blockLength) * Interfaces_1.Constants.blockLength;
    };
    AsciiTableDataReader.prototype.readDataAsync = function (file, offsetBytes, header) {
        var rowsCount = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS2", 1);
        var rowLength = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS1", 1);
        var fieldsCount = KeywordsManager_1.KeywordsManager.getValue(header, "TFIELDS", 0);
        var tforms = header.filter(function (k) { return k.key.indexOf('TFORM') === 0; }).map(function (k) { return AsciiConverter_1.AsciiConverter.getConverterFor(k.value, rowsCount); });
        var asciiconverters = tforms.map(function (x) { return x.converter; });
        var resultList = tforms.map(function (x) { return x.array; });
        var positions = header.filter(function (k) { return k.key.indexOf('TBCOL') === 0; })
            .map(function (k) { return k.value - 1; }).concat([rowLength]);
        if ((positions.length + 1) !== fieldsCount) {
            throw "There are " + positions.length + " 'TBCOL#' keywords whereas 'TFIELDS' specifies " + fieldsCount;
        }
        return file.getStringAsync(offsetBytes, rowLength * rowsCount).then(function (data) {
            for (var rowIdx = 0; rowIdx < rowsCount; rowIdx++) {
                var line = data.substr(rowIdx * rowLength, rowLength);
                for (var posIdx = 0; posIdx < fieldsCount; posIdx++) {
                    var chunk = line.substr(positions[posIdx], positions[posIdx + 1] - positions[posIdx]);
                    resultList[posIdx][rowIdx] = asciiconverters[posIdx](chunk.trim());
                }
            }
            return resultList;
        });
    };
    return AsciiTableDataReader;
}());
exports.AsciiTableDataReader = AsciiTableDataReader;
//# sourceMappingURL=AsciiTableDataReader.js.map