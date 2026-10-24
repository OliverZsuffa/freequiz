# Request 005: Separate AI extraction and question generation

## Status
Implemented and merged via PR #4. 33 tests, TypeScript check, production build, and GitHub Pages deployment passed in workflow run 40079472885.

## Goal
Make the AI prompt generator useful for two distinct workflows: extracting questions that already exist in a supplied source, and generating new questions from learning material. The prompts must make the difference explicit and produce question-bank JSON that Freequiz can import.

## 1. Two explicit modes

### Extract existing questions
- Label the mode **Extract existing questions**.
- Generate a reusable prompt for an external AI to extract questions from a document, PDF, slide deck, notes, or other material the user attaches or pastes into that external conversation.
- Do not invent questions, options, answer keys, explanations, or missing details.
- Preserve original wording and answer options as faithfully as possible. Reformat only as needed for the import schema.
- Mark answers as correct only when the source explicitly supports that answer. If an answer key is absent or ambiguous, leave the answer unresolved using the schema's supported representation or flag the item for review; never guess to fill a required field.
- Do not treat distractors or claims in the source as automatically correct. Distinguish source content from explicit answer keys.
- Add the protected provenance tag `AI-Extracted` to every question produced in this mode.

### Generate new questions
- Label the mode **Generate new questions**.
- Generate a reusable prompt for an external AI to create original assessment questions grounded in the learning material the user supplies in that external conversation.
- Questions must test meaningful understanding, application, distinctions, and common misconceptions, not merely obvious recall or trivial wording.
- Distractors must be plausible to a learner who misunderstands the material, mutually distinguishable, and comparable in specificity and grammatical form to the correct answer. No random nonsense options or obviously absurd alternatives.
- Balance option length and detail. Do not make the correct answer consistently longer, more qualified, more technical, or more specific than distractors.
- Vary correct-answer positions across the set and avoid patterns. Avoid grammatical agreement, repeated keywords, absolute wording, formatting, or other unintended clues.
- Use comparable answer options and a difficulty appropriate to the source. Support the existing `single`, `exactly-n`, and `select-all` answer modes, with a sensible variable number of options.
- Include explanations grounded in the material where useful. Do not invent facts beyond the supplied material. If the source is insufficient to make a sound question, skip it or flag the limitation instead of fabricating certainty.
- Add the protected provenance tag `AI-Generated` to every question produced in this mode.

## 2. Provenance and tags
- Store provenance as question metadata, not as a section name or text embedded in the question.
- Preserve the original provenance tag across editing, reuse, imports, and exports. Editing must not silently reclassify a question.
- Allow users to add and edit ordinary tags independently of provenance.
- A question may retain its original provenance and have multiple additional tags.
- Display provenance clearly enough that users can distinguish extracted and generated questions.
- Ensure legacy questions and imports without provenance continue to work unchanged.
- If the current question schema lacks tag support, extend it compatibly and update validation, editing, import, and export paths.
- Do not allow ordinary tag editing to remove or overwrite the protected provenance tag.

## 3. Consistent output and workflow
- Both prompts must request the existing Freequiz question-bank JSON format and the supported answer modes.
- Keep the workflow client-side: Freequiz creates and copies the prompt; the user supplies the source material directly to an external AI. Do not add AI API calls or source-material upload fields.
- Make the selected mode and its key distinction clear in the UI.
- Include brief guidance explaining that extraction prioritizes fidelity and non-invention, while generation prioritizes sound original questions and plausible distractors.

## 4. Tests and acceptance criteria
- Test both prompt modes and verify each prompt contains its mode-specific constraints and correct provenance tag.
- Test that editing a question preserves provenance while allowing ordinary tags to change.
- Test that imports/exports and legacy questions remain compatible with the tag model.
- Test that provenance cannot be removed through ordinary tag editing.
- Test generated prompt requirements for plausible distractors, balanced option lengths, varied correct-answer positions, and avoidance of answer clues.
- Test extraction instructions for missing/ambiguous answer keys and prohibit guessing or inventing questions.
- Run the test suite, TypeScript check, and production build; verify the GitHub Pages deployment after implementation.
