import {TypedArray, IDataSource, BitPix} from '../interfaces';
import {ArrayUtils} from '../utils/ArrayUtils';

export class ArrayBufferFile implements IDataSource {
    constructor(private data: ArrayBufferLike) {

    }

    initialize() {
        return this.getStringAsync(0, 6).then(value => {
            return (value === 'SIMPLE') && (this.getByteLength() % 2880 === 0);
        });
    }

    public getByteLength() {
        return this.data != null ? this.data.byteLength : 0;
    }

    public getStringAsync(start: number, length: number) {
        return Promise.resolve(String.fromCharCode.apply(null, new Uint8Array(this.data, start, length)));
    }

    public getDataAsync(start: number, length: number, bitPix: BitPix, changeEndian = true) {
        const typedArray = ArrayUtils.generateTypedArray(bitPix, length);
        ArrayUtils.copy(this.data, typedArray.buffer, start, length, bitPix, changeEndian);
        return Promise.resolve(typedArray);
    }
}
