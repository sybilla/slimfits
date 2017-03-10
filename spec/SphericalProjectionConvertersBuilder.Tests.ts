import * as slimfits from '../dist/cjs/slimfits';
import {expect} from 'chai';
declare var require;
// declare var global;

// global.XMLHttpRequest = require('xhr2');

var fs = require('fs');

describe("SphericalProjectionConvertersBuilder tests.", () => {

    it("ZenithalEquidistantProjectionConverter \"ARC\" projection converter convert/convertBack tests.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/1904-66_ARC.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                let header = hdus[0].header;
                let builder = new slimfits.SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).to.be.equal(true);         
                let converter = builder.build(header);

                for (var i = 0; i < 10; i++) {
                    let initial = {x: i, y: i};
                    let val = converter.convert(initial);
                    let final = converter.convertBack(val);

                    expect(initial.x).to.be.equal(final.x);
                    expect(initial.y).to.be.equal(final.y);
                }
            });
    });
    
    it("SlantOrtographicProjectionConverter \"SIN\" projection converter convert/convertBack tests.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/1904-66_SIN.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                let header = hdus[0].header;
                let builder = new slimfits.SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).to.be.equal(true);         
                let converter = builder.build(header);

                for (var i = 0; i < 10; i++) {
                    let initial = {x: i, y: i};
                    let val = converter.convert(initial);
                    let final = converter.convertBack(val);

                    expect(initial.x).to.be.equal(final.x);
                    expect(initial.y).to.be.equal(final.y);
                }
            });
    });
    
    it("StereographicProjectionConverter \"STG\" projection converter convert/convertBack tests.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/1904-66_STG.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                let header = hdus[0].header;
                let builder = new slimfits.SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).to.be.equal(true);         
                let converter = builder.build(header);

                for (var i = 0; i < 10; i++) {
                    let initial = {x: i, y: i};
                    let val = converter.convert(initial);
                    let final = converter.convertBack(val);

                    expect(initial.x).to.be.equal(final.x);
                    expect(initial.y).to.be.equal(final.y);
                }
            });
    });
        
    it("GnomonicProjectionConverter \"TAN\" projection converter convert/convertBack tests.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/1904-66_TAN.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                let header = hdus[0].header;
                let builder = new slimfits.SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).to.be.equal(true);         
                let converter = builder.build(header);

                for (var i = 0; i < 10; i++) {
                    let initial = {x: i, y: i};
                    let val = converter.convert(initial);
                    let final = converter.convertBack(val);

                    expect(initial.x).to.be.equal(final.x);
                    expect(initial.y).to.be.equal(final.y);
                }
            });
    });
        
    it("GnomonicProjectionConverter \"ZEA\" projection converter convert/convertBack tests.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/1904-66_ZEA.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                let header = hdus[0].header;
                let builder = new slimfits.SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).to.be.equal(true);         
                let converter = builder.build(header);

                for (var i = 0; i < 10; i++) {
                    let initial = {x: i, y: i};
                    let val = converter.convert(initial);
                    let final = converter.convertBack(val);

                    expect(initial.x).to.be.equal(final.x);
                    expect(initial.y).to.be.equal(final.y);
                }
            });
    });
        
    it("ZenithalEquidistantProjectionConverter \"ARC\" projection converter build from header tests.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/1904-66_ARC.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                let header = hdus[0].header;
                let builder = new slimfits.SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).to.be.equal(true);         
                let converter = builder.build(header);

                let val = converter.convert({x : 0, y: 0});                
                expect(val.ra).to.be.equal(17.937115385182537);
                expect(val.dec).to.be.equal(-73.46829958534701);
            });
    });
    
    it("SlantOrtographicProjectionConverter \"SIN\" projection converter build from header tests.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/1904-66_SIN.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                let header = hdus[0].header;
                let builder = new slimfits.SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).to.be.equal(true);         
                let converter = builder.build(header);

                let val = converter.convert({x : 0, y: 0});                
                expect(val.ra).to.be.equal(17.892767132810096);
                expect(val.dec).to.be.equal(-73.90353552623822);
            });
    });
    
    it("StereographicProjectionConverter \"STG\" projection converter build from header tests.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/1904-66_STG.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                let header = hdus[0].header;
                let builder = new slimfits.SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).to.be.equal(true);         
                let converter = builder.build(header);

                let val = converter.convert({x : 0, y: 0});                
                expect(val.ra).to.be.equal(17.958550453510764);
                expect(val.dec).to.be.equal(-73.25613046025057);
            });
    });
    
    it("GnomonicProjectionConverter \"TAN\" projection converter build from header tests.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/1904-66_TAN.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                let header = hdus[0].header;
                let builder = new slimfits.SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).to.be.equal(true);
                let converter = builder.build(header);

                let val = converter.convert({x : 0, y: 0});                
                expect(val.ra).to.be.equal(18.0221890700062);
                expect(val.dec).to.be.equal(-72.61583231844779);
            });
    });

    it("GnomonicProjectionConverter \"ZEA\" projection converter build from header tests.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/1904-66_ZEA.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                let header = hdus[0].header;
                let builder = new slimfits.SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).to.be.equal(true);
                let converter = builder.build(header);

                let val = converter.convert({x : 0, y: 0});                
                expect(val.ra).to.be.equal(17.926286462991737);
                expect(val.dec).to.be.equal(-73.57489559932927);
            });
    });

});