import { Curve, CurveName, Point } from "../../src";
import { valid_coordinates_secp256k1 } from "../data";
describe("Point class add operation tests", () => {
  let mockSECP256K1: Curve;

  beforeEach(() => {
    mockSECP256K1 = new Curve(CurveName.SECP256K1); // Replace with actual initialization if necessary
  });

  it("should mult a point with a valid point correctly, SECP256K1", () => {
    const point = new Point(mockSECP256K1, valid_coordinates_secp256k1);
    expect(point.negate()).toBeInstanceOf(Point);
  });
});
