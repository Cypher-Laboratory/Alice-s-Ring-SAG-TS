// taken and updated from https://github.com/paulmillr/noble-secp256k1/blob/097b60b10805058355f49924d6a5c5746ee116c9/index.ts
/*! noble-secp256k1 - MIT License (c) 2019 Paul Miller (paulmillr.com) */
const B256 = 2n ** 256n; // secp256k1 is short weierstrass curve
export const P = B256 - 0x1000003d1n; // curve's field prime
export const N = B256 - 0x14551231950b75fc4402da1732fc9bebfn; // curve (group) order
export const Gx =
  0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n; // base point x
export const Gy =
  0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n; // base point y
const CURVE = { p: P, n: N, a: 0n, b: 7n, Gx, Gy }; // exported variables incl. a, b
const fLen = 32; // field / group byte length
type Bytes = Uint8Array;
const crv = (x: bigint) => mod(mod(x * x) * x + CURVE.b); // x³ + ax + b weierstrass formula; a=0
const err = (m = ""): never => {
  throw new Error(m);
}; // error helper, messes-up stack trace
const big = (n: unknown): n is bigint => typeof n === "bigint"; // is big integer
const str = (s: unknown): s is string => typeof s === "string"; // is string
const fe = (n: bigint) => big(n) && 0n < n && n < P; // is field element (invertible)
const ge = (n: bigint) => big(n) && 0n < n && n < N; // is group element
const u8n = (data?: any) => new Uint8Array(data); // creates Uint8Array
const mod = (a: bigint, b = P) => {
  const r = a % b;
  return r >= 0n ? r : b + r;
}; // mod division
const isPoint = (p: unknown) =>
  p instanceof SECP256K1Point ? p : err("Point expected"); // is 3d point
interface AffinePoint {
  x: bigint;
  y: bigint;
} // Point in 2d xy affine coordinates
export class SECP256K1Point {
  // Point in 3d xyz projective coordinates
  constructor(
    readonly px: bigint,
    readonly py: bigint,
    readonly pz: bigint,
  ) {} //3d=less inversions
  static readonly BASE = new SECP256K1Point(Gx, Gy, 1n); // Generator / base point
  static readonly ZERO = new SECP256K1Point(0n, 1n, 0n); // Identity / zero point
  static fromAffine(p: AffinePoint) {
    return new SECP256K1Point(p.x, p.y, 1n);
  }
  get x() {
    return this.aff().x;
  } // .x, .y will call expensive toAffine:
  get y() {
    return this.aff().y;
  } // should be used with care.
  equals(other: SECP256K1Point): boolean {
    // Equality check: compare points
    const { px: X1, py: Y1, pz: Z1 } = this;
    const { px: X2, py: Y2, pz: Z2 } = isPoint(other); // isPoint() checks class equality
    const X1Z2 = mod(X1 * Z2),
      X2Z1 = mod(X2 * Z1);
    const Y1Z2 = mod(Y1 * Z2),
      Y2Z1 = mod(Y2 * Z1);
    return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
  }
  negate() {
    return new SECP256K1Point(this.px, mod(-this.py), this.pz);
  } // Flip point over y coord
  double() {
    return this.add(this);
  } // Point doubling: P+P, complete formula.
  add(other: SECP256K1Point) {
    // Point addition: P+Q, complete, exception
    const { px: X1, py: Y1, pz: Z1 } = this; // free formula from Renes-Costello-Batina
    const { px: X2, py: Y2, pz: Z2 } = isPoint(other); // https://eprint.iacr.org/2015/1060, algo 1
    const { a, b } = CURVE; // Cost: 12M + 0S + 3*a + 3*b3 + 23add
    let X3 = 0n,
      Y3 = 0n,
      Z3 = 0n;
    const b3 = mod(b * 3n);
    let t0 = mod(X1 * X2),
      t1 = mod(Y1 * Y2),
      t2 = mod(Z1 * Z2),
      t3 = mod(X1 + Y1); // step 1
    let t4 = mod(X2 + Y2); // step 5
    t3 = mod(t3 * t4);
    t4 = mod(t0 + t1);
    t3 = mod(t3 - t4);
    t4 = mod(X1 + Z1);
    let t5 = mod(X2 + Z2); // step 10
    t4 = mod(t4 * t5);
    t5 = mod(t0 + t2);
    t4 = mod(t4 - t5);
    t5 = mod(Y1 + Z1);
    X3 = mod(Y2 + Z2); // step 15
    t5 = mod(t5 * X3);
    X3 = mod(t1 + t2);
    t5 = mod(t5 - X3);
    Z3 = mod(a * t4);
    X3 = mod(b3 * t2); // step 20
    Z3 = mod(X3 + Z3);
    X3 = mod(t1 - Z3);
    Z3 = mod(t1 + Z3);
    Y3 = mod(X3 * Z3);
    t1 = mod(t0 + t0); // step 25
    t1 = mod(t1 + t0);
    t2 = mod(a * t2);
    t4 = mod(b3 * t4);
    t1 = mod(t1 + t2);
    t2 = mod(t0 - t2); // step 30
    t2 = mod(a * t2);
    t4 = mod(t4 + t2);
    t0 = mod(t1 * t4);
    Y3 = mod(Y3 + t0);
    t0 = mod(t5 * t4); // step 35
    X3 = mod(t3 * X3);
    X3 = mod(X3 - t0);
    t0 = mod(t3 * t1);
    Z3 = mod(t5 * Z3);
    Z3 = mod(Z3 + t0); // step 40
    return new SECP256K1Point(X3, Y3, Z3);
  }
  mul(n: bigint, safe = true) {
    // Point scalar multiplication.
    if (!safe && n === 0n) return I; // in unsafe mode, allow zero
    if (!ge(n)) err("invalid scalar"); // must be 0 < n < CURVE.n
    // if (this.equals(G)) return wNAF(n).p; // use precomputes for base point
    let p = I,
      f = G; // init result point & fake point
    for (let d: SECP256K1Point = this; n > 0n; d = d.double(), n >>= 1n) {
      // double-and-add ladder
      if (n & 1n)
        p = p.add(d); // if bit is present, add to point
      else if (safe) f = f.add(d); // if not, add to fake for timing safety
    }
    return p;
  }
  mulAddQUns(R: SECP256K1Point, u1: bigint, u2: bigint) {
    // Double scalar mult. Q = u1⋅G + u2⋅R.
    return this.mul(u1, false).add(R.mul(u2, false)).ok(); // Unsafe: do NOT use for stuff related
  } // to private keys. Doesn't use Shamir trick
  toAffine(): AffinePoint {
    // Convert point to 2d xy affine point.
    const { px: x, py: y, pz: z } = this; // (x, y, z) ∋ (x=x/z, y=y/z)
    if (this.equals(I)) return { x: 0n, y: 0n }; // fast-path for zero point
    if (z === 1n) return { x, y }; // if z is 1, pass affine coordinates as-is
    const iz = inv(z); // z^-1: invert z
    if (mod(z * iz) !== 1n) err("invalid inverse"); // (z * z^-1) must be 1, otherwise bad math
    return { x: mod(x * iz), y: mod(y * iz) }; // x = x*z^-1; y = y*z^-1
  }
  assertValidity(): SECP256K1Point {
    // Checks if the point is valid and on-curve
    const { x, y } = this.toAffine(); // convert to 2d xy affine point.
    if (!fe(x) || !fe(y)) err("Point invalid: x or y"); // x and y must be in range 0 < n < P
    return mod(y * y) === crv(x) // y² = x³ + ax + b, must be equal
      ? this
      : err("Point invalid: not on curve");
  }
  aff() {
    return this.toAffine();
  }
  ok() {
    return this.assertValidity();
  }
  toHex(isCompressed = true) {
    // Encode point to hex string.
    const { x, y } = this.aff(); // convert to 2d xy affine point
    const head = isCompressed ? ((y & 1n) === 0n ? "02" : "03") : "04"; // 0x02, 0x03, 0x04 prefix
    return head + n2h(x) + (isCompressed ? "" : n2h(y)); // prefix||x and ||y
  }
  toRawBytes(isCompressed = true) {
    // Encode point to Uint8Array.
    return h2b(this.toHex(isCompressed)); // re-use toHex(), convert hex to bytes
  }
}
const { BASE: G, ZERO: I } = SECP256K1Point; // Generator, identity points
const padh = (n: number | bigint, pad: number) =>
  n.toString(16).padStart(pad, "0");
