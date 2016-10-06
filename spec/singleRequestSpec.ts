import * as slimfits from '../dist/cjs/slimfits';
import {expect} from 'chai';
declare var require;
declare var global;

global.XMLHttpRequest = require('xhr2');

var fs = require('fs');

describe("Remote Sources", () => {

    // it("Load a FITS file from NASA repository.", () => {
    //     let src = new slimfits.SingleRequestFile("http://fits.gsfc.nasa.gov/samples/UITfuv2582gc.fits");
    //     return src.initialize()
    //         .then(data => slimfits.FitsReader.readFitsAsync(src))
    //         .then(hdus => {
    //             console.log(hdus.length);

    //             hdus.forEach(hdu => {
    //                 hdu.header.forEach(keyword => {
    //                     console.log(keyword.key + ': ' + keyword.value + ' [' + keyword.comment + ']');
    //                 });
    //             });

    //             expect(src.getByteLength()).is.eql(538560);
    //         });
    // });

    it("Load a local FITS file.", () => {

        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/test.fits'));

        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                console.log('Found ' + hdus.length + ' hdus.');
                let hdu = hdus[0];
                return hdu.data()
                    .then(data => {
                        console.log(data.name);
                        console.log(data.length);
                        console.log(data.BYTES_PER_ELEMENT);
                    });
            });
    });
});