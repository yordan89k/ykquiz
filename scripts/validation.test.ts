import { describe, expect, it } from 'vitest'
import type { Question, Topic } from '../src/types'
import broken from './fixtures/broken-topic.json'
import { normalizeOption, normalizeQuestion, similarity, validateTopic } from './lib/validation'

const rymden: Topic = { id: 'rymden', name: 'Rymden' }

function topicWith(questions: Question[]) {
  return { id: 'rymden', name: 'Rymden', questions }
}

function makeQuestions(n: number): Question[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `rymden-${String(i + 1).padStart(3, '0')}`,
    question: `Testfråga nummer ${i + 1} om ett unikt ämne ${'x'.repeat(i % 7)}?`,
    correct: `Svar ${i + 1}`,
    wrong: [`Alternativ ${i + 1}a`, `Alternativ ${i + 1}b`],
  }))
}

function messages(data: unknown, skipCount = true) {
  const { issues } = validateTopic(data, rymden, { skipCount })
  return {
    errors: issues.filter((i) => i.level === 'error').map((i) => i.message),
    warnings: issues.filter((i) => i.level === 'warning').map((i) => i.message),
  }
}

describe('validateTopic on a correct topic', () => {
  it('reports nothing for valid data with 200 questions', () => {
    const { issues, questionCount } = validateTopic(topicWith(makeQuestions(200)), rymden)
    expect(issues).toEqual([])
    expect(questionCount).toBe(200)
  })
})

describe('validateTopic on the broken fixture', () => {
  const { errors } = messages(broken, false)
  const expected = [
    '"id" must be "rymden"',
    '"name" must be "Rymden"',
    'rymden-001: duplicate id',
    'space-003: id must look like "rymden-001"',
    'rymden-004: unknown key "wrongs"',
    'rymden-004: "wrong" must be an array of exactly 2 strings',
    'rymden-005: "wrong" must be an array of exactly 2 strings',
    'rymden-006: "question" is empty',
    'rymden-007: "correct" has leading or trailing spaces',
    'rymden-008: answer options are not distinct',
    'rymden-009: "ovanstående" options are not allowed',
    'rymden-001 / rymden-010: duplicate question',
    'question #11: must be an object',
    'too few questions: 11 (minimum 200)',
  ]

  it.each(expected)('reports: %s', (message) => {
    expect(errors.some((e) => e.includes(message))).toBe(true)
  })

  it('reports nothing beyond the expected errors', () => {
    expect(errors).toHaveLength(expected.length)
  })
})

describe('file-level structure', () => {
  it('rejects non-objects and a missing questions array', () => {
    expect(messages([]).errors).toEqual(['file must contain a JSON object'])
    expect(messages({ id: 'rymden', name: 'Rymden' }).errors).toEqual(['"questions" must be an array'])
  })
})

describe('question count', () => {
  it('flags too many questions', () => {
    expect(messages(topicWith(makeQuestions(301)), false).errors).toEqual([
      'too many questions: 301 (maximum 300)',
    ])
  })

  it('skips only the count check with skipCount', () => {
    expect(messages(topicWith(makeQuestions(5)), true).errors).toEqual([])
    expect(messages(topicWith(makeQuestions(5)), false).errors).toEqual([
      'too few questions: 5 (minimum 200)',
    ])
  })
})

describe('near-duplicate warning', () => {
  const base: Question = {
    id: 'rymden-001',
    question: 'Vilken är Saturnus största måne?',
    correct: 'Titan',
    wrong: ['Rhea', 'Mimas'],
  }

  it('warns on similar wording with the same answer', () => {
    const similar = { ...base, id: 'rymden-002', question: 'Vilken är Saturnus allra största måne?' }
    expect(messages(topicWith([base, similar])).warnings).toEqual([
      'rymden-001 / rymden-002: possible near-duplicate (same answer "Titan")',
    ])
  })

  it('does not warn when similar questions have different answers', () => {
    const jupiter: Question = {
      id: 'rymden-002',
      question: 'Vilken är Jupiters största måne?',
      correct: 'Ganymedes',
      wrong: ['Io', 'Europa'],
    }
    expect(messages(topicWith([base, jupiter])).warnings).toEqual([])
  })
})

describe('answer length warning', () => {
  it('warns when the correct answer is much longer than both wrong answers', () => {
    const q: Question = {
      id: 'rymden-001',
      question: 'Vad är en exoplanet?',
      correct: 'En planet som kretsar kring en annan stjärna',
      wrong: ['En måne', 'En komet'],
    }
    expect(messages(topicWith([q])).warnings).toHaveLength(1)
  })

  it('does not warn for answers of similar length', () => {
    expect(messages(topicWith(makeQuestions(3))).warnings).toEqual([])
  })
})

describe('normalisation helpers', () => {
  it('compares options ignoring case and spacing', () => {
    expect(normalizeOption('  Stora   Röda Fläcken ')).toBe(normalizeOption('stora röda fläcken'))
  })

  it('ignores punctuation in questions', () => {
    expect(normalizeQuestion('Vad heter ”den röda planeten”?')).toBe(normalizeQuestion('vad heter den röda planeten'))
  })

  it('computes similarity between 0 and 1', () => {
    expect(similarity('abc', 'abc')).toBe(1)
    expect(similarity('abcd', 'wxyz')).toBe(0)
  })
})
