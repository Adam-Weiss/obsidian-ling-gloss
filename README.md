# Tibetan Gloss (ngloss)

Tibetan-focused interlinear glossing plugin for Obsidian using **one syntax only**: `ngloss`.

## Supported commands

- `\num`
- `\lbl`
- `\ex`
- `\gl` (required for token lines, may repeat)
- `\ft` (may repeat)
- `\src`
- `\style` (container classes)
- `\box on|off|auto` (per-gloss token boxing override)

Not supported: `\gla`, `\glb`, `\glc`, `\set`, `\set*`.

## Inline syntax

Inline parsing is active only in:
- `\ex`
- Surface cells (level 0) in `\gl`

Supported inline forms:
- Wiki link: `<<target>>`
- Wiki link with label: `<<target|label>>`
- Footnote marker: `^^id^^`

### Tibetan target normalization

For Tibetan link targets (Unicode Tibetan range), targets are normalized to end with tsek `་` unless they already end with `་`, `།`, `༎`, or whitespace.

## Level names

User-facing terminology:
- Level 0: **Surface**
- Level 1: **Gloss**
- Level 2: **Tags**
- 3+: **Extra**

## Tibetan spacing controls

Settings include:
- **Particle spacing after links** (toggle)
- **Particle space width** (hair/thin/normal)
- **Particle list** (space-separated Tibetan particles)

This controls spacing after links (e.g., before `ས་`) and is separate from **Token gap**.

## Example

````ngloss
\style demo tibetan
\box auto
\num{num} 12
\lbl{lbl} Ex.
\ex{boex} ལྷོ་བྲག<<མར་པ>>ས་ ལ་ ^^note^^
\gl ལྷོ་བྲག [Lhodrak] [TOP] <<མར་པ>>ས་{#box} [Marpa] [PN] ལ་{#nobox} [to] [DAT]
\ft{ft} In Lhodrak, to Marpa.
\src{src} Blue Annals
````

Notes:
- No escaping hacks are needed for links in `ngloss`.
- Default rendering is non-italic.
- Per-token `{#box}` / `{#nobox}` overrides are supported.
- Token/cell class suffixes `{class1,class2}` remain supported.
