import {TypedArray, IDataSource, BitPix} from '../Interfaces';
import {PromiseUtils} from '../utils/PromiseUtils';
import {ArrayUtils} from '../utils/ArrayUtils';

export class SingleRequestFile implements IDataSource {
    private data: ArrayBuffer;
    constructor(public url: string) { }

    initialize(): Promise<boolean> {
        return PromiseUtils.getRequestAsync(this.url).then(xhr => {
            this.data = xhr.response;
            return (this.getByteLength() % 2880 === 0);
        });
    }

    public getByteLength() {
        const byteLength = this.data.byteLength;
        return this.data != null ? this.data.byteLength : 0;
    }

    public getStringAsync(start: number, length: number) {
        return Promise.resolve(String.fromCharCode.apply(null, new Uint8Array(this.data, start, length)));
    }

    public getDataAsync(start: number, length: number, bitPix: BitPix, changeEndian = true)  {
        const typedArray = ArrayUtils.generateTypedArray(bitPix, length);
        ArrayUtils.copy(this.data, typedArray.buffer, start, length, bitPix, changeEndian);
        return Promise.resolve(typedArray);
    }
}
