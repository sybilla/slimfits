import {FitsReader, ArrayBufferFile, SingleRequestFile} from '../index';
import * as fs from 'mz/fs';

// test('Load a KMT FITS file.', () => {
//     const src = new ArrayBufferFile(fs.readFileSync('E:\\data\\fits\\COAST_OSL_00_J289288_00_Luminance60_00_2017_3_16_02_52_24_features.fits').buffer);
//     return src.initialize()
//         .then(_ => FitsReader.readFitsAsync(src))
//         .then(hdus => {
//             return hdus[1].data()
//                 .then(result => {
//                     const data = result.data;
//                     expect(data).toBeInstanceOf(Float32Array);
//                     expect(data.length).toEqual(9216*9228);
//                     expect(Math.abs(data[0] - 55.6897) < 0.0001).toBeTruthy();
//                     expect(Math.abs(data[1] - 59.5929) < 0.0001).toBeTruthy();
//                     expect(Math.abs(data[9215] - 58.6151) < 0.0001).toBeTruthy();
//                     expect(Math.abs(data[1*9216 + 9215] - 65.5991) < 0.0001).toBeTruthy();
//                     expect(Math.abs(data[9216*9228-1] - 51.9252) < 0.0001).toBeTruthy();
//                 });
//         });
// });

// test('Load a KMT FITS file.', () => {
//     const src = new ArrayBufferFile(fs.readFileSync('E:\\data\\fits\\KMTNET_20151202_T191314_3762_01_V_red.fits.fz').buffer);
//     return src.initialize()
//         .then(_ => FitsReader.readFitsAsync(src))
//         .then(hdus => {
//             return hdus[1].data()
//                 .then(result => {
//                     const data = result.data;
//                     expect(data).toBeInstanceOf(Float32Array);
//                     expect(data.length).toEqual(9216*9228);
//                     expect(Math.abs(data[0] - 55.6897) < 0.0001).toBeTruthy();
//                     expect(Math.abs(data[1] - 59.5929) < 0.0001).toBeTruthy();
//                     expect(Math.abs(data[9215] - 58.6151) < 0.0001).toBeTruthy();
//                     expect(Math.abs(data[1*9216 + 9215] - 65.5991) < 0.0001).toBeTruthy();
//                     expect(Math.abs(data[9216*9228-1] - 51.9252) < 0.0001).toBeTruthy();
//                 });
//         });
// });

// test('Load a float FITS file.', () => {
//     const src = new ArrayBufferFile(fs.readFileSync('data/test_fits_float.fits.fz').buffer);
//     return src.initialize()
//         .then(_ => FitsReader.readFitsAsync(src))
//         .then(hdus => {
//             return hdus[1].data()
//                 .then(result => {
//                     const data = result.data;
//                     expect(data).toBeInstanceOf(Float32Array);
//                     for (var i =0;i < 1024;i++) {
//                         expect(data[1024*i]).toEqual(1024*i);
//                         expect(data[1024*i + 512]).toEqual(1024*i + 512);
//                         expect(data[1024*i + 1023]).toEqual(1024*i + 1023);
//                     }
//                     expect(data.length).toEqual(1024*1024);
//                 });
//         });
// });

// test('Load a float FITS file.', () => {
//     const src = new ArrayBufferFile(fs.readFileSync('data/test_fits_double.fits.fz').buffer);
//     return src.initialize()
//         .then(_ => FitsReader.readFitsAsync(src))
//         .then(hdus => {
//             return hdus[1].data()
//                 .then(result => {
//                     const data = result.data;
//                     expect(data).toBeInstanceOf(Float64Array);
//                     for (var i =0;i < 1024;i++) {
//                         expect(data[1024*i]).toEqual(1024*i);
//                         expect(data[1024*i + 512]).toEqual(1024*i + 512);
//                         expect(data[1024*i + 1023]).toEqual(1024*i + 1023);
//                     }
//                     expect(data.length).toEqual(1024*1024);
//                 });
//         });
// });

