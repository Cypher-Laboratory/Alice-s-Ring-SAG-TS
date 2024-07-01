import { Point } from "../../src";
import {
  valid_string_point_secp256k1,
  invalid_string_point_secp256k1,
} from "../data";
describe("Point class fromString()", () => {
  it("should return a point from a string representation of the point, secp256k1", () => {
    const point = Point.fromString(valid_string_point_secp256k1);
    expect(point).toBeInstanceOf(Point);
  });

  it("should throw an error if the string representation of the point is invalid, secp256k1", () => {
    expect(() => Point.fromString(invalid_string_point_secp256k1)).toThrow();
  });

  it("should throw an error if the string is void", () => {
    expect(() => Point.fromString("")).toThrow();
  });
});
