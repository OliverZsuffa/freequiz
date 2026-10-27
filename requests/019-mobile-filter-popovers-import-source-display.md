# Request 019: Fix mobile question filters and import-source display

**Status:** Implemented and merged in PRs [#30](https://github.com/OliverZsuffa/freequiz/pull/30) and [#31](https://github.com/OliverZsuffa/freequiz/pull/31). Automated checks passed; manual visual checks and main-branch deployment verification remain outstanding.

## Goal

Fix three usability bugs in the shared question-filter UI without changing which questions match a filter or redesigning the overall filter layout:

1. On phones, filter option panels open in awkward positions and remain open after a selection.
2. Import-source filenames/options do not render correctly.
3. A search/filter control sticks to the top while scrolling when it should scroll normally.

The same shared filters are used in question management and Practice/Exam setup, so the fixes must work in all three places.

## Investigation and implementation

### 1. Mobile multi-select panels

- Review `MultiSelect.tsx`, the related CSS, and its use in `QuestionFilters.tsx` before changing positioning. The current mobile CSS makes the panel fixed near the bottom of the viewport, which can disconnect it visually from its trigger and interact badly with scrollable dialogs.
- Make the panel appear in a predictable position relative to the selected filter, constrained to the viewport. It must not be clipped by a scrolling parent or cover the main controls unnecessarily.
- On phone-sized viewports, close the panel after a checkbox selection while retaining the changed selection. The user can reopen it to select another value. Keep multi-select behavior on desktop so several options can be chosen without repeatedly reopening the panel.
- Ensure the panel closes when the user taps outside it or presses Escape. Keep the trigger's expanded state accurate and ensure the controls remain keyboard-accessible.
- Preserve Clear behavior and all existing AND/OR and filtering semantics. Do not clear the user's selection merely because the panel closes.
- Avoid adding a new dependency.

### 2. Import-source filenames

- Trace the full path from import parsing and saved `ImportBatch` metadata through the import-source options and filter matching. Check both `sourceFileName` and the existing batch name/source-identity fallbacks; do not fabricate filenames for legacy data that never stored them.
- Identify why the option text currently fails to render rather than masking the problem with more CSS alone.
- Render available source labels legibly, including long filenames: allow wrapping or safe truncation with a way to inspect the full label, and prevent the options panel from clipping text.
- Keep the source picker searchable and make empty states clear when there are no recorded imports or no search matches.
- Confirm selecting an import source filters the intended questions, including questions with older or incomplete source metadata.

### 3. Unwanted sticky search/filter control

- Inspect the actual rendered component hierarchy and all relevant sticky/fixed CSS rules to identify which element sticks during scrolling. Do not assume the existing `.library-toolbar` rule is responsible until confirmed; it was not found in the current component markup during the initial investigation.
- Remove sticky positioning from the search/filter element that is incorrectly pinned. Preserve genuinely intentional navigation or selection controls unless testing shows they are the source of this bug.
- Check desktop and mobile separately, including scrolling inside the Practice/Exam setup dialog and the Questions workspace.

## Tests

Add or update regression tests for:

- A mobile multi-select closing after a choice while retaining the selected value; reopening shows that value still selected.
- Desktop multi-select remaining open for successive choices.
- Outside-click and Escape dismissal, plus correct `aria-expanded` state.
- Import-source labels with normal, long, missing, and legacy filename metadata; empty import history and no search matches.
- Import-source filtering still returns the correct questions.
- Existing filter behavior and Practice/Exam filtered counts remain unchanged.

Use component tests for behavior and existing project tests for filtering/data behavior. Automated tests cannot reliably prove viewport placement, so include manual visual checks.

## Verification and acceptance criteria

- Run the full test suite, TypeScript check, and production build.
- Review the complete diff and check for regressions in both filter modes.
- Manually inspect phone-sized and desktop layouts: open filters near the top and bottom of the screen, scroll the page/dialog, select and clear options, and verify filenames remain readable.
- Verify the search/filter control scrolls away normally and that unrelated navigation still behaves as before.
- Check the deployed GitHub Pages build after merge; distinguish automated checks from manual device checks and report any checks that could not be performed.

## Scope limits

- No changes to question data, import/export formats, filter logic, default visible filters, or the overall unified-filter design unless investigation proves a narrowly scoped compatibility fix is necessary.
- No unrelated UI cleanup or new dependencies.
- Oliver approved implementation on 2026-10-27. Core changes and the theme-inheritance follow-up are merged in PRs #30 and #31. PR workflow runs 40519486548 and 40519918829 passed 84 tests, TypeScript checking, production build, Pages configuration, and artifact upload. Manual phone/desktop checks and the main-branch deployment were not independently verified.
