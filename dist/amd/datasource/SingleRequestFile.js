define(["require", "exports", '../utils/PromiseUtils', '../utils/ArrayUtils', 'es6-promise'], function (require, exports, PromiseUtils_1, ArrayUtils_1, es6_promise_1) {
    "use strict";
    var SingleRequestFile = (function () {
        function SingleRequestFile(url) {
            this.url = url;
            this.data = null;
        }
        SingleRequestFile.prototype.initialize = function () {
            var _this = this;
            return PromiseUtils_1.PromiseUtils.getRequestAsync(this.url).then(function (xhr) {
                _this.data = xhr.response;
                return _this.data;
            });
        };
        SingleRequestFile.prototype.getByteLength = function () {
            return this.data != null ? this.data.byteLength : 0;
        };
        SingleRequestFile.prototype.getStringAsync = function (start, length) {
            return es6_promise_1.Promise.resolve(String.fromCharCode.apply(null, new Uint8Array(this.data, start, length)));
        };
        SingleRequestFile.prototype.getDataAsync = function (start, length, bitPix, changeEndian) {
            if (changeEndian === void 0) { changeEndian = true; }
            var typedArray = ArrayUtils_1.ArrayUtils.generateTypedArray(bitPix, length);
            ArrayUtils_1.ArrayUtils.copy(this.data, typedArray.buffer, start, length, bitPix, changeEndian);
            return es6_promise_1.Promise.resolve(typedArray);
        };
        return SingleRequestFile;
    }());
    exports.SingleRequestFile = SingleRequestFile;
});
//# sourceMappingURL=SingleRequestFile.js.map