# Request 011 implementation plan

## Status
Implemented and merged to main on 2026-10-26. Main-branch deployment workflow #184 succeeded; an independent rendered-page smoke test was not completed.

## Goal
Make profile transfer lossless, separate it from question-bank sharing, and make long import filenames and tags readable in the Questions workspace filters on desktop and mobile.

## Requirements

### 1. Full profile backup: exact restore
Add a clearly labelled **Full profile backup** export/import path for moving the active profile between devices, while retaining a separate **Backup all profiles** action for the existing multi-profile backup use case.

The backup must preserve the complete profile state, including:
- Profile name and profile-specific settings/metadata.
- Every question with its original IDs, wording, options, correct answers, explanations, tags, section assignment, provenance, timestamps, and source attribution.
- The complete nested section tree and custom groups.
- Original import/source history, including each import batch's original filename/source identity and snapshots.
- All learning progress: every attempt with timestamps and selected answers, mastery as derived from that history, favourites, deferred state, exam sessions/results, and statistics/history derived from these records.
- Any additional fields currently stored on the profile, without silently dropping optional or future-compatible fields where practical.

Use a versioned backup format and validate it before changing stored data. A full backup must be recognized as a backup, not accidentally treated as a question-bank import.

On import, restore the profile as a whole and preserve its contents and history. Default to creating a separate profile copy so an existing profile cannot be overwritten accidentally. If an ID/name collision needs handling, make the outcome explicit; preserve all question, attempt, import, group, exam, and cross-reference IDs unless a collision makes changing a profile-level ID necessary. Replacing an existing profile, if offered, requires a clear confirmation. Import failure must leave existing data unchanged.

The goal is that after restoring on another device, the profile behaves and appears like the original, including its learning progress, history, original source filenames, and import attribution. Browser-global preferences (such as the app's theme) should only be included if they are genuinely profile-specific; do not silently conflate them with profile data.

### 2. Questions export: content only, merge-friendly
Keep a separate **Questions export** for sharing or adding content to an existing profile.

- Export question content and educational metadata, including sections/ancestors needed by exported questions, tags, answer mode, explanations, and AI provenance.
- Do not include profile learning state, attempt history, exam results, favourites, deferred state, or profile-level configuration.
- Keep the output compatible with the ordinary question-bank import/preview flow.
- Importing it into an existing profile adds eligible questions under the existing duplicate handling and section-reference rules; it must not reset or overwrite existing progress.
- Name the two export types distinctly in the UI and filenames, with short descriptions that explain their purpose.

### 3. Tag favourites and long filter labels
Add a way to star/favourite tags in the Questions workspace so frequently used tags appear at the top of the tag search and selection list. Persist starred tags across sessions as profile data, and include them in full profile backups. Keep the interaction compact and consistent with the minimal UI.

Improve the import-filename and tag filter controls in the Questions workspace.

- Long labels must remain identifiable and accessible; do not permanently truncate the only visible copy of a filename or tag.
- Use responsive wrapping or a compact multi-line layout where appropriate, sensible maximum widths, and clear spacing so long labels do not force horizontal overflow or make filter controls unusable.
- Selected values should remain legible and individually removable. If compact chips are needed, expose the complete label on focus/hover and provide an accessible way to inspect it on touch devices.
- Preserve the existing multi-select behaviour and filter semantics. Avoid making the page substantially taller or cluttered for ordinary short labels.
- Check both narrow mobile layouts and desktop layouts, including very long single-word names and labels with spaces.
- Provide a searchable tag picker with a clear star/unstar action; starred tags appear first (then unstarred tags alphabetically), and starred state survives reloads and backup/restore.

## Implementation phases

1. **Audit current behavior**
   - Trace the current export controls, `exportJson`, backup validation/import flow, question-bank parsing, import preview/apply behavior, profile settings, and persistence.
   - Inventory every field stored on `Profile`, including optional arrays and import/source snapshots; verify which statistics are derived from attempts/exams.
   - Inspect the Questions workspace's import-file and tag filters, selected-value rendering, CSS overflow/truncation, and existing responsive breakpoints.
2. **Define and implement explicit export contracts**
   - Separate versioned full-profile backup and question-bank export schemas.
   - Keep question-bank exports compatible with existing imports and old files.
   - Add safe backup validation and a dedicated restore path; never route a full backup through question-only parsing.
3. **Implement lossless restore**
   - Restore the complete profile atomically after validation.
   - Handle profile identity/name collisions explicitly and protect existing data with confirmation where replacement is available.
   - Ensure progress, import/source attribution, and all cross-references survive round-trip serialization.
4. **Tag favourites and improve filter label layout**
   - Add profile-persisted tag favourites and order starred tags first in a searchable tag picker.
   - Refactor import-filename/tag controls and selected filter values with responsive, accessible long-label handling.
   - Preserve current selection, filtering, and removal behavior.
5. **Tests and verification**
   - Add round-trip tests for a profile containing multiple questions/sections, original source filenames, import snapshots, attempts at multiple timestamps, favourites, deferred questions, groups, exam sessions, and optional fields.
   - Verify restored profile data is equivalent to the exported profile, apart from any explicitly necessary profile-level collision handling.
   - Test invalid/partial backups, legacy question-bank files, duplicate question IDs, and failed restore without data loss.
   - Test that questions-only export excludes progress and that importing it merges content without changing existing attempts/favourites/deferred/exam history.
   - Test starring/un-starring tags, starred-first search ordering, persistence, and inclusion in full backup restore.
   - Add responsive/accessibility regression checks for long filenames/tags, keyboard focus, selected-chip removal, narrow widths, and labels without spaces.
   - Run the full test suite, TypeScript checks, production build, and deployment workflow; manually inspect the live UI on a narrow/mobile viewport where available.
6. **Documentation**
   - Update the README and Knowledge Base with the two export types, restore behavior, compatibility expectations, and backup safety notes.
   - Record verification and any limits in the Knowledge Base.

## Acceptance criteria
- A full backup of the active profile can be exported from one device and restored on another without losing profile data, original source/import attribution, attempts, exam history, favourites, deferred state, groups, or derived mastery/statistics.
- The all-profiles backup remains available and records which profile was active at export time.
- Restoring a backup does not silently overwrite an existing profile or partially mutate data on failure.
- Questions-only export contains transferable question content but no learning history, and can be merged into an existing profile without disturbing that profile's progress.
- Existing question-bank imports remain compatible.
- Long import filenames and tags can be understood and selected/removed on mobile and desktop without being irretrievably cut off or causing horizontal overflow.
- Tags can be starred; starred tags appear at the top of the searchable tag picker and remain starred after reload and full backup/restore.
- Tests, type checks, production build, and deployment checks pass.

## Out of scope
- Cloud sync, accounts, backend storage, or telemetry.
- Changing mastery rules or exam scoring.
- Redesigning the whole Questions workspace beyond the filter-label issue.
- Changing the existing duplicate-question policy unless required to prevent data loss during restore.

## Approval gate
Approval received on 2026-10-26. Implementation is authorized.
