import * as fs from 'mz/fs';
import {ArrayBufferFile} from '../datasource/ArrayBufferFile';
import {FitsReader} from '../FitsReader';
import {SphericalProjectionConvertersBuilder} from '../wcs/SphericalProjectionConverters';

test('ZenithalEquidistantProjectionConverter \"ARC\" projection converter convert/convertBack tests.', () => {
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

                expect(initial.x).toBeCloseTo(final.x, 0.000001);
                expect(initial.y).toBeCloseTo(final.y, 0.000001);
            }
        });
});

test('SlantOrtographicProjectionConverter \"SIN\" projection converter convert/convertBack tests.', () => {
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

                expect(initial.x).toBeCloseTo(final.x, 0.000001);
                expect(initial.y).toBeCloseTo(final.y, 0.000001);
            }
        });
});

test('StereographicProjectionConverter \"STG\" projection converter convert/convertBack tests.', () => {
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

            expect(initial.x).toBeCloseTo(final.x, 0.000001);
            expect(initial.y).toBeCloseTo(final.y, 0.000001);
        }
    });
});

test('GnomonicProjectionConverter \"TAN\" projection converter convert/convertBack tests.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('data/1904-66_TAN.fits').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            expect(hdus.length).toEqual(1);
            const header = hdus[0].header;
            const builder = new SphericalProjectionConvertersBuilder();

            expect(builder.canBuild(header)).toEqual(true);
            const converter = builder.build(header);

            for (let i = 0; i < 10; i++) {
                const initial = { x: i, y: i };
                const val = converter.convert(initial);
                const final = converter.convertBack(val);

                expect(initial.x).toBeCloseTo(final.x, 0.000001);
                expect(initial.y).toBeCloseTo(final.y, 0.000001);
            }
        });
});

test('GnomonicProjectionConverter \"ZEA\" projection converter convert/convertBack tests.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('data/1904-66_ZEA.fits').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            expect(hdus.length).toEqual(1);
            const header = hdus[0].header;
            const builder = new SphericalProjectionConvertersBuilder();

            expect(builder.canBuild(header)).toEqual(true);
            const converter = builder.build(header);

            for (let i = 0; i < 10; i++) {
                const initial = { x: i, y: i };
                const val = converter.convert(initial);
                const final = converter.convertBack(val);

                expect(initial.x).toBeCloseTo(final.x, 0.000001);
                expect(initial.y).toBeCloseTo(final.y, 0.000001);
            }
        });
});

test('ZenithalEquidistantProjectionConverter \"ARC\" projection converter build from header tests.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('data/1904-66_ARC.fits').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            expect(hdus.length).toEqual(1);
            const header = hdus[0].header;
            const builder = new SphericalProjectionConvertersBuilder();

            expect(builder.canBuild(header)).toEqual(true);
            const converter = builder.build(header);

            const val = converter.convert({ x: 0, y: 0 });
            expect(val.alpha).toBeCloseTo(17.937115385182537, 0.00000001);
            expect(val.delta).toBeCloseTo(-73.46829958534701, 0.00000001);
        });
});

test('ZenithalEquidistantProjectionConverter \"ARC\" projection converter build from definition tests.', () => {
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
                .map(x => x.value);

            const crvals = header.filter((o: any) => /CRVAL\d+/.test(o.key))
                .sort((a, b) => a.key.localeCompare(b.key))
                .map(x => x.value);

            const cdelts = header.filter((o: any) => /CDELT\d+/.test(o.key))
                .sort((a, b) => a.key.localeCompare(b.key))
                .map(x => x.value);

            const buildDefinition = {
                projection: 'ARC',
                definition: {
                    frame_reference_point: {
                        x: crpixs[0] - 1,
                        y: crpixs[1] - 1,
                    },
                    sky_reference_point: {
                        alpha: crvals[0] / 180 * Math.PI,
                        delta: crvals[1] / 180 * Math.PI,
                    },
                    transform_matrix: [
                        [cdelts[0], 0],
                        [0, cdelts[1]],
                    ],
                    distortion_matrix: undefined,
                    celestial_pole: {
                        latitude: latpole / 180 * Math.PI,
                        longitude: lonpole  / 180 * Math.PI
                    }
                },
            };

            expect(builder.canBuild(buildDefinition.projection)).toEqual(true);
            const converter = builder.build(buildDefinition);

            const val = converter.convert({ x: 0, y: 0 });
            expect(val.alpha).toBeCloseTo(17.937115385182537, 0.00000001);
            expect(val.delta).toBeCloseTo(-73.46829958534701, 0.00000001);
        });
});

test('SlantOrtographicProjectionConverter \"SIN\" projection converter build from header tests.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('data/1904-66_SIN.fits').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            expect(hdus.length).toEqual(1);
            const header = hdus[0].header;
            const builder = new SphericalProjectionConvertersBuilder();

            expect(builder.canBuild(header)).toEqual(true);
            const converter = builder.build(header);

            const val = converter.convert({ x: 0, y: 0 });
            expect(val.alpha).toBeCloseTo(17.892767132810096, 0.00000001);
            expect(val.delta).toBeCloseTo(-73.90353552623822, 0.00000001);
        });
});

