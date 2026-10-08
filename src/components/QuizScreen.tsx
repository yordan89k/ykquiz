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
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium tabular-nums">
            Fråga {index + 1} / {total}
          </span>
          <button
            type="button"
            onClick={() => setConfirmingQuit(true)}
            className="-my-3 -mr-3 min-h-12 touch-manipulation rounded-md px-3 text-muted underline-offset-4 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-gold"
          >
            Avsluta
          </button>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <div
            className="h-full rounded-full bg-gold motion-safe:transition-[width] motion-safe:duration-300"
            style={{ width: `${((index + (selected === null ? 0 : 1)) / total) * 100}%` }}
          />
        </div>
        <p className="text-sm text-muted tabular-nums">
          Rätt {score.correct} · Fel {score.incorrect}
        </p>
      </header>

      <div key={question.id} className="flex flex-col gap-6 motion-safe:animate-enter">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="wrap-text text-2xl leading-snug font-semibold tracking-tight outline-none"
        >
          {question.question}
        </h2>

        <div className="flex flex-col gap-4">
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
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

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
