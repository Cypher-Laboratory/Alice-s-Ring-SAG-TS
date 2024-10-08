export { randomBigint } from "./randomNumbers";
export {
  keccak_256,
  hash,
  sha_512,
  ecHash,
  HashFunction,
} from "./hashFunction";
export { base64Regex } from "./base64";
export { modPow } from "./modPow";
export * from "./ringUtils";
export * from "./pointsUtils";

/**
 * Utils function to cast uint8 array to hex string
 * @param array - The array to cast
 * @returns The hex string
 */
export function uint8ArrayToHex(array: Uint8Array): string {
  let hex = "";
  for (let i = 0; i < array.length; i++) {
    hex += ("00" + array[i].toString(16)).slice(-2);
  }
  return hex;
}
