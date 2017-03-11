export interface ISphericalProjectionConverter {
    convert(coords: { x: number, y: number }): { ra: number, dec: number };
    convertBack(coords: { ra: number, dec: number }): { x: number, y: number };
}

// Zenithal projection

export abstract class BaseSphericalProjectionConverter {
    protected ra2de: number = 180 / Math.PI;
    protected de2ra: number = Math.PI / 180;

    protected phi_0: number = 0;
    protected theta_0: number = Math.PI / 2;
    protected ra_p: number = NaN;
    protected de_p: number = NaN;
    protected theta_p: number = NaN;
    protected phi_p: number = NaN;

    protected ctypes: Array<string>;
    protected wcslen: number;
    protected cdelts: Array<number>;
    protected crpixs: Array<number>;
    protected crvals: Array<number>;
    protected pcs: Array<Array<number>>;
    protected pcs_inv: Array<Array<number>>;

    protected projection: string;

    private inverseOf(arr: Array<Array<number>>): Array<Array<number>> {
        let det = arr[0][0] * arr[1][1] - arr[0][1] * arr[1][0];

        return [
            [arr[1][1] / det, -arr[0][1] / det],
            [-arr[1][0] / det, arr[0][0] / det]
        ];
    }

    constructor(header: Array<any>) {

        this.ctypes = header.filter(o => o.key.indexOf('CTYPE') === 0)
            .sort((a, b) => a.key.localeCompare(b.key))
            .map(val => val.value);

        if (this.ctypes.length <= 0)
            return;

        this.projection = this.ctypes[0].slice(5);

        this.wcslen = header.filter((o: any) => o.key.indexOf('NAXIS') === 0 && o.key !== 'NAXIS')
            .length;

        this.cdelts = header.filter((o: any) => o.key.indexOf('CDELT') === 0)
            .sort((a, b) => a.key.localeCompare(b.key))
            .map(val => val.value);

        this.crpixs = header.filter((o: any) => o.key.indexOf('CRPIX') === 0)
            .sort((a, b) => a.key.localeCompare(b.key))
            .map(val => val.value);

        this.crvals = header.filter((o: any) => o.key.indexOf('CRVAL') === 0)
            .sort((a, b) => a.key.localeCompare(b.key))
            .map(val => val.value);

        this.ra_p = this.crvals[0] * this.de2ra;
        this.de_p = this.crvals[1] * this.de2ra;

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

        if (this.phi_p === NaN) this.phi_p = (this.de_p >= this.theta_0) ? 0 : Math.PI;

        this.pcs = new Array<Array<number>>();

        let tmp: Array<any> = header.filter(o => o.key.indexOf('PC') === 0);

        // INFO: currently we compile down to es5 that doesn't have Array.prototype.find method.
        //       This should be changed to a polyfill at one point.
        var find_pc: (arr: Array<any>, key: string) => any = (arr: Array<any>, key: string): any => {
            for (var i = 0; i < arr.length; i++) {
                var kw = arr[i];

                if (kw.key === key)
                    return kw.value;
            }

            return undefined;
        };

        for (var i = 0; i < this.wcslen; i++) {
            this.pcs[i] = new Array<number>();

            for (var j = 0; j < this.wcslen; j++) {
                let pc_default = (i === j) ? 1 : 0;
                let pc_tmp = find_pc(tmp, 'PC' + (i + 1) + '_' + (j + 1));
                this.pcs[i][j] = (pc_tmp !== undefined) ? parseFloat(pc_tmp) : pc_default;
            }
        }

        this.pcs_inv = this.inverseOf(this.pcs);
    }

    protected convertToIntermediate(coords: { x: number, y: number }): { x: number, y: number } {
        let is: Array<number> = Array<number>();

        let crds = [coords.x, coords.y];
        for (var i = 0; i < this.wcslen; i += 1) {
            is[i] = 0;
            for (var j = 0; j < this.wcslen; j += 1) {
                is[i] += this.pcs[i][j] * (crds[j] + 1 - this.crpixs[j]);
            }
            is[i] *= this.cdelts[i] * this.de2ra;
        }

        return { x: is[0], y: is[1] };
    }

