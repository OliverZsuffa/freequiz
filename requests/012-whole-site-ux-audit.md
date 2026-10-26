# Request 012: Whole-site UI/UX audit

## Status and scope

**Status:** Findings and recommendations documented; no application code changed.

This is a source-based review of the current `main` implementation, covering the first-run and returning-user flows, navigation, study setup and sessions, the question library/editor, imports and AI-assisted question preparation, progress/history, settings, help, data safety, and responsive behavior. It is not a substitute for observing real users or a manual visual/accessibility pass in desktop and mobile browsers. Recommendations below are hypotheses to validate, not a mandate to add more features.

## Executive summary

Freequiz has a strong foundation: the main purpose is study-first, practice and exam modes are distinct, question management is powerful, imports have validation, and local-first data handling is explained. The main UX risk is that the product has grown more capable than its navigation and controls communicate. A regular learner can encounter many options without knowing which matter now, while a few important actions are either hidden or behave differently than their labels suggest.

The best next step is **not a redesign or a feature expansion**. Prioritise a small number of clarity and safety improvements:

1. Fix the mobile navigation dead end and the misleading “Export history” action.
2. Make the main study action predictable and make question editing/validation self-explanatory.
3. Replace inconsistent native multi-select controls with one accessible, consistent pattern.
4. Make import outcomes and profile/data safety visible before committing changes.
5. Simplify the first-run experience and progressively reveal advanced controls.

## Findings by priority

### P0 — Fix before adding more features

#### 1. The Menu becomes unavailable on narrow phones

**Evidence:** `src/styles.css`, `@media(max-width:430px)` hides `.top-actions .button-quiet`. The top-bar Menu button uses that class. The four visible navigation items do not include Statistics, Settings, Import / export, Import history, or the Learning timeline.

**User impact:** On screens 430 px wide or narrower, users may have no visible route to several important screens. This is a navigation/accessibility problem, not merely a layout preference.

**Recommendation:** Keep Menu visible at every breakpoint, or provide a compact, clearly labelled “More” navigation item that opens the same destinations. Test at 320, 360, 390, and 430 px widths, in portrait and landscape. Do not solve this by shrinking all navigation labels further.

#### 2. “Export history” exports a full backup of every profile

**Evidence:** In the Learning timeline view in `src/App.tsx`, the button labelled “Export history” calls `exportJson(true)`. The export helper defaults `allProfiles=true`, so the action downloads the all-profiles backup rather than an attempt-history-only file or a clearly named active-profile backup.

**User impact:** A user could unknowingly export unrelated profiles and reasonably believe they are exporting only the history currently on screen. This is both a naming mismatch and a data-minimisation concern.

**Recommendation:** Decide what this action should mean. Preferred options:
- Rename it to **Back up all profiles** and make the scope explicit; or
- Make it export only the active profile's full backup and label it **Back up this profile**; or
- If a history-only export is genuinely useful, implement that as a separate, clearly specified format.

Avoid retaining the label “Export history” for a full multi-profile backup.

### P1 — High-value improvements to everyday tasks

#### 3. The home screen has two primary study actions with different behavior

**Evidence:** “Start studying” at the top starts questions due for review (or an exam based on the current setup). The setup panel's primary action starts all questions in the selected source, while separate secondary actions start “Due for review” and “Needs practice.”

**User impact:** A learner may expect the prominent “Start studying” button to use the visible setup, but it can choose a different subset from the setup panel's “Start practice” action. The page makes users learn the implementation's distinction rather than making the intended action obvious.

**Recommendation:** Give the page one clearly dominant action whose label and behavior agree with the current setup. For example, let the primary button start the configured session and offer small secondary shortcuts for **Due for review** and **Needs practice**. If “Start studying” is meant to be a smart recommendation, say which questions it will use (e.g. “Start review · 12 due”) and keep that behavior consistent for practice and exams.

#### 4. Multi-select filtering is inconsistent and relies on browser-specific gestures

**Evidence:** The tag and import-source filters use searchable checkbox lists. Section, answer type, mastery, favourite, deferred, and some other filters use native `<select multiple>` elements.

