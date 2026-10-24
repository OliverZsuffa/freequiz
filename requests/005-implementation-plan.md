# Request 005 implementation plan

## Status
Draft for approval. No feature implementation has started.

## Design decisions
- Present two clear modes in the existing AI prompt generator: **Extract existing questions** and **Generate new questions**.
- Keep both workflows prompt-only and local. The user supplies source material to the external AI, not to Freequiz.
- Treat `AI-Extracted` and `AI-Generated` as protected provenance metadata. Ordinary tags remain editable and independent.
- Preserve provenance during editing, import/export, and reuse; never infer or change provenance from question wording.
- Keep old question banks compatible. If a schema change is required, make it additive and define migration/default behaviour for old data.
- Do not silently mark an answer correct when extraction sources lack a reliable key. Inspect current schema and choose an import-compatible review/unresolved representation; document any necessary limitation rather than inventing correctness.
- Do not add a runtime AI integration, analytics, backend, or telemetry.

## Phase 0: Inspect current implementation
1. Inspect the current AI prompt UI and prompt-generation logic.
2. Inspect question and import/export types, tag handling, editor state, validation, and storage migration.
3. Identify how unresolved answers can be represented by the current schema and how legacy question banks are validated.
4. Establish the current test/build baseline and list all surfaces that must preserve provenance.

## Phase 1: Add two prompt modes
1. Add a clear mode selector with concise explanatory copy.
2. Implement separate extraction and generation prompt templates.
3. Extraction prompt: fidelity to source, no invented questions/options/answers/explanations, preserve wording, flag ambiguity or missing keys, and add `AI-Extracted`.
4. Generation prompt: source-grounded original questions, meaningful difficulty, credible misconception-based distractors, balanced option length and structure, varied answer positions, no lexical/grammar/format clues, and add `AI-Generated`.
5. Keep both templates aligned with the current import schema, including supported answer modes and variable option counts.
6. Keep the next step explicit: copy the prompt, then attach/paste material into the external AI conversation.

## Phase 2: Model protected provenance and ordinary tags
1. Add or formalize separate provenance metadata and ordinary tags, based on the existing schema and compatibility constraints.
2. Ensure the editor can add/edit ordinary tags but cannot overwrite or remove provenance.
3. Preserve provenance through editing, cloning/reuse, JSON import/export, and profile backup paths where question data is carried.
4. Provide backward-compatible defaults for old questions without provenance.
5. Show provenance in question details/library views without making it a section or duplicating it into ordinary tags.
6. Decide and implement safe behaviour for conflicting or invalid provenance values in imported JSON; never silently upgrade arbitrary user tags to protected provenance.

## Phase 3: Validation and tests
1. Add unit tests for both prompt templates and their mode-specific constraints.
2. Add domain/editor tests for provenance preservation and ordinary tag edits.
3. Add import/export and legacy-compatibility tests, including malformed provenance and missing tags.
4. Test that users cannot remove protected provenance through the normal tag editor.
5. Run all automated tests, TypeScript checks, and the production build.

## Phase 4: Review, merge, and deployment
1. Review the diff for unintended changes to question identity, attempts, or existing import semantics.
2. Update the README/Knowledge Base and mark Request 005 status accurately.
3. Open a pull request, inspect CI results, and merge only after checks pass.
4. Verify the main-branch GitHub Actions deployment and published Pages result.
5. Report any manual browser checks or unsupported edge cases honestly.
