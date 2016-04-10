define(["require", "exports", "../Interfaces", "../utils/KeywordsManager", 'es6-promise'], function (require, exports, Interfaces_1, KeywordsManager_1, es6_promise_1) {
    "use strict";
    var SimpleDataReader = (function () {
        function SimpleDataReader() {
        }
        SimpleDataReader.prototype.canReadData = function (header) {
            return (KeywordsManager_1.KeywordsManager.hasValue(header, "SIMPLE", true) || KeywordsManager_1.KeywordsManager.hasValue(header, "XTENSION", "IMAGE"))
                && !KeywordsManager_1.KeywordsManager.hasValue(header, "GROUPS", true);
        };
        SimpleDataReader.prototype.readDataSize = function (header) {
            var elementType = KeywordsManager_1.KeywordsManager.getValue(header, "BITPIX", Interfaces_1.BitPix.Unknown);
            var elementTypeSize = Interfaces_1.BitPixUtils.getByteSize(elementType);
            if (KeywordsManager_1.KeywordsManager.hasValue(header, "NAXIS", 0)) {
                return 0;
            }
            var length = header.filter(function (k) { return k.key.indexOf('NAXIS') === 0 && k.key !== 'NAXIS'; }).reduce(function (prev, cur) { return prev * cur.value; }, 1);
            return Math.ceil(elementTypeSize * length / Interfaces_1.Constants.blockLength) * Interfaces_1.Constants.blockLength;
        };
        SimpleDataReader.prototype.readDataAsync = function (file, offsetBytes, header, changeEndian) {
            if (changeEndian === void 0) { changeEndian = true; }
            var dataType = KeywordsManager_1.KeywordsManager.getValue(header, "BITPIX", Interfaces_1.BitPix.Unknown);
            var naxisKeywords = header.filter(function (k) { return k.key.indexOf("NAXIS", 0) === 0 && k.key !== "NAXIS"; });
            var length = naxisKeywords.map(function (k) { return k.value; }).reduce(function (a, b) { return a * b; }, 1);
            var bscale = KeywordsManager_1.KeywordsManager.getValue(header, "BSCALE", 1);
            var bzero = KeywordsManager_1.KeywordsManager.getValue(header, "BZERO", 0);
            if (naxisKeywords.length > 0 && length !== 0) {
                var promise = file.getDataAsync(offsetBytes, length, dataType, changeEndian);
                if (bscale !== 1 || bzero !== 0) {
                    return promise.then(function (data) {
                        for (var i = 0; i < data.length; i++) {
                            data[i] = data[i] * bscale + bzero;
                        }
                        return data;
                    });
                }
                else {
                    return promise;
                }
            }
            else {
                var arr = null;
                return es6_promise_1.Promise.resolve(arr);
            }
        };
        return SimpleDataReader;
    }());
    exports.SimpleDataReader = SimpleDataReader;
});
//# sourceMappingURL=SimpleDataReader.js.map