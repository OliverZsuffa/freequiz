# Request 017: One-tap study and simplified Freequiz UI

## Status

**Approved by Oliver on 2026-10-27; implementation in progress in PR #24.** This request is based on the October 2026 feedback session with Oliver's dad and a source inspection of the current `main` branch.

Related work:
- [Request 012: whole-site UI/UX audit](012-whole-site-ux-audit.md)
- [Request 013: mobile-first UX and safe question sharing](013-mobile-first-ux-plan.md), already implemented in PR #17
- [Request 016: responsive filters, theme, and legal information](016-responsive-filters-theme-fixes.md), implemented in PR #22

This request supersedes earlier homepage/layout recommendations where they conflict with the more specific one-tap requirement below. It should build on the existing code and preserve existing functionality/data.

## What the inspection found

The current app already has many of the required capabilities, but they are spread across a dense homepage and multiple navigation/menu entry points.

- The Study/overview view currently includes practice setup, a `Start practice` action, `Due for review` and `Needs practice` shortcuts, a progress overview, a mastery explanation, an onboarding nudge, and additional study-related content. Starting requires understanding the setup instead of immediately reaching a question.
- Profiles exist as a core concept, but the homepage does not present every profile as the prominent, immediately understandable horizontal chooser requested in the feedback.
- The domain already defines five detailed mastery states: New, Learning, Needs work, Known, and Weak. Progress/streak/gamification features already exist, so this request should reuse them and avoid creating a competing tracking system.
- Streaks are already configurable through the existing gamification settings. The redesign should respect the existing opt-in/visibility preference and avoid adding a new, independent streak implementation.
- Question source metadata already distinguishes protected `AI-Generated` and `AI-Extracted` provenance from editable tags. Import history also records source/batch information. There is not currently a general, verified “professor-written” provenance value in the documented question schema; the UI must not infer that a question was written by a professor just because it was imported.
- The Questions workspace has dedicated tag search, section filtering, general search, and many additional metadata filters/actions. Advanced capabilities are valuable, but the first view is dense.
- Import/export is already available as a destination and offers distinct operations, including question-only export, a full active-profile backup, and all-profile backup. These must remain separate actions with clear explanations, but they can be presented through one simple Import & export entry point.
- The current navigation uses a top bar and a mobile bottom navigation in the same application. The redesign should ensure only one primary navigation system is visible at a time, while keeping all destinations reachable.
- Accent and light/dark controls were recently placed in the top bar. The new feedback identifies these as infrequently used settings that should move out of prime space.
- Requests 012 and 013 already cover other important issues (safe imports, clear exam exit, editor validation, keyboard/touch accessibility, preserving private learning history). Those safeguards remain in force.

## Product goals

1. Let a returning user open Freequiz, tap once, and see the first question immediately.
2. Make profile selection obvious without navigating to another screen.
3. Make progress understandable at a glance without a paragraph of explanatory text.
4. Keep exams prominent enough to find, but clearly secondary to everyday practice.
5. Make question source meaningful and understandable to ordinary users, especially when selecting authentic professor-written questions.
6. Make the common question-management tasks easy and put specialist tools behind one consistent advanced area.
7. Provide one understandable entry point for all import/export operations without confusing a shareable question bank with a private backup.
8. Reduce visual and navigation clutter while preserving every useful feature and all stored data.

## Proposed information architecture and behavior

### 1. Homepage and one-tap quick study

The homepage should answer, in order: **Which profile am I using? How is my learning going? How do I start?**

