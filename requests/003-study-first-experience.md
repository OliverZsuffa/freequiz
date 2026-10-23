# Request 003: Simple study-first experience and study tools

## Status
Drafted on 2026-10-23; awaiting explicit user approval. No application code has been changed for this request.

## Goal
Make Freequiz feel like a simple study tool rather than a collection of features. The primary loop should be obvious to a first-time user, even one who struggles with complicated interfaces:

1. Open the app and see what needs studying.
2. Choose a question source/group and a question count.
3. Answer questions.
4. See an understandable, visually rewarding result.
5. Leave; progress is saved automatically.

Keep the rich capabilities, but reveal secondary tools only when relevant or inside a small, clearly labelled menu.

## User decisions
- Home screen: study first.
- Exam mode: strict timed exam, with no correctness feedback until the end.
- Normal practice: immediate feedback.
- Question sources: existing sections plus custom groups.
- Statistics: balanced charts and topic breakdowns, with deeper detail tucked away.
- Accent presets: blue, purple, orange, and green.
- Secondary tools: a small menu.

## Required work

### 1. Simplify the main experience
- Rework the home screen around one clear primary action and a compact view of what needs studying.
- Let the user choose a section or subsection/custom group and a question count before starting.
- Keep practice and exam mode choices clear without presenting every app feature at once.
- Use plain labels, predictable placement, large enough controls, and calm spacing. Avoid decorative clutter, competing cards, and icon-only controls.
- Keep secondary features such as importing/exporting, profile management, question-bank editing, and settings in a small labelled menu or relevant contextual locations.
- Preserve all existing useful features and the client-side-only architecture.

### 2. Fix section filtering
- Diagnose and fix the existing bug where selecting a section does not reliably show the questions belonging to it.
- Define section scope consistently: selecting a parent section includes questions in that section and its descendants; selecting a leaf includes its own questions.
- Ensure counts, question lists, practice selection, and empty states agree with the selected scope.
- Cover nested sections, empty sections, and questions attached directly to parent sections in regression tests.

### 3. Add strict timed exam mode
- Before starting, choose the source (all questions, a section/subtree, favourites, or a custom group), question count, and time limit.
- Present one question at a time with a clear timer and progress indicator.
- Do not reveal whether answers are correct, show explanations, or otherwise provide correctness feedback during the exam.
- Support existing single-answer and multiple-correct-answer questions.
- When the user submits or time expires, end the exam and show results. A timeout must not silently continue the exam.
- Record the exam attempt/results in the existing local history in a way that does not corrupt the current mastery rules. The implementation plan must define how exam attempts affect mastery and due-review scheduling before coding.
- Keep the exam local-only; no server, account, or external API.

### 4. Add a proper results view and visual progress
- Show a dedicated result screen after practice and exams, with a clear score, number answered, and a simple visual such as a progress bar.
- Include a restrained visual breakdown by section/topic and a useful next step.
- Add a compact, readable progress chart using existing local attempt data where meaningful; keep detailed statistics behind a clearly labelled action.
- Make chart labels and values understandable without relying on colour alone. Include accessible text summaries and responsive layouts.
- Prefer lightweight CSS/SVG or existing project capabilities; do not add a large charting dependency without a strong reason.
- Keep normal practice feedback immediate while still showing a final summary.

### 5. Edit questions
- Allow users to open an existing question and edit its prompt, options, correct answer(s), explanation, tags, and section.
- Support multiple correct options, matching the current import/practice schema.
- Validate that the prompt and options are usable, option IDs are unique, at least one correct option is selected, and correct option IDs exist.
- Save edits safely and preserve the question's stable ID and relevant attempt history.
- Make edit and cancel/save actions clear; avoid accidental deletion or silent data loss.

### 6. Favourites and custom study groups
- Let a user favourite/unfavourite a question with a clear, easy-to-find control.
- Provide a built-in Favourites source for quick revision.
- Let users create, rename, and delete custom study groups and add/remove questions from them.
- Store group membership as question references rather than duplicating question content.
- Define behaviour for deleted/missing questions and ensure groups are profile-local, consistent with existing profile separation.
- Make groups available as sources in practice and exam setup.

### 7. Accent colour presets
- Offer curated blue, purple, orange, and green accent themes.
- Persist the selected preset across reloads.
- Keep each preset coherent in both light and dark appearance modes, with adequate contrast for text, controls, focus indicators, success and error states.
- Keep the existing light/dark mode. Accent choice must not change correctness semantics or make success/error states ambiguous.

## Non-negotiable constraints
- No backend, accounts, telemetry, cloud sync, or automatic AI API calls.
- Preserve the privacy-first, browser-local architecture, existing profile separation, JSON import/export, and offline-capable PWA behaviour.
- Do not remove existing functionality merely to make the interface look simpler; hide secondary actions instead.
- No code changes until the user explicitly approves the implementation plan.
- Update the Knowledge Base and verification record after implementation.

## Acceptance criteria
- A first-time user can identify what to study and start a session without exploring multiple navigation areas.
- The main loop remains clear on phone and desktop, with secondary features available but unobtrusive.
- Selecting a parent section includes its descendant questions; selecting a leaf or custom group returns the correct set and count.
- Practice provides immediate feedback; exam mode withholds correctness feedback until submission or timeout.
- Exam source, count, timer, timeout, and result behaviour are covered by automated tests.
- Practice and exam results include a score and useful visual progress; deeper analytics are available but not constantly visible.
- Existing questions can be edited, including multi-answer questions, without losing stable IDs or attempt history.
- Favourites and custom groups can be managed and used as practice/exam sources.
- All four accent presets persist and remain readable in light and dark modes.
- Existing features and data imports remain compatible; TypeScript checks, tests, and production build pass.
- Any browser, mobile, offline, or live-deployment checks not performed are explicitly reported rather than assumed successful.


## Additional requirements: answer modes and option randomization

- Randomize displayed answer-option order for each new question presentation/session. Keep stable option IDs attached to their text so grading, editing, imports and history remain correct. Do not reshuffle while the learner is answering the same question.
- Support explicit per-question answer modes: **single answer**, **exactly N answers** (show the required count), and **select all that apply** (do not reveal how many are correct).
- These are distinct instructions/interactions, not just a guess based on the number of correct options. Validate that mode and correct-answer count agree.
- For old/imported questions with no mode, default one correct option to single answer and multiple correct options to select-all-that-apply. Never infer exactly-N automatically.
- The question editor must allow a variable number of options, at least two and without an arbitrary low cap. Option IDs and displayed labels must continue to work beyond 26 options.
- Add answer-mode filters to the question library and session setup; apply them consistently to practice and exams.
- Add tests for randomized option display with stable IDs, all three modes, filtering, backwards-compatible imports, and large option lists.
