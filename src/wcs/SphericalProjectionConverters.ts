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
    protected ra_p: number = NaN;//crvals[0] * de2ra;
    protected de_p: number = NaN;//crvals[1] * de2ra;
    protected theta_p: number = NaN;
    protected phi_p: number = NaN;

    protected ctypes: Array<string>;
    protected wcslen: number;
    protected cdelts: Array<number>;
    protected crpixs: Array<number>;
    protected crvals: Array<number>;
    protected pcs: Array<Array<number>>;

    protected projection: string;

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
    }

    protected convertToIntermediate(coords: { x: number, y: number }): { x: number, y: number } {
        var is: Array<number> = Array<number>();

        var crds = [coords.x, coords.y];
        for (var i = 0; i < this.wcslen; i += 1) {
            is[i] = 0;
            for (var j = 0; j < this.wcslen; j += 1) {
                is[i] += this.pcs[i][j] * ((crds[j] + 1) - this.crpixs[j]);
            }
            is[i] *= this.cdelts[i] * this.de2ra;
        }

        return { x: is[0], y: is[1] };
    }

    protected convertFromIntermediate(coords: { x: number, y: number }): { x: number, y: number } {
        throw 'NotImplemented';
    }

    abstract convertToSpherical(coords: { x: number, y: number }): { r: number, phi: number, theta: number };

    abstract convertFromSpherical(coords: { r: number, phi: number, theta: number }): { x: number, y: number };

    protected convertToCelestial(coords: { r: number, phi: number, theta: number }): { ra: number, dec: number } {
        var ra: number = NaN;
        var dec: number = NaN;

        if (this.de_p === Math.PI / 2) {
            ra = (this.ra_p + coords.phi - this.phi_p - Math.PI) * this.ra2de;
            dec = coords.theta * this.ra2de;
        }
        else if (this.de_p === -Math.PI / 2) {
            ra = (this.ra_p - coords.phi + this.phi_p) * this.ra2de;
            dec = -coords.theta * this.ra2de;
        }
        else {
            var sin_theta = Math.sin(coords.theta);
            var cos_theta = Math.cos(coords.theta);
            var sin_dphi = Math.sin(coords.phi - this.phi_p);
            var cos_dphi = Math.cos(coords.phi - this.phi_p);
            var sin_de_p = Math.sin(this.de_p);
            var cos_de_p = Math.cos(this.de_p);

            var xt = sin_theta * cos_de_p - cos_theta * sin_de_p * cos_dphi;
            var yt = -cos_theta * sin_dphi;
            var zt = sin_theta * sin_de_p + cos_theta * cos_de_p * cos_dphi;

            var ra = (Math.atan2(yt, xt) + this.ra_p) * this.ra2de;
            var dec = Math.asin(zt) * this.ra2de;
        }

        var ra = (ra + 360) % 360;
        ra /= 15;

        return { ra: ra, dec: dec };
    }

    protected convertFromCelestial(coords: { ra: number, dec: number }): { r: number, phi: number, theta: number } {
        throw 'NotImplemented';
    }

    convert(coords: { x: number, y: number }): { ra: number, dec: number } {
        return this.convertToCelestial(this.convertToSpherical(this.convertToIntermediate(coords)));
    }

    convertBack(coords: { ra: number, dec: number }): { x: number, y: number } {
        return this.convertFromIntermediate(this.convertFromSpherical(this.convertFromCelestial(coords)));
    }
}

export class GnomonicProjectionConverter extends BaseSphericalProjectionConverter implements ISphericalProjectionConverter {

    constructor(header: Array<any>) { super(header); }

    convertToSpherical(coords: { x: number, y: number }): { r: number, phi: number, theta: number } {
        var r = Math.sqrt(coords.x * coords.x + coords.y * coords.y);

        return {
            r: r,
            phi: Math.atan2(coords.x, -coords.y),
            theta: Math.acos(r)
        };
    }

    convertFromSpherical(coords: { r: number, phi: number, theta: number }): { x: number, y: number } {
        throw 'NotImplemented';
    }
}

export class SlantOrtographicProjectionConverter extends BaseSphericalProjectionConverter implements ISphericalProjectionConverter {

    constructor(header: Array<any>) { super(header); }

    convertToSpherical(coords: { x: number, y: number }): { r: number, phi: number, theta: number } {
        var r = Math.sqrt(coords.x * coords.x + coords.y * coords.y);

        return {
            r: r,
            phi: Math.atan2(coords.x, -coords.y),
            theta: Math.acos(r)
        };
    }

    convertFromSpherical(coords: { r: number, phi: number, theta: number }): { x: number, y: number } {
        throw 'NotImplemented';
    }
}

export class ZenithalEquidistantProjectionConverter extends BaseSphericalProjectionConverter implements ISphericalProjectionConverter {

    constructor(header: Array<any>) { super(header); }

    convertToSpherical(coords: { x: number, y: number }): { r: number, phi: number, theta: number } {
        var r = Math.sqrt(coords.x * coords.x + coords.y * coords.y);

        return {
            r: r,
            phi: Math.atan2(coords.x, -coords.y),
            theta: this.theta_0 - r
        };
    }

    convertFromSpherical(coords: { r: number, phi: number, theta: number }): { x: number, y: number } {
        throw 'NotImplemented';
    }
}

export class StereographicProjectionConverter extends BaseSphericalProjectionConverter implements ISphericalProjectionConverter {

    constructor(header: Array<any>) { super(header); }

    convertToSpherical(coords: { x: number, y: number }): { r: number, phi: number, theta: number } {
        var r = Math.sqrt(coords.x * coords.x + coords.y * coords.y);

        return {
            r: r,
            phi: Math.atan2(coords.x, -coords.y),
            theta: Math.PI / 2 - 2 * Math.atan(r / 2)
        };
    }

    convertFromSpherical(coords: { r: number, phi: number, theta: number }): { x: number, y: number } {
        throw 'NotImplemented';
    }
}

export class ZenithalEqualAreaProjectionConverter extends BaseSphericalProjectionConverter implements ISphericalProjectionConverter {

    constructor(header: Array<any>) { super(header); }

    convertToSpherical(coords: { x: number, y: number }): { r: number, phi: number, theta: number } {
        var r = Math.sqrt(coords.x * coords.x + coords.y * coords.y);

        return {
            r: r,
            phi: Math.atan2(coords.x, -coords.y),
            theta: Math.PI / 2 - 2 * Math.asin(r / 2)
        };
    }

    convertFromSpherical(coords: { r: number, phi: number, theta: number }): { x: number, y: number } {
        throw 'NotImplemented';
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