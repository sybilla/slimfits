import {IDataReader, IDataSource, IKeyword, Constants, BitPix, BitPixUtils} from '../Interfaces';
import {KeywordsManager} from '../utils/KeywordsManager';
import {ArrayUtils} from '../utils/ArrayUtils';

export class BinaryTableDataReader implements IDataReader {
    get name() {
        return 'binary table data';
    }

    public canReadData(header: IKeyword[]): boolean {
        return KeywordsManager.hasValueFromList(header, 'XTENSION', ['BINTABLE', 'A3DTABLE']) &&
            !KeywordsManager.hasValue(header, 'ZIMAGE', true);
    }

    public readDataSize(header: IKeyword[]) {
        const rowsCount = KeywordsManager.getValue(header, 'NAXIS2', 1);
        const rowByteLength = KeywordsManager.getValue(header, 'NAXIS1', 1);
        return Math.ceil(rowByteLength * rowsCount / Constants.blockLength) * Constants.blockLength;
    }

    public readDataAsync(file: IDataSource, offsetBytes: number, header: IKeyword[]) {
        const rowsCount = KeywordsManager.getValue(header, 'NAXIS2', 0);
        const rowByteLength = KeywordsManager.getValue(header, 'NAXIS1', 0);

        let rowByteOffset = 0;
        const isValidTFORM = new RegExp('\\d+\\w');
        const converters = header.filter(k => k.key.indexOf('TFORM') === 0 && isValidTFORM.test(k.value)).map(k => {
            const format = k.value.substr(k.value.length - 1, 1);
            const count = parseInt(k.value.substr(0, k.value.length - 1), 10);
            const byteOffset = rowByteOffset;
            const dataType = format === 'A' ? BitPix.Uint8 : BitPixUtils.getBitPixForLetter(format);
            rowByteOffset += count * BitPixUtils.getByteSize(dataType);
            return { format, count, byteOffset };
        });

        return file.getDataAsync(offsetBytes, rowsCount * rowByteLength, BitPix.Uint8).then(data => {
            return converters.map(c => {
                return this.readColumn(data.buffer, rowsCount, rowByteLength, c.byteOffset, c.count, c.format);
            });
        });
    }

    private readColumn(
        source: ArrayBufferLike,
        rows: number,
        rowByteWidth: number,
        rowByteOffset: number,
        width: number,
        format: string) {
        if (width === 0) {
            return [];
        }
        const dataType = format === 'A' ? BitPix.Uint8 : BitPixUtils.getBitPixForLetter(format);
        const buffer = new ArrayBuffer(BitPixUtils.getByteSize(dataType) * rows * width);
        ArrayUtils.pluckColumn(source, buffer, rows, rowByteWidth, rowByteOffset, width, dataType, true);
        const chunks = ArrayUtils.chunk(buffer, dataType, width);
        return format === 'A' ? chunks.map(x => String.fromCharCode.apply(null, x)) : chunks;
    }
}
