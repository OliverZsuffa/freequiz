# GitHub change and deployment workflow

This document records the reliable workflow for changing Freequiz when the available GitHub editing tools are limited, including when a large file such as `src/App.tsx` cannot be edited through the usual file operation.

## Normal workflow

1. Read `knowledge/README.md`, relevant request notes, and the current code before planning.
2. Write the implementation plan under `requests/` and wait for Oliver's explicit approval before ordinary feature work.
3. Start a branch from the latest `main`. Make the smallest coherent change, add or update regression tests, and inspect the complete diff.
4. Run the checks available in the repository:
   - `npm run test`
   - `npx tsc --noEmit` (if this is the project's configured TypeScript check)
   - `npm run build`
5. Open a pull request into `main`. Check the changed-file list and diff, wait for required checks, and merge only after approval.
6. Confirm that the merge actually reached `main`. Then inspect the main-branch GitHub Actions run and verify that its build and Pages deployment succeeded.
7. Update the Knowledge Base with the actual commit/PR and workflow results. Mark anything not checked as unverified.

Do not say the site is deployed just because a PR was created, merged, or passed its PR checks. A successful main-branch deployment is a separate check. Do not claim a manual browser, phone, desktop, or offline test happened unless it was actually performed.

## Fallback: Git Data API when file editing fails

Use this fallback only when the usual editor or file-update operation genuinely cannot handle the change. Do not keep retrying the same failing operation, and do not silently replace a large file with a partial snippet.

1. **Check the current base.** Fetch the latest `main` commit and the file contents you intend to change. For a replacement of an existing file, retain its current blob SHA for conflict-aware file updates.
2. **Prefer the Contents API for simple edits.** Create a branch first, then use the file create/update operation on that branch. For an existing file, supply the current blob SHA. Update the same path sequentially, not concurrently.
3. **For multi-file or large changes, use Git objects.**
   - Create a blob for each complete changed or new file and record each returned blob SHA.
   - Create a tree based on the current base commit's tree. Include only the changed paths with their new blob SHAs and file mode `100644`; the base tree preserves unchanged files. For deletions, use the API's supported deletion entry rather than an empty or truncated file.
   - Create a commit pointing to that tree with the intended parent commit SHA.
   - Move the feature branch to the new commit with a non-force update. If the update is rejected because the branch head changed, inspect the new head and rebuild against the latest state; do not force it through.
4. **Use a branch and pull request.** Never use this fallback as a reason to bypass review and push ordinary feature work straight to `main`. Create the branch from the latest `main`, commit to that branch, open a PR, and review the diff.
5. **Check for accidental omissions.** A tree built without the base tree can unintentionally remove unrelated repository files. Verify every changed path, the diff against `main`, and the resulting commit's parent before opening the PR.
6. If the connector cannot read the base tree or verify the resulting branch/commit, stop and report the limitation rather than guessing at SHAs or claiming success.

## GitHub Pages checks

The repository's Actions workflow is responsible for testing/building and deploying Pages on pushes to `main`.

- On the PR, inspect the actual test, TypeScript, and production-build results. Fix failures before merging.
- After merge, inspect the workflow run triggered by the new `main` commit. Confirm the production build and Pages deployment jobs completed successfully.
- Open the configured published URL when available. A green workflow is not the same as a visual smoke test; say explicitly if the live URL or rendered UI could not be checked.
- If deployment fails, use the Actions logs to identify the failing step, fix it on a branch, and repeat the checks. Do not report the new version as live until deployment succeeds.
- A deployed PWA can temporarily show cached assets. If the live URL looks old, check the deployment commit and reload/update the installed app before assuming the source change was not published.

## Safety and reporting

- Never commit secrets, access tokens, credentials, local environment files, or private study/profile data.
- Do not force-push or overwrite a branch after a stale-SHA error without inspecting the current head.
- Keep the change limited to the requested scope. Do not rewrite unrelated files to work around a tool limitation.
- Report concrete evidence: commit/PR link, checks actually observed, and deployment status. Distinguish automated checks from manual testing.
