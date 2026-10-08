import type { Question, Topic } from '../../src/types'

export const MIN_QUESTIONS = 200
export const MAX_QUESTIONS = 300
export const NEAR_DUPLICATE_THRESHOLD = 0.85

export interface Issue {
  level: 'error' | 'warning'
  message: string
}

export interface ValidateOptions {
  skipCount?: boolean
}

export interface TopicResult {
  questionCount: number
  issues: Issue[]
}

const QUESTION_KEYS = ['id', 'question', 'correct', 'wrong'] as const

/** Normalises an answer option for comparison: trimmed, single spaces, lower case. */
export function normalizeOption(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('sv')
}

/** Normalises a question for duplicate detection: also strips punctuation and symbols. */
export function normalizeQuestion(text: string): string {
  return normalizeOption(text.replace(/[\p{P}\p{S}]/gu, ' '))
}

/** Sørensen–Dice coefficient on character bigrams (1 = identical, 0 = nothing in common). */
export function similarity(a: string, b: string): number {
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return 0

  const bigrams = new Map<string, number>()
  for (let i = 0; i < a.length - 1; i++) {
    const bigram = a.slice(i, i + 2)
    bigrams.set(bigram, (bigrams.get(bigram) ?? 0) + 1)
  }

  let shared = 0
  for (let i = 0; i < b.length - 1; i++) {
    const bigram = b.slice(i, i + 2)
    const count = bigrams.get(bigram) ?? 0
    if (count > 0) {
      bigrams.set(bigram, count - 1)
      shared++
    }
  }
  return (2 * shared) / (a.length - 1 + (b.length - 1))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Checks one question's shape. Returns the typed question, or null if it is malformed. */
function checkStructure(raw: unknown, index: number, error: (msg: string) => void): Question | null {
  const where = isRecord(raw) && typeof raw.id === 'string' && raw.id ? raw.id : `question #${index + 1}`
  if (!isRecord(raw)) {
    error(`${where}: must be an object`)
    return null
  }

  let valid = true
  for (const key of Object.keys(raw)) {
    if (!(QUESTION_KEYS as readonly string[]).includes(key)) {
      error(`${where}: unknown key "${key}"`)
      valid = false
    }
  }
  for (const key of ['id', 'question', 'correct'] as const) {
    if (typeof raw[key] !== 'string') {
      error(`${where}: "${key}" must be a string`)
      valid = false
    }
  }
  if (!Array.isArray(raw.wrong) || raw.wrong.length !== 2 || raw.wrong.some((w) => typeof w !== 'string')) {
    error(`${where}: "wrong" must be an array of exactly 2 strings`)
    valid = false
  }

  return valid ? (raw as unknown as Question) : null
}

function checkText(q: Question, error: (msg: string) => void) {
  const fields: [string, string][] = [
    ['question', q.question],
    ['correct', q.correct],
    ['wrong[0]', q.wrong[0]],
    ['wrong[1]', q.wrong[1]],
  ]
  for (const [name, text] of fields) {
    if (text.trim() === '') error(`${q.id}: "${name}" is empty`)
    else if (text !== text.trim()) error(`${q.id}: "${name}" has leading or trailing spaces`)
  }
}

function checkOptions(q: Question, error: (msg: string) => void, warn: (msg: string) => void) {
  const options = [q.correct, ...q.wrong]
  const normalized = options.map(normalizeOption)
  if (new Set(normalized).size !== normalized.length) {
    error(`${q.id}: answer options are not distinct`)
  }
  if (normalized.some((o) => o.includes('ovanstående'))) {
    error(`${q.id}: "ovanstående" options are not allowed`)
  }

  const c = q.correct.trim().length
  const lengths = q.wrong.map((w) => w.trim().length)
  const muchLonger = lengths.every((w) => c > 2 * w && c - w >= 12)
  const muchShorter = lengths.every((w) => w > 2 * c && w - c >= 12)
  if (muchLonger || muchShorter) {
    warn(`${q.id}: correct answer stands out by length ("${q.correct}")`)
  }
}

function checkDuplicates(questions: Question[], error: (msg: string) => void, warn: (msg: string) => void) {
  const normalized = questions.map((q) => normalizeQuestion(q.question))
  const answers = questions.map((q) => normalizeOption(q.correct))

  for (let i = 0; i < questions.length; i++) {
    for (let j = i + 1; j < questions.length; j++) {
      const pair = `${questions[i]!.id} / ${questions[j]!.id}`
      if (normalized[i] === normalized[j]) {
        error(`${pair}: duplicate question`)
      } else if (
        answers[i] === answers[j] &&
        similarity(normalized[i]!, normalized[j]!) >= NEAR_DUPLICATE_THRESHOLD
      ) {
        warn(`${pair}: possible near-duplicate (same answer "${questions[i]!.correct}")`)
      }
    }
  }
}

/** Validates one parsed topic file against the expected topic from TOPICS. */
export function validateTopic(data: unknown, expected: Topic, options: ValidateOptions = {}): TopicResult {
  const issues: Issue[] = []
  const error = (message: string) => issues.push({ level: 'error', message })
  const warn = (message: string) => issues.push({ level: 'warning', message })

  if (!isRecord(data)) {
    error('file must contain a JSON object')
    return { questionCount: 0, issues }
  }
  if (data.id !== expected.id) error(`"id" must be "${expected.id}", found ${JSON.stringify(data.id)}`)
  if (data.name !== expected.name) error(`"name" must be "${expected.name}", found ${JSON.stringify(data.name)}`)
  if (!Array.isArray(data.questions)) {
    error('"questions" must be an array')
    return { questionCount: 0, issues }
  }

  const idPattern = new RegExp(`^${expected.id}-\\d{3}$`)
  const seenIds = new Set<string>()
  const valid: Question[] = []

  data.questions.forEach((raw, index) => {
    const q = checkStructure(raw, index, error)
    if (!q) return

    if (!idPattern.test(q.id)) error(`${q.id}: id must look like "${expected.id}-001"`)
    if (seenIds.has(q.id)) error(`${q.id}: duplicate id`)
    seenIds.add(q.id)

    checkText(q, error)
    checkOptions(q, error, warn)
    valid.push(q)
  })

  checkDuplicates(valid, error, warn)

  const count = data.questions.length
  if (!options.skipCount) {
    if (count < MIN_QUESTIONS) error(`too few questions: ${count} (minimum ${MIN_QUESTIONS})`)
    if (count > MAX_QUESTIONS) error(`too many questions: ${count} (maximum ${MAX_QUESTIONS})`)
  }

  return { questionCount: count, issues }
}