**User impact:** Native multi-select lists often require Ctrl-click on Windows/Linux or Command-click on macOS. That behavior is not obvious, can be awkward on touch screens, and differs from the checkbox-based filters beside it. Users may think they can only select one value or accidentally lose selections.

**Recommendation:** Use one accessible multi-select pattern across categories: a labelled button that opens a checkbox list, searchable when lists are long, with selected values shown as removable chips. Keep keyboard support, focus handling, and screen-reader names. Add **Clear filters** and a compact active-filter summary. Keep advanced filters collapsed until needed, and explain the useful rule inline: multiple values within a category match any selected value; different categories narrow results together.

#### 5. The question editor hides the section assignment and fails silently on invalid input

**Evidence:** The editor displays the question, options, answer mode, correct option numbers, explanation, and tags, but no explicit section field. `saveQuestion()` derives a new question's section from the current section filter (or leaves it unsorted) and returns without a message if required values are invalid.

**User impact:** Users may not notice that a question is being filed under the currently selected section, or why clicking “Save question” did nothing. “Correct option number(s), comma-separated” is also easy to get wrong after changing the options.

**Recommendation:**
- Add an explicit **Section** picker to the editor, defaulting to the current section when one is selected but always visible.
- Show inline validation next to the relevant field (question text, at least two options, and a valid correct answer); do not fail silently.
- Make the correct-answer control more direct. A future improvement could allow selecting the correct option(s) beside each option rather than entering option numbers.
- Preserve the current simple text-entry workflow as a quick path if it remains useful for bulk creation.

#### 6. Import preview does not make the merge result clear enough before applying it

**Evidence:** The question-bank preview shows question and section counts and a short sample, then offers “Merge into profile” or “Replace profile.” Merge behavior skips question IDs that already exist; replace clears existing attempts and replaces questions/sections after confirmation.

**User impact:** A user cannot easily tell how many questions will actually be added, skipped as duplicates, or how section-name/ID collisions will be handled. “Replace profile” is a high-impact action whose confirmation currently relies primarily on a generic browser confirmation.

**Recommendation:** Before applying an import, show a plain-language summary: **N new questions, M already present and will be skipped, K sections to add**. For replacement, state explicitly that questions and sections are replaced and learning history is cleared; require a deliberate confirmation in the app UI. Keep validation separate from applying changes and preserve the current non-destructive merge as the default.

#### 7. Exiting an exam is not clearly distinguished from safely finishing it

**Evidence:** The session view offers “Exit session” for both practice and exam modes, while exam answers are stored as an exam result when submitted. The exit action simply navigates to the home view.

**User impact:** Users may not know whether exiting saves, pauses, discards, or submits an exam. A timer-based exam needs a clear, predictable exit policy.

**Recommendation:** Use mode-specific wording. In an exam, offer **Continue exam** and **Exit without submitting** with an explicit warning that the attempt will not become a completed result; if resume is intended, state that instead. Do not silently imply that leaving is equivalent to finishing.

#### 8. The section tree is useful but behaves like a hidden filter shortcut

**Evidence:** Clicking a section in the sidebar sends the user to Questions and replaces the section filter with that section. The action is visually a section navigation item rather than an explicit filter control.

**User impact:** Users may not realise the section click changes the current question list and replaces an existing section selection. They may also struggle to return to the unfiltered bank.

**Recommendation:** Make the transition explicit (e.g. “View questions in this section”), show the selected section in the Questions filter summary, and provide a visible way to clear it. If the tree becomes long, allow collapsing branches rather than always rendering every descendant. Preserve counts, but make clear whether counts include nested sections.

### P2 — Reduce cognitive load and improve discoverability

#### 9. First-run onboarding could guide the user to one successful study session

**Evidence:** The empty home state offers routes to import questions and start building a bank, while the interactive tutorial covers several areas. Importing, manually creating questions, and preparing them with AI are separate workflows.

**User impact:** A new user may not know which path to choose or may be asked to understand import formats before experiencing the core value.

