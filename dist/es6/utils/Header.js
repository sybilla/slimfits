export class Header {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}
export class AcceptRangeHeader extends Header {
    constructor(from, length) {
        super('Range', 'bytes=' + from + '-' + (from + length - 1));
        this.from = from;
        this.length = length;
    }
}
//# sourceMappingURL=Header.js.map