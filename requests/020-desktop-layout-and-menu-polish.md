# Request 020: Desktop layout and menu polish

## Status

Planning only. No application code changes are included in this request. Implementation requires Oliver's explicit approval after reviewing this plan.

## Goal

Polish the desktop experience of Freequiz and fix desktop navigation/menu positioning issues, while preserving the current mobile layout and behaviour.

## Scope

### 1. Fix the desktop More menu

- Investigate the current portal/rendering structure and desktop positioning rules for the More menu.
- Anchor the menu to the visible header/button or use a reliable viewport-based positioning approach so it opens directly below the More button, rather than appearing far down the document.
- Ensure it overlays page content correctly and is not clipped by ancestor containers or hidden behind other UI.
- Keep the menu within the visible viewport, with internal scrolling when necessary.
- Preserve existing menu actions, close behaviour, and navigation behaviour.
- Preserve the existing mobile-specific fixed positioning and sizing rules; do not change mobile menu placement as part of this desktop fix.

### 2. Audit desktop layout across the app

Review the following at wide desktop and narrower desktop widths:

- Sidebar and top header: alignment, content offset, scrolling/sticky behaviour, and navigation placement.
- Study/home: spacing, hierarchy, profile selector, progress summaries, and study actions.
- Questions/library: search, filter grids, toolbars, result lists, and bulk actions.
- Practice/session setup: dialog sizing, filter layout, controls, and overlays.
- Progress/statistics, learning summary, Settings, Import & export, Help, and legal pages: spacing, readable widths, alignment, and overflow.
- Popovers, dropdowns, and dialogs: correct stacking order, viewport fit, and usable controls.

Only fix concrete layout or interaction problems found during the audit. Keep the existing visual identity and avoid an unnecessary redesign.

### 3. Responsive boundaries and mobile protection

- Inspect desktop widths, including the narrow desktop/tablet boundary around the existing 760px breakpoint and intermediate widths where the sidebar and content compete for space.
- Prefer desktop-only CSS rules for desktop visual adjustments.
- If a shared component or JSX change is necessary, preserve its mobile behaviour and add regression coverage.
- Do not intentionally change the current phone layout, bottom navigation, compact Study page, or mobile spacing.
- Review the final diff specifically for unintended edits to mobile media queries and mobile-only components.

## Implementation and validation plan

1. Reproduce and inspect the More-menu positioning issue, then identify the smallest robust fix.
2. Inspect the listed pages at wide and narrower desktop viewport sizes; record concrete issues before changing styles.
3. Implement focused fixes, keeping mobile behaviour unchanged.
4. Add or update automated tests for menu visibility/interaction and any layout-related behaviour that can be tested reliably.
5. Run the project test suite, TypeScript type checking, and production build.
6. Review the diff for scope creep and unintended mobile changes.
7. Manually verify desktop menu placement, scrolling/overflow, dialogs and popovers, and key page layouts at wide and narrower desktop sizes. Recheck mobile menu and Study layout for regressions.
8. Open an implementation pull request summarising the fixes and test results. Do not merge or deploy until Oliver explicitly approves.

## Acceptance criteria

- The More menu opens beside its trigger, immediately below the desktop header/button, rather than below the page content.
- The menu is not clipped or obscured and remains usable in shorter or narrower desktop viewports.
- Existing menu actions continue to work.
- Desktop pages and controls have no obvious clipping, overflow, misalignment, or avoidable spacing issues discovered in the scoped audit.
- Automated tests, type checking, and production build pass.
- The mobile layout and navigation remain visually and functionally unchanged, aside from any explicitly approved shared fix required for correctness.

## Out of scope

- New features or navigation destinations.
- A redesign or new visual theme.
- Changes to study logic, question data, persistence, or imports/exports.
- Mobile layout refinements unrelated to preventing a regression from a shared change.
- Merging implementation changes without explicit approval.
