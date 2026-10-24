# Request 006: Simpler UI and consistent blue accent

## Status
Draft for approval. No implementation has started.

## Goal
Make Freequiz feel clear and approachable to someone who just wants to study, not someone interested in technical details. Make the selected accent colour consistent across the whole interface.

## Requested changes

### 1. Simplify the AI prompt screen
- Remove the privacy callout and long explanations that repeat how prompts work.
- Remove the "Prompt automatically includes" checklist and the technical JSON/schema example from the main screen.
- Keep the two understandable choices: **Extract existing questions** and **Generate new questions**.
- Use one short sentence to describe the selected mode.
- Keep the main action clear and prominent. After creating a prompt, show the prompt and a clear **Copy prompt** action.
- Keep importing, validating and exporting available without foregrounding technical details unless the user needs them.
- Do not remove functionality or weaken either prompt's quality rules.

### 2. Make the accent colour consistent
- Make the blue preset the default visual identity: near-black/navy surfaces with blue accents, not green surfaces with a few blue controls.
- Route accent-related UI colours through shared CSS variables, including primary buttons, active navigation/icons, focus outlines, selected answers, progress indicators, links, badges, and interactive card borders.
- Make purple, orange and green presets consistently recolour those same accent surfaces too.
- Keep semantic feedback colours (correct/incorrect answers and warning/error states) distinct where their meaning matters.
- Preserve contrast and accessible focus states in dark and light themes.
- Avoid changing the meaning of mastery/status colours just to match the accent.

## Acceptance criteria
- A first-time user can identify the two AI modes, generate a prompt, and copy it without reading a long technical explanation.
- Technical schema examples and implementation/privacy explanations no longer dominate the import screen.
- With blue selected, accent surfaces and interactive highlights consistently use blue across the app; no leftover green accent remains in those areas.
- Switching accent presets recolours the same UI elements consistently in dark and light themes.
- Existing settings persist, old data remains compatible, and core features continue to work.
- Add or update tests where meaningful, then run tests, TypeScript check, and production build. Verify the GitHub Pages deployment.
- Record any manual browser/mobile checks that were or were not performed.
