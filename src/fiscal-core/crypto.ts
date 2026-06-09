/** Implementação pequena de SHA-1 em hexadecimal para assinar payloads de QR Code NFC-e. */
export function sha1Hex(message: string): string {
  const bytes = new TextEncoder().encode(message);
  const words: number[] = [];
  for (let i = 0; i < bytes.length; i += 1) {
    words[i >> 2] = (words[i >> 2] ?? 0) | (bytes[i]! << (24 - (i % 4) * 8));
  }
  words[bytes.length >> 2] = (words[bytes.length >> 2] ?? 0) | (0x80 << (24 - (bytes.length % 4) * 8));
  words[(((bytes.length + 8) >> 6) << 4) + 15] = bytes.length * 8;

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  for (let i = 0; i < words.length; i += 16) {
    const w = Array<number>(80);
    for (let j = 0; j < 16; j += 1) w[j] = words[i + j] ?? 0;
    for (let j = 16; j < 80; j += 1) w[j] = leftRotate(w[j - 3]! ^ w[j - 8]! ^ w[j - 14]! ^ w[j - 16]!, 1);

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let j = 0; j < 80; j += 1) {
      const [f, k] = j < 20
        ? [(b & c) | (~b & d), 0x5a827999]
        : j < 40
          ? [b ^ c ^ d, 0x6ed9eba1]
          : j < 60
            ? [(b & c) | (b & d) | (c & d), 0x8f1bbcdc]
            : [b ^ c ^ d, 0xca62c1d6];
      const temp = (leftRotate(a, 5) + f + e + k + w[j]!) | 0;
      e = d;
      d = c;
      c = leftRotate(b, 30);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
  }

  return [h0, h1, h2, h3, h4].map((word) => (word >>> 0).toString(16).padStart(8, "0")).join("");
}

/** Rotaciona bits à esquerda, operação primitiva usada pelo SHA-1. */
function leftRotate(value: number, bits: number): number {
  return (value << bits) | (value >>> (32 - bits));
}
