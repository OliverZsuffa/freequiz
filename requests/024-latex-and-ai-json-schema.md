# Request 024: LaTeX rendering and explicit AI JSON schema

## Status

Implementation is proposed in [PR #47](https://github.com/OliverZsuffa/freequiz/pull/47). This document includes the implementation plan as well as the execution record. Automated checks passed in [workflow run 40921538249](https://github.com/OliverZsuffa/freequiz/actions/runs/40921538249): 101 tests, TypeScript check, production build, offline-build validation, and Pages artifact upload. The PR is not merged. Manual visual/offline smoke testing remains outstanding.

## Problem and goals

1. Make both AI prompt modes describe the exact `freequiz/questions-v1` JSON contract so generated imports use the schema Freequiz actually accepts.
2. Support LaTeX in question prompts, answer options, and explanations.
3. Keep raw formula source strings unchanged in imports, exports, and backups.
4. Bundle rendering locally for offline use; do not add an API, backend, or remote runtime dependency.
5. Accept imported section objects using `title` as a compatibility alias for `name`, and migrate previously stored title-only section objects on app load.

## Implementation plan

### Phase 1: Specify the import contract

- Inspect the existing parser, both AI prompt modes, section representation, and question types before changing behavior.
- Add one shared set of schema instructions to the Extract and Generate prompts so the two modes cannot drift.
- Document the exact top-level `format`, `sections`, and `questions` structure; required question fields and types; option IDs and answer-key references; answer modes; section references; provenance and tags; and JSON escaping for LaTeX backslashes.
- Tell the AI to use section objects with `id`, `name`, and `parentId`, reuse IDs from the supplied catalogue, and return an empty sections array when no new sections are required.
- Add backwards-compatible import normalisation for section objects that use `title` instead of `name`. Validate required identifiers/names and duplicate section IDs rather than silently accepting malformed section definitions.

### Phase 2: Render LaTeX locally

- Add KaTeX as a bundled dependency and import its stylesheet locally.
- Create a shared math-text renderer for inline `\\(...\\)` and display `\\[...\\]` delimiters.
- Use the renderer consistently for study question text, answer options, explanations, question-library previews, and a live preview in the manual editor.
- Keep formula source strings in the existing data model. Rendered HTML must not replace the source used by import/export/backup.
- Render malformed formulas safely without crashing; disable KaTeX trust features so imported formula content cannot inject trusted HTML.
- Ensure the build bundles the renderer and styles so formula display does not require a network connection.

### Phase 3: Preserve existing saved data

- Normalise saved profile section objects and import-history section snapshots on app load, including legacy records containing only `title`.
- Keep stable section IDs and parent references so nested section relationships and question references continue to work.
- Save the normalised store through the existing persistence path.

### Phase 4: Regression coverage and verification

- Test inline formulas, display formulas, and malformed-formula handling.
- Test section `title` compatibility and explicit schema instructions in both AI prompt modes.
- Run the test suite, TypeScript checking, production build, offline-build validation, and the GitHub Pages artifact workflow.
- Record exactly which checks passed. Do not represent automated tests as proof of browser rendering, installability, or offline behavior.
- After merge, check the main-branch workflow and deployment status; manual visual/browser/offline smoke testing remains a separate check if no real browser session is available.

## JSON contract requirements

- Explicit top-level `format`, `sections`, and `questions` fields.
- Section objects use `id`, `name`, and `parentId`; `name` is the display label. Import also accepts `title` as a compatibility alias.
- Question objects explicitly describe required fields and types, including unique IDs, option objects, answer-key IDs, answer mode, section references, explanation, tags, and provenance.
- Existing section IDs must be reused without redefining them; `sections: []` is correct when all questions fit the existing catalogue.
- JSON escaping rules for LaTeX backslashes must be explicit.

## LaTeX requirements

- Recognise `\\(...\\)` inline math and `\\[...\\]` display math.
- Render prompts, answer options, explanations, library previews, and manual editor preview consistently.
- Keep source text unchanged for data portability.
- Invalid formulas must not crash the application.
- No remote service or network access is required to render formulas.

## Acceptance checks

- Automated tests cover prompt schema instructions, `title` to `name` normalisation, inline/display rendering, and malformed formulas.
- TypeScript and production/offline build checks pass.
- Pull request CI is reviewed before reporting completion.
- Main-branch build/deployment status is checked after merge.
- Manual visual and offline smoke tests are reported separately and are not implied by CI.

## Execution record

- Implemented on branch `implement/latex-rendering-and-ai-json-schema` in [PR #47](https://github.com/OliverZsuffa/freequiz/pull/47).
- `src/domain.ts` adds shared explicit JSON schema instructions for Extract and Generate and normalises imported section `title` to `name`.
- `src/components/MathText.tsx` adds locally bundled KaTeX rendering for inline/display formulas with safe handling of malformed formulas.
- `src/App.tsx` renders formulas in study content and editor preview and normalises stored profile/import-history sections on load.
- `src/components/QuestionList.tsx` renders formulas in question-library content.
- Regression tests cover formula rendering, malformed formulas, schema instructions, and section-name compatibility.
- PR workflow [40921538249](https://github.com/OliverZsuffa/freequiz/actions/runs/40921538249) passed all 101 tests across 5 test files, TypeScript checking, Vite production build, offline-build validation, Pages configuration, and artifact upload. The workflow's deploy job was skipped on the pull request as expected.
- The passing run was for code commit `4b132470474823ce09aecca621cfe503d599cc55`. The latest PR head at the time of this record is `63a76965f8679336d8adee1baf9c15223c2f6183`, a documentation-only follow-up; its own workflow status should be checked before merge.
- No manual browser, visual, or offline smoke test has been performed.
