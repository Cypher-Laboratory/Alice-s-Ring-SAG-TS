import {
  randomBigint,
  getRandomSecuredNumber,
  modulo,
  formatRing,
  formatPoint,
} from "./utils";
import { piSignature, verifyPiSignature } from "./signature/piSignature";
import { derivePubKey } from "./curves";
import { Curve, Point } from ".";
import { SignatureConfig } from "./interfaces";
import { keccak256 } from "./utils";

/**
 * Partial ring signature interface
 *
 * @see message - Clear message
 * @see ring - Ring of public keys
 * @see pi - The signer index -> should be kept secret
 * @see c - The first c computed during the first part of the signing
 * @see cpi - The c value of the signer
 * @see alpha - The alpha value
 * @see responses - The generated responses
 * @see curve - The elliptic curve to use
 * @see config - The config params to use (optional)
 */
export interface PartialSignature {
  message: string;
  ring: Point[];
  pi: number;
  c: bigint;
  cpi: bigint;
  alpha: bigint;
  responses: bigint[];
  curve: Curve;
  config?: SignatureConfig;
}

/**
 * Ring signature class.
 * This class is used to sign messages using ring signatures.
 * It can also be used to verify ring signatures.
 */
export class RingSignature {
  message: string; // clear message
  c: bigint;
  responses: bigint[];
  ring: Point[];
  curve: Curve;
  config?: SignatureConfig;
  hash: (message: string) => string;

  /**
   * Ring signature class constructor
   *
   * @param message - Clear message to sign
   * @param ring - Ring of public keys
   * @param cees - c values
   * @param responses - Responses for each public key in the ring
   * @param curve - Curve used for the signature
   * @param safeMode - If true, check if all the points are on the same curve
   * @param config - The config params to use (optional)
   */
  constructor(
    message: string,
    ring: Point[],
    c: bigint,
    responses: bigint[],
    curve: Curve,
    config?: SignatureConfig,
  ) {
    if (ring.length != responses.length)
      throw new Error("Ring and responses length mismatch");

    if (config?.safeMode) checkRing(ring, curve);

    if (config?.hash) this.hash = config.hash;
    else this.hash = keccak256;

    this.ring = ring;
    this.message = message;
    this.c = c;
    this.responses = responses;
    this.curve = curve;
    this.config = config;
  }

  /**
   * Create a RingSignature from a json object
   *
   * @param json - The json to convert
   *
   * @returns A RingSignature
   */
  static fromJsonString(
    json: string,
    hashFunction?: (message: string) => string,
  ): RingSignature {
    try {
      const sig = JSON.parse(json) as {
        message: string;
        ring: string[];
        c: string;
        responses: string[];
        curve: string;
        config?: SignatureConfig;
      };
      return new RingSignature(
        sig.message,
        sig.ring.map((point: string) => Point.fromString(point)),
        BigInt(sig.c),
        sig.responses.map((response: string) => BigInt(response)),
        Curve.fromString(sig.curve),
        {
          ...sig.config,
          hash: hashFunction,
        },
      );
    } catch (e) {
      throw new Error("Invalid json: " + e);
    }
  }

  /**
   * Create a Json string from a RingSignature
   *
   * @returns A json string
   */
  toJsonString(): string {
    const out = JSON.stringify({
      message: this.message,
      ring: this.ring.map((point: Point) => point.toString()),
      c: this.c.toString(),
      responses: this.responses.map((response) => response.toString()),
      curve: this.curve.toString(),
      config: this.config,
    });

    return out;
  }

  /**
   * Transforms a Base64 string to a ring signature
   *
   * @param base64 - The base64 encoded signature
   *
   * @returns The ring signature
   */
  static fromBase64(
    base64: string,
    hashFunction?: (message: string) => string,
  ): RingSignature {
    const decoded = Buffer.from(base64, "base64").toString("ascii");
    const json = JSON.parse(decoded);
    const ring = json.ring.map((point: string) => Point.fromString(point));

    return new RingSignature(
      json.message,
      ring,
      BigInt(json.c),
      json.responses.map((response: string) => BigInt(response)),
      Curve.fromString(json.curve),
      {
        ...json.config,
        hash: hashFunction,
      },
    );
  }

