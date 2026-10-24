# Request 007: More reliable AI question generation

## Problem
Generated questions still use phrases such as “according to the course slides”, the output can be too small for the material, and the AI repeats the existing section tree even when Freequiz supplied it.

## Scope
- Make source-referencing language a strict prohibition in generated question stems and explanations, except when the source itself is genuinely being tested.
- Require topic mapping, substantial coverage across major topics, multiple distinct questions for each substantial topic, and a final coverage-gap audit. Avoid arbitrary hard caps, padding, and near-duplicates.
- When existing sections are supplied, treat them as a catalogue for assignment only. Reuse exact IDs in question sectionId values; output only genuinely new section definitions, and output an empty sections array when existing sections suffice.
- Add regression tests for prompt instructions and importing a question that references an existing section without repeating its definition.
- Update the knowledge base and README; run tests, typecheck, build, and inspect the GitHub Pages workflow.

## Acceptance criteria
- Generated prompt explicitly forbids “according to the slides/lecture/course material” and equivalent source references in ordinary question stems.
- Generated prompt requires comprehensive topic coverage, at least three distinct questions per substantial topic where the source supports it, and a coverage-gap check, without encouraging filler.
- Existing sections are never to be returned in the output sections array. Existing IDs are still valid question sectionId references; only genuinely new sections are returned.
- Regression tests cover each requirement and the no-repeated-section import case.
- All automated checks are reported accurately. Manual browser/device testing is reported separately.
