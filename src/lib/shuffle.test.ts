import { describe, expect, it } from 'vitest'
import { shuffle } from './shuffle'
import { seededRandom } from './testing/seededRandom'

describe('shuffle', () => {
  it('returns the same elements in a new array', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8]
    const result = shuffle(input, seededRandom(1))
    expect(result).not.toBe(input)
    expect(result).toHaveLength(input.length)
    expect([...result].sort((a, b) => a - b)).toEqual(input)
  })

  it('does not mutate the input', () => {
    const input = Object.freeze([1, 2, 3, 4, 5])
    shuffle(input, seededRandom(2))
    expect(input).toEqual([1, 2, 3, 4, 5])
  })

  it('handles empty and single-element arrays', () => {
    expect(shuffle([])).toEqual([])
    expect(shuffle(['a'])).toEqual(['a'])
  })

  it('is deterministic for a given random source', () => {
    const input = Array.from({ length: 20 }, (_, i) => i)
    expect(shuffle(input, seededRandom(42))).toEqual(shuffle(input, seededRandom(42)))
  })

  it('produces every permutation with roughly equal frequency', () => {
    const runs = 60_000
    const random = seededRandom(123)
    const counts = new Map<string, number>()
    for (let i = 0; i < runs; i++) {
      const key = shuffle([1, 2, 3], random).join('')
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    expect(counts.size).toBe(6)
    const expected = runs / 6
    for (const count of counts.values()) {
      expect(Math.abs(count - expected) / expected).toBeLessThan(0.05)
    }
  })
})
