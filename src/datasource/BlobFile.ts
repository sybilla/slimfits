import {TypedArray, IDataSource, BitPix, BitPixUtils} from '../Interfaces';
import {ArrayUtils} from '../utils/ArrayUtils';

export class BlobFile implements IDataSource {
    public url: string = '';
    constructor(private file: File) {
        this.url = file.name;
    }

    initialize() {
        return this.getStringAsync(0, 6).then(value => {
            return (value === 'SIMPLE') && (this.getByteLength() % 2880 === 0);
        });
    }

    public getByteLength() {
        return this.file.size;
    }

    public getStringAsync(start: number, length: number) {
        return new Promise<string>((resolve, reject) => {
            const blob = this.file.slice(start, start + length);
            const reader = new FileReader();
            reader.onloadend = (evt) => {
                if (reader.readyState === reader.DONE) {
                    resolve(reader.result);
                } else {
                    reject(reader.error);
                }
            };

            reader.readAsText(blob);
        });
    }

    public getDataAsync(start: number, length: number, bitPix: BitPix, changeEndian = true) {
        return new Promise<TypedArray>((resolve, reject) => {
            const blob = this.file.slice(start, start + length * BitPixUtils.getByteSize(bitPix));
            const reader = new FileReader();
            reader.onloadend = (evt) => {
                if (reader.readyState === reader.DONE) {
                    const typedArray: TypedArray = ArrayUtils.generateTypedArray(bitPix, length);
                    ArrayUtils.copy(reader.result, typedArray.buffer, 0, length, bitPix, changeEndian);
                    resolve(typedArray);
                } else {
                    reject(reader.error);
                }
            };

            reader.readAsArrayBuffer(blob);
        });
    }
}
