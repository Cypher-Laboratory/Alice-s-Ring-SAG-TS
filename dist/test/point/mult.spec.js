"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../src");
const data_1 = require("../data");
describe("Point class mult operation tests", () => {
    let mockSECP256K1;
    beforeEach(() => {
        mockSECP256K1 = new src_1.Curve(src_1.CurveName.SECP256K1); // Replace with actual initialization if necessary
    });
    it("should mult a point with a positif scalar correctly, SECP256K1", () => {
        const point = new src_1.Point(mockSECP256K1, data_1.valid_coordinates_secp256k1);
        const scalar = BigInt(10);
        const result = point.mult(scalar);
        expect(result).toBeInstanceOf(src_1.Point);
    });
    it("should throw computation error when point is not on the curve, SECP256K1", () => {
        const point = new src_1.Point(mockSECP256K1, data_1.valid_coordinates_secp256k1);
        const scalar = BigInt(0);
        expect(() => point.mult(scalar)).toThrow("invalid scalar");
    });
});
