# Request 008: Enforce existing section references

## Problem
Even with Request 007's prompt changes, an external AI explained that the JSON must be self-contained and therefore repeated existing section definitions. That interpretation contradicts Freequiz's intended import behaviour.

## Changes
- State explicitly that existing section IDs remain valid without their definitions in the imported JSON.
- Forbid making the output self-contained by repeating existing section definitions.
- Clarify that generic JSON/schema assumptions do not justify repeating existing sections.
- Give a compact concrete example: existing section ID `ia-1-1`, question uses `sectionId: ia-1-1`, top-level `sections: []`.
- Add regression assertions for these exact rules.

## Acceptance criteria
- With section matching enabled, if all questions fit existing sections, prompt explicitly requires an empty sections array.
- Only genuinely new section definitions may be returned.
- Tests, typecheck, build, and Pages artifact workflow pass.
- Deployment status is reported separately from the pull-request build; no claim of live verification without evidence.
