# Request 002 Implementation Plan: Minimal UI redesign

## Status
Approved and implemented on 2026-10-23. Automated verification is running; see the Knowledge Base for the latest verified result.

## Design direction
Use a quiet, content-first interface. Retain the dark/light theme and lime-green accent, but reduce decorative treatments and competing emphasis. Prefer whitespace, typography, alignment, and subtle dividers over a card for every item.

## Planned changes

### 1. Global layout and visual system
- Establish consistent spacing, type scale, line heights, control heights, border radii, and focus states using CSS variables.
- Reduce decorative gradients/tints, excessive outlines, icon badges, eyebrow labels, and unnecessary helper copy.
- Improve base font sizes and line length for readability without making controls oversized.
- Keep colour meaningful: green for success/primary action, amber for learning, rose for incorrect/needs-work, neutral for new/unseen.
- Ensure both themes meet readable contrast targets and focus indicators remain visible.

### 2. Navigation and actions
- Simplify the desktop sidebar into clear primary navigation, a compact profile switcher, and a collapsible/quiet section list.
- Remove duplicated action emphasis between sidebar, header, and page content. Keep backup accessible but secondary; make add/import actions clear and consistent.
- On mobile, use a deliberate compact navigation pattern with understandable labels and no reliance on icons alone. Avoid hiding key controls solely to save space.
- Make profile and section state visibly clear without heavy boxes.

### 3. Overview dashboard
- Replace the greeting-heavy, multi-card layout with a concise title and one primary “Start practice” action.
- Present mastery as a compact summary/progress visualization rather than four equally prominent statistic cards.
- Show a small set of useful next actions based on the current question bank.
- Make section browsing a restrained list or compact grid, with clear empty states.
- Avoid showing every available metric and explanation simultaneously; details remain available in the relevant views.

### 4. Practice experience
- Give the question and answer choices the strongest visual hierarchy.
- Keep progress and exit actions visible but quiet.
- Make selected, correct, and incorrect states unmistakable without large tinted panels.
- Reduce side-panel clutter, especially on narrow screens; move secondary session stats into a compact progress line or disclosure.
- Preserve multi-select behavior for imported questions and keyboard interaction.

### 5. Library, timeline, and import
- Standardise page headers, search/filter rows, question rows, section lists, empty states, and form layouts.
- Keep common actions visible and move secondary actions into clearly labelled contextual controls.
- Make JSON import stages visually sequential, with a clear preview and explicit merge/replace choice.
- Reduce metadata density while keeping mastery and section information findable.
- Preserve the AI prompt generation workflow and explain clearly that no AI request is made by Freequiz.

### 6. Responsive and accessible behavior
- Check narrow widths, long question text, long section names, zoom, and overflow.
- Add/verify semantic labels, keyboard focus, button names, and state announcements where relevant.
- Respect reduced motion; avoid animation as a substitute for hierarchy.
- Persist the chosen appearance between visits if the existing storage design supports it cleanly.

## Verification plan
- Run TypeScript checks, unit tests, and production build.
- Add or update tests for important navigation and view states if structure changes.
- Inspect the rendered interface at desktop and mobile breakpoints, including empty and populated states.
- Verify all existing actions remain reachable and working.
- Verify Pages deployment and perform a browser smoke test if the live site is available. Report any check that could not be performed; do not imply visual perfection from a successful build alone.

## Out of scope for this request
- New study algorithms or mastery rules.
- New account, sync, backend, analytics, or AI integrations.
- Full backup restoration, full question editing, nested section management, and other functional gaps already listed in Request 001. These should be handled in a separate functional-hardening request unless a UI change requires a minimal adjustment.


## Implementation notes
- Replaced the greeting-led dashboard and four competing metric cards with one primary practice action, a compact mastery summary, three session choices, and a quiet section list.
- Applied a restrained visual system across the existing screens: fewer tinted surfaces and icon badges, more whitespace and subtle dividers, clearer typography, and a consistent green accent.
- Kept the full feature set and navigation. On mobile, navigation labels remain visible; the session choices stack vertically and secondary practice statistics are removed from the narrow layout.
- Persisted the dark/light preference in localStorage without changing the question-data schema or adding services.
- Updated tests for the redesigned overview and theme preference.

## Verification status
Pending GitHub Actions run for the latest commit. Visual inspection in a real browser and confirmation of the deployed Pages build remain separate checks.
