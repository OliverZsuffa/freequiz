# Request 014: Mobile menu positioning and compact question filters

## Status
**Plan awaiting approval.** No application code has been changed for this request.

## Problem
Recent mobile-first changes improved navigation, but some menus and sorting/filter pop-ups open partly outside the visible viewport. On a phone, opening **More** can leave only the final couple of options visible. Sorting controls can suffer from the same positioning issue.

The More menu also contains an **Import / export** entry that currently leads to a screen with only an import option. The destination label and available actions do not match.

The Questions/library filter area is also visually unbalanced: the tag search occupies a lot of space while provenance and other selectors are squeezed into narrow columns. The result feels cluttered and makes the main search harder to scan.

## Goals
1. Keep menus and pop-ups fully usable on short and tall mobile screens.
2. Give the question filters a clear visual order and consistent sizing.
3. Preserve all existing filtering, sorting, menu options, and keyboard/accessibility behaviour.
4. Make a focused correction without a broad redesign or data/model changes.

## Proposed implementation

### 1. Mobile menu and pop-up positioning
- Inspect the More menu, sort controls, filter selectors, and any shared popover/menu styles to identify the actual positioning cause before changing CSS.
- On mobile, anchor menus to their trigger or use a viewport-aware bottom-sheet/popover pattern that stays inside the visible viewport.
- Constrain menu height to the available viewport space and allow the menu contents to scroll when there are more options than fit.
- Account for the fixed bottom navigation and safe-area inset so menus do not hide behind it.
- Ensure the opening direction/position does not assume that there is always room below the trigger.
- Preserve visible focus, sensible touch targets, dismiss behaviour, and access to every menu option. Avoid global CSS changes that unintentionally alter unrelated dialogs.

### 2. Reorder and simplify question filters
- Put the **tag search/filter first**, since it is the largest and most frequently used control.
- Place provenance and other metadata filters after the tag filter, with enough width for their labels and selected values.
- Put the simpler/general text searches last.
- On narrow screens, use a deliberate single-column or compact stacked layout instead of forcing long labels/selectors into tiny side-by-side columns.
- On wider screens, retain a denser multi-column layout where each control has adequate space.
- Keep multi-select behaviour and all current filter dimensions intact; this is a layout/order change, not a reduction in functionality.

### 3. Make Import / export complete
- Inspect the existing import/export flows and reuse them; do not implement a second export mechanism or change file formats.
- Make both **Import questions** and **Export questions / backup** clearly available from the Import / export destination.
- Keep the distinction between sharing/exporting question content and creating a full-profile backup explicit, so users do not accidentally share private learning progress.
- Preserve the existing import preview, merge/replace safeguards, and current export formats.

### 4. Regression coverage
- Add/adjust tests for menu structure and all menu actions remaining available.
- Add/adjust tests confirming the tag filter precedes provenance/metadata filters and that simpler search fields follow them, if the component structure makes this testable.
- Run the existing test suite, TypeScript checks, and production build.
- Inspect responsive CSS for interactions with the fixed mobile navigation and other overlays. Automated DOM tests cannot fully validate real viewport geometry, so physical-device testing remains a separate final check.

## Acceptance criteria
- The Import / export destination offers both import and export actions, with clear labels for question sharing versus full-profile backup.
- On a short mobile viewport, opening **More** does not leave only the last few options visible; every option can be reached without the menu being clipped.
- Sorting and filter pop-ups stay within the visible viewport and can scroll when necessary.
- Pop-ups do not become inaccessible behind the bottom navigation.
- The tag search appears first in the filter layout; provenance and other metadata controls follow; simpler searches appear last.
- On mobile, tag filtering is prominent without making the other controls cramped or the overall area visually cluttered.
- On desktop/wider layouts, filters remain efficient and readable.
- No filter, sort option, menu item, or existing feature is removed.
- Automated checks pass and the implementation is merged/deployed only after approval.

## Scope exclusions
- No changes to question data, import/export formats, learning progress, or filter semantics. Existing export formats and safety guarantees must be preserved.
- No new filtering features and no full visual redesign.
- No claim of full mobile QA based on automated tests alone.

## Workflow
After approval: implement on a separate feature branch, add regression coverage, run checks, update the Knowledge Base, open a PR for review, and merge/deploy following the existing Freequiz workflow.
