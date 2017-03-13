export interface ISphericalProjectionConverter {
    convert(coords: { x: number, y: number }): { ra: number, dec: number };
    convertBack(coords: { ra: number, dec: number }): { x: number, y: number };
}

// TODO: we need to incorporate RADECSYS in processing
export abstract class SphericalProjectionConverterBase {

    // 'RA',   'DEC'  - equatorial coordinates    (=> meeus.EquatorialCoordinates?)
    // 'ELON', 'ELAT' - ecliptic coordinates      (=> meeus.EclipticCoordinates?)
    // 'GLON', 'GLAT' - galactic coordinates      (=> meeus.GalacticCoordinates?)
    // 'HLON', 'HLAT' - helioecliptic coordinates
    // 'SLON', 'SLAT' - supergalactic coordinates 
    private static longitudalTypes: Array<string> = ['RA', 'ELON', 'GLON', 'HLON', 'SLON'];

    protected ra2de: number = 180 / Math.PI;
    protected de2ra: number = Math.PI / 180;

    protected phi_0: number = NaN;
    protected theta_0: number = NaN;
    protected alpha_0: number = NaN;
    protected delta_0: number = NaN;
    protected theta_p: number = NaN;
    protected phi_p: number = NaN;

    protected ctypes: Array<string>;
    protected wcslen: number;
    protected cdelts: Array<number>;
    protected crpixs: Array<number>;
    protected crvals: Array<number>;
    protected crotas: Array<number>;
    protected transform_matrix: Array<Array<number>> = undefined;
    protected inverse_transform_matrix: Array<Array<number>> = undefined;

    protected projection: string;
    protected axes_types: Array<{ name: string, isLongitudal: boolean }>;

    private static isLongitudal(type: string): boolean {
        for (let i = 0; i < SphericalProjectionConverterBase.longitudalTypes.length; i++) {
            if (SphericalProjectionConverterBase.longitudalTypes[i] === type)
                return true;
        }
        return false;
    }

    private inverseOf(arr: Array<Array<number>>): Array<Array<number>> {
        let det = arr[0][0] * arr[1][1] - arr[0][1] * arr[1][0];

        return [
            [arr[1][1] / det, -arr[0][1] / det],
            [-arr[1][0] / det, arr[0][0] / det]
        ];
    }

