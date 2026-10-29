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
- AI prompt generation has two reusable modes with editable text in `src/prompts/extract.txt` and `src/prompts/generate.txt`. A stated fact or hierarchy is not an existing question. Generation prompts require comprehensive learning coverage and keep distractor quality, answer-length balance, answer-position balance, clue prevention, ambiguity checks, and the final quality audit as separate explicit sections. Prompt files are bundled at build time for offline use. Source material is supplied to the external AI, not collected by Freequiz.
- AI prompts use compact section references, omit redundant schema examples, and allow users to omit existing-section matching for stricter prompt limits. With section matching omitted, the prompt instructs the AI to derive a concise hierarchy from the supplied material.
- Questions may carry protected `AI-Extracted` or `AI-Generated` provenance metadata, separate from editable ordinary tags. Provenance survives editing and JSON import/export; unsupported provenance values are ignored.
- Four persisted accent presets (blue, purple, orange, green), plus dark/light appearance. Request 006 aligns dark/light surfaces with the selected accent while retaining semantic correctness and mastery colours.
- Import workflow validates JSON and previews merge/replace; AI prompt generation remains local and does not call an API.
- Import history is profile-local and optional for legacy profiles. Each batch stores its timestamp, name, source type, original question/section snapshot, and IDs newly added. Users can inspect batches, see added/skipped counts, see the first import attribution in the library, and export an individual batch as a question-bank JSON file. Snapshots remain available if library questions are later changed or deleted.
- IndexedDB persistence with localStorage fallback, profile backup export, responsive layout, PWA manifest and build-generated service worker that precaches built assets, and GitHub Pages deployment workflow.

## Known limitations
- Section creation currently adds top-level sections only. Imported nested sections display and filter correctly, but nested creation/moving and section renaming are not yet available.
- The question editor supports editing ordinary tags and preserves protected AI provenance. A question-delete action is not yet available.
- Historical mastery trends use the current question bank, so deleted questions are excluded.
- Reminder checks run only while the app is open; reliable closed-app delivery requires supported push infrastructure.
- Review scheduling remains a simple heuristic without configurable policy.
- Full-profile backup restore is implemented: it validates every profile before mutation, creates separate profile copies, preserves progress and source history, and adjusts colliding profile IDs/names. Automated regression coverage exists; a full real-device cross-browser round trip remains part of manual release verification.
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

