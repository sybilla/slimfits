import * as slimfits from '../dist/cjs/slimfits';
import {expect} from 'chai';
declare var require;
declare var global;

global.XMLHttpRequest = require('xhr2');

var fs = require('fs');

describe("Loading FITS files.", () => {

    it("Load a FITS file from NASA repository.", () => {
        let src = new slimfits.SingleRequestFile("http://fits.gsfc.nasa.gov/samples/UITfuv2582gc.fits");
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(src.getByteLength()).is.eql(538560);
            });
    });

    it("Load a local FITS file.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/test.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                return hdus[0].data()
                    .then(result => {
                        expect(result.data).to.be.instanceof(Uint16Array);
                    });
            });
    });
});