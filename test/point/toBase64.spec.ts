import { Curve, CurveName, Point } from "../../src";
import { valid_coordinates_secp256k1 } from "../data";
describe("Point class mult operation tests", () => {
  let mockSECP256K1: Curve;

  beforeEach(() => {
    mockSECP256K1 = new Curve(CurveName.SECP256K1); // Replace with actual initialization if necessary
  });

  it("Should return a valid base64 encoded string, secp256k1", () => {
    const point = new Point(mockSECP256K1, valid_coordinates_secp256k1);
    expect(() => Buffer.from(point.toBase64(), "base64")).not.toThrow();
  });

  it("Should return a valid Point, secp256k1", () => {
    const point = new Point(mockSECP256K1, valid_coordinates_secp256k1);
    expect(Point.fromBase64(point.toBase64())).toBeInstanceOf(Point);
  });
});
