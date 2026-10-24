# Request 007 implementation plan

## Changes
1. Revise buildAiPrompt in src/domain.ts with a strict source-reference ban, coverage-first generation instructions, and explicit separation between existing section references and new section definitions.
2. Extend src/domain.test.ts with direct assertions for source phrasing, coverage, section reuse, and parser compatibility when sections are omitted.
3. Update README and knowledge base.

## Verification
1. Run the complete Vitest suite.
2. Run TypeScript checking and production build.
3. Open the pull-request workflow and verify its result.
4. Verify the Pages deployment status if exposed; do not claim manual browser checks unless performed.

## Out of scope
- No app UI redesign, schema change, or new AI integration.
