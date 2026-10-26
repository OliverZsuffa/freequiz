# Known issues and limitations

This list contains verified product limitations, not unconfirmed bug reports.

- **No cross-device sync or account:** profiles and learning progress are stored in the current browser. Use a full-profile backup before changing devices or clearing browser/site data.
- **Reminder delivery while closed:** reminder checks happen while Freequiz is open; reliable background or closed-app delivery is not guaranteed.
- **Manual device/accessibility/offline QA remains incomplete:** CI verifies the code, tests, and production build, but a real-phone viewport check, assistive-technology pass, and offline/PWA smoke test have not been completed as part of this release work. Reported as not tested, not passed.
- **Question-bank merge does not update existing IDs:** matching question IDs are skipped. This is safe for adding new questions but does not distribute corrections to questions already in the recipient's bank. Review any future update flow separately; do not use profile replacement as a workaround.
- **Section management is limited:** new sections are currently top-level only; creating nested sections, moving sections, and renaming sections are not available.
- **Question deletion is not available:** individual questions can be edited and bulk-managed, but there is no dedicated delete action in the current editor.

If you find a reproducible bug, report the steps, expected behavior, actual behavior, and browser/device. Do not include private question banks, full backups, or personal learning history in a report.
