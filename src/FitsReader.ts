import { IDataSource, IHdu, IKeyword, IHeaderResult, DataResult, Constants } from './interfaces';
import { KeywordsManager, Keyword } from './utils/KeywordsManager';
import { PromiseUtils } from './utils/PromiseUtils';
import { RegisteredDataReaders } from './RegisteredDataReaders';

export class FitsReader {
    public static readFitsAsync(file: IDataSource): Promise<IHdu[]> {
        const hdus: IHdu[] = [];
        let offsetBytes = 0;
        return PromiseUtils.promiseWhile(() => offsetBytes < file.getByteLength(), () => {
            return FitsReader.readHduAsync(file, offsetBytes).then((hdu) => {
                hdus.push(hdu);
                offsetBytes += hdu.bytesRead;
            });
        }).then(() => hdus);
    }

    public static readHeaderAsync(file: IDataSource, offsetBytes: number) {
        let endLineFound = false;
        const keywords: Keyword[] = [];
        let bytesRead = 0;

        return PromiseUtils.promiseWhile(() => !endLineFound, () => {
            return file.getStringAsync(offsetBytes + bytesRead, Constants.blockLength)
                .then((block) => {
                    bytesRead += Constants.blockLength;
                    for (let j = 0; j < Constants.maxKeywordsInBlock; j++) {
                        const line: string = block.substring(j * Constants.lineLength, (j + 1) * Constants.lineLength);
                        endLineFound = Keyword.isLastLine(line);

                        if (endLineFound) {
                            break;
                        }

                        const kw = KeywordsManager.parseKeyword(line);
                        keywords.push(kw);
                    }

                    return null;
                });
        }).then(() => {
            return {
                header: keywords,
                bytesRead
            };
        });
    }

    public static readHduAsync(file: IDataSource, offsetBytes: number): Promise<IHdu> {
        return FitsReader.readHeaderAsync(file, offsetBytes).then(headerResult => {
            const naxis = KeywordsManager.getValue(headerResult.header, 'NAXIS', 0);
            const hdu: IHdu = {
                header: headerResult.header,
                data: () => new Promise((resolve) => {
                    resolve();
                }),
                bytesRead: 0
            };

            hdu.bytesRead += headerResult.bytesRead;
            hdu.bytesRead += FitsReader.readDataSize(hdu.header);

            if (naxis !== 0) { // has data
                const offset = offsetBytes + headerResult.bytesRead;
                hdu.data = () => FitsReader.readDataAsync(file, offset, headerResult.header);
            }

            return hdu;
        });
    }

    public static readDataAsync(file: IDataSource, offsetBytes: number, header: IKeyword[]) {
        const readers = RegisteredDataReaders.filter(reader => reader.canReadData(header));

        if (readers.length !== 1) {
            throw new Error('SlimFits was unable to read this file.');
        } else {
            return readers[0].readDataAsync(file, offsetBytes, header)
                .then((data) => new DataResult(data, readers[0].name));
        }
    }

    public static readDataSize(header: IKeyword[]) {
        const readers = RegisteredDataReaders.filter(reader => reader.canReadData(header));
        if (readers.length !== 1) {
            throw new Error('SlimFits was unable to read this file.');
        } else {
            return readers[0].readDataSize(header);
        }
    }
}
