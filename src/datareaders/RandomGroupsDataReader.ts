import {IKeyword, IDataReader, IDataSource,  Constants, BitPix, BitPixUtils} from '../Interfaces';
import {KeywordsManager} from '../utils/KeywordsManager';
import {ArrayUtils} from '../utils/ArrayUtils';

export class RandomGroupsDataReader implements IDataReader {
    get name() {
        return 'random groups data';
    }
    canReadData(header: IKeyword[]): boolean {
        return KeywordsManager.hasValue(header, 'GROUPS', true) && KeywordsManager.hasValue(header, 'NAXIS1', 0);
    }

    readDataSize(header: IKeyword[]): number {
        const elementType = KeywordsManager.getValue(header, 'BITPIX', BitPix.Unknown);
        const groupLength = header.filter(
                k => k.key.indexOf('NAXIS') === 0 && k.key !== 'NAXIS' && k.key !== 'NAXIS1' && k.value !== 1
            ).reduce((prev, cur) => prev * cur.value, 1);

        const groupsCount = KeywordsManager.getValue(header, 'GCOUNT', 0);
        const paramsLength = KeywordsManager.getValue(header, 'PCOUNT', 0);
        const elementTypeSize = BitPixUtils.getByteSize(elementType);
        return Math.ceil(groupsCount * (paramsLength + groupLength) * elementTypeSize / Constants.blockLength)
            * Constants.blockLength;
    }

    readDataAsync(file: IDataSource, offsetBytes: number, header: IKeyword[], changeEndian = true) {
        const elementType = KeywordsManager.getValue(header, 'BITPIX', BitPix.Unknown);
        const elementTypeSize = BitPixUtils.getByteSize(elementType);
        const groupsCount = KeywordsManager.getValue(header, 'GCOUNT', 0);
        const paramsLength = KeywordsManager.getValue(header, 'PCOUNT', 0);

        const groupLength = header.filter(
                k => k.key.indexOf('NAXIS') === 0 && k.key !== 'NAXIS' && k.key !== 'NAXIS1' && k.value !== 1
            ).reduce((prev, cur) => prev * cur.value, 1);

        const paramsAndGroupLength = paramsLength + groupLength;
        const paramsByteLength = paramsLength * elementTypeSize;

        return file.getDataAsync(offsetBytes, paramsAndGroupLength * groupsCount, elementType, changeEndian)
        .then(x => {
            const params = ArrayUtils.generateTypedArray(elementType, groupsCount * paramsLength);
            const data = ArrayUtils.generateTypedArray(elementType, groupsCount * groupLength);

            ArrayUtils.pluckColumn(
                x.buffer,
                params.buffer,
                groupsCount,
                paramsAndGroupLength * elementTypeSize,
                0,
                paramsLength,
                elementType,
                false
            );

            ArrayUtils.pluckColumn(
                x.buffer,
                data.buffer,
                groupsCount,
                paramsAndGroupLength * elementTypeSize,
                paramsByteLength,
                groupLength,
                elementType,
                false
            );

            return {
                params: ArrayUtils.chunk(params.buffer, elementType, paramsLength),
                data: ArrayUtils.chunk(data.buffer, elementType, groupLength)
            };
        });
    }
}
