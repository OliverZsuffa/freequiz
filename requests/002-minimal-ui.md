# Request 002: Minimal, calm Freequiz UI

## Status
Proposed. Awaiting explicit approval before implementation.

## Goal
Redesign Freequiz so it feels calm, minimal, and easy to scan while retaining its rich feature set. The user explicitly prefers feature-rich apps whose interfaces look minimal, without sensory overload.

## Problems observed in the current implementation
- The overview shows four statistic cards, two large panels, a section-card grid, welcome illustration/copy, and multiple calls to action at once.
- The sidebar, topbar, and dashboard repeat routes and actions, including question adding/import and progress destinations.
- Many surfaces use separate borders, tinted backgrounds, icons, labels, pills, and helper text, creating too many competing visual elements.
- Small typography and dense metadata make the app feel busier rather than simpler.
- On mobile, navigation becomes a crowded horizontal row and several labels/icons disappear.
- The section tree, question library, import assistant, and practice screen need a more consistent hierarchy and spacing system.

## Non-negotiable constraints
- Preserve all existing functionality and the client-side-only/privacy-first architecture.
- Do not add analytics, accounts, backend services, or automatic AI API calls.
- Keep dark and light appearance modes and the existing green accent identity, but make both calmer and more legible.
- Do not replace useful controls with oversized generic buttons or hide essential actions behind unclear icons.
- Responsive design must work on phone and desktop, with keyboard accessibility and reduced-motion support.
- Follow the project workflow: plan first, wait for approval, then implement and verify. Update the Knowledge Base after implementation.

## Intended result
A clean study workspace with one clear primary action per view, restrained use of cards and colour, readable typography, consistent spacing, and secondary tools revealed only when useful. The app should feel deliberately designed, not stripped down or empty.
