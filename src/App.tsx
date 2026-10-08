import { useEffect, useReducer } from 'react'
import { QuizScreen } from './components/QuizScreen'
import { ResultScreen } from './components/ResultScreen'
import { StartScreen } from './components/StartScreen'
import { loadTopic } from './data/loadTopic'
import { appReducer, INITIAL_STATE } from './lib/appState'
import { createQuiz, QUIZ_LENGTH } from './lib/quiz'
import { FEEDBACK_DELAY_CORRECT_MS, FEEDBACK_DELAY_INCORRECT_MS } from './lib/timing'
import type { Question, TopicId } from './types'

export default function App() {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE)

  const startQuiz = (topic: TopicId, pool: Question[]) => {
    dispatch({ type: 'QUIZ_STARTED', topic, pool, questions: createQuiz(pool) })
  }

  const selectTopic = async (topic: TopicId) => {
    dispatch({ type: 'TOPIC_SELECTED', topic })
    try {
      const data = await loadTopic(topic)
      if (data.questions.length < QUIZ_LENGTH) {
        dispatch({
          type: 'LOAD_FAILED',
          error: 'Det finns inte tillräckligt med frågor i det här ämnet än.',
        })
        return
      }
      startQuiz(topic, data.questions)
    } catch {
      dispatch({ type: 'LOAD_FAILED', error: 'Kunde inte ladda frågorna. Försök igen.' })
    }
  }

  // Auto-advance after feedback. The cleanup cancels the timer on quit and unmount.
  const quiz = state.screen === 'quiz' ? state : null
  const answeredCorrectly =
    quiz && quiz.selected !== null ? quiz.selected === quiz.questions[quiz.index]!.correctIndex : null
  const quizIndex = quiz?.index

  useEffect(() => {
    if (answeredCorrectly === null) return
    const delay = answeredCorrectly ? FEEDBACK_DELAY_CORRECT_MS : FEEDBACK_DELAY_INCORRECT_MS
    const timer = setTimeout(() => dispatch({ type: 'ADVANCED' }), delay)
    return () => clearTimeout(timer)
  }, [answeredCorrectly, quizIndex])

  return (
    <main className="mx-auto w-full max-w-xl pt-[max(1.5rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(2rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] sm:pt-12">
      {state.screen === 'start' && <StartScreen error={state.error} onSelect={selectTopic} />}

      {state.screen === 'loading' && (
        <p className="pt-4 text-muted motion-safe:animate-enter">Laddar frågor…</p>
      )}

      {state.screen === 'quiz' && (
        <QuizScreen
          question={state.questions[state.index]!}
          index={state.index}
          total={state.questions.length}
          score={state.score}
          selected={state.selected}
          onAnswer={(index) => dispatch({ type: 'ANSWERED', index })}
          onQuit={() => dispatch({ type: 'QUIT' })}
        />
      )}

      {state.screen === 'result' && (
        <ResultScreen
          score={state.score}
          total={state.total}
          onRestart={() => startQuiz(state.topic, state.pool)}
          onHome={() => dispatch({ type: 'HOME' })}
        />
      )}
    </main>
  )
}
