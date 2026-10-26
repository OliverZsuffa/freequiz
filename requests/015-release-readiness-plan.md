# Request 015: Release-readiness plan for sharing Freequiz with testers

## Status
**Approved — in progress; not yet fully release-ready.** PRs #18 and #19 are merged. Automated tests/builds and both main-branch deployments passed; manual device/accessibility/offline checks, dependency-audit review, and the 3–5-person trial remain outstanding. This plan consolidates the known menu/filter issue, import/export discoverability, reliability checks, mobile/desktop/offline QA, and the small amount of preparation needed to let friends and students try Freequiz.

## Goal
Make the current Freequiz app dependable and understandable enough for a small group of friends/students to use on phones and desktop computers, including importing question banks shared as files.

This is a bug-fixing and verification pass, not a redesign or a feature-expansion project. The priority is to correct known defects, protect question banks and learning progress, and verify the real app. Do not add accounts, cloud sync, analytics, payments, social features, or a new sharing service.

## Source of truth and scope boundaries
- Request 014 is the detailed plan for the mobile More/sort/filter pop-ups, filter order, and the Import / export destination. Implement that approved work as the first code-change unit; avoid duplicating or contradicting it here.
- Request 011 documents the question-only export and full-profile backup contracts. Reuse these formats and existing flows; do not invent another export/import implementation.
- Request 013 contains a much broader mobile-first UX proposal. This release-readiness pass does **not** implicitly approve implementing all of Request 013. Only address items listed in this plan and necessary fixes uncovered by regression testing.
- Preserve the privacy-first, client-side architecture and the existing question-bank and backup formats.
- Keep the current study-first interface and all existing functionality. Do not simplify by deleting or silently disabling controls.

## Phase 0 — Establish the baseline before changing code
1. Read the current Knowledge Base and Requests 011, 013, and 014, then inspect the actual current code and tests. Treat the live implementation—not an old note or assumption—as the behavior to verify.
2. Run the existing test suite, TypeScript check, and production build before making changes. Record the results and any pre-existing failures.
3. Inspect the current GitHub Actions workflow and current main-branch state. Do not assume a past successful run proves the current branch or live site works.
4. Map the existing More menu, sort/filter pop-ups, Import / export destination, question-only export, full-profile backup, restore, and import preview to their current handlers and tests.
5. If the baseline is failing, isolate and understand the failure before modifying behavior. Do not mix unrelated cleanup into the fix.

**Exit condition:** a written baseline is available and the exact code paths and current behavior are understood before implementation begins.

## Phase 1 — Fix the known menu, filter, and export-discoverability bugs
Implement Request 014 as a focused change, with these release criteria:

### Mobile menus and sorting pop-ups
- Identify the actual layout/positioning cause before changing styles.
- Keep More and sorting/filter pop-ups inside the visible viewport, including short screens, landscape, and safe-area/bottom-navigation constraints.
- Allow long menus to scroll so every option is reachable.
- Preserve focus behavior, keyboard operation, dismissal behavior, touch targets, and all existing menu actions.
- Scope CSS changes to the relevant pop-ups; avoid broad global overlay rules that could break dialogs, import previews, or other menus.

### Question filters
- Put tag search first, provenance and other metadata filters next, and simpler/general searches last.
- On narrow screens, stack controls or use a deliberate compact layout; do not squeeze long selectors into unusable columns.
- Retain every existing filter, multi-select behavior, sorting option, and selected-filter state.
- Ensure labels, selected values, clear/remove actions, and focus states remain readable and operable.

### Import / export destination
- Make the Import / export destination provide clear paths to **Import questions**, **Export questions to share**, **Full profile backup**, and **Backup all profiles**, reusing the existing handlers and formats.
- Explain the privacy boundary in plain language: question-only exports contain question content and relevant sections, not personal study progress; full backups include private profile/progress data.
- Preserve validation/preview before import and existing merge/replace safeguards.
- Check that no export action is duplicated in a confusing way and that every visible action performs the advertised operation. If an export action remains in More as a shortcut, it must not conflict with the dedicated destination.

