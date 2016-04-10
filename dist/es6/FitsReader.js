import { Constants } from './Interfaces';
import { KeywordsManager, Keyword } from './utils/KeywordsManager';
import { PromiseUtils } from './utils/PromiseUtils';
import { RegisteredDataReaders } from './RegisteredDataReaders';
export class FitsReader {
    static readFitsAsync(file) {
        let hdus = [];
        let offsetBytes = 0;
        return PromiseUtils.promiseWhile(() => offsetBytes < file.getByteLength(), () => {
            return FitsReader.readHduAsync(file, offsetBytes).then((hdu) => {
                hdus.push(hdu);
                offsetBytes += hdu.bytesRead;
            });
        }).then(() => hdus);
    }
    static readHeaderAsync(file, offsetBytes) {
        let endLineFound = false;
        let keywords = [];
        let bytesRead = 0;
        return PromiseUtils.promiseWhile(() => !endLineFound, () => {
            return file.getStringAsync(offsetBytes + bytesRead, Constants.blockLength)
                .then((block) => {
                bytesRead += Constants.blockLength;
                for (let j = 0; j < Constants.maxKeywordsInBlock; j++) {
                    let line = block.substring(j * Constants.lineLength, (j + 1) * Constants.lineLength);
                    endLineFound = Keyword.isLastLine(line);
                    if (endLineFound) {
                        break;
                    }
                    keywords.push(KeywordsManager.parseKeyword(line));
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
    static readHduAsync(file, offsetBytes) {
        let hdu = {
            header: null,
            data: null,
            bytesRead: 0
        };
        return FitsReader.readHeaderAsync(file, offsetBytes).then(headerResult => {
            let naxis = KeywordsManager.getValue(headerResult.header, 'NAXIS', 0);
            hdu.header = headerResult.header;
            hdu.bytesRead += headerResult.bytesRead;
            if (naxis !== 0) {
                return FitsReader.readDataAsync(file, offsetBytes + headerResult.bytesRead, headerResult.header);
            }
            else {
                return null;
            }
        }).then((data) => {
            hdu.data = data;
            hdu.bytesRead += FitsReader.readDataSize(hdu.header);
            return hdu;
        });
    }
    static readDataAsync(file, offsetBytes, header) {
        let readers = RegisteredDataReaders.filter(reader => reader.canReadData(header));
        if (readers.length !== 1) {
            console.error('SlimFits was unable to read this file.');
        }
        else {
            return readers[0].readDataAsync(file, offsetBytes, header);
        }
    }
    static readDataSize(header) {
        let readers = RegisteredDataReaders.filter(reader => reader.canReadData(header));
        if (readers.length !== 1) {
            console.error('SlimFits was unable to read this file.');
        }
        else {
            return readers[0].readDataSize(header);
        }
    }
}
//# sourceMappingURL=FitsReader.js.map