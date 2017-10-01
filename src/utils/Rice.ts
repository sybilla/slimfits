export class Rice {
    public static fits_rdecomp(c: Uint8Array, array: Int32Array, nblock: number) {
        const nonzero_count: Uint8Array = Rice.getNonzeroCount();
        let cPointer = 0;
        const fsbits: number = 5;
        const fsmax: number = 25;
        const bbits: number = (1 << fsbits) | 0;

        let lastpix: number = (new DataView(c.buffer, c.byteOffset)).getInt32(0, false);
        cPointer += 4;
        let b: number = c[cPointer++]; /* bit buffer	*/
        let nbits: number = 8; /* number of bits remaining in b	*/

        for (let i = 0; i < array.length; ) {
            /* get the FS value from first fsbits */
            nbits -= fsbits;
            while (nbits < 0) {
                b = (b << 8) | c[cPointer++];
                nbits += 8;
            }

            const fs: number = (b >> nbits) - 1;
            b &= ( 1 << nbits ) - 1;
            /* loop over the next block */
            let imax: number = i + nblock;
            if (imax > array.length) {
                imax = array.length;
            }

            if (fs < 0) {
                /* low-entropy case, all zero differences */
                for ( ; i < imax; i++) {
                    array[i] = lastpix;
                }
            } else if (fs === fsmax) {
                /* high-entropy case, directly coded pixel values */
                for ( ; i < imax; i++) {
                    let k: number = bbits - nbits;
                    let diff: number = b << k;
                    for (k -= 8; k >= 0; k -= 8) {
                        b = c[cPointer++];
                        diff |= b << k;
                    }
                    if (nbits > 0) {
                        b = c[cPointer++];
                        diff |= b >> (-k);
                        b &= (1 << nbits) - 1;
                    } else {
                        b = 0;
                    }

                    /*
                    * undo mapping and differencing
                    * Note that some of these operations will overflow the
                    * unsigned int arithmetic -- that's OK, it all works
                    * out to give the right answers in the output file.
                    */
                    if ((diff & 1) === 0) {
                        diff = diff >> 1;
                    } else {
                        diff = ~(diff >> 1);
                    }
                    array[i] = diff + lastpix;
                    lastpix = array[i];
                }
            } else {
                /* normal case, Rice coding */
                for ( ; i < imax; i++) {
                /* count number of leading zeros */
                    while (b === 0) {
                        nbits += 8;
                        b = c[cPointer++];
                    }
                    const nzero: number = nbits - nonzero_count[b];
                    nbits -= nzero + 1;
                    /* flip the leading one-bit */
                    b ^= 1 << nbits;
                    /* get the FS trailing bits */
                    nbits -= fs;
                    while (nbits < 0) {
                        b = (b << 8) | (c[cPointer++]);
                        nbits += 8;
                    }
                    let diff: number = (nzero << fs) | (b >> nbits);
                    b &= (1 << nbits) - 1;

                    /* undo mapping and differencing */
                    if ((diff & 1) === 0) {
                        diff = diff >> 1;
                    } else {
                        diff = ~(diff >> 1);
                    }
                    array[i] = diff + lastpix;
                    lastpix = array[i];
                }
            }
        }
    }

    public static fits_rdecomp_short(c: Uint8Array, array: Int16Array, nblock: number) {
        const nonzero_count: Uint8Array = Rice.getNonzeroCount();
        let cPointer = 0;
        const fsbits: number = 4;
        const fsmax: number = 14;
        const bbits: number = 1 << fsbits;

        let lastpix: number = (new DataView(c.buffer, c.byteOffset)).getInt16(0, false);
        cPointer += 2;
        let b: number = c[cPointer++]; /* bit buffer	*/
        let nbits: number = 8; /* number of bits remaining in b	*/

        for (let i = 0; i < array.length; ) {
            /* get the FS value from first fsbits */
            nbits -= fsbits;
            while (nbits < 0) {
                b = (b << 8) | c[cPointer++];
                nbits += 8;
            }

            const fs: number = (b >> nbits) - 1;
            b &= (1 << nbits) - 1;
            /* loop over the next block */
            let imax: number = i + nblock;
            if (imax > array.length) {
                imax = array.length;
            }

            if (fs < 0) {
                /* low-entropy case, all zero differences */
                for ( ; i < imax; i++) {
                    array[i] = lastpix;
                }
            } else if (fs === fsmax) {
                /* high-entropy case, directly coded pixel values */
                for ( ; i < imax; i++) {
                    let k: number = bbits - nbits;
                    let diff: number = b << k;
                    for (k -= 8; k >= 0; k -= 8) {
                        b = c[cPointer++];
                        diff |= b << k;
                    }
                    if (nbits > 0) {
                        b = c[cPointer++];
                        diff |= b >> (-k);
                        b &= (1 << nbits) - 1;
                    } else {
                        b = 0;
                    }

                    /*
                    * undo mapping and differencing
                    * Note that some of these operations will overflow the
                    * unsigned int arithmetic -- that's OK, it all works
                    * out to give the right answers in the output file.
                    */
                    if ((diff & 1) === 0) {
                        diff = diff >> 1;
                    } else {
                        diff = ~(diff >> 1);
                    }
                    array[i] = diff + lastpix;
                    lastpix = array[i];
                }
            } else {
                /* normal case, Rice coding */
                for ( ; i < imax; i++) {
                    /* count number of leading zeros */
                    while (b === 0) {
                        nbits += 8;
                        b = c[cPointer++];
                    }

                    const nzero: number = nbits - nonzero_count[b];
                    nbits -= nzero + 1;
                    /* flip the leading one-bit */
                    b ^= 1 << nbits;
                    /* get the FS trailing bits */
                    nbits -= fs;
                    while (nbits < 0) {
                        b = (b << 8) | c[cPointer++];
                        nbits += 8;
                    }
                    let diff: number = (nzero << fs) | (b >> nbits);
                    b &= (1 << nbits) - 1;

                    /* undo mapping and differencing */
                    if ((diff & 1) === 0) {
                        diff = diff >> 1;
                    } else {
                        diff = ~(diff >> 1);
                    }
                    array[i] = diff + lastpix;
                    lastpix = array[i];
                }
            }
        }
    }

    public static fits_rdecomp_byte(c: Uint8Array, array: Uint8Array, nblock: number) {
        const nonzero_count: Uint8Array = Rice.getNonzeroCount();
        let cPointer = 0;

        const fsbits: number = 3;
        const fsmax: number = 6;
        const bbits: number = 1 << fsbits;

        let lastpix: number = c[0];
        cPointer += 1;
        let b: number = c[cPointer++]; /* bit buffer	*/
        let nbits: number = 8; /* number of bits remaining in b	*/

        for (let i = 0; i < array.length; ) {
            /* get the FS value from first fsbits */
            nbits -= fsbits;
            while (nbits < 0) {
                b = (b << 8) | c[cPointer++];
                nbits += 8;
            }
            const fs: number = (b >> nbits) - 1;

            b &= (1 << nbits) - 1;
            /* loop over the next block */
            let imax: number = i + nblock;
            if (imax > array.length) {
                imax = array.length;
            }

            if (fs < 0) {
                /* low-entropy case, all zero differences */
                for ( ; i < imax; i++) {
                    array[i] = lastpix;
                }
            } else if (fs === fsmax) {
                /* high-entropy case, directly coded pixel values */
                for ( ; i < imax; i++) {
                    let k: number = bbits - nbits;
                    let diff: number = b << k;
                    for (k -= 8; k >= 0; k -= 8) {
                        b = c[cPointer++];
                        diff |= b << k;
                    }
                    if (nbits > 0) {
                        b = c[cPointer++];
                        diff |= b >> (-k);
                        b &= (1 << nbits) - 1;
                    } else {
                        b = 0;
                    }

                    /*
                    * undo mapping and differencing
                    * Note that some of these operations will overflow the
                    * unsigned int arithmetic -- that's OK, it all works
                    * out to give the right answers in the output file.
                    */
                    if ((diff & 1) === 0) {
                        diff = diff >> 1;
                    } else {
                        diff = ~(diff >> 1);
                    }
                    array[i] = diff + lastpix;
                    lastpix = array[i];
                }
            } else {
                /* normal case, Rice coding */
                for ( ; i < imax; i++) {
                    /* count number of leading zeros */
                    while (b === 0) {
                        nbits += 8;
                        b = c[cPointer++];
                    }

                    const nzero: number = nbits - nonzero_count[b];
                    nbits -= nzero + 1;
                    /* flip the leading one-bit */
                    b ^= 1 << nbits;
                    /* get the FS trailing bits */
                    nbits -= fs;
                    while (nbits < 0) {
                        b = (b << 8) | c[cPointer++];
                        nbits += 8;
                    }
                    let diff: number = (nzero << fs) | (b >> nbits);
                    b &= (1 << nbits) - 1;

                    /* undo mapping and differencing */
                    if ((diff & 1) === 0) {
                        diff = diff >> 1;
                    } else {
                        diff = ~(diff >> 1);
                    }
                    array[i] = diff + lastpix;
                    lastpix = array[i];
                }
            }
        }
    }

    private static getNonzeroCount() {
        const arr = new Uint8Array(256);
        let k = 1;
        for (let i = 1; i <= 8; i++) {
            for (let j = 0; j < Math.pow(2, i - 1); j++) {
                arr[k++] = i;
            }
        }
        return arr;
    }
}
