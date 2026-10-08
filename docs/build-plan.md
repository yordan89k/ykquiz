# YK Quiz — Build Plan

Each step is one (or a few) Claude Code sessions in the Code tab. Start each step in **Plan mode**, review the plan, then let Claude implement. Review the diff, test in the preview, and commit before moving on.

---

## Step 0 — Prerequisites (manual)

1. Install **Node.js LTS** and **Git** if they are not already installed.
2. Have a **GitHub** account and a **Vercel** account (sign in to Vercel with GitHub).
3. Create an empty folder, e.g. `yk-quiz`.
4. Copy `CLAUDE.md` into the folder root and `requirements.md` into `yk-quiz/docs/`.
5. Open the Code tab → Local → select the `yk-quiz` folder.

---

## Step 1 — Project scaffold

> Read CLAUDE.md and docs/requirements.md. Set up the project in this folder: Vite + React + TypeScript (strict), Tailwind CSS, Vitest, and the folder structure described in CLAUDE.md. Set `<html lang="sv">`, the page title "YK Quiz", a dark background and the npm scripts listed in CLAUDE.md (`validate` may be a placeholder for now). Add a .gitignore, initialise Git and make the first commit. Do not build any features yet. Verify that `npm run dev`, `npm run build` and `npm run test` work.

**Done when:** the dev server shows an empty dark page titled "YK Quiz", and build and test pass.

---

## Step 2 — GitHub and Vercel (early deployment)

1. Ask Claude: *"Help me create a GitHub repository for this project and push it."* (Or create the repository on github.com and follow the push instructions.)
2. On vercel.com: **Add New → Project → Import** the repository. Vercel detects Vite automatically. Deploy.
3. Open the Vercel URL on your phone.

**Done when:** every push to `main` deploys automatically. From now on, you can test each step on a real phone.

---

## Step 3 — Types, quiz logic and tests

> Implement the core logic from docs/requirements.md as pure functions in src/lib/, with types in src/types.ts: an unbiased Fisher–Yates shuffle, createQuiz(topicQuestions, count = 20) that returns 20 unique random questions each with its three options shuffled, and scoring helpers. Write thorough Vitest tests, including: no duplicates in a quiz, exactly 20 questions, the correct answer is always among the options, the input array is not mutated, and a statistical check that the correct answer lands roughly equally often in positions A, B and C. Also create src/data/topics.ts with the six topics and one sample topic file with 25 placeholder questions in Swedish so the app can be developed. No UI yet.

**Done when:** tests pass and you have read through the logic.

---

## Step 4 — Screens and flow (functional, minimal styling)

> Build the three screens and the state machine in App.tsx per docs/requirements.md: start page with intro and six topic buttons, quiz screen with progress, running correct/incorrect counts, A-B-C options, answer locking, feedback states and auto-advance (1200 ms correct / 2500 ms incorrect), a discreet "Avsluta" with a confirmation, and the result screen with "Nytt quiz" and "Till startsidan". Load topic data with dynamic import. Focus on correct behaviour; keep styling minimal for now. All UI text in Swedish.

**Done when:** a full quiz can be played start to finish, quit works, and timers behave correctly (test quitting during the feedback delay).

---

## Step 5 — Visual design

> Now design the app per section 3 of docs/requirements.md: dark only, elegant, modern, clean and stylish. Propose a colour palette, typography (self-hosted font that supports å/ä/ö) and the look of topic cards, answer options and feedback states before implementing. Feedback must be gentle (muted green/red borders or tints) with ✓/✗ icons. Add subtle transitions that respect prefers-reduced-motion. Mobile-first: test at 360 px and 390 px wide, respect safe areas, 48 px+ touch targets, no double-tap zoom. Check the result in the preview at phone width.

Iterate in a few rounds; screenshots from your phone are useful feedback.

**Done when:** you are happy with the look on your own phone.

---

## Step 6 — Question validation script

> Implement scripts/validate-questions.ts and wire it to `npm run validate`. For every topic file, check: valid structure per the data model, unique IDs with the correct topic prefix, exactly one correct and two wrong answers, all three options distinct (case- and whitespace-insensitive), no empty strings, no exact or near-duplicate questions (normalised text comparison), and a minimum of 200 questions per topic (allow a flag to skip the count check during development). Print a clear report and exit with a non-zero code on errors.

**Done when:** the script reports errors in a deliberately broken test file and passes on correct data.

---

## Step 7 — Question generation (one topic at a time)

Repeat for each topic. Generate in batches by subtopic, roughly 40–50 questions per batch.

> Generate questions for the topic "Rymden" following CLAUDE.md and section 6 of docs/requirements.md. This batch: 45 questions about planets and moons, medium difficulty, in Swedish. Wrong answers must be plausible and of the same kind as the correct answer. Avoid time-sensitive facts and only include facts you are certain of. Append them to src/data/rymden.json with continuing IDs and run npm run validate.

Then review the batch (see Step 8), give feedback, and continue with the next subtopic. For IT and AI, state explicitly: *"hard, professional level — questions an experienced IT/AI specialist should know."*

**Suggested order:** Rymden → Geografi → Länder → Sverige → IT → AI (start with an easy topic to calibrate quality and style).

---

## Step 8 — Content review

For each topic:
1. Ask Claude to **fact-check its own batch** in a fresh session: *"Review every question in src/data/rymden.json for factual accuracy, ambiguity (more than one defensible answer), time-sensitive content and Swedish language quality. List problems; do not edit yet."*
2. Read through the questions yourself (or play several quizzes on your phone).
3. Ask Claude to fix the listed problems.

**Done when:** every topic has 200–300 reviewed questions and validation passes without the skip flag.

---

## Step 9 — Final testing and release

> Do a final quality pass: run build, tests and validation; check the production build size; verify accessibility (aria-live announcements, keyboard use, focus states, contrast); check layout at 360, 390 and 430 px and on desktop. List any issues found before fixing them.

Then test on several phones (iOS Safari and Android Chrome), push to `main`, and share the Vercel URL with your friends.

---

## General habits

- **Commit after every successful step** (ask Claude: *"Commit this with a descriptive message"*).
- **One task per session** keeps context focused; CLAUDE.md gives every new session the background.
- **Review diffs** before accepting changes, especially in `src/lib/`.
- If something is going wrong, stop, describe the problem precisely, and ask Claude to investigate before changing code.
