import { Curve, CurveName } from "../../src";

const secp256k1 = new Curve(CurveName.SECP256K1);

/**
 * Test the Curve.toString() method
 *
 * test if:
 * - the method returns a stringified curve
 */
describe("Test toString()", () => {
  it("Should return a stringified curve - secp256k1", () => {
    expect(secp256k1.toString()).toBe(
      // eslint-disable-next-line max-len
      '{"curve":"SECP256K1"}',
    );
  });
});
