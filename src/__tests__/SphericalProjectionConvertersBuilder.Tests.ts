import { FitsReader, ArrayBufferFile, SphericalProjectionConvertersBuilder } from '../index';
import * as fs from 'mz/fs';

describe('SphericalProjectionConvertersBuilder tests.', () => {

    it('ZenithalEquidistantProjectionConverter "ARC" projection converter convert/convertBack tests.', () => {
        const src = new ArrayBufferFile(fs.readFileSync('data/1904-66_ARC.fits').buffer);
        return src.initialize()
            .then(_ => FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).toEqual(1);
                const header = hdus[0].header;
                const builder = new SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).toBeTruthy();
                const converter = builder.build(header);

                for (let i = 0; i < 10; i++) {
                    const initial = { x: i, y: i };
                    const val = converter.convert(initial);
                    const final = converter.convertBack(val);
                    expect(initial.x).toBeCloseTo(final.x, 6);
                    expect(initial.y).toBeCloseTo(final.y, 6);
                }
            });
    });

    it('SlantOrtographicProjectionConverter "SIN" projection converter convert/convertBack tests.', () => {
        const src = new ArrayBufferFile(fs.readFileSync('data/1904-66_SIN.fits').buffer);
        return src.initialize()
            .then(_ => FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).toEqual(1);
                const header = hdus[0].header;
                const builder = new SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).toBeTruthy();
                const converter = builder.build(header);

                for (let i = 0; i < 10; i++) {
                    const initial = { x: i, y: i };
                    const val = converter.convert(initial);
                    const final = converter.convertBack(val);

                    expect(initial.x).toBeCloseTo(final.x, 6);
                    expect(initial.y).toBeCloseTo(final.y, 6);
                }
            });
    });

    it('StereographicProjectionConverter "STG" projection converter convert/convertBack tests.', () => {
        const src = new ArrayBufferFile(fs.readFileSync('data/1904-66_STG.fits').buffer);
        return src.initialize()
            .then(_ => FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).toEqual(1);
                const header = hdus[0].header;
                const builder = new SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).toBeTruthy();
                const converter = builder.build(header);

                for (let i = 0; i < 10; i++) {
                    const initial = { x: i, y: i };
                    const val = converter.convert(initial);
                    const final = converter.convertBack(val);

                    expect(initial.x).toBeCloseTo(final.x, 6);
                    expect(initial.y).toBeCloseTo(final.y, 6);
                }
            });
    });

    it('GnomonicProjectionConverter "TAN" projection converter convert/convertBack tests.', () => {
        const src = new ArrayBufferFile(fs.readFileSync('data/1904-66_TAN.fits').buffer);
        return src.initialize()
            .then(_ => FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).toEqual(1);
                const header = hdus[0].header;
                const builder = new SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).toBeTruthy();
                const converter = builder.build(header);

                for (let i = 0; i < 10; i++) {
                    const initial = { x: i, y: i };
                    const val = converter.convert(initial);
                    const final = converter.convertBack(val);

                    expect(initial.x).toBeCloseTo(final.x, 6);
                    expect(initial.y).toBeCloseTo(final.y, 6);
                }
            });
    });

    it('GnomonicProjectionConverter "ZEA" projection converter convert/convertBack tests.', () => {
        const src = new ArrayBufferFile(fs.readFileSync('data/1904-66_ZEA.fits').buffer);
        return src.initialize()
            .then(_ => FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).toEqual(1);
                const header = hdus[0].header;
                const builder = new SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).toBeTruthy();
                const converter = builder.build(header);

                for (let i = 0; i < 10; i++) {
                    const initial = { x: i, y: i };
                    const val = converter.convert(initial);
                    const final = converter.convertBack(val);

                    expect(initial.x).toBeCloseTo(final.x, 6);
                    expect(initial.y).toBeCloseTo(final.y, 6);
                }
            });
    });

    it('ZenithalEquidistantProjectionConverter "ARC" projection converter build from header tests.', () => {
        const src = new ArrayBufferFile(fs.readFileSync('data/1904-66_ARC.fits').buffer);
        return src.initialize()
            .then(_ => FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).toEqual(1);
                const header = hdus[0].header;
                const builder = new SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).toBeTruthy();
                const converter = builder.build(header);

                const val = converter.convert({ x: 0, y: 0 });
                expect(val.alpha).toBeCloseTo(17.937115385182537, 6);
                expect(val.delta).toBeCloseTo(-73.46829958534701, 5);
            });
    });

    it('ZenithalEquidistantProjectionConverter "ARC" projection converter build from definition tests.', () => {
        const src = new ArrayBufferFile(fs.readFileSync('data/1904-66_ARC.fits').buffer);
        return src.initialize()
            .then(_ => FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).toEqual(1);
                const header = hdus[0].header;
                const builder = new SphericalProjectionConvertersBuilder();

                const latpole = header.filter((o: any) => /LATPOLE/.test(o.key))[0].value;
                const lonpole = header.filter((o: any) => /LONPOLE/.test(o.key))[0].value;

                const crpixs = header.filter((o: any) => /CRPIX\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(v => v.value);

                const crvals = header.filter((o: any) => /CRVAL\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(v => v.value);

                const cdelts = header.filter((o: any) => /CDELT\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(v => v.value);

                const buildDefinition = {
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
                        distortion_matrix: undefined,
                        celestial_pole: {
                            latitude: latpole / 180 * Math.PI,
                            longitude: lonpole / 180 * Math.PI
                        }
                    }
                };

                expect(builder.canBuild(buildDefinition.projection)).toBeTruthy();
                const converter = builder.build(buildDefinition);

                const val = converter.convert({ x: 0, y: 0 });
                expect(val.alpha).toBeCloseTo(17.937115385182537, 8);
                expect(val.delta).toBeCloseTo(-73.46829958534701, 8);
            });
    });

    it('SlantOrtographicProjectionConverter "SIN" projection converter build from header tests.', () => {
        const src = new ArrayBufferFile(fs.readFileSync('data/1904-66_SIN.fits').buffer);
        return src.initialize()
            .then(_ => FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).toEqual(1);
                const header = hdus[0].header;
                const builder = new SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).toBeTruthy();
                const converter = builder.build(header);

                const val = converter.convert({ x: 0, y: 0 });
                expect(val.alpha).toBeCloseTo(17.892767132810096, 8);
                expect(val.delta).toBeCloseTo(-73.90353552623822, 8);
            });
    });

    it('SlantOrtographicProjectionConverter "SIN" projection converter build from definition tests.', () => {
        const src = new ArrayBufferFile(fs.readFileSync('data/1904-66_SIN.fits').buffer);
        return src.initialize()
            .then(_ => FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).toEqual(1);
                const header = hdus[0].header;
                const builder = new SphericalProjectionConvertersBuilder();

                const latpole = header.filter((o: any) => /LATPOLE/.test(o.key))[0].value;
                const lonpole = header.filter((o: any) => /LONPOLE/.test(o.key))[0].value;

                const crpixs = header.filter((o: any) => /CRPIX\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(v => v.value);

                const crvals = header.filter((o: any) => /CRVAL\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(v => v.value);

                const cdelts = header.filter((o: any) => /CDELT\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(v => v.value);

                const buildDefinition = {
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
                        distortion_matrix: undefined,
                        celestial_pole: {
                            latitude: latpole / 180 * Math.PI,
                            longitude: lonpole / 180 * Math.PI
                        }
                    }
                };

                expect(builder.canBuild(buildDefinition.projection)).toBeTruthy();
                const converter = builder.build(buildDefinition);

                const val = converter.convert({ x: 0, y: 0 });
                expect(val.alpha).toBeCloseTo(17.892767132810096, 8);
                expect(val.delta).toBeCloseTo(-73.90353552623822, 8);
            });
    });

    it('StereographicProjectionConverter "STG" projection converter build from header tests.', () => {
        const src = new ArrayBufferFile(fs.readFileSync('data/1904-66_STG.fits').buffer);
        return src.initialize()
            .then(_ => FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).toEqual(1);
                const header = hdus[0].header;
                const builder = new SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).toBeTruthy();
                const converter = builder.build(header);

                const val = converter.convert({ x: 0, y: 0 });
                expect(val.alpha).toBeCloseTo(17.958550453510764, 8);
                expect(val.delta).toBeCloseTo(-73.25613046025057, 8);
            });
    });

    it('StereographicProjectionConverter "STG" projection converter build from definition tests.', () => {
        const src = new ArrayBufferFile(fs.readFileSync('data/1904-66_STG.fits').buffer);
        return src.initialize()
            .then(_ => FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).toEqual(1);
                const header = hdus[0].header;
                const builder = new SphericalProjectionConvertersBuilder();

                const latpole = header.filter((o: any) => /LATPOLE/.test(o.key))[0].value;
                const lonpole = header.filter((o: any) => /LONPOLE/.test(o.key))[0].value;

                const crpixs = header.filter((o: any) => /CRPIX\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(v => v.value);

                const crvals = header.filter((o: any) => /CRVAL\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(v => v.value);

                const cdelts = header.filter((o: any) => /CDELT\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(v => v.value);

                const buildDefinition = {
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
                        distortion_matrix: undefined,
                        celestial_pole: {
                            latitude: latpole / 180 * Math.PI,
                            longitude: lonpole / 180 * Math.PI
                        }
                    }
                };

                expect(builder.canBuild(buildDefinition.projection)).toBeTruthy();
                const converter = builder.build(buildDefinition);

                const val = converter.convert({ x: 0, y: 0 });
                expect(val.alpha).toBeCloseTo(17.958550453510764, 8);
                expect(val.delta).toBeCloseTo(-73.25613046025057, 8);
            });
    });

    it('GnomonicProjectionConverter "TAN" projection converter build from header tests.', () => {
        const src = new ArrayBufferFile(fs.readFileSync('data/1904-66_TAN.fits').buffer);
        return src.initialize()
            .then(_ => FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).toEqual(1);
                const header = hdus[0].header;
                const builder = new SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).toBeTruthy();
                const converter = builder.build(header);

                const val = converter.convert({ x: 0, y: 0 });
                expect(val.alpha).toEqual(18.0221890700062);
                expect(val.delta).toEqual(-72.61583231844779);
            });
    });

    it('GnomonicProjectionConverter "TAN" projection converter build from definition tests.', () => {
        const src = new ArrayBufferFile(fs.readFileSync('data/1904-66_TAN.fits').buffer);
        return src.initialize()
            .then(_ => FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).toEqual(1);
                const header = hdus[0].header;
                const builder = new SphericalProjectionConvertersBuilder();

                const latpole = header.filter((o: any) => /LATPOLE/.test(o.key))[0].value;
                const lonpole = header.filter((o: any) => /LONPOLE/.test(o.key))[0].value;

                const crpixs = header.filter((o: any) => /CRPIX\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(v => v.value);

                const crvals = header.filter((o: any) => /CRVAL\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(v => v.value);

                const cdelts = header.filter((o: any) => /CDELT\d+/.test(o.key))
                    .sort((a, b) => a.key.localeCompare(b.key))
                    .map(v => v.value);

                const buildDefinition = {
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
                        distortion_matrix: undefined,
                        celestial_pole: {
                            latitude: latpole / 180 * Math.PI,
                            longitude: lonpole / 180 * Math.PI
                        }
                    }
                };

                expect(builder.canBuild(buildDefinition.projection)).toBeTruthy();
                const converter = builder.build(buildDefinition);

                const val = converter.convert({ x: 0, y: 0 });
                expect(val.alpha).toEqual(18.0221890700062);
                expect(val.delta).toEqual(-72.61583231844779);
            });
    });

    it('Distortion based "TAN" projection converter build from header tests.', () => {
        const src = new ArrayBufferFile(fs.readFileSync('data/tpv-sample.fits').buffer);
        return src.initialize()
            .then(_ => FitsReader.readFitsAsync(src))
            .then(hdus => {
                expect(hdus.length).toEqual(1);
                const header = hdus[0].header;
                const builder = new SphericalProjectionConvertersBuilder();

                expect(builder.canBuild(header)).toBeTruthy();
                const converter = builder.build(header);

                const val = converter.convert({ x: 264, y: 269 });
                expect(val.alpha).toBeCloseTo(3.5036733007560885, 8);
                expect(val.delta).toBeCloseTo(-28.741922515405893, 8);
            });
    });

    it('Distorted buildDefinition test', () => {
        const builder = new SphericalProjectionConvertersBuilder();

        const buildDefinition = {
            projection: 'TPV',
            definition: {
                frame_reference_point: {
                    x: 0,
                    y: 0
                },
                sky_reference_point: {
                    alpha: 47.4625 / 180 * Math.PI,
                    delta: 18.13722222222222 / 180 * Math.PI
                },
                transform_matrix: [
                    [1, 0],
                    [0, 1]
                ],
                distortion_matrix: [
                    [
                                /* PV1_0 */ 0.393986241715196,
                                /* PV1_1 */ -0.000382620592837098,
                                /* PV1_2 */ 2.5518503169592E-06,
                                /* PV1_3 */ 0.0,
                                /* PV1_4 */ -2.25193448470474E-09,
                                /* PV1_5 */ -1.39955542459514E-09,
                                /* PV1_6 */ -7.11191292104735E-10,
                                /* PV1_7 */ 6.82387366415888E-13,
                                /* PV1_8 */ -2.09315032264758E-14,
                                /* PV1_9 */ 6.58718266971956E-13,
                                /* PV1_10*/ 1.89597500880138E-15
                    ],
                    [
                                /* PV2_0 */ 0.395267197618154,
                                /* PV2_1 */ -0.000382703245072383,
                                /* PV2_2 */ 4.76051139875594E-07,
                                /* PV2_3 */ 0.0,
                                /* PV2_4 */ -2.21406625457014E-09,
                                /* PV2_5 */ -1.46660373242611E-09,
                                /* PV2_6 */ -6.73389514413921E-10,
                                /* PV2_7 */ 6.95129345972053E-13,
                                /* PV2_8 */ -2.56749081139913E-14,
                                /* PV2_9 */ 6.71167876994908E-13,
                                /* PV2_10*/ 1.05363574255833E-15
                    ]
                ],
                celestial_pole:
                    {
                        latitude: 0,
                        longitude: Math.PI
                    }
            }
        };

        expect(builder.canBuild(buildDefinition.projection)).toBeTruthy();
        const converter = builder.build(buildDefinition);

        let val = converter.convert({ x: 1546.0, y: 1970.1 });

        expect(val.alpha).toBeCloseTo(3.150268055555555, 4);
        expect(val.delta).toBeCloseTo(17.772777777777776, 4);

        val = converter.convert({ x: 499, y: 309 });

        expect(val.alpha).toBeCloseTo(3.1784391666666667, 4);
        expect(val.delta).toBeCloseTo(18.413815499201238, 4);

    });
});
