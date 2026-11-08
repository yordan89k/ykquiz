import type { Question, Topic } from '../../src/types'

export const MIN_QUESTIONS = 200
export const MAX_QUESTIONS = 300
export const NEAR_DUPLICATE_THRESHOLD = 0.85
/** Only check the middle-answer bias in topics with at least this many numeric questions. */
export const MIDDLE_BIAS_MIN_QUESTIONS = 6
/** Warn when more than this share of numeric questions has the correct answer in the middle. */
export const MIDDLE_BIAS_MAX_SHARE = 0.5

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

const NUMBER_WORDS: Record<string, number> = {
  en: 1, ett: 1, två: 2, tre: 3, fyra: 4, fem: 5, sex: 6, sju: 7, åtta: 8, nio: 9, tio: 10, elva: 11, tolv: 12,
}
const MONTHS = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
]
const MAGNITUDES: Record<string, number> = {
  tusen: 1e3, miljon: 1e6, miljoner: 1e6, miljard: 1e9, miljarder: 1e9,
}

/**
 * Reads the numeric value of an answer option, together with a "shape" that
 * describes the text around the number. Returns null when the option has no number.
 * Examples: "Cirka 1,5 miljarder km" -> { value: 1.5e9, shape: "# km" }, "6 juni" -> { value: 606, shape: "#" }.
 */
export function parseNumericAnswer(text: string): { value: number; shape: string } | null {
  let t = text.toLowerCase().replace(/−/g, '-').replace(/\b(cirka|ungefär|över|under)\b/g, ' ').trim()
  if (NUMBER_WORDS[t] != null) return { value: NUMBER_WORDS[t]!, shape: '#' }

  const date = t.match(/^(\d{1,2}) (\p{L}+)$/u)
  if (date && MONTHS.includes(date[2]!)) {
    return { value: (MONTHS.indexOf(date[2]!) + 1) * 100 + Number(date[1]), shape: '#' }
  }

  t = t.replace(/(\d) (?=\d{3}\b)/g, '$1') // "85 000" -> "85000"
  const match = t.match(/-?\d+(?:[.,]\d+)?/)
  if (!match) return null

  let value = Number(match[0].replace(',', '.'))
  let rest = t.slice(0, match.index) + '#' + t.slice(match.index! + match[0].length)
  for (const [word, factor] of Object.entries(MAGNITUDES)) {
    if (new RegExp(`\\b${word}\\b`).test(rest)) {
      value *= factor
      rest = rest.replace(new RegExp(`\\b${word}\\b`), '')
    }
  }
  return { value, shape: rest.replace(/\s+/g, ' ').trim() }
}

/** Where the correct answer sits among three numeric options, or null if the options are not comparable numbers. */
export function correctPosition(q: Question): 'low' | 'middle' | 'high' | null {
  const parsed = [q.correct, ...q.wrong].map(parseNumericAnswer)
  if (parsed.some((p) => p === null)) return null
  if (new Set(parsed.map((p) => p!.shape)).size !== 1) return null
  const values = parsed.map((p) => p!.value)
  if (new Set(values).size !== 3) return null
  const rank = [...values].sort((a, b) => a - b).indexOf(values[0]!)
  return (['low', 'middle', 'high'] as const)[rank]!
}

/** Warns when the correct answer is too often the middle value, which players can learn to exploit. */
function checkMiddleAnswerBias(questions: Question[], warn: (msg: string) => void) {
  const positions = questions.map(correctPosition).filter((p) => p !== null)
  const middle = positions.filter((p) => p === 'middle').length
  if (positions.length >= MIDDLE_BIAS_MIN_QUESTIONS && middle / positions.length > MIDDLE_BIAS_MAX_SHARE) {
    warn(
      `${middle} of ${positions.length} numeric questions have the correct answer as the middle value; ` +
        'move some wrong answers so the correct one is also the lowest or highest',
    )
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
  checkMiddleAnswerBias(valid, warn)

  const count = data.questions.length
  if (!options.skipCount) {
    if (count < MIN_QUESTIONS) error(`too few questions: ${count} (minimum ${MIN_QUESTIONS})`)
    if (count > MAX_QUESTIONS) error(`too many questions: ${count} (maximum ${MAX_QUESTIONS})`)
  }

  return { questionCount: count, issues }
}