**Recommendation:** Offer three plain-language starting choices when the active profile has no questions:
- **Import a question bank** (use an existing file)
- **Create a question** (for a small bank)
- **Make questions with AI** (copy a prompt, use an external AI tool, then bring the result back)

Keep the rest of the interface available, avoid forcing a long tour, and finish with a short first session. Remember dismissals, and let people reopen the guide later.

#### 10. Too many destinations are hidden in Menu

**Evidence:** The main navigation exposes Study, Questions, Session, and Help. Statistics, Learning timeline, Settings, Import history, and Import / export are in a separate menu. Accent colour and backup actions also live there.

**User impact:** Important capabilities exist but are not easy to discover. The always-visible “Session” destination may be less useful than a direct path to progress or import for many users.

**Recommendation:** Keep the primary navigation task-oriented and small, but group secondary destinations by purpose inside Menu: **Progress** (Statistics, Learning timeline), **Manage questions** (Import / export, Import history), **Preferences** (Settings, appearance). Consider whether Session should be a navigation destination outside an active session. Do not simply add more top-level items.

#### 11. Advanced filters and bulk actions are powerful but visually dense

**Evidence:** The Questions view combines text search, section multi-select, descendant inclusion, tag search and favourites, answer type, import source, selected-filter chips, advanced filters, sorting, bulk selection, bulk editing, and practice/exam actions.

**User impact:** A regular learner looking for one question can be confronted with many controls intended for library maintenance. It is not clear which filters are essential versus optional, and selecting a large set before understanding the result can be error-prone.

**Recommendation:** Use progressive disclosure:
- Keep search, section, and tags prominent.
- Put less common metadata filters under **More filters**.
- Show a compact **N questions match** summary and active-filter chips.
- Separate selecting questions from applying bulk edits, and clearly show whether an action targets selected questions or all matching questions.
- Keep **Practise matching questions** distinct from **Practise selected questions**.
- Provide a clear empty state with a one-click **Clear filters** action.

#### 12. AI-assisted question preparation has a multi-step hand-off that should be spelled out

**Evidence:** The AI panel asks users to choose extraction or generation, optionally match existing sections, generate and copy a prompt, use an external AI service, and then paste or upload JSON into the import workflow. “AI ready, no API key” is a technical reassurance rather than a complete instruction.

**User impact:** Users can mistake the prompt generator for an integrated AI feature, or not understand what to do after copying the prompt.

**Recommendation:** Present a simple numbered sequence: **1. Choose extraction or generation. 2. Copy the prompt. 3. Paste it into your AI chat with your notes. 4. Bring the returned JSON back here and preview it.** Clearly say that Freequiz does not send the material to an AI service. Keep JSON/schema details available under an optional advanced explanation rather than in the main path.

#### 13. Settings mix several optional systems and repeat explanatory text

**Evidence:** Settings contains separate controls for activity, streaks, milestones, celebrations, weekly goals, reminders, and mastery targets. Several target controls remain visible even when the related feature is disabled; the master “Gamification on” checkbox is checked if any individual feature is on.

**User impact:** Users may not understand the difference between a goal, a reminder, and a visual motivation feature. A single “on” checkbox can also suggest all features are enabled when only some are.

**Recommendation:** Group settings into **Appearance**, **Study goals**, **Reminders**, and **Motivation**. Give each group a concise description. Use a clear **Enable all motivation features** action or an explicit mixed state, rather than implying one checkbox represents every option. Disable or collapse dependent controls when their feature is off. Keep the reminder limitation visible where it matters: reminders are checked while the app is open and are not guaranteed when it is closed.

#### 14. Mastery, activity, and accuracy need clearer distinctions at the point of use

**Evidence:** The home screen shows Known, To revisit, and In progress; Statistics separates practice accuracy and exam history; the timeline explains attempts. The definition of Known (two most recent recorded answers correct) is primarily in Help.

**User impact:** Users may interpret activity as learning, or mistake an accuracy percentage for a mastery measure. “Weak,” “Needs work,” “New,” and “Learning” can be hard to interpret without context.

