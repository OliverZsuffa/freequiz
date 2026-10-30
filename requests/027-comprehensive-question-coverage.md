# Request 027: Prevent under-generation in large-source question banks

## Status

Proposed plan; awaiting Oliver's approval. No implementation changes have been made.

## Problem

The Generate prompt already asks for a comprehensive question bank, identifies topics before drafting, and checks for coverage gaps. In practice, an AI can still produce a relatively small set by treating broad topic coverage as sufficient and stopping after a few representative questions. This is especially problematic for long, information-dense PDFs.

The goal is to make the expected depth of coverage unmistakable without imposing a fixed question count or making the prompt substantially longer.

## Proposed changes

### 1. Strengthen the existing learning-coverage instructions

Edit only the **LEARNING COVERAGE** section in `src/prompts/generate.txt`:

- Make clear that covering every major topic is not enough: meaningful subtopics and examinable details throughout the source must also be represented.
- Require enough distinct questions to practise the material in depth, rather than a small representative selection.
- Make question quantity follow the amount and depth of examinable material. Do not impose a fixed total, fixed questions-per-page rule, or arbitrary maximum.
- Encourage multiple questions for a concept when they test genuinely different aspects (for example recall, explanation, comparison, application, or misconceptions), while avoiding superficial variations.
- Strengthen the final coverage check so it compares the generated questions against the identified topic/subtopic coverage and expands areas that are missing or too thin.

Keep the wording concise by replacing or tightening the existing coverage paragraph rather than adding a long new section.

### 2. Keep Extract unchanged

`src/prompts/extract.txt` has a different purpose: it must extract only questions explicitly present in the source. Do not encourage it to invent additional questions or change its strict source-faithfulness rules.

### 3. Regression tests

Update the prompt-contract tests in `src/domain.test.ts` to verify that the composed Generate prompt:

- Requires comprehensive coverage at both topic and subtopic/detail level.
- Does not settle for a small representative sample.
- Calls for a final coverage-gap check and expansion of thin areas.
- Does not introduce a fixed overall question count or a per-page quota.
- Retains the existing no-padding/no-near-duplicate rule.

Keep the existing Extract tests confirming that extraction remains faithful and does not invent questions. Avoid brittle tests that assert the exact full wording of the prompt.

### 4. Documentation

Add the approved request and execution record to `knowledge/README.md`, preserving the repository's existing request-history format.

## Acceptance criteria

- Generate clearly prioritises comprehensive, in-depth coverage of the supplied material, including meaningful subtopics and smaller examinable details.
- The prompt does not prescribe a fixed total number of questions, a page-based quota, or an arbitrary maximum.
- More questions are encouraged only when they cover distinct, useful material; padding and near-duplicates remain prohibited.
- Extract behavior and all existing schema, provenance, section, distractor, answer-balance, ambiguity, and LaTeX instructions remain unchanged.
- Prompt-contract tests, full test suite, TypeScript check, production build, and offline-build validation pass.

## Scope exclusions

- No fixed question-count requirement.
- No changes to Extract behavior.
- No changes to the question-bank schema, UI, import behavior, or prompt-generation pipeline.
- No unrelated prompt rewrites or substantial prompt-length increase.

## Implementation workflow

After approval: update the Generate prompt and focused tests, update the Knowledge Base, run all required checks, open a pull request, and wait for explicit approval before merging.
