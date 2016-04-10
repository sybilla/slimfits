import { Header, AcceptRangeHeader } from '../utils/Header';
import { PromiseUtils } from '../utils/PromiseUtils';
import { ArrayUtils } from '../utils/ArrayUtils';
export class MultipleRequestFile {
    constructor(url) {
        this.url = url;
        this.size = 0;
    }
    static parseHeaders(headerStr) {
        return !headerStr ? [] : headerStr.split('\u000d\u000a').filter(x => x !== '' || x.trim() !== '').map(pair => {
            let index = pair.indexOf('\u003a\u0020');
            return index > 0 ? new Header(pair.substring(0, index), pair.substring(index + 2)) : null;
        });
    }
    initialize() {
        return PromiseUtils.getRequestAsync(this.url, 'HEAD', 'text').then(xhr => {
            let headers = MultipleRequestFile.parseHeaders(xhr.getAllResponseHeaders());
            if (headers.some(h => (h.name == 'Accept-Ranges') && (h.value == 'bytes'))) {
                let s = headers.filter(h => h.name == 'Content-Length');
                this.size = parseInt(s[0].value);
                return null;
            }
            else {
                throw 'File does not support Ranges request keyword';
            }
        });
    }
    getByteLength() {
        return this.size;
    }
    getStringAsync(start, byteLength) {
        let headers = [new AcceptRangeHeader(start, byteLength)];
        return PromiseUtils.getRequestAsync(this.url, 'GET', 'text', headers).then(xhr => {
            return xhr.responseText;
        });
    }
    getDataAsync(start, length, bitPix, changeEndian = true) {
        let typedArray = ArrayUtils.generateTypedArray(bitPix, length);
        let byteLength = typedArray.BYTES_PER_ELEMENT * length;
        let headers = [new AcceptRangeHeader(start, byteLength)];
        return PromiseUtils.getRequestAsync(this.url, 'GET', 'arraybuffer', headers).then(xhr => {
            let source = xhr.response;
            ArrayUtils.copy(source, typedArray.buffer, 0, length, bitPix, changeEndian);
            return typedArray;
        });
    }
}
//# sourceMappingURL=MultipleRequestFile.js.map