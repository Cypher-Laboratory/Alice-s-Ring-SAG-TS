export declare const P: bigint;
export declare const N: bigint;
export declare const Gx = 55066263022277343669578718895168534326250603453777594175500187360389116729240n;
export declare const Gy = 32670510020758816978083085130507043184471273380659243275938904335757337482424n;
interface AffinePoint {
    x: bigint;
    y: bigint;
}
export declare class SECP256K1Point {
    readonly px: bigint;
    readonly py: bigint;
    readonly pz: bigint;
    constructor(px: bigint, py: bigint, pz: bigint);
    static readonly BASE: SECP256K1Point;
    static readonly ZERO: SECP256K1Point;
    static fromAffine(p: AffinePoint): SECP256K1Point;
    get x(): bigint;
    get y(): bigint;
    equals(other: SECP256K1Point): boolean;
    negate(): SECP256K1Point;
    double(): SECP256K1Point;
    add(other: SECP256K1Point): SECP256K1Point;
    mul(n: bigint, safe?: boolean): SECP256K1Point;
    mulAddQUns(R: SECP256K1Point, u1: bigint, u2: bigint): SECP256K1Point;
    toAffine(): AffinePoint;
    assertValidity(): SECP256K1Point;
    aff(): AffinePoint;
    ok(): SECP256K1Point;
    toHex(isCompressed?: boolean): string;
    toRawBytes(isCompressed?: boolean): Uint8Array;
}
export {};
