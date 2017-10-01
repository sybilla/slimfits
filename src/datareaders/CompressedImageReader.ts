import {IDataReader, IDataSource, IKeyword, TypedArray, Constants, BitPix, BitPixUtils} from '../Interfaces';
import {KeywordsManager} from '../utils/KeywordsManager';
import {Rice} from '../utils/Rice';
import {BinaryTableDataReader} from './BinaryTableDataReader';

export class CompressedImageReader implements IDataReader {
    private binaryTableDataReader = new BinaryTableDataReader();
    private static convertToTiles(pointers: TypedArray, compressedData: TypedArray): Uint8Array[] {
        const tiles: Uint8Array[] = [];
        const rowsCount = pointers.length / 2;
        for (let i = 0; i < rowsCount; i++) {
            tiles.push(new Uint8Array(compressedData.buffer, pointers[2 * i + 1], pointers[2 * i]));
        }
        return tiles;
    }

    private static riceExtract(compressedTile: TypedArray, blockSize: number, bytePix: number): TypedArray {
        return compressedTile;
    }

    get name() {
        return 'compressed image data';
    }

    canReadData(header: IKeyword[]): boolean {
        const ztiles = header.filter( k => k.key.indexOf('ZTILE') === 0 && (k.key !== 'ZTILE'));
        const compressionType = KeywordsManager.getValue(header, 'ZCMPTYPE', '' as string);
        return KeywordsManager.hasValueFromList(header, 'XTENSION', ['BINTABLE', 'A3DTABLE']) &&
            KeywordsManager.hasValue(header, 'ZIMAGE', true) && (compressionType == 'RICE_1') &&
            (ztiles.length == 2) && 
            (ztiles[1].value == 1);
    }

    readDataSize(header: IKeyword[]): number {
        return this.binaryTableDataReader.readDataSize(header);
    }

