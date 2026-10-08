import type { TopicData, TopicId } from '../types'

// One dynamic import per topic so each question file becomes its own chunk.
const loaders: Record<TopicId, () => Promise<{ default: unknown }>> = {
  geografi: () => import('./geografi.json'),
  lander: () => import('./lander.json'),
  rymden: () => import('./rymden.json'),
  sverige: () => import('./sverige.json'),
  it: () => import('./it.json'),
  ai: () => import('./ai.json'),
}

export async function loadTopic(id: TopicId): Promise<TopicData> {
  const module = await loaders[id]()
  return module.default as TopicData
}
