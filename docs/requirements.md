# YK Quiz — Requirements Specification

Version 1.0 — approved scope for the first release.

## 1. General

| ID  | Requirement |
|-----|-------------|
| G-1 | The app is a static web app hosted on Vercel, with no back end, database or external API calls. |
| G-2 | The app name is **YK Quiz**. It is shown on the start page and in the browser tab title. |
| G-3 | All user-facing text is in **Swedish** (`<html lang="sv">`), including labels, headings and the page title. |
| G-4 | No accounts, logins or persistent storage (no localStorage, sessionStorage, cookies). A page reload starts from the beginning. |
| G-5 | The app is designed **mobile-first**; desktop must work well but is secondary. |
| G-6 | The app is used only through the browser. No web app manifest, no install prompt, no service worker. |

## 2. Screens and flow

```
Startsida  →  Quiz (20 frågor)  →  Resultat
   ↑              │ (avbryt, diskret)    │
   └──────────────┴──────────────────────┘
                     ↺ Nytt quiz (samma ämne)
```

### Start page

| ID  | Requirement |
|-----|-------------|
| S-1 | Shows the app name "YK Quiz" and a short introduction (one or two sentences) explaining that the user picks a topic and answers 20 questions. |
| S-2 | Shows six topics as selectable cards/buttons: **Geografi, Länder, Rymden, Sverige, IT, AI**. |
| S-3 | Selecting a topic starts a quiz immediately. Difficulty is never shown or selectable. |

### Quiz screen

| ID  | Requirement |
|-----|-------------|
| Q-1 | Each quiz consists of 20 questions drawn **uniformly at random** from the chosen topic, with no duplicates within a quiz and no ordering pattern. |
| Q-2 | The three answer options are shown in **random order** for every question, labelled A, B, C. |
| Q-3 | Progress is shown (e.g. "Fråga 7 / 20") together with the running count of correct and incorrect answers. |
| Q-4 | After an answer is selected, all options are locked against further taps. |
| Q-5 | **Correct answer:** the chosen option gets a gentle green highlight and a check icon. |
| Q-6 | **Incorrect answer:** the chosen option gets a red highlight and a cross icon; the correct option gets a green highlight and a check icon. |
| Q-7 | After feedback the app advances automatically: **1.2 s** after a correct answer, **2.5 s** after an incorrect answer. There is no "Next" button. |
| Q-8 | No timer, countdown or time pressure of any kind. |
| Q-9 | A discreet way to quit (small "Avsluta" text link or icon — never a prominent button) returns to the start page after a confirmation prompt. |
| Q-10 | Questions are not tracked across quizzes; each new quiz is an independent random draw. |

### Result screen

| ID  | Requirement |
|-----|-------------|
| R-1 | Shows the score only, e.g. "18 av 20 rätt". No evaluative comments, no review list. |
| R-2 | Offers "Nytt quiz" (same topic, new random draw) and "Till startsidan". |

## 3. Design

| ID  | Requirement |
|-----|-------------|
| D-1 | **Dark theme only.** No theme switch, no light mode. |
| D-2 | Elegant, modern, clean and stylish. One consistent style for all topics (no per-topic colours). |
| D-3 | Feedback colours are gentle: muted green/red borders or tints, not harsh full-colour fills. |
| D-4 | Feedback never relies on colour alone: ✓ / ✗ icons accompany the colours. |
| D-5 | Smooth, subtle transitions between questions and screens; respect `prefers-reduced-motion`. |

## 4. Non-functional requirements

| ID  | Requirement |
|-----|-------------|
| N-1 | Touch targets at least 48 px high; answer buttons span the full content width on phones. |
| N-2 | Works from 360 px wide screens upwards, respects safe areas (notch, home indicator), no horizontal scrolling. |
| N-3 | Long question and answer texts wrap cleanly; å, ä, ö render correctly in the chosen font. |
| N-4 | Fast initial load on mobile networks; topic question files are loaded on demand. |
| N-5 | Each answer result is announced to screen readers (`aria-live`); fully usable with keyboard on desktop. |
| N-6 | No double-tap zoom or accidental text selection on answer buttons. |

## 5. Data model

One JSON file per topic in `src/data/`:

```json
{
  "id": "rymden",
  "name": "Rymden",
  "questions": [
    {
      "id": "rymden-001",
      "question": "Vilken planet är störst i vårt solsystem?",
      "correct": "Jupiter",
      "wrong": ["Saturnus", "Neptunus"]
    }
  ]
}
```

- `id`: `<topic>-<three-digit number>`, unique within the file.
- `correct`: exactly one string.
- `wrong`: exactly two strings, distinct from each other and from `correct`.

## 6. Question content

| ID  | Requirement |
|-----|-------------|
| C-1 | 200–300 questions per topic (target: 250). |
| C-2 | Difficulty can be set per topic and, where useful, per subtopic. **Sverige**: medium. **Rymden**: medium, slightly harder for astrophysics and space exploration. **Geografi**: about half medium, half hard; questions focus on facts (where, which, what it is called), not on explaining processes. **Länder**: a mix of medium and hard; questions about Africa slightly easier, about Europe slightly harder. **Hard** for IT and AI — the level that people who studied and work as IT/AI specialists should know. |
| C-2a | Mix plain fact questions ("Vilken är Schweiz huvudstad?") with questions built on interesting facts: what makes something unique, or events that happened there in a given year ("Vilken är den enda huvudstaden i världen som gränsar till två andra länder?"). |
| C-3 | Exactly one correct answer and two **plausible** wrong answers of similar length, style and category, so the answer cannot be guessed from its form. No "Alla ovanstående" / "Inget av ovanstående". |
| C-4 | No duplicate or near-duplicate questions within a topic. |
| C-5 | No **time-sensitive facts** (current office holders, "latest" products or models, precise populations, records likely to change). Especially important for IT and AI. **Recent events are allowed** when the year or circumstances are stated so the answer stays true ("Vilket år införde Bulgarien euron?"). |
| C-6 | Natural, grammatically correct Swedish. Established English technical terms may be used in IT and AI where that is how Swedish professionals actually say them. |

### Topic boundaries

- **Geografi** — physical geography: mountains, rivers, lakes, oceans, deserts, islands, volcanoes, climate and climate zones, continents, natural phenomena, maps and coordinates.
- **Länder** — countries: capitals, flags (described in words), official languages, currencies, borders and neighbours, famous landmarks, national symbols.
- **Rymden** — planets, moons, the Sun and stars, galaxies, space exploration history, astronomers, basic astrophysics.
- **Sverige** — Swedish history, geography, culture, traditions, inventions, well-known Swedes (historical), society and institutions.
- **IT** — professional level: networking and protocols, operating systems, programming concepts, algorithms and data structures, databases, security and cryptography, cloud and infrastructure, software architecture, computing history.
- **AI** — professional level: machine learning fundamentals, neural networks, transformers and attention, training and optimisation, evaluation metrics, NLP, computer vision, reinforcement learning, AI history, key safety and ethics concepts.
