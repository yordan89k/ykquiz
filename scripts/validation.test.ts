import { describe, expect, it } from 'vitest'
import type { Question, Topic } from '../src/types'
import broken from './fixtures/broken-topic.json'
import {
  correctPosition,
  normalizeOption,
  normalizeQuestion,
  parseNumericAnswer,
  similarity,
  validateTopic,
} from './lib/validation'

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

describe('numeric answers', () => {
  it('reads years, units, magnitudes, number words and dates', () => {
    expect(parseNumericAnswer('1995')).toEqual({ value: 1995, shape: '#' })
    expect(parseNumericAnswer('Cirka 85 000 byte')).toEqual({ value: 85000, shape: '# byte' })
    expect(parseNumericAnswer('Cirka 1,5 miljarder km')).toEqual({ value: 1.5e9, shape: '# km' })
    expect(parseNumericAnswer('Cirka 150 miljoner km')).toEqual({ value: 1.5e8, shape: '# km' })
    expect(parseNumericAnswer('Fyra')).toEqual({ value: 4, shape: '#' })
    expect(parseNumericAnswer('6 juni')).toEqual({ value: 606, shape: '#' })
    expect(parseNumericAnswer('−1')).toEqual({ value: -1, shape: '#' })
    expect(parseNumericAnswer('Jupiter')).toBeNull()
  })

  function numeric(n: number, correct: string, wrong: [string, string]): Question {
    return { id: `rymden-${String(n).padStart(3, '0')}`, question: `Vilket tal hör till fråga ${n}?`, correct, wrong }
  }

  it('finds where the correct answer sits among comparable numbers', () => {
    expect(correctPosition(numeric(1, '1995', ['1986', '2007']))).toBe('middle')
    expect(correctPosition(numeric(2, '1995', ['2006', '2017']))).toBe('low')
    expect(correctPosition(numeric(3, 'Cirka 4,6 miljarder år', ['Cirka 460 miljoner år', 'Cirka 1,2 miljarder år']))).toBe('high')
    expect(correctPosition(numeric(4, 'Sputnik 1', ['Vostok 1', 'Explorer 1']))).toBeNull()
  })

  it('warns when most numeric answers are the middle value', () => {
    const questions = Array.from({ length: 6 }, (_, i) => numeric(i + 1, String(1900 + i * 10), [String(1890 + i * 10), String(1910 + i * 10)]))
    expect(messages(topicWith(questions)).warnings).toEqual([
      '6 of 6 numeric questions have the correct answer as the middle value; move some wrong answers so the correct one is also the lowest or highest',
    ])
  })

  it('does not warn for a balanced mix or too few numeric questions', () => {
    const balanced = Array.from({ length: 6 }, (_, i) => {
      const y = 1900 + i * 10
      const wrong: [string, string][] = [[String(y - 5), String(y + 5)], [String(y + 3), String(y + 6)], [String(y - 6), String(y - 3)]]
      return numeric(i + 1, String(y), wrong[i % 3]!)
    })
    expect(messages(topicWith(balanced)).warnings).toEqual([])
    expect(messages(topicWith(balanced.slice(0, 5).map((q) => ({ ...q, wrong: [String(Number(q.correct) - 5), String(Number(q.correct) + 5)] as [string, string] })))).warnings).toEqual([])
  })
})
