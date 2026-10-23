# Request 001: Open questions

The plan can proceed with the defaults below unless Oliver asks to change them.

1. **Correct answers:** Support single choice and multiple select questions. The imported schema explicitly states the answer mode. Default to single choice when omitted.
2. **Storage:** Store full profiles and history in IndexedDB. Provide exportable backups because browser data can be cleared and does not sync across devices.
3. **Mastery rules:** Use the requested two consecutive correct / two consecutive incorrect rule as the default, with the latest attempt streak determining the visible state. Show never attempted separately from attempted once.
4. **Review scheduling:** Use a transparent local spaced repetition heuristic based on correctness and elapsed time, not an external algorithm service.
5. **AI workflow:** Generate prompts and validate pasted responses locally. Never send data to a model automatically.
6. **Repository:** Use OliverZsuffa/freequiz, main as the integration branch, and GitHub Pages via Actions. The repository currently exists and appears empty.
7. **Visual direction:** Use a clean, responsive, light and dark theme with mastery labels that do not rely on colour alone.

No blocking clarification is required for the first implementation. Please review and explicitly approve Request 001 before implementation begins.
