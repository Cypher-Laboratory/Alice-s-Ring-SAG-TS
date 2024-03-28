import { randomBytes } from "node:crypto";
import { tooSmall } from "../errors";

/**
 * generate a random bigint in [1,max]
 *
 * @param max the max value of the random number
 * @returns the random bigint
 */

export function randomBigint(max: bigint): bigint {
  if (max <= 0n) {
    throw tooSmall("Max", max);
  }

  // +1 to ensure we can reach max value
  const byteSize = (max.toString(16).length + 1) >> 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const array = randomBytes(byteSize);
    const randomHex = array.toString("hex");
    const randomBig = BigInt("0x" + randomHex);

    if (randomBig < max) {
      return randomBig + 1n;
    }
  }
}