    constructor(header: Array<any>) {

        // TODO: as the construction of a converter relies on CTYPE
        //       most likely obtaining/defining ctypes and axis_types
        //       should be removed from this place to the builder.
        //       Moreover, axes_types shall define whether we deal with
        //       equatorial, galactic or ecliptic coordinates. 
        this.ctypes = header.filter(o => o.key.indexOf('CTYPE') === 0)
            .sort((a, b) => a.key.localeCompare(b.key))
            .map(val => val.value);

        if (this.ctypes.length <= 0)
            return;

        this.projection = this.ctypes[0].slice(5);

        this.axes_types = [];
        for (let i = 0; i < this.ctypes.length; i++) {
            let type = this.ctypes[i].substr(0, 5).replace('-', '');
            this.axes_types.push(
                {
                    name: type,
                    isLongitudal: SphericalProjectionConverterBase.isLongitudal(type)
                }
            );
        }

        // TODO: WCS standard has an optional 
        this.wcslen = header.filter((o: any) => /NAXIS\d+/.test(o.key))
            .length;

        this.crpixs = header.filter((o: any) => /CRPIX\d+/.test(o.key))
            .sort((a, b) => a.key.localeCompare(b.key))
            .map(val => val.value);

        this.crvals = header.filter((o: any) => /CRVAL\d+/.test(o.key))
            .sort((a, b) => a.key.localeCompare(b.key))
            .map(val => val.value);

        this.cdelts = header.filter((o: any) => /CDELT\d+/.test(o.key))
            .sort((a, b) => a.key.localeCompare(b.key))
            .map(val => val.value);

        this.alpha_0 = this.crvals[0] * this.de2ra;
        this.delta_0 = this.crvals[1] * this.de2ra;

        var latpole_found: boolean = false;
        var lonpole_found: boolean = false;

        for (var i = 0; i < header.length; i += 1) {
            var kw = header[i];

            if (kw.key === 'LATPOLE') {
                this.theta_p = parseFloat(kw.value) * this.de2ra;
                latpole_found = true;
            }

            if (kw.key === 'LONPOLE') {
                this.phi_p = parseFloat(kw.value) * this.de2ra;
                lonpole_found = true;
            }

            if (latpole_found && lonpole_found)
                break;
        }

        if (isNaN(this.phi_p)) this.phi_p = (this.delta_0 >= this.theta_0) ? 0 : Math.PI;

        // INFO: currently we compile down to es5 that doesn't have Array.prototype.find method.
        //       This should be changed to a polyfill at one point.
        var find_element: (arr: Array<any>, key: string) => any = (arr: Array<any>, key: string): any => {
            for (var i = 0; i < arr.length; i++) {
                var kw = arr[i];

                if (kw.key === key)
                    return kw.value;
            }

            return undefined;
        };

        var default_for: (i: number, j: number) => number;
        var rot_matrix_key_regex = /CD\d+_\d+/;

        let rot_matrix_kws: Array<any> = header.filter(o => rot_matrix_key_regex.test(o.key));
        let rot_matrix_key_prefix = 'CD';
        if (rot_matrix_kws != null && rot_matrix_kws.length > 0) {
            // CDs are present so we use them
            default_for = (i, j) => 0;
        } else {
            // CDs are not present. Find PC elements and CDELT elements

            rot_matrix_key_regex = /PC\d+_\d+/;
            rot_matrix_key_prefix = 'PC';
            rot_matrix_kws = header.filter(o => rot_matrix_key_regex.test(o.key));

            default_for = (i, j) => (i === j) ? 1 : 0;
        }

        if (rot_matrix_kws.length > 0) {
            this.transform_matrix = [];

            for (var i = 0; i < this.wcslen; i++) {
                this.transform_matrix[i] = new Array<number>();

                for (var j = 0; j < this.wcslen; j++) {
                    let elem_default = default_for(i, j);//(i === j) ? 1 : 0;
                    let pc_tmp = find_element(rot_matrix_kws, rot_matrix_key_prefix + (i + 1) + '_' + (j + 1));
                    this.transform_matrix[i][j] = (pc_tmp !== undefined) ? parseFloat(pc_tmp) : elem_default;
                }
            }

            if (rot_matrix_key_prefix === "PC" && this.cdelts.length > 0) {
                this.transform_matrix = this.multipleMatrices([[this.cdelts[0], 0], [0, this.cdelts[1]]], this.transform_matrix);
            }
        }

        // We rely on the CD formalism, meaning our transform_matrix IS de facto CDs array.
        // Thus to cover for that when a FITS file uses PC formalism we reformat [CDELTs]*[PCs]
        // according to the equation below. 
        // SEE: http://www.aanda.org/articles/aa/pdf/2002/45/aah3860.pdf
        //      The translation between CD and PC formalism is:
        //      / CD1_1 CD1_2 \ - / CDELT1    0   \ . / PC1_1 PC1_2 \
        //      \ CD2_1 CD2_2 / - \   0    CDELT2 /   \ PC2_1 PC2_2 /

        this.crotas = header.filter((o: any) => /CROTA\d+/.test(o.key))
            .sort((a, b) => a.key.localeCompare(b.key))
            .map(val => val.value);

        // SEE: http://www.aanda.org/articles/aa/pdf/2002/45/aah3860.pdf (section 6.1)
        //      we don't want to use CROTA as it's obsolete, but just in case 
        //      the implementation is given below

        // SEE: http://www.aanda.org/articles/aa/pdf/2002/45/aah3860.pdf, eqn/ 186, 187, 188 & 189
        if (this.transform_matrix === undefined && this.crotas != undefined && this.crotas.length > 0) {
            this.transform_matrix = [
                [this.cdelts[0] * Math.cos(this.crotas[0]), -this.cdelts[1] * Math.sin(this.crotas[1])],
                [this.cdelts[0] * Math.sin(this.crotas[0]), this.cdelts[1] * Math.cos(this.crotas[1])]
            ];
        }

        this.inverse_transform_matrix = this.inverseOf(this.transform_matrix);
    }

    protected multipleMatrices(arr1: Array<Array<number>>, arr2: Array<Array<number>>): Array<Array<number>> {

        var res: Array<Array<number>> = [[0, 0], [0, 0]];

        for (var row = 0; row < 2; row++) {
            for (var col = 0; col < 2; col++) {
                for (var i = 0; i < 2; i++) {
                    res[row][col] += arr1[row][i] * arr2[row][i];
                }
            }
        }

        return res;
    }

