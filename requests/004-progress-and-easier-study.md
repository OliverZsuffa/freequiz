# Request 004: Progress insights and easier study setup

## Status
Implemented and merged via PR #3 on 2026-10-23. Automated tests, TypeScript check, production build, and Pages artifact upload passed on the PR head. Main-branch deployment verification is pending.

## Goal
Make Freequiz feel more motivating and easier to use without adding visual clutter. Show whether the learner is improving over time and let them start a focused practice session from several sections with minimal effort.

## 1. Meaningful progress visualisation
- Add a clear progress-over-time chart to Statistics, with a compact summary on the Study home screen when there is enough data.
- Show practice accuracy over time, grouped by day when activity is frequent and by week when a longer range makes that clearer. Include the number of answers behind each point and avoid implying improvement from very sparse data.
- Show a second trend for questions currently mastered over time, reconstructed from timestamped practice attempts and the question bank. Clearly label the metric and handle removed questions consistently.
- Provide useful ranges such as 7 days, 30 days, and all time, with accessible labels and a clear empty state for new users.
- Keep practice and exam results separate by default; optionally show exam performance as its own series rather than mixing it with practice.
- Add a concise human-readable insight, such as recent accuracy versus the previous comparable period, only when there is enough data to make the comparison meaningful.
- Use responsive, accessible charts that work on mobile and in light/dark themes. Avoid a charting dependency if a small SVG implementation is sufficient.

## 2. Easier study setup
- Replace the current crowded setup grid with a clearer progressive flow: choose what to study, choose practice or exam, choose question count and any relevant options, then start.
- Allow selecting multiple sections for one practice session.
- Present sections as a searchable, hierarchical checklist. Selecting a parent includes its descendants; selecting a child includes that child and its descendants. Selecting overlapping parent/child entries must not duplicate questions.
- Show selected sections as compact chips and an accurate available-question count. Provide clear select-all and clear-selection actions.
- Preserve existing sources such as all questions, unsorted questions, favourites, and custom groups. Make it clear how these combine with section selections rather than silently changing their meaning.
- Keep answer-mode filters and question count available but visually secondary. Show the exam time limit only for exam mode.
- Ensure shortcuts such as Due for review and Needs practice respect the selected sections and answer-mode filter, and explain when the chosen filters produce no questions.
- Fix any mismatch between the displayed available count and the actual questions sampled into a session.

## 3. Stronger study-first home
- Give the user one obvious primary action and a compact view of what needs attention.
- Surface a small progress summary and a useful next action without overwhelming new users with empty graphs or statistics.
- Keep the question library, import/export, detailed statistics, timeline, and theme settings accessible through the existing compact menu.
- Improve labels, spacing, focus states, and mobile layout; do not add decorative content that does not help users study.

## 4. Simpler AI prompt generator
- Remove the current requirement to upload or paste source material into Freequiz when generating an AI prompt.
- Generate only a reusable instruction prompt that tells an external AI how to turn the material the user supplies into useful quiz questions.
- The copied prompt must explicitly tell the AI to wait for and use the document/text the user attaches or pastes into that AI conversation; Freequiz itself should not collect the source material for this workflow.
- Explain the expected question structure and supported answer modes (`single`, `exactly-n`, and `select-all`), including variable option counts, correct-answer identification, and explanations where appropriate.
- Keep the workflow local and copy-friendly: generate the prompt, copy it, then attach/paste source material in the external AI. No AI API calls and no source-material upload/paste field in this prompt-generator flow.

## 5. Optional, configurable gamification
- Treat all motivational/gamified elements as optional, not just notifications. A learner should be able to use Freequiz as a clean study tool without milestones, rewards, streaks, or goal pressure.
- Add a Gamification settings area with a master enable/disable switch and independent controls for each feature, so users can hide individual elements without disabling everything else.
- Potential independently configurable elements include the activity calendar/heatmap, streaks, milestones and achievements, weekly goals, celebratory effects, and motivational session highlights. Keep ordinary learning statistics, the accuracy graph, and factual session results available regardless of these settings.
- Add a compact activity calendar/heatmap showing when the learner practised, based on meaningful activity and existing timestamps. Avoid punishment for missed days.
- Add learning-focused session highlights that report meaningful outcomes, such as questions strengthened or first-time mastery, only where existing data supports the claim. Do not reward raw volume alone or claim improvement from tiny samples.
- Keep enabled features understated: no energy systems, leaderboards, noisy animations, or guilt-based messages. All settings must be reversible and must not delete study history when switched off.

## 6. Optional notifications
- Build a customizable reminder settings area. Users can turn all reminders off or configure each reminder type independently.
- Support schedules such as daily, weekly, or selected days of the week, with a user-chosen local time.
- Support an optional weekly study target, such as a number of questions answered or number of study days. A target must be optional and editable.
- Support goal-aware reminders: on the user's selected reminder days, notify only when progress indicates they are behind a reasonable pace toward the weekly target; stop when the target is met. Explain the pacing rule in the UI.
- Keep the reminder schedule and weekly target independent, so users can have reminders without a target or a target with only occasional reminders.
- Due-review reminders may be offered only if the current review logic can reliably identify due questions.
- Notifications must be disabled by default, requested only after the user explicitly enables them, and easy to turn off or pause. Each reminder type must be individually configurable.
- Respect browser/OS permission rules and explain that delivery may depend on browser support, installed-PWA status, and whether the app/browser is allowed to run in the background.
- Do not add a backend or telemetry. Be explicit about the limits of client-side scheduling; if reliable background delivery is not feasible for the current PWA, implement only reminders that can honestly be supported and document the limitation rather than implying guaranteed delivery.
- No streak warnings, repeated nags, or milestone spam.

## 7. Data and privacy constraints
- Keep all data client-side; no backend, telemetry, or automatic AI API calls. The prompt generator must not require the source material to be entered into Freequiz.
- Use existing timestamped practice attempts and exam records. Do not fabricate historical values or imply that imported questions have a practice history.
- Preserve profiles, question banks, favourites, custom groups, JSON exports, and offline PWA behaviour.
- Keep exam results separate from practice mastery and clearly communicate any limitations caused by sparse or deleted historical data.

## Acceptance criteria
- Statistics shows a useful accuracy-over-time chart with date range controls and a sensible empty state.
- Progress can be compared across time periods without mixing exams into practice accuracy.
- The Study home screen remains calm and uncluttered while making progress visible when data exists.
- A learner can choose multiple sections in one practice session.
- Parent/child section selection follows documented descendant semantics and never duplicates questions.
- Available counts, Due for review, Needs practice, answer-mode filters, and sampled sessions use the same filtered question set.
- Mobile and desktop layouts remain usable in light/dark mode and all four accent presets.
- The AI prompt generator outputs only reusable instructions and does not ask the user to upload or paste source material into Freequiz.
- Every gamified element (including milestones/achievements, streaks, activity heatmap, weekly goals, celebrations, and motivational session highlights) can be toggled off independently; a master switch can disable all gamification. Ordinary progress charts and factual results remain available.
- The activity calendar and session summaries use grounded existing study data and avoid inflated or unsupported claims.
- Notifications are opt-in, off by default, individually configurable, and accurately documented for supported browsers. Daily/weekly schedules, local time, optional weekly targets, and goal-aware reminder behaviour must be covered by tests.
- Tests cover trend aggregation, sparse/empty data, date boundaries, overlapping section selection, nested sections, and session filtering.
- Production build, automated tests, and GitHub Pages deployment pass.
- Implementation was approved by the user and merged after the PR checks passed. Verify the main-branch deployment before treating the request as fully released.
