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
- Study-first home screen with source and question-count setup, practice/exam selection, due/weak shortcuts, and a compact secondary-tools menu.
- Single-answer, exactly-N, and select-all answer modes. Legacy questions infer single mode from one correct option and select-all from multiple correct options.
- Answer choices are shuffled for each session while option IDs remain stable; option counts are variable and labels remain usable beyond 26 choices.
- Practice provides immediate feedback and saves ordinary practice attempts for mastery/review scheduling.
- Timed exams hide correctness feedback until submission or timeout and save separate exam-session records, so exam answers do not silently alter ordinary practice mastery.
- Question editor supports adding and editing questions, variable option counts, explanations, and multiple correct answers; edits retain the question ID.
- Favourites and reusable custom study groups are profile-local and available as session sources.
- Section selection/filtering includes the selected section and all descendants for library lists, counts, practice, and exam source selection.
- Session results include score/accuracy visuals and a topic breakdown. Statistics include practice accuracy trends, mastered-question trends, and separate exam history.
- Session setup supports multiple selected sections and deduplicates questions across parent/child selections.
- Gamification elements (activity, streaks, milestones, weekly goals, celebrations, and motivational highlights) are independently configurable; ordinary charts and factual results remain available when gamification is off.
- Weekly goals and opt-in reminders are configurable. Reminder delivery is checked while the app is open only; closed-app delivery is not guaranteed.
- AI prompt generation has two reusable modes: strict extraction of explicitly posed questions and generation of new questions. A stated fact or hierarchy is not an existing question. Generation prompts ask for broad conceptual coverage, concise stems, source-grounded answers, and plausible balanced distractors. Source material is supplied to the external AI, not collected by Freequiz.
- AI prompts use compact section references, omit redundant schema examples, and allow users to omit existing-section matching for stricter prompt limits. With section matching omitted, the prompt instructs the AI to derive a concise hierarchy from the supplied material.
- Questions may carry protected `AI-Extracted` or `AI-Generated` provenance metadata, separate from editable ordinary tags. Provenance survives editing and JSON import/export; unsupported provenance values are ignored.
- Four persisted accent presets (blue, purple, orange, green), plus dark/light appearance. Request 006 aligns dark/light surfaces with the selected accent while retaining semantic correctness and mastery colours.
- Import workflow validates JSON and previews merge/replace; AI prompt generation remains local and does not call an API.
- Import history is profile-local and optional for legacy profiles. Each batch stores its timestamp, name, source type, original question/section snapshot, and IDs newly added. Users can inspect batches, see added/skipped counts, see the first import attribution in the library, and export an individual batch as a question-bank JSON file. Snapshots remain available if library questions are later changed or deleted.
- IndexedDB persistence with localStorage fallback, profile backup export, responsive layout, PWA manifest/service worker, and GitHub Pages deployment workflow.

## Known limitations
- Section creation currently adds top-level sections only. Imported nested sections display and filter correctly, but nested creation/moving and section renaming are not yet available.
- The question editor supports editing ordinary tags and preserves protected AI provenance. A question-delete action is not yet available.
- Historical mastery trends use the current question bank, so deleted questions are excluded.
- Reminder checks run only while the app is open; reliable closed-app delivery requires supported push infrastructure.
- Review scheduling remains a simple heuristic without configurable policy.
- Full backup export includes all profiles, but importing a backup does not restore all profile metadata, histories, favourites, groups, or exams; import currently applies question-bank content to the active profile.
- Edited questions keep their IDs. If an option's text changes, its old option ID may no longer be retained, so older attempts referencing that option are historical events rather than a snapshot of the old question wording.
- PWA caching has not had a manual browser/device/offline smoke test. Optional external fonts may not load offline.
- Browser persistence does not synchronise across devices.
- Manual desktop/mobile/offline smoke testing and real-world notification timing were not performed from this environment. Reminder delivery is only checked while the app is open.