**Recommendation:** Add short, contextual definitions where the status first appears. Keep **practice activity**, **answer accuracy**, and **mastery** visibly distinct. Explain “Known” briefly (e.g. “two most recent answers correct”) and explain what causes a question to become “Needs work” or “Weak” without making users visit Help.

#### 15. Small-screen and accessibility testing should be treated as a release requirement

**Evidence:** The stylesheet contains several breakpoint-specific changes, including hiding navigation controls at 430 px and reducing navigation labels. The code includes focus styles and reduced-motion handling, but source inspection cannot confirm actual contrast, keyboard order, touch usability, or screen-reader announcements.

**User impact:** A layout that looks reasonable on desktop can hide controls or make long labels and dense filter areas difficult to use on phones. Visual state alone may not communicate selected answers or filter state to assistive technology.

**Recommendation:** Add a repeatable manual checklist for desktop and mobile. Test keyboard-only navigation, focus visibility, screen-reader labels, zoom to 200%, long section/tag/import names, empty and error states, and touch interactions. Ensure answer choices expose selected state and that status is not communicated by colour alone. Automated tests should cover the important flows, but should not be treated as a replacement for this pass.

#### 16. Visual consistency should be checked against the selected accent preset

**Evidence:** Accent presets are applied through `.app.accent-*` CSS variables, but the stylesheet also contains earlier green-based declarations and some fixed green styling. The stylesheet has accumulated multiple generations of rules.

**User impact:** Some accents or states may remain green even when a different preset is selected, which weakens the sense that the selected theme is applied consistently. Duplicate/legacy rules make future styling changes harder to reason about.

**Recommendation:** During the visual pass, verify each accent in both light and dark appearance. Keep semantic correct/incorrect/warning colours distinct, but use shared accent tokens for brand elements, active navigation, primary actions, focus outlines, and selection affordances. Consolidate duplicated CSS only as part of a tested visual change, not as an unrelated cleanup.

## Suggested priority order

| Priority | Work | Why first |
|---|---|---|
| 1 | Keep navigation reachable on narrow phones | Users otherwise cannot reach important screens |
| 2 | Fix the “Export history” scope/label mismatch | Prevents surprising, overly broad exports |
| 3 | Unify study-start behavior and labels | The core action should be predictable |
| 4 | Improve question-editor section assignment and validation | Prevents silent failures and misfiled questions |
| 5 | Replace native multi-select filters and add Clear filters | Makes the library usable without browser-specific knowledge |
| 6 | Improve import preview and exam-exit messaging | Reduces fear and accidental data loss |
| 7 | Simplify first-run and AI hand-off | Helps new users reach a first successful session |
| 8 | Group settings, clarify mastery, run accessibility/visual QA | Improves comprehension without adding features |

## Example of the intended everyday experience

A new learner opens Freequiz and sees one clear choice to import an existing bank, create a question, or prepare questions with AI. After adding questions, the home screen tells them how many are available and offers one predictable **Start practice** action, with review shortcuts nearby. During a session, selecting an answer and seeing feedback is obvious; marking a question for later explains what will happen next. In Questions, a search and a few understandable filters are enough for ordinary use, while advanced filters and bulk editing stay available but out of the way. Before an import or destructive action, Freequiz explains exactly what will change. Progress views distinguish activity from mastery. On a phone, every destination remains reachable.

## Validation plan before implementation

1. Ask 3–5 people who have never seen Freequiz to complete five tasks without coaching: start a first session, find a particular question, favourite and defer a question, import a bank without replacing their current bank, and find their progress.
2. Observe where they hesitate, which labels they misunderstand, and whether they notice the current profile and active filters. Do not explain the interface while observing.
3. Fix the two P0 items and the highest-impact P1 items first.
4. Repeat the tasks on desktop and a narrow phone; include keyboard-only use and a long-name dataset.
5. Keep implementation changes small and separately testable. Re-run automated checks, then manually verify the deployed page.

## Important boundary

This audit does not propose removing advanced capabilities. The goal is to make common tasks obvious and safe while keeping powerful filtering, analytics, AI prompt generation, and configuration available for people who need them. No application code or behavior has been changed as part of this audit.