  /**
   * Encode a ring signature to base64 string
   */
  toBase64(): string {
    return Buffer.from(this.toJsonString()).toString("base64");
  }
  /**
   * Sign a message using ring signatures
   *
   * @param ring - Ring of public keys (does not contain the signer public key)
   * @param signerPrivKey - Private key of the signer
   * @param message - Clear message to sign
   * @param curve - The elliptic curve to use
   * @param config - The config params to use
   *
   * @returns A RingSignature
   */
  static sign(
    ring: Point[], // ring.length = n
    signerPrivateKey: bigint,
    message: string,
    curve: Curve,
    config?: SignatureConfig,
  ): RingSignature {
    if (ring.length === 0) {
      /* If the ring is empty, we just sign the message using our schnorr-like signature scheme
       * and return a ring signature with only one response.
       * Note that alpha is computed from c to allow verification.
       */
      const c = randomBigint(curve.N);
      const alpha = modulo(2n * c + 1n, curve.N);
      const sig = piSignature(alpha, c, signerPrivateKey, curve);

      return new RingSignature(
        message,
        [curve.GtoPoint().mult(signerPrivateKey)], // curve's generator point * private key
        c,
        [sig],
        curve,
      );
    }

    const rawSignature = RingSignature.signature(
      curve,
      ring,
      signerPrivateKey,
      message,
      config,
    );

    // compute the signer response
    const signerResponse = piSignature(
      rawSignature.alpha,
      rawSignature.cees[rawSignature.signerIndex],
      signerPrivateKey,
      curve,
    );

    return new RingSignature(
      message,
      rawSignature.ring,
      rawSignature.cees[0],
      // insert the signer response
      rawSignature.responses
        .slice(0, rawSignature.signerIndex)
        .concat(
          [signerResponse],
          rawSignature.responses.slice(rawSignature.signerIndex + 1),
        ),
      curve,
      config,
    );
  }

  /**
   * Sign a message using ring signatures
   *
   * @param ring - Ring of public keys (does not contain the signer public key)
   * @param message - Clear message to sign
   * @param signerPubKey - Public key of the signer
   * @param config - The config params to use
   *
   * @returns A PartialSignature
   */
  static partialSign(
    ring: Point[], // ring.length = n
    message: string,
    signerPubKey: Point,
    curve: Curve,
    config?: SignatureConfig,
  ) {
    if (ring.length === 0)
      throw new Error(
        "To proceed partial signing, ring length must be greater than 0",
      );

    const rawSignature = RingSignature.signature(
      curve,
      ring,
      signerPubKey,
      message,
      config,
    );

    return {
      message,
      ring: rawSignature.ring,
      c: rawSignature.cees[0],
      cpi: rawSignature.cees[rawSignature.signerIndex],
      responses: rawSignature.responses,
      pi: rawSignature.signerIndex,
      alpha: rawSignature.alpha,
      curve: curve,
      config: config,
    } as PartialSignature;
  }

  /**
   * Combine partial signatures into a RingSignature
   *
   * @param partialSig - Partial signatures to combine
   * @param signerResponse - Response of the signer
   *
   * @returns A RingSignature
   */
  static combine(
    partialSig: PartialSignature,
    signerResponse: bigint,
  ): RingSignature {
    return new RingSignature(
      partialSig.message,
      partialSig.ring,
      partialSig.c,
      // insert the signer response
      partialSig.responses
        .slice(0, partialSig.pi)
        .concat(
          [signerResponse],
          partialSig.responses.slice(partialSig.pi + 1),
        ),
      partialSig.curve,
      partialSig.config,
    );
  }

  /**
   * Verify a RingSignature
   *
   * @returns True if the signature is valid, false otherwise
   */
  verify(): boolean {
    // we compute c1' = Hash(Ring, m, [r0G, c0K0])
    // then, for each ci (1 < i < n), compute ci' = Hash(Ring, message, [riG + ciKi])
    // (G = generator, K = ring public key)
    // finally, if we substitute lastC for lastC' and c0' == c0, the signature is valid
    if (this.ring.length === 0)
      throw new Error("Ring length must be greater than 0");

    if (this.ring.length !== this.responses.length) {
      throw new Error("ring and responses length mismatch");
    }
    const G: Point = this.curve.GtoPoint(); // generator point

    if (this.ring.length > 1) {
      // hash the message
      const messageDigest: string = this.hash(this.message);

      // computes the cees
      let lastComputedCp = RingSignature.computeC(
        // c1'
        this.ring,
        messageDigest,
        G,
        this.curve.N,
        {
          r: this.responses[0],
          previousC: this.c,
          previousPubKey: this.ring[0],
        },
        this.config,
      );

      for (let i = 2; i < this.ring.length; i++) {
        // c2' -> cn'
        lastComputedCp = RingSignature.computeC(
          this.ring,
          messageDigest,
          G,
          this.curve.N,
          {
            r: this.responses[i - 1],
            previousC: lastComputedCp,
            previousPubKey: this.ring[i - 1],
          },
          this.config,
        );
      }

      // return true if c0 === c0'
      return (
        this.c ===
        RingSignature.computeC(
          this.ring,
          messageDigest,
          G,
          this.curve.N,
          {
            r: this.responses[this.responses.length - 1],
            previousC: lastComputedCp,
            previousPubKey: this.ring[this.ring.length - 1],
          },
          this.config,
        )
      );
    }

    // if ring length = 1 :
    return verifyPiSignature(
      this.ring[0],
      this.responses[0],
      modulo(2n * this.c + 1n, this.curve.N),
      this.c,
      this.curve,
    );
  }

