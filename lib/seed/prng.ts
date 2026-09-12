// PRNG ber-seed (mulberry32) — dipakai generator data seed historis supaya hasilnya
// reproducible (seed sama => output identik), bukan Math.random() yang tidak bisa
// direproduksi ulang. Lih. DESIGN-09-SEED-HISTORIS.md keputusan #2.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function (): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
