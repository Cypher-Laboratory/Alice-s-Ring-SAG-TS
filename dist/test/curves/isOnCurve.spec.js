"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../src");
const secp256k1 = new src_1.Curve(src_1.CurveName.SECP256K1);
/**
 * Test the Curve.toString() method
 *
 * test if:
 * - the method returns true if the point is on the curve
 * - the method returns false if the point is not on the curve
 */
describe("Test isOnCurve()", () => {
    it("Should return true if the point is on the curve - secp256k1", () => {
        expect(secp256k1.isOnCurve(secp256k1.GtoPoint())).toBe(true);
    });
    it("Should return false if the point is not on the curve - secp256k1", () => {
        expect(secp256k1.isOnCurve([1n, 1n])).toBe(false);
    });
    it("Should return true if the point is on the curve (from [bigint, bigint]) - secp256k1", () => {
        expect(secp256k1.isOnCurve(secp256k1.G)).toBe(true);
    });
});
