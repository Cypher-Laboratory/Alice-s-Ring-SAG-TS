import { Point } from "./point";
/**
 * List of supported curves
 */
export declare enum CurveName {
    SECP256K1 = "SECP256K1",
    ED25519 = "ED25519"
}
export declare class Curve {
    name: CurveName;
    N: bigint;
    G: [bigint, bigint];
    P: bigint;
    /**
     * Creates a curve instance.
     *
     * @param curve - The curve name
     * @param params - The curve parameters (optional if curve is SECP256K1 or ED25519)
     */
    constructor(curve: CurveName);
    /**
     * Returns the generator point as a Point instance.
     *
     * @returns the generator point
     */
    GtoPoint(): Point;
    /**
     * Returns the curve as a json string.
     */
    toString(): string;
    /**
     * Returns a curve instance from a json string.
     *
     * @param curveData - the curve as a json string
     * @returns the curve instance
     */
    static fromString(curveData: string): Curve;
    /**
     * Checks if a point is on the curve.
     *
     * @remarks the function return false by default if the curve is not supported
     * @param point - the point to check
     * @returns true if the point is on the curve, false otherwise
     */
    isOnCurve(point: Point | [bigint, bigint]): boolean;
    equals(curve: Curve): boolean;
}
/**
 * Derive the public key from the private key.
 *
 * @param privateKey - the private key
 * @param curve - the curve to use
 * @param config - the config to use (optional)
 *
 * @returns the public key
 */
export declare function derivePubKey(privateKey: bigint, curve: Curve): Point;
