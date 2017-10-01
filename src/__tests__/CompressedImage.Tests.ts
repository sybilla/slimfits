import {FitsReader, ArrayBufferFile, SingleRequestFile} from '../index';
import * as fs from 'mz/fs';

test('Load a Uint8 FITS file.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('E:\\Data\\fits\\KMTNET_20151202_T191314_3762_01_V_red.fits.fz').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            return hdus[1].data()
                .then(result => {
                    const data = result.data;
                    expect(data).toBeInstanceOf(Uint8Array);
                    expect(data.length).toEqual(4);
                    expect(data[0]).toEqual(1);
                });
        });
});
