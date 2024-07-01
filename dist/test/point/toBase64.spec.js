"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../src");
const data_1 = require("../data");
describe("Point class mult operation tests", () => {
    let mockSECP256K1;
    beforeEach(() => {
        mockSECP256K1 = new src_1.Curve(src_1.CurveName.SECP256K1); // Replace with actual initialization if necessary
    });
    it("Should return a valid base64 encoded string, secp256k1", () => {
        const point = new src_1.Point(mockSECP256K1, data_1.valid_coordinates_secp256k1);
        expect(() => Buffer.from(point.toBase64(), "base64")).not.toThrow();
    });
    it("Should return a valid Point, secp256k1", () => {
        const point = new src_1.Point(mockSECP256K1, data_1.valid_coordinates_secp256k1);
        expect(src_1.Point.fromBase64(point.toBase64())).toBeInstanceOf(src_1.Point);
    });
});
