# Request 001: Freequiz progressive web app

## Status
Planning. Implementation requires explicit user approval.

## Goal
Build Freequiz, a client side only progressive web app for importing, organising, practising, and reviewing multiple choice questions. Publish through GitHub Pages.

## Product principles
- Free, private, offline capable, and usable without an account or backend.
- User data belongs to the user and remains portable.
- Practice status is transparent and deterministic, not an opaque score.
- AI assistance generates prompts for an external model selected by the user. The app never calls an AI API or requires a key.
- Support touch, keyboard, mobile, and desktop.

## Proposed stack
- Vite, React, TypeScript.
- Vitest and Testing Library for tests.
- LocalStorage for small settings and IndexedDB for question banks, profiles, and event history.
- GitHub Actions for type checking, tests, production build, and GitHub Pages deployment.
- PWA manifest, service worker, install support, and offline app shell.
- No server, telemetry, account, external runtime API, or required third party service.

## Core data model
- Profiles own independent question collections, sections, practice history, and settings.
- Sections have stable IDs and optional parent IDs, supporting arbitrary nesting.
- Questions have stable IDs, prompt text, multiple options, one or more correct option IDs, explanation, optional notes, tags, and a section assignment.
- Each answer attempt is an immutable event with timestamp, selected options, correctness, and elapsed time.
- Current mastery is derived from recent attempt history, with a clear migration strategy if the scoring policy changes.
- Import schema is versioned. Imports are validated and previewed before they change stored data.

## Initial release scope
1. Dashboard with profile switcher, section tree, progress summaries, and quick start.
2. Quiz runner with one question at a time, answer feedback, explanations, keyboard navigation, and configurable immediate or end-of-session feedback.
3. Mastery states matching the requested ADAC-inspired convention: two consecutive correct answers means known, one correct means learning, one incorrect means needs work, two incorrect answers means weak, never attempted means new. The UI must distinguish never attempted from a question attempted only once. A user can reset or override progress.
4. Practice modes: all questions, due for review, weak or new questions, selected sections, and missed questions.
5. Nested section management, question search and filters, and profile management.
6. JSON import and export, with validation, duplicate detection, preview, and merge or replace choices.
7. AI import assistant that builds a provider neutral prompt from pasted source material and the current section tree, requests strict schema compliant JSON, explains how to paste the model response back, and allows review and mapping of unknown or new sections before import. Include a sample JSON format and prompt templates.
8. Progress timeline showing attempts, correctness, and mastery changes over selectable periods.
9. Spaced review queue based on last practice time and performance, with a transparent due date calculation.
10. Local persistence, backup and restore, offline support, installable PWA, dark mode, responsive layout, and accessible keyboard operation.
11. Sample question bank clearly labelled as demonstration data, plus first run onboarding and an empty state that explains how to import.
12. Documentation, schema examples, automated tests, and a GitHub Pages workflow.

## Suggested additional features
- Study session summary and streaks, but never pressure users or penalise missed days.
- Confidence rating before revealing the answer, to distinguish lucky guesses from knowledge.
- Per-question notes and source references.
- Randomisation of question and answer order, respecting any question constraints.
- Import diagnostics with line level validation errors and a downloadable error report.
- Profile export/import bundles and one click full backup.
- Optional exam mode with no immediate feedback and a final results report.
- Section level mastery rollups and a focused practice planner.
- Reduced motion support, high contrast states, and full keyboard control.

## UX and design direction
A clean, fast study workspace. Dashboard first, practice mode as a focused distraction free screen, and analytics as a separate view. Use labels and icons in addition to colour for mastery. Avoid overly dense charts and avoid making the user navigate away from an active quiz to inspect progress. Responsive layouts should work well on a phone.

## JSON contract proposal
Use a documented, versioned envelope such as `freequiz/questions-v1` with profiles, sections, and questions. Questions use stable IDs, option IDs, correct option IDs, optional explanation, tags, and section ID. Imported files may also be accepted in a simpler questions array format through a normalisation step, but exports use one canonical format. Attempt history is included in full profile backups, but can be excluded from question bank exports.

## Validation and quality gates
- Unit tests for mastery-state transitions, review scheduling, nested section operations, import validation, merge/replace behavior, and migration.
- Component tests for quiz answers, profile switching, section filtering, and import preview.
- Run type check, unit tests, and production build before considering a change complete.
- GitHub Actions deploys only from the main branch after checks pass.
- Verify workflow result and published Pages URL before claiming deployment is live.
- Never claim a test or live smoke test that was not actually performed.

## Implementation sequence
1. Establish project files, dependencies, styles, PWA setup, GitHub Actions, request tracking, and Knowledge Base.
2. Implement and test domain models, persistence, and import/export.
3. Implement dashboard, profiles, section tree, and question management.
4. Implement quiz runner, mastery states, practice selection, and review scheduling.
5. Implement timeline and analytics.
6. Implement AI prompt generation and reviewed import flow.
7. Finish accessibility, mobile UX, onboarding, sample data, and documentation.
8. Run checks, inspect changes, deploy through Pages, and verify deployment status.

## Decisions to preserve
- Client side only. No server, authentication, analytics, or AI API calls.
- GitHub Pages is the target host.
- The user must approve this plan before implementation.
