import { IDataReader, IDataSource, IKeyword, TypedArray, Constants, BitPix, BitPixUtils } from '../interfaces';
import { KeywordsManager } from '../utils/KeywordsManager';
import { LinearTransformers } from '../utils/LinearTransformers';

export class SimpleDataReader implements IDataReader {
    get name() {
        return 'simple data';
    }

    public canReadData(header: IKeyword[]): boolean {
        return (KeywordsManager.hasValue(header, 'SIMPLE', true)
            || KeywordsManager.hasValue(header, 'XTENSION', 'IMAGE'))
            && !KeywordsManager.hasValue(header, 'GROUPS', true);
    }

    public readDataSize(header: IKeyword[]): number {
        const elementType = KeywordsManager.getValue(header, 'BITPIX', BitPix.Unknown);
        const elementTypeSize = BitPixUtils.getByteSize(elementType);
        if (KeywordsManager.hasValue(header, 'NAXIS', 0)) {
            return 0;
        }
        const length = header
            .filter(k => k.key.indexOf('NAXIS') === 0 && k.key !== 'NAXIS')
            .reduce((prev, cur) => prev * cur.value, 1);
        return Math.ceil(elementTypeSize * length / Constants.blockLength) * Constants.blockLength;
    }

    public readDataAsync(file: IDataSource, offsetBytes: number, header: IKeyword[], changeEndian: boolean = true) {
        const dataType = KeywordsManager.getValue(header, 'BITPIX', BitPix.Unknown);
        const naxisKeywords = header.filter(k => k.key.indexOf('NAXIS', 0) === 0 && k.key !== 'NAXIS');
        const length = naxisKeywords.map(k => k.value).reduce((a, b) => a * b, 1);

        const bscale = KeywordsManager.getValue(header, 'BSCALE', 1);
        const bzero = KeywordsManager.getValue(header, 'BZERO', 0);

        if (naxisKeywords.length > 0 && length !== 0) {
            const promise = file.getDataAsync(offsetBytes, length, dataType, changeEndian);
            if (bscale !== 1 || bzero !== 0) {
                return promise.then(data => {
                    const transformer = LinearTransformers.getTransformerFor(dataType);
                    return transformer.transformBack(data, bscale, bzero);
                });
            } else {
                return promise;
            }
        } else {
            throw new Error('no data found in segment');
        }
    }
}
