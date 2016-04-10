import { PromiseUtils } from '../utils/PromiseUtils';
import { ArrayUtils } from '../utils/ArrayUtils';
import { Promise } from 'es6-promise';
export class SingleRequestFile {
    constructor(url) {
        this.url = url;
        this.data = null;
    }
    initialize() {
        return PromiseUtils.getRequestAsync(this.url).then(xhr => {
            this.data = xhr.response;
            return this.data;
        });
    }
    getByteLength() {
        return this.data != null ? this.data.byteLength : 0;
    }
    getStringAsync(start, length) {
        return Promise.resolve(String.fromCharCode.apply(null, new Uint8Array(this.data, start, length)));
    }
    getDataAsync(start, length, bitPix, changeEndian = true) {
        var typedArray = ArrayUtils.generateTypedArray(bitPix, length);
        ArrayUtils.copy(this.data, typedArray.buffer, start, length, bitPix, changeEndian);
        return Promise.resolve(typedArray);
    }
}
//# sourceMappingURL=SingleRequestFile.js.map