import {ITypedArray} from '../Interfaces';
import {BitPix} from '../Interfaces';

export interface ILinearTransformer {
    transform(data: ITypedArray, scale: number, zero: number): ITypedArray;
    transformBack(data: ITypedArray, scale: number, zero: number): ITypedArray;
}

export class Uint8LinearTransformer implements ILinearTransformer {

    transform(data: ITypedArray, scale: number, zero: number): ITypedArray {
        let outData = new Uint8Array(data.length);

        for (var i = 0; i < data.length; i++) {
            outData[i] = (data[i] - zero) / scale;
        }

        return outData;
    }

    transformBack(data: ITypedArray, scale: number, zero: number): ITypedArray {

        if (!(data instanceof Uint8Array))
            throw 'unrecognized type';

        if (scale === 1 && zero === -128) {
            return this.transformBackToInt8(<Uint8Array>data, scale, zero);
        }

        return this.transformBackToUint8(<Uint8Array>data, scale, zero);
    }

    private transformBackToInt8(data: Uint8Array, scale: number, zero: number): Int8Array {
        let outData = new Int8Array(data.length);

        for (var i = 0; i < data.length; i++) {
            outData[i] = data[i] * scale + zero;
        }

        return outData;
    }

    private transformBackToUint8(data: Uint8Array, scale: number, zero: number): Uint8Array {

        for (var i = 0; i < data.length; i++) {
            data[i] = data[i] * scale + zero;
        }

        return data;
    }
}

export class Int16LinearTransformer implements ILinearTransformer {

    transform(data: ITypedArray, scale: number, zero: number): ITypedArray {
        let outData = new Int16Array(data.length);

        for (var i = 0; i < data.length; i++) {
            outData[i] = (data[i] - zero) / scale;
        }

        return outData;
    }

    transformBack(data: ITypedArray, scale: number, zero: number): ITypedArray {

        if (!(data instanceof Int16Array))
            throw 'unrecognized type';

        if (scale === 1 && zero >= 32767) {
            return this.transformBackToUint16(<Int16Array>data, scale, zero);
        }

        return this.transformBackToInt16(<Int16Array>data, scale, zero);
    }

    private transformBackToUint16(data: Int16Array, scale: number, zero: number): Uint16Array {
        let outData = new Uint16Array(data.length);

        for (var i = 0; i < data.length; i++) {
            outData[i] = data[i] * scale + zero;
        }

        return outData;
    }

    private transformBackToInt16(data: Int16Array, scale: number, zero: number): Int16Array {

        for (var i = 0; i < data.length; i++) {
            data[i] = data[i] * scale + zero;
        }

        return data;
    }
}

export class Int32LinearTransformer implements ILinearTransformer {

    transform(data: ITypedArray, scale: number, zero: number): ITypedArray {
        let outData = new Int32Array(data.length);

        for (var i = 0; i < data.length; i++) {
            outData[i] = (data[i] - zero) / scale;
        }

        return outData;
    }

    transformBack(data: ITypedArray, scale: number, zero: number): ITypedArray {

        if (!(data instanceof Int32Array))
            throw 'unrecognized type';

        if (scale === 1 && zero >= 2147483647) {
            return this.transformBackToUint32(<Int32Array>data, scale, zero);
        }

        return this.transformBackToInt32(<Int32Array>data, scale, zero);
    }

    private transformBackToUint32(data: Int32Array, scale: number, zero: number): Uint32Array {
        let outData = new Uint32Array(data.length);

        for (var i = 0; i < data.length; i++) {
            outData[i] = data[i] * scale + zero;
        }

        return outData;
    }

    private transformBackToInt32(data: Int32Array, scale: number, zero: number): Int32Array {

        for (var i = 0; i < data.length; i++) {
            data[i] = data[i] * scale + zero;
        }

        return data;
    }
}

export class Float32LinearTransformer implements ILinearTransformer {

    transform(data: ITypedArray, scale: number, zero: number): ITypedArray {
        let outData = new Float32Array(data.length);

        for (var i = 0; i < data.length; i++) {
            outData[i] = (data[i] - zero) / scale;
        }

        return outData;
    }

    transformBack(data: ITypedArray, scale: number, zero: number): ITypedArray {

        if (!(data instanceof Float32Array))
            throw 'unrecognized type';

        for (var i = 0; i < data.length; i++) {
            data[i] = data[i] * scale + zero;
        }

        return data;
    }
}

export class Float64LinearTransformer implements ILinearTransformer {

    transform(data: ITypedArray, scale: number, zero: number): ITypedArray {
        let outData = new Float64Array(data.length);

        for (var i = 0; i < data.length; i++) {
            outData[i] = (data[i] - zero) / scale;
        }

        return outData;
    }

    transformBack(data: ITypedArray, scale: number, zero: number): ITypedArray {

        if (!(data instanceof Float64Array))
            throw 'unrecognized type';

        for (var i = 0; i < data.length; i++) {
            data[i] = data[i] * scale + zero;
        }

        return data;
    }
}

let registeredTransformers = {
    'Uint8': new Uint8LinearTransformer(),
    'Int16': new Int16LinearTransformer(),
    'Int32': new Int32LinearTransformer(),
    // 'Int64': Int64LinearTransformer, // <- we don't have it in JS!
    'Float32': new Float32LinearTransformer(),
    'Float64': new Float64LinearTransformer()
}

export var LinearTransformers = {
    registeredTransformers: registeredTransformers,
    getTransformerFor: (b: BitPix): ILinearTransformer => {
        let transformer: ILinearTransformer;

        switch (b) {
            case BitPix.Uint8:
                transformer = registeredTransformers.Uint8;
                break;
            case BitPix.Int16:
                transformer = registeredTransformers.Int16;
                break;
            case BitPix.Int32:
                transformer = registeredTransformers.Int32;
                break;
            case BitPix.Float32:
                transformer = registeredTransformers.Float32;
                break;
            case BitPix.Float64:
                transformer = registeredTransformers.Float64;
                break;
            default:
                throw 'no transformer for this BitPix';
        }

        return transformer;
    }
}