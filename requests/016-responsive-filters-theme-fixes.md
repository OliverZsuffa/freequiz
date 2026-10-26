# Request 016: Responsive filters, mobile menus, and theme consistency

## Status
**Plan proposed — awaiting explicit approval. No application code changes are authorized yet.**

## Goal
Fix the reported desktop and phone UI regressions without removing existing features or introducing a broad redesign. Keep the interface minimal, readable, and consistent with the selected accent colour in both appearance modes.

## Scope and approach

### 1. Filter layout: desktop and mobile
- Inspect the actual filter component, CSS breakpoints, and current Request 014 implementation before editing.
- Preserve the working mobile ordering, but redesign the desktop arrangement so controls have a clear hierarchy, consistent widths, readable labels, and sensible grouping instead of a cramped or visually awkward sequence.
- Keep tag search first, provenance and other metadata filters next, and general search last where that remains appropriate to the control layout.
- Verify normal desktop width and a narrower resized desktop window, as well as phone portrait and landscape.
- Do not remove filters, multi-select behavior, selected values, sorting, or clear/remove actions.

### 2. Import-source picker on phones
- Reproduce and trace why the import-source picker becomes oversized while its text is invisible.
- Fix the underlying mobile sizing, overflow, foreground/background contrast, and selected-chip/label styling rather than applying a broad global CSS override.
- Long source names must wrap or truncate legibly, with a usable way to inspect/remove selected values. The picker must remain scrollable and inside the viewport.

### 3. More menu on phones
- Re-inspect the current menu structure, positioning, stacking contexts, available height, scrolling, and bottom-navigation/safe-area interactions; the previous fix did not resolve the user's real-device issue.
- Correct the root cause so the menu opens in the visible viewport, every item can be reached, text is readable, and items are not covered by the navigation or browser chrome.
- Check dismissal, keyboard/focus behavior, and all existing actions. Avoid broad overlay CSS changes that could break other popovers or dialogs.

### 4. Remove duplicate tag-search paths
- Keep the dedicated tag selector with its searchable list, tag favourites, and multi-select behavior as the single way to search/select tags.
- Adjust the general text search so it no longer acts as a second tag-search interface, while retaining its useful search over question text, answer options, explanations, section paths, and other intended non-tag fields.
- Add regression tests proving that tag filtering is controlled by the dedicated tag selector and general text search does not independently match a question solely because of its tag. Confirm other general-search fields still work.

### 5. Accent colour must survive light/dark switching
- Trace the Start practice button and other accent-dependent buttons to identify hard-coded legacy green styling or theme-specific overrides.
- Make accent-driven actions use the selected persisted accent token in both light and dark modes. Keep semantic status colours (correct/incorrect, mastery, warnings) distinct where those colours carry meaning.
- Verify all four presets (blue, purple, orange, green) in both appearance modes, including after switching modes and reloading.

### 6. Make light/dark toggle visible on phones
- Put the appearance toggle next to the accent-colour control in a compact, visible appearance-control group on mobile, instead of leaving it inaccessible/hidden in the current phone layout.
- Preserve desktop usability and existing persistence. The toggle must remain clearly labelled or accessibly named, show the current state, and be reachable by touch and keyboard.
- Keep this compact to avoid cluttering the study-first screen; do not duplicate the toggle in multiple competing locations unless inspection shows a genuine need.

## Tests and verification
1. Inspect relevant components, styles, theme tokens, existing tests, Request 014, and the Knowledge Base before implementation.
2. Add regression tests for general-search/tag-search separation, accent token selection across themes, and any component behavior that can be reliably tested in Vitest/Testing Library.
3. Run the full Vitest suite, TypeScript check, and production build.
4. Review the complete diff for unintended changes to filters, imports, theme persistence, study flows, or unrelated overlays.
5. Open a separate implementation PR only after approval. Merge only if relevant checks pass, then verify the main-branch GitHub Pages deployment.
6. Real phone/desktop viewport checks are still required to prove the visual defects are fixed. If no real browser/device is available in the execution environment, explicitly report those checks as not performed rather than claiming visual success.

## Acceptance criteria
- Desktop filters are clearly arranged and readable; the current good mobile order remains intact.
- On phones, import-source labels and selections are visible and the picker is sized/scrollable correctly.
- The More menu is fully reachable and visible on phones without clipping, overlap, or hidden text.
- Tag search/favourites use one dedicated selector; general text search no longer duplicates tag lookup.
- Selecting blue (or another accent) yields the same intended accent identity in light and dark modes, including Start practice and other accent-driven buttons.
- The light/dark toggle is visibly available beside accent selection on phones.
- Automated checks pass and the deployed build is verified; visual/manual checks are reported honestly.

