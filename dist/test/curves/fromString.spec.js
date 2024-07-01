"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../src");
const errors_1 = require("../../src/errors");
const secp256k1 = new src_1.Curve(src_1.CurveName.SECP256K1);
/**
 * Test the Curve.fromString() method
 *
 * test if:
 * - the method returns a valid curve object
 * - the method throw if the curve is not supported
 */
describe("Test fromString()", () => {
    it("Should return a valid curve object - secp256k1", () => {
        const strCurve = 
        // eslint-disable-next-line max-len
        '{"curve":"SECP256K1","Gx":"55066263022277343669578718895168534326250603453777594175500187360389116729240","Gy":"32670510020758816978083085130507043184471273380659243275938904335757337482424","N":"115792089237316195423570985008687907852837564279074904382605163141518161494337","P":"115792089237316195423570985008687907853269984665640564039457584007908834671663"}';
        expect(src_1.Curve.fromString(strCurve).name).toBe(secp256k1.name);
    });
    it("Should throw if the curve is not supported", () => {
        const strCurve = 
        // eslint-disable-next-line max-len
        '{"curve":"NO_CURVE","Gx":"55066263022277343669578718895168534326250603453777594175500187360389116729240","Gy":"32670510020758816978083085130507043184471273380659243275938904335757337482424","N":"115792089237316195423570985008687907852837564279074904382605163141518161494337","P":"115792089237316195423570985008687907853269984665640564039457584007908834671663"}';
        expect(() => src_1.Curve.fromString(strCurve)).toThrow((0, errors_1.unknownCurve)("NO_CURVE"));
    });
});
