import { Curve, CurveName, Point } from "../../src";
import { valid_coordinates_secp256k1 } from "../data";
describe("Point class toString()", () => {
  let mockSECP256K1: Curve;

  beforeEach(() => {
    mockSECP256K1 = new Curve(CurveName.SECP256K1); // Replace with actual initialization if necessary
  });

  it("should return a string representation of the point, secp256k1", () => {
    const point = new Point(mockSECP256K1, valid_coordinates_secp256k1);
    expect(() => JSON.parse(point.toString())).not.toThrow();
  });
});
