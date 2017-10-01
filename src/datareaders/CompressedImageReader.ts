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
                const ztiles = header.filter( k => k.key.indexOf('ZTILE') === 0 && (k.key !== 'ZTILE'));

                const tileLinearSize = ztiles.reduce((x, y) => x * y.value, 1);
                const tiles = result.filter( column => column.name = "COMPRESSED_DATA").map(x=>x.data as Uint8Array[])[0];

                if (!tiles) {
                    throw new Error("COMPRESSED_DATA not found");
                }

                let uncompressed: Array<Int32Array|Int16Array|Uint8Array> = [];
                const tileByteSize = riceByteWidth * tileLinearSize;
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
                
                const bitpix = KeywordsManager.getValue(header, 'ZBITPIX', BitPix.Unknown) as BitPix;
                const bscale = KeywordsManager.getValue(header, 'BSCALE', 1);
                const bzero = KeywordsManager.getValue(header, 'BZERO', 0) as number;

                switch (bitpix) {
                    case BitPix.Uint8:
                        return CompressedImageReader.ConvertByte(uncompressedBuffer, bzero, bscale);
                    case BitPix.Int16:
                        return CompressedImageReader.ConvertShort(uncompressedBuffer, bzero, bscale);
                    case BitPix.Int32:
                        return CompressedImageReader.ConvertInt(uncompressedBuffer, bzero, bscale);
                    case BitPix.Float32:
                        return CompressedImageReader.ConvertFloat(uncompressedBuffer, header);
                    case BitPix.Float64:
                        return CompressedImageReader.ConvertDouble(uncompressedBuffer, header);
                    default:
                        throw new Error("Unknow bitpix");
                }
        });
        
    }

    private static ConvertByte(buffer: ArrayBuffer, bzero: number, bscale:number): TypedArray {
        return new Uint8Array(buffer);
    }

    private static ConvertShort(buffer: ArrayBuffer, bzero: number, bscale:number): TypedArray {
        if ((bscale == 1) && (bzero == 0)) {
            return new Int16Array(buffer);
        } else if ((bscale == 1) && (bzero == 32768)) {
            const src = new Int16Array(buffer);
            const dest = new Uint16Array(buffer);
            for (var i = 0;i<src.length;i++) {
                dest[i] = bscale * src[i] + bzero;
            }
            return dest;
        } else {
            const data = new Int16Array(buffer);
            for (var i = 0;i<data.length;i++) {
                data[i] = bscale * data[i] + bzero;
            }
            return data;
        }
    }

    private static ConvertInt(buffer: ArrayBuffer, bzero: number, bscale:number): TypedArray {
        if ((bscale == 1) && (bzero == 0)) {
            return new Int32Array(buffer);
            
        } else if ((bscale == 1) && (bzero == 2147483648)) {
            const src = new Int32Array(buffer);
            const dest = new Uint32Array(buffer);
        
            for (var i = 0;i<src.length;i++) {
                dest[i] = bscale * src[i] + bzero;
            }

            return dest;
        } else {
            const data = new Int32Array(buffer);
            for (var i = 0;i<data.length;i++) {
                data[i] = bscale * data[i] + bzero;
            }
            return data;
        }
    }

    private static ConvertFloat(buffer: ArrayBuffer, header:IKeyword[]): TypedArray {
        const quantiz = KeywordsManager.getValue(header, 'ZQUANTIZ', "NO_DITHER");
        const ditherSeed = KeywordsManager.getValue(header, 'ZDITHER0', 0);
        const riceByteWidth = KeywordsManager.getValue(header, 'ZVAL2', 4);

    }

    private static ConvertDouble(buffer: ArrayBuffer, header:IKeyword[]): TypedArray {
        const quantiz = KeywordsManager.getValue(header, 'ZQUANTIZ', "NO_DITHER");
        const ditherSeed = KeywordsManager.getValue(header, 'ZDITHER0', 0);
        const riceByteWidth = KeywordsManager.getValue(header, 'ZVAL2', 4);
        
    }
}
