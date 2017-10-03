import {FitsReader, ArrayBufferFile, SingleRequestFile} from '../index';
import * as fs from 'mz/fs';

test('Load a float FITS file.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('data/test_fits_bintable.fits').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            expect(hdus).toHaveLength(2);
        });
});