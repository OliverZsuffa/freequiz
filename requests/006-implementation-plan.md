# Request 006 implementation plan

## Status
Draft for approval. No implementation has started.

## Phase 1: Audit the entire UI
1. Review the app's main screens and shared components: dashboard, quiz setup/runner, question library/editor, results, progress charts, settings, AI prompt generator, import and export.
2. Identify verbose/repetitive copy, technical details shown too early, cluttered layouts, inconsistent labels, and secondary controls competing with the main task.
3. Simplify wording and screen hierarchy consistently. Keep concise instructions where they help a user make a decision, avoid mistakes, or interpret results.
4. Preserve all existing features, data, important confirmations, and accessibility.

## Phase 2: Shorten AI prompts safely
1. Inspect the current prompt builder and tests for extraction and generation requirements.
2. Remove duplicated schema/example content and redundant wording while retaining all required fields, answer modes, provenance, and import-compatible JSON output.
3. Encode the existing section tree compactly, preserving every section ID, name, and parent relationship.
4. Add a simple option to include or omit the existing section list. Include it by default when available; when omitted, explicitly tell the AI to derive sections from source headings/content and keep all question-quality rules unchanged.
5. Add tests for compact section serialization, both include/omit behaviours, prompt modes, required quality rules, provenance, and schema compatibility.

## Phase 3: Simplify the AI prompt and import screen
1. Remove the privacy callout, redundant explanatory paragraphs, "Prompt automatically includes" checklist, and prominent schema example from the main workflow.
2. Present the two modes as plain-language choices with a single concise explanation.
3. Keep prompt generation and copying obvious. Keep JSON import/validation and exports accessible without leading with schema jargon.
4. Preserve all functionality and prompt quality rules.

## Phase 4: Make accent theming systematic
1. Audit `src/styles.css` for hard-coded green accent values and hard-coded accent-dependent borders/backgrounds throughout the app.
2. Define shared accent tokens and, where needed, derived low-opacity accent tokens for each preset.
3. Use a dark navy/near-black base with blue accents for the blue preset; keep light mode readable.
4. Apply the tokens consistently to primary actions, focus rings, active nav/icons, selected states, progress accents, links, badges and interactive hover borders.
5. Keep correctness, error, warning and mastery-status colours semantic rather than forcing every status to the accent.
6. Verify purple, orange and green presets against the same component set in dark and light themes.

## Phase 5: Verification
1. Update UI tests for the site-wide copy/layout simplifications and the AI prompt flow.
2. Run the full test suite, TypeScript check and production build.
3. Merge only after checks pass and verify the Pages workflow.
4. Record deployment status and whether manual desktop/mobile theme checks were performed.

## Out of scope
- Removing features or changing question-generation/extraction quality requirements.
- Changing how data is stored or the question schema.
- Rewriting mastery/status colour semantics.
