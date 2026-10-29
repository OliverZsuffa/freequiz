# Request 022: Offline-first Freequiz and reliable mobile More menu

**Status:** Implemented and merged in [PR #45](https://github.com/OliverZsuffa/freequiz/pull/45). Main build and GitHub Pages deployment passed in [workflow run 40902835993](https://github.com/OliverZsuffa/freequiz/actions/runs/40902835993). Real-device offline and phone-viewport smoke testing remains outstanding.

## Goal

Make Freequiz work offline with the same features and behaviour it has online, and fix the mobile More menu, which is still inaccessible.

Freequiz is client-side and stores profiles/progress in browser storage. It has a web app manifest and a manually maintained `public/sw.js`, registered from `src/App.tsx`; however, that worker only pre-caches the HTML shell and a few static files, not the hashed JavaScript/CSS required to run the app on the first offline reload. The menu was also rendered inside `.topbar`, which is hidden on mobile.

## Requirements

1. After a successful first online load, Freequiz must reopen and be fully usable with the device offline.
2. Offline use must preserve the existing app behaviour and UI. Do not add a special reduced offline mode.
3. Do not add a backend, accounts, sync, analytics, remote API calls, or other online functionality.
4. Existing profiles, questions, attempts, exam history, settings, imports, exports, and backups must remain intact. Do not clear, migrate destructively, or overwrite user data to enable offline use.
5. The first visit still needs a connection to download the app. Make that limitation clear only where useful; avoid adding clutter to the interface.
6. The mobile More menu must be visible and usable from the existing bottom navigation on narrow screens, including when opened from Study, Questions, Progress, and a practice session. The menu is rendered through a portal into `.main-area`, outside the hidden top bar while inheriting the app's theme variables.
7. Preserve the desktop menu behaviour and existing mobile bottom-navigation design.

## Implementation plan

### A. Inspect and make the app shell self-contained

- Check the production HTML, Vite asset paths, manifest, stylesheet, icons, and all imports for resources fetched from another origin.
- Ensure all resources needed to render and use the app are bundled or served from the same origin. If optional remote fonts are referenced, bundle them if licensing and project assets permit; otherwise use the existing local font fallbacks so offline functionality never depends on them.
- Keep the GitHub Pages base path `/freequiz/` correct. Avoid root-relative asset or navigation paths that break under the project subpath.

### B. Add reliable service-worker caching

- Add a production service worker using a maintained Vite-compatible PWA setup, or an equivalently testable build-generated service worker if that fits the current project better.
- Register it only in production; development should continue to use Vite normally.
- Precache the built app shell and all versioned JavaScript, CSS, icons, manifest, and other required static assets. Use the correct GitHub Pages base/scope.
- Support navigation to the app entry point when offline, including direct refresh/reopen of the published app URL. Do not let a missing network response prevent the cached app shell from loading.
- Use versioned caches and a safe update strategy: a new deployment should become available without leaving the app stuck on a broken mixture of old HTML and new hashed assets. Do not delete unrelated browser storage or Freequiz profile data.
- Do not cache nonexistent API responses or introduce network dependencies. There is no server-side study functionality to add.
- Handle installation/activation failures safely so a failed cache update cannot take the existing app offline permanently.

### C. Fix the mobile More menu at its structural source

- Root cause identified in current CSS/JSX: on screens up to 760px, `.topbar` is set to `display: none`, but the `.global-menu` is rendered inside that top bar. The mobile bottom-navigation More button changes `menuOpen`, but the opened menu remains inside the hidden element. Later CSS tweaks to the menu/button cannot make a child of a `display: none` parent visible.
- Move or render the shared menu in a location that is not a descendant of the hidden mobile top bar, while retaining the same menu items and desktop presentation.
- Keep the bottom-navigation More button as the mobile trigger. The opened menu must be anchored to the viewport, fit short screens, respect safe-area insets, scroll if necessary, and sit above the page and bottom navigation.
- Preserve accessible state (`aria-expanded`), clear the menu when a destination is selected, and ensure the user can open and close it repeatedly without stale state.
- Avoid unrelated navigation or styling redesign.

### D. Regression tests

Add or update tests to verify:

- Service-worker registration is production-only and uses the correct base/scope.
- The production build emits a service worker and precache manifest covering the built app assets.
- Offline navigation fallback is configured for the app entry point and GitHub Pages subpath.
- The mobile More trigger opens the menu; menu options are actually rendered outside the hidden top bar; choosing each option navigates and closes the menu.
- Desktop menu behaviour still works.
- Existing app state/storage code remains unchanged unless a directly necessary, separately tested adjustment is found.
- All existing tests, type checking, and production build continue to pass.

### E. Verification and release

- Run `npm run test`, `npm run typecheck`, and `npm run build`.
- Inspect the full diff and verify the generated production files, service-worker paths, cache list, and update behaviour.
- Open a PR and wait for CI. Do not merge until Oliver explicitly approves.
- After approval and merge, verify the main-branch GitHub Pages deployment succeeded.
- Perform a real browser/device smoke test if the environment permits: load once online, confirm the service worker is active, switch to offline mode, reload and reopen the app, complete a practice session and a timed exam, inspect saved progress, and test imports/exports where browser tooling permits. Reconnect and confirm the same data remains.
- Specifically test the More menu on a narrow phone viewport and on a short viewport; confirm it opens, scrolls if needed, and its items work.
- Report automated results separately from manual browser/device checks. Do not claim offline behaviour is fully verified if only CI passed.

## Scope boundaries

- No accounts, cloud sync, backend, or online-only features.
- No change to question selection, scoring, mastery, exam timing, storage schema, or study UI beyond what is required to preserve offline equivalence and repair the menu.
- No clearing user data as part of service-worker installation or updates.
- No merge or deployment without explicit approval.

## Acceptance criteria

- After the app has been loaded successfully once online and its service worker has finished caching, disconnecting the network and reopening/reloading Freequiz still renders the app and all ordinary workflows work.
- Study sessions, timed exams, filters, question editing, local JSON import/export, profile backup/restore, progress, and settings behave the same offline as online.
- No app functionality makes an unexpected request to an external service.
- Existing browser-held data survives app updates and offline/online transitions.
- The mobile More menu is accessible and functional from the bottom navigation, and desktop navigation is not regressed.
- Automated checks and a documented offline smoke test pass before claiming the feature is complete.


## Implementation record

- Replaced the hand-maintained shell-only service worker with a Vite build plugin that emits a versioned worker and precaches all emitted build files plus every public static file. The build now validates the generated cache manifest and the GitHub Pages base path.
- Service-worker registration uses Vite's base path and explicit scope, so the published `/freequiz/` app stays inside its project subpath.
- Moved the shared More menu into a `.main-area` portal and gave it fixed viewport positioning, so the mobile-only hidden top bar can no longer hide the menu. Added regression assertions for portal placement and the mobile bottom-navigation trigger.
- Automated checks and deployment status will be recorded after CI completes. Real-device offline smoke testing must be reported separately from CI.


## Verification record

- PR workflow [40902614069](https://github.com/OliverZsuffa/freequiz/actions/runs/40902614069) passed the test suite, TypeScript check, production build, and offline-cache validation.
- After merge, main workflow [40902835993](https://github.com/OliverZsuffa/freequiz/actions/runs/40902835993) passed the build, public legal-info validation, and GitHub Pages deployment.
- Automated tests confirm that the menu is portalled into `.main-area` outside the hidden top bar and can be opened through the mobile More trigger. No real-device/browser offline smoke test was available in this implementation session, so offline operation and actual viewport geometry still need a hands-on check.
