import { CheckIcon, CrossIcon } from './icons'

export type OptionState = 'idle' | 'locked' | 'correct' | 'incorrect'

interface Props {
  label: string
  text: string
  state: OptionState
  onSelect: () => void
}

const buttonClasses: Record<OptionState, string> = {
  idle: 'border-line bg-surface hover:border-muted/50 hover:bg-surface-hover active:bg-surface-hover',
  locked: 'border-line bg-surface opacity-50',
  correct: 'border-correct/60 bg-correct/10',
  incorrect: 'border-wrong/60 bg-wrong/10',
}

const badgeClasses: Record<OptionState, string> = {
  idle: 'border-line text-muted',
  locked: 'border-line text-muted',
  correct: 'border-correct/60 bg-correct/15 text-correct',
  incorrect: 'border-wrong/60 bg-wrong/15 text-wrong',
}

export function AnswerOption({ label, text, state, onSelect }: Props) {
  const answered = state !== 'idle'

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-disabled={answered}
      className={`flex min-h-14 w-full touch-manipulation select-none items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-[background-color,border-color,opacity] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${buttonClasses[state]} ${answered ? 'cursor-default' : ''}`}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors duration-150 ${badgeClasses[state]}`}
      >
        {state === 'correct' ? (
          <CheckIcon className="size-4" />
        ) : state === 'incorrect' ? (
          <CrossIcon className="size-4" />
        ) : (
          label
        )}
      </span>
      <span className="wrap-text flex-1 text-base leading-snug">{text}</span>
      {state === 'correct' && <span className="sr-only">(rätt)</span>}
      {state === 'incorrect' && <span className="sr-only">(fel)</span>}
    </button>
  )
}
