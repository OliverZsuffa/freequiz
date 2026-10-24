# Request 010 — Unified question workspace, tutorial, feedback and dashboard

**Status:** Proposed plan; awaiting Oliver's approval. No implementation changes before approval.

## Goals
- Combine question search, filtering, selection and actions in one workspace.
- Add bug reports and feature requests via GitHub Issues.
- Teach the main workflow interactively and provide deeper walkthroughs for complex features.
- Bring activity graphs and the GitHub-style activity calendar to the home page.
- Replace arbitrary milestones with fixed and question-bank-relative learning goals.

## Constraints
- Preserve existing question banks, profiles, section hierarchy, tags, favourites, deferred status, provenance, settings and attempt history.
- Keep Freequiz client-side and offline-capable. No required backend, telemetry, or AI API.
- Design for mobile as well as desktop.
- Keep actions accessible without scrolling through the entire question list.
- Work in stages with tests and reviewable pull requests. Do not start implementation until approval.

## Stage 0 — Finish outstanding AI section-reference fix separately
Verify PR #7 and its CI. Correct any failing test expectations, merge only when checks pass, then verify the main-branch workflow/deployment. Keep this fix separate from Request 010.

## Stage 1 — Unified Questions workspace

### Behaviour
- Replace the separate study section-selection and tag-search experiences with one central Questions page.
- Search question text, choices, explanations, tags, and section names/paths.
- Combine filters for section (including descendants), multi-select tags, mastery/progress, favourites, deferred status, and provenance.
- Show active filters, a clear-all option, result counts, and useful empty states.
- Select individual questions, visible results, or all matching results. Clearly distinguish current-page selection from all filtered matches.
- Use pagination or bounded incremental loading rather than an unbounded list. Keep filters and actions accessible with a sticky or equivalent toolbar, especially on mobile.
- Provide per-question actions and bulk actions for supported metadata: add/remove tags, favourite/unfavourite, move/assign section, and other safe edits already supported by the data model.
- Provide Practise selected and Create exam from selection. If nothing is selected, allow starting from the current filtered result set after showing the question count.
- Make selection scope explicit when navigating to practice/exam setup; never silently change which questions are included.
- Keep create/edit, import/export and AI prompt tools reachable without duplicating search/filter implementations.
- Preserve section hierarchy; assigning questions must not duplicate or delete section definitions.
- Ensure keyboard focus and assistive-technology labels communicate selection and available actions.

### Acceptance criteria
- Search and filters work together in one place.
- Users can select a set and practise it, create an exam, or bulk-edit supported metadata.
- Actions remain accessible without scrolling to the bottom of a long list.
- Selection scope/count is clear, and large lists remain responsive on mobile and desktop.
- Opening or searching the library does not mutate questions or study history.
- Tests cover filter combinations, selection scope, paging/loading, bulk edits, and practice/exam handoff.

## Stage 2 — GitHub feedback
- Add Feedback in the main navigation and Help/Settings.
- Offer Report a bug, Suggest a feature, and General feedback.
- Link to suitable GitHub issue forms/templates or prefilled issue URLs. The user must review and submit on GitHub; Freequiz must not claim to have submitted a report automatically.
- Include useful fields such as expected/actual behaviour, reproduction steps, browser/device and optional app version.
- Do not attach question content, exported banks, or personal progress automatically. Explain GitHub sign-in may be required and provide an issue-tracker fallback.
- No backend or telemetry.

## Stage 3 — Tutorial and feature guide
- Add a persistent Help/Tutorial entry.
- Provide a searchable or categorised guide covering profiles/sections, creating and editing questions, tags/filters, import/merge/replace, export/backup, practice, exams, favourites, deferred questions, bulk actions, progress, AI prompts and offline use.
- Each topic explains what a feature does, when to use it, and the steps to use it.
- Add an interactive first-run walkthrough for the main workflow: find/import questions → filter/select → practise → review results/progress.
- Use additional guided walkthroughs for features that are difficult to understand. Where practical, walkthroughs should guide users through the real interface and actual steps.
- Let users skip, resume, replay and reopen tutorials. Do not repeatedly interrupt experienced users.
- Store tutorial progress locally using existing storage conventions; no account/backend required.
- Walkthroughs must not perform destructive actions or modify questions without explicit user action. Dismissal or a missing target must never trap users.

## Stage 4 — Home dashboard and learning goals

### Dashboard
- Keep primary study actions near the top.
- Show the daily activity graph and GitHub-style activity calendar directly on the home page.
- Include meaningful summaries where data exists: questions answered, mastery, recent activity, course/section coverage and daily/weekly target progress.
- Use only real locally recorded activity. For missing history, show an honest empty/limited state rather than invented values.
- Keep the dashboard compact and responsive; users should not have to scroll past a large dashboard to study.

### Goals and milestones
- Support both fixed targets (e.g. a chosen number of mastered questions) and relative targets based on section/course bank size (e.g. a chosen percentage mastered).
- Prioritise questions answered, questions mastered and coverage by section/course. Streaks/activity are secondary engagement metrics, not proof of mastery.
- Explain denominators and how imports/removals affect relative goals.
- Replace arbitrary milestones unrelated to question counts or learning progress.
- Goals are optional; do not enable notifications without consent.

### Acceptance criteria
- Activity graph and calendar are visible on the home page.
- Counts derive from real stored data and are consistent.
- Both fixed and bank-relative targets are available.
- Activity, mastery and coverage are clearly distinguished.
- New-profile and missing-history states work cleanly.

## Stage 5 — Verification and release
- Add/update unit and component tests for behaviour and calculations.
- Run full tests, TypeScript checks and production build.
- Check desktop/mobile layouts, sticky actions, filters, selection, tutorial overlays and dashboard density.
- Re-test import/export, practice/exam timing, deferred questions, favourites, provenance, offline shell and saved history.
- Review security/dependency warnings without unrelated forced upgrades.
- Merge to main only after checks pass; verify main-branch deployment and live app where possible. Report any manual checks that could not be performed.

## Suggested order
1. Finish PR #7 separately.
2. Implement the unified Questions workspace and tests.
3. Add GitHub feedback paths.
4. Build the tutorial framework, main walkthrough and feature guides.
5. Redesign the dashboard and add fixed/relative goals.
6. Run regression checks, merge and verify deployment.

## Approval checkpoint
No Request 010 feature coding begins until Oliver approves this plan. After approval, work on dedicated implementation branch(es) and keep changes reviewable in pull requests.
