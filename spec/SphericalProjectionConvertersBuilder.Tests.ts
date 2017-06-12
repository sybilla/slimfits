import * as slimfits from '../dist/cjs/slimfits';
import { expect } from 'chai';
declare var require;

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
                    let initial = { x: i, y: i };
                    let val = converter.convert(initial);
                    let final = converter.convertBack(val);

                    expect(initial.x).to.be.approximately(final.x, 0.000001);
                    expect(initial.y).to.be.approximately(final.y, 0.000001);
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
                    let initial = { x: i, y: i };
                    let val = converter.convert(initial);
                    let final = converter.convertBack(val);

                    expect(initial.x).to.be.approximately(final.x, 0.000001);
                    expect(initial.y).to.be.approximately(final.y, 0.000001);
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
                    let initial = { x: i, y: i };
                    let val = converter.convert(initial);
                    let final = converter.convertBack(val);

                    expect(initial.x).to.be.approximately(final.x, 0.000001);
                    expect(initial.y).to.be.approximately(final.y, 0.000001);
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
                    let initial = { x: i, y: i };
                    let val = converter.convert(initial);
                    let final = converter.convertBack(val);

                    expect(initial.x).to.be.approximately(final.x, 0.000001);
                    expect(initial.y).to.be.approximately(final.y, 0.000001);
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
                    let initial = { x: i, y: i };
                    let val = converter.convert(initial);
                    let final = converter.convertBack(val);

                    expect(initial.x).to.be.approximately(final.x, 0.000001);
                    expect(initial.y).to.be.approximately(final.y, 0.000001);
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

                let val = converter.convert({ x: 0, y: 0 });
                expect(val.ra).to.be.approximately(17.937115385182537, 0.00000001);
                expect(val.dec).to.be.approximately(-73.46829958534701, 0.00000001);
            });
    });

    it("ZenithalEquidistantProjectionConverter \"ARC\" projection converter build from definition tests.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/1904-66_ARC.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                let header = hdus[0].header;
                let builder = new slimfits.SphericalProjectionConvertersBuilder();

                let latpole = header.filter((o: any) => /LATPOLE/.test(o.key))[0].value;
                let lonpole = header.filter((o: any) => /LONPOLE/.test(o.key))[0].value;

                let crpixs = header.filter((o: any) => /CRPIX\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(val => val.value);

                let crvals = header.filter((o: any) => /CRVAL\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(val => val.value);

                let cdelts = header.filter((o: any) => /CDELT\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(val => val.value);

                let buildDefinition = {
                    projection: 'ARC',
                    definition: {
                        frame_reference_point: {
                            x: crpixs[0] - 1,
                            y: crpixs[1] - 1
                        },
                        sky_reference_point: {
                            alpha: crvals[0] / 180 * Math.PI,
                            delta: crvals[1] / 180 * Math.PI
                        },
                        transform_matrix: [
                            [cdelts[0], 0],
                            [0, cdelts[1]]
                        ],
                        celestial_pole_latitude: latpole / 180 * Math.PI,
                        celestial_pole_longitude: lonpole  / 180 * Math.PI
                    }
                };

                expect(builder.canBuild(buildDefinition.projection)).to.be.equal(true);
                let converter = builder.build(buildDefinition);

                let val = converter.convert({ x: 0, y: 0 });
                expect(val.ra).to.be.approximately(17.937115385182537, 0.00000001);
                expect(val.dec).to.be.approximately(-73.46829958534701, 0.00000001);
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

                let val = converter.convert({ x: 0, y: 0 });
                expect(val.ra).to.be.approximately(17.892767132810096, 0.00000001);
                expect(val.dec).to.be.approximately(-73.90353552623822, 0.00000001);
            });
    });

    it("SlantOrtographicProjectionConverter \"SIN\" projection converter build from definition tests.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/1904-66_SIN.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                let header = hdus[0].header;
                let builder = new slimfits.SphericalProjectionConvertersBuilder();

                let latpole = header.filter((o: any) => /LATPOLE/.test(o.key))[0].value;
                let lonpole = header.filter((o: any) => /LONPOLE/.test(o.key))[0].value;

                let crpixs = header.filter((o: any) => /CRPIX\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(val => val.value);

                let crvals = header.filter((o: any) => /CRVAL\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(val => val.value);

                let cdelts = header.filter((o: any) => /CDELT\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(val => val.value);

                let buildDefinition = {
                    projection: 'SIN',
                    definition: {
                        frame_reference_point: {
                            x: crpixs[0] - 1,
                            y: crpixs[1] - 1
                        },
                        sky_reference_point: {
                            alpha: crvals[0] / 180 * Math.PI,
                            delta: crvals[1] / 180 * Math.PI
                        },
                        transform_matrix: [
                            [cdelts[0], 0],
                            [0, cdelts[1]]
                        ],
                        celestial_pole_latitude: latpole / 180 * Math.PI,
                        celestial_pole_longitude: lonpole  / 180 * Math.PI
                    }
                };

                expect(builder.canBuild(buildDefinition.projection)).to.be.equal(true);
                let converter = builder.build(buildDefinition);

                let val = converter.convert({ x: 0, y: 0 });
                expect(val.ra).to.be.approximately(17.892767132810096, 0.00000001);
                expect(val.dec).to.be.approximately(-73.90353552623822, 0.00000001);
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

                let val = converter.convert({ x: 0, y: 0 });
                expect(val.ra).to.be.approximately(17.958550453510764, 0.00000001);
                expect(val.dec).to.be.approximately(-73.25613046025057, 0.00000001);
            });
    });

    it("StereographicProjectionConverter \"STG\" projection converter build from definition tests.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/1904-66_STG.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                let header = hdus[0].header;
                let builder = new slimfits.SphericalProjectionConvertersBuilder();

                let latpole = header.filter((o: any) => /LATPOLE/.test(o.key))[0].value;
                let lonpole = header.filter((o: any) => /LONPOLE/.test(o.key))[0].value;

                let crpixs = header.filter((o: any) => /CRPIX\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(val => val.value);

                let crvals = header.filter((o: any) => /CRVAL\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(val => val.value);

                let cdelts = header.filter((o: any) => /CDELT\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(val => val.value);

                let buildDefinition = {
                    projection: 'STG',
                    definition: {
                        frame_reference_point: {
                            x: crpixs[0] - 1,
                            y: crpixs[1] - 1
                        },
                        sky_reference_point: {
                            alpha: crvals[0] / 180 * Math.PI,
                            delta: crvals[1] / 180 * Math.PI
                        },
                        transform_matrix: [
                            [cdelts[0], 0],
                            [0, cdelts[1]]
                        ],
                        celestial_pole_latitude: latpole / 180 * Math.PI,
                        celestial_pole_longitude: lonpole  / 180 * Math.PI
                    }
                };

                expect(builder.canBuild(buildDefinition.projection)).to.be.equal(true);
                let converter = builder.build(buildDefinition);

                let val = converter.convert({ x: 0, y: 0 });
                expect(val.ra).to.be.approximately(17.958550453510764, 0.00000001);
                expect(val.dec).to.be.approximately(-73.25613046025057, 0.00000001);
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

                let val = converter.convert({ x: 0, y: 0 });
                expect(val.ra).to.be.equal(18.0221890700062);
                expect(val.dec).to.be.equal(-72.61583231844779);
            });
    });

    it("GnomonicProjectionConverter \"TAN\" projection converter build from definition tests.", () => {
        let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/1904-66_TAN.fits'));
        return src.initialize()
            .then(_ => slimfits.FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).to.be.equal(1);
                let header = hdus[0].header;
                let builder = new slimfits.SphericalProjectionConvertersBuilder();

                let latpole = header.filter((o: any) => /LATPOLE/.test(o.key))[0].value;
                let lonpole = header.filter((o: any) => /LONPOLE/.test(o.key))[0].value;

                let crpixs = header.filter((o: any) => /CRPIX\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(val => val.value);

                let crvals = header.filter((o: any) => /CRVAL\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(val => val.value);

                let cdelts = header.filter((o: any) => /CDELT\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(val => val.value);

                let buildDefinition = {
                    projection: 'TAN',
                    definition: {
                        frame_reference_point: {
                            x: crpixs[0] - 1,
                            y: crpixs[1] - 1
                        },
                        sky_reference_point: {
                            alpha: crvals[0] / 180 * Math.PI,
                            delta: crvals[1] / 180 * Math.PI
                        },
                        transform_matrix: [
                            [cdelts[0], 0],
                            [0, cdelts[1]]
                        ],
                        celestial_pole_latitude: latpole / 180 * Math.PI,
                        celestial_pole_longitude: lonpole  / 180 * Math.PI
                    }
                };

                expect(builder.canBuild(buildDefinition.projection)).to.be.equal(true);
                let converter = builder.build(buildDefinition);

                let val = converter.convert({ x: 0, y: 0 });
                expect(val.ra).to.be.equal(18.0221890700062);
                expect(val.dec).to.be.equal(-72.61583231844779);
            });
    });

    // it("Test \"TAN\" astrometry.", () => {
    //     let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/SLR1_astrometry.fits'));
    //     return src.initialize()
    //         .then(_ => slimfits.FitsReader.readFitsAsync(src))
    //         .then(hdus => {
    //             expect(hdus.length).to.be.equal(1);
    //             let header = hdus[0].header;
    //             let builder = new slimfits.SphericalProjectionConvertersBuilder();

    //             expect(builder.canBuild(header)).to.be.equal(true);
    //             let converter = builder.build(header);

    //             let elements = [
    //                 [{ x: 1096.1603322634294, y: 732.3004252502498 }, { ra: 6.859427518518519, dec: -22.19047722222222 }],
    //                 [{ x: 131.24509468002847, y: 370.4853924407584 }, { ra: 6.8523810925925925, dec: -22.22929388888889 }],
    //                 [{ x: 873.9978916829656, y: 1805.768423363182 }, { ra: 6.857656129629629, dec: -22.081524722222223 }],
    //                 [{ x: 1524.5106105717164, y: 1595.3850580329586 }, { ra: 6.862461037037037, dec: -22.10183138888889 }],
    //                 [{ x: 874.844545614972, y: 630.5109284795933 }, { ra: 6.8578134814814815, dec: -22.201441666666668 }],
    //                 [{ x: 934.7968400369118, y: 879.3431279690086 }, { ra: 6.858221574074074, dec: -22.17594972222222 }],
    //                 [{ x: 715.2459147464783, y: 968.7261715868308 }, { ra: 6.856596111111111, dec: -22.1672275 }],
    //                 [{ x: 908.5191468696762, y: 1869.2043684346177 }, { ra: 6.857907740740741, dec: -22.07514972222222 }],
    //                 [{ x: 194.2369374261596, y: 827.7466410524407 }, { ra: 6.852784148148148, dec: -22.18250888888889 }],
    //                 [{ x: 743.6365704886131, y: 211.858789155007 }, { ra: 6.85689837037037, dec: -22.244389444444444 }],
    //                 [{ x: 1872.7399901735303, y: 1601.0126533605805 }, { ra: 6.865013055555556, dec: -22.100609444444444 }],
    //                 [{ x: 267.41529777977803, y: 1486.5708520852086 }, { ra: 6.853248333333333, dec: -22.115156666666667 }],
    //                 [{ x: 1120.6818865874714, y: 1088.8031131453804 }, { ra: 6.859556851851852, dec: -22.154253055555557 }],
    //                 [{ x: 1049.2032077536883, y: 1776.9618670997806 }, { ra: 6.858944425925926, dec: -22.08419138888889 }],
    //                 [{ x: 788.360942402012, y: 1170.7328770005472 }, { ra: 6.857104462962963, dec: -22.1465 }],
    //                 [{ x: 865.6116065325515, y: 1430.9534560903535 }, { ra: 6.857640685185185, dec: -22.11973972222222 }],
    //                 [{ x: 2021.1057079453228, y: 573.1216674941991 }, { ra: 6.866238814814815, dec: -22.205171666666665 }],
    //                 [{ x: 692.3505993851014, y: 1307.1466448537508 }, { ra: 6.856383037037037, dec: -22.132740833333333 }],
    //                 [{ x: 1304.6618807869263, y: 436.86673558333507 }, { ra: 6.8609854629629625, dec: -22.22040388888889 }],
    //                 [{ x: 1968.3944510075257, y: 800.6745738684307 }, { ra: 6.865817907407408, dec: -22.182039444444445 }],
    //                 [{ x: 1698.0904155649862, y: 1079.6692144184976 }, { ra: 6.8637991666666665, dec: -22.15411472222222 }],
    //                 [{ x: 1072.749709437057, y: 111.75820171842142 }, { ra: 6.859328481481482, dec: -22.254066944444446 }],
    //                 [{ x: 1067.2058364975055, y: 1512.632637837274 }, { ra: 6.859108481481481, dec: -22.111099166666666 }],
    //                 [{ x: 158.52904946873625, y: 888.3408324894575 }, { ra: 6.852510944444444, dec: -22.17641777777778 }],
    //                 [{ x: 104.51718387233909, y: 1207.7650747195978 }, { ra: 6.85207762962963, dec: -22.143874444444446 }],
    //                 [{ x: 1198.1093318850358, y: 1147.6400833939224 }, { ra: 6.860115888888889, dec: -22.148118888888888 }],
    //                 [{ x: 1207.5432274755158, y: 1392.3707311493015 }, { ra: 6.860152962962963, dec: -22.123121944444446 }],
    //                 [{ x: 939.2410086527432, y: 1434.826211858485 }, { ra: 6.858177407407408, dec: -22.119306666666667 }],
    //                 [{ x: 1778.165733914509, y: 1854.5302875387897 }, { ra: 6.8642828518518515, dec: -22.07491222222222 }],
    //                 [{ x: 1436.821709119101, y: 1787.8012161291224 }, { ra: 6.861785796296297, dec: -22.082360833333333 }],
    //                 [{ x: 658.7337703151654, y: 37.82203465924394 }, { ra: 6.856293277777778, dec: -22.26230111111111 }],
    //                 [{ x: 1090.1471675724927, y: 359.6032482598607 }, { ra: 6.859422018518519, dec: -22.228721944444445 }],
    //                 [{ x: 1818.3916502033078, y: 1364.5647088337662 }, { ra: 6.864640129629629, dec: -22.1248175 }],
    //                 [{ x: 138.64285572356786, y: 1916.8549784409952 }, { ra: 6.852240222222222, dec: -22.071474444444444 }],
    //                 [{ x: 494.1716287408027, y: 462.75868592105405 }, { ra: 6.855029814814815, dec: -22.219240833333334 }],
    //                 [{ x: 984.8455404905288, y: 271.5624488331146 }, { ra: 6.85866062962963, dec: -22.237918611111112 }],
    //                 [{ x: 959.6260086173132, y: 285.8884897319679 }, { ra: 6.858472370370371, dec: -22.236461944444443 }],
    //                 [{ x: 586.971525671737, y: 620.8372608947055 }, { ra: 6.855691814814815, dec: -22.202911666666665 }],
    //                 [{ x: 1176.4077876626004, y: 495.93059141692873 }, { ra: 6.860037685185185, dec: -22.21462916666667 }],
    //                 [{ x: 1729.3387640385258, y: 1915.1974019445433 }, { ra: 6.863914925925926, dec: -22.06882111111111 }],
    //                 [{ x: 1032.720533650816, y: 1950.9186567686813 }, { ra: 6.858795981481482, dec: -22.066449444444444 }],
    //                 [{ x: 649.8135409432604, y: 645.7852869866098 }, { ra: 6.85614837037037, dec: -22.200271666666666 }],
    //                 [{ x: 1763.0798196903368, y: 620.6735611158289 }, { ra: 6.8643316481481484, dec: -22.200833055555556 }],
    //                 [{ x: 850.2895491304469, y: 308.33583966678395 }, { ra: 6.8576660370370375, dec: -22.2343575 }],
    //                 [{ x: 1362.206192267271, y: 1032.5647851097958 }, { ra: 6.861331074074074, dec: -22.159568333333333 }],
    //                 [{ x: 1847.512059262662, y: 1532.5961869759967 }, { ra: 6.864830148148148, dec: -22.107645 }],
    //                 [{ x: 1328.656055332962, y: 21.841093206211795 }, { ra: 6.861217481481481, dec: -22.26272416666667 }],
    //                 [{ x: 1058.8983310070385, y: 946.074124669617 }, { ra: 6.8591160185185185, dec: -22.168913888888888 }],
    //                 [{ x: 983.6311958553965, y: 1811.2028915181193 }, { ra: 6.858455444444444, dec: -22.08081222222222 }],
    //                 [{ x: 584.9485835028955, y: 1110.4959461574583 }, { ra: 6.85561, dec: -22.15300166666667 }],
    //                 [{ x: 877.0641407084738, y: 933.7937371578861 }, { ra: 6.857781666666667, dec: -22.170540555555554 }],
    //                 [{ x: 1790.236798092367, y: 1252.13543857325 }, { ra: 6.864448296296296, dec: -22.136340833333332 }],
    //                 [{ x: 1537.2586747146904, y: 1557.471089781648 }, { ra: 6.862545925925926, dec: -22.105591666666665 }],
    //                 [{ x: 114.97445651238453, y: 748.5831454291963 }, { ra: 6.852207685185185, dec: -22.190749722222222 }],
    //                 [{ x: 1189.1402203856749, y: 1720.133350550964 }, { ra: 6.859974518518518, dec: -22.089749722222223 }],
    //                 [{ x: 1220.3096144779315, y: 788.6417872556488 }, { ra: 6.860321740740741, dec: -22.184696111111112 }],
    //                 [{ x: 110.15736390516447, y: 294.50557802891507 }, { ra: 6.852228574074074, dec: -22.23709361111111 }],
    //                 [{ x: 595.7459325322784, y: 586.2789573848792 }, { ra: 6.855759518518519, dec: -22.20649611111111 }],
    //                 [{ x: 527.6348077935755, y: 582.0389866847215 }, { ra: 6.855258537037037, dec: -22.207080277777777 }],
    //                 [{ x: 437.3976011764932, y: 107.8606543287688 }, { ra: 6.85465312962963, dec: -22.255527222222224 }],
    //                 [{ x: 269.6035928833272, y: 768.2701763813983 }, { ra: 6.853340925925926, dec: -22.188503055555554 }],
    //                 [{ x: 411.0712241958715, y: 1210.9463658185316 }, { ra: 6.854323833333333, dec: -22.14307277777778 }],
    //                 [{ x: 1897.4524229939173, y: 1465.7755738669807 }, { ra: 6.865205481481482, dec: -22.1143875 }],
    //                 [{ x: 1442.7304929093523, y: 745.6868869869429 }, { ra: 6.861961185185185, dec: -22.18869888888889 }],
    //                 [{ x: 1298.9851144533143, y: 1465.465355268381 }, { ra: 6.860811962962963, dec: -22.115560555555554 }],
    //                 [{ x: 67.74473886750962, y: 1006.3284661902144 }, { ra: 6.851826962962963, dec: -22.164536388888887 }],
    //                 [{ x: 1887.4603630280972, y: 1141.7120866204025 }, { ra: 6.865174537037037, dec: -22.147408055555555 }],
    //                 [{ x: 1519.4557591156276, y: 471.26774092894703 }, { ra: 6.862560814814815, dec: -22.216578055555555 }],
    //                 [{ x: 1093.7415995987867, y: 1059.6128531511954 }, { ra: 6.859359185185185, dec: -22.157284166666667 }],
    //                 [{ x: 1094.5791154791154, y: 232.1559213759214 }, { ra: 6.859472574074074, dec: -22.241725833333334 }],
    //                 [{ x: 720.7164886160391, y: 668.2267365978634 }, { ra: 6.856665888888889, dec: -22.197854166666666 }],
    //                 [{ x: 1701.8139974176281, y: 895.4563865907901 }, { ra: 6.863842, dec: -22.172919722222222 }],
    //                 [{ x: 708.7540372670809, y: 1909.8870559006218 }, { ra: 6.856420425925926, dec: -22.071230833333335 }],
    //                 [{ x: 1083.8854452940056, y: 1179.0922695981067 }, { ra: 6.859267666666667, dec: -22.145143333333333 }],
    //                 [{ x: 865.5517822920658, y: 1931.697840807461 }, { ra: 6.857568166666667, dec: -22.0687075 }],
    //                 [{ x: 806.7887768522576, y: 628.710068683326 }, { ra: 6.8573025, dec: -22.201775277777777 }],
    //                 [{ x: 1838.5507263219058, y: 1465.568187100523 }, { ra: 6.864773166666667, dec: -22.114566944444444 }],
    //                 [{ x: 107.00724547931631, y: 1584.5968850631662 }, { ra: 6.852045351851852, dec: -22.105492777777776 }],
    //                 [{ x: 1393.647233829183, y: 793.1587832191208 }, { ra: 6.861593388888889, dec: -22.183967777777777 }],
    //                 [{ x: 1059.2753981425901, y: 1221.2273738479466 }, { ra: 6.859081611111111, dec: -22.14092722222222 }],
    //                 [{ x: 1214.8372672152448, y: 743.5120903710122 }, { ra: 6.86028875925926, dec: -22.189301666666665 }],
    //                 [{ x: 1740.0499621498866, y: 474.7567373202119 }, { ra: 6.864179555555555, dec: -22.215746944444444 }],
    //                 [{ x: 473.924064171123, y: 1453.3438884644765 }, { ra: 6.854750203703704, dec: -22.118238055555555 }],
    //                 [{ x: 170.09611920746684, y: 401.8077615850664 }, { ra: 6.8526563703703705, dec: -22.226114166666665 }],
    //                 [{ x: 1114.0520964043094, y: 781.2020682791746 }, { ra: 6.859538351851852, dec: -22.185634166666667 }],
    //                 [{ x: 1671.9597075753118, y: 1440.066845930843 }, { ra: 6.863556481481481, dec: -22.11742472222222 }],
    //                 [{ x: 1810.4156971289174, y: 30.450553574779512 }, { ra: 6.864756537037037, dec: -22.261 }],
    //                 [{ x: 1203.9012684105376, y: 1996.8648422617662 }, { ra: 6.860042833333333, dec: -22.061405277777776 }],
    //                 [{ x: 249.36105675146771, y: 390.49716757647536 }, { ra: 6.853236518518519, dec: -22.22702138888889 }],
    //                 [{ x: 978.8367581785305, y: 115.47416296783385 }, { ra: 6.85863437037037, dec: -22.253870555555554 }],
    //                 [{ x: 720.1662769833071, y: 254.60078299168077 }, { ra: 6.856712444444445, dec: -22.240061666666666 }],
    //                 [{ x: 1884.2767423014593, y: 165.61594119009033 }, { ra: 6.865278203703704, dec: -22.24707888888889 }],
    //                 [{ x: 1338.015743036734, y: 280.93668185225766 }, { ra: 6.861249351851852, dec: -22.236359722222222 }],
    //                 [{ x: 1435.0648255142132, y: 1565.1175756875436 }, { ra: 6.861799314814815, dec: -22.105119166666668 }],
    //                 [{ x: 769.69407629365, y: 1572.7274979831739 }, { ra: 6.8569125, dec: -22.105525555555555 }],
    //                 [{ x: 1888.381495857714, y: 1809.5009559121715 }, { ra: 6.865090648148148, dec: -22.079345833333335 }],
    //                 [{ x: 582.1400467822227, y: 1217.5130450428842 }, { ra: 6.855580259259259, dec: -22.14212 }],
    //                 [{ x: 1775.5640571728295, y: 1666.6873196957774 }, { ra: 6.8642815, dec: -22.094149444444444 }],
    //                 [{ x: 651.8880871435512, y: 1551.6729341566647 }, { ra: 6.856048740740741, dec: -22.107869444444443 }],
    //                 [{ x: 886.2949511522111, y: 1387.369900812887 }, { ra: 6.857792333333333, dec: -22.1242475 }],
    //                 [{ x: 540.2456930824277, y: 1730.666666666666 }, { ra: 6.855200629629629, dec: -22.089864722222224 }],
    //                 [{ x: 1480.363142857143, y: 36.19095238095239 }, { ra: 6.86232737037037, dec: -22.261066111111113 }],
    //                 [{ x: 320.6007130124777, y: 69.99989514522386 }, { ra: 6.853801981481482, dec: -22.259653888888888 }],
    //                 [{ x: 1090.8929481733219, y: 1499.5966440101954 }, { ra: 6.859271537037037, dec: -22.112385555555555 }],
    //                 [{ x: 725.5023983315954, y: 1976.0019812304486 }, { ra: 6.856535296296296, dec: -22.064441111111112 }],
    //                 [{ x: 683.5535099180424, y: 234.21736548283644 }, { ra: 6.8564447407407405, dec: -22.242279166666666 }]
    //             ];

    //             var width = header.filter(kv => kv.key === "NAXIS1")[0].value;
    //             var height = header.filter(kv => kv.key === "NAXIS2")[0].value;

    //             console.log('# x\ty\tdist_from_cen\tdra\tddec');
    //             for (var i = 0; i < elements.length; i++) {
    //                 let p = elements[i][0] as { x: number, y: number };
    //                 let r = elements[i][1] as { ra: number, dec: number };

    //                 let v = converter.convert(p);
    //                 console.log('' + p.x + ' ' + p.y + ' ' + (Math.sqrt((p.x - width / 2) * (p.x - width / 2) + (p.y - height / 2) * (p.y - height / 2))) + '\t' + ((v.ra - r.ra) * 3600 * 15) + '\t' + ((v.dec - r.dec) * 3600) + '');
    //             }
    //         });
    // });

    // it("GnomonicProjectionConverter \"ZEA\" projection converter build from header tests.", () => {
    //     let src = new slimfits.ArrayBufferFile(fs.readFileSync('data/1904-66_ZEA.fits'));
    //     return src.initialize()
    //         .then(_ => slimfits.FitsReader.readFitsAsync(src))
    //         .then(hdus => {
    //             expect(hdus.length).to.be.equal(1);
    //             let header = hdus[0].header;
    //             let builder = new slimfits.SphericalProjectionConvertersBuilder();

    //             expect(builder.canBuild(header)).to.be.equal(true);
    //             let converter = builder.build(header);

    //             let val = converter.convert({ x: 0, y: 0 });
    //             expect(val.ra).to.be.approximately(17.926286462991737, 0.00000001);
    //             expect(val.dec).to.be.approximately(-73.57489559932927, 0.00000001);
    //         });
    // });

});