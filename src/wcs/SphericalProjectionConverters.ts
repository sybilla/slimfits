import { Keyword } from './../utils/KeywordsManager';
export interface IPlaneProjectionDefinition {
    frame_reference_point: { x: number, y: number };
    sky_reference_point: { alpha: number, delta: number };
    transform_matrix: number[][];
    distortion_matrix: number[][];
    celestial_pole: { latitude: number, longitude: number };   // degrees
}

export interface ISphericalProjectionConverter {
    convert(coords: { x: number, y: number }): { alpha: number, delta: number };
    convertBack(coords: { alpha: number, delta: number }): { x: number, y: number };
}

// TODO: we need to incorporate RADECSYS in processing
export abstract class SphericalProjectionConverterBase {

    // 'RA',   'DEC'  - equatorial coordinates    (=> meeus.EquatorialCoordinates?)
    // 'ELON', 'ELAT' - ecliptic coordinates      (=> meeus.EclipticCoordinates?)
    // 'GLON', 'GLAT' - galactic coordinates      (=> meeus.GalacticCoordinates?)
    // 'HLON', 'HLAT' - helioecliptic coordinates
    // 'SLON', 'SLAT' - supergalactic coordinates
    private static longitudalTypes: string[] = ['RA', 'ELON', 'GLON', 'HLON', 'SLON'];

    private static isLongitudal(type: string): boolean {
        for (const longitudalType of SphericalProjectionConverterBase.longitudalTypes) {
            if (longitudalType === type) {
                return true;
            }
        }
        return false;
    }

    protected ra2de: number = 180 / Math.PI;
    protected de2ra: number = Math.PI / 180;

    protected phi_0: number = NaN;
    protected theta_0: number = NaN;
    protected alpha_0: number = NaN;
    protected delta_0: number = NaN;
    protected theta_p: number = NaN;
    protected phi_p: number = NaN;

    protected ctypes: string[];
    protected wcslen: number;
    protected cdelts: number[];
    protected crpixs: number[];
    protected crvals: number[];
    protected crotas: number[];
    protected pvs: number[][] = undefined;
    protected transform_matrix: number[][] = undefined;
    protected inverse_transform_matrix: number[][] = undefined;

    protected projection: string;
    protected axes_types: Array<{ name: string, isLongitudal: boolean }>;

    constructor(obj: any[] | IPlaneProjectionDefinition) {

        if (Array.isArray(obj)) {
            this.constructFromHeader(obj);
        } else {
            this.constructFromDefinition(obj);
        }
    }

    convert(coords: { x: number, y: number }): { alpha: number, delta: number } {
        const intermediateCoords = this.convertToIntermediate(coords);
        const distortedIntermediateCoords = this.convertToDistorted(intermediateCoords);
        const sphericalCoords = this.convertToSpherical(distortedIntermediateCoords);
        const celestialCoords = this.convertToCelestial(sphericalCoords);
        return celestialCoords;
    }

    convertBack(coords: { alpha: number, delta: number }): { x: number, y: number } {
        const sphericalCoords = this.convertFromCelestial(coords);
        const distortedIntermediateCoords = this.convertFromSpherical(sphericalCoords);
        const intermediateCoords = this.convertFromDistorted(distortedIntermediateCoords);
        const plateCoords = this.convertFromIntermediate(intermediateCoords);
        return plateCoords;
    }

    abstract convertToSpherical(coords: { x: number, y: number }): { r: number, phi: number, theta: number };

    abstract calculate_alphap_deltap(): { alpha_p: number, delta_p: number };

    abstract calculate_phi0_theta0(): { phi_0: number, theta_0: number };

    abstract convertFromCelestial(coords: { alpha: number, delta: number }): { r: number, phi: number, theta: number };

