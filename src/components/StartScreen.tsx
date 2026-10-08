import { TOPICS } from '../data/topics'
import type { TopicId } from '../types'
import { TopicIcon } from './icons'

interface Props {
  error?: string
  onSelect: (topic: TopicId) => void
}

export function StartScreen({ error, onSelect }: Props) {
  return (
    <section className="flex flex-col gap-8 motion-safe:animate-enter">
      <header className="flex flex-col gap-3 pt-4">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-gold">YK</span> Quiz
        </h1>
        <p className="text-base leading-relaxed text-muted">
          Välj ett ämne och svara på 20 frågor. Du får veta direkt om du svarade rätt.
        </p>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-wrong/40 bg-wrong/10 px-4 py-3 text-sm text-ink"
        >
          {error}
        </p>
      )}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {TOPICS.map((topic) => (
          <li key={topic.id}>
            <button
              type="button"
              onClick={() => onSelect(topic.id)}
              className="group flex min-h-[5.5rem] w-full touch-manipulation select-none flex-col items-start justify-between gap-3 rounded-2xl border border-line bg-surface p-4 text-left transition-colors duration-150 hover:border-gold/50 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:bg-surface-hover"
            >
              <TopicIcon
                topic={topic.id}
                className="size-6 text-muted transition-colors duration-150 group-hover:text-gold"
              />
              <span className="text-lg font-semibold">{topic.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
