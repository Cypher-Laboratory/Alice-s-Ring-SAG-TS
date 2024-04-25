export declare enum HashFunction {
    KECCAK256 = "keccak256",
    SHA512 = "sha512"
}
/**
 * Hash data using the specified hash function (default: keccak256)
 *
 * @param data - The data to hash
 * @param fct - The hash function to use (optional)
 *
 * @returns - The hash of the data
 */
export declare function hash(data: string, fct?: HashFunction): string;
/**
 * Hash data using keccak256
 *
 * @param input - The data to hash
 *
 * @returns - The hash of the data as an hex string
 */
export declare function keccak_256(input: string): string;
/**
 * Hash data using sha512
 *
 * @param input - The data to hash
 *
 * @returns - The hash of the data  as an hex string
 */
export declare function sha_512(input: string): string;