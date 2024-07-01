import { Curve, CurveName, Point } from "../../src";
import { valid_coordinates_secp256k1 } from "../data";
describe("Point class toCoordinates()", () => {
  let mockSECP256K1: Curve;

  beforeEach(() => {
    mockSECP256K1 = new Curve(CurveName.SECP256K1); // Replace with actual initialization if necessary
  });

  it("should return a [bigint, bigint], SECP256K1", () => {
    const point = new Point(mockSECP256K1, valid_coordinates_secp256k1);
    const affine = point.toCoordinates();
    expect(affine).toBeInstanceOf(Array);
    expect(affine[0]).toEqual(valid_coordinates_secp256k1[0]);
    expect(affine[1]).toEqual(valid_coordinates_secp256k1[1]);
  });
});
