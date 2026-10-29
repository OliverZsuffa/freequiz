# Request 023: Editable AI prompts and stronger generation quality

## Goal
Move the AI Extract and Generate instructions out of `src/domain.ts` into plain-text files that are easier to review and edit. Improve learning coverage and preserve detailed, explicit requirements for high-quality multiple-choice questions.

## Requirements
- Store Extract instructions in `src/prompts/extract.txt` and Generate instructions in `src/prompts/generate.txt`.
- Bundle prompt files at build time using Vite raw imports. Do not fetch them from a server or introduce backend/API behaviour; the app remains local-first and offline-compatible.
- Keep prompt selection, schema instructions, provenance assignment, and insertion of the user's supplied existing section catalogue in `src/domain.ts`.
- Keep section instructions generic. The AI should use the section catalogue supplied by Freequiz, not assume that users' source files or section catalogues have any particular filename or directory.
- When the external AI environment supports naming output files, instruct it to preserve the source PDF/note filename exactly. Do not hard-code any expected source filename.
- Keep Extract strict: extract only explicitly posed questions, preserve wording/order/options, never guess answers, and report unresolved items separately from importable JSON.
- Expand Generate learning coverage to include core examinable concepts, definitions, formulas, mechanisms, relationships, and reasoning. Avoid trivia, metadata, author names, publication years, and memorising arbitrary numbers from example-company datasets unless genuinely examinable.
- Keep the question-quality instructions separate and explicit: distractor quality, answer-length and option balance, correct-answer position balance, ambiguity/clue prevention, and final quality audit must each remain individually identifiable sections. Do not compress these into a generic instruction to write good questions.
- Preserve the existing JSON schema, answer modes, provenance, section-ID behaviour, and optional omission of the existing section catalogue.
- Add regression tests for prompt loading, section handling, generic filenames, comprehensive coverage, and explicit question-quality rules.
- Update the Knowledge Base and verify tests, type checking, and the production build.

## Implementation notes
- Prompt text is imported as build-time raw text. This keeps the deployed app independent of network availability.
- The common JSON schema and dynamic section catalogue remain code-generated, avoiding hard-coded or duplicated user-specific section data in the text files.
- The prompts use generic wording such as “the supplied source” and “the supplied section catalogue”; they must not mention a particular filename such as `quiz-sections.json`.

## Verification status
Implementation is on branch `implement/023-editable-ai-prompts`. Automated checks and PR review are pending. No merge or deployment is claimed.
