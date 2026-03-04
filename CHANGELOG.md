# Changelog

## 2.4.0
- Rewrite as ngloss-only parser and renderer (`\gl`-based, no `\gla/\glb/\glc`, no `\set`).
- Add `\style` and per-command class suffixes (e.g. `\ex{boex}`) for block-level styling.
- Add per-gloss `\box on|off|auto` override while preserving per-token `{#box}` / `{#nobox}`.
- Replace inline syntax with `<<wiki>>`/`<<target|label>>` and `^^footnote^^`.
- Add Tibetan wiki-target normalization (auto-tsek for Tibetan targets).
- Add Tibetan particle spacing controls after links and tsek token assist setting.
- Rename visible level labels to Surface / Gloss / Tags / Extra.
- Remove default italics from built-in styles.

## 2.3.0
- Add mixed boxed/unboxed tokens with per-token `#box`/`#nobox` markers and auto-boxing.
- Expose boxed-token controls and formatting settings in the plugin UI.
- Add print-friendly styling for A4 output with clean grayscale boxes.
- Expand documentation with mixed-token examples and notes/links guidance.
