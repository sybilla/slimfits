define(["require", "exports", 'es6-promise'], function (require, exports, es6_promise_1) {
    "use strict";
    var PromiseUtils = (function () {
        function PromiseUtils() {
        }
        /**
            Promise wrapper for XMLHttpRequest.
            @static
            @public
            @param {string} url - Url of resource to request.
            @param {string} method - HTTP verb used to request resource.
            @param {string} responseType - Expected response type most of the time either "arraybuffer" or "text".
            @param {Header[]} headers - Headers for the request.
            @return {Promise<XMLHttpRequest>} - promise with the response.
        */
        PromiseUtils.getRequestAsync = function (url, method, responseType, headers) {
            if (method === void 0) { method = 'GET'; }
            if (responseType === void 0) { responseType = 'arraybuffer'; }
            if (headers === void 0) { headers = []; }
            return new es6_promise_1.Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open(method, url);
                xhr.responseType = responseType;
                headers.forEach(function (h) {
                    xhr.setRequestHeader(h.name, h.value);
                });
                xhr.onload = function () {
                    if (this.status >= 200 && this.status < 300) {
                        resolve(xhr);
                    }
                    else {
                        reject({
                            status: this.status,
                            statusText: xhr.statusText
                        });
                    }
                };
                xhr.onerror = function () {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                };
                xhr.send();
            });
        };
        /**
            Promise chain that keeps executing action function until predicate in condition function is satisfied.
            @static
            @public
            @param {Function} condition - funtion returning boolean.
            @param {Function} action - action function.
        */
        PromiseUtils.promiseWhile = function (condition, action) {
            return new es6_promise_1.Promise(function (resolve, reject) {
                var loop = function () {
                    if (!condition()) {
                        resolve(undefined);
                    }
                    else {
                        return new es6_promise_1.Promise(function (resolve, reject) {
                            try {
                                resolve(action());
                            }
                            catch (err) {
                                reject(err);
                            }
                        }).then(loop).catch(function (err) { return reject(err); });
                    }
                    return null;
                };
                setTimeout(loop, 30); // some delay starting
            });
        };
        return PromiseUtils;
    }());
    exports.PromiseUtils = PromiseUtils;
});
//# sourceMappingURL=PromiseUtils.js.map