# Request 028: Download both AI prompts together

## Goal
Let users download the complete Extract and Generate prompts in one plain-text file.

## Requirements
- Add a compact **Download both prompts** action to the existing AI prompt area.
- The download must contain both complete prompts: first **Extract**, then **Generate**, with clear headings and separators so the two instructions cannot be confused.
- Generate each prompt using the existing `buildAiPrompt` logic, including the current profile's section catalogue when **Include existing sections** is enabled. Respect the current setting for both prompts.
- The action must work even if the user has not generated or copied either individual prompt first.
- Download a single UTF-8 `.txt` file with a clear filename such as `freequiz-ai-prompts.txt`.
- Keep the existing individual prompt generation and copy workflows unchanged.
- Keep the implementation client-side and offline-compatible. Do not add a backend, API call, or dependency.
- Do not modify the contents or quality requirements of either source prompt.

## Implementation plan
1. Inspect the existing AI prompt UI and prompt builder. Reuse `buildAiPrompt(profile.sections, mode, includeExistingSections)` for both modes rather than duplicating prompt construction.
2. Add a download handler that builds the Extract and Generate prompts on demand, combines them in that order with clear section headings and separators, and triggers a browser download as a UTF-8 plain-text file.
3. Add the download action to the existing AI prompt area without adding a new screen or cluttering the individual prompt workflow.
4. Add regression coverage confirming the combined file contains both complete prompts in the correct order, includes the shared schema and current section configuration, and preserves each mode's distinct instructions and provenance.
5. Run the test suite, TypeScript check, production build, and offline-build validation. Update the Knowledge Base and inspect the final diff.
6. Open a PR for review. Merge only after the user approves; then verify the main-branch workflow and report deployment status separately from manual browser/device testing.

## Scope notes
- This is an additional convenience export; it does not replace the existing per-mode prompt generation or copy actions.
- The combined file is a snapshot of the prompts as configured at download time. It does not contain source course material or question-bank data.
- The file should contain the actual expanded prompts, not the raw template files or the `{{COMMON_SCHEMA_AND_SECTION_RULES}}` placeholder.