### Phase 1 regression tests
- Test More-menu navigation and export action wiring, including that the import/export destination exposes both import and export.
- Test the intended filter ordering and ensure multi-select and filter semantics are unchanged.
- Add a regression test for the specific short-viewport menu failure where feasible; DOM tests alone are not evidence of correct real viewport geometry.
- Test dismissal, navigation after choosing an item, and no unintended actions caused by clicks or state changes.
- Add tests for any defect discovered during implementation before considering it fixed.

**Exit condition:** all relevant automated checks pass, the diff is limited to the known bugs and required tests, and a manual narrow-viewport check is ready to be performed.

## Phase 2 — Data-safety and import/export verification
This phase verifies the existing contracts; it must not casually redesign them.

### Question-only export and sharing
- Export a question bank containing nested sections, tags, answer modes, explanations, correct answers, provenance, and varied option counts.
- Confirm the export includes the question content and required section ancestry, and excludes attempts, exam history, favourites, deferred state, groups, profile settings, and other private progress.
- Import the file into a different profile or clean browser profile and verify the questions and required sections arrive intact.
- Re-import the same file. Confirm matching question IDs are handled by the existing merge contract without duplicate questions or accidental overwrites.
- Confirm the receiver's progress, profile settings, and existing questions are not overwritten by a content-only merge.
- Confirm the preview accurately explains new, existing/skipped, section, and invalid-item counts where supported.

### Full-profile backup and restore
- Create a profile containing representative data: questions, nested sections, attempts, favourites, deferred markers, groups, import batches/source filenames, exam sessions/history, profile settings, and profile-specific tag favourites.
- Export a full-profile backup and restore it as a separate profile copy.
- Compare the restored profile with the original across all supported profile data. Apart from explicitly documented collision handling and any intentionally regenerated profile identity/name, the restored copy should be indistinguishable in its content and learning state.
- Confirm existing profiles remain unchanged and question/attempt/import/group/exam IDs and references remain consistent.
- Verify **Backup all profiles** round-trips multiple profiles and the active-profile selection correctly.
- Test ID and name collisions, malformed JSON, malformed backups, empty/invalid files, and cancellation at confirmation. Invalid input must not partially mutate the store.
- Test both file selection and paste/JSON entry if both are supported by the current UI.
- Confirm question-only exports and full backups are recognized as different formats and cannot accidentally be interpreted as one another.

### Import failure and destructive actions
- Test invalid JSON, unsupported format, missing required fields, invalid answers/option references, and malformed section references.
- Confirm the user gets a useful error and existing data remains unchanged on validation failure.
- Confirm merge remains non-destructive and replacement remains explicit, previewed, and protected by deliberate confirmation.
- Confirm canceling an import/restore/replacement leaves data unchanged.
- Do not change duplicate-ID behavior, import semantics, or backup versioning as a side effect of UI fixes. If a real data-loss defect is found, stop and plan the smallest targeted fix with its own regression tests.

**Exit condition:** round-trip and failure tests pass, and no import/export data contract has changed unintentionally.

## Phase 3 — Core study workflow regression
Run and, where necessary, add tests for the normal use cases other people will try first:

1. Open a new profile and identify how to import a bank or create a question.
2. Import a shared bank and understand the preview and merge action.
3. Start practice, answer questions, receive immediate feedback, and confirm progress is recorded.
4. Favourite a question and defer an unfamiliar question in practice; confirm defer skips without recording an answer and is marked deferred.
5. In an exam, verify defer marks the question but does not skip/advance unexpectedly; exam feedback stays hidden until submission/timeout.
6. Finish a timed exam and confirm results/exam history are correct and ordinary practice mastery is not silently changed.
7. Use tag search, provenance/metadata filters, multi-select, sorting, nested-section filtering, and clear/remove filters. Confirm counts and displayed questions agree with the selected filters.
8. Switch profiles and confirm questions and progress remain isolated.
9. Reload/reopen the app and confirm saved progress remains.
10. Check empty results, long question/option text, many answer options, invalid imports, and other awkward but realistic inputs.

