// Validates every topic file in src/data/. Usage:
//   npm run validate                  full check, including 200–300 questions per topic
//   npm run validate -- --skip-count  skip the question count check during development

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { TOPICS } from '../src/data/topics'
import { validateTopic, type TopicResult } from './lib/validation'

const dataDir = fileURLToPath(new URL('../src/data/', import.meta.url))
const skipCount = process.argv.includes('--skip-count')

function readTopicFile(id: string): TopicResult & { parsed?: unknown } {
  const file = `${id}.json`
  let text: string
  try {
    text = readFileSync(dataDir + file, 'utf8')
  } catch {
    return { questionCount: 0, issues: [{ level: 'error', message: `cannot read src/data/${file}` }] }
  }
  try {
    return { questionCount: 0, issues: [], parsed: JSON.parse(text) }
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e)
    return { questionCount: 0, issues: [{ level: 'error', message: `invalid JSON in ${file}: ${reason}` }] }
  }
}

console.log('YK Quiz – question validation' + (skipCount ? ' (count check skipped)' : '') + '\n')

let errors = 0
let warnings = 0

for (const topic of TOPICS) {
  const read = readTopicFile(topic.id)
  const result = 'parsed' in read ? validateTopic(read.parsed, topic, { skipCount }) : read

  const topicErrors = result.issues.filter((i) => i.level === 'error').length
  const topicWarnings = result.issues.length - topicErrors
  errors += topicErrors
  warnings += topicWarnings

  const symbol = topicErrors > 0 ? '✖' : topicWarnings > 0 ? '⚠' : '✔'
  console.log(`${symbol} ${topic.id.padEnd(9)} ${String(result.questionCount).padStart(3)} questions`)
  for (const issue of result.issues) {
    console.log(`    ${issue.level === 'error' ? 'error' : 'warn '}  ${issue.message}`)
  }
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
console.log(`\n${plural(errors, 'error')}, ${plural(warnings, 'warning')} in ${plural(TOPICS.length, 'topic')}`)

process.exitCode = errors > 0 ? 1 : 0