    readDataAsync(file: IDataSource, offsetBytes: number, header: IKeyword[]) {
        return this.binaryTableDataReader.readDataAsync(file, offsetBytes, header)
            .then(result => {
                const riceBlockSize = KeywordsManager.getValue(header, 'ZVAL1', 32);
                const riceByteWidth = KeywordsManager.getValue(header, 'ZVAL2', 4);
                const bitpix = KeywordsManager.getValue(header, 'ZBITPIX', BitPix.Unknown);
                const ztiles = header.filter( k => k.key.indexOf('ZTILE') === 0 && (k.key !== 'ZTILE'));

                const tileLinearSize = ztiles.reduce((x, y) => x * y.value, 1);
                const tiles = result.filter( column => column.name = "COMPRESSED_DATA").map(x=>x.data as Uint8Array[])[0];

                if (!tiles) {
                    throw new Error("COMPRESSED_DATA not found");
                }

                let uncompressed: Array<Int32Array|Int16Array|Uint8Array> = [];
                const tileByteSize = riceBlockSize / 8 * tileLinearSize;
                 // so tiles occupy one place in memory
                const uncompressedBuffer = new ArrayBuffer(tileByteSize * tiles.length);
                if (riceByteWidth === BitPixUtils.getByteSize(BitPix.Int32)) {
                    uncompressed = tiles.map((tile, index) =>   {
                        const out = new Int32Array(uncompressedBuffer, index * tileByteSize, tileLinearSize);
                        Rice.fits_rdecomp(tile, out, riceBlockSize);
                        return out;
                    });
                } else if (riceByteWidth === BitPixUtils.getByteSize(BitPix.Int16)) {
                    uncompressed = tiles.map((tile, index) =>   {
                        const out = new Int16Array(uncompressedBuffer, index * tileByteSize, tileLinearSize);
                        Rice.fits_rdecomp_short(tile, out, riceBlockSize);
                        return out;
                    });
                } else if (riceByteWidth === BitPixUtils.getByteSize(BitPix.Uint8)) {
                    uncompressed = tiles.map((tile, index) =>   {
                        const out = new Uint8Array(uncompressedBuffer, index * tileByteSize, tileLinearSize);
                        Rice.fits_rdecomp_byte(tile, out, riceBlockSize);
                        return out;
                    });
                }

                
                const bscale = KeywordsManager.getValue(header, 'BSCALE', 1);
                const bzero = KeywordsManager.getValue(header, 'BZERO', 0);
                const quantiz = KeywordsManager.getValue(header, 'ZQUANTIZ', "NO_DITHER");
                const ditherSeed = KeywordsManager.getValue(header, 'ZDITHER0', 0);


                return uncompressed;
        });

        // const rowsCount = KeywordsManager.getValue(header, 'NAXIS2', 0);
        // const rowLength = KeywordsManager.getValue(header, 'NAXIS1', 0);
        // const fieldsCount = KeywordsManager.getValue(header, 'TFIELDS', 0);
        // const rowElementsCount  = 0;
        // const regex = new RegExp('\\d{0,}\\D');
        // const arrayTFORM = new RegExp('([01]{0,1})([PQ])([ABIJKED])\\((\\d+)\\)');
        // const heapOffset = KeywordsManager.getValue(header, 'THEAP', 0);
        // const heapSize = KeywordsManager.getValue(header, 'PCOUNT', 0);
        // const gCountLength = KeywordsManager.getValue(header, 'GCOUNT', 0);
        // const compressionType = KeywordsManager.getValue(header, 'ZCMPTYPE', '' as string);
        // const containsVariableArray = header
        //     .filter(k => k.key.indexOf('TFORM') === 0)
        //     .some(kv => arrayTFORM.test(kv.value));

        // if (containsVariableArray) {
        //     const imageInfo = header.filter(k => (k.key.indexOf('TFORM') === 0) && arrayTFORM.test(k.value))[0];
        //     const result = arrayTFORM.exec(imageInfo.value);
        //     if (result == null) {
        //         throw new Error('result null in compressed image reader');
        //     }

        //     const pointerFormat = result[2];
        //     const elementFormat = result[3];
        //     const count = parseInt(result[4], 10);

        //     if (pointerFormat !== 'P') {
        //         throw new Error('Pointer format other than Int32 unsupported');
        //     }

        //     if (elementFormat !== 'B') {
        //         throw new Error('Element format other than Byte currently unsupported');
        //     }

        //     if (compressionType !== 'RICE_1') {
        //         throw new Error('Decompression other than Rice is not currently supported');
        //     }

        //     const ztiles = header.filter( k => k.key.indexOf('ZTILE') === 0 && (k.key !== 'ZTILE'));

        //     const tileLinearSize = ztiles.reduce((x, y) => x * y.value, 1);

        //     const riceBlockSize = KeywordsManager.getValue(header, 'ZVAL1', 32);
        //     const riceByteWidth = KeywordsManager.getValue(header, 'ZVAL2', 4);
        //     const bitpix = KeywordsManager.getValue(header, 'ZBITPIX', BitPix.Unknown);

        //     const pointerWidth = BitPixUtils.getByteSize(BitPix.Int32);
        //     const pointerTableLength = 2 * rowsCount;
        //     const pointerTableByteLength = pointerTableLength * pointerWidth;
        //     const promises = [
        //         file.getDataAsync(offsetBytes, pointerTableLength, BitPix.Int32),
        //         file.getDataAsync(offsetBytes + pointerTableByteLength, heapSize, BitPix.Uint8)
        //     ];

        //     return Promise.all(promises).then(results => {
        //         const tiles =  CompressedImageReader.convertToTiles(results[0], results[1]);

        //         let uncompressed: TypedArray[] = [];
        //         const tileByteSize = riceBlockSize / 8 * tileLinearSize;
        //          // so tiles occupy one place in memory
        //         const uncompressedBuffer = new ArrayBuffer(tileByteSize * tiles.length);
        //         const bscale = KeywordsManager.getValue(header, 'BSCALE', 1);
        //         const bzero = KeywordsManager.getValue(header, 'BZERO', 0);

        //         if (riceByteWidth === BitPixUtils.getByteSize(BitPix.Int32)) {
        //             uncompressed = tiles.map((tile, index) =>   {
        //                 const out = new Int32Array(uncompressedBuffer, index * tileByteSize, tileLinearSize);
        //                 Rice.fits_rdecomp(tile, out, riceBlockSize);

        //                 let i = tile.length;
        //                 while (i--) {
        //                     out[i] = bscale * out[i] + bzero;
        //                 }

        //                 return out;
        //             });
        //         } else if (riceByteWidth === BitPixUtils.getByteSize(BitPix.Int16)) {
        //             uncompressed = tiles.map((tile, index) =>   {
        //                 const out = new Int16Array(uncompressedBuffer, index * tileByteSize, tileLinearSize);
        //                 Rice.fits_rdecomp_short(tile, out, riceBlockSize);

        //                 let i = tile.length;
        //                 while (i--) {
        //                     out[i] = bscale * out[i] + bzero;
        //                 }
        //                 return out;
        //             });
        //         } else if (riceByteWidth === BitPixUtils.getByteSize(BitPix.Uint8)) {
        //             uncompressed = tiles.map((tile, index) =>   {
        //                 const out = new Uint8Array(uncompressedBuffer, index * tileByteSize, tileLinearSize);
        //                 Rice.fits_rdecomp_byte(tile, out, riceBlockSize);

        //                 let i = tile.length;
        //                 while (i--) {
        //                     out[i] = bscale * out[i] + bzero;
        //                 }

        //                 return out;
        //             });
        //         }

        //         return uncompressed;
        //     });

        // } else {
        //     throw new Error('Compressed image should have one constiable column.');
        // }
    }
}
