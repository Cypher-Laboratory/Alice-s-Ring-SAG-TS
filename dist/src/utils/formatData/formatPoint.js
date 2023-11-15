"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPoint = void 0;
/**
 * Format a point according to the selected config
 *
 * @remarks
 * Default value is Point.toString()
 *
 * @param point - the point to format
 * @param config - the config to use
 *
 * @returns the formatted point
 */
function formatPoint(point, config) {
    if (config?.evmCompatibility) {
        return point.x.toString() + point.y.toString();
    }
    return point.toString();
}
exports.formatPoint = formatPoint;