// test('Load a byte FITS file.', () => {
//     const src = new ArrayBufferFile(fs.readFileSync('data/test_fits_byte.fits.fz').buffer);
//     return src.initialize()
//         .then(_ => FitsReader.readFitsAsync(src))
//         .then(hdus => {
//             return hdus[1].data()
//                 .then(result => {
//                     const data = result.data;
//                     expect(data).toBeInstanceOf(Uint8Array);
//                     for (var i =0;i < 256;i++) {
//                         expect(data[256*i]).toEqual((i - 1 + 256) % 256);
//                         expect(data[256*i + 128]).toEqual((i - 1 + 256) % 256);
//                         expect(data[256*i + 255]).toEqual((i - 1 + 256) % 256);
//                     }
//                     expect(data.length).toEqual(256*256);
//                 });
//         });
// });

// test('Load a short FITS file.', () => {
//     const src = new ArrayBufferFile(fs.readFileSync('data/test_fits_short.fits.fz').buffer);
//     return src.initialize()
//         .then(_ => FitsReader.readFitsAsync(src))
//         .then(hdus => {
//             return hdus[1].data()
//                 .then(result => {
//                     const data = result.data;
//                     expect(data).toBeInstanceOf(Int16Array);
//                     for (var i =0;i < 1024;i++) {
//                         expect(data[1024*i]).toEqual(i - 512);
//                         expect(data[1024*i + 512]).toEqual(i - 512);
//                         expect(data[1024*i + 1023]).toEqual(i - 512);
//                     }
//                     expect(data.length).toEqual(1024*1024);
//                 });
//         });
// });

// test('Load a int FITS file.', () => {
//     const src = new ArrayBufferFile(fs.readFileSync('data/test_fits_int.fits.fz').buffer);
//     return src.initialize()
//         .then(_ => FitsReader.readFitsAsync(src))
//         .then(hdus => {
//             return hdus[1].data()
//                 .then(result => {
//                     const data = result.data;
//                     expect(data).toBeInstanceOf(Int32Array);
//                     for (var i =0;i < 1024;i++) {
//                         expect(data[1024*i]).toEqual(i - 512);
//                         expect(data[1024*i + 512]).toEqual(i - 512);
//                         expect(data[1024*i + 1023]).toEqual(i - 512);
//                     }
//                     expect(data.length).toEqual(1024*1024);
//                 });
//         });
// });

// test('Load a ushort FITS file.', () => {
//     const src = new ArrayBufferFile(fs.readFileSync('data/test_fits_ushort.fits.fz').buffer);
//     return src.initialize()
//         .then(_ => FitsReader.readFitsAsync(src))
//         .then(hdus => {
//             return hdus[1].data()
//                 .then(result => {
//                     const data = result.data;
//                     expect(data).toBeInstanceOf(Uint16Array);
//                     for (var i =0;i < 1024;i++) {
//                         expect(data[1024*i]).toEqual(i);
//                         expect(data[1024*i + 512]).toEqual(i);
//                         expect(data[1024*i + 1023]).toEqual(i);
//                     }
//                     expect(data.length).toEqual(1024*1024);
//                 });
//         });
// });


// test('Load a uint FITS file.', () => {
//     const src = new ArrayBufferFile(fs.readFileSync('data/test_fits_uint.fits.fz').buffer);
//     return src.initialize()
//         .then(_ => FitsReader.readFitsAsync(src))
//         .then(hdus => {
//             return hdus[1].data()
//                 .then(result => {
//                     const data = result.data;
//                     expect(data).toBeInstanceOf(Uint32Array);
//                     for (var i =0;i < 1024;i++) {
//                         expect(data[1024*i]).toEqual(i);
//                         expect(data[1024*i + 512]).toEqual(i);
//                         expect(data[1024*i + 1023]).toEqual(i);
//                     }
//                     expect(data.length).toEqual(1024*1024);
//                 });
//         });
// });