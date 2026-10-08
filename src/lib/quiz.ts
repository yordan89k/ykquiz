import type { OptionIndex, Question, QuizQuestion } from '../types'
import { shuffle } from './shuffle'

export const QUIZ_LENGTH = 20

/**
 * Draws `count` unique questions uniformly at random and shuffles the
 * three answer options of each one.
 */
export function createQuiz(
  questions: readonly Question[],
  count: number = QUIZ_LENGTH,
  random: () => number = Math.random,
): QuizQuestion[] {
  if (questions.length < count) {
    throw new Error(`Not enough questions: need ${count}, got ${questions.length}`)
  }

  return shuffle(questions, random)
    .slice(0, count)
    .map((q) => {
      const options = shuffle([q.correct, ...q.wrong], random) as [string, string, string]
      return {
        id: q.id,
        question: q.question,
        options,
        correctIndex: options.indexOf(q.correct) as OptionIndex,
      }
    })
}
