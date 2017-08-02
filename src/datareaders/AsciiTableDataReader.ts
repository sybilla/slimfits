import {IDataReader, IDataSource, IKeyword, Constants} from '../Interfaces';
import {KeywordsManager} from '../utils/KeywordsManager';
import {AsciiConverter} from '../utils/AsciiConverter';

export class AsciiTableDataReader implements IDataReader {
    get name() {
        return 'ASCII table data';
    }

    canReadData(header: IKeyword[]): boolean {
        return KeywordsManager.hasValue(header, 'XTENSION', 'TABLE');
    }

    readDataSize(header: IKeyword[]): number {
        const rowsCount = KeywordsManager.getValue(header, 'NAXIS2', 1);
        const rowLength = KeywordsManager.getValue(header, 'NAXIS1', 1);
        return Math.ceil(rowLength * rowsCount / Constants.blockLength) * Constants.blockLength;
    }

    readDataAsync(file: IDataSource, offsetBytes: number, header: IKeyword[]) {
        const rowsCount = KeywordsManager.getValue(header, 'NAXIS2', 1);
        const rowLength = KeywordsManager.getValue(header, 'NAXIS1', 1);
        const fieldsCount = KeywordsManager.getValue(header, 'TFIELDS', 0);
        const tforms = header.filter(k => k.key.indexOf('TFORM') === 0)
            .map(k => AsciiConverter.getConverterFor(k.value, rowsCount));

        const asciiconverters = tforms.map(x => x.converter);
        const resultList = tforms.map(x => x.array);

        const positions = header.filter(k => k.key.indexOf('TBCOL') === 0)
            .map(k => k.value - 1).concat([rowLength]);

        if ((positions.length + 1) !== fieldsCount) {
            throw new Error(`There are ${positions.length} TBCOL# keywords whereas TFIELDS specifies ${fieldsCount}`);
        }

        return file.getStringAsync(offsetBytes, rowLength * rowsCount).then((data) => {
            for (let rowIdx = 0; rowIdx < rowsCount; rowIdx++) {
                const line: string = data.substr(rowIdx * rowLength, rowLength);

                for (let posIdx = 0; posIdx < fieldsCount; posIdx++) {
                    const chunk: string = line.substr(positions[posIdx], positions[posIdx + 1] - positions[posIdx]);
                    resultList[posIdx][rowIdx] = asciiconverters[posIdx](chunk.trim());
                }
            }
            return resultList;
        });
    }
}
