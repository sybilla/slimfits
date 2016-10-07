import * as slimfits from '../dist/cjs/slimfits';
import {expect} from 'chai';
declare var require;
// declare var global;

// global.XMLHttpRequest = require('xhr2');

var fs = require('fs');

describe("SimpleDataReader tests.", () => {

    it("Load a Int8 FITS file.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/simple_int8_2x2.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                return hdus[0].data()
                    .then(result => {
                        let data = result.data;
                        expect(data).to.be.instanceof(Int8Array);
                        expect(data.length).to.be.equal(4);
                        expect(data[0]).to.be.equal(1);
                    });
            });
    });

    it("Load a Uint8 FITS file.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/simple_uint8_2x2.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                return hdus[0].data()
                    .then(result => {
                        let data = result.data;
                        expect(data).to.be.instanceof(Uint8Array);
                        expect(data.length).to.be.equal(4);
                        expect(data[0]).to.be.equal(1);
                    });
            });
    });

    it("Load a Int16 FITS file.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/simple_int16_2x2.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                return hdus[0].data()
                    .then(result => {
                        let data = result.data;
                        expect(data).to.be.instanceof(Int16Array);
                        expect(data.length).to.be.equal(4);
                        expect(data[0]).to.be.equal(1);
                    });
            });
    });

    it("Load a Uint16 FITS file.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/simple_uint16_2x2.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                return hdus[0].data()
                    .then(result => {
                        let data = result.data;
                        expect(data).to.be.instanceof(Uint16Array);
                        expect(data.length).to.be.equal(4);
                        expect(data[0]).to.be.equal(1);
                    });
            });
    });

    it("Load a Int32 FITS file.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/simple_int32_2x2.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                return hdus[0].data()
                    .then(result => {
                        let data = result.data;
                        expect(data).to.be.instanceof(Int32Array);
                        expect(data.length).to.be.equal(4);
                        expect(data[0]).to.be.equal(1);
                    });
            });
    });

    it("Load a Uint32 FITS file.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/simple_uint32_2x2.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                return hdus[0].data()
                    .then(result => {
                        let data = result.data;
                        expect(data).to.be.instanceof(Uint32Array);
                        expect(data.length).to.be.equal(4);
                        expect(data[0]).to.be.equal(1);
                    });
            });
    });

    it("Load a Float32 FITS file.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/simple_float32_2x2.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                return hdus[0].data()
                    .then(result => {
                        let data = result.data;
                        expect(data).to.be.instanceof(Float32Array);
                        expect(data.length).to.be.equal(4);
                        expect(data[0]).to.be.equal(1);
                    });
            });
    });

    it("Load a Float64 FITS file.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/simple_float64_2x2.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                return hdus[0].data()
                    .then(result => {
                        let data = result.data;
                        expect(data).to.be.instanceof(Float64Array);
                        expect(data.length).to.be.equal(4);
                        expect(data[0]).to.be.equal(1);
                    });
            });
    });
});