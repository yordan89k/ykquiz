/**
 * Returns a shuffled copy of `items` using an unbiased Fisher–Yates shuffle.
 * The input is never mutated. `random` must return values in [0, 1).
 */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = items.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const tmp = result[i]!
    result[i] = result[j]!
    result[j] = tmp
  }
  return result
}
