# Request 008 implementation plan

1. Strengthen `buildAiPrompt` to explicitly state that existing IDs need not be defined in the import file and generic self-contained-schema assumptions are not a reason to repeat them.
2. Add regression tests for the wording.
3. Run tests, TypeScript check, and production build in GitHub Actions.
4. Merge after checks pass and inspect deployment status separately.