    protected convertToIntermediate(coords: { x: number, y: number }): { x: number, y: number } {
        let is: Array<number> = Array<number>();

        let crds = [coords.x, coords.y];
        for (var i = 0; i < this.wcslen; i += 1) {
            is[i] = 0;
            for (var j = 0; j < this.wcslen; j += 1) {
                is[i] += this.transform_matrix[i][j] * (crds[j] + 1 - this.crpixs[j]);
            }
            is[i] *= this.de2ra;
        }

        return { x: is[0], y: is[1] };
    }

    protected convertFromIntermediate(coords: { x: number, y: number }): { x: number, y: number } {
        let is: Array<number> = Array<number>();

        let crds = [coords.x, coords.y];
        for (var i = 0; i < this.wcslen; i += 1) {
            is[i] = 0;
            for (var j = 0; j < this.wcslen; j += 1) {
                is[i] += this.inverse_transform_matrix[i][j] * crds[j];
            }
            is[i] *= this.ra2de;
            is[i] += this.crpixs[i] - 1;
        }

        return { x: Math.round(is[0] * 1000) / 1000, y: Math.round(is[1] * 1000) / 1000 };
    }

    abstract convertToSpherical(coords: { x: number, y: number }): { r: number, phi: number, theta: number };

    protected convertFromSpherical(coords: { r: number, phi: number, theta: number }): { x: number, y: number } {
        return {
            x: coords.r * Math.sin(coords.phi),
            y: -coords.r * Math.cos(coords.phi)
        };
    }

    protected convertToCelestial(coords: { r: number, phi: number, theta: number }): { ra: number, dec: number } {
        let alpha: number = NaN;
        let delta: number = NaN;

        let coords_p = this.calculate_alphap_deltap();

        if (coords_p.delta_p === Math.PI / 2) {
            // SEE: http://www.aanda.org/articles/aa/pdf/2002/45/aah3860.pdf (eqn. 3)
            alpha = (coords_p.alpha_p + coords.phi - this.phi_p - Math.PI) * this.ra2de;
            delta = coords.theta * this.ra2de;
        }
        else if (coords_p.delta_p === -Math.PI / 2) {
            // SEE: http://www.aanda.org/articles/aa/pdf/2002/45/aah3860.pdf (eqn. 4)
            alpha = (coords_p.alpha_p - coords.phi + this.phi_p) * this.ra2de;
            delta = -coords.theta * this.ra2de;
        }
        else {
            // SEE: http://www.aanda.org/articles/aa/pdf/2002/45/aah3860.pdf (eqn. 2)

            let sin_theta = Math.sin(coords.theta);
            let cos_theta = Math.cos(coords.theta);
            let sin_dphi = Math.sin(coords.phi - this.phi_p);
            let cos_dphi = Math.cos(coords.phi - this.phi_p);
            let sin_de_p = Math.sin(coords_p.delta_p);
            let cos_de_p = Math.cos(coords_p.delta_p);

            let xt = sin_theta * cos_de_p - cos_theta * sin_de_p * cos_dphi;
            let yt = -cos_theta * sin_dphi;
            let zt = sin_theta * sin_de_p + cos_theta * cos_de_p * cos_dphi;

            alpha = (Math.atan2(yt, xt) + coords_p.alpha_p) * this.ra2de;
            delta = Math.asin(zt) * this.ra2de;
        }

        alpha = (alpha + 360) % 360;
        alpha /= 15;

        return { ra: alpha, dec: delta };
    }

    abstract calculate_alphap_deltap(): { alpha_p: number, delta_p: number };

    protected convertFromCelestialToAngles(coords: { ra: number, dec: number }): { phi: number, theta: number } {
        let phi: number;
        let theta: number;

        let alpha: number = coords.ra * 15 * this.de2ra;
        let delta: number = coords.dec * this.de2ra;

        let coords_p = this.calculate_alphap_deltap();

        if (coords_p.delta_p === Math.PI / 2) {
            // SEE: http://www.aanda.org/articles/aa/pdf/2002/45/aah3860.pdf (inverted eqn. 3)
            phi = alpha + Math.PI + this.phi_p - coords_p.alpha_p;
            theta = delta;
        }
        else if (coords_p.delta_p === -Math.PI / 2) {
            // SEE: http://www.aanda.org/articles/aa/pdf/2002/45/aah3860.pdf (inverted eqn. 4)
            phi = coords_p.alpha_p - alpha + this.phi_p;
            theta = -delta;
        }
        else {
            // SEE: http://www.aanda.org/articles/aa/pdf/2002/45/aah3860.pdf (eqn. 5)
            let sin_delta = Math.sin(delta);
            let cos_delta = Math.cos(delta);
            let sin_delta_p = Math.sin(coords_p.delta_p);
            let cos_delta_p = Math.cos(coords_p.delta_p);
            let cos_dalpha = Math.cos(alpha - coords_p.alpha_p);
            let sin_dalpha = Math.sin(alpha - coords_p.alpha_p);

            phi = this.phi_p + Math.atan2(sin_delta * cos_delta_p - cos_delta * sin_delta_p * cos_dalpha, -cos_delta * sin_dalpha);
            theta = Math.asin(sin_delta * sin_delta_p + cos_delta * cos_delta_p * cos_dalpha);
        }

        return { phi: phi, theta: theta };
    }

