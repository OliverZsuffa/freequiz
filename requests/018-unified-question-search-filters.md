# Request 018: Unified question search and filters

## Status

**Implemented in [PR #28](https://github.com/OliverZsuffa/freequiz/pull/28); automated checks passed, merge pending.**

This request corrects the interpretation of the Questions workflow in Request 017 and its follow-up. The previous changes rearranged individual controls, but the actual requirement is to unify question search and filtering into one coherent interface, with a deliberate distinction between frequently used controls and advanced controls.

Related work:
- [Request 010: unified question management workspace](010-unified-question-management.md)
- [Request 013: mobile-first UX and safe question sharing](013-mobile-first-ux-plan.md)
- [Request 016: responsive filters and theme fixes](016-responsive-filters-theme-fixes.md)
- [Request 017: one-tap study and simplified UI](017-one-tap-study-ui-overhaul.md)

## Problem

The Questions workspace currently feels like several separate boxes and filter areas placed beside or below each other. The previous search-layout follow-up focused too narrowly on the position of the general search field and individual filters. That does not solve the underlying problem: the search experience needs to work as one unified filter system.

The interface should not expose every possible filter at once, but it must make the most useful filters immediately available. Less frequently used filters and specialist controls should remain available under an advanced disclosure.

## Required design

### 1. One unified search and filter area

- Build one visually coherent search and filtering area in the Questions workspace. It must read as one component, not a collection of unrelated cards, panels, or boxed sections.
- Put the general text search at the top of this area. It searches question content using the existing search behavior.
- Place the common filters directly below it in a compact, consistent layout. Use consistent spacing, labels, control styles, and open/close behavior.
- Do not create separate search workflows for tags, sections, or other metadata. Every selected filter combines with the text search and every other selected filter to update the same question result set.
- Show matching questions in the existing question list below the unified filter area. Do not place the filter controls in separate cards between the search field and results.
- Show active filters clearly and provide a visible way to clear them. Clearing filters must reset the filter state without editing or deleting questions.
- Keep the interface compact on desktop and mobile. On small screens, controls may wrap into rows, but must still look like one integrated filter area.

### 2. Visible by default

The following filters must be available immediately, without opening Advanced:

1. **Tags**: retain searchable tag selection and multi-select.
2. **Sections**: retain the existing section tree, nested sections, and current descendant-section behavior.
3. **Favourites**: allow filtering to favourited questions.
4. **Deferred**: allow filtering to deferred questions.
5. **Question origin**: use plain-language source labels and existing recorded source metadata. Preserve the distinction between AI-Generated and AI-Extracted. Never infer that an imported question was professor-written.
6. **Mastery**: allow filtering by the existing mastery states and meanings.

Keep general text search visible above these six common filters. Use compact controls so these filters remain usable without dominating the page. Do not hide any of these six under Advanced.

### 3. Advanced filters and tools

- All other less frequently used filters belong under one disclosure labelled **Advanced filters** or similarly clear plain language.
- Inspect the current code and preserve every existing additional filter, including answer mode/type, import source or batch, date and other metadata filters, plus sorting and any other filter options that already exist.
- Sorting may be placed in the advanced area if that best fits the existing implementation, but it must remain discoverable and functional.
- Do not confuse filters with actions. Bulk selection, bulk editing, moving sections, tag editing, question creation, import/export and other management actions must remain available in their appropriate locations. Do not move them into the filter area unless the current design already treats them as filter-related tools.
- Keep the advanced disclosure closed by default. Opening it must not reset or change the common filters.
- Advanced and common filters must use the same filtering logic and affect the same result list.

### 4. Consistent filter behavior

- All active filters combine using the existing matching semantics. Inspect and document the current AND/OR behavior for multiple tags and sections before implementation; preserve it unless an existing bug is explicitly identified and separately described.
- Favourites and Deferred must use the existing saved markers, not new or duplicated state.
- Mastery must use the existing mastery calculation. This request changes filter access and layout, not learning state or scheduling.
- Question origin must filter only on explicit recorded source metadata. Preserve legacy records and existing AI provenance values.
- Retain current text-search matching behavior, section descendant options, tag-search behavior, and multi-select support.
- The active-filter summary and Clear filters action must reflect all active common and advanced filters.
- Switching between common and advanced controls must not discard selections or change the result set unexpectedly.
- Ensure keyboard and touch interaction works without relying on Ctrl/Command-click native multiselect behavior.

### 5. Visual and responsive requirements

- Use a single surface or grouping treatment for the unified search and filters. Avoid a separate bordered card for each filter or multiple nested panels.
- Keep labels concise and readable. Controls should be visually aligned and consistent.
- Use compact dropdowns, popovers, chips, or equivalent existing design patterns where appropriate, but do not introduce a new interaction pattern for every filter.
- Selected values and active states must be visible without requiring the user to reopen every control.
- The question list should remain the primary content beneath the filter area.
- On mobile, the filter area must fit within the viewport, avoid horizontal page overflow, keep popovers within the screen, and not push the question list excessively far down.
- Preserve existing theme and accent behavior. Do not introduce a new visual style or change unrelated screens.


## Follow-up: Reusable selector for practice and exams

Oliver clarified that the unified search and filters should be reusable, and that the full question list is too much information for ordinary study workflows. This extends Request 018 beyond the Questions management workspace.

### 6. Reusable question-selection component

- Implement the unified search and filter area as a reusable component, or a small reusable component set, with one shared filtering implementation and state contract.
- Embed it in the homepage Practice and Exam flows so both use the same search, the same six common filters, the same Advanced filters disclosure, and the same matching logic.
- Keep it reusable in the Questions management workspace. Avoid maintaining separate versions of the same filters for practice, exams, and management.
- The component must support distinct presentation modes or configuration for **selection** versus **management**. Reuse behavior and logic, not necessarily the same full screen.
- Inspect the existing architecture before choosing component boundaries. Follow the project's current framework and conventions rather than introducing a new abstraction or dependency without need.

### 7. Selection mode: count first, no question dump

In the homepage Practice and Exam workflows, the default view is for choosing a set of questions, not reading or managing individual questions.

- Show a clear live count of matching questions, such as **100 questions**, updated whenever a filter changes.
- Do not render the full question-by-question list by default in Practice or Exam selection mode.
- Keep the common filters compact and visible. Keep other filters under the same Advanced filters disclosure.
- Provide a clear next action to continue with the matching set. In Practice, continue to choosing the number of questions and then start practice. In Exam, continue to exam settings, including the existing question-count and time-limit options where supported.
- Make it clear when no questions match and prevent starting a session with an empty set.
- If the requested number exceeds the number of matching questions, handle that using clear existing app behavior or a clear validation message. Never silently select questions outside the filters.
- Do not require users to inspect question text just to start a practice session or exam.

### 8. Management mode: question list remains available

- The Questions management workspace still needs a question list because users may need to inspect and edit individual questions.
- Keep the list and its existing management actions in that workspace, below the same reusable filter component.
- Do not remove question-level actions, bulk selection, bulk editing, moving sections, tag editing, question creation, import/export, or other existing management capabilities.
- If useful and straightforward, allow users to deliberately reveal matching questions from selection mode for inspection, but do not make a list the default or block the core practice/exam flow on this optional feature.
- The count shown in selection mode must be the count of distinct questions that actually match the current filters, not the number of rendered rows or an approximate total.

### Additional acceptance criteria

- Practice, Exam, and Questions management share the same reusable filter controls and matching behavior.
- Practice and Exam selection screens show the matching count and do not display the question list by default.
- The next action carries the exact filtered question set into the chosen workflow.
- Filter changes update the count and selected set consistently.
- No results, count changes, and unavailable question counts are handled clearly.
- Existing question management remains capable of displaying and editing individual questions.

## Non-negotiable safeguards

- Do not remove existing filters or question-management capabilities.
- Do not alter question content, IDs, sections, tags, favourites, deferred markers, mastery history, attempts, exam results, or source metadata as a side effect of filtering.
- Do not change answer evaluation, mastery calculation, study scheduling, import/export formats, or profile isolation.
- Preserve local-first behavior and all existing data compatibility.
- Keep filter state changes separate from question editing and bulk actions.
- Do not merge this plan or implement code until Oliver explicitly approves it.

## Implementation plan after approval

### Phase 1: Inspect current implementation
- Inspect the latest `main` after Request 017 and the search-layout follow-up.
- Map all existing search fields, filters, metadata filters, sort controls, bulk actions, and filter-state logic.
- Record the exact current matching semantics for multiple tags, multiple sections, section descendants, favourite/deferred state, mastery, question origin, and text search.
- Identify why the current interface renders as multiple boxes and determine the smallest coherent refactor.

### Phase 2: Refactor into one unified filter component
- Consolidate general text search and all six common filters into one cohesive area.
- Add a single Advanced filters disclosure for all other existing filter controls.
- Keep results, bulk selection and question actions in their current workspace roles below or around the unified filter area.
- Reuse existing filter state and handlers wherever possible rather than introducing duplicate state.

### Phase 3: Interaction and responsive polish
- Standardise control styling, labels, active-state indicators, multi-select behavior and clear-filter behavior.
- Ensure opening Advanced does not reset filters and that clearing filters resets common and advanced filters together.
- Check desktop, narrow mobile widths, keyboard navigation, focus visibility, popover positioning and touch targets.

### Phase 4: Regression tests and verification
- Add or update tests for all six visible common filters, text search, advanced filters, combined filters, clear-all behavior, and persistence of selections while opening or closing Advanced.
- Add regression coverage proving favourites, deferred state, mastery, source metadata, tags, and sections are not modified by filtering.
- Run the full automated test suite, TypeScript checks, and production build.
- Review the rendered interface on mobile and desktop rather than relying on test success alone.
- Update the relevant request and Knowledge Base documentation.
- Open an implementation PR. Do not merge until checks pass and the result has been reviewed.

## Acceptance criteria

- The Questions workspace has one unified search and filter area, not several clunky filter boxes.
- General text search and the six specified common filters are visible immediately.
- Every other existing filter is hidden by default under one Advanced filters disclosure.
- All filters act on the same result list and preserve existing matching behavior.
- Active filters are visible and can all be cleared from one obvious action.
- Existing question management actions and all advanced capabilities remain available.
- The layout is compact, coherent, keyboard accessible, and usable on desktop and mobile.
- Automated tests, TypeScript checks and production build pass, and a manual visual review is completed before merge.


## Implementation report

The approved scope is implemented on the feature branch.

- `src/questionFiltering.ts` owns the shared filtering and sorting logic. Existing matching rules remain: filters of different kinds combine with AND; multiple selected tags and sections combine with OR within their own filter; section descendant matching follows the existing toggle; the recorded origin filter relies only on explicit source/provenance fields.
- `src/components/QuestionFilters.tsx` is the shared filter UI used by the Questions workspace and the home Practice/Exam setup. General search and Tags, Sections, Favourites, Deferred, Question origin, and Mastery are visible by default. The remaining metadata filters and sorting are in one closed-by-default Advanced filters disclosure.
- The Questions workspace retains its question list, bulk actions, editing, and export. Practice and Exam setup show a live matching count instead of listing every question.
- Session setup intersects the shared filtered result with the existing question-set scope. It never selects questions outside the current filters. The requested count is adjusted to fit the available set when setup opens and validated if subsequent filter changes leave too few matches.
- Regression tests cover common filters, shared selection-mode behavior, live counts, no question list in setup, over-count validation, active filter summaries, and clearing common and advanced filters together.

The final implementation checkpoint passed 77 automated tests, TypeScript checking, and the production build in [GitHub Actions run 40512265312](https://github.com/OliverZsuffa/freequiz/actions/runs/40512265312). Pages configuration and artifact upload also passed. Real-device visual review remains a separate follow-up and is not claimed as completed.
