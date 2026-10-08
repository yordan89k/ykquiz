import type { QuizQuestion, Score } from '../types'

export const EMPTY_SCORE: Score = { correct: 0, incorrect: 0 }

export function isCorrect(question: QuizQuestion, chosenIndex: number): boolean {
  return chosenIndex === question.correctIndex
}

/** Returns a new score with one more correct or incorrect answer. */
export function addAnswer(score: Score, wasCorrect: boolean): Score {
  return wasCorrect
    ? { ...score, correct: score.correct + 1 }
    : { ...score, incorrect: score.incorrect + 1 }
}
