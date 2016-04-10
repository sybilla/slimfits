export declare class Header {
    name: string;
    value: string;
    constructor(name: string, value: string);
}
export declare class AcceptRangeHeader extends Header {
    from: number;
    length: number;
    constructor(from: number, length: number);
}