Avoid changing the learning model or expected product behavior simply to make tests pass. Fix the underlying defect and add a test that would have caught it.

## Phase 4 — Real-device and browser verification
Automated tests cannot prove menu geometry, usability, PWA installation, or offline behavior. Perform and record these manual checks against the actual deployed build after code fixes.

### Phone
- Check at least one real phone browser, including a narrow viewport around 320–390 CSS px if possible, plus landscape.
- Open More near the top/bottom of the screen and verify every item is visible/reachable; repeat with sort and filter pop-ups and long menus.
- Confirm pop-ups do not sit behind the bottom navigation, phone safe area, or browser UI.
- Test tag/provenance/metadata filter layout, multi-select, selected chips, clear filters, long labels, and scrolling.
- Complete import, preview, merge, practice, favourite/defer, exam, results, and export flows.
- Check virtual keyboard behavior, touch targets, focus/selected states, and accidental taps.
- Check no horizontal overflow or clipped primary actions in the main workflow.

### Desktop
- Check a normal laptop/desktop viewport and a narrower resized window.
- Verify the denser filter layout remains readable and menus do not open off-screen.
- Use keyboard-only navigation for the primary workflows; check visible focus, meaningful control labels, and dialogs/pop-ups.
- Check 200% zoom where feasible, long names/tags/filenames, empty/error states, and light/dark appearance.
- Spot-check all four accent presets (blue, purple, orange, green) in both light and dark appearances to ensure no legacy colour or contrast regression is introduced.

### PWA, reload, and offline
- Verify the published app URL loads and can be refreshed directly on its current route without a 404 or broken asset path.
- Verify the PWA install prompt/path where supported, and launch the installed app if available.
- After a successful online load, test offline reopening and the core study flow where supported by the service worker. Record any external fonts or other resources that do not load offline.
- Reconnect and confirm persisted profile data remains intact.
- Do not claim offline support is fully verified if only the online page was checked.

### Accessibility and responsive smoke tests
- Check keyboard focus and names/states on menus, filter controls, import preview, confirmation dialogs, and study controls.
- Ensure correct/incorrect, selected, deferred, and mastery states are not conveyed by colour alone.
- Check reduced-motion behavior if animations are present.
- Record device/browser, viewport, steps, outcome, and any failure. If a device or assistive technology is unavailable, mark the check as not tested rather than passing it by assumption.

**Exit condition:** the actual deployed build has a recorded phone and desktop smoke test, with offline/PWA checks clearly marked pass, fail, or not tested.

## Phase 5 — Minimal preparation for first-time testers
Keep this small; do not build a tutorial system or account infrastructure.

### Getting-started guide
Add or update a short guide reachable from the app or README that explains:
1. How to import a question-bank JSON file.
2. How to preview and merge it into a profile.
3. How to start practice and use favourite/defer.
4. How to start and submit an exam.
5. How to export questions for sharing versus export a full-profile backup.
6. How to restore a backup as a separate profile copy.
7. That data stays in the browser, is not automatically synced between devices, and may be lost if browser/site data is cleared. Encourage a full backup before clearing data or changing devices.
8. That question-only exports are intended for sharing; full backups contain personal learning progress and should be treated as private.
9. That reminders are checked while the app is open and reliable closed-app delivery is not guaranteed.

Use plain language and short steps. Keep technical JSON/schema detail optional and out of the main getting-started path.

### Sample question bank
- Prepare a small, safe sample JSON bank suitable for demonstration, not a large paid pack.
- Include several sections (including a nested section if supported), tags, explanations, and representative answer modes.
- Verify it imports through the normal preview/merge flow and does not contain personal data, credentials, or misleading answer keys.
- Label it as a sample; do not silently install it into a user's profile.

