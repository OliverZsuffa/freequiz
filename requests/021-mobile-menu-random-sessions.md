# Request 021: Mobile menu regression, random session selection, and default question count

## Status

- Plan drafted for approval.
- Do not implement until Oliver explicitly approves this plan.

## Problems and desired behaviour

### 1. Restore the More menu on phones

The previous desktop menu fix removed the portal and rendered the menu inside `.top-actions`. Current CSS hides `.top-actions .button-quiet` at viewport widths up to 430px, which hides the More trigger itself. Restore a visible, usable More trigger on mobile and keep the menu reachable without clipping or placing it far down the page.

Requirements:
- Desktop: menu remains anchored to the More trigger in the header and overlays page content correctly.
- Mobile, including widths at or below 430px: More trigger is visible and tappable; menu opens, remains within the viewport, and its entries can be selected.
- Preserve existing navigation actions and dismiss/close behaviour.
- Add regression coverage for mobile trigger visibility/interaction and desktop anchoring. Avoid a CSS-only fix that silently hides other quiet buttons if the selector can be scoped to the intended control.

### 2. Random question selection

Observed current implementation:
- Session setup computes the candidate pool from the questions that match the active filters and selected source.
- `start()` shuffles the candidate questions and takes the requested count; `beginSession()` shuffles the chosen IDs again.
- Exam startup also shuffles the filtered candidate pool before taking the requested count.
- Answer options are shuffled for each session as well.

Keep this behaviour and add or adjust tests so the contract is explicit:
- If 170 questions match and the user requests 10, select 10 distinct questions from those 170, at random, not the first 10 in the current list order.
- If the user requests all 170, all 170 are included exactly once in a shuffled order.
- No question outside the active filters/source may enter the session.
- Practice and exam setup both respect the requested count and filtered pool.
- Do not promise a mathematically guaranteed different order on every run; randomness can occasionally produce the same order.

### 3. Default question count

- Change the initial default from 10 to 30.
- Keep the selected count clamped to the available matching question count when opening setup, and keep validation for manual input.
- When fewer than 30 questions match, start with the available count rather than an invalid count.
- Do not overwrite an intentional user-selected count except where existing setup logic already clamps it to the available pool.

### 4. Explain all question states

Add a clear explanation to the existing in-app help (or the most appropriate existing help location) for mastery states and separate question flags. Use the current implementation as the source of truth.

Mastery states, determined by the two most recent recorded attempts:
- **New** (`new`): no recorded attempts.
- **Learning** (`learning`): the most recent attempt is correct and the question is not yet known; this includes one correct attempt or a latest-correct mixed recent history.
- **Known** (`known`): the two most recent attempts are both correct.
- **Needs work** (`needs-work`): the most recent attempt is incorrect but the two most recent attempts are not both incorrect; includes one incorrect attempt or a latest-incorrect mixed recent history.
- **Weak** (`weak`): the two most recent attempts are both incorrect.

Important clarification: mastery is recalculated from the latest attempts, not a permanent label or lifetime percentage. An answer marked correct requires an exact match to the expected answer under the current answer-mode rules.

Explain separately that **favourite** and **deferred** are independent flags, not mastery states:
- Favourite: user-marked for quick access/revision.
- Deferred: explicitly set aside for later; practice can mark a question deferred when skipped, and exam marking behaviour is handled separately.
- Provenance/source labels (such as AI-Generated, AI-Extracted, professor-written) are metadata, not mastery states.
- A question may simultaneously be Known and favourited, or Weak and deferred, etc.

Verify wording against the current UI and defer behaviour before finalizing the help text; do not imply that a skipped question counts as a wrong answer unless the current code actually records an incorrect attempt.

## Implementation approach

1. Inspect the mobile/desktop header CSS and the menu regression introduced by the prior change; scope responsive styling to the actual intended control/menu.
2. Add tests that assert the More trigger remains present and usable at mobile viewport sizes and that the menu remains anchored on desktop.
3. Confirm session candidate-pool construction for both practice and exam flows; add tests for random sampling, no duplicates, pool membership, and full-pool inclusion. Prefer a testable selection helper if that simplifies reliable tests without unnecessary refactoring.
4. Set the initial question count to 30 and retain the existing available-count clamp and validation.
5. Add user-facing descriptions of mastery states and independent flags to the existing help interface.
6. Run the full automated test suite, type checking, and production build. Review the diff for unintended layout or session behaviour changes.

## Acceptance criteria

- More menu is visible, opens, and works on narrow mobile screens (including <=430px) and remains correctly positioned on desktop.
- Practice/exam selection takes a random sample from the currently eligible pool, without duplicates or out-of-filter questions.
- Requesting the entire pool includes every eligible question exactly once in randomized order.
- Default session size is 30, limited appropriately when fewer eligible questions exist.
- Help explains all five mastery states accurately and distinguishes them from favourite/deferred/provenance metadata.
- CI tests, type checking, and production build pass before merge.
- Do not merge until Oliver explicitly asks for the merge.
