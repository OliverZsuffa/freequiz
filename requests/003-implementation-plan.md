# Request 003 Implementation Plan: Study-first Freequiz

## Status
Completed and merged on 2026-10-23 in [PR #1](https://github.com/OliverZsuffa/freequiz/pull/1), merge commit `b881a6821a08cbc8636ad08f003de3ecc58569df`. PR checks passed in [run 40029404119](https://github.com/OliverZsuffa/freequiz/actions/runs/40029404119); the main build and GitHub Pages deployment passed in [run 40029476793](https://github.com/OliverZsuffa/freequiz/actions/runs/40029476793). Manual browser/device/offline smoke testing remains outstanding.

## Product principle
The app should expose the next useful study action, not the whole feature set. The intended loop is: see what needs study → choose source and amount → answer → see results → leave. Keep powerful tools available behind a small labelled menu or within the context where they are needed.

## Phase 0: Inspect current behaviour before editing
- Trace the existing section-selection state from navigation through library filtering and practice question selection.
- Inspect question and attempt types, persistence helpers, profile switching, and all current practice/session flows.
- Map current UI routes/actions to the simplified navigation and identify existing behaviours that must remain reachable.
- Confirm current test and build commands before changing code.
- Do not change implementation until this plan is approved.

## Phase 1: Establish shared source-selection and filtering rules
- Implement or consolidate one tested selector for question sources: all questions, section subtree, favourites, and custom group.
- For a selected section, include questions attached directly to that section plus questions in all descendant sections.
- Use the same source selector for visible question lists, displayed counts, practice setup, and exam setup so these cannot disagree.
- Handle missing section IDs, empty groups, removed questions, and empty source states explicitly.
- Add regression tests for nested trees, direct parent questions, leaf sections, empty sections, and mixed source selection.

## Phase 2: Simplify the study-first shell
- Make the home screen show one primary study action, due/weak/new topic cues, and a restrained progress summary.
- On starting, show a short setup with source/group, question count, and practice/exam mode. Keep sensible defaults and avoid long forms.
- Move import/export, profile management, question-bank tools, and settings into a small labelled menu, while retaining contextual actions such as editing a question from its own view.
- Keep labels visible where needed; never depend on an unexplained icon for a critical action.
- Preserve mobile/desktop usability, keyboard navigation, focus visibility, reduced motion, and light/dark modes.
- Avoid rebuilding screens that already meet these requirements.

## Phase 3: Question editor
- Reuse the current question schema and build a focused editor for prompt, options, one or more correct options, explanation, tags, and section.
- Use a clear edit → save/cancel flow and validate before persistence.
- Keep the question ID stable on edit so attempts and references continue to point to the same question.
- Verify that edits do not invalidate old attempt events. If an option ID is removed or changed, keep historical events safe to display and document how old attempts are interpreted against the edited question.
- Add tests for single- and multiple-correct answers, invalid input, cancel without changes, persistence, and preserving IDs/history.

## Phase 4: Favourites and custom groups
- Extend the profile-local data model with a favourite marker or equivalent stable question reference and named custom groups.
- Favourites should be available as a built-in source without requiring the user to create a group manually.
- Custom groups store question IDs, not copies of question records.
- Add simple management for create/rename/delete group and add/remove questions; prevent duplicate membership.
- Handle question deletion, question bank replacement/import, and profile switching without leaking groups between profiles or leaving confusing broken references.
- Add persistence, import/export compatibility, and regression tests. Existing question-bank JSON should remain valid; new optional fields must be backward compatible.

## Phase 5: Strict timed exam flow
- Add an exam setup using the same source selector and question-count logic as practice, plus a required time limit.
- Randomly select the requested number of eligible questions without duplicates. If fewer questions are available, make the available count explicit before starting.
- During an exam, show question progress, selected answers, remaining time, and a clear submit/finish control. Do not show correctness, answer explanations, mastery colours, or correctness-dependent cues.
- When time reaches zero, submit automatically and prevent further answer changes. Handle manual submission consistently.
- Decide and implement mastery/history semantics before coding: recommended approach is to store a session summary and per-question exam responses separately from ordinary practice attempts, so an exam does not falsely count as repeated immediate practice answers. Results can still contribute to a dedicated exam history and chart. If the existing data model makes this impractical, document the alternative and its impact before implementation.
- Test timer expiry, manual submission, navigation between questions, unanswered questions, multiple-correct answers, source/count constraints, and absence of feedback before submission.
- Use a testable timer abstraction or fake timers; do not rely on real elapsed time in automated tests.

## Phase 6: Results and progress visuals
- Create a dedicated session-completion view for both practice and exam, showing score/accuracy, answered count, and a clear visual progress indicator.
- Add topic/section breakdown and a small trend chart derived from available local history. Label the time range and make sparse-data states honest rather than inventing a trend.
- Keep deeper history/statistics behind a labelled action; do not crowd the home screen with all chart details.
- Include a clear next step such as practising missed questions or the weakest section.
- Use CSS/SVG or existing dependencies where practical; do not add a large chart library unless justified.
- Ensure charts have accessible text equivalents and do not encode correctness using colour alone.
- Test empty history, one session, many sessions, no mistakes, and mixed section results.

## Phase 7: Accent presets
- Add four curated accents: blue, purple, orange, and green.
- Define semantic design tokens for each accent and apply them to both light and dark themes. Keep correct/incorrect, warning, and neutral states semantically distinct from the chosen accent.
- Persist the preset and apply it consistently to controls, focus states, charts, and progress visuals.
- Test preference persistence and representative contrast/readability states. Avoid adding arbitrary user-defined colours in this iteration.

## Phase 8: Verification and release
- Run TypeScript checks, the full unit/component test suite, and production build.
- Add targeted tests for every new domain rule and critical flow, including the section-filter regression.
- Review for data migration/backward compatibility, profile isolation, and import/export compatibility.
- Inspect the actual app at phone and desktop widths, including empty and populated states; perform a browser smoke test for practice, exam, editing, favourites/groups, and theme persistence.
- If possible, test the deployed Pages app and offline shell. Record any checks that could not be performed.
- Update `knowledge/README.md` with the new data model, source-selection rules, exam semantics, known limitations, and actual verification evidence.
- Update this plan's status only after the approved implementation and checks are complete.

## Risks and decisions to preserve
- **Mastery correctness:** exam responses should not silently be treated as repeated ordinary practice attempts. Keep exam history distinct unless a reviewed implementation decision says otherwise.
- **Edited questions:** stable question IDs preserve references, but changed option IDs can make historic answer display ambiguous. Keep history safe and document behaviour.
- **Group references:** custom groups must not duplicate questions or cross profile boundaries.
- **Import compatibility:** older `freequiz/questions-v1` files must continue to import unchanged. New group/favourite metadata should be handled as optional profile data or in an explicitly versioned backup format, not silently inserted into the existing question-bank contract.
- **Visual restraint:** charts and rewards should make progress easier to understand, not add decorative noise or a new wall of cards.
- **Scope control:** this is a substantial feature and UX pass. Preserve existing working features, avoid unrelated refactors, and do not claim a visual or offline check passed unless it was actually run.


## Additional implementation details: answer modes and options

1. **Current-state finding:** the question schema already stores an array of correct option IDs, the importer accepts variable option counts (minimum two), and the practice runner supports multiple selections when a question has multiple correct IDs. However, the manual editor only creates one correct answer, answer mode is inferred rather than explicitly stored, answer options are not randomized, and the option labels/IDs use single-character codes that do not scale reliably beyond 26 options.
2. Add an explicit backwards-compatible answer mode: single answer, exactly N, or select all that apply. For older data without this field, infer single answer for one correct ID and select-all for multiple correct IDs. Never infer exactly-N for legacy data.
3. In exactly-N mode, state the number to select. In select-all mode, do not disclose the number of correct options. Grade by exact set match, so missing or extra selections are incorrect.
4. Shuffle option display order when a question is first presented in a session. Preserve option IDs and text pairings, do not mutate stored canonical option order, and do not reshuffle mid-question. Use this in both practice and exam modes.
5. The editor should support a variable number of choices, with a minimum of two and no arbitrary low cap. Generate option IDs independently from display labels; make labels robust beyond 26 choices.
6. Add answer-mode filters to both the question library and the practice/exam setup. Source counts and selected questions must respect both the source and mode filter.
7. Regression tests must cover all three modes, selection/grading behaviour, stable IDs under shuffling, legacy imports, filtering, and large option counts.
