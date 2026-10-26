# Request 010: Complete profile backup, questions-only export, and readable filters

## Status
Plan only. Wait for explicit approval before implementing.

## Problem

The current export/import behaviour does not reliably recreate a profile on another device: important profile-owned state such as attempts, statistics inputs, import history, favourites, deferred markers, custom groups, and exam history can be lost or left behind. The current full-backup import path does not restore the full profile. Separately, long import filenames and tags are truncated in filter controls, making distinct values difficult to identify.

## Goals

1. Make a full profile backup a faithful, portable snapshot of one profile.
2. Offer a separate questions-only export intended for merging question content into an existing profile.
3. Make long filter values readable and selectable on desktop and mobile without removing filter functionality.

## Export formats and behaviour

### A. Full profile backup — device transfer

- Export the active profile as a self-contained backup with a versioned format identifier (prefer a new `freequiz/profile-backup-v2` format rather than silently changing the meaning of an existing backup format).
- Preserve all profile-owned data exactly where meaningful: profile name and identity metadata; section tree; question records and IDs; answer options and correct-option IDs; explanations, tags, provenance, source filename/source identity and timestamps; attempt records with IDs, timestamps, selected option IDs and correctness; favourites; deferred question IDs; custom groups and their question IDs; exam sessions, responses, scores and timing; import-batch history and snapshots, including original filenames/source attribution; and any other fields added to the Profile schema.
- Preserve the original source/import attribution. Creating a backup must not relabel the backup file itself as the original source of the questions.
- Keep the data self-contained and validate its shape/version before applying it. Do not regenerate timestamps, IDs, attempt history, or progress values when the backup already supplies them.
- Keep legacy backup imports supported.
- Restoring must produce a profile that behaves like the original: same question bank, progress/mastery, history, groups, favourites, deferred markers, import history, and exam records. Mastery and charts should recompute identically from the restored records.
- Default restore action: create a restored profile without modifying the current profile. Preserve the original profile ID if it does not conflict with a profile already stored locally; if there is a collision, assign a new profile ID while retaining all internal question/section/history IDs and relationships. Show the resulting profile name and require confirmation before import. If the UI already supports a clear replace-existing-profile workflow, it may be offered as an explicit advanced option with a destructive confirmation; never overwrite silently.
- App/device-global preferences (theme, accent, tutorial completion and notification/reminder settings stored outside Profile) remain local to the destination device unless inspection shows they are actually part of the profile model. The profile data itself must be indistinguishable.

### B. Questions-only export — sharing and merging

- Add a separate export choice labelled clearly as a question-bank/content export, distinct from full backup.
- Export all questions in the active profile and the section definitions needed to place them correctly, including question IDs, answer modes, options, correct answers, explanations, ordinary tags, AI provenance, and original source/import attribution where supported.
- Do not include profile progress or personal learning history: attempts, mastery-derived state, favourites, deferred markers, groups, exam history, or import-batch snapshots.
- Keep the format compatible with the existing `freequiz/questions-v1` importer where possible; if a schema extension is needed to preserve source metadata, version it explicitly and keep older imports working.
- Importing this export into an existing profile uses the existing merge workflow and duplicate-handling rules. It must not reset or replace progress on questions already in the destination profile. Imported new questions start without attempts unless the destination already has matching questions and the current merge rules explicitly keep those existing records.
- Make the two choices distinct in the export UI and describe their purposes in plain language.

## Filter label layout

- Fix long import filenames, source labels and tags in filter controls so values are not permanently clipped or ambiguous.
- Prefer responsive controls that can grow/wrap where space allows, with a sensible max width and a deliberate line-wrap strategy. Do not allow one long label to stretch the entire page or push actions off-screen.
- Where compact chips or single-line controls are necessary, provide a reliable way to view the full value (for example, wrapping in a menu item, an accessible title/tooltip, or a details popover). The full value must also remain available to keyboard and touch users; do not rely on hover alone.
- Keep multiselect behaviour, selected-state visibility, filter clearing, and existing filter logic unchanged.
- Ensure long names work on narrow mobile screens, in both light and dark themes, and with many selected filters.

## Implementation approach

1. Inspect current export, backup parsing, import preview/merge, profile persistence, import-batch construction, and filter components before changing code.
2. Define and document the versioned full-profile backup shape and compatibility rules. Use explicit validators and safe defaults only for genuinely optional legacy fields; do not silently discard fields from a valid current backup.
3. Separate serialization for full profile backup from questions-only export so the two formats cannot accidentally include or omit the wrong categories of data.
4. Implement backup import as a profile restore, not as a question merge. Keep it atomic: validate the entire file first, then add the restored profile only if validation succeeds.
5. Preserve question-source attribution and IDs when importing a questions-only export, using the existing merge semantics and deduplication behaviour.
6. Redesign the long-value filter layout with shared styles/components where practical, retaining responsive and accessible full-value display.
7. Update in-app help and README import/export documentation to explain both export options and restore behaviour.

## Tests and acceptance criteria

### Full backup
- Round-trip a profile containing nested sections, questions with varied answer modes, source filenames and provenance, multiple attempts with distinct timestamps, favourites, deferred IDs, groups, import batches/snapshots, and exam sessions/responses.
- Assert that exporting and restoring preserves every profile field and stable ID, except the documented profile-ID collision rule.
- Assert mastery, due-for-review decisions, statistics/history inputs, and exam history match before and after restore.
- Assert malformed, unsupported-version, and partially invalid backups are rejected without changing the store.
- Assert restoring does not mutate the currently active profile and creates a usable restored profile.
- Assert legacy backup files still import with documented compatibility behaviour.

### Questions-only export
- Assert exported JSON excludes attempts, exam history, favourites, deferred markers, groups, and import snapshots.
- Assert question and section content, IDs, answer modes, provenance and original source attribution are preserved.
- Assert merging into an existing profile preserves destination progress and handles duplicate question/section IDs according to established rules.

### Filter layout
- Add regression coverage for long import filenames and tags in filter menus and selected filters.
- Verify labels remain identifiable and accessible without hover, and controls do not create horizontal overflow at mobile widths.
- Run existing tests, TypeScript checking, and production build; inspect changes before requesting merge.
- Do not claim manual mobile testing unless it is actually performed.

## Out of scope

- Cloud synchronisation or server storage.
- Changing normal import merge/deduplication rules beyond what is required to make the two export types reliable.
- Exporting app-wide device preferences as profile data.
- Implementing changes before the user approves this plan.
