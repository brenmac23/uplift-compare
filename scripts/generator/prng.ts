/**
 * Seeded pseudo-random number generator using the mulberry32 algorithm.
 *
 * Mulberry32 is a simple, fast, 32-bit PRNG with good statistical properties
 * for non-cryptographic use (simulation, procedural generation). It operates
 * on a single 32-bit integer state held in a closure — no mutable global state.
 *
 * Reference: public-domain algorithm widely used in graphics and simulation.
 *
 * Usage:
 *   import { createPrng } from './prng';
 *   import { SEED } from './types';
 *
 *   const rand = createPrng(SEED); // SEED = 0xDEADBEEF
 *   const value = rand();          // [0, 1) — identical interface to Math.random()
 */

/**
 * Creates a seeded PRNG using the mulberry32 algorithm.
 *
 * @param seed - 32-bit integer seed. Use the SEED constant (0xDEADBEEF) for
 *               reproducible generator runs. Different seeds produce different
 *               sequences; the same seed always produces the same sequence.
 * @returns A function with the same interface as Math.random() — values in [0, 1).
 *          Each call advances the internal state by one step.
 */
export function createPrng(seed: number): () => number {
  let s = seed;
  return function (): number {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
