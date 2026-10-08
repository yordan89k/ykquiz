import { useEffect, useRef, useState } from 'react'
import type { OptionIndex, QuizQuestion, Score } from '../types'
import { AnswerOption, type OptionState } from './AnswerOption'
import { QuitDialog } from './QuitDialog'

const LABELS = ['A', 'B', 'C'] as const

interface Props {
  question: QuizQuestion
  index: number
  total: number
  score: Score
  selected: OptionIndex | null
  onAnswer: (index: OptionIndex) => void
  onQuit: () => void
}

function optionState(question: QuizQuestion, selected: OptionIndex | null, i: number): OptionState {
  if (selected === null) return 'idle'
  if (i === question.correctIndex) return 'correct'
  if (i === selected) return 'incorrect'
  return 'locked'
}

export function QuizScreen({ question, index, total, score, selected, onAnswer, onQuit }: Props) {
  const [confirmingQuit, setConfirmingQuit] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Move focus to each new question so keyboard and screen reader users start at the top.
  useEffect(() => {
    headingRef.current?.focus()
  }, [question.id])

  const announcement =
    selected === null
      ? ''
      : selected === question.correctIndex
        ? 'Rätt svar!'
        : `Fel svar. Rätt svar är: ${question.options[question.correctIndex]}`

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between text-sm text-neutral-400">
        <span>
          Fråga {index + 1} / {total}
        </span>
        <span>
          Rätt: {score.correct} · Fel: {score.incorrect}
        </span>
      </header>

      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-none">
        {question.question}
      </h2>

      <div className="flex flex-col gap-3">
        {question.options.map((text, i) => (
          <AnswerOption
            key={i}
            label={LABELS[i]!}
            text={text}
            state={optionState(question, selected, i)}
            onSelect={() => onAnswer(i as OptionIndex)}
          />
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <button
        type="button"
        onClick={() => setConfirmingQuit(true)}
        className="self-center p-2 text-sm text-neutral-500 underline-offset-4 hover:underline"
      >
        Avsluta
      </button>

      <QuitDialog
        open={confirmingQuit}
        onConfirm={() => {
          setConfirmingQuit(false)
          onQuit()
        }}
        onCancel={() => setConfirmingQuit(false)}
      />
    </section>
  )
}
