import { BitPixUtils } from "../Interfaces";
import { ArrayUtils } from "../utils/ArrayUtils";
import { Promise } from 'es6-promise';
export class BlobFile {
    constructor(file) {
        this.file = file;
        this.url = "";
        this.url = file.name;
    }
    initialize() {
        return Promise.resolve(true);
    }
    getByteLength() {
        return this.file.size;
    }
    getStringAsync(start, length) {
        return new Promise((resolve, reject) => {
            var blob = this.file.slice(start, start + length);
            var reader = new FileReader();
            reader.onloadend = function (evt) {
                var target = evt.target;
                if (target.readyState == target.DONE) {
                    resolve(target.result);
                }
                else {
                    reject(target.error);
                }
            };
            reader.readAsText(blob);
        });
    }
    getDataAsync(start, length, bitPix, changeEndian = true) {
        return new Promise((resolve, reject) => {
            var blob = this.file.slice(start, start + length * BitPixUtils.getByteSize(bitPix));
            var reader = new FileReader();
            reader.onloadend = function (evt) {
                var target = evt.target;
                if (target.readyState == target.DONE) {
                    var typedArray = ArrayUtils.generateTypedArray(bitPix, length);
                    ArrayUtils.copy(target.result, typedArray.buffer, start, length, bitPix, changeEndian);
                    resolve(typedArray);
                }
                else {
                    reject(target.error);
                }
            };
            reader.readAsArrayBuffer(blob);
        });
    }
}
//# sourceMappingURL=BlobFile.js.map