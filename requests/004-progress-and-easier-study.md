# Request 004: Progress insights and easier study setup

## Status
Drafted on 2026-10-23. Awaiting explicit user approval. Documentation/planning only; do not change application code until approved.

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

## 4. Data and privacy constraints
- Keep all data client-side; no backend, telemetry, or automatic AI API calls.
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
- Tests cover trend aggregation, sparse/empty data, date boundaries, overlapping section selection, nested sections, and session filtering.
- Production build, automated tests, and GitHub Pages deployment pass.
- Do not implement until the user explicitly approves this request and implementation plan.
