# Request 026: Make AI-generated LaTeX unambiguous

## Status

Approved by Oliver on 2026-10-29. Implementation is in [PR #49](https://github.com/OliverZsuffa/freequiz/pull/49). PR workflow [40930112083](https://github.com/OliverZsuffa/freequiz/actions/runs/40930112083) passed. The PR deployment job was skipped as expected; main-branch deployment and manual browser verification are not claimed.

## Problem

Request 025 clarified JSON escaping for LaTeX delimiters, but a real generated question bank still contains formulas that are unlikely to render correctly. For example, some options split a single equivalence across separate dollar-delimited fragments, leaving \iff and other operators outside math mode. The bank also uses $...$ delimiters, while Freequiz's bundled MathText renderer currently supports \(...\) for inline math and \[...\] for display math.

This means the instructions need to explain more than backslash escaping: they must specify which delimiters Freequiz actually renders, how to wrap a complete expression, and how to serialize it in JSON.

## Goals

1. Make the shared AI instructions explicit enough that both Extract and Generate produce LaTeX compatible with Freequiz's renderer.
2. Explain the distinction between JSON-source escaping and the decoded question string using minimal, copyable examples.
3. Prevent formulas from being accidentally split across math and ordinary text.
4. Keep Extract faithful to source content and avoid silently changing mathematical meaning.
5. Add regression tests for the prompt contract and representative malformed patterns without pretending tests can guarantee every external AI response is correct.

## Implementation plan

### Phase 1: Confirm the current pipeline

- Inspect the shared schema and mathematical-notation instructions in src/domain.ts, the Extract and Generate prompt files, JSON import parsing, and MathText.
- Confirm exactly which delimiters the renderer supports and how generated prompt text is assembled for both modes.
- Keep this change scoped to AI prompt clarity and regression coverage unless inspection finds a small necessary integration adjustment.

### Phase 2: Rewrite the shared LaTeX instructions

Update the shared instructions consumed by both AI modes with these explicit rules:

- Use only the delimiters Freequiz currently supports: \(...\) for inline mathematics and \[...\] for display mathematics. Do not use $...$ or $$...$$, because the current renderer does not recognise them.
- Put each complete mathematical expression inside one matching pair of delimiters. Do not close math mode around individual variables or fragments, and do not leave operators such as \iff, \rightarrow, \land, or \neg outside the expression when they are part of the formula.
- Use valid LaTeX commands for mathematical operators, for example \land instead of the plain-text word AND inside a formula.
- In the JSON source, encode each literal LaTeX backslash as exactly two backslash characters. After JSON parsing, the question string must contain exactly one backslash for each LaTeX command or delimiter.
- Show the same example at both layers so the AI cannot confuse JSON text with the decoded string.

Required inline example, as JSON source:

    {
      "prompt": "Solve \\(x^2 = 4\\)."
    }

The decoded prompt string must be:

    Solve \(x^2 = 4\).

Required display example, as JSON source:

    {
      "prompt": "Find the roots: \\[x^2 = 4\\]"
    }

The decoded prompt string must be:

    Find the roots: \[x^2 = 4\]

Required formula example, as JSON source:

    {
      "text": "\\((A \\rightarrow B) \\iff (\\neg A \\rightarrow \\neg B)\\)"
    }

The decoded text must be one complete inline formula:

    \((A \rightarrow B) \iff (\neg A \rightarrow \neg B)\)

- Include a clear bad-versus-good example based on the observed output, showing that fragments such as ($A ... $) \iff ($...$) are wrong because they mix delimiters and leave part of the formula outside math mode.
- State that the AI must validate every formula in prompts, options, and explanations before returning JSON: matching supported delimiters, no accidental fragments, and no unnecessary extra escaping.
- In Extract mode, preserve source wording and mathematical meaning. Repair only formatting needed to produce valid, renderable output; if the source itself is ambiguous or cannot safely be repaired, retain the source content as faithfully as possible and flag the item in the separate review report rather than guessing.
- Keep the shared rule in one place so Extract and Generate do not drift.

### Phase 3: Regression coverage

- Assert that both final composed AI prompts contain the supported-delimiter rule, the single-pair rule, the JSON escaping explanation, and the correct inline/display examples.
- Add a regression fixture resembling the reported question with an implication/equivalence formula in an answer option. Verify that the corrected representation has one complete math span and no dollar delimiters.
- Parse the JSON fixture and assert that its decoded strings contain single backslashes, not over-escaped delimiter sequences.
- Pass supported inline and display examples through MathText and assert they render as math.
- Add negative prompt/fixture assertions for dollar delimiters, fragmented math spans, and over-escaped delimiters so these failure modes remain visible.
- Keep the tests scoped to deterministic local behavior. Do not claim that prompt tests can guarantee a third-party AI will always comply.

### Phase 4: Verify and report

- Run the relevant prompt, JSON parsing, and MathText tests.
- Run the full test suite, TypeScript checking, production build, and offline-build validation.
- Inspect the final composed prompt strings, not only source literals, to confirm the examples show the correct number of backslashes at each layer.
- Report PR CI, main-branch deployment, and manual browser/visual testing separately. Do not claim a live preview or manual check without evidence.

## Acceptance criteria

- Both Extract and Generate clearly specify the renderer-supported delimiters and explicitly prohibit dollar delimiters unless support for them is deliberately added in a separate approved scope.
- Every formula example encloses the complete expression in one matching math span.
- The prompt distinguishes JSON source (two backslash characters per LaTeX backslash) from decoded question text (one backslash).
- The reported equivalence-formula failure is represented in regression coverage.
- Corrected inline and display formulas render through the existing local MathText path.
- Extract preserves the original meaning and does not invent missing mathematical content.
- All available automated checks pass, with deployment and manual verification reported only when actually confirmed.

## Scope exclusions

- Do not change the question-bank schema or stored question format.
- Do not silently rewrite existing imported question text.
- Do not add dollar-delimiter support to the renderer unless separately justified and approved.
- Do not alter mathematical meaning, answer keys, or unrelated AI question-quality rules.
- Implementation requires explicit approval of this plan (received on 2026-10-29).


## Execution record

- Updated the shared mathematical-notation instructions in `src/domain.ts`, which are inserted into both Extract and Generate prompts.
- Explicitly prohibited dollar math delimiters because the current `MathText` renderer only interprets `\\(...\\)` and `\\[...\\]`.
- Added full-formula versus fragmented-formula examples and made the JSON-source versus decoded-string escaping distinction explicit.
- Added prompt-contract assertions in `src/domain.test.ts` and a JSON-to-renderer regression test for an implication/equivalence formula in `src/components/MathText.test.tsx`.
- Proposed in [PR #49](https://github.com/OliverZsuffa/freequiz/pull/49).
- PR workflow [40930112083](https://github.com/OliverZsuffa/freequiz/actions/runs/40930112083) passed 105 tests across 5 files, TypeScript checking, production build, offline-build validation, Pages configuration, and artifact upload.
- The workflow's deployment job was skipped on the pull request as expected. Main-branch deployment has not been checked because the PR has not been merged. Manual browser/visual testing has not been performed.
