# Request 013: Mobile-first, minimal daily-use UX and safe question sharing

## Status

**Approved for implementation.** The current implementation is in [PR #17](https://github.com/OliverZsuffa/freequiz/pull/17). Automated checks passed on the preceding implementation commit; the latest UI/documentation refinements are running through CI. Manual physical-device and screen-reader QA still needs to be performed before claiming full release validation.

This plan consolidates every finding in Request 012 with the requirements that mobile users receive first-class support, the everyday interface stay minimal, and weekly question-bank updates be shareable without exposing personal learning progress. This is a refinement of the existing app, not a feature-removal or visual-rewrite project.

## Product goals

1. Make the most common daily task—start or resume useful practice—obvious immediately.
2. Keep the central view focused on a few actions; keep advanced, infrequent, and administrative tools available but out of the way.
3. Treat narrow-screen phones as a primary target, not a compressed desktop layout.
4. Preserve every existing feature. Simplify by grouping, collapsing, and progressively revealing—not by deleting capabilities or data.
5. Make imports, backups, sharing, and destructive actions transparent and safe.
6. Make weekly distribution of question updates easy and repeatable, without sharing the author's attempts or progress.
7. Preserve the local-first privacy model: no account, backend, telemetry, or automatic AI API calls.

## Non-negotiable safeguards

- No existing question, section, attempt, exam result, favourite, deferred marker, custom group, setting, profile, import batch, or provenance metadata may be silently discarded or altered by this UX work.
- A visual/navigation change must not change study scheduling, answer checking, exam scoring, question IDs, import semantics, or profile isolation unless a separate, explicitly approved data-workflow change calls for it.
- Full-profile backups and question-only exports remain distinct formats with clear labels.
- Sharing/exporting question content must not include learning attempts, exam history, favourites, deferred state, profile settings, or other private progress data.
- Import remains preview-first and validation-first. Merge remains the safe default; replacement must be clearly destructive and require deliberate confirmation.
- Keep all existing advanced filters, bulk actions, analytics, settings, AI prompt modes, accent presets, dark/light appearance, import history, and study sources available.
- Preserve compatibility with existing freequiz/questions-v1 and freequiz/backup-v1 files and older supported formats.
- Keep implementation in a separate branch/PR; run automated checks and update the Knowledge Base only after approval.

## Proposed information architecture

### Everyday navigation

Use a small, stable set of destinations that works at desktop and phone widths:

- **Study** — the daily landing view and session setup.
- **Questions** — find, edit, organize, and practise question content.
- **Progress** — one destination grouping Statistics and Learning timeline.
- **More** — a compact menu for Import / export, Import history, Settings/appearance, Help/tutorial, and other infrequent tools.

An active study session should have its own focused session interface and an obvious, mode-aware way to return or exit. Do not keep a dead-end Session destination in everyday navigation when no session is active.

On phones, use a touch-friendly bottom navigation or equivalent compact, persistent navigation with labels/icons and a visible selected state. The More route must never be hidden by a breakpoint. Do not cram all destinations into tiny top-bar text. On larger screens, the same destinations can be presented as compact top/side navigation. Keep navigation semantics and names consistent across sizes.

Group More into **Manage questions** (import/export and import history), **Preferences** (appearance/settings), and **Help**. Progress should be directly accessible. Avoid duplicate destinations and avoid adding a new top-level item for every feature.

### Study: make the central view about studying

- One dominant action, **Start practice**, starts the session described by the currently visible setup.
- Put the source, section/group, question count, and practice/exam choice close to that action, using compact controls and sensible defaults.
- Offer small secondary shortcuts such as **Due for review (N)** and **Needs practice (N)**. The label must tell users what subset each shortcut will use.
- If a smart review recommendation remains prominent, explain the selected subset and make it use the same predictable rules every time.
- Keep the progress summary concise (for example, due, known, and in progress); detailed charts and timeline belong in Progress.
- Keep advanced configuration, AI setup, backup tools, and long explanations out of the central daily-use view.
- For a profile with no questions, show three straightforward next steps: **Import a question bank**, **Create a question**, and **Make questions with AI**. Do not force a long tour; keep the guide reopenable and remember dismissal.

### Questions: simple first, powerful on demand

- Keep search, section, and tags easy to find.
- Put less-common metadata filters, date filters, provenance/import filters, sorting options, and other maintenance controls under a clearly named **More filters** disclosure.
- Use a consistent, accessible multi-select checkbox popover/drawer for all multi-value filters; do not rely on native multi-select Ctrl/Command-click behavior.
- Show selected values as removable chips, a compact active-filter summary, and a matching-question count. Provide **Clear filters** and a helpful no-results state.
- Explain the filter rule once: values selected within one category match any of those values; separate categories narrow results together.
- Keep favourites, deferred markers, custom groups, answer modes, nested sections, bulk selection, bulk edit/undo, and practice/exam actions fully available.
- Make **Practise matching questions** and **Practise selected questions** unambiguous.
- Clearly indicate whether a bulk action applies to explicitly selected questions or all questions matching the filters. Never silently apply an action to more items than the user expects.
- Let long section trees collapse/expand. Section selection must visibly show the active filter and provide a clear way to remove it. Explain whether displayed counts include descendants.

### Question editor

- Add a visible **Section** picker. It may default to the current section, but assignment must never be implicit or invisible.
- Add field-level validation for question text, option count, answer mode, and correct answer. Replace silent no-op saves with an explanation and focus the first invalid field.
- Make correct-answer selection easier to understand, especially after adding/removing/reordering options. Keep existing answer modes and variable option counts.
- Preserve a quick text-entry path; do not turn routine creation into a lengthy wizard.
- Preserve question IDs during edits and preserve protected AI provenance separately from editable tags.
- Avoid unrelated expansion of question deletion or other data-management behavior.

### Progress and mastery

- Group Statistics and Learning timeline under Progress without removing either view or any chart.
- Keep practice activity, answer accuracy, mastery, and exam results visibly distinct.
- Provide concise contextual definitions for New, Learning, Known, Needs work, and Weak. In particular, explain that Known means the two most recent recorded answers were correct.
- Fix the Learning timeline export label/scope mismatch. Never label a full multi-profile backup as “Export history.” Use a label that accurately describes the exported data, and show the scope before export.
- Preserve separate exam history and the rule that exam answers do not silently change ordinary practice mastery.

### Import, backup, and AI preparation

- Make **question sharing/export** and **full backup/restore** visibly distinct actions, with one-sentence explanations of what each contains.
- For every import, preview counts for new questions, duplicate IDs to skip, sections to add/resolve, and invalid items before applying changes.
- Keep merge as the default. Replacement must state that it replaces the current profile's question bank/sections and clears affected learning history, then require an in-app confirmation that names the active profile.
- Explain the AI hand-off in four steps: choose Extract or Generate; copy the prompt; use it in the user's chosen AI chat with source material; return the result to Freequiz and preview/import it. State clearly that Freequiz itself does not send material to an AI service.
- Keep technical schema details optional rather than on the main path.
- Keep import history, batch inspection/re-export, original source attribution, and all existing validation behavior.

### Settings and appearance

- Group settings into **Appearance**, **Study goals**, **Reminders**, and **Motivation**.
- Explain each group briefly; hide/collapse dependent options when disabled rather than deleting or resetting their values.
- Make mixed motivation settings truthful: do not show one simple checked box if only some motivation features are enabled. Use an explicit mixed state or **Enable all motivation features** action.
- Keep the limitation visible near reminders: checks happen while the app is open; reliable closed-app delivery is not guaranteed.
- Check all four accent presets in both light and dark appearances. Use accent tokens for brand/active/focus states and retain distinct semantic colours for correct/incorrect/warning states. Remove legacy CSS only when tests confirm no appearance regression.

## Weekly question sharing without exposing progress

### Current behavior and limitation

The existing **Export questions** format is already the right privacy boundary for sharing: it exports question content and the required section ancestry, not practice attempts, exam history, favourites, deferred state, or profile settings. Recipients can import it through the normal preview and merge flow. The merge process deduplicates matching question IDs and adds new question IDs, so re-importing the same export should not duplicate questions.

A basic weekly workflow is possible today:

1. The author exports the current question bank using **Export questions**, never a full profile backup.
2. The author shares that JSON file with recipients.
3. Recipients import it and choose **Merge into profile**.
4. Newly added question IDs are added; already-present IDs are skipped. Their own learning progress stays in their own profile.

**Important limitation:** the current merge behavior skips an existing question ID rather than updating that question's text/options/explanation/tags. Thus the simple workflow is good for distributing new questions, but it does not reliably distribute corrections to already-shared questions. Replacing a recipient's profile is not an acceptable workaround because it risks their personal content/progress.

### Proposed user-facing workflow

Add a plain-language **Share questions / Import updates** path under **More → Manage questions**, and make it reachable from the question library without putting it in the daily Study view.

**Author side**
- **Export questions to share** creates a content-only JSON package for the selected profile/question set. Default to the full question bank so the recipient can merge it repeatedly without the author tracking which week they last received.
- The export confirmation says: “Includes question content and sections. Does not include your learning progress, exam results, favourites, deferred questions, or settings.”
- Preserve question IDs and section IDs across repeated exports so the receiver can deduplicate and associate later updates.
- Keep **Full profile backup** separate and visually labelled as private/complete data.
- Allow exporting a selected subset if already supported, but do not make users manage IDs or JSON manually.

**Recipient side**
- Import the shared package and default to **Add new questions** / merge.
- Show a preview with counts: **new questions to add**, **already present**, **sections to add**, and **invalid items**.
- State plainly that importing a question package does not import the sender's progress or overwrite the recipient's profile settings/progress.
- Re-importing the same package should be safe and idempotent: no duplicate questions, attempts, favourites, or groups are created.
- Preserve the receiver's local progress for existing questions when the operation is add-only.

**Corrections to existing shared questions**
- Design a separately labelled, optional update path for matching question IDs; do not silently change the current merge contract.
- If approved for implementation, preview the exact matching questions whose content would change and let the recipient review/accept those updates.
- Update question content only; never replace or import the sender's attempts, exam results, favourites, deferred markers, settings, or profile metadata.
- Keep receiver-local progress associated with unchanged question IDs, and clearly warn that editing wording/options can make old attempts harder to interpret. Do not automatically update matching questions by default until this behavior is explicitly approved and tested.
- New questions should still be added in the same operation, with separate counts for added, updated, unchanged/skipped, and invalid.
- If the same question has diverged locally, make the conflict visible instead of silently overwriting the receiver's edits.

### Recommended initial scope for sharing

To keep the product minimal, implement the straightforward, safe new-question workflow first: clear labels, content-only export, previewed merge, ID-based duplicate skipping, and privacy guarantees/tests. Add reviewed updates to existing question IDs only as a distinct second step if weekly corrections to previously distributed questions are also required. This avoids overengineering a versioning service or introducing a backend. The app has no cloud sync or central distribution server; sharing remains file/link-based and under the user's control.

## Fixes consolidated from Request 012

All findings must be addressed or explicitly verified as already resolved:

1. **Mobile navigation dead end:** keep More/Menu visible at every breakpoint; verify 320, 360, 390, and 430 px and landscape.
2. **Export label/scope mismatch:** correct the Learning timeline export action and any misleading backup/history labels.
3. **Conflicting study CTAs:** unify Start practice behavior with visible setup and clarify review shortcuts.
4. **Inconsistent multi-selects:** use one touch- and keyboard-accessible pattern for all multi-value filters.
5. **Implicit section assignment and silent validation:** visible editor section picker and inline errors.
6. **Opaque import preview/destructive replace:** counts, collision explanation, safe default, clear confirmation.
7. **Ambiguous exam exit:** explain continue vs exit without submitting; never imply exit equals completed submission.
8. **Section tree acting as a hidden filter:** explicit state, clear filter, collapse/expand, clear descendant counts.
9. **First-run onboarding:** three simple starting paths, non-forced guide, easy return.
10. **Secondary destinations:** compact information architecture with grouped More menu and direct Progress access.
11. **Dense question library:** progressive disclosure, match counts, clear filters, explicit bulk-action scope.
12. **AI workflow hand-off:** four-step explanation and privacy boundary.
13. **Settings complexity:** meaningful groups, truthful mixed state, conditional visibility without resetting stored preferences.
14. **Mastery terminology:** contextual definitions, separate activity/accuracy/mastery/exam concepts.
15. **Mobile/accessibility QA:** keyboard, focus, screen reader, 200% zoom, long names, touch target/state checks, status not conveyed by colour alone.
16. **Accent/CSS consistency:** verify every accent in light/dark modes and clean up legacy rules only alongside tested visual changes.

## Implementation phases

### Phase 1 — Safety and critical correctness
- Fix mobile More/Menu visibility and ensure all routes remain reachable.
- Fix export/history labels and scope.
- Improve exam exit messaging.
- Add regression tests for these behaviors.

### Phase 2 — Mobile-first everyday navigation and Study view
- Implement the compact navigation model and responsive behavior.
- Make the central Study view action-first and consistent with visible settings.
- Group secondary tools without removing any destination.
- Add empty-profile next steps.

### Phase 3 — Questions and editor usability
- Progressive disclosure for advanced filters and bulk controls.
- Consistent checkbox-based multi-selects, removable chips, active-filter summary, result count, and Clear filters.
- Explicit section assignment and visible validation.
- Clarify section-tree behavior and bulk-action scope.

### Phase 4 — Import, privacy, and sharing workflow
- Improve content-only export/full-backup distinction and import preview.
- Implement or polish the **Share questions / Import updates** path described above.
- Test repeated imports, duplicate IDs, section collisions, privacy exclusion, and no-progress-overwrite behavior.
- Treat updating existing question content as a separate explicit feature/decision, not an implicit change to merge behavior.

### Phase 5 — Progress, settings, AI, visual consistency
- Group Progress and clarify mastery labels.
- Organize settings with progressive disclosure and truthful mixed states.
- Clarify the AI prompt hand-off.
- Audit accents, dark/light themes, focus, contrast, and legacy CSS.

### Phase 6 — Regression and manual usability verification
- Update the Knowledge Base and request status after implementation and verification.
- Verify every previously available feature still exists and remains reachable.
- Run automated tests, TypeScript checking, production build, and relevant GitHub Actions workflows.
- Manually inspect the deployed site at phone and desktop sizes; do not claim a browser/device test that was not actually performed.

## Acceptance criteria

### Mobile and daily use
- At 320, 360, 390, and 430 px widths, users can reach Study, Questions, Progress, More, Settings, Help, Import/export, Import history, and Learning timeline without a hidden/dead-end navigation route.
- Primary controls have comfortable touch targets; there is no horizontal overflow in the core views.
- The Study screen has one obvious primary action whose behavior matches the visible setup.
- Advanced features remain available but are not all displayed at once.
- Session answer selection, favourite, defer, submit, and exit controls remain understandable and usable on touch screens.
- Keyboard-only navigation, focus visibility, screen-reader names/states, 200% zoom, long names, empty states, and error states are checked.

### No lost functionality or data
- All current features and settings remain present; hiding/collapsing does not reset or delete stored values.
- Existing question/backup JSON formats remain importable.
- Full backup/restore preserves all data currently promised by the product.
- Question-only exports contain no progress or profile-private state.
- Import preview accurately describes changes before applying them.
- Merge remains non-destructive; replacement is explicit and protected.
- No import/export action is described inaccurately.

### Weekly sharing
- Exporting a question package does not include attempts, exam history, favourites, deferred state, groups, profile settings, or private profile metadata.
- A recipient can repeatedly merge the same package without duplicates.
- Newly added questions arrive with content, sections, answer modes, correct answers, explanations, tags, and protected provenance intact.
- Existing receiver progress is unchanged by a content-only merge.
- Matching-ID content updates, if implemented, are previewed and opt-in, never mixed with sender progress.
- A clear, short instruction is available to both sender and recipient.

### Verification
- Add automated regression tests for each fixed bug and data-safety invariant.
- Check TypeScript, test suite, and production build.
- Check the actual Pages deployment result and perform manual browser checks before calling the work complete.
- Update knowledge/README.md so it agrees with implemented backup, restore, import, and sharing behavior; remove stale contradictory limitation text rather than adding more contradictory notes.

## Out of scope

- No backend, accounts, cloud sync, telemetry, or automatic sharing service.
- No removal of advanced features to achieve minimalism.
- No unrelated feature expansion or visual redesign for its own sake.
- No silent automatic replacement of existing question content during import.
- No assumption that automated tests prove real mobile, accessibility, or offline behavior.
