/**
 * deterministicSeed.ts
 *
 * Provides a seeded pseudo-random number generator (Mulberry32) and helpers
 * for deterministic mock social-graph generation.
 *
 * NEVER touches Math.random(). All outputs are reproducible from a string seed.
 * Zero network requests — works completely offline.
 */

// ── Seed hash ─────────────────────────────────────────────────────────────────

/**
 * Converts a string into a stable 32-bit integer seed using djb2a.
 */
export function seedFromString(str: string): number {
  let h = 0x12345678;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 0x9e3779b9);
    h = (h << 13) | (h >>> 19);
  }
  // Ensure positive, non-zero
  return (h >>> 0) || 1;
}

// ── Mulberry32 PRNG ───────────────────────────────────────────────────────────

/**
 * Returns a stateful Mulberry32 generator seeded with `seed`.
 * Call `next()` to get the next float in [0, 1).
 */
export function createSeededRng(seed: number) {
  let s = seed >>> 0;
  return {
    next(): number {
      s |= 0;
      s = (s + 0x6d2b79f5) | 0;
      let z = Math.imul(s ^ (s >>> 15), 1 | s);
      z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
      return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
    },
    /** Integer in [min, max] inclusive */
    int(min: number, max: number): number {
      return min + Math.floor(this.next() * (max - min + 1));
    },
    /** Pick a random element from an array */
    pick<T>(arr: readonly T[]): T {
      return arr[Math.floor(this.next() * arr.length)];
    },
  };
}

// ── Fisher-Yates shuffle with seeded RNG ─────────────────────────────────────

type SeededRng = ReturnType<typeof createSeededRng>;

/**
 * Returns a new shuffled copy of `arr` using the seeded RNG.
 * The original array is not mutated.
 */
export function seededShuffle<T>(arr: readonly T[], rng: SeededRng): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
