# Editing Freequiz legal information

Edit `public/legal-info.json` before deploying Freequiz.

- `name`, `address`, and `email` are required for production deployment. Use the exact legal identity and a usable postal address; write multi-line addresses with \n inside the JSON string.
- `additionalContact`, `vatId`, and `registerDetails` are optional. Fill them only when applicable.
- `kofiUrl` is optional until you have the exact URL. If provided, it must be a valid HTTPS URL. The Ko-fi link appears in the footer only when this field is populated.
- Do not put passwords, tokens, or private credentials in this file.
- **Everything in this file is public.** GitHub Pages serves it as a static file, so anyone can read the values. Use only information you intend to publish.
- The deploy workflow checks required values and blocks publishing when the required legal details are missing or invalid. Pull-request builds can still run while the fields are blank.
- The privacy notice text is maintained in the app source and should be reviewed against the actual site and hosting practices before publishing.

After editing, run `npm run validate:legal-info`, then `npm test` and `npm run build`, and use the existing deployment workflow.