- Show all existing profiles in a compact horizontal band near the top, above the primary study action. On phones, the band should scroll horizontally if needed without shrinking profile names into unreadable text. Make the selected profile obvious and provide a clearly labelled add-profile affordance.
- Profile selection changes the active profile using existing profile isolation/persistence rules. Never merge, reset, or mutate one profile's data merely by switching.
- Provide one dominant **Study now** / **Study all questions** action that starts practice immediately from the selected profile. It must not open setup first, require a count choice, or ask the user to confirm ordinary actions.
- Define a predictable default quick-study selection and question order. The proposed default is a randomised practice run from all eligible questions in the active profile, with existing answer shuffling and feedback rules. Use a sensible built-in question count/session limit if the existing session engine requires one; do not make the user choose it first. The user may stop after one, three, or any number of questions.
- If there are no questions, replace the unavailable quick-start action with clear next steps to import questions or create one; do not start an empty session.
- Save each answered question and progress immediately using the existing persistence path. Leaving or closing the app after three questions must not require a “finish session” workflow or discard recorded answers. Do not add an exit confirmation to ordinary practice.
- Retain shortcuts for **Practise in progress** and **Practise deferred** where useful, but keep them visually secondary to the one-tap action. These should use existing mastery/deferred definitions and must not introduce new meanings for those states.
- Keep detailed session configuration available through **Create practice**. It is an optional route for people who want to choose sections, tags/source, count, or other supported criteria.
- Keep **Create exam** as the second major activity. It opens exam setup rather than immediately starting a potentially timed assessment. Preserve existing timed-exam behavior, feedback rules, scoring, and clear submit/exit semantics.
- This resolves the earlier “two homepage buttons” idea as follows: one dominant direct **Study now** action, plus two quieter setup actions **Create practice** and **Create exam**. The setup buttons are optional; the main study action is the one-tap route.

### 2. Compact progress summary

- Replace the lengthy mastery explanation on the homepage with a concise summary using three prominent, consistently ordered categories: **False**, **In progress**, **Known** (or final plain-language equivalents agreed during implementation).
- Use the order requested: False first, In progress second, Known third. Make both each count and its label use the matching semantic colour; use consistent colours across the app.
- Reuse existing domain mastery states without changing the meaning of historical attempts or the scheduling algorithm. Before implementation, document the exact aggregation:
  - **False** should group existing incorrect/needs-work states (Needs work and Weak).
  - **In progress** should group New and Learning for the compact overview, unless inspection/testing shows that “Not started” needs to remain a separately visible count to avoid misleading users.
  - **Known** maps to Known.
- Keep detailed mastery definitions available through an accessible tooltip/help detail or the Progress view, not as a paragraph occupying homepage space. Keep text labels in addition to colours for accessibility.
- Keep detailed charts, accuracy trends, timelines, and per-section breakdowns in Progress rather than crowding the landing view.
- Add a small streak indicator using the existing streak calculation and saved settings. Respect the existing gamification visibility toggle; do not add a large gamification card or celebrations to the quick-start path. Ensure the displayed streak follows the current definition of a qualifying study day.

### 3. Exams as the second activity

- Keep **Create exam** clearly visible but subordinate to **Study now**.
- Use a dedicated, plain-language exam setup view/overlay with only relevant choices, sensible defaults, and a clear start action.
- Preserve supported exam settings and the strict exam flow: no immediate correctness feedback, explicit submission/results, and clear wording for leaving without submitting.
- Do not mix ordinary practice shortcuts with exam setup in a way that makes a user accidentally start a timed exam.

### 4. Question management: simple first, advanced tools when needed

- Keep a single Questions destination/workspace.
- Make the everyday controls immediately visible: general question search, tag filter (including multiselect), and section filter (including multiple sections where supported).
- Keep the existing dedicated searchable tag picker as the only tag-search path. General text search should not become a duplicate tag filter.
- Group these common controls together with consistent labels and behavior. Show a concise active-filter summary and a clear way to reset filters.
- Move less-frequent metadata filters (answer mode, mastery, favourites/deferred, provenance/source, import batch/source, date and other specialist criteria), bulk operations, sorting, and other maintenance tools under one consistently behaving **More filters** / **Advanced tools** disclosure.
- Use a single consistent expand/collapse and multi-select interaction pattern. Do not rely on Ctrl/Command-click native multiselect behavior. On mobile, controls and popovers must fit within the viewport and remain keyboard/touch accessible.
- Keep bulk editing, favourites, deferred state, nested sections, custom groups, all question editor features, import history and other existing capabilities available. This is a hierarchy/placement change, not a feature-removal exercise.
- Preserve the existing section tree and its behavior unless a separate, explicitly documented correction is required. Make selected sections visible in the filter summary and make clearing them straightforward.

### 5. Question source: replace “provenance” with understandable language

- Do not use **provenance** as the primary user-facing label. Use **Question source** or **Where did this question come from?**
- Provide plain-language labels based on recorded metadata, for example:
  - **Professor-written** — only when the user/source metadata explicitly supports that claim.
  - **AI-generated** — the question content was generated by AI.
  - **AI-extracted** — AI extracted an existing question from supplied material.
  - **Imported — source not specified** (or equivalent) — an imported question whose author/source is unknown.
  - Other explicitly recorded sources where supported.
