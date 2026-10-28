# Request 021: Mobile study usability, random sessions, and question mastery

## Status

- Updated implementation plan awaiting Oliver's approval.
- Documentation only at this stage. Do not implement until Oliver explicitly approves this plan.
- Do not merge until Oliver explicitly asks for the merge.

## 1. Fix the More menu on mobile

The previous desktop menu change moved the menu into `.top-actions`. The responsive rule that hides `.top-actions .button-quiet` at widths up to 430px can hide the More trigger itself.

Requirements:
- Keep the More trigger visible and tappable on narrow phones, including widths at or below 430px.
- The menu must open, stay within the viewport, and allow its entries to be selected without clipping.
- On desktop, keep the menu correctly anchored to its header trigger and overlay page content.
- Preserve existing navigation, dismissal, and close behaviour.
- Scope responsive styling to the intended control rather than accidentally hiding unrelated quiet buttons.

## 2. Make the question dialogue compact on phones

Remove the large **“one question at a time”** headline; it adds no useful information to the study screen.

Reduce wasted vertical space in the question dialogue, including oversized headings, padding, margins, and controls where appropriate. Keep the question, answer options, and answer/navigation controls visible together on a phone wherever practical, so users normally do not need to scroll while answering.

Test at narrow mobile viewport sizes with typical questions, long question text, and questions with many answer options. Use space efficiently and avoid unnecessary scrolling, while ensuring content remains reachable and usable when a question genuinely cannot fit in the available viewport. Do not remove useful question content or make controls too small to tap.

## 3. Verify random session selection

The current implementation appears to filter eligible questions, shuffle the candidate pool, and take the requested number for practice and exams. Keep the intended behaviour and make it explicit through tests:
- If 170 questions match and the user requests 10, select 10 distinct questions from the eligible pool rather than always taking the first 10 in list order.
- If the user requests all 170, include every eligible question exactly once in shuffled order.
- Never include questions outside the active filters or selected source.
- Both practice and exam sessions must respect the requested count and eligible pool.
- Randomness does not guarantee a different order on every run; do not test for an impossible guarantee.
- Retain answer-option shuffling where currently supported.

Prefer a testable selection helper if it improves test quality without unnecessary refactoring.

## 4. Change the default session size to 30

- Change the initial question-count default from 10 to 30.
- Clamp the count to the number of currently eligible questions when opening session setup. If fewer than 30 questions match, default to that available count.
- Retain validation for manual input and do not overwrite an intentional user-selected count except where existing logic needs to clamp it to the eligible pool.

## 5. Use four mastery states

Replace the current five-state mastery logic with these four states, based on the two most recent recorded attempts:

- **New** (`new`): no attempts recorded.
- **Learning** (`learning`): only one attempt has been recorded, or the two most recent attempts have mixed results (one correct and one incorrect).
- **Weak** (`weak`): the two most recent attempts were both incorrect.
- **Known** (`known`): the two most recent attempts were both correct.

Keep the internal value `known` and the user-facing name **Known**. Remove the `needs-work` mastery state and update all dependent logic, filters, counts, styles, labels, and tests. A single incorrect attempt is Learning, not a separate state. Mastery reflects recent attempts, not a lifetime percentage or permanent label.

## 6. Keep the homepage mastery bar as one continuous line

Keep one continuous horizontal bar divided into four adjacent segments, with no separate bars or gaps. The order must be:

**New → Weak → Learning → Known**

- New: gray.
- Weak: red.
- Learning: yellow.
- Known: green.
- Each segment's width represents that state's share of all questions.
- Show the count and label for each state.
- New must be its own gray segment, not grouped with Learning or Known.
- Update the bar's accessible description to communicate all four counts/states.
- Handle an empty question set without invalid widths or misleading counts.

## 7. Explain mastery and independent flags in the in-app help

Add clear, user-facing explanations in the existing help interface or the most appropriate current help location. Match the actual behaviour in code.

Explain the four mastery states using the definitions in section 5. Clarify that:
- A correct answer is determined by the current answer-mode rules.
- Mastery is recalculated from recent recorded attempts.
- **Favourite** is an independent user-set flag for quick access or revision.
- **Deferred** is an independent flag for setting a question aside for later. Verify current practice and exam behaviour before describing how it is set.
- Source/provenance labels, such as AI-Generated, AI-Extracted, or professor-written, are metadata, not mastery states.
- These properties can coexist: for example, a question can be Known and favourited, or Weak and deferred.
- Skipping must not be described as a wrong answer unless the code actually records an incorrect attempt.

## Implementation approach

1. Inspect the current header/menu styles and question-dialogue layout before changing them; identify the specific rules and components responsible for mobile visibility and excess vertical space.
2. Fix the More trigger/menu responsively and add regression tests for mobile visibility, opening, selecting entries, viewport containment, and desktop anchoring.
3. Inspect both practice and exam candidate-pool flows; add tests for random selection, requested count, no duplicates, filter/source membership, and full-pool inclusion.
4. Change the default question count to 30 while preserving clamping and manual-input validation.
5. Update mastery calculation to the four-state model; search for and remove all obsolete `needs-work` handling without changing unrelated question flags.
6. Update the homepage's single continuous mastery bar, state order, colours, labels, counts, proportions, and accessible description.
7. Add and verify the in-app help explanations for mastery, favourite, deferred, and source/provenance metadata.
8. Run the full automated test suite, type checking, and production build. Review the diff for unintended changes. Check the responsive layout at narrow mobile sizes, including long questions and many options, using available automated/browser checks; clearly report any manual-device checks that were not performed.

## Acceptance criteria

- More is visible and usable on phones at or below 430px, the menu remains within the viewport, and desktop positioning still works.
- The oversized “one question at a time” headline is gone and the question dialogue is compact; typical questions can be answered on a phone without scrolling, with long-content cases remaining usable.
- Practice and exam sessions select only eligible questions, without duplicates, and respect the requested count; requesting the full pool includes every eligible question once in shuffled order.
- The initial question count is 30 and is limited to the available eligible questions.
- Exactly four mastery states remain: New, Weak, Learning, Known. One attempt maps to Learning; mixed latest two attempts map to Learning; two incorrect map to Weak; two correct map to Known.
- The homepage uses one continuous bar ordered New (gray), Weak (red), Learning (yellow), Known (green), with proportional segments and separate counts/labels.
- In-app help explains mastery and distinguishes it from favourite, deferred, and provenance/source metadata.
- Automated tests, type checking, and production build pass before merge.
- Wait for Oliver's explicit approval before implementing; wait for a separate explicit merge instruction before merging.
