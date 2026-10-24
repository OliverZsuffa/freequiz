# Request 006 implementation plan

## Status
Implementation in progress in PR #5; automated verification is running.

## Phase 1: Audit the entire UI
1. Review the app's main screens and shared components: dashboard, quiz setup/runner, question library/editor, results, progress charts, settings, AI prompt generator, import and export.
2. Identify verbose/repetitive copy, technical details shown too early, cluttered layouts, inconsistent labels, and secondary controls competing with the main task.
3. Simplify wording and screen hierarchy consistently. Keep concise instructions where they help a user make a decision, avoid mistakes, or interpret results.
4. Preserve all existing features, data, important confirmations, and accessibility.

## Phase 2: Shorten AI prompts and strengthen question quality
1. Inspect the current prompt builder and tests for extraction and generation requirements.
2. Remove duplicated schema/example content and redundant wording while retaining all required fields, answer modes, provenance, and import-compatible JSON output.
3. Encode the existing section tree compactly, preserving every section ID, name, and parent relationship.
4. Add a simple option to include or omit the existing section list. Include it by default when available; when omitted, explicitly tell the AI to derive sections from source headings/content and keep all question-quality rules unchanged.
5. Make the difference between extraction and generation explicit throughout the prompts and output:
   - Extraction includes only questions explicitly posed in the source (including exercises and review questions). A fact, ranking, definition, or hierarchy stated without a question must never be converted into a question. Only assign answers when the source provides an explicit key or an unambiguous answer indication. Put uncertain/incomplete items in a separate review report, not the importable JSON.
   - Generation creates new questions from course material; generated items must retain the `AI-Generated` provenance, while extracted items retain `AI-Extracted`. Do not blur the two protocols.
6. Strengthen source fidelity and relevance rules:
   - Skip administrative details, advertisements, contact information, schedules, icebreakers, and other non-course content, including when it looks easy to turn into a question.
   - Ensure every correct answer and explanation is supported by the supplied material. Do not fill gaps with confident guesses or unsupported outside knowledge; flag uncertainty for review.
   - Prioritise course learning objectives, core concepts, meaningful distinctions, and applications over isolated numbers, names, or trivia. Do not create a question merely because a slide contains a fact.
   - Generate as many distinct high-quality questions as the material supports, covering major topics broadly without padding or near-duplicates.
   - Keep distractors plausible and based on common misconceptions; balance option lengths, vary correct-answer positions, and check for wording or pattern clues.
7. Require concise, direct question stems:
   - Avoid repetitive meta-prefaces such as “According to the lecture slides,” “Based on the course material,” and “As discussed in the lecture.”
   - Ask the concept directly and assume the learner knows the course context. Include source/scenario context only when it is genuinely needed to make the question clear or precise.
   - Avoid filler without stripping away context required to test the intended concept. Put useful source attribution or nuance in explanations where appropriate rather than repeating it in every stem.
8. Keep supported answer modes, variable option counts, stable option IDs, provenance, and import-compatible output requirements.
9. Add tests for compact section serialization, include/omit behaviours, protocol separation, exclusions of non-course content, source-grounding/uncertainty rules, conceptual question quality, concise stems, distractor/answer-pattern rules, provenance, and schema compatibility.

## Phase 3: Simplify the AI prompt and import screen
1. Remove the privacy callout, redundant explanatory paragraphs, "Prompt automatically includes" checklist, and prominent schema example from the main workflow.
2. Present the two modes as plain-language choices with a single concise explanation.
3. Keep prompt generation and copying obvious. Keep JSON import/validation and exports accessible without leading with schema jargon.
4. Explain the section-list option simply: omitting it can help with strict prompt limits, but the AI may not match the existing section hierarchy.
5. Preserve all functionality and prompt quality rules.

## Phase 4: Make accent theming systematic
1. Audit `src/styles.css` for hard-coded green accent values and hard-coded accent-dependent borders/backgrounds throughout the app.
2. Define shared accent tokens and, where needed, derived low-opacity accent tokens for each preset.
3. Use a dark navy/near-black base with blue accents for the blue preset; keep light mode readable.
4. Apply the tokens consistently to primary actions, focus rings, active nav/icons, selected states, progress accents, links, badges and interactive hover borders.
5. Keep correctness, error, warning and mastery-status colours semantic rather than forcing every status to the accent.
6. Verify purple, orange and green presets against the same component set in dark and light themes.

## Phase 5: Add import history
1. Add an optional, backward-compatible per-profile import-batch record with date/time, name, source type, original question/section snapshots, and question IDs newly added.
2. Add an import history screen reachable from the main menu. Show batch details and added/skipped counts; let users expand a batch to inspect its questions.
3. Attribute questions in the library to the batch that first added them.
4. Export an individual batch as a valid question-bank JSON file, including only used sections and necessary ancestors.
5. Keep snapshots independent of later question edits/deletions so history remains useful. Ensure existing profile backups and question banks still load.

## Phase 5: Verification
1. Update UI tests for the site-wide copy/layout simplifications, AI prompt flow, import history, and per-batch export behaviour.
2. Test the prompt requirements directly and inspect representative generated prompt text for length and clarity. Verify strict extraction, compact section inclusion/omission, source-fidelity, relevance, broad generation coverage, concise stems, protocol separation, question-quality, and schema compatibility.
3. Run the full test suite, TypeScript check and production build.
4. Merge only after checks pass and verify the Pages workflow.
5. Record deployment status and whether manual desktop/mobile theme checks were performed.

## Out of scope
- Removing features or weakening extraction/generation safeguards.
- Changing how data is stored or the question schema.
- Rewriting mastery/status colour semantics.
