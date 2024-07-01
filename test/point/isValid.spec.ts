import { Curve, CurveName, Point } from "../../src";
import { valid_coordinates_secp256k1, idPointX_secp256k1 } from "../data";
describe("Point class isValid()", () => {
  let mockSECP256K1: Curve;

  beforeEach(() => {
    mockSECP256K1 = new Curve(CurveName.SECP256K1); // Replace with actual initialization if necessary
  });

  it("should return true if the point is valid, SECP256K1", () => {
    const point = new Point(mockSECP256K1, valid_coordinates_secp256k1);
    expect(point.isValid()).toBeTruthy();
  });

  it("should return false if the point is invalid, SECP256K1", () => {
    expect(idPointX_secp256k1.isValid()).toBeFalsy();
  });
});
