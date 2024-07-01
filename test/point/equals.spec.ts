import { Curve, CurveName, Point } from "../../src";
import { valid_coordinates_secp256k1 } from "../data";
describe("Point class add operation tests", () => {
  let mockSECP256K1: Curve;

  beforeEach(() => {
    mockSECP256K1 = new Curve(CurveName.SECP256K1); // Replace with actual initialization if necessary
  });

  it("should return true points are equals, SECP256K1", () => {
    const point1 = new Point(mockSECP256K1, valid_coordinates_secp256k1);
    const point2 = new Point(mockSECP256K1, valid_coordinates_secp256k1);
    expect(point1.equals(point2)).toBeTruthy();
  });

  it("should return false points are not equals, SECP256K1", () => {
    const point = new Point(mockSECP256K1, valid_coordinates_secp256k1);
    const point2 = new Point(mockSECP256K1, valid_coordinates_secp256k1);
    point2.x = BigInt(0);
    point2.y = BigInt(0);
    expect(point.equals(point2)).toBeFalsy();
  });
});
