export class Rice {
    static getNonzeroCount() {
        let arr = new Uint8Array(256);
        let k = 1;
        for (let i = 1; i <= 8; i++) {
            for (let j = 0; j < Math.pow(2, i - 1); j++) {
                arr[k++] = i;
            }
        }
        return arr;
    }
    static fits_rdecomp(c, array, nblock) {
        let nonzero_count = Rice.getNonzeroCount();
        let cPointer = 0;
        let fsbits = 5;
        let fsmax = 25;
        let bbits = (1 << fsbits) | 0;
        let lastpix = (new DataView(c.buffer)).getInt32(0, false);
        cPointer += 4;
        let b = c[cPointer++]; /* bit buffer	*/
        let nbits = 8; /* number of bits remaining in b	*/
        for (let i = 0; i < array.length;) {
            /* get the FS value from first fsbits */
            nbits -= fsbits;
            while (nbits < 0) {
                b = (b << 8) | c[cPointer++];
                nbits += 8;
            }
            let fs = (b >> nbits) - 1;
            b &= (1 << nbits) - 1;
            /* loop over the next block */
            let imax = i + nblock;
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
                    let k = bbits - nbits;
                    let diff = b << k;
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
                    let nzero = nbits - nonzero_count[b];
                    nbits -= nzero + 1;
                    /* flip the leading one-bit */
                    b ^= 1 << nbits;
                    /* get the FS trailing bits */
                    nbits -= fs;
                    while (nbits < 0) {
                        b = (b << 8) | (c[cPointer++]);
                        nbits += 8;
                    }
                    let diff = (nzero << fs) | (b >> nbits);
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
    }
    static fits_rdecomp_short(c, array, nblock) {
        let nonzero_count = Rice.getNonzeroCount();
        let cPointer = 0;
        let fsbits = 4;
        let fsmax = 14;
        let bbits = 1 << fsbits;
        let lastpix = (new DataView(c.buffer)).getInt16(0, false);
        cPointer += 2;
        let b = c[cPointer++]; /* bit buffer	*/
        let nbits = 8; /* number of bits remaining in b	*/
        for (let i = 0; i < array.length;) {
            /* get the FS value from first fsbits */
            nbits -= fsbits;
            while (nbits < 0) {
                b = (b << 8) | c[cPointer++];
                nbits += 8;
            }
            let fs = (b >> nbits) - 1;
            b &= (1 << nbits) - 1;
            /* loop over the next block */
            let imax = i + nblock;
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
                    let k = bbits - nbits;
                    let diff = b << k;
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
                    let nzero = nbits - nonzero_count[b];
                    nbits -= nzero + 1;
                    /* flip the leading one-bit */
                    b ^= 1 << nbits;
                    /* get the FS trailing bits */
                    nbits -= fs;
                    while (nbits < 0) {
                        b = (b << 8) | c[cPointer++];
                        nbits += 8;
                    }
                    let diff = (nzero << fs) | (b >> nbits);
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
    }
    static fits_rdecomp_byte(c, array, nblock) {
        let nonzero_count = Rice.getNonzeroCount();
        let cPointer = 0;
        let fsbits = 3;
        let fsmax = 6;
        let bbits = 1 << fsbits;
        let lastpix = c[0];
        cPointer += 1;
        let b = c[cPointer++]; /* bit buffer	*/
        let nbits = 8; /* number of bits remaining in b	*/
        for (let i = 0; i < array.length;) {
            /* get the FS value from first fsbits */
            nbits -= fsbits;
            while (nbits < 0) {
                b = (b << 8) | c[cPointer++];
                nbits += 8;
            }
            let fs = (b >> nbits) - 1;
            b &= (1 << nbits) - 1;
            /* loop over the next block */
            let imax = i + nblock;
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
                    let k = bbits - nbits;
                    let diff = b << k;
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
                    let nzero = nbits - nonzero_count[b];
                    nbits -= nzero + 1;
                    /* flip the leading one-bit */
                    b ^= 1 << nbits;
                    /* get the FS trailing bits */
                    nbits -= fs;
                    while (nbits < 0) {
                        b = (b << 8) | c[cPointer++];
                        nbits += 8;
                    }
                    let diff = (nzero << fs) | (b >> nbits);
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
    }
}
//# sourceMappingURL=Rice.js.map