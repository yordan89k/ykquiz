import type { Score } from '../types'

interface Props {
  score: Score
  total: number
  onRestart: () => void
  onHome: () => void
}

export function ResultScreen({ score, total, onRestart, onHome }: Props) {
  return (
    <section className="flex flex-col items-center gap-8 text-center">
      <h1 className="text-3xl font-bold">
        {score.correct} av {total} rätt
      </h1>
      <div className="flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="min-h-12 w-full touch-manipulation rounded-lg border border-neutral-500 p-3 font-medium"
        >
          Nytt quiz
        </button>
        <button
          type="button"
          onClick={onHome}
          className="min-h-12 w-full touch-manipulation rounded-lg border border-neutral-700 p-3"
        >
          Till startsidan
        </button>
      </div>
    </section>
  )
}
