import {Promise} from 'es6-promise';
import {IDataSource,IHdu,IKeyword,IHeaderResult,DataResult,Constants} from './Interfaces';
import {KeywordsManager,Keyword} from './utils/KeywordsManager';
import {PromiseUtils} from './utils/PromiseUtils';
import {RegisteredDataReaders} from './RegisteredDataReaders';

export class FitsReader {
    public static readFitsAsync(file: IDataSource): Promise<IHdu[]> {
        let hdus:IHdu[] = [];
        let offsetBytes = 0;
        return PromiseUtils.promiseWhile(() => offsetBytes < file.getByteLength(), () => {
            return FitsReader.readHduAsync(file, offsetBytes).then((hdu) => {
                hdus.push(hdu);
                offsetBytes += hdu.bytesRead;
            });
        }).then(() => hdus);
    }

    public static readHeaderAsync(file: IDataSource, offsetBytes:number): Promise<IHeaderResult>  {
        let endLineFound = false;
        let keywords: Array<Keyword> = [];
        let bytesRead = 0;
  
        return PromiseUtils.promiseWhile(() => !endLineFound, () => {
            return file.getStringAsync(offsetBytes+ bytesRead, Constants.blockLength)
            .then((block) => {
                bytesRead += Constants.blockLength;

                for (let j = 0; j < Constants.maxKeywordsInBlock;j++) {
                    let line: string = block.substring(j * Constants.lineLength, (j + 1) * Constants.lineLength);
                    endLineFound = Keyword.isLastLine(line);

                    if (endLineFound) {
                        break;
                    }
                    
                    let kw = KeywordsManager.parseKeyword(line);
                    keywords.push(kw);
                }

                return null;
            });
        }).then(() => {
            return {
                header: keywords,
                bytesRead: bytesRead
            };
        });
    }    
    
    public static readHduAsync(file: IDataSource, offsetBytes:number): Promise<IHdu> { 
        let hdu : IHdu = {
            header: null,
            data: null,
            bytesRead: 0
        };
        
        return FitsReader.readHeaderAsync(file, offsetBytes).then(headerResult => {
            let naxis = KeywordsManager.getValue(headerResult.header, 'NAXIS',0);
            hdu.header = headerResult.header;
            hdu.bytesRead += headerResult.bytesRead;
            hdu.bytesRead += FitsReader.readDataSize(hdu.header); 

            if (naxis !== 0) { // has data
                console.log('has data');
                hdu.data = () => FitsReader.readDataAsync(file, offsetBytes + headerResult.bytesRead, headerResult.header);
            } else {
                hdu.data = null;
            }
             
            return hdu;
        });
    }

    public static readDataAsync(file: IDataSource, offsetBytes: number, header: IKeyword[]): Promise<any> {
        let readers = RegisteredDataReaders.filter(reader => reader.canReadData(header));

        if (readers.length !== 1) {
            console.error('SlimFits was unable to read this file.');
        } else {
            return readers[0].readDataAsync(file, offsetBytes, header).then((data) => new DataResult(data, readers[0].name));   
        }          
    }
    
    public static readDataSize(header:IKeyword[]): number {
        let readers = RegisteredDataReaders.filter(reader => reader.canReadData(header));

        if (readers.length !== 1) {
            console.error('SlimFits was unable to read this file.');
        } else {
            return readers[0].readDataSize(header);   
        }          
    }
}