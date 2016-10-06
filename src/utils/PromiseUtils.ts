import {Header} from './Header';
import {Promise} from 'es6-promise';

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
    public static getRequestAsync(url: string, method: string = 'GET', responseType: string = 'arraybuffer',
        headers: Header[] = []): Promise<XMLHttpRequest> {
        return new Promise<XMLHttpRequest>((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.responseType = responseType;

            headers.forEach((h) => {
                xhr.setRequestHeader(h.name, h.value);
            });

            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr);
                } else {
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
    public static promiseWhile(condition: () => boolean, action: () => void): Promise<any> {
        return new Promise((resolve, reject) => {
            let loop = function (): any {
                if (!condition()) {
                    resolve(undefined);
                } else {
                    return new Promise<any>(function (resolve, reject) {
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