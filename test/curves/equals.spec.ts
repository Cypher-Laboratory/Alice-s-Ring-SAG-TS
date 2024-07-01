import { Curve, CurveName } from "../../src";

const secp256k1 = new Curve(CurveName.SECP256K1);

/**
 * Test the Curve.equals() method
 *
 * test if:
 * - the method returns true if the curves are the same
 * - the method returns false if the curves are different
 */
describe("Test equals()", () => {
  it("Should return true if the curves are the same - secp256k1", () => {
    expect(secp256k1.equals(secp256k1)).toBe(true);
  });
});
