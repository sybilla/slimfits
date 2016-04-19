import {IDataReader,IDataSource,IKeyword,ITypedArray,Constants, BitPix,BitPixUtils} from "../Interfaces"
import {KeywordsManager} from "../utils/KeywordsManager";
import {Promise} from 'es6-promise';

export class SimpleDataReader implements IDataReader {
    get name() {
        return "simple data";
    }
    
    public canReadData (header:Array<IKeyword>):boolean {
        return (KeywordsManager.hasValue(header, "SIMPLE",true) || KeywordsManager.hasValue(header, "XTENSION","IMAGE")) 
            && !KeywordsManager.hasValue(header, "GROUPS",true);
    }
    
    public readDataSize( header: Array<IKeyword>): number {
        var elementType = KeywordsManager.getValue(header, "BITPIX", BitPix.Unknown);
        var elementTypeSize = BitPixUtils.getByteSize(elementType);
            if (KeywordsManager.hasValue(header, "NAXIS",0)) {
                return 0;
            }
        var length = header.filter( k => k.key.indexOf('NAXIS') === 0 && k.key !== 'NAXIS').reduce((prev,cur) => prev * cur.value, 1);
        return Math.ceil(elementTypeSize * length / Constants.blockLength) * Constants.blockLength;
    }
    
    public readDataAsync (file: IDataSource, offsetBytes:number, header: Array<IKeyword>, changeEndian: boolean = true) : Promise<ITypedArray> {
        var dataType = KeywordsManager.getValue(header, "BITPIX", BitPix.Unknown);
        var naxisKeywords = header.filter(k => k.key.indexOf("NAXIS", 0) === 0 && k.key !== "NAXIS");
        var length = naxisKeywords.map(k => k.value).reduce((a, b) => a * b, 1); 
        
        var bscale = KeywordsManager.getValue(header, "BSCALE",1);
        var bzero = KeywordsManager.getValue(header, "BZERO",0);

        if (naxisKeywords.length > 0 && length !== 0) {
            var promise = file.getDataAsync(offsetBytes, length, dataType, changeEndian);
            if (bscale !== 1 || bzero !== 0) {
                return promise.then(data => {
                    for (var i = 0; i < data.length; i++) {
                        data[i] = data[i] * bscale + bzero;
                    }
                    
                    return data;
                });
            } else {
                return promise;
            }
        } else {
            var arr: ITypedArray = null;
            return Promise.resolve<ITypedArray>(arr);
        }
    }
}