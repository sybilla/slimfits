import {ITypedArray, IDataSource, BitPix, BitPixUtils} from "../Interfaces";
import {PromiseUtils} from "../utils/PromiseUtils";
import {ArrayUtils} from "../utils/ArrayUtils";
import {Promise} from 'es6-promise';

export class BlobFile implements IDataSource {
    public url: string = "";
    constructor(private file: File) {
        this.url = file.name;
    }

    initialize(): Promise<any> {
        return Promise.resolve(true);
    }

    public getByteLength() {
        return this.file.size;
    }

    public getStringAsync(start: number, length: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            var blob = this.file.slice(start, start + length);
            var reader = new FileReader();
            reader.onloadend = function (evt) {
                var target = <FileReader>evt.target;
                if (target.readyState == target.DONE) {
                    resolve(target.result);
                } else {
                    reject(target.error);
                }
            };

            reader.readAsText(blob);
        });
    }

    public getDataAsync(start: number, length: number, bitPix: BitPix, changeEndian: boolean = true): Promise<ITypedArray> {
        return new Promise<ITypedArray>((resolve, reject) => {
            var blob = this.file.slice(start, start + length * BitPixUtils.getByteSize(bitPix));
            var reader = new FileReader();
            reader.onloadend = function (evt) {
                var target = <FileReader>evt.target;
                if (target.readyState == target.DONE) {
                    var typedArray: ITypedArray = ArrayUtils.generateTypedArray(bitPix, length);
                    ArrayUtils.copy(target.result, typedArray.buffer, 0, length, bitPix, changeEndian);
                    resolve(typedArray);
                } else {
                    reject(target.error);
                }
            };

            reader.readAsArrayBuffer(blob);
        });
    }
}