### Privacy and first-run clarity
- Confirm the UI/guide makes clear that profiles and attempts are stored locally in the browser, there is no account/cloud sync, and moving devices requires export/restore.
- Make backup discoverable without overwhelming the Study screen.
- Do not add analytics, telemetry, a backend, account creation, or external AI calls.
- Check that an empty/new profile offers understandable next steps without forcing a long onboarding flow.

### Known issues
- Add or update a concise `KNOWN_ISSUES.md` only if it helps testers distinguish known limitations from newly found bugs.
- Include only verified outstanding limitations, such as lack of cross-device sync or the reminder/offline limitations if they remain true.
- Do not copy stale statements into this file. In particular, reconcile the Knowledge Base's older backup-restore limitation against the current Request 011 implementation and tests; documentation must describe verified current behavior, not historical behavior.
- Every issue should say what is affected and a practical workaround if one exists. Do not list speculative issues as confirmed defects.

**Exit condition:** a new tester can import the sample bank and start practice without help, and understands where data lives and how to back it up.

## Phase 6 — Small external test with 3–5 people
After Phases 1–5 have passed to the extent possible, invite 3–5 friends/students to use the app on their own phones or computers.

Ask each tester to complete a short task list without coaching:
- Open Freequiz and find a way to import the sample bank.
- Preview and merge it.
- Start practice and answer a few questions.
- Favourite or defer a question.
- Find export questions and distinguish it from full-profile backup.
- Explain where their progress is stored and what they would do before switching devices.

Collect only actionable feedback: what they tried, what they expected, what happened, and the browser/device. No tracking or analytics should be added to collect this. Fix only reproducible bugs or clearly blocking usability problems within this release scope; record other suggestions for later instead of expanding scope.

**Exit condition:** no unresolved critical blocker prevents a first-time user from importing a bank and starting a study session. Any lower-priority feedback is documented for later.

## Phase 7 — Final verification, documentation, and release
1. Run the full Vitest suite, TypeScript check, and production build after the final code change.
2. Inspect the complete diff for accidental behavior changes, duplicated actions, stale styles, debug code, and unrelated refactors.
3. Verify tests cover every fixed regression and key data-safety invariants.
4. Open a PR for the implementation branch. Review the code and CI result; do not merge if a relevant check fails or if any unexplained regression remains.
5. Update README and `knowledge/README.md` so the export/backup distinction, restore behavior, local-storage privacy, current known limitations, and verification record match the actual code.
6. Verify the main-branch GitHub Actions deployment and published Pages URL after merge. A passing PR build alone is not proof of deployment.
7. Perform the manual phone/desktop/PWA checks on the deployed build where possible. Report unavailable checks honestly.
8. Do not claim a fix or QA step is complete without evidence. If a check finds a regression, stop release, fix it in a focused change, rerun the affected checks, and repeat the relevant manual test.

## Bug-prevention rules (mandatory)
- **One logical fix per implementation unit/PR where practical.** Keep the first PR focused on Request 014; do not bundle onboarding polish or unrelated refactors into the same diff.
- **Test first for known regressions.** Add a failing regression test before or alongside the fix where feasible, then verify it fails for the original bug and passes after the fix.
- **No broad CSS guesses.** Inspect layout ownership and test nearby overlays before changing shared positioning, stacking, overflow, or responsive rules.
- **Preserve contracts.** Do not change question IDs, option IDs, answer checking, mastery scheduling, exam scoring, profile isolation, import merge/replace behavior, or JSON formats unless a separate data-loss bug is demonstrated and explicitly planned.
- **No silent data changes.** Validate before applying, keep preview and confirmation, and verify cancellation/failure leaves data unchanged.
- **Use representative fixtures.** Tests must include nested sections, long tags/filenames, multiple answer modes, progress, favourites, deferred markers, import history, and exam records where relevant.
- **Regression before cleanup.** Do not delete legacy CSS or reorganize components merely because they look redundant; remove only when usage is checked and tests/manual checks demonstrate no regression.
- **Review the whole diff.** Look for changed labels that no longer match actions, duplicate export routes, accessibility regressions, stale documentation, and accidental changes outside the approved scope.
- **Stop on unexpected failures.** Do not work around a failing test by weakening it or changing expected behavior without evidence. Diagnose the cause, fix the underlying problem, and rerun the complete suite.
- **Be honest about evidence.** Distinguish automated checks, deployment confirmation, manual browser testing, and user testing. Mark anything not performed as outstanding.

