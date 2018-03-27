import {Header, AcceptRangeHeader} from '../utils/Header';
import {PromiseUtils} from '../utils/PromiseUtils';
import {ArrayUtils} from '../utils/ArrayUtils';
import {TypedArray, IDataSource, BitPix} from '../interfaces';

export class MultipleRequestFile implements IDataSource {
    private static parseHeaders(headerStr: string) {
        return !headerStr ? [] : headerStr.split('\u000d\u000a').filter(x => x !== '' || x.trim() !== '').map(pair => {
            const index = pair.indexOf('\u003a\u0020');
            if (index > 0) {
                return new Header(pair.substring(0, index), pair.substring(index + 2));
            }

            throw new Error('keyword not found');
        });
    }

    private size: number = 0;

    constructor(public url: string) {

    }

    initialize() {
        return PromiseUtils.getRequestAsync(this.url, 'HEAD', 'text').then(xhr => {
            const headers = MultipleRequestFile.parseHeaders(xhr.getAllResponseHeaders());
            if (headers.some(h => (h.name === 'Accept-Ranges') && (h.value === 'bytes'))) {
                const s = headers.filter(h => h.name === 'Content-Length');
                this.size = parseInt(s[0].value, 10);
                return this.getStringAsync(0, 6);
            } else {
                throw new Error('File does not support Ranges request keyword');
            }
        }).then(
            value => (value === 'SIMPLE') && (this.getByteLength() % 2880 === 0)
        );
    }

    public getByteLength() {
        return this.size;
    }

    public getStringAsync(start: number, byteLength: number) {
        const headers = [new AcceptRangeHeader(start, byteLength)];

        return PromiseUtils.getRequestAsync(this.url, 'GET', 'text', headers)
                           .then(xhr => xhr.responseText);
    }

    public getDataAsync(start: number, length: number, bitPix: BitPix, changeEndian = true) {
        const typedArray = ArrayUtils.generateTypedArray(bitPix, length);
        const byteLength = typedArray.BYTES_PER_ELEMENT * length;
        const headers = [new AcceptRangeHeader(start, byteLength)];

        return PromiseUtils.getRequestAsync(this.url, 'GET', 'arraybuffer', headers).then(xhr => {
            const source = xhr.response;
            ArrayUtils.copy(source, typedArray.buffer, 0, length, bitPix, changeEndian);
            return typedArray;
        });
    }
}
