import { Header } from './Header';
import { Promise } from 'es6-promise';
export declare class PromiseUtils {
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
    static getRequestAsync(url: string, method?: string, responseType?: string, headers?: Header[]): Promise<XMLHttpRequest>;
    /**
        Promise chain that keeps executing action function until predicate in condition function is satisfied.
        @static
        @public
        @param {Function} condition - funtion returning boolean.
        @param {Function} action - action function.
    */
    static promiseWhile(condition: () => boolean, action: () => void): Promise<any>;
}