const b2h = (b: Bytes): string =>
  Array.from(b)
    .map((e) => padh(e, 2))
    .join(""); // bytes to hex
const h2b = (hex: string): Bytes => {
  // hex to bytes
  const l = hex.length; // error if not string,
  if (!str(hex) || l % 2) err("hex invalid 1"); // or has odd length like 3, 5.
  const arr = u8n(l / 2); // create result array
  for (let i = 0; i < arr.length; i++) {
    const j = i * 2;
    const h = hex.slice(j, j + 2); // hexByte. slice is faster than substr
    const b = Number.parseInt(h, 16); // byte, created from string part
    if (Number.isNaN(b) || b < 0) err("hex invalid 2"); // byte must be valid 0 <= byte < 256
    arr[i] = b;
  }
  return arr;
};
const n2b = (num: bigint): Bytes => {
  // number to 32b. Must be 0 <= num < B256
  return big(num) && num >= 0n && num < B256
    ? h2b(padh(num, 2 * fLen))
    : err("bigint expected");
};
const n2h = (num: bigint): string => b2h(n2b(num)); // number to 32b hex
const inv = (num: bigint, md = P): bigint => {
  // modular inversion
  if (num === 0n || md <= 0n) err("no inverse n=" + num + " mod=" + md); // no neg exponent for now
  let a = mod(num, md),
    b = md,
    x = 0n,
    y = 1n,
    u = 1n,
    v = 0n;
  while (a !== 0n) {
    // uses euclidean gcd algorithm
    const q = b / a,
      r = b % a; // not constant-time
    const m = x - u * q,
      n = y - v * q;
    (b = a), (a = r), (x = u), (y = v), (u = m), (v = n);
  }
  return b === 1n ? mod(x, md) : err("no inverse"); // b is gcd at this point
};