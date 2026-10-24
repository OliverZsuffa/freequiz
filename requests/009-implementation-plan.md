# Request 009 implementation plan

## Status
Approved by Oliver on 2026-10-24. Implemented on PR #9; automated checks pass. Awaiting merge approval.

## Goal
Make question-library filters genuinely composable through multi-select controls, and improve question handling during practice with an in-session favourite action and a persistent defer marker. In exams, defer records the marker but must not skip or otherwise bypass the exam question.

## Phase 1: Audit
1. Inspect the current question-library filter model and UI, especially categorical filters and tag inclusion/exclusion.
2. Inspect favourite persistence, question/session navigation, attempt events, practice results, exam session state, and import/export/backup compatibility.
3. Find how question status and session summaries are derived. Decide where deferred status belongs so it persists without falsifying correct/incorrect mastery.
4. Document current behavior and existing test coverage before changing code.

## Phase 2: Multi-select filters
1. Allow selecting multiple values for categorical filters wherever multiple simultaneous values make sense, including answer mode, section, provenance, import batch/type, and optional-field presence.
2. Define semantics explicitly: OR between selected values within one filter; AND between different filter categories. Preserve section descendant behavior and existing tag include/exclude semantics.
3. Keep free-text and date-range filters as text/range controls rather than forcing them into multi-select.
4. Make selected values visible, removable individually, and resettable. Preserve result counts and empty states.
5. Ensure changing filters does not silently broaden the bulk-selection scope or corrupt selected question IDs.
6. Add tests for multiple values in one category, AND across categories, deselection, reset, empty matches, and interaction with bulk selection.

## Phase 3: Favourite from practice
1. Add an accessible favourite toggle to the practice question UI, including after an answer is marked correct or incorrect.
2. Reuse the existing profile-local favourites model and update the visible state immediately.
3. Ensure favouriting or unfavouriting during practice does not alter the answer, mastery, attempt history, session ordering, or exam scoring.
4. Add tests for toggling before and after answering, persistence, profile isolation, and compatibility with the existing favourites study source.

## Phase 4: Defer behavior
1. Add a Defer action to practice. It records that the current question was deferred, skips it for the remainder of the current practice session, and advances to the next eligible question without recording a correct or incorrect answer.
2. Make the deferred marker persist in the appropriate profile-level history so users can identify deferred questions later. Do not fabricate an answer attempt or change mastery solely because of deferral.
3. Define how the marker is shown in question management and/or session results, and how repeated deferrals are represented, after auditing existing history structures.
4. In exams, the action must record the deferred marker but must not skip the question, advance automatically, or bypass exam rules. The user stays on the same question after marking it deferred and can still answer it or navigate using the ordinary exam controls.
5. Do not let deferral silently count as a correct or incorrect response. Preserve exam timing, answer submission, and scoring rules.
6. Keep the new data backward compatible with existing profiles, exports, imports, and backups. Never invent historical defer events.
7. Add tests for practice skip behavior, last-question behavior, no-answer attempt creation, exam non-skip behavior, repeated marking, persistence, and results/scoring integrity.

## Phase 5: Verification and delivery
1. Run the full automated test suite, TypeScript check, and production build.
2. Review accessibility, keyboard operation, responsive layout, profile isolation, and data compatibility.
3. Review the diff for unintended changes to mastery, exam scoring, or filter selection scope.
4. Merge only after explicit approval and successful checks. Verify the main-branch GitHub Actions build and Pages deployment before reporting the feature live.
5. Report automated checks separately from manual desktop, mobile, and offline smoke tests.

## Assumptions to confirm
- Multi-select filter semantics are OR within a single filter category and AND across different categories.
- A practice defer skips the question for the current session and records a persistent defer marker, without generating a correct/incorrect attempt.
- In exams, Defer marks the question and leaves the user on it; normal exam navigation remains available.

## Out of scope
- Changing the correct answer, score, or mastery merely because a question was deferred.
- Allowing Defer to skip an exam question or circumvent exam navigation/scoring.
- Backend services, telemetry, automatic AI calls, or cross-device sync.

## Approval gate
Oliver approved this plan and its defaults on 2026-10-24. Implementation is complete on PR #9. Merge only after explicit merge approval and successful checks.
