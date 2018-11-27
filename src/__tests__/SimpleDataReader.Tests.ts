import { FitsReader, ArrayBufferFile, SingleRequestFile, BlobFile } from '../index';
import * as fs from 'mz/fs';

// test('Load a Int8 FITS file.', () => {
//     const src = new SingleRequestFile('https://fits.gsfc.nasa.gov/samples/FOCx38i0101t_c0f.fits');
//     return src.initialize()
//         .then(_ => FitsReader.readFitsAsync(src))
//         .then(hdus => {
//             expect(hdus.length).toEqual(2);
//         });
// });

test('Load a Uint8 FITS file.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('data/simple_uint8_2x2.fits').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            expect(hdus.length).toEqual(1);
            return hdus[0].data()
                .then(result => {
                    const data = result.data;
                    expect(data).toBeInstanceOf(Uint8Array);
                    expect(data.length).toEqual(4);
                    expect(data[0]).toEqual(1);
                });
        });
});

test('Load a Int16 FITS file.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('data/simple_int16_2x2.fits').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            expect(hdus.length).toEqual(1);
            return hdus[0].data()
                .then(result => {
                    const data = result.data;
                    expect(data).toBeInstanceOf(Int16Array);
                    expect(data.length).toEqual(4);
                    expect(data[0]).toEqual(1);
                });
        });
});

test('Load a Uint16 FITS file.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('data/simple_uint16_2x2.fits').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            expect(hdus.length).toEqual(1);
            return hdus[0].data()
                .then(result => {
                    const data = result.data;
                    expect(data).toBeInstanceOf(Uint16Array);
                    expect(data.length).toEqual(4);
                    expect(data[0]).toEqual(1);
                });
        });
});

test('Load a Int32 FITS file.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('data/simple_int32_2x2.fits').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            expect(hdus.length).toEqual(1);
            return hdus[0].data()
                .then(result => {
                    const data = result.data;
                    expect(data).toBeInstanceOf(Int32Array);
                    expect(data.length).toEqual(4);
                    expect(data[0]).toEqual(1);
                });
        });
});

test('Load a Uint32 FITS file.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('data/simple_uint32_2x2.fits').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            expect(hdus.length).toEqual(1);
            return hdus[0].data()
                .then(result => {
                    const data = result.data;
                    expect(data).toBeInstanceOf(Uint32Array);
                    expect(data.length).toEqual(4);
                    expect(data[0]).toEqual(1);
                });
        });
});

test('Load a Float32 FITS file.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('data/simple_float32_2x2.fits').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            expect(hdus.length).toEqual(1);
            return hdus[0].data()
                .then(result => {
                    const data = result.data;
                    expect(data).toBeInstanceOf(Float32Array);
                    expect(data.length).toEqual(4);
                    expect(data[0]).toEqual(1);
                });
        });
});

test('Load a Float64 FITS file.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('data/simple_float64_2x2.fits').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            expect(hdus.length).toEqual(1);
            return hdus[0].data()
                .then(result => {
                    const data = result.data;
                    expect(data).toBeInstanceOf(Float64Array);
                    expect(data.length).toEqual(4);
                    expect(data[0]).toEqual(1);
                });
        });
});

test('Load a Float64 FITS file as a BlobFile.', () => {
    const parts = fs.readFileSync('data/simple_float64_2x2.fits').buffer;
    const f = new File([parts as ArrayBuffer], 'simple_float64_2x2.fits');

    const src = new BlobFile(f);

    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            expect(hdus.length).toEqual(1);
            return hdus[0].data()
                .then(result => {
                    const data = result.data;
                    expect(data).toBeInstanceOf(Float64Array);
                    expect(data.length).toEqual(4);
                    expect(data[0]).toEqual(1);
                });
        });
});

test('Load a Float64 FITS file as a BlobFile and read header', () => {
    const parts = fs.readFileSync('data/simple_float64_2x2.fits').buffer;
    const f = new File([parts as ArrayBuffer], 'simple_float64_2x2.fits');

    const src = new BlobFile(f);

    return src.initialize()
        .then(_ => FitsReader.readHeaderAsync(src, 0))
        .then(keywords => {
            expect(keywords.header.length).toEqual(5);
            return true;
        });
});