    protected multiplyMatrices(arr1: number[][], arr2: number[][]): number[][] {
        const res: number[][] = [[0, 0], [0, 0]];

        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 2; col++) {
                for (let i = 0; i < 2; i++) {
                    res[row][col] += arr1[row][i] * arr2[i][col];
                }
            }
        }

        return res;
    }

    protected convertToDistorted(coords: { x: number, y: number }): { x: number, y: number } {
        if (this.pvs === undefined) {
            return coords;
        }

        const x = coords.x * this.ra2de;
        const y = coords.y * this.ra2de;

        const xout = this.getDistortedParam(x, y, this.pvs[0]);
        const yout = this.getDistortedParam(y, x, this.pvs[1]);

        return {
            x: xout * this.de2ra,
            y: yout * this.de2ra
        };
    }

    protected getDistortedParam(xi: number, eta: number, pv: number[]): number {

        const r = Math.sqrt(xi * xi + eta * eta);
        const r2 = r * r;
        const r3 = r * r2;
        const r4 = r * r3;
        const r5 = r * r4;
        const r6 = r * r5;
        const r7 = r * r6;

        const xi2 = xi * xi;
        const xi3 = xi * xi2;
        const xi4 = xi * xi3;
        const xi5 = xi * xi4;
        const xi6 = xi * xi5;
        const xi7 = xi * xi6;

        const eta2 = eta * eta;
        const eta3 = eta * eta2;
        const eta4 = eta * eta3;
        const eta5 = eta * eta4;
        const eta6 = eta * eta5;
        const eta7 = eta * eta6;

        return pv[0] + pv[1] * xi + pv[2] * eta + pv[3] * r +
            pv[4] * xi * xi + pv[5] * xi * eta + pv[6] * eta * eta +
            pv[7] * xi * xi * xi + pv[8] * xi * xi * eta + pv[9] * xi * eta * eta +
            pv[10] * eta * eta * eta + pv[11] * r * r * r +
            pv[12] * xi * xi * xi * xi + pv[13] * xi * xi * xi * eta +
            pv[14] * xi * xi * eta * eta + pv[15] * xi * eta * eta * eta +
            pv[16] * eta * eta * eta * eta +
            pv[17] * xi * xi * xi * xi * xi + pv[18] * xi * xi * xi * xi * eta +
            pv[19] * xi * xi * xi * eta * eta +
            pv[20] * xi * xi * eta * eta * eta + pv[21] * xi * eta * eta * eta * eta +
            pv[22] * eta * eta * eta * eta * eta + pv[23] * r * r * r * r * r +
            pv[24] * xi * xi * xi * xi * xi * xi + pv[25] * xi * xi * xi * xi * xi * eta +
            pv[26] * xi * xi * xi * xi * eta * eta + pv[27] * xi * xi * xi * eta * eta * eta +
            pv[28] * xi * xi * eta * eta * eta * eta + pv[29] * xi * eta * eta * eta * eta * eta +
            pv[30] * eta * eta * eta * eta * eta * eta +
            pv[31] * xi * xi * xi * xi * xi * xi * xi + pv[32] * xi * xi * xi * xi * xi * xi * eta +
            pv[33] * xi * xi * xi * xi * xi * eta * eta + pv[34] * xi * xi * xi * xi * eta * eta * eta +
            pv[35] * xi * xi * xi * eta * eta * eta * eta + pv[36] * xi * xi * eta * eta * eta * eta * eta +
            pv[37] * xi * eta * eta * eta * eta * eta * eta + pv[38] * eta * eta * eta * eta * eta * eta * eta +
            pv[39] * r * r * r * r * r * r * r;
    }

    protected convertFromDistorted(coords: { x: number, y: number }): { x: number, y: number } {

        if (this.pvs === undefined) {
            return coords;
        }

        throw new Error('NotImplemented');
    }

    protected convertToIntermediate(coords: { x: number, y: number }): { x: number, y: number } {
        const is: number[] = [];

        const crds = [coords.x, coords.y];
        for (let i = 0; i < this.wcslen; i += 1) {
            is[i] = 0;
            for (let j = 0; j < this.wcslen; j += 1) {
                is[i] += this.transform_matrix[i][j] * (crds[j] + 1 - this.crpixs[j]);
            }
            is[i] *= this.de2ra;
        }

        return { x: is[0], y: is[1] };
    }

    protected convertFromIntermediate(coords: { x: number, y: number }): { x: number, y: number } {
        const is: number[] = [];

        const crds = [coords.x, coords.y];
        for (let i = 0; i < this.wcslen; i += 1) {
            is[i] = 0;
            for (let j = 0; j < this.wcslen; j += 1) {
                is[i] += this.inverse_transform_matrix[i][j] * crds[j];
            }
            is[i] *= this.ra2de;
            is[i] += this.crpixs[i] - 1;
        }

        return { x: Math.round(is[0] * 1000) / 1000, y: Math.round(is[1] * 1000) / 1000 };
    }

    protected convertFromSpherical(coords: { r: number, phi: number, theta: number }): { x: number, y: number } {
        return {
            x: coords.r * Math.sin(coords.phi),
            y: -coords.r * Math.cos(coords.phi)
        };
    }

    protected convertToCelestial(coords: { r: number, phi: number, theta: number }): { alpha: number, delta: number } {
        let alpha: number = NaN;
        let delta: number = NaN;

        const coords_p = this.calculate_alphap_deltap();

        if (coords_p.delta_p === Math.PI / 2) {
            // SEE: http://www.aanda.org/articles/aa/pdf/2002/45/aah3860.pdf (eqn. 3)

            alpha = (coords_p.alpha_p + coords.phi - this.phi_p - Math.PI) * this.ra2de;
            delta = coords.theta * this.ra2de;
        } else if (coords_p.delta_p === -Math.PI / 2) {
            // SEE: http://www.aanda.org/articles/aa/pdf/2002/45/aah3860.pdf (eqn. 4)

            alpha = (coords_p.alpha_p - coords.phi + this.phi_p) * this.ra2de;
            delta = -coords.theta * this.ra2de;
        } else {
            // SEE: http://www.aanda.org/articles/aa/pdf/2002/45/aah3860.pdf (eqn. 2)

            const sin_theta = Math.sin(coords.theta);
            const cos_theta = Math.cos(coords.theta);
            const sin_dphi = Math.sin(coords.phi - this.phi_p);
            const cos_dphi = Math.cos(coords.phi - this.phi_p);
            const sin_de_p = Math.sin(coords_p.delta_p);
            const cos_de_p = Math.cos(coords_p.delta_p);

            const xt = sin_theta * cos_de_p - cos_theta * sin_de_p * cos_dphi;
            const yt = -cos_theta * sin_dphi;
            const zt = sin_theta * sin_de_p + cos_theta * cos_de_p * cos_dphi;

            alpha = (Math.atan2(yt, xt) + coords_p.alpha_p) * this.ra2de;
            delta = Math.asin(zt) * this.ra2de;
        }

        alpha = (alpha + 360) % 360;
        alpha /= 15;

        return { alpha, delta };
    }

    protected convertFromCelestialToAngles(coords: { alpha: number, delta: number }): { phi: number, theta: number } {
        let phi: number;
        let theta: number;

        const alpha: number = coords.alpha * 15 * this.de2ra;
        const delta: number = coords.delta * this.de2ra;

        const coords_p = this.calculate_alphap_deltap();

        if (coords_p.delta_p === Math.PI / 2) {
            // SEE: http://www.aanda.org/articles/aa/pdf/2002/45/aah3860.pdf (inverted eqn. 3)
            phi = alpha + Math.PI + this.phi_p - coords_p.alpha_p;
            theta = delta;
        } else if (coords_p.delta_p === -Math.PI / 2) {
            // SEE: http://www.aanda.org/articles/aa/pdf/2002/45/aah3860.pdf (inverted eqn. 4)
            phi = coords_p.alpha_p - alpha + this.phi_p;
            theta = -delta;
        } else {
            // SEE: http://www.aanda.org/articles/aa/pdf/2002/45/aah3860.pdf (eqn. 5)
            const sin_delta = Math.sin(delta);
            const cos_delta = Math.cos(delta);
            const sin_delta_p = Math.sin(coords_p.delta_p);
            const cos_delta_p = Math.cos(coords_p.delta_p);
            const cos_dalpha = Math.cos(alpha - coords_p.alpha_p);
            const sin_dalpha = Math.sin(alpha - coords_p.alpha_p);

            phi = this.phi_p + Math.atan2(
                sin_delta * cos_delta_p - cos_delta * sin_delta_p * cos_dalpha,
                -cos_delta * sin_dalpha
            );

            theta = Math.asin(sin_delta * sin_delta_p + cos_delta * cos_delta_p * cos_dalpha);
        }

        return { phi, theta };
    }

    private inverseOf(arr: number[][]): number[][] {
        const det = arr[0][0] * arr[1][1] - arr[0][1] * arr[1][0];

        const inv = [
            [arr[1][1] / det, -arr[0][1] / det],
            [-arr[1][0] / det, arr[0][0] / det]
        ];

        return inv;
    }

    private constructFromHeader(header: any[]) {

        // TODO: as the construction of a converter relies on CTYPE
        //       most likely obtaining/defining ctypes and axis_types
        //       should be removed from this place to the builder.
        //       Moreover, axes_types shall define whether we deal with
        //       equatorial, galactic or ecliptic coordinates.
        this.ctypes = header.filter(o => o.key.indexOf('CTYPE') === 0)
            .sort((a, b) => a.key.localeCompare(b.key))
            .map(val => val.value);

        if (this.ctypes.length <= 0) {
            return;
        }

        this.projection = this.ctypes[0].slice(5);

        this.axes_types = [];

        for (const ctype of this.ctypes) {
            const type = ctype.substr(0, 5).replace('-', '');
            this.axes_types.push(
                {
                    name: type,
                    isLongitudal: SphericalProjectionConverterBase.isLongitudal(type)
                }
            );
        }

        // TODO: WCS standard has an optional WCSAXES
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

        // TODO: currently with the below prescription we assume ra ~ x and dec ~ y
        //       (not to mention all the other coordinate systems).
        //       There must be implemented the logic describing
        this.alpha_0 = this.crvals[0] * this.de2ra;
        this.delta_0 = this.crvals[1] * this.de2ra;

        let latpole_found: boolean = false;
        let lonpole_found: boolean = false;

        for (const kw of header) {

            if (kw.key === 'LATPOLE') {
                this.theta_p = parseFloat(kw.value) * this.de2ra;
                latpole_found = true;
            }

            if (kw.key === 'LONPOLE') {
                this.phi_p = parseFloat(kw.value) * this.de2ra;
                lonpole_found = true;
            }

            if (latpole_found && lonpole_found) {
                break;
            }
        }

        const phitheta = this.calculate_phi0_theta0();

        this.phi_0 = phitheta.phi_0;
        this.theta_0 = phitheta.theta_0;

        if (isNaN(this.phi_p)) {
            this.phi_p = (this.delta_0 >= this.theta_0) ? 0 : Math.PI;
        }

        // INFO: currently we compile down to es5 that doesn't have Array.prototype.find method.
        //       This should be changed to a polyfill at one point.
        const find_element: (arr: any[], key: string) => any = (arr: any[], key: string): any => {
            for (const kw of arr) {
                if (kw.key === key) {
                    return kw.value;
                }
            }

            return undefined;
        };

        let default_for: (i: number, j: number) => number;
        let rot_matrix_key_regex = /CD\d+_\d+/;

        let rot_matrix_kws: any[] = header.filter(o => rot_matrix_key_regex.test(o.key));
        let rot_matrix_key_prefix = 'CD';
        let rot_can_create_transform_matrix = false;

        if (rot_matrix_kws != null && rot_matrix_kws.length > 0) {
            // CDs are present so we use them
            default_for = (_, __) => 0;

            // we must have at least one number given
            rot_can_create_transform_matrix = rot_matrix_kws.length > 0;
        } else {
            // CDs are not present. Find PC elements and CDELT elements

            rot_matrix_key_regex = /PC\d+_\d+/;
            rot_matrix_key_prefix = 'PC';
            rot_matrix_kws = header.filter(o => rot_matrix_key_regex.test(o.key));

            default_for = (i, j) => (i === j) ? 1 : 0;

            // we're good to go as there is a non-zero value
            rot_can_create_transform_matrix = true;
        }

        if (rot_can_create_transform_matrix) {
            this.transform_matrix = [];

            for (let i = 0; i < this.wcslen; i++) {
                this.transform_matrix[i] = [];

                for (let j = 0; j < this.wcslen; j++) {
                    const elem_default = default_for(i, j);
                    const loc_prefix = rot_matrix_key_prefix + (i + 1) + '_' + (j + 1);

                    const pc_tmp = find_element(rot_matrix_kws, loc_prefix);
                    this.transform_matrix[i][j] = (pc_tmp !== undefined) ? parseFloat(pc_tmp) : elem_default;
                }
            }
            if (rot_matrix_key_prefix === 'PC' && this.cdelts.length > 0) {
                this.transform_matrix = this.multiplyMatrices(
                    [[this.cdelts[0], 0], [0, this.cdelts[1]]], this.transform_matrix
                );
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
        if (this.transform_matrix === undefined && this.crotas !== undefined && this.crotas.length > 0) {

            this.transform_matrix = [
                [this.cdelts[0] * Math.cos(this.crotas[0]), -this.cdelts[1] * Math.sin(this.crotas[1])],
                [this.cdelts[0] * Math.sin(this.crotas[0]), this.cdelts[1] * Math.cos(this.crotas[1])]
            ];
        }

        this.inverse_transform_matrix = this.inverseOf(this.transform_matrix);

        // TPV convention: https://fits.gsfc.nasa.gov/registry/tpvwcs/tpv.html
        default_for = (i: number, j: number) => 0;

        const pvs_kws: any[] = header.filter(o => /PV\d+_\d+/.test(o.key));
        const pvs_prefix = 'PV';

        let pvs_cnt = 0;

        if (pvs_kws.length > 0) {
            this.pvs = [];

            for (let i = 0; i < this.wcslen; i++) {
                this.pvs[i] = [];

                for (let j = 0; j < 40; j++) {
                    const elem_default = default_for(i, j);
                    const loc_prefix = pvs_prefix + (i + 1) + '_' + (j);

                    const pv_tmp = find_element(pvs_kws, loc_prefix);
                    this.pvs[i][j] = (pv_tmp !== undefined) ? parseFloat(pv_tmp) : elem_default;
                    pvs_cnt += Math.abs(this.pvs[i][j]);
                }
            }
        }

        if (pvs_cnt === 0) {
            this.pvs = undefined;
        }
    }

    private constructFromDefinition(definition: IPlaneProjectionDefinition) {

        this.wcslen = 2;

        this.crpixs = [
            definition.frame_reference_point.x + 1,
            definition.frame_reference_point.y + 1
        ];

        this.alpha_0 = definition.sky_reference_point.alpha;
        this.delta_0 = definition.sky_reference_point.delta;

        const phitheta = this.calculate_phi0_theta0();

        // TODO: check whether it is ok.
        this.theta_p = definition.celestial_pole.latitude;
        this.phi_p = definition.celestial_pole.longitude;

        if (isNaN(this.phi_p)) {
            this.phi_p = (this.delta_0 >= this.theta_0) ? 0 : Math.PI;
        }

        this.phi_0 = phitheta.phi_0;
        this.theta_0 = phitheta.theta_0;

        this.transform_matrix = [];

        const dtm_length = definition.transform_matrix.length;

        for (let x = 0; x < dtm_length; x++) {
            this.transform_matrix[x] = [];
            const dtm_sub_length = definition.transform_matrix[x].length;

            for (let y = 0; y < dtm_sub_length; y++) {
                this.transform_matrix[x][y] = definition.transform_matrix[x][y];
            }
        }

        this.inverse_transform_matrix = this.inverseOf(this.transform_matrix);

        if (definition.distortion_matrix !== undefined) {
            this.pvs = [];

            const pvc_length = definition.distortion_matrix.length;

            for (let x = 0; x < pvc_length; x++) {
                this.pvs[x] = [];
                const pvc_sub_length = definition.distortion_matrix[x].length;
                let y = 0;
                for (; y < pvc_sub_length; y++) {
                    this.pvs[x][y] = definition.distortion_matrix[x][y];
                }
                for (; y < 40; y++) {
                    this.pvs[x][y] = 0.0;
                }
            }
        }
    }
}

// INFO: For zenithal projections, (phi_0, theta_0) = (0, PI / 2),
//       so the CRVAL elements specify the celestial coordinates
//       of the native pole, i.e. (ra_0, de_0) = (ra_p, de_p)
// TODO: as written above: this only works for zenithal projections.
//       It must be updated to work for all the others.
export abstract class ZenithalProjectionConverterBase extends SphericalProjectionConverterBase {

    calculate_alphap_deltap(): { alpha_p: number, delta_p: number } {
        return { alpha_p: this.alpha_0, delta_p: this.delta_0 };
    }

    // SEE: http://www.aanda.org/articles/aa/pdf/2002/45/aah3860.pdf, p. 1079, par 1
    calculate_phi0_theta0(): { phi_0: number, theta_0: number } {
        return { phi_0: 0, theta_0: Math.PI / 2 };
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
        throw new Error('NotImplemented');
    }
}

export class GnomonicProjectionConverter extends ZenithalProjectionConverterBase
    implements ISphericalProjectionConverter {

    convertToSpherical(coords: { x: number, y: number }): { r: number, phi: number, theta: number } {
        const r = Math.sqrt(coords.x * coords.x + coords.y * coords.y);

        return {
            r,
            phi: Math.atan2(coords.x, -coords.y),
            theta: Math.atan(1 / r)
        };
    }

    convertFromCelestial(coords: { alpha: number, delta: number }): { r: number, phi: number, theta: number } {

        const angles = super.convertFromCelestialToAngles(coords);

        return {
            r: 1.0 / Math.tan(angles.theta),
            phi: angles.phi,
            theta: angles.theta
        };
    }
}

export class SlantOrtographicProjectionConverter extends ZenithalProjectionConverterBase
    implements ISphericalProjectionConverter {

    convertToSpherical(coords: { x: number, y: number }): { r: number, phi: number, theta: number } {
        const r = Math.sqrt(coords.x * coords.x + coords.y * coords.y);

        return {
            r,
            phi: Math.atan2(coords.x, -coords.y),
            theta: Math.acos(r)
        };
    }

    convertFromCelestial(coords: { alpha: number, delta: number }): { r: number, phi: number, theta: number } {

        const angles = super.convertFromCelestialToAngles(coords);

        return {
            r: Math.cos(angles.theta),
            phi: angles.phi,
            theta: angles.theta
        };
    }
}

export class ZenithalEquidistantProjectionConverter extends ZenithalProjectionConverterBase
    implements ISphericalProjectionConverter {

    convertToSpherical(coords: { x: number, y: number }): { r: number, phi: number, theta: number } {
        const r = Math.sqrt(coords.x * coords.x + coords.y * coords.y);

        return {
            r,
            phi: Math.atan2(coords.x, -coords.y),
            theta: this.theta_0 - r
        };
    }

    convertFromCelestial(coords: { alpha: number, delta: number }): { r: number, phi: number, theta: number } {

        const angles = super.convertFromCelestialToAngles(coords);

        return {
            r: this.theta_0 - angles.theta,
            phi: angles.phi,
            theta: angles.theta
        };
    }
}

export class StereographicProjectionConverter extends ZenithalProjectionConverterBase
    implements ISphericalProjectionConverter {

    convertToSpherical(coords: { x: number, y: number }): { r: number, phi: number, theta: number } {
        const r = Math.sqrt(coords.x * coords.x + coords.y * coords.y);

        return {
            r,
            phi: Math.atan2(coords.x, -coords.y),
            theta: Math.PI / 2 - 2 * Math.atan(r / 2)
        };
    }

    convertFromCelestial(coords: { alpha: number, delta: number }): { r: number, phi: number, theta: number } {

        const angles = super.convertFromCelestialToAngles(coords);

        return {
            r: 2 * Math.tan((Math.PI / 2 - angles.theta) / 2),
            phi: angles.phi,
            theta: angles.theta
        };
    }
}

export class ZenithalEqualAreaProjectionConverter extends ZenithalProjectionConverterBase
    implements ISphericalProjectionConverter {

    convertToSpherical(coords: { x: number, y: number }): { r: number, phi: number, theta: number } {
        const r = Math.sqrt(coords.x * coords.x + coords.y * coords.y);

        return {
            r,
            phi: Math.atan2(coords.x, -coords.y),
            theta: Math.PI / 2 - 2 * Math.asin(r / 2)
        };
    }

    convertFromCelestial(coords: { alpha: number, delta: number }): { r: number, phi: number, theta: number } {

        const angles = super.convertFromCelestialToAngles(coords);

        return {
            r: 2 * Math.sin((Math.PI / 2 - angles.theta) / 2),
            phi: angles.phi,
            theta: angles.theta
        };
    }
}

export class SphericalProjectionConvertersBuilder {

    private registeredConverters: {
        [id: string]: (obj: any[] | IPlaneProjectionDefinition) => ISphericalProjectionConverter
    };

    constructor() {
        this.registeredConverters = {
            TAN: (header: any[]) => new GnomonicProjectionConverter(header),
            TPV: (header: any[]) => new GnomonicProjectionConverter(header),
            SIN: (header: any[]) => new SlantOrtographicProjectionConverter(header),
            ARC: (header: any[]) => new ZenithalEquidistantProjectionConverter(header),
            STG: (header: any[]) => new StereographicProjectionConverter(header),
            ZEA: (header: any[]) => new ZenithalEqualAreaProjectionConverter(header)
        };
    }

    canBuild(obj: any[] | string): boolean {
        let projection: string = null;

        if (Array.isArray(obj)) {
            projection = this.canBuildInner(obj as any[]);
        } else {
            projection = obj as string;
        }

        return (projection === null) ? false : this.registeredConverters.hasOwnProperty(projection);
    }

    build(obj: any[] | { projection: string, definition: IPlaneProjectionDefinition }): ISphericalProjectionConverter {

        let projection: string = null;

        if (Array.isArray(obj)) {
            projection = this.canBuildInner(obj as any[]);

            if (projection !== null) {
                return this.registeredConverters[projection](obj);
            }
        } else {
            if (this.registeredConverters.hasOwnProperty(obj.projection)) {
                return this.registeredConverters[obj.projection](obj.definition);
            }
        }

        throw new Error('No converter for projection "' + projection + '" registered.');
    }

    registerConverter(projection: string, converter: (header: any[]) => ISphericalProjectionConverter): void {
        this.registeredConverters[projection] = converter;
    }
    private canBuildInner(header: any[]): string {
        const ctypes = header.filter(o => o.key.indexOf('CTYPE') === 0)
            .sort((a, b) => a.key.localeCompare(b.key))
            .map(val => val.value);

        if (ctypes.length <= 0) {
            return null;
        }

        return ctypes[0].slice(5);
    }
}
