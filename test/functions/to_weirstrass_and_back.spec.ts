import { assert } from "console";
import {
  toTwistedEdwards,
  toWeierstrass,
} from "../../src/utils/garaga_bindings";

/*
 * Test for toWeierstrass and toTwistedEdwards functions
 *
 * test if the conversion between the two is okay, twisted_x -> weirstrass_x -> twisted_x
 */
describe("test_weierstrass_to_twistededwards_and_back", () => {
  it("Should return the same point after 2 conversions", () => {
    const x_twisted =
      39543460263672751862715731148177899282638773519115997227341754029484841581726n;
    const y_twisted =
      4367959853343614974527137288414659086393892804139868448214890263094925695580n;

    let weirstrassPoint = toWeierstrass(
      57896044618658097711785492504343953926634992332820282019728792003956564819948n,
      37095705934669439343138083508754565189542113879843219016388785533085940283555n,
      57896044618658097711785492504343953926634992332820282019728792003956564819949n,
      x_twisted,
      y_twisted,
    );
    let twistedPoint = toTwistedEdwards(
      57896044618658097711785492504343953926634992332820282019728792003956564819948n,
      37095705934669439343138083508754565189542113879843219016388785533085940283555n,
      57896044618658097711785492504343953926634992332820282019728792003956564819949n,
      weirstrassPoint[0],
      weirstrassPoint[1],
    );
    assert(twistedPoint[0] === x_twisted);
    assert(twistedPoint[1] === y_twisted);
  });
});