## Release definition of done
- The known More/sort/filter positioning and Import / export discoverability bugs are fixed.
- All existing filter and menu features remain available.
- Question-only export and full-profile backup are clearly distinguished and pass privacy/round-trip/failure tests.
- Invalid/canceled imports and restores cannot partially alter existing data.
- Core practice, favourite/defer, exam, profile switching, and persistence workflows pass regression tests.
- Test suite, TypeScript check, and production build pass.
- The live Pages deployment is verified after merge.
- Phone and desktop checks are recorded; PWA/offline and accessibility checks are explicitly marked by actual outcome.
- A sample bank and short getting-started guide are available.
- 3–5 testers can import a bank and start practice without coaching, or remaining blockers are documented and release is held.
- README and Knowledge Base agree with the verified implementation.
- No untested feature expansion or unrelated redesign has slipped into the release.

## Out of scope
- Accounts, cloud sync, backend, analytics, telemetry, payments, social features, or central question-bank hosting.
- A new export/backup format or a second import implementation.
- Updating existing question content silently during merge.
- Implementing all of Request 013 as a side effect.
- Large onboarding flows, new gamification, or speculative polish.
- Claiming a test/device/accessibility/offline check passed when it was not actually performed.


## Execution log — 2026-10-26

- **Phase 0:** pre-change main workflow [40388556021](https://github.com/OliverZsuffa/freequiz/actions/runs/40388556021) passed.
- **Phase 1:** complete. [PR #18](https://github.com/OliverZsuffa/freequiz/pull/18) merged; CI [40394870333](https://github.com/OliverZsuffa/freequiz/actions/runs/40394870333) and main deployment [40395013536](https://github.com/OliverZsuffa/freequiz/actions/runs/40395013536) passed.
- **Phase 2:** automated coverage already verifies question-only export privacy, malformed backup validation, and backup restore preserving progress/source history. The complete real-device/cross-device round trip remains unverified.
- **Phase 3:** existing automated tests cover practice, favourite/defer, exams, filtering, and profile behavior. These are not substitutes for manual end-to-end use.
- **Phase 4:** outstanding. The available environment did not provide a browser/device session for visual viewport, assistive technology, PWA install, or offline testing. A direct page fetch through the available browser tool was inaccessible, so no rendered-page smoke test is claimed.
- **Phase 5:** complete. [PR #19](https://github.com/OliverZsuffa/freequiz/pull/19) added the getting-started guide, public sample bank, parser regression test, and verified known-limitations list. Its workflow [40395545334](https://github.com/OliverZsuffa/freequiz/actions/runs/40395545334) passed 67 tests, TypeScript checking, and production build; main deployment [40395706878](https://github.com/OliverZsuffa/freequiz/actions/runs/40395706878) passed.
- **Phase 6:** outstanding. Use `TESTER_CHECKLIST.md` with 3–5 friends/students; no external user testing has been performed by this assistant.
- **Phase 7:** automated checks and deployment passed. The npm install log reports 6 audit findings (3 moderate, 1 high, 2 critical); affected package details still need to be enumerated and assessed. Do not force-upgrade dependencies blindly.

**Current decision:** do not call the app fully release-ready yet. Complete the dependency audit review, run hands-on phone/desktop/accessibility/PWA checks, and obtain feedback from 3–5 people before declaring the release ready.
