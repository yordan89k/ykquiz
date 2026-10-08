import type { Score } from '../types'

interface Props {
  score: Score
  total: number
  onRestart: () => void
  onHome: () => void
}

export function ResultScreen({ score, total, onRestart, onHome }: Props) {
  return (
    <section className="flex min-h-[70dvh] flex-col items-center justify-center gap-12 text-center motion-safe:animate-enter">
      <h1 className="flex flex-col items-center gap-2">
        <span className="text-8xl font-bold tracking-tight text-gold tabular-nums">
          {score.correct}
        </span>{' '}
        <span className="text-xl text-muted">av {total} rätt</span>
      </h1>
      <div className="flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="min-h-14 w-full touch-manipulation rounded-2xl bg-gold px-4 text-lg font-semibold text-bg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Nytt quiz
        </button>
        <button
          type="button"
          onClick={onHome}
          className="min-h-14 w-full touch-manipulation rounded-2xl border border-line bg-surface px-4 text-lg font-medium hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Till startsidan
        </button>
      </div>
    </section>
  )
}
