import { IDataReader, IDataSource, IKeyword, Constants, BitPix, BitPixUtils, TypedArray } from '../interfaces';
import { KeywordsManager } from '../utils/KeywordsManager';
import { ArrayUtils } from '../utils/ArrayUtils';

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
        const pcount = KeywordsManager.getValue(header, 'PCOUNT', 0);
        return Math.ceil((pcount + rowByteLength * rowsCount) / Constants.blockLength) * Constants.blockLength;
    }

    public readDataAsync(file: IDataSource, offsetBytes: number, header: IKeyword[]) {
        const rowsCount = KeywordsManager.getValue(header, 'NAXIS2', 0);
        const rowByteLength = KeywordsManager.getValue(header, 'NAXIS1', 0);
        let heapOffset = KeywordsManager.getValue(header, 'THEAP', 0);
        if (heapOffset === 0) {
            heapOffset += rowsCount * rowByteLength;
        }
        const gapPlusHeapSize = KeywordsManager.getValue(header, 'PCOUNT', 0);
        const heapSize = gapPlusHeapSize - Math.max(0, heapOffset - rowsCount * rowByteLength);

        let rowByteOffset = 0;
        const arrayTFORM = new RegExp('(\\d*)(P?[ABIJKED])(?:\\((\\d+)\\)){0,1}');
        const converters = header.filter(k => k.key.indexOf('TFORM') === 0 && arrayTFORM.test(k.value)).map(k => {
            const result = arrayTFORM.exec(k.value);

            if (result === null) {
                throw new Error('unsupported converter found');
            }

            const count = parseInt(result[1], 10);

            if (result[2].startsWith('Q')) {
                throw new Error('64bit array pointers for variable length arrays are unsupported');
            }

            const name = k.key.replace('TFORM', 'TTYPE');
            const columnName: string = header.filter(x => x.key === name)[0].value;
            const isPointer = result[2].startsWith('P');
            const format = isPointer ? result[2][1] : result[2];
            const byteOffset = rowByteOffset;
            const dataType = BitPixUtils.getBitPixForLetter(format);
            rowByteOffset += isPointer ? 2 * BitPixUtils.getByteSize(BitPix.Int32) : count * BitPixUtils.getByteSize(dataType);
            return { format, count, byteOffset, isPointer, columnName };
        });

        if (converters.some(x => x.isPointer)) { // contains variable length column
            const promises = [
                file.getDataAsync(offsetBytes, rowsCount * rowByteLength, BitPix.Uint8),
                file.getDataAsync(offsetBytes + heapOffset, heapSize, BitPix.Uint8)
            ];

            return Promise.all(promises)
                .then(results => {
                    const [data, heap] = results.map(x => x.buffer);
                    return converters.map(c => {
                        if (c.isPointer) {
                            const pointers = BinaryTableDataReader.readColumn(data, rowsCount, rowByteLength, c.byteOffset, 2, 'J');
                            return { name: c.columnName, data: BinaryTableDataReader.convertToTiles(pointers, heap, c.format) };
                        } else {
                            return { name: c.columnName, data: BinaryTableDataReader.readColumn(data, rowsCount, rowByteLength, c.byteOffset, c.count, c.format) };
                        }
                    });
                });
        } else {
            return file.getDataAsync(offsetBytes, rowsCount * rowByteLength, BitPix.Uint8)
                .then(data => {
                    return converters.map(c => {
                        return { name: c.columnName, data: BinaryTableDataReader.readColumn(data.buffer, rowsCount, rowByteLength, c.byteOffset, c.count, c.format) };
                    });
                });
        }
    }

    private static convertToTiles(pointers: TypedArray[], heap: ArrayBuffer | SharedArrayBuffer, format: string): TypedArray[] {
        const dataType = BitPixUtils.getBitPixForLetter(format);
        const tiles: TypedArray[] = [];
        const rowsCount = pointers.length;

        switch (dataType) {
            case BitPix.Char:
                for (let i = 0; i < rowsCount; i++) {
                    tiles.push(new Uint8Array(heap, pointers[i][1], pointers[i][0]));
                }
                break;
            case BitPix.Uint8:
                for (let i = 0; i < rowsCount; i++) {
                    tiles.push(new Uint8Array(heap, pointers[i][1], pointers[i][0]));
                }
                break;
            case BitPix.Int16:
                for (let i = 0; i < rowsCount; i++) {
                    tiles.push(new Int16Array(heap, pointers[i][1], pointers[i][0]));
                }
                break;
            case BitPix.Int32:
                for (let i = 0; i < rowsCount; i++) {
                    tiles.push(new Int32Array(heap, pointers[i][1], pointers[i][0]));
                }
                break;
            case BitPix.Int64:
                throw new Error('unsupported 64bit array element type');
            case BitPix.Float32:
                for (let i = 0; i < rowsCount; i++) {
                    tiles.push(new Float32Array(heap, pointers[i][1], pointers[i][0]));
                }
                break;
            case BitPix.Float32:
                for (let i = 0; i < rowsCount; i++) {
                    tiles.push(new Float64Array(heap, pointers[i][1], pointers[i][0]));
                }
                break;
        }

        return tiles;
    }

    private static readColumn(
        source: ArrayBufferLike,
        rows: number,
        rowByteWidth: number,
        rowByteOffset: number,
        width: number,
        format: string) {
        if (width === 0) {
            return [];
        }
        const dataType = BitPixUtils.getBitPixForLetter(format);
        const buffer = new ArrayBuffer(BitPixUtils.getByteSize(dataType) * rows * width);
        ArrayUtils.pluckColumn(source, buffer, rows, rowByteWidth, rowByteOffset, width, dataType, true);
        const chunks = ArrayUtils.chunk(buffer, dataType, width);
        return format === 'A' ? chunks.map(chunk => String.fromCharCode.apply(null, chunk)) : chunks;
    }
}
