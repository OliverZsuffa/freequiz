# Freequiz

Freequiz is a client side only, installable quiz app for building question banks, practising multiple choice questions, and tracking mastery over time.

**Privacy first:** questions, profiles, and attempts stay in your browser. There is no account, backend, analytics, or AI API integration. AI assistance creates a prompt for a model you choose, then validates the JSON you paste back.

## Features

- Multiple profiles with independent question banks and practice history
- Nested section display, question search, tags, and section filters
- One question at a time, immediate feedback, and explanations
- Transparent mastery labels: New, Learning, Known, Needs work, and Weak
- Practice all questions, new questions, weak questions, or questions due for review
- JSON import with validation and preview, plus profile backup and export
- AI prompt generator that includes your existing section tree and JSON contract
- Learning timeline, mastery summaries, dark and light appearance
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
    "tags": ["geometry"]
  }]
}
```

Correct answers reference option IDs. Multiple IDs support multiple select questions. A simple question array is also accepted, with an integer `answer` index or string `answer` option ID.

## Data and privacy

Browser storage is not cloud sync. Export a backup regularly, especially before clearing browser storage or moving devices. The AI prompt feature does not send anything by itself. If you paste material into an external model, that model's privacy terms apply.

## Status

Initial implementation. The app and tests are committed, and the GitHub Actions workflow is configured. Check Actions before treating the published site as live.