    abstract convertFromCelestial(coords: { ra: number, dec: number }): { r: number, phi: number, theta: number };

    convert(coords: { x: number, y: number }): { ra: number, dec: number } {

        let intermediateCoords = this.convertToIntermediate(coords);
        // console.log('plate        => intermediate');
        // console.log(intermediateCoords);
        let sphericalCoords = this.convertToSpherical(intermediateCoords);
        // console.log('intermediate => spherical');
        // console.log(sphericalCoords);
        let celestialCoords = this.convertToCelestial(sphericalCoords);
        // console.log('spherical    => celestial');
        // console.log(celestialCoords);
        return celestialCoords;
    }

    convertBack(coords: { ra: number, dec: number }): { x: number, y: number } {
        let sphericalCoords = this.convertFromCelestial(coords);
        // console.log('celestial    => spherical');
        // console.log(sphericalCoords);
        let intermediateCoords = this.convertFromSpherical(sphericalCoords);
        // console.log('spherical    => intermediate');
        // console.log(intermediateCoords);
        let plateCoords = this.convertFromIntermediate(intermediateCoords);
        // console.log('intermediate => plate');
        // console.log(plateCoords);
        return plateCoords;
    }
}

// INFO: For zenithal projections, (phi_0, theta_0) = (0, PI / 2),
//       so the CRVAL elements specify the celestial coordinates
//       of the native pole, i.e. (ra_0, de_0) = (ra_p, de_p)
// TODO: as written above: this only works for zenithal projections.
//       It must be updated to work for all the others.
export abstract class ZenithalProjectionConverterBase extends SphericalProjectionConverterBase {

    constructor(header: Array<any>) {
        super(header);

        // SEE: http://www.aanda.org/articles/aa/pdf/2002/45/aah3860.pdf, p. 1079, par 1
        this.phi_0 = 0;
        this.theta_0 = Math.PI / 2;
    }

    calculate_alphap_deltap(): { alpha_p: number, delta_p: number } {
        return { alpha_p: this.alpha_0, delta_p: this.delta_0 };
    }
}

// INFO: For zenithal projections, (phi_0, theta_0) = (0, PI / 2),
//       so the CRVAL elements specify the celestial coordinates
//       of the native pole, i.e. (ra_0, de_0) = (ra_p, de_p)
// TODO: as written above: this only works for zenithal projections.
//       It must be updated to work for all the others.
//       See: http://www.aanda.org/articles/aa/pdf/2002/45/aah3860.pdf (eqns: 8, 9, 10)
export abstract class NonPolarProjectionConverterBase extends SphericalProjectionConverterBase {
    calculate_alphap_deltap(): { alpha_p: number, delta_p: number } {
        throw 'NotImplemented';
    }
}

export class GnomonicProjectionConverter extends ZenithalProjectionConverterBase implements ISphericalProjectionConverter {

    constructor(header: Array<any>) { super(header); }

    convertToSpherical(coords: { x: number, y: number }): { r: number, phi: number, theta: number } {
        var r = Math.sqrt(coords.x * coords.x + coords.y * coords.y);

        return {
            r: r,
            phi: Math.atan2(coords.x, -coords.y),
            theta: Math.atan(1 / r)
        };
    }

    convertFromCelestial(coords: { ra: number, dec: number }): { r: number, phi: number, theta: number } {

        let angles = super.convertFromCelestialToAngles(coords);

        return {
            r: 1.0 / Math.tan(angles.theta),
            phi: angles.phi,
            theta: angles.theta
        };
    }
}

export class SlantOrtographicProjectionConverter extends ZenithalProjectionConverterBase implements ISphericalProjectionConverter {

    constructor(header: Array<any>) { super(header); }

    convertToSpherical(coords: { x: number, y: number }): { r: number, phi: number, theta: number } {
        let r = Math.sqrt(coords.x * coords.x + coords.y * coords.y);

        return {
            r: r,
            phi: Math.atan2(coords.x, -coords.y),
            theta: Math.acos(r)
        };
    }