- Never equate “imported” with “written by a professor”; never infer authorship from file name, import batch, wording, or a user's guess.
- The current schema documents only protected AI provenance values. Inspect the import formats, legacy values, question editor, import history and exports before choosing the smallest backward-compatible extension needed to record an explicitly declared source such as professor-written.
- If a general source field/value is added, keep it distinct from editable tags and preserve existing `AI-Generated` / `AI-Extracted` records on old and new imports. Existing question banks and backups without the new optional field must remain valid.
- Let users set or correct the source when editing/importing a question, where appropriate. Do not silently relabel existing questions.
- Include **Question source** as an advanced filter that supports multiselect, and show a compact source label in question-management/detail views. Keep source badges out of the active answering view unless they materially help the learner.
- Test round-trips through question-only exports and full-profile backups, merge imports, editing, and legacy files. A source filter must return only questions with matching explicit metadata.

### 6. Import & export: one entry point, clear operations

- Provide one obvious **Import & export** destination in the secondary navigation.
- Inside it, separate two clear sections:
  - **Import:** add questions to this profile; restore a full profile backup as new profile copy/copies.
  - **Export:** export questions to share; back up this profile; back up all profiles.
- Reuse the existing parsing, validation, export handlers and formats wherever possible. Do not combine question-only exports with full backups.
- Explain the difference in ordinary language at the point of action:
  - **Questions to share** contains question content/needed sections and source metadata, not personal attempts, exam history, favourites, deferred state, or profile settings.
  - **Back up this profile / all profiles** includes private progress and profile data and should not be shared as a question pack.
- Keep imports preview-first, validation-first, and non-destructive by default. Restoring a backup must retain its existing restore-as-new-profile semantics. Preserve collision handling and all current safety warnings.
- Remove the current scattered/duplicated import/export buttons from unrelated menus once the consolidated destination is discoverable, without removing any operation.
- Include clear success/failure states and counts; ensure the entry point is reachable on phones and desktop.

### 7. Navigation, menus, and settings

- Reorganise the primary navigation so only **one primary navigation bar is visible at a time**. Responsive placement may differ between phone and desktop, but do not show competing top and bottom navigation bars simultaneously.
- Keep core destinations clear and stable, likely Study, Questions, Progress, and More. Confirm against the current navigation code before finalising implementation; all existing destinations must remain reachable.
- Put Import & export, settings, help, import history, and specialist tools under one consistent **More** destination, grouped with plain-language section headings.
- Move accent selection and light/dark appearance out of the main navigation/top bar and into Settings. Preserve the four accent presets, theme persistence, keyboard access, and selected accent across both appearance modes.
- Ensure the selected profile is always clear in the study context and when switching between destinations.
- Use consistent menu behavior, terminology, spacing, focus handling, keyboard dismissal, mobile viewport constraints and safe-area handling. Avoid three separate menus that expand/collapse differently.
- Do not add new top-level navigation destinations merely to expose every advanced feature.

## Non-negotiable safeguards

- No existing questions, profiles, sections, attempts, exam results, mastery history, favourites, deferred markers, custom groups, settings, import batches, or source metadata may be silently discarded or changed.
- Do not alter answer checking, question IDs, answer-option IDs, practice scheduling, mastery calculation, exam scoring, or existing import/backup formats except for a separately tested optional source-metadata extension that remains backward compatible.
- Preserve local-first behavior: no account, backend, telemetry, automatic AI API calls, or cloud sync.
- Preserve both question-only export and lossless profile backup semantics; never include private progress in a question pack.
- Maintain current accessibility expectations: keyboard navigation, visible focus, accessible names, readable contrast, labels as well as colours, and touch targets.
- Oliver approved implementation on 2026-10-27. Changes are being developed on a separate branch/PR, with tests and Knowledge Base updates required before merge.

## Implementation phases

### Phase 1 — Baseline and interaction inventory
- Re-check the latest `main` UI, navigation, session engine, profile switcher, mastery aggregation, gamification settings, source metadata and all import/export handlers before coding.
- Capture the current automated test/build baseline and map every existing screen/action to its new location.
- Resolve the compact progress aggregation and one-tap question-selection rules without changing domain behavior unintentionally.

