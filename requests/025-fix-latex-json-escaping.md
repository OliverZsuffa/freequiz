# Request 025: Fix LaTeX escaping in AI-generated JSON

## Status

Implementation plan only. Awaiting approval before changing application code.

## Problem

Request 024 added local rendering for LaTeX delimiters `\\(...\\)` and `\\[...\\]`. However, the shared AI prompt instructions appear to describe JSON escaping at the wrong level. AI output can therefore contain too many backslashes, producing a prompt that the renderer cannot recognise or invalid JSON. The observed example preview showed the delimiter not being rendered.

## Goals

1. Make the AI instructions describe JSON escaping precisely, with an example that is valid when pasted directly into Freequiz's JSON import.
2. Ensure parsed question text contains one literal backslash before each LaTeX delimiter character, e.g. `\(x^2 = 4\)`.
3. Add tests that distinguish the JSON source text from the decoded question string and catch over-escaping.
4. Keep ordinary text, imports, exports, and backup data unchanged apart from correctly interpreted formula delimiters.

## Implementation plan

### Phase 1: Confirm the escaping layers

- Inspect the shared schema instructions in `src/domain.ts`, the JSON import parser, and the `MathText` delimiter matcher.
- Establish examples at both layers:
  - JSON source text: `"prompt": "Solve \\\\(x^2 = 4\\\\)."`
  - Decoded question text: `Solve \\(x^2 = 4\\).`
- Ensure the instructions shown to the external AI say that each LaTeX backslash is represented by exactly two backslash characters in the JSON source, not four.
- Ensure inline and display examples are consistent and copyable.

### Phase 2: Correct the shared AI instructions

- Update the common instructions injected into both Extract and Generate modes.
- Use one minimal valid JSON example for inline math and one for display math.
- Explain that JSON parsing converts each doubled backslash to one literal backslash, and that the decoded question text must contain `\\(...\\)` or `\\[...\\]`.
- Avoid adding extra escaping layers in the human-facing explanation.

### Phase 3: Regression tests

- Test that the corrected prompt instructions explicitly specify two backslashes in JSON source text.
- Parse a JSON example containing inline and display formulas and assert the resulting question text contains exactly one backslash per delimiter.
- Pass the decoded strings through `MathText` and assert KaTeX markup is produced.
- Include a negative case for over-escaped delimiters so the expected behavior is explicit.

### Phase 4: Verify

- Run targeted prompt/import/render tests, the full test suite, TypeScript checking, production build, and offline-build validation.
- Review the final generated prompt text, not just the TypeScript source literal.
- Record the exact CI run and distinguish automated checks from a real browser preview.
- After approval and merge, check the main-branch workflow; perform a browser smoke test if a browser environment is available.

## Acceptance criteria

- Both AI prompt modes instruct the model to use exactly doubled backslashes in JSON source text.
- `{"prompt":"Solve \\\\(x^2 = 4\\\\)."}` parses to a prompt containing `Solve \\(x^2 = 4\\).`.
- The decoded prompt renders as math in `MathText`.
- No unrelated prompt or question data behavior changes.
- Automated verification passes; manual browser verification is reported separately.

## Scope exclusions

- Do not change the LaTeX delimiters supported by the renderer.
- Do not silently rewrite arbitrary imported question strings or guess whether malformed JSON was intended to contain LaTeX.
- Do not claim the preview works until the decoded-string-to-renderer path is covered and, where possible, manually checked.
