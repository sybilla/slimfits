define(["require", "exports", "../Interfaces", "../utils/ArrayUtils", 'es6-promise'], function (require, exports, Interfaces_1, ArrayUtils_1, es6_promise_1) {
    "use strict";
    var BlobFile = (function () {
        function BlobFile(file) {
            this.file = file;
            this.url = "";
            this.url = file.name;
        }
        BlobFile.prototype.initialize = function () {
            return es6_promise_1.Promise.resolve(true);
        };
        BlobFile.prototype.getByteLength = function () {
            return this.file.size;
        };
        BlobFile.prototype.getStringAsync = function (start, length) {
            var _this = this;
            return new es6_promise_1.Promise(function (resolve, reject) {
                var blob = _this.file.slice(start, start + length);
                var reader = new FileReader();
                reader.onloadend = function (evt) {
                    var target = evt.target;
                    if (target.readyState == target.DONE) {
                        resolve(target.result);
                    }
                    else {
                        reject(target.error);
                    }
                };
                reader.readAsText(blob);
            });
        };
        BlobFile.prototype.getDataAsync = function (start, length, bitPix, changeEndian) {
            var _this = this;
            if (changeEndian === void 0) { changeEndian = true; }
            return new es6_promise_1.Promise(function (resolve, reject) {
                var blob = _this.file.slice(start, start + length * Interfaces_1.BitPixUtils.getByteSize(bitPix));
                var reader = new FileReader();
                reader.onloadend = function (evt) {
                    var target = evt.target;
                    if (target.readyState == target.DONE) {
                        var typedArray = ArrayUtils_1.ArrayUtils.generateTypedArray(bitPix, length);
                        ArrayUtils_1.ArrayUtils.copy(target.result, typedArray.buffer, start, length, bitPix, changeEndian);
                        resolve(typedArray);
                    }
                    else {
                        reject(target.error);
                    }
                };
                reader.readAsArrayBuffer(blob);
            });
        };
        return BlobFile;
    }());
    exports.BlobFile = BlobFile;
});
//# sourceMappingURL=BlobFile.js.map