    protected convertFromIntermediate(coords: { x: number, y: number }): { x: number, y: number } {
        let is: Array<number> = Array<number>();

        let crds = [coords.x, coords.y];

        for (var i = 0; i < this.wcslen; i += 1) {
            is[i] = 0;
            for (var j = 0; j < this.wcslen; j += 1) {
                is[i] += this.pcs_inv[i][j] * crds[j];
            }
            is[i] *= this.ra2de / this.cdelts[i];
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
        let ra: number = NaN;
        let dec: number = NaN;

        if (this.de_p === Math.PI / 2) {
            ra = (this.ra_p + coords.phi - this.phi_p - Math.PI) * this.ra2de;
            dec = coords.theta * this.ra2de;
        }
        else if (this.de_p === -Math.PI / 2) {
            ra = (this.ra_p - coords.phi + this.phi_p) * this.ra2de;
            dec = -coords.theta * this.ra2de;
        }
        else {
            let sin_theta = Math.sin(coords.theta);
            let cos_theta = Math.cos(coords.theta);
            let sin_dphi = Math.sin(coords.phi - this.phi_p);
            let cos_dphi = Math.cos(coords.phi - this.phi_p);
            let sin_de_p = Math.sin(this.de_p);
            let cos_de_p = Math.cos(this.de_p);

            let xt = sin_theta * cos_de_p - cos_theta * sin_de_p * cos_dphi;
            let yt = -cos_theta * sin_dphi;
            let zt = sin_theta * sin_de_p + cos_theta * cos_de_p * cos_dphi;

            ra = (Math.atan2(yt, xt) + this.ra_p) * this.ra2de;
            dec = Math.asin(zt) * this.ra2de;
        }

        ra = (ra + 360) % 360;
        ra /= 15;

        return { ra: ra, dec: dec };
    }

    protected convertFromCelestialToAngles(coords: { ra: number, dec: number }): { phi: number, theta: number } {
        let phi: number;
        let theta: number;

        let ra: number = coords.ra * 15 * this.de2ra;
        let de: number = coords.dec * this.de2ra;

        if (this.de_p === Math.PI / 2) {
            phi = ra + Math.PI + this.phi_p - this.ra_p;
            theta = de;
        }
        else if (this.de_p === -Math.PI / 2) {
            phi = this.ra_p - ra + this.phi_p;
            theta = -de;
        }
        else {
            let sin_de = Math.sin(de);
            let cos_de = Math.cos(de);
            let sin_de_p = Math.sin(this.de_p);
            let cos_de_p = Math.cos(this.de_p);
            let cos_dra = Math.cos(ra - this.ra_p);
            let sin_dra = Math.sin(ra - this.ra_p);

            phi = this.phi_p + Math.atan2(sin_de * cos_de_p - cos_de * sin_de_p * cos_dra, -cos_de * sin_dra);
            theta = Math.asin(
                sin_de * sin_de_p + cos_de * cos_de_p * cos_dra
            );
        }

        return {
            phi: phi,
            theta: theta
        };
    }

    abstract convertFromCelestial(coords: { ra: number, dec: number }): { r: number, phi: number, theta: number };

    convert(coords: { x: number, y: number }): { ra: number, dec: number } {

        let toIntermediate = this.convertToIntermediate(coords);
        // console.log('To Intermediate');
        // console.log(toIntermediate);
        let toSpherical = this.convertToSpherical(toIntermediate);
        // console.log('To Spherical');
        // console.log(toSpherical);
        let toCelestial = this.convertToCelestial(toSpherical);
        // console.log('To Celestial');
        // console.log(toCelestial);
        return toCelestial;
    }

    convertBack(coords: { ra: number, dec: number }): { x: number, y: number } {
        let fromCelestial = this.convertFromCelestial(coords);
        // console.log('From Celestial');
        // console.log(fromCelestial);
        let fromSpherical = this.convertFromSpherical(fromCelestial);
        // console.log('From Spherical');
        // console.log(fromSpherical);
        let fromIntermediate = this.convertFromIntermediate(fromSpherical);
        // console.log('From Intermediate');
        // console.log(fromIntermediate);
        return fromIntermediate;
    }
}

export class GnomonicProjectionConverter extends BaseSphericalProjectionConverter implements ISphericalProjectionConverter {

    constructor(header: Array<any>) { super(header); }

    convertToSpherical(coords: { x: number, y: number }): { r: number, phi: number, theta: number } {
        var r = Math.sqrt(coords.x * coords.x + coords.y * coords.y);

        return {
            r: r,
            phi: Math.atan2(coords.x, -coords.y),
            theta: Math.atan(1/r)
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

export class SlantOrtographicProjectionConverter extends BaseSphericalProjectionConverter implements ISphericalProjectionConverter {

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

export class ZenithalEquidistantProjectionConverter extends BaseSphericalProjectionConverter implements ISphericalProjectionConverter {

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

export class StereographicProjectionConverter extends BaseSphericalProjectionConverter implements ISphericalProjectionConverter {

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

export class ZenithalEqualAreaProjectionConverter extends BaseSphericalProjectionConverter implements ISphericalProjectionConverter {

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