import {IDataReader, IDataSource, IKeyword, TypedArray, Constants, BitPix, BitPixUtils} from '../Interfaces';
import {KeywordsManager} from '../utils/KeywordsManager';
import {ArrayUtils} from '../utils/ArrayUtils';
import {Rice} from '../utils/Rice';
import {BinaryTableDataReader} from './BinaryTableDataReader';
import {inflate} from 'pako';

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
                const bitpix = KeywordsManager.getValue(header, 'ZBITPIX', BitPix.Unknown) as BitPix;

                const tileLinearSize = ztiles.reduce((x, y) => x * y.value, 1);
                const tileByteSize = BitPixUtils.getByteSize(bitpix) * tileLinearSize;

                const tiles = result
                    .filter( column => (column.name == "COMPRESSED_DATA") )
                    .map(x=>x.data as Uint8Array[])[0];

                const uncompressedBuffer = new ArrayBuffer(tileByteSize * tiles.length);

                // floats may be sometimes gzip compressed even though they were explicitly asked to
                // be RICE compressed ¯\_(ツ)_/¯
                if (((bitpix == BitPix.Float32) || (bitpix == BitPix.Float64))
                        && result.some( column => column.name == "GZIP_COMPRESSED_DATA" )){
                    const gzip_tiles = result.filter( column => column.name == "GZIP_COMPRESSED_DATA" )[0];

                    var bytesPerElement = BitPixUtils.getByteSize(bitpix);
                    gzip_tiles.data.forEach((tile,i) => {
                        const inflated_tile = inflate(tile as Uint8Array);
                        ArrayUtils.copy(
                            inflated_tile.buffer, 
                            uncompressedBuffer,
                            0,
                            tileLinearSize,
                            bitpix, 
                            true, 
                            i * tileByteSize);
                    });

                    if (bitpix == BitPix.Float32) {
                        const result = new Float32Array(uncompressedBuffer);
                        return result;
                    } else {
                        const result = new Float64Array(uncompressedBuffer);
                        return result;
                    }
                }

                if (!tiles) {
                    throw new Error("COMPRESSED_DATA not found");
                }

                let uncompressed: Array<Int32Array|Int16Array|Uint8Array> = [];
                 // so tiles occupy one place in memory
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
                const bzero = KeywordsManager.getValue(header, 'BZERO', 0) as number;

                var zscale = result.filter( column => column.name == "ZSCALE" )[0];
                var zzero = result.filter( column => column.name == "ZZERO" )[0];

                switch (bitpix) {
                    case BitPix.Uint8:
                        return CompressedImageReader.convertByte(uncompressedBuffer, bzero, bscale);
                    case BitPix.Int16:
                        return CompressedImageReader.convertShort(uncompressedBuffer, bzero, bscale);
                    case BitPix.Int32:
                        return CompressedImageReader.convertInt(uncompressedBuffer, bzero, bscale);
                    case BitPix.Float32:
                        return CompressedImageReader.convertFloat(uncompressed, zscale.data, zzero.data,  header);
                    case BitPix.Float64:
                        return CompressedImageReader.convertDouble(uncompressed, zscale.data, zzero.data,  header);
                    default:
                        throw new Error("Unknow bitpix");
                }
        });
        
    }

    private static convertByte(buffer: ArrayBuffer, bzero: number, bscale:number): TypedArray {
        return new Uint8Array(buffer);
    }

    private static convertShort(buffer: ArrayBuffer, bzero: number, bscale:number): TypedArray {
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

    private static convertInt(buffer: ArrayBuffer, bzero: number, bscale:number): TypedArray {
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

    private static convertFloat(tiles: TypedArray[], zscale: TypedArray[], zzero: TypedArray[], header:IKeyword[]): TypedArray {
        const quantiz = KeywordsManager.getValue(header, 'ZQUANTIZ', "NO_DITHER");
        const output = new Float32Array(tiles.length * tiles[0].length);
        if (quantiz == "NO_DITHER") {
            tiles.forEach((tile, tileNum)=> {
                const output_tile = new Float32Array(output.buffer,tileNum * tile.length * 4,  tile.length);
                
                const zscale_value = zscale[tileNum][0];
                const zzero_value = zzero[tileNum][0];

                for (var i =0;i<tile.length;i++) {
                    output_tile[i] = tile[i] * zscale_value + zzero_value;
                }
            });
        } else if (quantiz == "SUBTRACTIVE_DITHER_1") {
            var rn = CompressedImageReader.initRandoms();
            const zdither0 = KeywordsManager.getValue(header, 'ZDITHER0', 0);
        
            tiles.forEach((tile, tileNum)=> {
                let i0 = (tileNum - 1 + zdither0) % 10000;
                let i1  = parseInt(rn[i0] * 500 as any);
                const output_tile = new Float32Array(output.buffer,tileNum * tile.length * 4,  tile.length);
                const zscale_value = zscale[tileNum][0];
                const zzero_value = zzero[tileNum][0];
                for (var i =0;i<tile.length;i++) {
                    output_tile[i] = (tile[i] - rn[i1] + 0.5) * zscale_value + zzero_value;
                    i1++;
                    if (i1  == 10000) {
                        i0 = (i0 + 1) % 10000
                        i1  = parseInt(rn[i0] * 500 as any);
                    }
                }
            });
        } else {
            throw new Error("ZQUANTIZ unrecognized type");
        }

        return output
    }

    private static convertDouble(tiles: TypedArray[], zscale: TypedArray[], zzero: TypedArray[], header:IKeyword[]): TypedArray {
        const quantiz = KeywordsManager.getValue(header, 'ZQUANTIZ', "NO_DITHER");
        
        const output = new Float64Array(tiles.length * tiles[0].length);
        if (quantiz == "NO_DITHER") {
            tiles.forEach((tile, tileNum)=> {
                const output_tile = new Float64Array(output.buffer,tileNum * tile.length * 8,  tile.length);
                
                const zscale_value = zscale[tileNum][0];
                const zzero_value = zzero[tileNum][0];

                for (var i =0;i<tile.length;i++) {
                    output_tile[i] = tile[i] * zscale_value + zzero_value;
                }
            });
        } else if (quantiz == "SUBTRACTIVE_DITHER_1") {
            var rn = CompressedImageReader.initRandoms();
            const zdither0 = KeywordsManager.getValue(header, 'ZDITHER0', 0);
            tiles.forEach((tile, tileNum)=> {
                let i0 = (tileNum - 1 + zdither0) % 10000;
                let i1  = parseInt(rn[i0] * 500 as any);
                const output_tile = new Float64Array(output.buffer,tileNum * tile.length * 8,  tile.length);
                const zscale_value = zscale[tileNum][0];
                const zzero_value = zzero[tileNum][0];
                for (var i =0;i<tile.length;i++) {
                    output_tile[i] = (tile[i] - rn[i1] + 0.5) * zscale_value + zzero_value;
                    i1++;
                    if (i1  == 10000) {
                        i0 = (i0 + 1) % 10000
                        i1  = parseInt(rn[i0] * 500 as any);
                    }
                }
            });
        } else {
            throw new Error("ZQUANTIZ unrecognized type");
        }

        return output
    }

    private static initRandoms() {
        const a = 16807;
        const m = 2147483647;
        let seed = 1;
        
        const random = new Float32Array(10000)
        
        for (var i = 0;i<random.length;i++){
            const temp = a * seed;
            seed = temp - m * parseInt((temp / m) as any);
            random[i] = seed / m;
        }
          
        return random
    }
}
