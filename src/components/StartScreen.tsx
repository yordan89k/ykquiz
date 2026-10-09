import { useEffect, useRef } from 'react'
import { TOPICS } from '../data/topics'
import type { TopicId } from '../types'
import { TopicIcon } from './icons'

interface Props {
  error?: string
  onSelect: (topic: TopicId) => void
}

export function StartScreen({ error, onSelect }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Move focus to the heading when returning here, so focus is not lost on the page body.
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section className="flex flex-col gap-8 motion-safe:animate-enter">
      <header className="flex flex-col gap-3 pt-4">
        <h1 ref={headingRef} tabIndex={-1} className="text-4xl font-bold tracking-tight outline-none">
          <span className="bg-linear-to-br from-[#f4d47c] via-gold to-[#e8933f] bg-clip-text text-transparent">
            YK
          </span>{' '}
          Quiz
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
              className="group flex min-h-[4.5rem] w-full touch-manipulation select-none items-center justify-center gap-3 rounded-2xl border border-line bg-surface px-3 py-4 transition-colors duration-150 hover:border-gold/50 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:bg-surface-hover"
            >
              <TopicIcon
                topic={topic.id}
                className="size-6 shrink-0 text-muted transition-colors duration-150 group-hover:text-gold"
              />
              <span className="text-lg font-semibold">{topic.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
