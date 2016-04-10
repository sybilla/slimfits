define(["require", "exports"], function (require, exports) {
    "use strict";
    var StringConverter = (function () {
        function StringConverter() {
        }
        StringConverter.prototype.convert = function (value) {
            return value.replace(/\'/g, "''");
        };
        StringConverter.prototype.convertBack = function (value) {
            if (value.charAt(0) === "'") {
                value = value.substr(1);
            }
            if (value.charAt(value.length - 1) === "'") {
                value = value.substr(0, value.length - 1);
            }
            return value.replace(/\'\'/g, "'").toString().trim();
        };
        return StringConverter;
    }());
    exports.StringConverter = StringConverter;
    var IntConverter = (function () {
        function IntConverter() {
        }
        IntConverter.prototype.convert = function (value) {
            return value.toString();
        };
        IntConverter.prototype.convertBack = function (value) {
            return parseInt(value);
        };
        return IntConverter;
    }());
    exports.IntConverter = IntConverter;
    var FloatConverter = (function () {
        function FloatConverter() {
        }
        FloatConverter.prototype.convert = function (value) {
            return value.toString();
        };
        FloatConverter.prototype.convertBack = function (value) {
            return parseFloat(value);
        };
        return FloatConverter;
    }());
    exports.FloatConverter = FloatConverter;
    var DateConverter = (function () {
        function DateConverter() {
        }
        DateConverter.prototype.convert = function (value) {
            console.warn('DateFitsValueConverter.convert not implemented.');
            return '';
        };
        DateConverter.prototype.convertBack = function (stringValue) {
            if (stringValue[0] === "'") {
                stringValue = stringValue.slice(1);
            }
            if (stringValue[stringValue.length - 1] === "'") {
                stringValue = stringValue.slice(0, stringValue.length - 1);
            }
            if (isNaN(Date.parse(stringValue))) {
                console.error('DateFitsValueConverter.convertBack error parsing ' + stringValue);
                return null;
            }
            return new Date(stringValue);
        };
        return DateConverter;
    }());
    exports.DateConverter = DateConverter;
    var BooleanConverter = (function () {
        function BooleanConverter() {
        }
        BooleanConverter.prototype.convert = function (value) {
            if (value) {
                return 'T';
            }
            else {
                return 'F';
            }
        };
        BooleanConverter.prototype.convertBack = function (stringValue) {
            return stringValue.toString().trim().toUpperCase() === 'T';
        };
        return BooleanConverter;
    }());
    exports.BooleanConverter = BooleanConverter;
    var BitPixConverter = (function () {
        function BitPixConverter() {
        }
        BitPixConverter.prototype.convert = function (value) {
            return value.toString();
        };
        BitPixConverter.prototype.convertBack = function (value) {
            return parseInt(value);
        };
        return BitPixConverter;
    }());
    exports.BitPixConverter = BitPixConverter;
    var registeredNames = {
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
        ZVAL2: new IntConverter()
    };
    var registeredPrefixedNames = {
        NAXIS: new IntConverter(),
        NSEG: new IntConverter(),
        // DATE: new DateConverter(),
        CRVAL: new FloatConverter(),
        CDELT: new FloatConverter(),
        CRPIX: new FloatConverter(),
        CROTA: new FloatConverter(),
        PHAS: new FloatConverter(),
        PSCAL: new FloatConverter(),
        PZERO: new FloatConverter(),
        SDLT: new FloatConverter(),
        SRVL: new FloatConverter(),
        SRPX: new FloatConverter(),
        DBJD: new FloatConverter(),
        'THDA-': new FloatConverter()
    };
    var registeredTypes = {
        int: new IntConverter(),
        float: new FloatConverter(),
        string: new StringConverter(),
        date: new DateConverter(),
        boolean: new BooleanConverter()
    };
    exports.ValueConverters = {
        registeredNames: registeredNames,
        registeredPrefixedNames: registeredPrefixedNames,
        registeredTypes: registeredTypes,
        defaultConverter: new StringConverter()
    };
});
//# sourceMappingURL=ValueConverters.js.map