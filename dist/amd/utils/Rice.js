define(["require", "exports"], function (require, exports) {
    "use strict";
    var Rice = (function () {
        function Rice() {
        }
        Rice.getNonzeroCount = function () {
            var arr = new Uint8Array(256);
            var k = 1;
            for (var i = 1; i <= 8; i++) {
                for (var j = 0; j < Math.pow(2, i - 1); j++) {
                    arr[k++] = i;
                }
            }
            return arr;
        };
        Rice.fits_rdecomp = function (c, array, nblock) {
            var nonzero_count = Rice.getNonzeroCount();
            var cPointer = 0;
            var fsbits = 5;
            var fsmax = 25;
            var bbits = (1 << fsbits) | 0;
            var lastpix = (new DataView(c.buffer)).getInt32(0, false);
            cPointer += 4;
            var b = c[cPointer++]; /* bit buffer	*/
            var nbits = 8; /* number of bits remaining in b	*/
            for (var i = 0; i < array.length;) {
                /* get the FS value from first fsbits */
                nbits -= fsbits;
                while (nbits < 0) {
                    b = (b << 8) | c[cPointer++];
                    nbits += 8;
                }
                var fs = (b >> nbits) - 1;
                b &= (1 << nbits) - 1;
                /* loop over the next block */
                var imax = i + nblock;
                if (imax > array.length) {
                    imax = array.length;
                }
                if (fs < 0) {
                    /* low-entropy case, all zero differences */
                    for (; i < imax; i++) {
                        array[i] = lastpix;
                    }
                }
                else if (fs == fsmax) {
                    /* high-entropy case, directly coded pixel values */
                    for (; i < imax; i++) {
                        var k = bbits - nbits;
                        var diff = b << k;
                        for (k -= 8; k >= 0; k -= 8) {
                            b = c[cPointer++];
                            diff |= b << k;
                        }
                        if (nbits > 0) {
                            b = c[cPointer++];
                            diff |= b >> (-k);
                            b &= (1 << nbits) - 1;
                        }
                        else {
                            b = 0;
                        }
                        /*
                        * undo mapping and differencing
                        * Note that some of these operations will overflow the
                        * unsigned int arithmetic -- that's OK, it all works
                        * out to give the right answers in the output file.
                        */
                        if ((diff & 1) == 0) {
                            diff = diff >> 1;
                        }
                        else {
                            diff = ~(diff >> 1);
                        }
                        array[i] = diff + lastpix;
                        lastpix = array[i];
                    }
                }
                else {
                    /* normal case, Rice coding */
                    for (; i < imax; i++) {
                        /* count number of leading zeros */
                        while (b == 0) {
                            nbits += 8;
                            b = c[cPointer++];
                        }
                        var nzero = nbits - nonzero_count[b];
                        nbits -= nzero + 1;
                        /* flip the leading one-bit */
                        b ^= 1 << nbits;
                        /* get the FS trailing bits */
                        nbits -= fs;
                        while (nbits < 0) {
                            b = (b << 8) | (c[cPointer++]);
                            nbits += 8;
                        }
                        var diff = (nzero << fs) | (b >> nbits);
                        b &= (1 << nbits) - 1;
                        /* undo mapping and differencing */
                        if ((diff & 1) == 0) {
                            diff = diff >> 1;
                        }
                        else {
                            diff = ~(diff >> 1);
                        }
                        array[i] = diff + lastpix;
                        lastpix = array[i];
                    }
                }
            }
        };
        Rice.fits_rdecomp_short = function (c, array, nblock) {
            var nonzero_count = Rice.getNonzeroCount();
            var cPointer = 0;
            var fsbits = 4;
            var fsmax = 14;
            var bbits = 1 << fsbits;
            var lastpix = (new DataView(c.buffer)).getInt16(0, false);
            cPointer += 2;
            var b = c[cPointer++]; /* bit buffer	*/
            var nbits = 8; /* number of bits remaining in b	*/
            for (var i = 0; i < array.length;) {
                /* get the FS value from first fsbits */
                nbits -= fsbits;
                while (nbits < 0) {
                    b = (b << 8) | c[cPointer++];
                    nbits += 8;
                }
                var fs = (b >> nbits) - 1;
                b &= (1 << nbits) - 1;
                /* loop over the next block */
                var imax = i + nblock;
                if (imax > array.length) {
                    imax = array.length;
                }
                ;
                if (fs < 0) {
                    /* low-entropy case, all zero differences */
                    for (; i < imax; i++) {
                        array[i] = lastpix;
                    }
                }
                else if (fs == fsmax) {
                    /* high-entropy case, directly coded pixel values */
                    for (; i < imax; i++) {
                        var k = bbits - nbits;
                        var diff = b << k;
                        for (k -= 8; k >= 0; k -= 8) {
                            b = c[cPointer++];
                            diff |= b << k;
                        }
                        if (nbits > 0) {
                            b = c[cPointer++];
                            diff |= b >> (-k);
                            b &= (1 << nbits) - 1;
                        }
                        else {
                            b = 0;
                        }
                        /*
                        * undo mapping and differencing
                        * Note that some of these operations will overflow the
                        * unsigned int arithmetic -- that's OK, it all works
                        * out to give the right answers in the output file.
                        */
                        if ((diff & 1) == 0) {
                            diff = diff >> 1;
                        }
                        else {
                            diff = ~(diff >> 1);
                        }
                        array[i] = diff + lastpix;
                        lastpix = array[i];
                    }
                }
                else {
                    /* normal case, Rice coding */
                    for (; i < imax; i++) {
                        /* count number of leading zeros */
                        while (b == 0) {
                            nbits += 8;
                            b = c[cPointer++];
                        }
                        var nzero = nbits - nonzero_count[b];
                        nbits -= nzero + 1;
                        /* flip the leading one-bit */
                        b ^= 1 << nbits;
                        /* get the FS trailing bits */
                        nbits -= fs;
                        while (nbits < 0) {
                            b = (b << 8) | c[cPointer++];
                            nbits += 8;
                        }
                        var diff = (nzero << fs) | (b >> nbits);
                        b &= (1 << nbits) - 1;
                        /* undo mapping and differencing */
                        if ((diff & 1) == 0) {
                            diff = diff >> 1;
                        }
                        else {
                            diff = ~(diff >> 1);
                        }
                        array[i] = diff + lastpix;
                        lastpix = array[i];
                    }
                }
            }
        };
        Rice.fits_rdecomp_byte = function (c, array, nblock) {
            var nonzero_count = Rice.getNonzeroCount();
            var cPointer = 0;
            var fsbits = 3;
            var fsmax = 6;
            var bbits = 1 << fsbits;
            var lastpix = c[0];
            cPointer += 1;
            var b = c[cPointer++]; /* bit buffer	*/
            var nbits = 8; /* number of bits remaining in b	*/
            for (var i = 0; i < array.length;) {
                /* get the FS value from first fsbits */
                nbits -= fsbits;
                while (nbits < 0) {
                    b = (b << 8) | c[cPointer++];
                    nbits += 8;
                }
                var fs = (b >> nbits) - 1;
                b &= (1 << nbits) - 1;
                /* loop over the next block */
                var imax = i + nblock;
                if (imax > array.length) {
                    imax = array.length;
                }
                if (fs < 0) {
                    /* low-entropy case, all zero differences */
                    for (; i < imax; i++) {
                        array[i] = lastpix;
                    }
                }
                else if (fs == fsmax) {
                    /* high-entropy case, directly coded pixel values */
                    for (; i < imax; i++) {
                        var k = bbits - nbits;
                        var diff = b << k;
                        for (k -= 8; k >= 0; k -= 8) {
                            b = c[cPointer++];
                            diff |= b << k;
                        }
                        if (nbits > 0) {
                            b = c[cPointer++];
                            diff |= b >> (-k);
                            b &= (1 << nbits) - 1;
                        }
                        else {
                            b = 0;
                        }
                        /*
                        * undo mapping and differencing
                        * Note that some of these operations will overflow the
                        * unsigned int arithmetic -- that's OK, it all works
                        * out to give the right answers in the output file.
                        */
                        if ((diff & 1) == 0) {
                            diff = diff >> 1;
                        }
                        else {
                            diff = ~(diff >> 1);
                        }
                        array[i] = diff + lastpix;
                        lastpix = array[i];
                    }
                }
                else {
                    /* normal case, Rice coding */
                    for (; i < imax; i++) {
                        /* count number of leading zeros */
                        while (b == 0) {
                            nbits += 8;
                            b = c[cPointer++];
                        }
                        var nzero = nbits - nonzero_count[b];
                        nbits -= nzero + 1;
                        /* flip the leading one-bit */
                        b ^= 1 << nbits;
                        /* get the FS trailing bits */
                        nbits -= fs;
                        while (nbits < 0) {
                            b = (b << 8) | c[cPointer++];
                            nbits += 8;
                        }
                        var diff = (nzero << fs) | (b >> nbits);
                        b &= (1 << nbits) - 1;
                        /* undo mapping and differencing */
                        if ((diff & 1) == 0) {
                            diff = diff >> 1;
                        }
                        else {
                            diff = ~(diff >> 1);
                        }
                        array[i] = diff + lastpix;
                        lastpix = array[i];
                    }
                }
            }
        };
        return Rice;
    }());
    exports.Rice = Rice;
});
//# sourceMappingURL=Rice.js.map