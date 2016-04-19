import {IDataReader,IDataSource,IKeyword,Constants,BitPix,BitPixUtils} from "../Interfaces"
import {KeywordsManager} from "../utils/KeywordsManager";
import {ArrayUtils} from "../utils/ArrayUtils";
import {Promise} from 'es6-promise';

export class BinaryTableDataReader implements IDataReader {
    get name() {
        return "binary table data";
    }
    
    public canReadData(header: Array<IKeyword>):boolean {
        return KeywordsManager.hasValueFromList(header, "XTENSION",["BINTABLE","A3DTABLE"]) && 
            !KeywordsManager.hasValue(header, "ZIMAGE",true);
    }
    
    public readDataSize(header: Array<IKeyword>) {
        var rowsCount = KeywordsManager.getValue(header, "NAXIS2",1);
        var rowByteLength = KeywordsManager.getValue(header, "NAXIS1",1);
        return Math.ceil(rowByteLength * rowsCount / Constants.blockLength) * Constants.blockLength;
    }

    private readColumn(source:ArrayBuffer, rows : number, rowByteWidth:number, rowByteOffset:number, width:number, format:string) {
        if (width == 0) {
            return [];
        }
        var dataType = format == "A" ? BitPix.Byte: BitPixUtils.getBitPixForLetter(format);
        var buffer = new ArrayBuffer(BitPixUtils.getByteSize(dataType) * rows * width); 
        ArrayUtils.pluckColumn(source, buffer, rows, rowByteWidth, rowByteOffset, width, dataType,true);
        var chunks = ArrayUtils.chunk(buffer,dataType,width);
        return format == "A" ? chunks.map(x => String.fromCharCode.apply(null, x)) : chunks;
    }
    
    public readDataAsync (file: IDataSource, offsetBytes:number, header: Array<IKeyword>) {
        var rowsCount = KeywordsManager.getValue(header, "NAXIS2",0);    
        var rowByteLength = KeywordsManager.getValue(header, "NAXIS1",0);    
        
        var rowByteOffset = 0;
        var isValidTFORM = new RegExp("\\d+\\w");
        var converters =  header.filter(k=>k.key.indexOf("TFORM") === 0 && isValidTFORM.test(k.value)).map(k => {
            var format = k.value.substr(k.value.length - 1, 1);
            var count = parseInt(k.value.substr(0, k.value.length - 1));
            var byteOffset = rowByteOffset;
            var dataType = format == "A" ? BitPix.Byte: BitPixUtils.getBitPixForLetter(format);
            rowByteOffset += count * BitPixUtils.getByteSize(dataType);
            return {format:format, count:count, byteOffset:byteOffset};
        });
            
        return file.getDataAsync(offsetBytes, rowsCount*rowByteLength, BitPix.Byte).then(data => {
            return converters.map(conv => {
                return this.readColumn(data.buffer, rowsCount, rowByteLength, conv.byteOffset, conv.count, conv.format);
            });
        })
    }
}