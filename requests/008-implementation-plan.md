# Request 008 implementation plan

## Status
Implementation committed on feature branch `feature/008-question-management` in Pull Request #8. Automated verification passed: 2 test files, 44 tests, TypeScript check, and production build. Awaiting merge into `main` and deployment verification. Manual desktop, mobile, and offline checks remain outstanding.

## Phase 1: Audit current implementation
1. Read the current profile types, profile creation/deletion and persistence flows in `src/App.tsx`, `src/domain.ts`, and `src/storage.ts`.
2. Locate question library/editor, question selection, import history, section tree traversal, study-source selection, backup/import logic, and existing tests.
3. Map every persisted question and profile field, distinguishing user-editable fields from protected or historical metadata.
4. Confirm whether creation/modification timestamps and original import filename/source identifiers already exist. Do not add duplicate fields if existing records already provide the required information.
5. Identify current section selection code that assumes fixed nesting or cannot select descendants consistently.
6. Record the exact functions and components to change before implementation.

## Phase 2: Profile deletion
1. Implement deletion through the existing profile persistence abstraction, not a UI-only removal.
2. Add confirmation and safe active/final-profile handling.
3. Remove all profile-owned data consistently, including study history and import batches, while preserving every other profile.
4. Ensure IndexedDB and localStorage fallback behaviour is consistent and failures are surfaced.
5. Add tests for normal deletion, cancel, active profile, final profile, cross-profile isolation, and persistence failures where testable.

## Phase 3: Recursive section selection
1. Identify and consolidate recursive traversal helpers for descendants, ancestry, full paths, and cycle-safe traversal as appropriate.
2. Replace fixed-depth question-selection UI with a recursive tree or reusable recursive selector.
3. Use the same section semantics throughout study setup, question library filters, and section assignment: selecting a parent as a filter includes descendants by default; section-only filtering is an explicit alternative; assignment targets one specific section.
4. Preserve existing IDs and imported parentId relationships.
5. Add tests with at least four nesting levels, duplicate section names, empty parent sections, missing parents, and malformed cycles if the import validator can receive them.

## Phase 4: Question metadata and filter model
1. Define a single typed filter model and pure matching/sorting functions, keeping UI state separate from data mutation.
2. Cover all meaningful stored fields: searchable prompt/title, option text, explanation, answer mode, section path, tags, provenance, and associated import metadata.
3. Include presence/absence filters for optional metadata and date filters only for reliable stored timestamps.
4. Support combined filters, tag inclusion/exclusion with explicit AND/OR behaviour, descendant-aware section filters, clear individual filters, and reset-all.
5. Preserve unknown provenance and import origin as unknown; do not infer or backfill false facts.
6. If the source import identity is missing, add backward-compatible optional metadata only after confirming the current import-history model. Distinguish original file/source identity from each import batch, including repeated imports of the same file.
7. Implement stable sorting only over fields that are actually available.

## Phase 5: Question management interface
1. Build the filter/search/sort experience into the existing question library or a dedicated management view, following the existing visual system.
2. Show active filter chips, result counts, and a compact way to add/remove filters.
3. Ensure the view remains usable with large question banks and deep section trees.
4. Avoid exposing nonexistent or unreliable fields as filters.
5. Add accessible labels, keyboard-operable controls, useful empty states, and responsive layouts.

## Phase 6: Bulk selection and edits
1. Separate selected IDs from the current visible page and from the full set of matching IDs.
2. Implement select-one, select-visible, and select-all-matching-across-pages with clear scope.
3. On filter changes, never silently broaden the selection. Require predictable behaviour, such as retaining only explicitly selected IDs or asking the user to reapply select-all-matching.
4. Provide bulk add/remove/replace tags and section moves.
5. Support additional bulk operations only where semantically safe. Answer-mode changes must validate option and correct-answer consistency and must not silently alter the intended answer.
6. Do not bulk-edit prompt/title, option text, correct answers, explanations, stable IDs, provenance, or historical import snapshots.
7. Add a confirmation summary and validate all targets before mutation.
8. Implement undo for bulk tag changes and section moves if compatible with the current persistence design. If undo is not reliable, document the limitation rather than shipping a misleading undo action.
9. Test selection scope across pagination, changed filters, zero results, duplicate tags, invalid destinations, mixed records, validation failures, undo, and persistence.

## Phase 7: Integration and verification
1. Verify import, merge/replace, export, backup restore, profile switching, import history and existing study flows remain compatible.
2. Add or update UI and domain tests for all new behaviour.
3. Run the full Vitest suite, TypeScript checking and production build.
4. Inspect the pull-request workflow and GitHub Pages deployment status. Do not claim a deployment succeeded without verifying the relevant run.
5. Review the diff for accidental schema changes, unsafe profile deletion, filter mismatches and regressions.
6. Update `knowledge/README.md` only after implementation, with actual behaviour, known limitations, and verified test/deployment results.
7. Report manual desktop, mobile and offline checks separately from automated checks.

## Out of scope
- Editing question prompt/title or option content in bulk.
- Rewriting correctness keys, provenance, stable IDs, or historical import snapshots through bulk operations.
- Backend services, telemetry, automatic AI calls, or cross-device synchronisation.
- Replacing the existing persistence architecture without evidence that a focused change is insufficient.

## Approval gate
No feature implementation, application code edits, or deployment work should begin until Oliver explicitly approves this plan.
