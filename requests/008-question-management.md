# Request 008: Profile deletion, nested section selection, and question management

## Status
Approved and implemented on feature branch `feature/008-question-management`, Pull Request #8. Automated verification passed: 2 test files, 44 tests, TypeScript check, and production build. Awaiting merge into `main` and deployment verification.

## Goal
Make profile and question-bank administration reliable at scale. Add safe profile deletion, make section selection work at arbitrary nesting depth, and provide comprehensive search, filtering, sorting, selection, and bulk editing.

## 1. Delete profiles
- Add a Delete Profile action to profile management.
- Require a confirmation step that names the profile and explains that its profile-specific questions, sections, settings, study progress, favourites, groups, exams, and import history will be permanently deleted.
- Protect against deleting the active profile without first switching to another profile or safely selecting a replacement.
- Prevent deleting the final profile unless a valid replacement profile can be created and selected.
- Delete only the target profile's data. Never damage another profile's data.
- Keep deletion consistent across IndexedDB and the localStorage fallback.
- Handle partial failures explicitly rather than reporting success if related records remain.

## 2. Arbitrarily nested sections
- Make every question selection interface support recursive section trees with no fixed nesting-depth assumptions.
- Reuse the existing section IDs and parentId relationships.
- Show indentation and useful full paths where names could be ambiguous.
- Support expand/collapse where appropriate.
- For filtering and study-source selection, selecting a parent includes all descendants by default, with an explicit way to select only that section if useful.
- For assigning a question to a section, select one specific destination section rather than implicitly assigning it to descendants.
- Ensure section traversal, search, import/export, question counts, and bulk moves remain consistent for deep trees.
- Prevent invalid parent relationships, cycles, and accidental section ID changes.

## 3. Comprehensive question library search and filters
Create a dedicated, scalable question-management view with a text search, composable filters, sorting, selection, and bulk actions.

Search should cover the question prompt/title where present, option text, explanation, tags, section names and full section paths, plus searchable import metadata.

Expose filters for every meaningful field available in the question schema or reliably associated metadata, including:
- Prompt/title text and general text search.
- Answer mode/question type: single, exactly-n, and select-all.
- Section, with descendants included by default and a section-only option.
- Tags, with inclusion and exclusion and clear AND/OR semantics.
- Provenance, including AI-Generated, AI-Extracted, and other supported values.
- Source import batch, import name, source type, and original filename when known.
- Presence or absence of optional fields such as explanation, tags, provenance, and known import attribution.
- Creation or modification dates only if the application actually records reliable timestamps.
- Other meaningful fields already stored in the question or associated metadata.

Use exact matching for categorical fields and partial matching for free text where appropriate. Let users combine filters, remove individual filters, and clear all filters. Show active filters and result counts.

Do not infer missing metadata. Unknown origin must remain unknown. Preserve the distinction between provenance and ordinary editable tags.

## 4. Sorting
Support useful sort orders based on fields that exist, including prompt/title, section path, answer mode, provenance, and known timestamps. Sorting must be stable when values are equal and must not mutate question order in persistent storage unless explicitly requested.

## 5. Bulk selection and editing
Allow selection of individual questions, visible results, or all questions matching the active search and filters across every page. Clearly distinguish these scopes and show matching and selected counts. Filter changes must not silently broaden an existing selection.

After selection, provide a reviewable bulk action toolbar. Support all safe and meaningful bulk changes supported by the data model, including:
- Add one or more tags.
- Remove selected tags while preserving other tags.
- Replace tags when explicitly chosen.
- Move questions to a selected section.
- Change answer mode only if this can be validated without silently changing or invalidating the correct-answer semantics.
- Apply other genuinely useful editable metadata fields where the operation is clear and safe.

Do not bulk-edit the question prompt/title or rewrite option text, correct answers, explanations, stable IDs, provenance, or historical import snapshots. Provenance and import attribution describe origin and should not be rewritten as ordinary metadata. Individual editing remains available for question content.

Before applying changes, show the action, target values, and number of affected questions. Validate all affected records. Report failures clearly and avoid leaving a partially changed selection without reporting it. Implement undo for bulk tag changes and section moves if it can be made reliable with the current persistence model.

## 6. Compatibility and data integrity
- Inspect the existing data model and persistence before choosing implementation details.
- Preserve compatibility with existing question banks, backups, old profiles, import history and existing section IDs.
- Add source-import metadata only where needed and make it backward compatible. Record both the original file/source identity and the individual import batch when available, so repeated imports can be distinguished.
- Never fabricate import identity, timestamps, provenance, or other absent data.
- Keep everything client-side and offline-capable. Do not add a backend, telemetry, or automatic external API calls.

## Acceptance criteria
1. Profile deletion is confirmed, safe, and isolated to the intended profile.
2. The active and final profile cannot be accidentally deleted into an unusable state.
3. Deeply nested sections work throughout question selection and relevant filters.
4. Parent-section filtering includes descendants by default, with a section-only option.
5. Every meaningful available question or import metadata field can be searched, filtered, and sorted where applicable.
6. Combined filters return predictable results and expose their current scope.
7. Selecting all matching results covers every page and is clearly distinguished from selecting visible results.
8. Bulk edits affect exactly the intended records and preserve unrelated metadata.
9. Bulk changes validate data and offer undo for tags and section moves where feasible.
10. Existing data and imports remain compatible; unknown metadata is not invented.
11. Add regression tests, run the full test suite, TypeScript check and production build, and inspect GitHub Actions deployment status.
12. Report automated verification separately from manual browser, mobile and offline checks.

## Confirmed decisions
- Profile deletion permanently removes that profile's own data after explicit confirmation.
- Selecting all matching questions applies across every page.
- Bulk editing should include all sensible operations, not just tags and section assignment, while excluding question prompt/title editing.
- Track both original import source identity and individual import operation when available.
- “Question type” means answer mode.
- Parent-section filtering includes descendants by default, with an explicit section-only option.
- Prefer undo for bulk tag changes and section moves if reliable.

## Workflow
Document the implementation approach in `requests/008-implementation-plan.md` and keep open questions in `requests/questions/008-question-management.md`. Do not start implementation until Oliver explicitly approves the plan.