  /**
   * Verify a RingSignature stored as a json string
   *
   * @param signature - The json signature to verify
   * @returns True if the signature is valid, false otherwise
   */
  static verify(signature: string): boolean {
    const ringSignature: RingSignature =
      RingSignature.fromJsonString(signature);
    return ringSignature.verify();
  }

  /**
   * Generate an incomplete ring signature.
   * Allow the user to use its private key from an external software (external software/hardware wallet)
   *
   * @param curve - The curve to use
   * @param ring - The ring of public keys
   * @param signerKey - The signer private or public key
   * @param message - The message to sign
   * @param config - The config params to use
   *
   * @returns An incomplete ring signature
   */
  private static signature(
    curve: Curve,
    ring: Point[],
    signerKey: Point | bigint,
    message: string,
    config?: SignatureConfig,
  ): {
    ring: Point[];
    cees: bigint[];
    alpha: bigint;
    signerIndex: number;
    responses: bigint[];
  } {
    let hash = keccak256;
    if (config?.hash) hash = config.hash;

    // hash the message
    const messageDigest: string = hash(message);

    // generate random number alpha
    const alpha: bigint = randomBigint(curve.N);

    let signerPubKey: Point;
    if (typeof signerKey === "bigint") {
      signerPubKey = derivePubKey(signerKey, curve, config?.derivationConfig);
    } else {
      signerPubKey = signerKey;
    }
    // set the signer position in the ring
    const pi = getRandomSecuredNumber(0, ring.length - 1); // signer index
    // add the signer public key to the ring
    ring = ring.slice(0, pi).concat([signerPubKey], ring.slice(pi)) as Point[];

    // check for duplicates using a set
    const ringSet = new Set(ring);
    if (ringSet.size !== ring.length) {
      throw new Error("Ring contains duplicates");
    }

    // generate random responses for every public key in the ring
    const responses: bigint[] = [];
    for (let i = 0; i < ring.length; i++) {
      responses.push(randomBigint(curve.N));
    }

    // contains all the cees from pi+1 to n (pi+1, pi+2, ..., n)(n = ring.length - 1)
    const cValuesPI1N: bigint[] = [];

    // compute C pi+1
    cValuesPI1N.push(
      RingSignature.computeC(
        ring,
        messageDigest,
        curve.GtoPoint(),
        curve.N,
        { alpha: alpha },
        config,
      ),
    );

    // compute Cpi+2 to Cn
    for (let i = pi + 2; i < ring.length; i++) {
      cValuesPI1N.push(
        RingSignature.computeC(
          ring,
          messageDigest,
          curve.GtoPoint(),
          curve.N,
          {
            r: responses[i - 1],
            previousC: cValuesPI1N[i - pi - 2],
            previousPubKey: ring[i - 1],
          },
          config,
        ),
      );
    }

    // contains all the c from 0 to pi
    const cValues0PI: bigint[] = [];

    // compute c0 using cn
    cValues0PI.push(
      RingSignature.computeC(
        ring,
        messageDigest,
        curve.GtoPoint(),
        curve.N,
        {
          r: responses[responses.length - 1],
          previousC: cValuesPI1N[cValuesPI1N.length - 1],
          previousPubKey: ring[ring.length - 1],
        },
        config,
      ),
    );

    // compute C0 to C pi -1
    for (let i = 1; i < pi + 1; i++) {
      cValues0PI[i] = RingSignature.computeC(
        ring,
        messageDigest,
        curve.GtoPoint(),
        curve.N,
        {
          r: responses[i - 1],
          previousC: cValues0PI[i - 1],
          previousPubKey: ring[i - 1],
        },
        config,
      );
    }

    // concatenate CValues0PI, cpi and CValuesPI1N to get all the c values
    const cees: bigint[] = cValues0PI.concat(cValuesPI1N);

    return {
      ring: ring,
      cees: cees,
      alpha: alpha,
      signerIndex: pi,
      responses: responses,
    };
  }

