# Request 006: Simpler site-wide UI, consistent blue accent, and shorter, more reliable AI prompts

## Status
Implemented and merged via PR #5 (merge commit `3ea6cf4870a0be4f739d9d6777d0ceec83e3eeaa`). PR workflow run [40086825611](https://github.com/OliverZsuffa/freequiz/actions/runs/40086825611) passed 38 tests, TypeScript check, production build, Pages configuration, and artifact upload. Main-branch deployment and live browser verification could not be independently confirmed from the available connector; manual desktop/mobile/offline checks remain outstanding.

## Goal
Make Freequiz clear and approachable for people who just want to study, not people interested in technical details. Reduce clutter throughout the app, make the selected accent colour consistent, and ensure AI prompts stay within more chatbot input limits without sacrificing the relevance or reliability of the resulting question bank.

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

### 2. Shorten AI prompts and improve question reliability
- Remove redundant prompt text and the duplicated full JSON schema example. Keep the required output format and validation rules clear and complete.
- Encode existing sections in a compact representation that preserves section IDs, names, and parent relationships, rather than pretty-printed JSON.
- Add a simple option to omit the existing section list for chatbots with stricter prompt limits. Explain in plain language that this means the AI may create sections from the supplied material instead of matching the existing library. Keep existing sections included by default when available, so normal workflows retain their current section-matching behaviour.
- Keep two clear modes: **Extract existing questions** and **Generate new questions**. Do not mix their rules or results:
  - **Extraction:** include only questions explicitly posed in the source, including exercises and review questions. A fact, ranking, definition, or hierarchy stated on a slide is not an existing question and must not be converted into one. Only include an answer when the source gives an explicit answer key or an unambiguous answer indication. Put uncertain or incomplete items in a separate review report, outside the importable JSON.
  - **Generation:** create new questions from course material and preserve the `AI-Generated` provenance. Extracted items must preserve `AI-Extracted` provenance.
- Filter for course relevance. Skip advertisements, administrative information, contact details, schedules, icebreakers, and other non-course content, even if they could be turned into questions.
- Enforce source fidelity: every correct answer and explanation must be supported by the supplied material. Do not fill gaps with confident guesses or unsupported outside knowledge; flag uncertainty for review.
- Prioritise course learning objectives, core concepts, meaningful distinctions, and applications over isolated numbers, names, or trivia. Do not generate a question just because a slide contains a fact. Generate as many distinct high-quality questions as the material supports, covering major topics broadly without padding or near-duplicates.
- **Write concise, direct question stems.** Avoid repetitive meta-introductions such as “According to the lecture slides…”, “Based on the course material…”, “As discussed in the lecture…”, or “Which of the following does the material state…”. Assume the learner is answering questions from their course; do not keep reminding them of the source. Ask the concept directly, for example, “What is the stewardship role of financial accounting?” rather than “According to the lecture slides, what does the material say about the stewardship role?”
- Include source context in a question only when it is genuinely necessary to understand the scenario or distinguish the intended concept. Do not remove meaningful context just to make every stem short. Keep stems focused and avoid filler; put useful source attribution or nuance in the explanation when needed, not as a repeated preamble.
- For generated questions, keep distractors plausible and based on common misconceptions, balance option lengths, vary correct-answer positions, and check for wording or pattern clues.
- Preserve supported answer modes, variable option counts, stable option IDs, provenance metadata, and import-compatible output.
- Keep prompt generation and **Copy prompt** obvious. The compact prompt should be the default, without making users understand JSON schemas.
- Do not remove import, validation, export, or other existing functionality.

### 3. Make the accent colour consistent
- Make the blue preset the default visual identity: near-black/navy surfaces with blue accents, not green surfaces with a few blue controls.
- Route accent-related UI colours through shared CSS variables, including primary buttons, active navigation/icons, focus outlines, selected answers, progress indicators, links, badges, and interactive card borders.
- Make purple, orange and green presets consistently recolour those same accent surfaces too.
- Keep semantic feedback colours (correct/incorrect answers and warning/error states) distinct where their meaning matters.
- Preserve contrast and accessible focus states in dark and light themes.
- Avoid changing the meaning of mastery/status colours just to match the accent.

### 4. Add import history
- Record each successful import as a named batch with date/time, source type, original question/section snapshot, and a count of questions newly added to the active profile.
- Let users inspect each batch and see its questions, including whether each question was added or skipped because its ID already existed.
- Show batch attribution in the question library so users can see which import first added a question.
- Allow exporting one selected import batch as a valid question-bank JSON file, with only the sections used by that batch and their necessary ancestors.
- Preserve snapshots so a batch remains reviewable/exportable even if questions are later edited or deleted from the active library.
- Keep import history optional for older profiles and preserve compatibility with existing backups and question-bank files.
- Keep history local to the profile; do not add a backend or telemetry.

## Acceptance criteria
- Across the app, screens are easier to scan, use plain language, and prioritise the main task instead of lengthy explanations or technical details.
- Core actions and important instructions remain easy to find; no functionality is removed.
- AI prompts are materially shorter by removing redundant formatting and schema duplication, while preserving output compatibility and all extraction/generation safeguards.
- Existing section IDs and hierarchy are preserved in compact form by default; users can omit the list if their chatbot cannot accept it.
- Omitting the section list changes only section matching/assignment, not question-quality requirements.
- The prompt clearly distinguishes explicit question extraction from new-question generation; a stated fact or hierarchy is never treated as an existing question, and the appropriate provenance tag is preserved.
- Non-course content is excluded; uncertain answers are flagged instead of guessed; correct answers and explanations must be grounded in the supplied material.
- Generated questions favour course concepts and applications over low-value trivia, cover as much useful material as possible without padding, and use plausible distractors, balanced option lengths, varied correct-answer positions, concise stems, and no predictable clues.
- Question stems are concise and direct by default, without repetitive phrases like “according to the lecture slides” or “based on the course material” unless that context is genuinely necessary.
- A first-time user can choose a mode, generate a prompt, and copy it without reading a long technical explanation.
- With blue selected, accent surfaces and interactive highlights consistently use blue across the app; no leftover green accent remains in those areas.
- Switching accent presets recolours the same UI elements consistently in dark and light themes.
- Import history records batch membership and snapshots, displays added/skipped counts, and exports an individual batch as importable JSON.
- Existing settings persist, old data remains compatible, and core features continue to work.
- Add or update tests where meaningful, then run tests, TypeScript check, and production build. Verify the GitHub Pages deployment.
- Record any manual browser/mobile checks that were or were not performed.
