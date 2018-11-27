import { BitPix } from '../interfaces';

export interface IConverter {
    convert(value: any): string;
    convertBack(value: string): any;
}

export class StringConverter implements IConverter {
    convert(value: string): string {
        return value.replace(/\'/g, '\'\'');
    }

    convertBack(value: string): string {
        if (value.charAt(0) === '\'') {
            value = value.substr(1);
        }
        if (value.charAt(value.length - 1) === '\'') {
            value = value.substr(0, value.length - 1);
        }
        return value.replace(/\'\'/g, '\'').toString().trim();
    }

}

export class IntConverter implements IConverter {
    convert(value: number): string {
        return value.toString();
    }

    convertBack(value: string): number {
        return parseInt(value, 10);
    }
}

export class FloatConverter implements IConverter {
    convert(value: number): string {
        return value.toString();
    }

    convertBack(value: string): number {
        return parseFloat(value);
    }
}

export class DateConverter implements IConverter {
    convert(value: Date): string {
        throw new Error('DateFitsValueConverter.convert not implemented');
    }

    convertBack(stringValue: string) {
        if (stringValue[0] === '\'') {
            stringValue = stringValue.slice(1);
        }

        if (stringValue[stringValue.length - 1] === '\'') {
            stringValue = stringValue.slice(0, stringValue.length - 1);
        }

        if (isNaN(Date.parse(stringValue))) {
            throw new Error('DateFitsValueConverter.convertBack error parsing ' + stringValue);
        }

        return new Date(stringValue);
    }
}

export class BooleanConverter implements IConverter {
    convert(value: boolean): string {
        if (value) {
            return 'T';
        } else {
            return 'F';
        }
    }

    convertBack(stringValue: string): boolean {
        return stringValue.toString().trim().toUpperCase() === 'T';
    }
}

export class BitPixConverter implements IConverter {
    convert(value: BitPix): string {
        return value.toString();
    }

    convertBack(value: string): BitPix {
        return parseInt(value, 10);
    }
}

const registeredNames = {
    ZBITPIX: new BitPixConverter(),
    BITPIX: new BitPixConverter(),
    NAXIS: new IntConverter(),
    NAXIS1: new IntConverter(),
    NAXIS2: new IntConverter(),
    NAXIS3: new IntConverter(),
    YBINNING: new IntConverter(),
    XBINNING: new IntConverter(),
    PCOUNT: new IntConverter(),
    GCOUNT: new IntConverter(),
    NSEGMENT: new IntConverter(),
    BSCALE: new FloatConverter(),
    BZERO: new FloatConverter(),
    EPOCH: new StringConverter(),
    EQUINOX: new FloatConverter(),
    ALTRVAL: new FloatConverter(),
    ALTRPIX: new FloatConverter(),
    RESTFREQ: new FloatConverter(),
    DATAMAX: new FloatConverter(),
    DATAMIN: new FloatConverter(),
    RA: new FloatConverter(),
    DEC: new FloatConverter(),
    OBSRA: new FloatConverter(),
    OBSDEC: new FloatConverter(),
    XSHIFT: new FloatConverter(),
    YSHIFT: new FloatConverter(),
    // ORBEPOCH: new DateConverter(),
    SIMPLE: new BooleanConverter(),
    GROUPS: new BooleanConverter(),
    BLOCKED: new BooleanConverter(),
    EXTEND: new BooleanConverter(),
    SEQVALID: new BooleanConverter(),
    TFIELDS: new IntConverter(),
    ZIMAGE: new BooleanConverter(),
    ZVAL1: new IntConverter(),
    ZVAL2: new IntConverter(),
    ZTILE1: new IntConverter(),
    ZTILE2: new IntConverter(),
    ZDITHER0: new IntConverter()
};

const registeredPrefixedNames = {
    'NAXIS': new IntConverter(),
    'NSEG': new IntConverter(),
    // DATE: new DateConverter(),
    'CRVAL': new FloatConverter(),
    'CDELT': new FloatConverter(),
    'CRPIX': new FloatConverter(),
    'CROTA': new FloatConverter(),
    'PHAS': new FloatConverter(),
    'PSCAL': new FloatConverter(),
    'PZERO': new FloatConverter(),
    'SDLT': new FloatConverter(),
    'SRVL': new FloatConverter(),
    'SRPX': new FloatConverter(),
    'DBJD': new FloatConverter(),
    'THDA-': new FloatConverter()
};

const registeredTypes = {
    int: new IntConverter(),
    float: new FloatConverter(),
    string: new StringConverter(),
    date: new DateConverter(),
    boolean: new BooleanConverter()
};

export const ValueConverters = {
    registeredNames,
    registeredPrefixedNames,
    registeredTypes,
    defaultConverter: new StringConverter()
};
