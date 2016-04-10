"use strict";
/**
    Contains constants describing basic structure of FITS file. Each unit of organization,
    be it header of payload is padded to be a multiple of 2880, which defined to be a block length.
    
    In header each line has constant length of 80 ASCII characters, with 8 bytes for the keyword,
    hence abbreviated key names.
    
    Block length divided by line length gives the maximal count of lines per block: 36.
*/
exports.Constants = {
    blockLength: 2880,
    lineLength: 80,
    keyLength: 8,
    maxKeywordsInBlock: 36
};
(function (BitPix) {
    BitPix[BitPix["Byte"] = 8] = "Byte";
    BitPix[BitPix["Char"] = 8] = "Char";
    BitPix[BitPix["Short"] = 16] = "Short";
    BitPix[BitPix["Integer"] = 32] = "Integer";
    BitPix[BitPix["Long"] = 64] = "Long";
    BitPix[BitPix["Float"] = -32] = "Float";
    BitPix[BitPix["Double"] = -64] = "Double";
    BitPix[BitPix["Unknown"] = 0] = "Unknown";
})(exports.BitPix || (exports.BitPix = {}));
var BitPix = exports.BitPix;
var BitPixUtils = (function () {
    function BitPixUtils() {
    }
    /**
        Gets size of type in bytes
        @static
        @public
        @param {BitPix} type - The type.
        @return {number} - size in bytes
        
    */
    BitPixUtils.getByteSize = function (type) {
        return Math.abs(type) / 8;
    };
    BitPixUtils.getBitPixForLetter = function (format) {
        switch (format) {
            case 'A':
                return BitPix.Byte;
            case 'B':
                return BitPix.Byte;
            case 'I':
                return BitPix.Short;
            case 'J':
                return BitPix.Integer;
            case 'K':
                return BitPix.Long;
            case 'E':
                return BitPix.Float;
            case 'D':
                return BitPix.Double;
            default:
                throw 'unrecognized format';
        }
    };
    return BitPixUtils;
}());
exports.BitPixUtils = BitPixUtils;
//# sourceMappingURL=Interfaces.js.map