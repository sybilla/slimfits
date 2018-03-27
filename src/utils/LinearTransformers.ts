import {TypedArray} from '../interfaces';
import {BitPix} from '../interfaces';

export interface ILinearTransformer {
    transform(data: TypedArray, scale: number, zero: number): TypedArray;
    transformBack(data: TypedArray, scale: number, zero: number): TypedArray;
}

export class Uint8LinearTransformer implements ILinearTransformer {

    transform(data: TypedArray, scale: number, zero: number): TypedArray {
        const outData = new Uint8Array(data.length);

        for (let i = 0; i < data.length; i++) {
            outData[i] = (data[i] - zero) / scale;
        }

        return outData;
    }

    transformBack(data: TypedArray, scale: number, zero: number): TypedArray {
        if (!(data instanceof Uint8Array)) {
            throw new Error('unrecognized type');
        }

        if (scale === 1 && zero === -128) {
            return this.transformBackToInt8(data, scale, zero);
        }

        return this.transformBackToUint8(data, scale, zero);
    }

    private transformBackToInt8(data: Uint8Array, scale: number, zero: number): Int8Array {
        const outData = new Int8Array(data.length);

        for (let i = 0; i < data.length; i++) {
            outData[i] = data[i] * scale + zero;
        }

        return outData;
    }

    private transformBackToUint8(data: Uint8Array, scale: number, zero: number): Uint8Array {
        for (let i = 0; i < data.length; i++) {
            data[i] = data[i] * scale + zero;
        }

        return data;
    }
}

export class Int16LinearTransformer implements ILinearTransformer {
    transform(data: TypedArray, scale: number, zero: number): TypedArray {
        const outData = new Int16Array(data.length);

        for (let i = 0; i < data.length; i++) {
            outData[i] = (data[i] - zero) / scale;
        }

        return outData;
    }

    transformBack(data: TypedArray, scale: number, zero: number): TypedArray {
        if (!(data instanceof Int16Array)) {
            throw new Error('unrecognized type');
        }

        if (scale === 1 && zero >= 32767) {
            return this.transformBackToUint16(data, scale, zero);
        }

        return this.transformBackToInt16(data, scale, zero);
    }

    private transformBackToUint16(data: Int16Array, scale: number, zero: number): Uint16Array {
        const outData = new Uint16Array(data.length);

        for (let i = 0; i < data.length; i++) {
            outData[i] = data[i] * scale + zero;
        }

        return outData;
    }

    private transformBackToInt16(data: Int16Array, scale: number, zero: number): Int16Array {
        for (let i = 0; i < data.length; i++) {
            data[i] = data[i] * scale + zero;
        }

        return data;
    }
}

export class Int32LinearTransformer implements ILinearTransformer {
    transform(data: TypedArray, scale: number, zero: number): TypedArray {
        const outData = new Int32Array(data.length);

        for (let i = 0; i < data.length; i++) {
            outData[i] = (data[i] - zero) / scale;
        }

        return outData;
    }

    transformBack(data: TypedArray, scale: number, zero: number): TypedArray {
        if (!(data instanceof Int32Array)) {
            throw new Error('unrecognized type');
        }

        if (scale === 1 && zero >= 2147483647) {
            return this.transformBackToUint32(data, scale, zero);
        }

        return this.transformBackToInt32(data, scale, zero);
    }

    private transformBackToUint32(data: Int32Array, scale: number, zero: number): Uint32Array {
        const outData = new Uint32Array(data.length);

        for (let i = 0; i < data.length; i++) {
            outData[i] = data[i] * scale + zero;
        }

        return outData;
    }

    private transformBackToInt32(data: Int32Array, scale: number, zero: number): Int32Array {
        for (let i = 0; i < data.length; i++) {
            data[i] = data[i] * scale + zero;
        }

        return data;
    }
}

export class Float32LinearTransformer implements ILinearTransformer {
    transform(data: TypedArray, scale: number, zero: number): TypedArray {
        const outData = new Float32Array(data.length);

        for (let i = 0; i < data.length; i++) {
            outData[i] = (data[i] - zero) / scale;
        }

        return outData;
    }

    transformBack(data: TypedArray, scale: number, zero: number): TypedArray {
        if (!(data instanceof Float32Array)) {
            throw new Error('unrecognized type');
        }

        for (let i = 0; i < data.length; i++) {
            data[i] = data[i] * scale + zero;
        }

        return data;
    }
}

export class Float64LinearTransformer implements ILinearTransformer {
    transform(data: TypedArray, scale: number, zero: number): TypedArray {
        const outData = new Float64Array(data.length);

        for (let i = 0; i < data.length; i++) {
            outData[i] = (data[i] - zero) / scale;
        }

        return outData;
    }

    transformBack(data: TypedArray, scale: number, zero: number): TypedArray {
        if (!(data instanceof Float64Array)) {
            throw new Error('unrecognized type');
        }

        for (let i = 0; i < data.length; i++) {
            data[i] = data[i] * scale + zero;
        }

        return data;
    }
}

const registeredTransformers = {
    Uint8 : new Uint8LinearTransformer(),
    Int16 : new Int16LinearTransformer(),
    Int32 : new Int32LinearTransformer(),
    // 'Int64': Int64LinearTransformer, // <- we don't have it in JS!
    Float32 : new Float32LinearTransformer(),
    Float64 : new Float64LinearTransformer()
};

export let LinearTransformers = {
    registeredTransformers,
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
                throw new Error('no transformer for this BitPix');
        }

        return transformer;
    }
};
