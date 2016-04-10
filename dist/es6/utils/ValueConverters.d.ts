import { BitPix } from '../Interfaces';
export interface IConverter {
    convert(value: any): string;
    convertBack(value: string): any;
}
export declare class StringConverter implements IConverter {
    convert(value: string): string;
    convertBack(value: string): string;
}
export declare class IntConverter implements IConverter {
    convert(value: number): string;
    convertBack(value: string): number;
}
export declare class FloatConverter implements IConverter {
    convert(value: number): string;
    convertBack(value: string): number;
}
export declare class DateConverter implements IConverter {
    convert(value: Date): string;
    convertBack(stringValue: string): Date;
}
export declare class BooleanConverter implements IConverter {
    convert(value: boolean): string;
    convertBack(stringValue: string): boolean;
}
export declare class BitPixConverter implements IConverter {
    convert(value: BitPix): string;
    convertBack(value: string): BitPix;
}
export declare var ValueConverters: {
    registeredNames: {
        ZBITPIX: BitPixConverter;
        BITPIX: BitPixConverter;
        NAXIS: IntConverter;
        NAXIS1: IntConverter;
        NAXIS2: IntConverter;
        NAXIS3: IntConverter;
        YBINNING: IntConverter;
        XBINNING: IntConverter;
        PCOUNT: IntConverter;
        GCOUNT: IntConverter;
        NSEGMENT: IntConverter;
        BSCALE: FloatConverter;
        BZERO: FloatConverter;
        EPOCH: StringConverter;
        EQUINOX: FloatConverter;
        ALTRVAL: FloatConverter;
        ALTRPIX: FloatConverter;
        RESTFREQ: FloatConverter;
        DATAMAX: FloatConverter;
        DATAMIN: FloatConverter;
        RA: FloatConverter;
        DEC: FloatConverter;
        OBSRA: FloatConverter;
        OBSDEC: FloatConverter;
        XSHIFT: FloatConverter;
        YSHIFT: FloatConverter;
        SIMPLE: BooleanConverter;
        GROUPS: BooleanConverter;
        BLOCKED: BooleanConverter;
        EXTEND: BooleanConverter;
        SEQVALID: BooleanConverter;
        TFIELDS: IntConverter;
        ZIMAGE: BooleanConverter;
        ZVAL1: IntConverter;
        ZVAL2: IntConverter;
    };
    registeredPrefixedNames: {
        NAXIS: IntConverter;
        NSEG: IntConverter;
        CRVAL: FloatConverter;
        CDELT: FloatConverter;
        CRPIX: FloatConverter;
        CROTA: FloatConverter;
        PHAS: FloatConverter;
        PSCAL: FloatConverter;
        PZERO: FloatConverter;
        SDLT: FloatConverter;
        SRVL: FloatConverter;
        SRPX: FloatConverter;
        DBJD: FloatConverter;
        'THDA-': FloatConverter;
    };
    registeredTypes: {
        int: IntConverter;
        float: FloatConverter;
        string: StringConverter;
        date: DateConverter;
        boolean: BooleanConverter;
    };
    defaultConverter: StringConverter;
};
