define(["require", "exports", "../Interfaces", "../utils/KeywordsManager", "../utils/ArrayUtils"], function (require, exports, Interfaces_1, KeywordsManager_1, ArrayUtils_1) {
    "use strict";
    var RandomGroupsDataReader = (function () {
        function RandomGroupsDataReader() {
        }
        RandomGroupsDataReader.prototype.canReadData = function (header) {
            return KeywordsManager_1.KeywordsManager.hasValue(header, "GROUPS", true) && KeywordsManager_1.KeywordsManager.hasValue(header, "NAXIS1", 0);
        };
        RandomGroupsDataReader.prototype.readDataSize = function (header) {
            var elementType = KeywordsManager_1.KeywordsManager.getValue(header, "BITPIX", Interfaces_1.BitPix.Unknown);
            var groupLength = header.filter(function (k) { return k.key.indexOf('NAXIS') === 0 && k.key !== 'NAXIS' && k.key !== 'NAXIS1' && k.value !== 1; })
                .reduce(function (prev, cur) { return prev * cur.value; }, 1);
            var groupsCount = KeywordsManager_1.KeywordsManager.getValue(header, "GCOUNT", 0);
            var paramsLength = KeywordsManager_1.KeywordsManager.getValue(header, "PCOUNT", 0);
            var elementTypeSize = Interfaces_1.BitPixUtils.getByteSize(elementType);
            return Math.ceil(groupsCount * (paramsLength + groupLength) * elementTypeSize / Interfaces_1.Constants.blockLength) * Interfaces_1.Constants.blockLength;
        };
        RandomGroupsDataReader.prototype.readDataAsync = function (file, offsetBytes, header, changeEndian) {
            if (changeEndian === void 0) { changeEndian = true; }
            var elementType = KeywordsManager_1.KeywordsManager.getValue(header, "BITPIX", Interfaces_1.BitPix.Unknown);
            var elementTypeSize = Interfaces_1.BitPixUtils.getByteSize(elementType);
            var groupsCount = KeywordsManager_1.KeywordsManager.getValue(header, "GCOUNT", 0);
            var paramsLength = KeywordsManager_1.KeywordsManager.getValue(header, "PCOUNT", 0);
            var groupLength = header.filter(function (k) { return k.key.indexOf('NAXIS') === 0 && k.key !== 'NAXIS' && k.key !== 'NAXIS1' && k.value !== 1; })
                .reduce(function (prev, cur) { return prev * cur.value; }, 1);
            var paramsAndGroupLength = paramsLength + groupLength;
            var paramsByteLength = paramsLength * elementTypeSize;
            return file.getDataAsync(offsetBytes, paramsAndGroupLength * groupsCount, elementType, changeEndian).then(function (x) {
                var params = ArrayUtils_1.ArrayUtils.generateTypedArray(elementType, groupsCount * paramsLength);
                var data = ArrayUtils_1.ArrayUtils.generateTypedArray(elementType, groupsCount * groupLength);
                ArrayUtils_1.ArrayUtils.pluckColumn(x.buffer, params.buffer, groupsCount, paramsAndGroupLength * elementTypeSize, 0, paramsLength, elementType, false);
                ArrayUtils_1.ArrayUtils.pluckColumn(x.buffer, data.buffer, groupsCount, paramsAndGroupLength * elementTypeSize, paramsByteLength, groupLength, elementType, false);
                return { params: ArrayUtils_1.ArrayUtils.chunk(params.buffer, elementType, paramsLength), data: ArrayUtils_1.ArrayUtils.chunk(data.buffer, elementType, groupLength) };
            });
        };
        return RandomGroupsDataReader;
    }());
    exports.RandomGroupsDataReader = RandomGroupsDataReader;
});
//# sourceMappingURL=RandomGroupsDataReader.js.map