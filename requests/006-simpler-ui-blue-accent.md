# Request 006: Simpler site-wide UI, consistent blue accent, and shorter AI prompts

## Status
Draft for approval. No implementation has started.

## Goal
Make Freequiz clear and approachable for people who just want to study, not people interested in technical details. Reduce clutter throughout the app, make the selected accent colour consistent, and ensure generated AI prompts fit more chatbot input limits without reducing question quality.

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

### 2. Shorten AI prompts without weakening results
- Remove redundant prompt text and the duplicated full JSON schema example. Keep the required output format and validation rules clear and complete.
- Encode existing sections in a compact representation that preserves section IDs, names, and parent relationships, rather than pretty-printed JSON.
- Add a simple option to omit the existing section list for chatbots with stricter prompt limits. Explain in plain language that this means the AI may create sections from the supplied material instead of matching the existing library. Keep existing sections included by default when available, so normal workflows retain their current section-matching behaviour.
- Keep extraction and generation quality rules unchanged: extraction must not invent or guess; generation must use source-grounded questions, credible distractors, balanced option lengths, varied correct-answer positions, and no predictable clues.
- Keep supported answer modes, variable option counts, stable option IDs, provenance, and import-compatible output requirements.
- Keep the two understandable choices: **Extract existing questions** and **Generate new questions**, with one short sentence for each.
- Keep prompt generation and **Copy prompt** obvious. A compact prompt should be the default, without making users understand JSON schemas.
- Do not remove import, validation, export, or other existing functionality.

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
- AI prompts are materially shorter by removing redundant formatting and schema duplication, while preserving output compatibility and question-quality requirements.
- Existing section IDs and hierarchy are preserved in compact form by default; users can omit the list if their chatbot cannot accept it.
- Omitting the section list changes only section matching/assignment, not the question quality requirements.
- A first-time user can choose a mode, generate a prompt, and copy it without reading a long technical explanation.
- With blue selected, accent surfaces and interactive highlights consistently use blue across the app; no leftover green accent remains in those areas.
- Switching accent presets recolours the same UI elements consistently in dark and light themes.
- Existing settings persist, old data remains compatible, and core features continue to work.
- Add or update tests where meaningful, then run tests, TypeScript check, and production build. Verify the GitHub Pages deployment.
- Record any manual browser/mobile checks that were or were not performed.