## Out of scope
- A general redesign of the app or implementation of all of Request 013.
- Removing existing filters or features to make the layout simpler.
- Changing question data, import/export formats, answer checking, study progress, or persistence contracts.
- Broad global CSS changes without evidence of the cause.
- Dependency upgrades unrelated to these UI defects.


## 7. Legal information: Impressum and privacy notice

### Initial legal assessment for the current Freequiz deployment
- Freequiz is a publicly available, ongoing website hosted on GitHub Pages and is not merely a private page for personal/family use. German law can require at least provider identification under § 18(1) Medienstaatsvertrag (MStV); if the offer qualifies as a businesslike digital service, the additional information in § 5 DDG applies. Whether every DDG item applies depends on the actual operator and activity. Do not assume that a free-to-use site is automatically exempt.
- Add a clearly labelled **Impressum** page and a persistent, plainly named footer link. The link must be easy to recognise, directly reachable, and continuously available; it should not be buried in a deep menu. The page must not be published with invented or blank legal details.
- Depending on the applicable classification, provider information includes the operator's full legal name and a serviceable postal address; § 5 DDG also calls for electronic contact information including an email address and any applicable additional details (such as register, regulatory, professional, or tax identifiers). Include only fields that actually apply; do not invent a company, registration, VAT ID, regulator, or editorial-responsibility statement.
- The site is hosted on GitHub Pages. GitHub's documentation says visitor IP addresses are logged and stored for security. Therefore a privacy notice is appropriate and should accurately describe the hosting provider's processing, rather than claiming that no visitor data is processed.
- The app's intended architecture stores learning data in the user's browser and does not provide an account or cloud sync. The privacy notice should explain local storage (IndexedDB/localStorage as actually used), that questions and progress are not uploaded to a Freequiz backend, and the limitations of that statement: hosting access logs are separate from app data. Re-inspect the current source and service-worker behavior before finalising the wording.
- Explain the external Ko-fi link in the privacy notice as a link to a separate provider. Use an ordinary external link, not an embedded widget or remote image/button that loads Ko-fi resources automatically. Explain that Ko-fi's own privacy terms apply after the user follows the link; verify Ko-fi's current privacy information before publishing.
- The privacy notice should state the controller's identity/contact, purposes and legal bases as applicable, hosting/recipients, retention information to the extent known, data-subject rights, and the right to complain to the competent data-protection authority. Confirm actual retention and processing details with the hosting provider; do not guess at log retention periods or promise data deletion that Freequiz cannot perform.
- Do not add analytics, tracking, third-party fonts, advertising scripts, or cookie banners as part of this work. Review cookies and browser storage actually used. Do not state that consent is required or unnecessary for every storage operation without assessing the applicable rules and purpose.
- This is a code/documentation implementation plan, not a legal opinion. The operator must verify the final facts and published legal identity before deployment. A public-facing Impressum cannot be safely completed until the operator supplies and approves the details to publish.

### Legal source references to use during implementation
- § 5 DDG (official consolidated federal law): https://www.gesetze-im-internet.de/ddg/__5.html
- § 18 MStV (official Bavarian law portal): https://www.gesetze-bayern.de/Content/Document/MStV-18
- Bavarian public guidance on website Impressum obligations: https://verwaltung.bund.de/leistungsverzeichnis/DE/leistung/99000000025492/herausgeber/BY-25492/region/09
- GDPR, especially Articles 12–14 and data-subject rights: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- GitHub Pages hosting and visitor IP logging: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- GitHub privacy statement: https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement

## 8. Low-key Ko-fi support link
- Add a single **Support Freequiz on Ko-fi** link/button in the persistent footer or equivalent secondary-information area, beside Impressum and Privacy. It should be easy to find but visually secondary: no modal, pop-up, nag, repeated prompt, animation, or interruption of study.
- Use a normal external link that opens Ko-fi in a new tab/window with appropriate safe link attributes; do not embed Ko-fi content or load third-party resources before a user clicks.
- Keep the control compact and consistent with the existing accent/theme system; it must remain legible in light/dark mode and on mobile and desktop.
- Do not hard-code a guessed URL. The operator must supply the exact Ko-fi page URL before the link is wired up.
- Test link presence, target URL, keyboard access, accessible label, and footer layout at phone and desktop widths. Verify that Ko-fi is never contacted merely by loading Freequiz.

## Additional release acceptance criteria
- Impressum and privacy notice are available through clear, persistent links and remain accessible on mobile and desktop.
- The Impressum contains only verified, applicable operator details and is not published with placeholders.
- The privacy notice accurately distinguishes local browser-held learning data from GitHub Pages hosting logs and the optional external Ko-fi destination.
- The Ko-fi link is visible but non-intrusive, uses the operator-provided URL, and does not load third-party resources until clicked.
- Update the Knowledge Base and tester checklist with the legal pages, external-link behavior, and any remaining verification limits.
