# Request 016: Responsive filters, mobile menus, and theme consistency

## Status
**Plan proposed — awaiting explicit approval. No application code changes are authorized yet.**

## Goal
Fix the reported desktop and phone UI regressions without removing existing features or introducing a broad redesign. Keep the interface minimal, readable, and consistent with the selected accent colour in both appearance modes.

## Scope and approach

### 1. Filter layout: desktop and mobile
- Inspect the actual filter component, CSS breakpoints, and current Request 014 implementation before editing.
- Preserve the working mobile ordering, but redesign the desktop arrangement so controls have a clear hierarchy, consistent widths, readable labels, and sensible grouping instead of a cramped or visually awkward sequence.
- Keep tag search first, provenance and other metadata filters next, and general search last where that remains appropriate to the control layout.
- Verify normal desktop width and a narrower resized desktop window, as well as phone portrait and landscape.
- Do not remove filters, multi-select behavior, selected values, sorting, or clear/remove actions.

### 2. Import-source picker on phones
- Reproduce and trace why the import-source picker becomes oversized while its text is invisible.
- Fix the underlying mobile sizing, overflow, foreground/background contrast, and selected-chip/label styling rather than applying a broad global CSS override.
- Long source names must wrap or truncate legibly, with a usable way to inspect/remove selected values. The picker must remain scrollable and inside the viewport.

### 3. More menu on phones
- Re-inspect the current menu structure, positioning, stacking contexts, available height, scrolling, and bottom-navigation/safe-area interactions; the previous fix did not resolve the user's real-device issue.
- Correct the root cause so the menu opens in the visible viewport, every item can be reached, text is readable, and items are not covered by the navigation or browser chrome.
- Check dismissal, keyboard/focus behavior, and all existing actions. Avoid broad overlay CSS changes that could break other popovers or dialogs.

### 4. Remove duplicate tag-search paths
- Keep the dedicated tag selector with its searchable list, tag favourites, and multi-select behavior as the single way to search/select tags.
- Adjust the general text search so it no longer acts as a second tag-search interface, while retaining its useful search over question text, answer options, explanations, section paths, and other intended non-tag fields.
- Add regression tests proving that tag filtering is controlled by the dedicated tag selector and general text search does not independently match a question solely because of its tag. Confirm other general-search fields still work.

### 5. Accent colour must survive light/dark switching
- Trace the Start practice button and other accent-dependent buttons to identify hard-coded legacy green styling or theme-specific overrides.
- Make accent-driven actions use the selected persisted accent token in both light and dark modes. Keep semantic status colours (correct/incorrect, mastery, warnings) distinct where those colours carry meaning.
- Verify all four presets (blue, purple, orange, green) in both appearance modes, including after switching modes and reloading.

### 6. Make light/dark toggle visible on phones
- Put the appearance toggle next to the accent-colour control in a compact, visible appearance-control group on mobile, instead of leaving it inaccessible/hidden in the current phone layout.
- Preserve desktop usability and existing persistence. The toggle must remain clearly labelled or accessibly named, show the current state, and be reachable by touch and keyboard.
- Keep this compact to avoid cluttering the study-first screen; do not duplicate the toggle in multiple competing locations unless inspection shows a genuine need.

## Tests and verification
1. Inspect relevant components, styles, theme tokens, existing tests, Request 014, and the Knowledge Base before implementation.
2. Add regression tests for general-search/tag-search separation, accent token selection across themes, and any component behavior that can be reliably tested in Vitest/Testing Library.
3. Run the full Vitest suite, TypeScript check, and production build.
4. Review the complete diff for unintended changes to filters, imports, theme persistence, study flows, or unrelated overlays.
5. Open a separate implementation PR only after approval. Merge only if relevant checks pass, then verify the main-branch GitHub Pages deployment.
6. Real phone/desktop viewport checks are still required to prove the visual defects are fixed. If no real browser/device is available in the execution environment, explicitly report those checks as not performed rather than claiming visual success.

## Acceptance criteria
- Desktop filters are clearly arranged and readable; the current good mobile order remains intact.
- On phones, import-source labels and selections are visible and the picker is sized/scrollable correctly.
- The More menu is fully reachable and visible on phones without clipping, overlap, or hidden text.
- Tag search/favourites use one dedicated selector; general text search no longer duplicates tag lookup.
- Selecting blue (or another accent) yields the same intended accent identity in light and dark modes, including Start practice and other accent-driven buttons.
- The light/dark toggle is visibly available beside accent selection on phones.
- Automated checks pass and the deployed build is verified; visual/manual checks are reported honestly.

## Out of scope
- A general redesign of the app or implementation of all of Request 013.
- Removing existing filters or features to make the layout simpler.
- Changing question data, import/export formats, answer checking, study progress, or persistence contracts.
- Broad global CSS changes without evidence of the cause.
- Dependency upgrades unrelated to these UI defects.
