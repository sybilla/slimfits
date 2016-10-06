import {IKeyword, IDataReader, IDataSource, ITypedArray, Constants, BitPix, BitPixUtils} from "../Interfaces"
import {KeywordsManager} from "../utils/KeywordsManager";
import {ArrayUtils} from "../utils/ArrayUtils";
import {Promise} from 'es6-promise';

export class RandomGroupsDataReader implements IDataReader {
    get name() {
        return "random groups data";
    }
    canReadData(header: Array<IKeyword>): boolean {
        return KeywordsManager.hasValue(header, "GROUPS", true) && KeywordsManager.hasValue(header, "NAXIS1", 0);
    }

    readDataSize(header: Array<IKeyword>): number {
        var elementType = KeywordsManager.getValue(header, "BITPIX", BitPix.Unknown);
        var groupLength = header.filter(k => k.key.indexOf('NAXIS') === 0 && k.key !== 'NAXIS' && k.key !== 'NAXIS1' && k.value !== 1)
            .reduce((prev, cur) => prev * cur.value, 1);

        var groupsCount = KeywordsManager.getValue(header, "GCOUNT", 0);
        var paramsLength = KeywordsManager.getValue(header, "PCOUNT", 0);
        var elementTypeSize = BitPixUtils.getByteSize(elementType);
        return Math.ceil(groupsCount * (paramsLength + groupLength) * elementTypeSize / Constants.blockLength) * Constants.blockLength;
    }

    readDataAsync(file: IDataSource, offsetBytes: number, header: Array<IKeyword>, changeEndian = true) {
        var elementType = KeywordsManager.getValue(header, "BITPIX", BitPix.Unknown);
        var elementTypeSize = BitPixUtils.getByteSize(elementType);
        var groupsCount = KeywordsManager.getValue(header, "GCOUNT", 0);
        var paramsLength = KeywordsManager.getValue(header, "PCOUNT", 0);

        var groupLength = header.filter(k => k.key.indexOf('NAXIS') === 0 && k.key !== 'NAXIS' && k.key !== 'NAXIS1' && k.value !== 1)
            .reduce((prev, cur) => prev * cur.value, 1);

        var paramsAndGroupLength = paramsLength + groupLength;
        let paramsByteLength = paramsLength * elementTypeSize;

        return file.getDataAsync(offsetBytes, paramsAndGroupLength * groupsCount, elementType, changeEndian).then(x => {
            var params = ArrayUtils.generateTypedArray(elementType, groupsCount * paramsLength);
            var data = ArrayUtils.generateTypedArray(elementType, groupsCount * groupLength);

            ArrayUtils.pluckColumn(x.buffer, params.buffer, groupsCount, paramsAndGroupLength * elementTypeSize, 0, paramsLength, elementType, false);
            ArrayUtils.pluckColumn(x.buffer, data.buffer, groupsCount, paramsAndGroupLength * elementTypeSize, paramsByteLength, groupLength, elementType, false);

            return { params: ArrayUtils.chunk(params.buffer, elementType, paramsLength), data: ArrayUtils.chunk(data.buffer, elementType, groupLength) };
        });
    }
}