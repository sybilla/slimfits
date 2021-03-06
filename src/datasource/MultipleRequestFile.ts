import {Header, AcceptRangeHeader} from '../utils/Header';
import {PromiseUtils} from '../utils/PromiseUtils';
import {ArrayUtils} from '../utils/ArrayUtils';
import {ITypedArray, IDataSource, BitPix} from '../Interfaces';
import {Promise} from 'es6-promise';

export class MultipleRequestFile implements IDataSource {

    private size: number = 0;
    
    constructor(public url: string) { }

    private static parseHeaders(headerStr: string) {
        return !headerStr ? [] : headerStr.split('\u000d\u000a').filter(x => x !== '' || x.trim() !== '').map(pair => {
            let index = pair.indexOf('\u003a\u0020');
            return index > 0 ? new Header(pair.substring(0, index), pair.substring(index + 2)) : null;
        });
    }

    initialize() : Promise<boolean> {
        return PromiseUtils.getRequestAsync(this.url, 'HEAD', 'text').then(xhr => {
            let headers = MultipleRequestFile.parseHeaders(xhr.getAllResponseHeaders());
            if (headers.some(h => (h.name == 'Accept-Ranges') && (h.value == 'bytes'))) {
                let s = headers.filter(h => h.name == 'Content-Length')
                this.size = parseInt(s[0].value);
                return this.getStringAsync(0,6);
            } else {
                throw 'File does not support Ranges request keyword';
            }
        }).then(
            value => (value == "SIMPLE") && (this.getByteLength() % 2880 == 0)
        );
    }

    public getByteLength() {
        return this.size;
    }

    public getStringAsync(start: number, byteLength: number): Promise<string> {
        let headers = [new AcceptRangeHeader(start, byteLength)];

        return PromiseUtils.getRequestAsync(this.url, 'GET', 'text', headers)
                           .then(xhr => xhr.responseText);
    }

    public getDataAsync(start: number, length: number, bitPix: BitPix, changeEndian: boolean = true): Promise<ITypedArray> {
        let typedArray = ArrayUtils.generateTypedArray(bitPix, length);
        let byteLength = typedArray.BYTES_PER_ELEMENT * length;
        let headers = [new AcceptRangeHeader(start, byteLength)];

        return PromiseUtils.getRequestAsync(this.url, 'GET', 'arraybuffer', headers).then(xhr => {
            let source = xhr.response;
            ArrayUtils.copy(source, typedArray.buffer, 0, length, bitPix, changeEndian);
            return typedArray;
        })
    }
}