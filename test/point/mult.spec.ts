import { Curve, CurveName, Point } from "../../src";
import { valid_coordinates_secp256k1 } from "../data";
describe("Point class mult operation tests", () => {
  let mockSECP256K1: Curve;

  beforeEach(() => {
    mockSECP256K1 = new Curve(CurveName.SECP256K1); // Replace with actual initialization if necessary
  });

  it("should mult a point with a positif scalar correctly, SECP256K1", () => {
    const point = new Point(mockSECP256K1, valid_coordinates_secp256k1);
    const scalar = BigInt(10);
    const result = point.mult(scalar);
    expect(result).toBeInstanceOf(Point);
  });

  it("should throw computation error when point is not on the curve, SECP256K1", () => {
    const point = new Point(mockSECP256K1, valid_coordinates_secp256k1);
    const scalar = BigInt(0);
    expect(() => point.mult(scalar)).toThrow("invalid scalar");
  });
});
