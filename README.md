# Freequiz

Freequiz is a client side only, installable quiz app for building question banks, practising multiple choice questions, and tracking mastery over time.

**Privacy first:** questions, profiles, and attempts stay in your browser. There is no account, backend, analytics, or AI API integration. AI assistance creates a prompt for a model you choose, then validates the JSON you paste back.


## Getting started

1. Open [Freequiz](https://oliverzsuffa.github.io/freequiz/) and choose **More → Import / export**.
2. Download the [sample question bank](https://oliverzsuffa.github.io/freequiz/sample-question-bank.json), then select the JSON file in Freequiz. Choose **Validate and preview**, check the counts, and select **Merge into profile**.
3. Go to **Study**, choose your source and session type, then select **Start practice**. Practice gives feedback after each answer.
4. During practice, use **Favourite** to keep a question handy or **Defer** to mark it for later and skip it without recording an answer. Timed exams use a separate result history.
5. To share questions, use **Export questions to share**. This contains question content and required sections, not your personal learning progress.
6. Before changing devices or clearing browser/site data, use **Full profile backup** (or **Backup all profiles**) and keep the file somewhere safe. Restore it on the other device using **Import / export → Validate and preview → Restore as new profile copies**.

Freequiz stores your profiles and progress in this browser. It does not have accounts or automatic cross-device sync. A full backup contains private study history; do not share it as a question pack. Reminder checks happen while the app is open, and closed-app delivery is not guaranteed.

## Features

- Multiple profiles with independent question banks and practice history
- Nested section display, question search, tags, and section filters
- Study-first home screen with source/count setup and a compact secondary-tools menu
- Randomized answer order with stable option IDs; variable option counts, including more than 26 choices
- Explicit single-answer, exactly-N, and select-all modes with answer-mode filters
- Immediate feedback in practice and strict timed exams with results at submission
- Question editing, favourites, reusable custom study groups, and nested-section filtering
- Visual session results, topic breakdowns, practice history, and separate exam history
- Four persisted accent presets: blue, purple, orange, and green, applied consistently across dark and light themes
- Transparent mastery labels: New, Learning, Known, Needs work, and Weak
- Practice all questions, new questions, weak questions, or questions due for review
- JSON import with validation and preview, import history with per-batch inspection and re-export, plus profile backup and export
- Two AI prompt modes: extract only questions explicitly posed in the source, or generate a comprehensive set of new course questions. Generation strictly forbids slide/source references in stems, requires topic coverage checks and multiple questions per substantial topic without padding, and treats supplied section IDs as existing references rather than output definitions. Source material is supplied directly to your chosen external AI
- Protected AI provenance metadata (`AI-Extracted` / `AI-Generated`) kept separate from editable ordinary tags
- Learning timeline, mastery summaries, dark and light appearance
- Practice accuracy trend chart with date ranges and a separate mastered-question trend
- Multi-section session filters with descendant inclusion and deduplication
- Independently configurable activity heatmap, streaks, milestones, weekly goals, celebrations, and session highlights
- Opt-in reminders checked while the app is open; closed-app delivery is not guaranteed
- IndexedDB persistence with localStorage fallback
- Installable PWA and service worker for offline app shell caching
- Responsive layout

## Local development

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
npm run test
npm run build
```

## GitHub Pages

The Actions workflow builds and tests the application, uploads the `dist` artifact, then deploys it to Pages. Vite is configured for the `/freequiz/` base path.

In repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The workflow deploys on pushes to `main`. Check the Actions run and open the published URL to confirm deployment.

## Import format

The canonical format is `freequiz/questions-v1`.

```json
{
  "format": "freequiz/questions-v1",
  "sections": [{ "id": "geometry", "name": "Geometry", "parentId": null }],
  "questions": [{
    "id": "triangle-angle-sum",
    "prompt": "What is the sum of a Euclidean triangle's interior angles?",
    "options": [{ "id": "a", "text": "90 degrees" }, { "id": "b", "text": "180 degrees" }],
    "correctOptionIds": ["b"],
    "sectionId": "geometry",
    "explanation": "The interior angles sum to 180 degrees.",
    "tags": ["geometry"],
    "provenance": "AI-Generated"
  }]
}
```

Correct answers reference option IDs. `answerMode` can be `single`, `exactly-n`, or `select-all`. Older files without `answerMode` remain supported: one correct ID defaults to `single`, multiple IDs default to `select-all`. Exactly-N is never guessed for older files. Option count is variable, with at least two options. A simple question array is also accepted, with an integer `answer` index or string `answer` option ID. The optional `provenance` field accepts `AI-Generated` or `AI-Extracted`; unsupported values are ignored. Provenance is kept separately from ordinary editable `tags`, and legacy questions without provenance remain valid.

## Exporting, restoring, and tag favourites

The Questions workspace has two distinct exports:

- **Export questions** creates a merge-friendly question bank. It contains question content, answer modes, explanations, tags, AI provenance, and only the section ancestors needed by those questions. It does not include learning attempts, exam history, question favourites, deferred state, or profile settings. Import it through the normal preview and merge flow.
- **Full profile backup** exports the active profile, including its original question IDs, section tree, source/import history and filenames, attempts, favourites, deferred questions, groups, exam sessions, and any additional profile fields. **Backup all profiles** exports every profile in one file.

To restore a full backup, open **Menu → Import / export**, paste or select the backup JSON, then choose **Validate and preview**. Freequiz recognises the backup format separately from a question bank. **Restore as new profile copies** keeps existing profiles unchanged; if a profile ID or name collides, the restored profile's ID and/or name is adjusted while question and learning-history IDs are preserved. Validation happens before the restore, so an invalid backup is not partially applied. Older freequiz/backup-v1 files without the newer metadata remain accepted when their profile data is valid.

In Questions filters, search tags by name and star frequently used tags. Starred tags appear first and their starred state is stored with the profile. Long tags and import filenames wrap in the searchable filter lists and selected chips, which can be removed individually.

A practical checklist for testing Freequiz on phones and desktop is available in [TESTER_CHECKLIST.md](TESTER_CHECKLIST.md).

## Data and privacy

Browser storage is not cloud sync. Export a backup regularly, especially before clearing browser storage or moving devices. The AI prompt feature does not send anything by itself. If you paste material into an external model, that model's privacy terms apply.

## Status

Request 014 was implemented in [PR #18](https://github.com/OliverZsuffa/freequiz/pull/18) and merged on 2026-10-26. Its pull-request checks passed in [workflow run 40394870333](https://github.com/OliverZsuffa/freequiz/actions/runs/40394870333), and the main-branch build and GitHub Pages deployment passed in [workflow run 40395013536](https://github.com/OliverZsuffa/freequiz/actions/runs/40395013536). The new menu/filter/export behavior still needs hands-on phone and desktop verification; automated tests do not prove actual viewport geometry, screen-reader behavior, or offline operation. The [manual tester checklist](TESTER_CHECKLIST.md) is ready for a small 3–5-person trial. CI also reported 6 dependency audit findings (3 moderate, 1 high, 2 critical); the affected packages still need review before broader release.
