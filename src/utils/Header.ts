export class Header {
    constructor(public name: string, public value: string) { }
}

export class AcceptRangeHeader extends Header {
    constructor(public from: number, public length: number) {
        super('Range', 'bytes=' + from + '-' + (from + length - 1));
    }
}