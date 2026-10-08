export type OptionState = 'idle' | 'locked' | 'correct' | 'incorrect'

interface Props {
  label: string
  text: string
  state: OptionState
  onSelect: () => void
}

const stateClasses: Record<OptionState, string> = {
  idle: 'border-neutral-700 hover:border-neutral-500',
  locked: 'border-neutral-800 text-neutral-400',
  correct: 'border-green-400/70 bg-green-400/10',
  incorrect: 'border-red-400/70 bg-red-400/10',
}

export function AnswerOption({ label, text, state, onSelect }: Props) {
  const answered = state !== 'idle'

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-disabled={answered}
      className={`flex min-h-14 w-full touch-manipulation select-none items-center gap-3 rounded-lg border p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-300 ${stateClasses[state]} ${answered ? 'cursor-default' : ''}`}
    >
      <span className="w-6 shrink-0 font-semibold text-neutral-400">{label}</span>
      <span className="flex-1 break-words">{text}</span>
      {state === 'correct' && (
        <span className="shrink-0 text-green-300">
          <span aria-hidden="true">✓</span>
          <span className="sr-only">rätt</span>
        </span>
      )}
      {state === 'incorrect' && (
        <span className="shrink-0 text-red-300">
          <span aria-hidden="true">✗</span>
          <span className="sr-only">fel</span>
        </span>
      )}
    </button>
  )
}