test('SlantOrtographicProjectionConverter \"SIN\" projection converter build from definition tests.', () => {
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
                .map(x => x.value);

            const crvals = header.filter((o: any) => /CRVAL\d+/.test(o.key))
                .sort((a, b) => a.key.localeCompare(b.key))
                .map(x => x.value);

            const cdelts = header.filter((o: any) => /CDELT\d+/.test(o.key))
                .sort((a, b) => a.key.localeCompare(b.key))
                .map(x => x.value);

            const buildDefinition = {
                projection: 'SIN',
                definition: {
                    frame_reference_point: {
                        x: crpixs[0] - 1,
                        y: crpixs[1] - 1,
                    },
                    sky_reference_point: {
                        alpha: crvals[0] / 180 * Math.PI,
                        delta: crvals[1] / 180 * Math.PI,
                    },
                    transform_matrix: [
                        [cdelts[0], 0],
                        [0, cdelts[1]],
                    ],
                    distortion_matrix: undefined,
                    celestial_pole: {
                        latitude: latpole / 180 * Math.PI,
                        longitude: lonpole  / 180 * Math.PI
                    }
                },
            };

            expect(builder.canBuild(buildDefinition.projection)).toEqual(true);
            const converter = builder.build(buildDefinition);

            const val = converter.convert({ x: 0, y: 0 });
            expect(val.alpha).toBeCloseTo(17.892767132810096, 0.00000001);
            expect(val.delta).toBeCloseTo(-73.90353552623822, 0.00000001);
        });
});

test('StereographicProjectionConverter \"STG\" projection converter build from header tests.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('data/1904-66_STG.fits').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            expect(hdus.length).toEqual(1);
            const header = hdus[0].header;
            const builder = new SphericalProjectionConvertersBuilder();

            expect(builder.canBuild(header)).toEqual(true);
            const converter = builder.build(header);

            const val = converter.convert({ x: 0, y: 0 });
            expect(val.alpha).toBeCloseTo(17.958550453510764, 0.00000001);
            expect(val.delta).toBeCloseTo(-73.25613046025057, 0.00000001);
        });
});

test('StereographicProjectionConverter \"STG\" projection converter build from definition tests.', () => {
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
                .map(x => x.value);

            const crvals = header.filter((o: any) => /CRVAL\d+/.test(o.key))
                .sort((a, b) => a.key.localeCompare(b.key))
                .map(x => x.value);

            const cdelts = header.filter((o: any) => /CDELT\d+/.test(o.key))
                .sort((a, b) => a.key.localeCompare(b.key))
                .map(x => x.value);

            const buildDefinition = {
                projection: 'STG',
                definition: {
                    frame_reference_point: {
                        x: crpixs[0] - 1,
                        y: crpixs[1] - 1,
                    },
                    sky_reference_point: {
                        alpha: crvals[0] / 180 * Math.PI,
                        delta: crvals[1] / 180 * Math.PI,
                    },
                    transform_matrix: [
                        [cdelts[0], 0],
                        [0, cdelts[1]],
                    ],
                    distortion_matrix: undefined,
                    celestial_pole: {
                        latitude: latpole / 180 * Math.PI,
                        longitude: lonpole  / 180 * Math.PI
                    }
                },
            };

            expect(builder.canBuild(buildDefinition.projection)).toEqual(true);
            const converter = builder.build(buildDefinition);

            const val = converter.convert({ x: 0, y: 0 });
            expect(val.alpha).toBeCloseTo(17.958550453510764, 0.00000001);
            expect(val.delta).toBeCloseTo(-73.25613046025057, 0.00000001);
        });
});

test('GnomonicProjectionConverter \"TAN\" projection converter build from header tests.', () => {
    const src = new ArrayBufferFile(fs.readFileSync('data/1904-66_TAN.fits').buffer);
    return src.initialize()
        .then(_ => FitsReader.readFitsAsync(src))
        .then(hdus => {
            expect(hdus.length).toEqual(1);
            const header = hdus[0].header;
            const builder = new SphericalProjectionConvertersBuilder();

            expect(builder.canBuild(header)).toEqual(true);
            const converter = builder.build(header);

            const val = converter.convert({ x: 0, y: 0 });
            expect(val.alpha).toEqual(18.0221890700062);
            expect(val.delta).toEqual(-72.61583231844779);
        });
});

test('GnomonicProjectionConverter \"TAN\" projection converter build from definition tests.', () => {
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
                .map(x => x.value);

            const crvals = header.filter((o: any) => /CRVAL\d+/.test(o.key))
                .sort((a, b) => a.key.localeCompare(b.key))
                .map(x => x.value);

            const cdelts = header.filter((o: any) => /CDELT\d+/.test(o.key))
                .sort((a, b) => a.key.localeCompare(b.key))
                .map(x => x.value);

            const buildDefinition = {
                projection: 'TAN',
                definition: {
                    frame_reference_point: {
                        x: crpixs[0] - 1,
                        y: crpixs[1] - 1,
                    },
                    sky_reference_point: {
                        alpha: crvals[0] / 180 * Math.PI,
                        delta: crvals[1] / 180 * Math.PI,
                    },
                    transform_matrix: [
                        [cdelts[0], 0],
                        [0, cdelts[1]],
                    ],
                    distortion_matrix: undefined,
                    celestial_pole: {
                        latitude: latpole / 180 * Math.PI,
                        longitude: lonpole  / 180 * Math.PI
                    }
                },
            };

            expect(builder.canBuild(buildDefinition.projection)).toEqual(true);
            const converter = builder.build(buildDefinition);

            const val = converter.convert({ x: 0, y: 0 });
            expect(val.alpha).toEqual(18.0221890700062);
            expect(val.delta).toEqual(-72.61583231844779);
        });
});
