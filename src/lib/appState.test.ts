import { describe, expect, it } from 'vitest'
import type { Question, QuizQuestion } from '../types'
import { appReducer, INITIAL_STATE, type AppAction, type AppState } from './appState'
import { createQuiz } from './quiz'
import { seededRandom } from './testing/seededRandom'

const pool: Question[] = Array.from({ length: 30 }, (_, i) => ({
  id: `test-${String(i + 1).padStart(3, '0')}`,
  question: `Fråga ${i + 1}?`,
  correct: `Rätt ${i + 1}`,
  wrong: [`Fel ${i + 1}a`, `Fel ${i + 1}b`],
}))

const questions: QuizQuestion[] = createQuiz(pool, 20, seededRandom(1))

function run(actions: AppAction[], state: AppState = INITIAL_STATE): AppState {
  return actions.reduce(appReducer, state)
}

function startedQuiz(): AppState {
  return run([
    { type: 'TOPIC_SELECTED', topic: 'rymden' },
    { type: 'QUIZ_STARTED', topic: 'rymden', pool, questions },
  ])
}

function wrongIndex(q: QuizQuestion) {
  return ((q.correctIndex + 1) % 3) as 0 | 1 | 2
}

describe('appReducer', () => {
  it('starts on the start screen', () => {
    expect(INITIAL_STATE).toEqual({ screen: 'start' })
  })

  it('goes from topic selection via loading to the first question', () => {
    const loading = run([{ type: 'TOPIC_SELECTED', topic: 'rymden' }])
    expect(loading).toEqual({ screen: 'loading', topic: 'rymden' })

    const quiz = startedQuiz()
    expect(quiz).toMatchObject({
      screen: 'quiz',
      index: 0,
      selected: null,
      score: { correct: 0, incorrect: 0 },
    })
  })

  it('plays a full quiz to the result screen and counts answers', () => {
    let state = startedQuiz()
    for (let i = 0; i < 20; i++) {
      const q = questions[i]!
      const answer = i < 15 ? q.correctIndex : wrongIndex(q)
      state = run([{ type: 'ANSWERED', index: answer }, { type: 'ADVANCED' }], state)
    }

    expect(state).toEqual({
      screen: 'result',
      topic: 'rymden',
      pool,
      score: { correct: 15, incorrect: 5 },
      total: 20,
    })
  })

  it('locks the answer: a second answer to the same question is ignored', () => {
    const q = questions[0]!
    const state = run(
      [
        { type: 'ANSWERED', index: q.correctIndex },
        { type: 'ANSWERED', index: wrongIndex(q) },
      ],
      startedQuiz(),
    )
    expect(state).toMatchObject({ selected: q.correctIndex, score: { correct: 1, incorrect: 0 } })
  })

  it('does not advance without an answer', () => {
    const before = startedQuiz()
    expect(appReducer(before, { type: 'ADVANCED' })).toBe(before)
  })

  it('ignores a late timer after quitting', () => {
    const state = run(
      [{ type: 'ANSWERED', index: questions[0]!.correctIndex }, { type: 'QUIT' }, { type: 'ADVANCED' }],
      startedQuiz(),
    )
    expect(state).toEqual({ screen: 'start' })
  })

  it('ignores a finished load after the user has gone back to the start page', () => {
    const state = run([
      { type: 'TOPIC_SELECTED', topic: 'rymden' },
      { type: 'QUIT' },
      { type: 'QUIZ_STARTED', topic: 'rymden', pool, questions },
    ])
    expect(state).toEqual({ screen: 'start' })
  })

  it('ignores a finished load for a topic that is no longer selected', () => {
    const state = run([
      { type: 'TOPIC_SELECTED', topic: 'rymden' },
      { type: 'TOPIC_SELECTED', topic: 'it' },
      { type: 'QUIZ_STARTED', topic: 'rymden', pool, questions },
    ])
    expect(state).toEqual({ screen: 'loading', topic: 'it' })
  })

  it('starts a new quiz on the same topic from the result screen', () => {
    const result: AppState = { screen: 'result', topic: 'rymden', pool, score: { correct: 3, incorrect: 17 }, total: 20 }
    const state = appReducer(result, { type: 'QUIZ_STARTED', topic: 'rymden', pool, questions })
    expect(state).toMatchObject({ screen: 'quiz', index: 0, score: { correct: 0, incorrect: 0 } })
  })

  it('returns to the start page with an error when loading fails', () => {
    const state = run([
      { type: 'TOPIC_SELECTED', topic: 'it' },
      { type: 'LOAD_FAILED', error: 'Kunde inte ladda frågorna. Försök igen.' },
    ])
    expect(state).toEqual({ screen: 'start', error: 'Kunde inte ladda frågorna. Försök igen.' })
  })

  it('goes home from the result screen', () => {
    const result: AppState = { screen: 'result', topic: 'rymden', pool, score: { correct: 3, incorrect: 17 }, total: 20 }
    expect(appReducer(result, { type: 'HOME' })).toEqual({ screen: 'start' })
  })
})
