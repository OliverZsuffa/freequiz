# Request 006: Simpler site-wide UI and consistent blue accent

## Status
Draft for approval. No implementation has started.

## Goal
Make Freequiz clear and approachable for people who just want to study, not people interested in technical details. Reduce clutter throughout the app and make the selected accent colour consistent across the whole interface.

## Requested changes

### 1. Simplify the whole interface
Review the entire app, not just importing or AI tools. This includes the dashboard, quiz setup and runner, question library and editor, results, progress charts, settings, and AI/import/export tools.

- Put the main task and its primary action first on each screen.
- Remove or shorten repetitive explanations, technical wording, implementation details, and privacy/storage notices that take up space without helping someone complete the current task.
- Prefer plain-language labels and concise helper text. Explain something only where a user needs it to make a decision or avoid a mistake.
- Reduce visual clutter and unnecessary emphasis; keep less-used controls available without letting them dominate the screen.
- Keep flows, labels, spacing, and action hierarchy consistent across screens.
- Preserve important instructions, confirmation steps, accessibility, and useful explanations when they help users act safely or understand results.
- Do not remove features or make existing capabilities harder to discover just to make screens look simpler.

### 2. Simplify the AI prompt and import experience
- Remove the privacy callout and long explanations that repeat how prompts work.
- Remove the "Prompt automatically includes" checklist and technical JSON/schema example from the main workflow.
- Keep the two understandable choices: **Extract existing questions** and **Generate new questions**.
- Use one short sentence to describe the selected mode.
- Keep the main action clear and prominent. After creating a prompt, show the prompt and a clear **Copy prompt** action.
- Keep importing, validating and exporting available without foregrounding technical details unless the user needs them.
- Do not remove functionality or weaken either prompt's quality rules.

### 3. Make the accent colour consistent
- Make the blue preset the default visual identity: near-black/navy surfaces with blue accents, not green surfaces with a few blue controls.
- Route accent-related UI colours through shared CSS variables, including primary buttons, active navigation/icons, focus outlines, selected answers, progress indicators, links, badges, and interactive card borders.
- Make purple, orange and green presets consistently recolour those same accent surfaces too.
- Keep semantic feedback colours (correct/incorrect answers and warning/error states) distinct where their meaning matters.
- Preserve contrast and accessible focus states in dark and light themes.
- Avoid changing the meaning of mastery/status colours just to match the accent.

## Acceptance criteria
- Across the app, screens are easier to scan, use plain language, and prioritise the main task instead of lengthy explanations or technical details.
- Core actions and important instructions remain easy to find; no functionality is removed.
- A first-time user can identify the two AI modes, generate a prompt, and copy it without reading a long technical explanation.
- With blue selected, accent surfaces and interactive highlights consistently use blue across the app; no leftover green accent remains in those areas.
- Switching accent presets recolours the same UI elements consistently in dark and light themes.
- Existing settings persist, old data remains compatible, and core features continue to work.
- Add or update tests where meaningful, then run tests, TypeScript check, and production build. Verify the GitHub Pages deployment.
- Record any manual browser/mobile checks that were or were not performed.
