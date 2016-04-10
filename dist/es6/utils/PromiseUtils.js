import { Promise } from 'es6-promise';
export class PromiseUtils {
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
    static getRequestAsync(url, method = 'GET', responseType = 'arraybuffer', headers = []) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.responseType = responseType;
            headers.forEach((h) => {
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
    }
    /**
        Promise chain that keeps executing action function until predicate in condition function is satisfied.
        @static
        @public
        @param {Function} condition - funtion returning boolean.
        @param {Function} action - action function.
    */
    static promiseWhile(condition, action) {
        return new Promise((resolve, reject) => {
            let loop = function () {
                if (!condition()) {
                    resolve(undefined);
                }
                else {
                    return new Promise(function (resolve, reject) {
                        try {
                            resolve(action());
                        }
                        catch (err) {
                            reject(err);
                        }
                    }).then(loop).catch(err => reject(err));
                }
                return null;
            };
            setTimeout(loop, 30); // some delay starting
        });
    }
}
//# sourceMappingURL=PromiseUtils.js.map