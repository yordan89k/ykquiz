import { describe, expect, it } from 'vitest'
import type { Question, TopicData } from '../types'
import rymden from '../data/rymden.json'
import { createQuiz, QUIZ_LENGTH } from './quiz'
import { seededRandom } from './testing/seededRandom'

function makeQuestions(n: number): Question[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `test-${String(i + 1).padStart(3, '0')}`,
    question: `Fråga ${i + 1}?`,
    correct: `Rätt ${i + 1}`,
    wrong: [`Fel ${i + 1}a`, `Fel ${i + 1}b`],
  }))
}

describe('createQuiz', () => {
  const questions = makeQuestions(50)
  const byId = new Map(questions.map((q) => [q.id, q]))

  it('returns exactly 20 questions by default', () => {
    expect(QUIZ_LENGTH).toBe(20)
    expect(createQuiz(questions, undefined, seededRandom(1))).toHaveLength(20)
  })

  it('never contains duplicate questions', () => {
    const random = seededRandom(2)
    for (let i = 0; i < 200; i++) {
      const ids = createQuiz(questions, QUIZ_LENGTH, random).map((q) => q.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('only uses questions from the input, with the correct answer among the options', () => {
    for (const q of createQuiz(questions, QUIZ_LENGTH, seededRandom(3))) {
      const source = byId.get(q.id)
      expect(source).toBeDefined()
      expect(q.question).toBe(source!.question)
      expect([...q.options].sort()).toEqual([source!.correct, ...source!.wrong].sort())
      expect(q.options[q.correctIndex]).toBe(source!.correct)
    }
  })

  it('does not mutate the input', () => {
    const snapshot = structuredClone(questions)
    createQuiz(questions, QUIZ_LENGTH, seededRandom(4))
    expect(questions).toEqual(snapshot)
  })

  it('supports a custom count, including all questions', () => {
    expect(createQuiz(questions, 5, seededRandom(5))).toHaveLength(5)
    expect(createQuiz(questions, 50, seededRandom(5))).toHaveLength(50)
  })

  it('throws when the topic has too few questions', () => {
    expect(() => createQuiz(makeQuestions(19))).toThrow(/Not enough questions/)
  })

  it('places the correct answer in A, B and C roughly equally often', () => {
    const random = seededRandom(6)
    const positions = [0, 0, 0]
    for (let i = 0; i < 1_500; i++) {
      for (const q of createQuiz(questions, QUIZ_LENGTH, random)) positions[q.correctIndex]!++
    }

    const total = 1_500 * QUIZ_LENGTH
    for (const count of positions) {
      expect(Math.abs(count - total / 3) / (total / 3)).toBeLessThan(0.03)
    }
  })

  it('draws every question with roughly equal probability', () => {
    const runs = 5_000
    const random = seededRandom(7)
    const picks = new Map<string, number>()
    for (let i = 0; i < runs; i++) {
      for (const q of createQuiz(questions, QUIZ_LENGTH, random)) {
        picks.set(q.id, (picks.get(q.id) ?? 0) + 1)
      }
    }

    expect(picks.size).toBe(questions.length)
    const expected = (runs * QUIZ_LENGTH) / questions.length
    for (const count of picks.values()) {
      expect(Math.abs(count - expected) / expected).toBeLessThan(0.1)
    }
  })

  it('gives independent draws for different random sources', () => {
    const a = createQuiz(questions, QUIZ_LENGTH, seededRandom(8)).map((q) => q.id)
    const b = createQuiz(questions, QUIZ_LENGTH, seededRandom(9)).map((q) => q.id)
    expect(a).not.toEqual(b)
  })

  it('works on the sample topic file', () => {
    const topic = rymden as TopicData
    const quiz = createQuiz(topic.questions)
    expect(quiz).toHaveLength(QUIZ_LENGTH)
  })
})
