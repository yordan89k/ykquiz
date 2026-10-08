# YK Quiz

A small, mobile-first quiz web app for a group of friends. The user picks one of six topics and answers 20 random A-B-C questions, with instant feedback, and sees the score at the end. Non-commercial, hosted on Vercel.

The full specification is in `docs/requirements.md`. Read it before starting any feature and follow it exactly. If a request conflicts with it, point out the conflict before proceeding.

## Non-negotiable rules

- **All user-facing text is in Swedish.** Code, comments, commit messages and documentation are in English.
- **Static app only.** No back end, no API calls, no analytics, no external requests at runtime.
- **No persistence.** No localStorage, sessionStorage, cookies or IndexedDB.
- **Dark theme only.** No light mode, no theme switch.
- **Mobile-first.** Design for ~360–430 px wide phones first, then scale up.
- **No PWA features.** No manifest, no service worker, no install prompt.

## Tech stack

- React + TypeScript (strict mode), built with Vite
- Tailwind CSS for styling
- Vitest for unit tests
- Fonts self-hosted via npm packages (no Google Fonts requests at runtime)
- Deployed on Vercel from the GitHub repository (`main` → production)

Use current stable versions. Do not add dependencies without a clear reason; prefer small, well-maintained packages.

## Commands

- `npm run dev` — start dev server
- `npm run build` — type-check and production build
- `npm run test` — run unit tests
- `npm run validate` — validate all question files
- `npm run validate -- --skip-count` — same, but skip the 200–300 count check (while topics are still being filled)

## Project structure

```
src/
  components/     UI components (StartScreen, QuizScreen, ResultScreen, AnswerOption, ...)
  lib/            Pure logic: shuffle, quiz creation, scoring (no React here)
  data/           One JSON file per topic + topics.ts (topic list and metadata)
  types.ts        Shared types (Topic, Question, QuizQuestion, ...)
  App.tsx         Screen state machine: start → quiz → result
scripts/
  validate-questions.ts
docs/
  requirements.md
```

## Architecture decisions

- **No router.** The app is one page with three screens controlled by state in `App.tsx` (a `useReducer` state machine). There are no URLs per screen.
- **Logic is separate from UI.** All randomisation and scoring live in `src/lib/` as pure, unit-tested functions.
- **Randomisation** uses an unbiased Fisher–Yates shuffle. A quiz = shuffle the topic's questions, take the first 20, then shuffle each question's three options.
- **Topic data is loaded on demand** with dynamic `import()` so the initial bundle stays small.
- **Feedback timing:** auto-advance 1200 ms after a correct answer, 2500 ms after an incorrect one. Keep these as named constants in one place. Clear timers on unmount and when quitting.

## Question data rules

Each topic file follows this shape:

```json
{ "id": "rymden", "name": "Rymden", "questions": [
  { "id": "rymden-001", "question": "...", "correct": "...", "wrong": ["...", "..."] }
] }
```

When generating or editing questions:
- Exactly one correct answer, exactly two plausible wrong answers of similar length and style.
- No duplicates or near-duplicates within a topic.
- No time-sensitive facts (current leaders, "latest" products, precise populations).
- Medium difficulty for Geografi, Länder, Rymden, Sverige. Hard (professional level) for IT and AI.
- Correct, natural Swedish. Only state facts you are certain of; if unsure, leave the question out.
- Always run `npm run validate` after changing question files.

## Working style

- Work in small, reviewable steps. Propose a plan before larger changes.
- Before reporting a task as done: `npm run build`, `npm run test` and (if data changed) `npm run validate` must pass.
- Check UI changes in the preview at a phone width (≈ 390 px) as well as desktop.
- Keep components small and readable. No over-engineering — this is a small app.
