import { TOPICS } from '../data/topics'
import type { TopicId } from '../types'

interface Props {
  error?: string
  onSelect: (topic: TopicId) => void
}

export function StartScreen({ error, onSelect }: Props) {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">YK Quiz</h1>
        <p className="text-neutral-400">
          Välj ett ämne och svara på 20 frågor. Du får veta direkt om du svarade rätt.
        </p>
      </header>

      {error && (
        <p role="alert" className="rounded-lg border border-red-400/40 p-3 text-red-200">
          {error}
        </p>
      )}

      <ul className="grid grid-cols-2 gap-3">
        {TOPICS.map((topic) => (
          <li key={topic.id}>
            <button
              type="button"
              onClick={() => onSelect(topic.id)}
              className="min-h-16 w-full touch-manipulation select-none rounded-lg border border-neutral-700 p-4 text-lg font-medium hover:border-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-300"
            >
              {topic.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
