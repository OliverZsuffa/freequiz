# Freequiz Knowledge Base

## Product
Freequiz is a private, client side only progressive web app for organising and practising multiple choice question banks. Request 001 was approved on 2026-10-23.

## Non-negotiable principles
- No backend, account, telemetry, or automatic AI API calls.
- GitHub Pages is the deployment target.
- Profiles have independent questions, sections, and attempt histories.
- Data is portable through JSON exports and backups.
- Imported content is validated before it is applied.
- Mastery is visible and explainable.
- Never claim tests or deployment passed unless the run has been checked.

## Stack
- Vite, React, TypeScript.
- Vitest and Testing Library.
- IndexedDB persistence with localStorage fallback.
- PWA manifest and service worker.
- GitHub Actions builds, tests, and deploys Pages.

## Domain rules
- Mastery states: New when untouched, Learning after one correct, Needs work after one incorrect, Known after two most recent consecutive correct answers, Weak after two most recent consecutive incorrect answers.
- Attempts are stored as timestamped events with selected option IDs.
- Review heuristic: unseen and incorrect questions are due immediately, known questions after seven days, and other attempted questions after one day.
- Correct answers reference option IDs, allowing multiple correct answers in imported question banks.
- Sections use stable IDs and parent IDs for nesting.
- Question schema identifier: `freequiz/questions-v1`; backup identifier: `freequiz/backup-v1`.

## Current implementation
- Redesigned calm, content-first dashboard with one primary practice action, compact mastery summary, three session modes, and a quiet section list.
- Quiz runner with one question at a time, feedback, and explanations.
- Library search, section filtering, manual single answer question creation, and question specific practice.
- Import assistant with JSON validation and preview, merge or replace, and AI prompt generation.
- Attempt timeline and current mastery review list.
- Dark and light appearance with the selected theme persisted in localStorage; responsive styles, IndexedDB and localStorage fallback for app data, PWA manifest and service worker.
- GitHub Pages workflow at `.github/workflows/pages.yml`.

## Known limitations
- Section creation currently adds top level sections only. Nested section display works when imported data contains parent IDs; nested editing and moving questions need a management UI.
- Manual question editor supports one correct answer; imported questions and the practice runner support multiple correct option IDs.
- Review scheduling is a simple heuristic and needs configurable policy and more edge case tests.
- Session completion returns to overview without a dedicated summary screen.
- Timeline shows recent attempt events, not a daily trend chart.
- Backup export supports all profiles; import currently imports a question bank into the active profile rather than restoring a full backup.
- PWA caching needs a deployed browser smoke test. Google Fonts are optional styling resources and may not load offline.
- Browser persistence does not synchronise across devices.

## Verification record
- Request 002 UI redesign passed GitHub Actions run `39996335067` on commit `40e41440152df183b76309814f72e6412528aa75`: TypeScript check, all tests, production build, Pages configuration, artifact upload, and deployment succeeded. A real-browser visual inspection and manual phone/offline smoke test have not been performed from this environment.
- GitHub Actions run `39993205768` confirmed the unit tests and TypeScript/production build step passed on commit `51311d1568a2058cb8fcce7bba4ae0f274c9e191`.
- The Pages configuration step failed because the repository does not yet have GitHub Pages enabled. The workflow is configured, but an owner must enable it under Settings → Pages → Build and deployment → Source → GitHub Actions. The `configure-pages` action cannot enable the site with the default `GITHUB_TOKEN`.
- After Pages is enabled, rerun the latest workflow or push a new commit, then verify the deployment job and published URL. A live browser and offline smoke test has not yet been performed.

## Working process
1. Read this Knowledge Base and relevant request documents before planning changes.
2. Document an implementation plan under `requests/`.
3. Wait for explicit approval before ordinary feature work.
4. After approval, implement, run available checks, review changes, and update this Knowledge Base.
5. Verify Actions and the published Pages URL before reporting deployment complete.