See [GitHub change and deployment workflow](github-workflow.md) for the concrete branch/PR process, the Git Data API fallback for files the usual editor cannot handle, and the checks required before claiming a deployment is live.
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
- Implemented and merged via [PR #6](https://github.com/OliverZsuffa/freequiz/pull/6), merge commit `acfe0c84147e5fe7b72cf3c717f1d54dab190c51`.
- PR workflow run [40095796298](https://github.com/OliverZsuffa/freequiz/actions/runs/40095796298) passed all 40 tests, TypeScript checking, production build, Pages configuration, and artifact upload.
- The PR workflow skipped deployment, and the main push deployment/live app were not independently verified. Manual browser/device checks remain outstanding.


## Request 008: Question management
Implementation is available in Pull Request #8 and is awaiting merge into `main`.

- Profile deletion is confirmed and restricted to the active profile. It protects the final profile, switches to another profile after deletion, removes profile-owned data, and leaves app-wide settings unchanged.
- Section selection uses recursive trees and full hierarchical paths. Parent selection includes descendants in study setup, and question-library filters have an explicit include-descendants toggle.
- The question library and home Practice/Exam setup share `QuestionFilters` and `filterQuestions`. Common filters visible by default are searchable Tags, Sections with the existing descendant toggle, Favourites, Deferred, explicit Question origin, and Mastery. Advanced filters retain answer type, include/exclude tags, import batch/type, explanation/tag presence, creation/modification dates, and sorting. The shared selector shows a live count in Practice/Exam setup instead of a question list and validates requested counts against the filtered set. Search covers prompts, options, explanations, section paths, provenance, and import metadata. Existing AND/OR semantics and stable original-order tie breaking are preserved.
- Bulk selection supports individual questions and all matching results across the full filtered set. Bulk actions support adding, removing, or replacing tags, moving sections, setting explanations, and changing answer mode when existing correct-answer counts remain valid. Bulk tag changes and section moves, along with the other supported bulk changes, can be undone through the saved question snapshot.
- Import batches record original filename/source identity when available and each import operation remains distinct. Existing questions without timestamps or source attribution are not assigned fabricated history.
- Automated verification on the pull request passed: 2 test files, 44 tests, TypeScript checking, and production build. This does not represent manual desktop/mobile/offline testing or a deployed main-branch build.


## Request 009 verification
PR #9 adds multi-select library filters, practice favourites, and profile-level deferred markers. Practice deferral skips without recording an answer; exam deferral marks the question without advancing. Workflow run [40107477903](https://github.com/OliverZsuffa/freequiz/actions/runs/40107477903) passed all 48 tests, TypeScript checking, production build, Pages configuration, and artifact upload. The PR remains unmerged, so deployment and manual desktop/mobile/offline checks are outstanding.


## Request 011 implementation

Request 011 separates question-bank exports from full-profile backups and adds accessible long-label filters.

- Full profile backup exports the active profile's full stored data, including attempts, question favourites, deferred state, groups, exam sessions, import batches, original filenames/source identity, profile-specific tag favourites, and unknown future-compatible fields. A separate action backs up all profiles. The backup includes the active profile ID and a version marker.
- Backup restore validates every profile before applying anything and recognises backup files separately from question-bank JSON. It creates new profile copies, leaves existing profiles untouched, adjusts colliding profile IDs/names, and retains question/attempt/import/group/exam IDs and cross-references.
- Question-only export includes questions and the section ancestors needed by them, but excludes learning history, exam sessions, profile configuration, and question-level import-batch links. It remains compatible with the normal question-bank preview and merge path.
- Tag filters are searchable; starring a tag persists on its profile and moves it to the top of the list. Import-source and tag pickers use wrapping labels and individually removable selected chips for long filenames/tags.
- Regression coverage was added for backup validation and future fields, question-only export boundaries, starred-tag ordering/persistence, and restoring progress/source attribution. Pull-request workflow [40381683446](https://github.com/OliverZsuffa/freequiz/actions/runs/40381683446) passed all 59 tests across 2 test files, TypeScript checking, the production build, Pages configuration, and artifact upload. After merge, main-branch workflow [40382093307](https://github.com/OliverZsuffa/freequiz/actions/runs/40382093307) passed the build and GitHub Pages deployment. An independent rendered-page visual smoke test was not completed.



## Weekly question sharing and privacy

Use **Export questions** from the Questions workspace to share a question bank. This produces a `freequiz/questions-v1` content-only file with the relevant section hierarchy and stable question/option IDs. It does not include practice attempts, exam history, favourites, deferred markers, groups, app settings, or profile backup data. Use **Full profile backup** or **Backup all profiles** only for a complete restore/migration; those files contain private progress and should not be shared as question packs.

Recipients should import a question-only file and choose **Merge into profile**. The preview shows how many question IDs are new, already present, and how many sections will be added. Re-importing a pack is safe for distributing new questions: existing question IDs are skipped and the recipient's local progress remains local. The current merge contract does **not** update the content of a question with an ID that already exists. A future content-update workflow must be explicit, previewed, and must never import the sender's progress.

The Learning timeline's **Export history** exports only the active profile's history and the question identifiers/prompts needed to interpret it; it is not a full profile backup. The Study view's primary **Start practice** action follows the visible session setup; **Due for review** and **Needs practice** remain separate shortcuts.


## Request 014 verification (2026-10-26)

- Implemented and merged in [PR #18](https://github.com/OliverZsuffa/freequiz/pull/18): mobile menu/popover scrolling and stacking, tag-first filter ordering with metadata before general search, and clear import/export destination actions.
- Added regression coverage for export-action discoverability and filter order. Pull-request workflow [40394870333](https://github.com/OliverZsuffa/freequiz/actions/runs/40394870333) passed the test suite, TypeScript checking, and production build.
- Main-branch workflow [40395013536](https://github.com/OliverZsuffa/freequiz/actions/runs/40395013536) passed build and GitHub Pages deployment.
- Manual phone/desktop viewport checks, keyboard/screen-reader checks, and offline/PWA smoke tests have not been performed in this environment. Do not infer these passed from CI.
- A small public sample bank is available at `public/sample-question-bank.json`; the README links to its deployed URL. The sample is validated by a domain-level test using the same import parser.


## Request 015 execution record (2026-10-26)

- **Phase 0, baseline:** the latest pre-change main workflow [40388556021](https://github.com/OliverZsuffa/freequiz/actions/runs/40388556021) passed the existing test, TypeScript, build, and deployment workflow.
- **Phase 1, known bugs:** completed in [PR #18](https://github.com/OliverZsuffa/freequiz/pull/18). Pull-request workflow [40394870333](https://github.com/OliverZsuffa/freequiz/actions/runs/40394870333) passed; main deployment [40395013536](https://github.com/OliverZsuffa/freequiz/actions/runs/40395013536) passed.
- **Phases 2–3, automated data/study regression coverage:** existing tests cover question-only export boundaries, backup validation/restore with progress and source history, practice, favourite/defer, exam separation, filters, and profile behavior. The sample bank is parsed by the same import parser in a regression test. The docs/sample PR workflow [40395545334](https://github.com/OliverZsuffa/freequiz/actions/runs/40395545334) passed 67 tests, TypeScript checking, and production build.
- **Phase 4, manual verification:** not completed here. Real phone/desktop viewport checks, keyboard/screen-reader checks, PWA install/offline smoke testing, and a real cross-device round trip still need a human/browser environment.
- **Phase 5, tester preparation:** completed in [PR #19](https://github.com/OliverZsuffa/freequiz/pull/19): README getting-started guide, public sample bank, `KNOWN_ISSUES.md`, and corrected backup documentation.
- **Phase 6, 3–5-person trial:** pending. `TESTER_CHECKLIST.md` provides the tasks and a privacy-safe feedback template; the user must invite testers and collect results.
- **Phase 7, automated release checks:** main build and deployment passed in [workflow 40395706878](https://github.com/OliverZsuffa/freequiz/actions/runs/40395706878). The workflow's `npm install` reported 6 audit vulnerabilities (3 moderate, 1 high, 2 critical). The workflow log did not enumerate affected packages; review the audit details before wider release and do not apply force-upgrades without assessing compatibility.
- **Release status:** suitable for a small, supervised test only after the outstanding dependency-audit review and hands-on checks are considered. Do not describe the app as fully release-ready until manual checks and the external trial are complete.


## Request 016 implementation status
- The approved implementation is in progress on branch `implement/016-responsive-legal-release`; see the associated implementation PR for the current diff and automated checks.
- The desktop filter toolbar is being changed to a structured grid while preserving the mobile ordering. The general text search intentionally excludes tags; the dedicated searchable tag picker remains the only tag-search path.
- Appearance controls are visible together in the top bar, and primary buttons use the selected accent in both light and dark modes.
- Legal pages read operator-specific values from `public/legal-info.json`. That file is public when deployed. Required legal identity fields must be filled by the operator before production deployment; the deployment workflow validates the configuration and will stop if required values are missing. The optional Ko-fi link is shown only when a valid URL is configured.
- Privacy text distinguishes browser-local learning data from GitHub Pages hosting logs and describes the optional external Ko-fi destination. It must be reviewed by the operator against actual details before deployment.
- Manual real-device verification has not yet been performed.


## Request 017: one-tap study UI overhaul
- Implemented on branch `implement/017-one-tap-study-ui-overhaul` pending review.
- Homepage prioritises one-tap Study all questions, a visible horizontal profile chooser, compact colour-coded progress, and a small streak count based on consecutive days with saved attempts.
- Create practice and Create exam open a setup dialog; shortcuts practise in-progress or deferred questions.
- Question source is a plain-language label and supports explicitly marking a question as professor-written or another known source. Imported questions are not automatically treated as professor-written. AI provenance remains separately preserved.
- Import & export is consolidated in More and keeps question-only export separate from private backups.
- Appearance settings moved from the top bar to Settings; on mobile the sidebar navigation is hidden in favour of bottom navigation.
- Automated checks and real-device testing must be confirmed in the implementation PR; this note is not evidence of passing checks.


## Request 018: unified question search and filters
- Implemented in [PR #28](https://github.com/OliverZsuffa/freequiz/pull/28), using the existing local-first React/TypeScript architecture and no new dependencies.
- The reusable `src/components/QuestionFilters.tsx` serves management and selection modes. Filtering and sorting live in `src/questionFiltering.ts`.
- Management retains the question list and existing bulk-edit/export actions. Practice and Exam setup reuse the same filters and show a live count only. Starting a session uses the exact filtered set and refuses an invalid count.
- The panel exposes common filters immediately, keeps specialist filters under one Advanced filters disclosure, shows active filter chips, and clears all filter state without editing questions.
- The implementation checkpoint passed 77 automated tests, TypeScript checking, and the production build in [GitHub Actions run 40512265312](https://github.com/OliverZsuffa/freequiz/actions/runs/40512265312); Pages configuration and artifact upload also passed. Real-device visual review is not claimed complete.


## Request 019: Mobile filter popovers and import-source display

- Implemented in [PR #30](https://github.com/OliverZsuffa/freequiz/pull/30) and follow-up [PR #31](https://github.com/OliverZsuffa/freequiz/pull/31).
- PR workflow [40519486548](https://github.com/OliverZsuffa/freequiz/actions/runs/40519486548) passed 84 tests, TypeScript checking, production build, Pages configuration, and artifact upload for PR #30. Follow-up workflow [40519918829](https://github.com/OliverZsuffa/freequiz/actions/runs/40519918829) passed the same checks for PR #31.
- Mobile multi-select popovers are positioned relative to their trigger within the viewport. They render inside the app container to preserve light/dark and accent variables while escaping scrollable dialogs. Phone selections close the popover without losing selected values; desktop selections stay open. Outside pointer and Escape dismiss the popover.
- Import-source labels prefer the original filename or source identity, fall back to saved import names/source for legacy records, search all available metadata, and show explicit empty states.
- Removed sticky positioning from the stale `.library-toolbar` CSS rule. The current shared filter panel is not sticky; intentional top navigation and bulk-selection controls remain unchanged.
- Manual phone/desktop visual checks and independent verification of the main-branch Pages deployment remain outstanding. PR checks built and uploaded the Pages artifact, but they do not prove the main deployment or live visual behavior.


## Request 023: editable AI prompts
- Extract and Generate prompt text lives in `src/prompts/extract.txt` and `src/prompts/generate.txt`; edit those files to adjust AI instructions without rewriting the prompt builder.
- `src/domain.ts` still inserts the required JSON schema, provenance, and the section catalogue supplied by Freequiz. Section instructions must stay generic and must not assume a particular source filename or directory.
- Generate explicitly separates distractor quality, answer-length and option balance, correct-answer position balance, clue/ambiguity prevention, and the final quality audit. Keep these as distinct rules when editing.
- Both modes instruct compatible external AI environments to preserve the source PDF/note filename for the output file. Freequiz cannot enforce external file naming.
- Implemented and merged via [PR #46](https://github.com/OliverZsuffa/freequiz/pull/46), merge commit [`c0e2dbad91958b20242ee8b78895f3fbcf8625ea`](https://github.com/OliverZsuffa/freequiz/commit/c0e2dbad91958b20242ee8b78895f3fbcf8625ea). Workflow [40908254027](https://github.com/OliverZsuffa/freequiz/actions/runs/40908254027) passed 97 tests, TypeScript checking, production build, offline-build validation, Pages configuration, and artifact upload. Main-branch deployment has not been independently verified; manual browser/device testing was not performed.

## Request 024: LaTeX rendering and explicit AI JSON schema

- Implementation plan and execution record: [`requests/024-latex-and-ai-json-schema.md`](../requests/024-latex-and-ai-json-schema.md).
- Merged in [PR #47](https://github.com/OliverZsuffa/freequiz/pull/47), merge commit [`cea6a2c6e6ef08f445e343c353b58425e95c1b07`](https://github.com/OliverZsuffa/freequiz/commit/cea6a2c6e6ef08f445e343c353b58425e95c1b07).
- Both AI prompt modes now receive explicit `freequiz/questions-v1` schema instructions, including section names/IDs, answer modes, provenance, and JSON escaping for LaTeX. Import accepts legacy section `title` as an alias for `name`; stored profile and import-history sections are normalised on app load.
- KaTeX is bundled locally for inline `\\(...\\)` and display `\\[...\\]` formulas in study content, answer options, explanations, the question library, and the editor preview. Raw formula strings remain the stored/exported data.
- PR workflow [40921538249](https://github.com/OliverZsuffa/freequiz/actions/runs/40921538249) passed 101 tests across 5 files, TypeScript checking, production build, offline-build validation, Pages configuration, and artifact upload. The passing run covered the implementation code; the later changes to the request documentation did not change app code.
- Main-branch deployment was not independently verified from the available workflow results. Manual browser, visual, and offline smoke tests have not been performed. Do not infer those checks from CI.



## Request 026: Clearer AI LaTeX instructions

- Approved and implemented in [PR #49](https://github.com/OliverZsuffa/freequiz/pull/49); checks are pending.
- Shared instructions in `src/domain.ts` now specify the delimiters Freequiz renders, require each complete formula to use one matching math span, and explain JSON escaping at the source and decoded-string levels.
- The prompts prohibit `$...$` and `$$...$$` because the current `MathText` component does not render those delimiters. Both Extract and Generate receive the shared instructions.
- Regression coverage checks the prompt contract and a complete implication/equivalence formula through JSON parsing and MathText.
- Deployment and manual browser verification are not yet confirmed.
