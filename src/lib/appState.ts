import type { OptionIndex, Question, QuizQuestion, Score, TopicId } from '../types'
import { addAnswer, EMPTY_SCORE, isCorrect } from './scoring'

export type AppState =
  | { screen: 'start'; error?: string }
  | { screen: 'loading'; topic: TopicId }
  | {
      screen: 'quiz'
      topic: TopicId
      pool: Question[]
      questions: QuizQuestion[]
      index: number
      score: Score
      selected: OptionIndex | null
    }
  | { screen: 'result'; topic: TopicId; pool: Question[]; score: Score; total: number }

export type AppAction =
  | { type: 'TOPIC_SELECTED'; topic: TopicId }
  | { type: 'QUIZ_STARTED'; topic: TopicId; pool: Question[]; questions: QuizQuestion[] }
  | { type: 'LOAD_FAILED'; error: string }
  | { type: 'ANSWERED'; index: OptionIndex }
  | { type: 'ADVANCED' }
  | { type: 'QUIT' }
  | { type: 'HOME' }

export const INITIAL_STATE: AppState = { screen: 'start' }

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TOPIC_SELECTED':
      return { screen: 'loading', topic: action.topic }

    case 'QUIZ_STARTED': {
      // "Nytt quiz" starts from the result screen; a topic selection starts from loading.
      const expected =
        (state.screen === 'loading' || state.screen === 'result') && state.topic === action.topic
      if (!expected) return state
      return {
        screen: 'quiz',
        topic: action.topic,
        pool: action.pool,
        questions: action.questions,
        index: 0,
        score: EMPTY_SCORE,
        selected: null,
      }
    }

    case 'LOAD_FAILED':
      return state.screen === 'loading' ? { screen: 'start', error: action.error } : state

    case 'ANSWERED': {
      if (state.screen !== 'quiz' || state.selected !== null) return state
      const question = state.questions[state.index]!
      return {
        ...state,
        selected: action.index,
        score: addAnswer(state.score, isCorrect(question, action.index)),
      }
    }

    case 'ADVANCED': {
      if (state.screen !== 'quiz' || state.selected === null) return state
      const next = state.index + 1
      if (next >= state.questions.length) {
        return {
          screen: 'result',
          topic: state.topic,
          pool: state.pool,
          score: state.score,
          total: state.questions.length,
        }
      }
      return { ...state, index: next, selected: null }
    }

    case 'QUIT':
    case 'HOME':
      return { screen: 'start' }
  }
}
