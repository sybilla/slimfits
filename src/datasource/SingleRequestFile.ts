import {ITypedArray, IDataSource, BitPix} from '../Interfaces';
import {PromiseUtils} from '../utils/PromiseUtils';
import {ArrayUtils} from '../utils/ArrayUtils';
import {Promise} from 'es6-promise';

export class SingleRequestFile implements IDataSource {
    private data: ArrayBuffer = null;
    constructor(public url: string) { }

    initialize(): Promise<any> {
        return PromiseUtils.getRequestAsync(this.url).then(xhr => {
            this.data = xhr.response;
            return this.data;
        });
    }

    public getByteLength() {
        return this.data != null ? this.data.byteLength : 0;
    }

    public getStringAsync(start: number, length: number): Promise<string> {
        return Promise.resolve(String.fromCharCode.apply(null, new Uint8Array(this.data, start, length)));
    }

    public getDataAsync(start: number, length: number, bitPix: BitPix, changeEndian: boolean = true): Promise<ITypedArray> {
        var typedArray: ITypedArray = ArrayUtils.generateTypedArray(bitPix, length);
        ArrayUtils.copy(this.data, typedArray.buffer, start, length, bitPix, changeEndian);
        return Promise.resolve(typedArray);
    }
}