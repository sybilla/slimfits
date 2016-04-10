import {IDataReader,IDataSource,IKeyword, ITypedArray,Constants,BitPix,BitPixUtils} from "../Interfaces"
import {KeywordsManager} from "../utils/KeywordsManager";
import {Rice} from "../utils/Rice";
import {ArrayUtils} from "../utils/ArrayUtils";
import {Promise} from 'es6-promise';

export class CompressedImageReader implements IDataReader {
    

    canReadData(header: Array<IKeyword>):boolean {
        return KeywordsManager.hasValueFromList(header, "XTENSION",["BINTABLE","A3DTABLE"]) && 
            KeywordsManager.hasValue(header, "ZIMAGE",true);
    }
    
    readDataSize(header: Array<IKeyword>): number {
        var pCountLength = KeywordsManager.getValue(header, "PCOUNT",0);
        var rowsCount = KeywordsManager.getValue(header, "NAXIS2",0);
        var pointerWidth = BitPixUtils.getByteSize(BitPix.Integer);
        var pointerTableByteLength = 2*rowsCount * pointerWidth;
        return Math.ceil((pCountLength+pointerTableByteLength) / Constants.blockLength) * Constants.blockLength
    }
    
    
    private static convertToTiles(pointers:ITypedArray,compressedData:ITypedArray) : Uint8Array[] {
        var tiles : Array<Uint8Array> = [];
        let rowsCount = pointers.length / 2;
        for (let i = 0;i<rowsCount;i++) {
            tiles.push(new Uint8Array(compressedData.buffer, pointers[2*i+1], pointers[2*i]));
        }
        
        return tiles;
    }
    
    private static riceExtract(compressedTile:ITypedArray, blockSize:number, bytePix:number) : ITypedArray {
        return compressedTile;
    }
    
    readDataAsync (file: IDataSource, offsetBytes:number, header: Array<IKeyword>) {
        var rowsCount = KeywordsManager.getValue(header, "NAXIS2",0);
        var rowLength = KeywordsManager.getValue(header, "NAXIS1",0);
        var fieldsCount = KeywordsManager.getValue(header, "TFIELDS",0);
 
        var rowElementsCount  = 0;
        var regex = new RegExp("\\d{0,}\\D");
            
        var arrayTFORM = new RegExp("([01]{0,1})([PQ])([ABIJKED])\\((\\d+)\\)");
        
        var heapOffset = KeywordsManager.getValue(header, "THEAP",0);
        var heapSize = KeywordsManager.getValue(header, "PCOUNT",0);
        var gCountLength = KeywordsManager.getValue(header, "GCOUNT",0);
        var compressionType = KeywordsManager.getValue(header, "ZCMPTYPE","");
        
        var containsVariableArray = header.filter(k => k.key.indexOf("TFORM") == 0).some(kv => arrayTFORM.test(kv.value));
        
        if (containsVariableArray) {
            var imageInfo = header.filter(k => (k.key.indexOf("TFORM") == 0) && arrayTFORM.test(k.value))[0];
            var result = arrayTFORM.exec(imageInfo.value);
            var pointerFormat = result[2];
            var elementFormat = result[3];
            var count = parseInt(result[4]);
            
            if (pointerFormat !== "P") {        
                throw "Pointer format other than Int32 unsupported";
            }
            
            if (elementFormat !== "B") {        
                throw "Element format other than Byte currently unsupported";
            } 
            
            if (compressionType !== "RICE_1") {        
                throw "Decompression other than Rice is not currently supported";
            } 
            
            var ztiles = header.filter( k => k.key.indexOf("ZTILE") == 0 && (k.key !== "ZTILE"));
            
            var tileLinearSize = ztiles.reduce((x,y) => x * y.value, 1);
            
            var riceBlockSize = KeywordsManager.getValue(header, "ZVAL1",32);
            var riceByteWidth = KeywordsManager.getValue(header, "ZVAL2",4);
            var bitpix = KeywordsManager.getValue(header, "ZBITPIX",BitPix.Unknown);
            
            var pointerWidth = BitPixUtils.getByteSize(BitPix.Integer);
            var pointerTableLength = 2*rowsCount ;
            var pointerTableByteLength = pointerTableLength * pointerWidth;
            var promises = [
                file.getDataAsync(offsetBytes, pointerTableLength, BitPix.Integer), 
                file.getDataAsync(offsetBytes + pointerTableByteLength, heapSize, BitPix.Byte)
            ];
            
            return Promise.all(promises).then(results => {
                var tiles =  CompressedImageReader.convertToTiles(results[0], results[1]);
                
                var uncompressed:ITypedArray[] = [];
                var tileByteSize = riceBlockSize / 8 * tileLinearSize;
                var uncompressedBuffer = new ArrayBuffer(tileByteSize * tiles.length); // so tiles occupy one place in memory


                var bscale = KeywordsManager.getValue(header, "BSCALE",1);
                var bzero = KeywordsManager.getValue(header, "BZERO",0);
                
                if (riceByteWidth == BitPixUtils.getByteSize(BitPix.Integer)) {
                    uncompressed = tiles.map((tile,index) =>   {
                        var out = new Int32Array(uncompressedBuffer, index*tileByteSize, tileLinearSize);
                        Rice.fits_rdecomp(tile,out,riceBlockSize);
                        
                        let i = tile.length;
                        while(i--) {
                            out[i] = bscale*out[i]+bzero;
                        }
                        
                        return out;
                    });
                } else if (riceByteWidth == BitPixUtils.getByteSize(BitPix.Short)) {
                    uncompressed = tiles.map((tile,index) =>   {
                        var out = new Int16Array(uncompressedBuffer, index*tileByteSize, tileLinearSize);
                        Rice.fits_rdecomp_short(tile,out,riceBlockSize);
                        
                        let i = tile.length;
                        while(i--) {
                            out[i] = bscale*out[i]+bzero;
                        }
                        return out;
                    });
                } else if (riceByteWidth == BitPixUtils.getByteSize(BitPix.Byte)) {
                    uncompressed = tiles.map((tile,index) =>   {
                        var out = new Uint8Array(uncompressedBuffer, index*tileByteSize, tileLinearSize);
                        Rice.fits_rdecomp_byte(tile,out,riceBlockSize);
                        
                        let i = tile.length;
                        while(i--) {
                            out[i] = bscale*out[i]+bzero;
                        }
                        
                        return out;
                    });
                }

                return uncompressed;
            });
            
        } else {
            throw "Compressed image should have one variable column.";
        }
    }
}