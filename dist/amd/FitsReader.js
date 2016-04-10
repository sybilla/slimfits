define(["require", "exports", './Interfaces', './utils/KeywordsManager', './utils/PromiseUtils', './RegisteredDataReaders'], function (require, exports, Interfaces_1, KeywordsManager_1, PromiseUtils_1, RegisteredDataReaders_1) {
    "use strict";
    var FitsReader = (function () {
        function FitsReader() {
        }
        FitsReader.readFitsAsync = function (file) {
            var hdus = [];
            var offsetBytes = 0;
            return PromiseUtils_1.PromiseUtils.promiseWhile(function () { return offsetBytes < file.getByteLength(); }, function () {
                return FitsReader.readHduAsync(file, offsetBytes).then(function (hdu) {
                    hdus.push(hdu);
                    offsetBytes += hdu.bytesRead;
                });
            }).then(function () { return hdus; });
        };
        FitsReader.readHeaderAsync = function (file, offsetBytes) {
            var endLineFound = false;
            var keywords = [];
            var bytesRead = 0;
            return PromiseUtils_1.PromiseUtils.promiseWhile(function () { return !endLineFound; }, function () {
                return file.getStringAsync(offsetBytes + bytesRead, Interfaces_1.Constants.blockLength)
                    .then(function (block) {
                    bytesRead += Interfaces_1.Constants.blockLength;
                    for (var j = 0; j < Interfaces_1.Constants.maxKeywordsInBlock; j++) {
                        var line = block.substring(j * Interfaces_1.Constants.lineLength, (j + 1) * Interfaces_1.Constants.lineLength);
                        endLineFound = KeywordsManager_1.Keyword.isLastLine(line);
                        if (endLineFound) {
                            break;
                        }
                        keywords.push(KeywordsManager_1.KeywordsManager.parseKeyword(line));
                    }
                    return null;
                });
            }).then(function () {
                return {
                    header: keywords,
                    bytesRead: bytesRead
                };
            });
        };
        FitsReader.readHduAsync = function (file, offsetBytes) {
            var hdu = {
                header: null,
                data: null,
                bytesRead: 0
            };
            return FitsReader.readHeaderAsync(file, offsetBytes).then(function (headerResult) {
                var naxis = KeywordsManager_1.KeywordsManager.getValue(headerResult.header, 'NAXIS', 0);
                hdu.header = headerResult.header;
                hdu.bytesRead += headerResult.bytesRead;
                if (naxis !== 0) {
                    return FitsReader.readDataAsync(file, offsetBytes + headerResult.bytesRead, headerResult.header);
                }
                else {
                    return null;
                }
            }).then(function (data) {
                hdu.data = data;
                hdu.bytesRead += FitsReader.readDataSize(hdu.header);
                return hdu;
            });
        };
        FitsReader.readDataAsync = function (file, offsetBytes, header) {
            var readers = RegisteredDataReaders_1.RegisteredDataReaders.filter(function (reader) { return reader.canReadData(header); });
            if (readers.length !== 1) {
                console.error('SlimFits was unable to read this file.');
            }
            else {
                return readers[0].readDataAsync(file, offsetBytes, header);
            }
        };
        FitsReader.readDataSize = function (header) {
            var readers = RegisteredDataReaders_1.RegisteredDataReaders.filter(function (reader) { return reader.canReadData(header); });
            if (readers.length !== 1) {
                console.error('SlimFits was unable to read this file.');
            }
            else {
                return readers[0].readDataSize(header);
            }
        };
        return FitsReader;
    }());
    exports.FitsReader = FitsReader;
});
//# sourceMappingURL=FitsReader.js.map