### Phase 2 — Homepage and quick-start flow
- Add the visible profile band and one-tap Study now action.
- Make ordinary practice begin directly at the first question with sensible defaults.
- Keep Create practice and Create exam as optional secondary setup actions.
- Reorganise the progress summary and compact streak display.
- Test empty profiles, one/multiple profiles, profile switching, very small phone widths, long profile names, and interruption after one or three answers.

### Phase 3 — Question workspace simplification
- Promote general search, tags and sections.
- Move specialist filters and maintenance controls under one advanced disclosure.
- Standardise multi-select and disclosure behavior, while retaining filter state and current matching semantics.
- Verify question selection, bulk operations, sorting, and every existing advanced filter remain available.

### Phase 4 — Source terminology and metadata
- Audit all current provenance/source pathways and legacy data.
- Implement plain-language labels and an explicitly recorded professor-written source only if the source can be established by user input or trustworthy metadata.
- If schema extension is needed, add it as an optional backward-compatible field and cover all import/export/editor paths with regression tests.
- Add multiselect Question source filtering and test each source type, including unknown source.

### Phase 5 — Import/export and global navigation
- Consolidate operations in one Import & export destination.
- Simplify the navigation so only one primary bar is visible at a time.
- Move appearance controls to Settings and keep every destination/action accessible.
- Verify full-profile restore, question merge, and exports still use the correct formats and privacy boundaries.

### Phase 6 — Verification and usability testing
- Run the full Vitest suite, TypeScript check, production build, and any relevant data-format regression tests.
- Review the full diff for unintended behavior changes or lost actions.
- Update README/Knowledge Base and the manual tester checklist only after implementation and evidence are available.
- Run manual phone and desktop checks at narrow and wide widths, portrait/landscape, keyboard-only navigation, contrast, offline behavior where possible, and import/export round-trips.
- Repeat an uncoached test with Oliver's dad or another first-time user. The primary task is: open the app, identify/switch profile if needed, tap once, answer three questions, and leave without assistance or lost progress. Record confusion and observed failures; do not count automated tests as proof of usability.

## Acceptance criteria

### Quick study and homepage
- A returning user can open Freequiz and reach the first question with exactly one deliberate tap after app load, without setup, a count choice, a modal, or an onboarding tour.
- The active profile and every available profile are discoverable from the homepage; switching profiles preserves profile isolation.
- Answers/progress persist as each question is answered; leaving after three questions does not lose them or require ending the practice session.
- The default action's label accurately describes its scope. The quick-start selection and question order are documented and predictable.
- Create practice and Create exam remain available, with exam clearly the second-priority action and its setup separate from quick study.

### Progress
- The homepage shows False, In progress, Known in that order with semantic colours, readable labels, and accurate grouped counts based on existing mastery states.
- Detailed definitions remain accessible without occupying the homepage.
- A compact streak uses the existing calculation and respects the user's gamification setting.

### Questions and sources
- General search, tags and sections are easy to find; advanced filters/tools are hidden behind one consistent disclosure but still work.
- Multiselect is consistent, touch-friendly, keyboard-accessible and does not lose existing filter behavior.
- The UI says Question source, not provenance, and explains sources in ordinary language.
- Professor-written status is never guessed; it can only be shown when explicitly recorded. Existing AI provenance remains protected and distinct from tags.
- Legacy question files/backups without any new source field continue to import, and source data survives editing, merging and exporting.

### Navigation and import/export
- Only one primary navigation bar is visible at any viewport width, and all existing destinations remain reachable.
- Appearance controls live in Settings rather than occupying the main bar.
- Import & export is one clear entry point for every existing operation; question sharing and full backups remain distinct and correctly labelled.
- Existing validation, preview, merge, restore-as-new-profile, collision handling and data-safety behavior remain intact.

### Verification
- Automated tests, TypeScript checking and production build pass.
- PR checks and the main-branch deployment are verified before claiming deployment success.
- Manual phone/desktop and uncoached usability checks are reported honestly, including any outstanding limitations.

## Out of scope

- Removing advanced functionality simply to make the UI look smaller.
- Rewriting the question/session data model beyond a minimal backward-compatible source-metadata extension if inspection proves it necessary.
- Changing learning scheduling, mastery rules, answer evaluation, exam scoring, reminder delivery, backup semantics, or local-first privacy architecture.
- Adding cloud accounts/sync, telemetry, advertisements, or automatic AI integrations.
- Treating a successful build as proof that the app is easy to use.
