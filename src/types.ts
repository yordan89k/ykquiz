export type TopicId = 'geografi' | 'lander' | 'rymden' | 'sverige' | 'it' | 'ai'

/** A topic as listed on the start page. */
export interface Topic {
  id: TopicId
  name: string
}

/** One question as stored in a topic JSON file. */
export interface Question {
  id: string
  question: string
  correct: string
  wrong: [string, string]
}

/** The shape of a topic JSON file in src/data/. */
export interface TopicData extends Topic {
  questions: Question[]
}

export type OptionIndex = 0 | 1 | 2

/** A question prepared for a quiz: options shuffled, index 0/1/2 shown as A/B/C. */
export interface QuizQuestion {
  id: string
  question: string
  options: [string, string, string]
  correctIndex: OptionIndex
}

export interface Score {
  correct: number
  incorrect: number
}
