import { describe, expect, it } from 'vitest'
import type { QuizQuestion } from '../types'
import { addAnswer, EMPTY_SCORE, isCorrect } from './scoring'

const question: QuizQuestion = {
  id: 'test-001',
  question: 'Vilken planet är störst?',
  options: ['Saturnus', 'Jupiter', 'Neptunus'],
  correctIndex: 1,
}

describe('isCorrect', () => {
  it('is true only for the correct option', () => {
    expect(isCorrect(question, 1)).toBe(true)
    expect(isCorrect(question, 0)).toBe(false)
    expect(isCorrect(question, 2)).toBe(false)
  })
})

describe('addAnswer', () => {
  it('starts from zero', () => {
    expect(EMPTY_SCORE).toEqual({ correct: 0, incorrect: 0 })
  })

  it('counts correct and incorrect answers', () => {
    let score = EMPTY_SCORE
    score = addAnswer(score, true)
    score = addAnswer(score, false)
    score = addAnswer(score, true)
    expect(score).toEqual({ correct: 2, incorrect: 1 })
  })

  it('returns a new object and leaves the previous score unchanged', () => {
    const before = { correct: 3, incorrect: 4 }
    const after = addAnswer(before, false)
    expect(after).not.toBe(before)
    expect(before).toEqual({ correct: 3, incorrect: 4 })
  })
})
