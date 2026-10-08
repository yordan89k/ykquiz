import type { ReactNode, SVGProps } from 'react'
import type { TopicId } from '../types'

function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

type IconProps = SVGProps<SVGSVGElement>

export function CheckIcon(props: IconProps) {
  return (
    <Icon strokeWidth={2.4} {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Icon>
  )
}

export function CrossIcon(props: IconProps) {
  return (
    <Icon strokeWidth={2.4} {...props}>
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </Icon>
  )
}

const topicPaths: Record<TopicId, ReactNode> = {
  // Globe
  geografi: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </>
  ),
  // Flag
  lander: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4.5c3-1.5 5 1.5 8 0s4.5-1 6 0v9c-1.5-1-3-1.5-6 0s-5-1.5-8 0" />
    </>
  ),
  // Ringed planet
  rymden: (
    <>
      <circle cx="12" cy="12" r="5" />
      <ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(-20 12 12)" />
    </>
  ),
  // Crown
  sverige: (
    <>
      <path d="M4 8l4 4 4-6 4 6 4-4-1.5 10h-13z" />
      <path d="M6 20h12" />
    </>
  ),
  // Code brackets
  it: (
    <>
      <path d="M8.5 7L3.5 12l5 5" />
      <path d="M15.5 7l5 5-5 5" />
      <path d="M13.5 5l-3 14" />
    </>
  ),
  // Sparkle
  ai: (
    <>
      <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z" />
      <path d="M19 15.5c.25 1.6.9 2.25 2.5 2.5-1.6.25-2.25.9-2.5 2.5-.25-1.6-.9-2.25-2.5-2.5 1.6-.25 2.25-.9 2.5-2.5z" />
    </>
  ),
}

export function TopicIcon({ topic, ...props }: IconProps & { topic: TopicId }) {
  return <Icon {...props}>{topicPaths[topic]}</Icon>
}