## Verification record
- Request 004 PR #3 passed 27 automated tests, TypeScript check, and production build on PR head `7d23789193738fb0784df8f251a29626539505b1` (workflow run [`40032130448`](https://github.com/OliverZsuffa/freequiz/actions/runs/40032130448)). The merged main deployment, including documentation status updates, passed build and GitHub Pages deployment in run [`40032234099`](https://github.com/OliverZsuffa/freequiz/actions/runs/40032234099).
- Request 002 UI redesign passed GitHub Actions run `39996335067` on commit `40e41440152df183b76309814f72e6412528aa75`.
- Request 003 passed the PR workflow run [`40029404119`](https://github.com/OliverZsuffa/freequiz/actions/runs/40029404119) on PR head `b6b509caaceb49929b71c4cd104051019089620a`: TypeScript check, tests, production build, Pages configuration, and artifact upload succeeded.
- The merged main commit is `b881a6821a08cbc8636ad08f003de3ecc58569df`. GitHub Actions run [`40029476793`](https://github.com/OliverZsuffa/freequiz/actions/runs/40029476793) passed tests, TypeScript check, production build, Pages configuration, artifact upload, and GitHub Pages deployment.
- Automated checks and deployment succeeded. A manual browser, phone, and offline smoke test has not been performed from this environment.

## Working process
1. Read this Knowledge Base and relevant request documents before planning changes.
2. Document an implementation plan under `requests/`.
3. Wait for explicit approval before ordinary feature work.
4. After approval, implement, run available checks, review changes, and update this Knowledge Base.
5. Verify Actions and the published Pages URL before reporting deployment complete.


## Request 005 verification
- Implemented and merged in PR #4. Main build and GitHub Pages deployment passed in workflow run 40079472885.
- Extraction prompts prioritize fidelity, forbid invented content and guessed answer keys, and separate uncertain items into a review report outside importable JSON.
- Generation prompts require plausible misconception-based distractors, balanced option length, varied correct-answer positions, and an audit for unintended clues.
- Provenance is a separate optional field in `freequiz/questions-v1`. Ordinary tags are editable; the editor does not allow ordinary tags to remove or overwrite provenance.
- Legacy question banks without provenance remain supported.

- Request 005 verification: 33 tests passed, TypeScript check passed, production build passed, and GitHub Pages deployment passed in workflow run 40079472885. Manual browser/device smoke testing was not performed.


## Request 006 implementation status
- PR #5 implements the site-wide UI simplification, blue-led consistent accent surfaces, shorter strict extraction/generation prompts, optional compact section matching, and per-profile import history with batch exports.
- PR workflow run [40086825611](https://github.com/OliverZsuffa/freequiz/actions/runs/40086825611) passed 38 tests, TypeScript check, production build, Pages configuration, and artifact upload.
- The GitHub connector used here does not expose the main-branch push deployment run, and the live site could not be fetched for a browser smoke test. Do not claim the live deployment was independently verified in this session.
- Manual desktop, mobile, and offline checks remain outstanding.


## Request 006 verification
- Implemented and merged via [PR #5](https://github.com/OliverZsuffa/freequiz/pull/5), merge commit `3ea6cf4870a0be4f739d9d6777d0ceec83e3eeaa`.
- PR workflow run [40086825611](https://github.com/OliverZsuffa/freequiz/actions/runs/40086825611) passed all 38 tests, TypeScript checking, production build, Pages configuration, and artifact upload.
- Main push deployment and live site were not independently verified because the available connector did not expose the push-triggered workflow run and the live URL could not be fetched. Manual desktop/mobile/offline smoke tests were not performed.


## Request 007: AI prompt reliability follow-up
- Tightens generated question stems to strictly forbid references to slides, lectures, notes, presentations, or source material except when the source itself is the topic.
- Requires a coverage-first pass, multiple distinct questions for substantial topics, and an explicit final check for underrepresented topics, while prohibiting padding and near-duplicates.
- Clarifies that supplied sections are the existing catalogue: reuse their IDs in question sectionId fields and return sections: [] when no genuinely new section is needed. Only new sections belong in the output sections array.
- Adds regression tests for these prompt requirements and for importing questions that reference existing section IDs without repeating section definitions.
- Importer review: merge mode already deduplicates sections by ID and accepts question sectionId references even when the imported sections array is empty.
- Automated verification and deployment status will be recorded after the PR workflow completes. Manual browser/device checks are separate and must not be implied by automated checks.
