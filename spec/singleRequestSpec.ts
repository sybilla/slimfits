import * as slimfits from '../dist/cjs/slimfits';
import {expect} from 'chai';
declare var require;
declare var global;
global.XMLHttpRequest = require('xhr2');

describe("Basic", () => {
    it("Basic stuff", () => {
        let src = new slimfits.SingleRequestFile("http://fits.gsfc.nasa.gov/samples/UITfuv2582gc.fits");
        return src.initialize().then(() => {
            expect(src.getByteLength()).is.eql(538560);                 
        })
    });
});
