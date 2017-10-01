import {FitsReader, ArrayBufferFile, SingleRequestFile} from '../index';
import * as fs from 'mz/fs';

test('Load a byte FITS file.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('data/test_fits_byte.fits.fz').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            return hdus[1].data()
                .then(result => {
                    const data = result.data;
                    expect(data).toBeInstanceOf(Uint8Array);
                    for (var i =0;i < 256;i++) {
                        expect(data[256*i]).toEqual((i - 1 + 256) % 256);
                        expect(data[256*i + 128]).toEqual((i - 1 + 256) % 256);
                        expect(data[256*i + 255]).toEqual((i - 1 + 256) % 256);
                    }
                    expect(data.length).toEqual(256*256);
                });
        });
});

test('Load a short FITS file.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('data/test_fits_short.fits.fz').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            return hdus[1].data()
                .then(result => {
                    const data = result.data;
                    expect(data).toBeInstanceOf(Int16Array);
                    for (var i =0;i < 1024;i++) {
                        expect(data[1024*i]).toEqual(i - 512);
                        expect(data[1024*i + 512]).toEqual(i - 512);
                        expect(data[1024*i + 1023]).toEqual(i - 512);
                    }
                    expect(data.length).toEqual(1024*1024);
                });
        });
});

test('Load a int FITS file.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('data/test_fits_int.fits.fz').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            return hdus[1].data()
                .then(result => {
                    const data = result.data;
                    expect(data).toBeInstanceOf(Int32Array);
                    for (var i =0;i < 1024;i++) {
                        expect(data[1024*i]).toEqual(i - 512);
                        expect(data[1024*i + 512]).toEqual(i - 512);
                        expect(data[1024*i + 1023]).toEqual(i - 512);
                    }
                    expect(data.length).toEqual(1024*1024);
                });
        });
});

test('Load a ushort FITS file.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('data/test_fits_ushort.fits.fz').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            return hdus[1].data()
                .then(result => {
                    const data = result.data;
                    expect(data).toBeInstanceOf(Uint16Array);
                    for (var i =0;i < 1024;i++) {
                        expect(data[1024*i]).toEqual(i);
                        expect(data[1024*i + 512]).toEqual(i);
                        expect(data[1024*i + 1023]).toEqual(i);
                    }
                    expect(data.length).toEqual(1024*1024);
                });
        });
});


test('Load a uint FITS file.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('data/test_fits_uint.fits.fz').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            return hdus[1].data()
                .then(result => {
                    const data = result.data;
                    expect(data).toBeInstanceOf(Uint32Array);
                    for (var i =0;i < 1024;i++) {
                        expect(data[1024*i]).toEqual(i);
                        expect(data[1024*i + 512]).toEqual(i);
                        expect(data[1024*i + 1023]).toEqual(i);
                    }
                    expect(data.length).toEqual(1024*1024);
                });
        });
});