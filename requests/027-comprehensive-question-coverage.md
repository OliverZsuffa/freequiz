# Request 027: Prevent under-generation and clarify subsection creation

## Status

Implemented in [PR #50](https://github.com/OliverZsuffa/freequiz/pull/50). PR workflow [41028114284](https://github.com/OliverZsuffa/freequiz/actions/runs/41028114284) passed the automated checks and Pages artifact build. Main-branch deployment is pending merge.

## Problem

The Generate prompt already asks for a comprehensive question bank and suggests several questions for substantial topics. In practice, an AI can still produce too few questions by treating broad topic coverage as sufficient and stopping after a small representative selection. The section rules also leave room for confusion about when and how to create new subsections beneath existing sections.

The goal is to make the expectation of a large, thorough question bank explicit and make subsection creation unambiguous, without fixed question-count targets or a substantial increase in prompt length.

## Proposed changes

### 1. Make Generate produce many questions

Tighten the existing **LEARNING COVERAGE** section in `src/prompts/generate.txt`:

- Explicitly say to create a large, thorough question bank and to err on the side of generating more useful questions rather than fewer.
- Make clear that mentioning every major topic once, or creating only a few representative questions, is insufficient.
- Cover the full depth of the source: meaningful subtopics, individual examinable concepts, definitions, details, examples, formulas, distinctions, relationships, and applications.
- Do not compress several independently examinable ideas into one broad question merely to keep the bank short.
- Continue generating distinct, useful questions wherever the source supports them. Vary the tested aspect (recall, explanation, comparison, application, reasoning, misconceptions) rather than repeating the same question.
- Keep the existing prohibition on padding, trivia, and near-duplicates. Do not add a fixed total, fixed questions-per-page rule, or arbitrary maximum.

Keep this concise by replacing or tightening existing wording rather than adding a long new section.

### 2. Clarify when and how to create subsections

Clarify the **SECTION FORMAT AND ASSIGNMENT** rules in the shared section instructions in `src/domain.ts`:

- An existing section catalogue is the starting hierarchy, not a reason to force every question into a broad parent section.
- When the source contains a meaningful subtopic that deserves its own section and no existing subsection represents it, create a new subsection under the best-fitting existing parent. Set its `parentId` to that existing section's ID.
- New sections may also be nested beneath other newly created sections when that better reflects the source's structure.
- Reuse existing sections where they genuinely fit; do not create a subsection for every minor detail or duplicate an existing section.
- Assign each question to the most specific appropriate existing or newly created section.
- Keep the existing output contract: return only genuinely new section definitions; never repeat or redefine existing sections. Ensure every new section is used and every `parentId` points to a valid existing or newly returned section.

Also clarify that when no existing catalogue is supplied, the AI should create a useful hierarchy with subsections where the source's structure and topic depth warrant them, rather than flattening everything into a few broad sections. Avoid unnecessary nesting.

### 3. Regression tests

Update prompt-contract tests in `src/domain.test.ts` to verify that:

- Generate explicitly asks for a large, thorough question bank and favors more useful questions over a small representative sample.
- It covers meaningful subtopics and distinct examinable details, without introducing a fixed overall count or page quota.
- It retains the existing no-padding/no-near-duplicate rule.
- With an existing catalogue, the prompt explicitly permits meaningful new child sections under existing parents, while prohibiting redefinition or duplication of existing sections.
- Without an existing catalogue, the prompt supports a useful hierarchy with appropriate subsections.
- Question assignment favors the most specific appropriate section.

Keep tests focused on required behavior rather than exact full prompt wording.

### 4. Keep Extract behavior unchanged

Do not change the extraction prompt's source-faithfulness requirements or encourage it to invent questions. Shared section instructions may become clearer about valid subsection structure, but must not weaken Extract's existing-section reuse and output constraints.

### 5. Documentation

After approval and implementation, add the request and execution record to `knowledge/README.md`, preserving the repository's existing request-history format.

## Acceptance criteria

- Generate clearly asks for many questions and a large, thorough bank, without any fixed total or per-page quota.
- Coverage includes meaningful subtopics and smaller examinable details; the AI must not stop after a few representative questions.
- More questions are encouraged when they test distinct useful material; padding and near-duplicates remain prohibited.
- The AI can create meaningful new subsections beneath existing sections, using valid `parentId` references, and assigns questions to the most specific fitting section.
- Existing sections are reused, never redefined or duplicated; unnecessary section proliferation is avoided.
- Extract remains source-faithful and does not invent questions.
- Existing schema, provenance, section, distractor, answer-balance, ambiguity, and LaTeX requirements remain intact.
- Prompt-contract tests, full test suite, TypeScript check, production build, and offline-build validation pass.

## Scope exclusions

- No fixed question-count requirement or page-based quota.
- No weakening of Extract's source-faithfulness rules.
- No changes to the question-bank schema, UI, import behavior, or prompt-generation pipeline.
- No unrelated prompt rewrites or substantial prompt-length increase.

## Implementation workflow

After approval: update the Generate coverage wording, clarify shared section rules, add focused regression tests, update the Knowledge Base, run all required checks, open a pull request, and wait for explicit approval before merging.
