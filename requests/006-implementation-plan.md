# Request 006 implementation plan

## Status
Draft for approval. No implementation has started.

## Phase 1: Audit the entire UI
1. Review the app's main screens and shared components: dashboard, quiz setup/runner, question library/editor, results, progress charts, settings, AI prompt generator, import and export.
2. Identify verbose/repetitive copy, technical details shown too early, cluttered layouts, inconsistent labels, and secondary controls competing with the main task.
3. Simplify wording and screen hierarchy consistently. Keep concise instructions where they help a user make a decision, avoid mistakes, or interpret results.
4. Preserve all existing features, data, prompt templates/quality rules, and important confirmations.

## Phase 2: Simplify the AI prompt and import experience
1. Remove the privacy callout, redundant explanatory paragraphs, "Prompt automatically includes" checklist, and prominent schema example from the main workflow.
2. Present the two modes as plain-language choices with a single concise explanation.
3. Keep prompt generation and copying obvious. Keep JSON import/validation and exports accessible without leading with schema jargon.
4. Preserve the full prompt templates and underlying functionality.

## Phase 3: Make accent theming systematic
1. Audit `src/styles.css` for hard-coded green accent values and hard-coded accent-dependent borders/backgrounds throughout the app.
2. Define shared accent tokens and, where needed, derived low-opacity accent tokens for each preset.
3. Use a dark navy/near-black base with blue accents for the blue preset; keep light mode readable.
4. Apply the tokens consistently to primary actions, focus rings, active nav/icons, selected states, progress accents, links, badges and interactive hover borders.
5. Keep correctness, error, warning and mastery-status colours semantic rather than forcing every status to the accent.
6. Verify purple, orange and green presets against the same component set in dark and light themes.

## Phase 4: Verification
1. Update UI tests for the site-wide copy/layout simplifications and the AI prompt flow.
2. Add focused tests for prompt mode switching and existing copy/generate controls if coverage is missing.
3. Run the full test suite, TypeScript check and production build.
4. Merge only after checks pass and verify the Pages workflow.
5. Record deployment status and whether manual desktop/mobile theme checks were performed.

## Out of scope
- Removing features or changing AI prompt content/quality rules.
- Changing how data is stored, privacy behaviour, or question schema.
- Rewriting mastery/status colour semantics.