  /** // TODO: update doc according to function signature
   * Compute a c value
   *
   * @remarks
   * This function is used to compute the c value of a partial signature.
   * Either 'alpha' or all the other parameters of 'params' must be set.
   *
   * @param ring - Ring of public keys
   * @param message - Message digest
   * @param G - Curve generator point
   * @param N - Curve order
   * @param r - The response which will be used to compute the c value
   * @param previousC - The previous c value
   * @param previousPubKey - The previous public key
   * @param config - The config params to use
   * @param piPlus1 - If set, the c value will be computed as if it was the pi+1 signer
   *
   * @returns A c value
   */
  private static computeC(
    ring: Point[],
    message: string,
    G: Point,
    N: bigint,
    params: {
      r?: bigint;
      previousC?: bigint;
      previousPubKey?: Point;
      alpha?: bigint;
    },
    config?: SignatureConfig,
  ): bigint {
    let hash = keccak256;
    if (config?.hash) hash = config.hash;

    if (params.alpha) {
      return modulo(
        BigInt(
          "0x" +
            hash(
              formatRing(ring, config) +
                message +
                formatPoint(G.mult(params.alpha), config),
            ),
        ),
        N,
      );
    }
    if (params.r && params.previousC && params.previousPubKey) {
      return modulo(
        BigInt(
          "0x" +
            hash(
              formatRing(ring, config) +
                message +
                formatPoint(
                  G.mult(params.r).add(
                    params.previousPubKey.mult(params.previousC),
                  ),
                  config,
                ),
            ),
        ),
        N,
      );
    }

    throw new Error(
      "computeC: Missing parameters. Either 'alpha' or all the others params must be set",
    );
  }

  /**
   * Convert a partial signature to a base64 string
   *
   * @param partialSig - The partial signature to convert
   * @returns A base64 string
   */
  static partialSigToBase64(partialSig: PartialSignature): string {
    let configStr: string | undefined = undefined;
    if (partialSig.config) {
      configStr = JSON.stringify(partialSig.config);
    }
    const strPartialSig = {
      message: partialSig.message,
      ring: partialSig.ring.map((point: Point) => point.toString()),
      c: partialSig.c.toString(),
      cpi: partialSig.cpi.toString(),
      responses: partialSig.responses.map((response) => response.toString()),
      pi: partialSig.pi.toString(),
      alpha: partialSig.alpha.toString(),
      curve: partialSig.curve.toString(),
      config: configStr,
    };
    return Buffer.from(JSON.stringify(strPartialSig)).toString("base64");
  }

  /**
   * Convert a base64 string to a partial signature
   *
   * @param base64 - The base64 string to convert
   * @returns A partial signature
   */
  static base64ToPartialSig(
    base64: string,
    hashFunction?: (message: string) => string,
  ): PartialSignature {
    try {
      const decoded = Buffer.from(base64, "base64").toString("ascii");
      const json = JSON.parse(decoded);
      if (json.config && json.config != "undefined") {
        json.config = JSON.parse(json.config);
      }
      return {
        message: json.message,
        ring: json.ring.map((point: string) => Point.fromString(point)),
        c: BigInt(json.c),
        cpi: BigInt(json.cpi),
        responses: json.responses.map((response: string) => BigInt(response)),
        pi: Number(json.pi),
        alpha: BigInt(json.alpha),
        curve: Curve.fromString(json.curve),
        config: {
          ...(json.config as SignatureConfig),
          hash: hashFunction,
        },
      };
    } catch (e) {
      throw new Error("Invalid base64 string: " + e);
    }
  }
}

/**
 * Check if a ring is valid
 *
 * @param ring - The ring to check
 * @param ref - The curve to use as a reference (optional, if not set, the first point's curve will be used)
 *
 * @throws Error if the ring is empty
 * @throws Error if the ring contains duplicates
 * @throws Error if at least one of the points is invalid
 */
export function checkRing(ring: Point[], ref?: Curve): void {
  const errorMsg = "Invalid ring: ";

  if (!ref) ref = ring[0].curve;

  // check if the ring is empty
  if (ring.length === 0) throw new Error(errorMsg + "Ring is empty");

  // check for duplicates using a set
  if (new Set(ring).size !== ring.length)
    throw new Error(errorMsg + "Ring contains duplicates");

  // check if all the points are valid
  try {
    for (const point of ring) {
      checkPoint(point, ref);
    }
  } catch (e) {
    throw new Error(errorMsg + e);
  }
}

/**
 * Check if a point is valid
 *
 * @param point - The point to check
 * @param curve - The curve to use as a reference
 *
 * @throws Error if the point is not on the reference curve
 * @throws Error if at least 1 coordinate is not valid (= 0 or >= curve order)
 */
export function checkPoint(point: Point, curve?: Curve): void {
  const errorMsg = "Invalid point: ";

  // check if the point is on the reference curve
  if (curve && !(!curve.isOnCurve(point) && curve.equals(point.curve)))
    throw new Error(errorMsg + "Point is not on curve");

  // check if coordinates are valid
  if (
    point.x === 0n ||
    point.y === 0n ||
    point.x >= point.curve.N ||
    point.y >= point.curve.N
  ) {
    throw new Error(errorMsg + "Coordinates are not valid");
  }
}
export { SignatureConfig };
