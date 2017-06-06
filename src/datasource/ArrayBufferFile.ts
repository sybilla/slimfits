import {ITypedArray, IDataSource, BitPix} from '../Interfaces';
import {PromiseUtils} from '../utils/PromiseUtils';
import {ArrayUtils} from '../utils/ArrayUtils';
import {Promise} from 'es6-promise';

export class ArrayBufferFile implements IDataSource {

    private data: ArrayBuffer;

    constructor(data: ArrayBuffer | any) {
        
        if (data instanceof ArrayBuffer) {
            this.data = <ArrayBuffer>data;
        } else {
            // here we assume NodeJS's Buffer type
            this.data = this.toArrayBuffer(data);
        }
    }

    initialize(): Promise<boolean> {
        return this.getStringAsync(0,6).then(value => {
            return (value == "SIMPLE") && (this.getByteLength() % 2880 == 0);
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

    private toArrayBuffer(buf: any): ArrayBuffer {
        var ab = new ArrayBuffer(buf.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return ab;
    }
}