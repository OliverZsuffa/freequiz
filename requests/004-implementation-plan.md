# Request 004 implementation plan

## Status
Awaiting explicit user approval. Planning only; no application code changes are authorised yet.

## Design decisions
- Primary chart: practice accuracy over time, based only on practice attempts.
- Secondary chart/metric: questions mastered over time, calculated from timestamped attempts rather than invented session scores.
- Exams remain a separate series and separate statistic.
- Use native responsive SVG/chart markup unless repository inspection shows a compelling reason to add a dependency.
- Multi-section selection is additive: each checked section includes itself and descendants; the final question set is deduplicated by stable question ID.
- Keep the home screen concise. Put full chart controls and deeper breakdowns in Statistics.
- The AI prompt generator outputs a reusable instruction preamble only; source material is supplied directly to the external AI by the user, not entered into Freequiz.
- Gamification stays subtle and learning-focused: an activity heatmap and evidence-based session summary, not streak pressure or rewards for raw volume.
- Notifications are opt-in and off by default, with independently configurable schedules and optional weekly targets; do not promise reliable background delivery unless the current PWA/browser architecture actually supports it.

## Phase 0: Inspect and baseline
1. Review current overview/setup, timeline/statistics, domain types, styles, tests, storage and service worker.
2. Confirm the exact semantics of mastery and how attempts for deleted questions should be handled in historical trends.
3. Add focused tests before refactoring; capture the existing passing build as baseline.

## Phase 1: Build pure progress-data helpers
1. Add tested helpers to group practice attempts by local calendar day/week, including correct count, total count, and accuracy.
2. Add range filtering for 7 days, 30 days, and all time, with explicit handling of empty periods and sparse samples.
3. Reconstruct the number of mastered questions at each historical point using attempt prefixes and the current profile's question IDs; document that removed questions are excluded.
4. Keep exam aggregation separate and add comparison insights only above a defensible minimum sample threshold.
5. Add tests for timezone/date boundaries, ordering, empty data, repeated attempts, and sparse history.

## Phase 2: Add visual progress
1. Add a responsive, accessible accuracy trend chart with visible axes/date labels, point details, sample counts and range controls.
2. Add a compact mastered-questions trend or summary.
3. Add a home-screen progress snapshot only when there is meaningful history; provide a friendly new-user state otherwise.
4. Respect light/dark themes and all accent presets, including narrow screens and reduced motion.
5. Avoid unnecessary dependencies; ensure chart values remain understandable without colour alone.

## Phase 3: Multi-section session selection
1. Replace the single section source value with a selection model that supports multiple section IDs while preserving existing special sources.
2. Implement a shared pure helper for filtering questions by selected sections, descendants, answer mode, and review mode.
3. Render a searchable tree checklist with select-all/clear actions and selected-section chips.
4. Deduplicate questions when parent and child sections overlap.
5. Ensure Due for review, Needs practice, New, Known, count limits, and the displayed available count all operate on the same filtered pool.
6. Add tests for parent/child combinations, empty selection, unsorted questions, mixed sources, custom groups/favourites, answer-mode filters and count limits.

## Phase 4: Make setup easier
1. Restructure setup into a small number of clear steps without a full-screen wizard unless usability testing shows it is needed.
2. Make source/sections the first decision; reveal exam duration only for exams and keep less-used filters secondary.
3. Improve empty states, clear-selection behaviour, keyboard navigation, focus visibility, and responsive layout.
4. Preserve the existing primary Study action and compact menu for secondary features.

## Phase 5: Simplify the AI prompt generator
1. Inspect the existing prompt-generator UI and output format.
2. Remove the source-document upload/paste inputs and any prompt-generation logic that depends on source content.
3. Generate a clear reusable instruction preamble explaining the AI's task, desired question quality, supported answer modes (`single`, `exactly-n`, `select-all`), variable option counts, correct-answer format, and explanations.
4. Make the next step explicit: copy the prompt, then attach the document or paste the source text into the external AI conversation.
5. Add tests confirming prompt generation works without source content and does not embed source text or call an AI API.

## Phase 6: Add light gamification
1. Add a compact activity heatmap using existing timestamped study attempts, with clear accessible labels and responsive layout.
2. Add a restrained session wrap-up that reports only supported outcomes and links to the next useful study action.
3. Avoid guilt-based streaks, leaderboards, energy systems, distracting animations, and unsupported mastery/improvement claims.
4. Test empty history, date grouping, and session summaries with sparse and substantial data.

## Phase 7: Assess and implement optional notifications
1. Inspect current PWA/service-worker capabilities and browser support before choosing an implementation; determine what can work without a backend and what requires push infrastructure.
2. Design a reminder settings area with a global off switch, per-type controls, daily/weekly/custom-day schedules, and a user-chosen local time.
3. Add an optional weekly target for questions answered or study days, with a transparent pacing rule for goal-aware reminders.
4. Allow reminders without a goal, goals without frequent reminders, temporary pause, and complete opt-out.
5. Request notification permission only after an explicit user action; implement only delivery behaviour that can be supported honestly and explain limitations.
6. Prevent duplicate or unnecessary reminders, stop goal-aware reminders when the target is met, and avoid guilt-based copy.
7. Test target calculations, week boundaries, schedule settings, permission-denied, unsupported, disabled, and paused states where feasible.

## Phase 8: Validate and release
1. Run tests, TypeScript check, and production build.
2. Add regression tests for existing practice/exam behaviour and section filtering.
3. Verify GitHub Pages deployment and update README/Knowledge Base plus this request's status.
4. Perform a manual desktop, mobile, and offline smoke test if the available environment permits; otherwise state explicitly that it remains outstanding.
5. Do not merge/deploy until checks pass.

## Risks and mitigations
- Accuracy can fluctuate when only a few answers exist. Display sample counts and avoid confident trend summaries on tiny samples.
- Calendar grouping can be confusing across timezones. Use the browser's local calendar consistently and test date boundaries.
- “Known over time” depends on the current question bank. Exclude removed questions from this metric and explain that constraint.
- Multiple sections can overlap. Deduplicate by question ID and use the same filtering helper for counts and sessions.
- Too many setup controls can undermine simplicity. Prioritise sections and start action; tuck secondary filters away.
