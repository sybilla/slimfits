define(["require", "exports", '../utils/Header', '../utils/PromiseUtils', '../utils/ArrayUtils'], function (require, exports, Header_1, PromiseUtils_1, ArrayUtils_1) {
    "use strict";
    var MultipleRequestFile = (function () {
        function MultipleRequestFile(url) {
            this.url = url;
            this.size = 0;
        }
        MultipleRequestFile.parseHeaders = function (headerStr) {
            return !headerStr ? [] : headerStr.split('\u000d\u000a').filter(function (x) { return x !== '' || x.trim() !== ''; }).map(function (pair) {
                var index = pair.indexOf('\u003a\u0020');
                return index > 0 ? new Header_1.Header(pair.substring(0, index), pair.substring(index + 2)) : null;
            });
        };
        MultipleRequestFile.prototype.initialize = function () {
            var _this = this;
            return PromiseUtils_1.PromiseUtils.getRequestAsync(this.url, 'HEAD', 'text').then(function (xhr) {
                var headers = MultipleRequestFile.parseHeaders(xhr.getAllResponseHeaders());
                if (headers.some(function (h) { return (h.name == 'Accept-Ranges') && (h.value == 'bytes'); })) {
                    var s = headers.filter(function (h) { return h.name == 'Content-Length'; });
                    _this.size = parseInt(s[0].value);
                    return null;
                }
                else {
                    throw 'File does not support Ranges request keyword';
                }
            });
        };
        MultipleRequestFile.prototype.getByteLength = function () {
            return this.size;
        };
        MultipleRequestFile.prototype.getStringAsync = function (start, byteLength) {
            var headers = [new Header_1.AcceptRangeHeader(start, byteLength)];
            return PromiseUtils_1.PromiseUtils.getRequestAsync(this.url, 'GET', 'text', headers).then(function (xhr) {
                return xhr.responseText;
            });
        };
        MultipleRequestFile.prototype.getDataAsync = function (start, length, bitPix, changeEndian) {
            if (changeEndian === void 0) { changeEndian = true; }
            var typedArray = ArrayUtils_1.ArrayUtils.generateTypedArray(bitPix, length);
            var byteLength = typedArray.BYTES_PER_ELEMENT * length;
            var headers = [new Header_1.AcceptRangeHeader(start, byteLength)];
            return PromiseUtils_1.PromiseUtils.getRequestAsync(this.url, 'GET', 'arraybuffer', headers).then(function (xhr) {
                var source = xhr.response;
                ArrayUtils_1.ArrayUtils.copy(source, typedArray.buffer, 0, length, bitPix, changeEndian);
                return typedArray;
            });
        };
        return MultipleRequestFile;
    }());
    exports.MultipleRequestFile = MultipleRequestFile;
});
//# sourceMappingURL=MultipleRequestFile.js.map