    convertFromCelestial(coords: { ra: number, dec: number }): { r: number, phi: number, theta: number } {

        let angles = super.convertFromCelestialToAngles(coords);

        return {
            r: Math.cos(angles.theta),
            phi: angles.phi,
            theta: angles.theta
        };
    }
}

export class ZenithalEquidistantProjectionConverter extends ZenithalProjectionConverterBase implements ISphericalProjectionConverter {

    constructor(header: Array<any>) { super(header); }

    convertToSpherical(coords: { x: number, y: number }): { r: number, phi: number, theta: number } {
        let r = Math.sqrt(coords.x * coords.x + coords.y * coords.y);

        return {
            r: r,
            phi: Math.atan2(coords.x, -coords.y),
            theta: this.theta_0 - r
        };
    }

    convertFromCelestial(coords: { ra: number, dec: number }): { r: number, phi: number, theta: number } {

        let angles = super.convertFromCelestialToAngles(coords);

        return {
            r: this.theta_0 - angles.theta,
            phi: angles.phi,
            theta: angles.theta
        };
    }
}

export class StereographicProjectionConverter extends ZenithalProjectionConverterBase implements ISphericalProjectionConverter {

    constructor(header: Array<any>) { super(header); }

    convertToSpherical(coords: { x: number, y: number }): { r: number, phi: number, theta: number } {
        let r = Math.sqrt(coords.x * coords.x + coords.y * coords.y);

        return {
            r: r,
            phi: Math.atan2(coords.x, -coords.y),
            theta: Math.PI / 2 - 2 * Math.atan(r / 2)
        };
    }

    convertFromCelestial(coords: { ra: number, dec: number }): { r: number, phi: number, theta: number } {

        let angles = super.convertFromCelestialToAngles(coords);

        return {
            r: 2 * Math.tan((Math.PI / 2 - angles.theta) / 2),
            phi: angles.phi,
            theta: angles.theta
        };
    }
}

export class ZenithalEqualAreaProjectionConverter extends ZenithalProjectionConverterBase implements ISphericalProjectionConverter {

    constructor(header: Array<any>) { super(header); }

    convertToSpherical(coords: { x: number, y: number }): { r: number, phi: number, theta: number } {
        let r = Math.sqrt(coords.x * coords.x + coords.y * coords.y);

        return {
            r: r,
            phi: Math.atan2(coords.x, -coords.y),
            theta: Math.PI / 2 - 2 * Math.asin(r / 2)
        };
    }

    convertFromCelestial(coords: { ra: number, dec: number }): { r: number, phi: number, theta: number } {

        let angles = super.convertFromCelestialToAngles(coords);

        return {
            r: 2 * Math.sin((Math.PI / 2 - angles.theta) / 2),
            phi: angles.phi,
            theta: angles.theta
        };
    }
}

export class SphericalProjectionConvertersBuilder {

    private registeredConverters: { [id: string]: (header: Array<any>) => ISphericalProjectionConverter };

    constructor() {
        this.registeredConverters = {};

        this.registeredConverters["TAN"] = (header: Array<any>) => new GnomonicProjectionConverter(header);
        this.registeredConverters["SIN"] = (header: Array<any>) => new SlantOrtographicProjectionConverter(header);
        this.registeredConverters["ARC"] = (header: Array<any>) => new ZenithalEquidistantProjectionConverter(header);
        this.registeredConverters["STG"] = (header: Array<any>) => new StereographicProjectionConverter(header);
        this.registeredConverters["ZEA"] = (header: Array<any>) => new ZenithalEqualAreaProjectionConverter(header);
    }

    private canBuildInner(header: Array<any>): string {
        let ctypes = header.filter(o => o.key.indexOf('CTYPE') === 0)
            .sort((a, b) => a.key.localeCompare(b.key))
            .map(val => val.value);

        if (ctypes.length <= 0)
            return null;

        return ctypes[0].slice(5);
    }

    canBuild(header: Array<any>): boolean {
        let projection = this.canBuildInner(header);
        return (projection === null) ? false : this.registeredConverters.hasOwnProperty(projection);
    }

    build(header: Array<any>): ISphericalProjectionConverter {
        let projection = this.canBuildInner(header);
        if (projection !== null)
            return this.registeredConverters[projection](header);

        throw 'No converter for projection "' + projection + '" registered.';
    }

    registerConverter(projection: string, converter: (header: Array<any>) => ISphericalProjectionConverter): void {
        this.registeredConverters[projection] = converter;
    }
}