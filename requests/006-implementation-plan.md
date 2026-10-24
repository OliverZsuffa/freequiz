# Request 006 implementation plan

## Status
Draft for approval. No implementation has started.

## Phase 1: Simplify the import and AI prompt experience
1. Inspect the import view structure and its existing tests.
2. Remove the privacy callout, redundant explanatory paragraphs, "Prompt automatically includes" checklist, and prominent schema example from the main workflow.
3. Present the two modes as plain-language choices with a single concise explanation.
4. Keep prompt generation and copying obvious. Keep JSON import/validation and exports accessible without leading with schema jargon.
5. Preserve all underlying functionality and the full prompt templates.

## Phase 2: Make accent theming systematic
1. Audit `src/styles.css` for hard-coded green accent values and hard-coded accent-dependent borders/backgrounds.
2. Define shared accent tokens and, where needed, derived low-opacity accent tokens for each preset.
3. Use a dark navy/near-black base with blue accents for the blue preset; keep light mode readable.
4. Apply the tokens consistently to primary actions, focus rings, active nav/icons, selected states, progress accents, links, badges and interactive hover borders.
5. Keep correctness, error, warning and mastery-status colours semantic rather than forcing every status to the accent.
6. Verify purple, orange and green presets against the same component set.

## Phase 3: Verification
1. Update UI tests for the simplified AI prompt flow.
2. Add focused tests for prompt mode switching and existing copy/generate controls if coverage is missing.
3. Run the full test suite, TypeScript check and production build.
4. Merge only after checks pass and verify the Pages workflow.
5. Record deployment status and whether manual desktop/mobile theme checks were performed.

## Out of scope
- Removing features or changing AI prompt content/quality rules.
- Changing how data is stored, privacy behaviour, or question schema.
- Rewriting mastery/status colour semantics.
