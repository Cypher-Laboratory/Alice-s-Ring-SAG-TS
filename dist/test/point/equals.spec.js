"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../src");
const data_1 = require("../data");
describe("Point class add operation tests", () => {
    let mockSECP256K1;
    beforeEach(() => {
        mockSECP256K1 = new src_1.Curve(src_1.CurveName.SECP256K1); // Replace with actual initialization if necessary
    });
    it("should return true points are equals, SECP256K1", () => {
        const point1 = new src_1.Point(mockSECP256K1, data_1.valid_coordinates_secp256k1);
        const point2 = new src_1.Point(mockSECP256K1, data_1.valid_coordinates_secp256k1);
        expect(point1.equals(point2)).toBeTruthy();
    });
    it("should return false points are not equals, SECP256K1", () => {
        const point = new src_1.Point(mockSECP256K1, data_1.valid_coordinates_secp256k1);
        const point2 = new src_1.Point(mockSECP256K1, data_1.valid_coordinates_secp256k1);
        point2.x = BigInt(0);
        point2.y = BigInt(0);
        expect(point.equals(point2)).toBeFalsy();
    });
});
