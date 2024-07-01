import { Curve, CurveName, derivePubKey } from "../../src/curves";
import * as data from "../data";

const secp256k1 = new Curve(CurveName.SECP256K1);

/**
 * Test derivePubKey()
 *
 * test if:
 * - the method returns the correct pubkey (secp256k1)
 * - the method throws an error if the private key is invalid (secp256k1)
 */
describe("Test derivePubKey()", () => {
  it("Should return the correct pubkey - secp256k1", () => {
    const pubkey = derivePubKey(data.signerPrivKey, secp256k1);
    let result = true;
    if (
      pubkey.x !== data.signerPubKey_secp256k1.x ||
      pubkey.y !== data.signerPubKey_secp256k1.y ||
      pubkey.curve.name !== data.signerPubKey_secp256k1.curve.name
    ) {
      result = false;
    }
    expect(result).toBe(true);
  });

  it("Should throw an error if the private key is invalid - secp256k1", () => {
    expect(() => {
      derivePubKey(0n, secp256k1);
    }).toThrow();
  });
});
