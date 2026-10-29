# Request 024: LaTeX rendering and explicit AI JSON schema

## Status

Implementation in progress on `implement/latex-rendering-and-ai-json-schema`.

## Goals

1. Make both AI prompt modes describe the exact `freequiz/questions-v1` JSON contract.
2. Support LaTeX in question prompts, answer options, and explanations.
3. Keep raw source strings unchanged in imports, exports, and backups.
4. Bundle rendering locally for offline use; no API, backend, or external runtime dependency.
5. Accept imported section objects using `title` as an alias for `name`.

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
- Pull request CI is reviewed before reporting completion. Manual visual and offline smoke tests remain distinguished from automated checks.
