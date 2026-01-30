# Obsidian Interlinear Glossing Plus

Interlinear Glossing Plus is an Obsidian plugin for writing interlinear glosses with reliable alignment, configurable styling, and a safe subset of inline markup. The plugin preserves the existing alignment behavior while adding optional features like default `ngloss` syntax, multiple translations, per-token classes, and minimal inline link/footnote parsing.

> **Image placeholder:** Add a screenshot of a basic gloss rendered in Obsidian.

---

## 1) Feature & Settings Overview (quick review)

### Core glossing features
- **Standard gloss blocks** with `\gla`, `\glb`, `\glc` levels. 
- **Alternate `ngloss` syntax** via `\gl`, with arbitrary additional levels.
- **Alignment behavior** preserved (same DOM structure and alignment logic as before).
- **Multiple `\ft` translations** with stacked or paragraph rendering.
- **Per-token and per-cell class hooks** (ngloss only): `{class1,class2}`.
- **Safe inline links/footnote refs** in Level A, `\ex`, and `\ft` only.
- **Per-gloss options** via `\set` and `\set*`.

### Plugin settings
- **Default syntax** (`gloss` or `ngloss`).
- **Translation rendering** (`Stacked lines` or `Paragraph`).
- **Inline links/footnote refs** (toggle).
- **Compact mode** (reduced spacing).
- **Box tokens** (subtle borders).
- **Center token text** (align centers).
- **Alignment mode** (none / default markers / custom markers), **align level**, **center fallback**.
- **Default `\set` options** (global styles, per-level styles, etc.).

---

## 2) Recommended README structure

If you are reorganizing this documentation, a clear user-focused structure is:
1. **Overview & quick start** (1–2 examples).
2. **Gloss syntax guide** (regular `gloss` and `ngloss`).
3. **Commands & options** (`\gla`, `\glb`, `\glc`, `\gl`, `\ex`, `\ft`, `\src`, `\lbl`, `\num`, `\set`).
4. **Inline markup rules** (safe subset only).
5. **Settings reference** (what each toggle does).
6. **CSS customization** (DOM classes, hooks, and snippet examples).
7. **Installation** (community + manual).

The rest of this README follows that structure.

---

## 3) Quick start

### Basic gloss (English)

```gloss
\gla the cat sleep-s
\glb DEF cat sleep-PRS.3SG
\ft The cat sleeps.
```

> **Image placeholder:** Basic English gloss example.

### Gloss with `\ex` and multiple `\ft` (Spanish)

```gloss
\ex El gato duerme.
\gla el gato dormir-e
\glb DEF cat sleep-PRS.3SG
\ft The cat sleeps.
\ft It is resting now.
```

> **Image placeholder:** Spanish example with two translations.

---

## 4) Gloss syntax guide

### 4.1 Regular syntax (`gloss` blocks)

Use a fenced code block with the `gloss` tag:

````
```gloss
# Comments start with # and are ignored
\gla word-s
\glb word-PL
```
````

**Command summary (regular syntax):**
- `\gla` — level A (source language)
- `\glb` — level B (gloss)
- `\glc` — level C (optional extra line, e.g., transcription)
- `\ex` — preamble/source line (shown above)
- `\ft` — free translation line(s)
- `\src` — source/attribution
- `\lbl` — label (language name or header)
- `\num` — numbering label

**Token rules:**
- Tokens are separated by spaces.
- Bracketed `[tokens with spaces]` are treated as a single token.
- To output literal `[` or `]`, escape with `^` as `^[` or `^]`.
- Empty `[]` is allowed to force a blank token.

**Line wrapping:**
You can indent a line to continue the previous command.

```gloss
\gla the cat
    sleep-s
\glb DEF cat
    sleep-PRS.3SG
\ft The cat sleeps.
```

> **Image placeholder:** Example showing wrapped lines.

### 4.2 Alternate syntax (`ngloss` blocks)

Use `ngloss` blocks when you want a token to be followed by its gloss(es) inline:

````
```ngloss
\gl token [gloss]
```
````

**How it parses:**
- A bare `token` starts a new level A element.
- A following `[gloss]` is level B for that element.
- Additional bracketed `[gloss]` tokens create levels C, D, etc.

**Example (German):**

```ngloss
\gl der [DEF.M] Hund [dog] schlaf-t [sleep-PRS.3SG]
\ft The dog sleeps.
```

> **Image placeholder:** German ngloss example.

### 4.3 Default syntax setting

You can set **Default syntax** to `ngloss`, which makes `gloss` blocks behave as if they were `ngloss` blocks. Existing `ngloss` blocks always work.

---

## 5) Command reference

### 5.1 Gloss line commands

| Command | Purpose | Example |
|---|---|---|
| `\gla` | Level A (source text) | `\gla word-s` |
| `\glb` | Level B (gloss) | `\glb word-PL` |
| `\glc` | Level C (optional) | `\glc phonetic` |
| `\gl` | N-level inline syntax (ngloss only) | `\gl tok [gloss] [tag]` |

### 5.2 Preamble & postamble

| Command | Purpose | Example |
|---|---|---|
| `\ex` | Preamble/source text | `\ex A longer source sentence.` |
| `\ft` | Free translation (multiple lines supported) | `\ft Translation text.` |
| `\src` | Source or citation | `\src Author, 2024.` |
| `\lbl` | Label (language or header) | `\lbl Tibetan` |
| `\num` | Numbering | `\num 1` |

### 5.3 Per-gloss options with `\set` / `\set*`

`\set` modifies options for the current gloss only:

- `\set OPTION` for boolean flags
- `\set OPTION value` for single values
- `\set OPTION value1 value2` for list values

`\set*` resets default lists or disables flags instead of appending.

**Available options:**
- `glaspaces` — treat underscores as spaces in level A.
- `markup` — enable safe inline parsing (`[[wiki]]`, `[^footnote]`) in `\ex`, level A, and `\ft`.
- `style`, `glastyle`, `glbstyle`, `glcstyle`, `glxstyle`, `exstyle`, `ftstyle`, `srcstyle` — style class lists.

**Example (Russian):**

```gloss
\set glaspaces
\ex Кошка спит.
\gla koshka_spi-t
\glb cat sleep-PRS.3SG
\ft The cat sleeps.
```

---

## 6) Inline markup rules (safe subset only)

Inline parsing is **off by default per gloss**, but can be enabled globally in settings or per-gloss via `\set markup`.

**Supported (only):**
- Obsidian wiki links: `[[target]]` and `[[target|label]]`
- Footnote refs: `[^id]` (rendered as superscript text, not full footnotes)

**Enabled in:**
- Level A tokens
- `\ex` preamble line
- `\ft` translation lines

**Example (English + wiki links):**

```gloss
\set markup
\ex [[Example Source|Example]] text.[^a]
\gla the [[cat]] sleep-s
\glb DEF cat sleep-PRS.3SG
\ft See [[Glossary]].[^1]
```

---

## 7) Token and cell classes (ngloss only)

In `ngloss`, you can attach class hooks to tokens or bracketed cells:

- `TOKEN{class1,class2}` → applied to the token wrapper (e.g., `ling-tok-class1`).
- `[CELL]{class1,class2}` → applied to the gloss cell (e.g., `ling-cell-class1`).

**Example (Tibetan):**

```ngloss
\gl སེམས་ཅན{agent,noun} [SENTIENT]{sem} [N]
\gl བྱེད{verb} [do] [V]{pos-verb}
\ft “Sentient beings do.”
```

Class names are sanitized to `[a-zA-Z0-9_-]` and prefixed for safety.

---

## 8) Settings reference

Open **Settings → Interlinear Glossing Plus**.

### 8.1 Syntax & translation
- **Default syntax**: `gloss` or `ngloss`.
- **Translation rendering**: `Stacked lines` (each `\ft` line is separate) or `Paragraph` (joined with spaces).

### 8.2 Inline parsing
- **Inline links/footnote refs**: toggle safe inline parsing in level A, `\ex`, and `\ft`.

### 8.3 Design toggles
- **Compact mode**: reduces spacing between lines/tokens (adds `ling-opt-compact`).
- **Box tokens**: outlines each token (adds `ling-opt-tokenbox` on each token).
- **Center token text**: center alignment (adds `ling-opt-center` on the gloss wrapper).

### 8.4 Alignment settings
- **Align gloss elements**: none / default / custom markers.
- **Default center alignment**: center-align tokens without markers.
- **Gloss line for alignment**: which line to inspect (level A, B, or C).
- **Custom alignment markers**: space-separated list.

### 8.5 Default `\set` values
Set defaults for `style`, `gl*style`, `exstyle`, `ftstyle`, `srcstyle`, `glaspaces`, and `markup`.

---

## 9) CSS customization

### 9.1 Structural classes
These classes are always present and can be targeted in snippets:

- `.ling-gloss` — wrapper
- `.ling-gloss-number` — number (`\num`)
- `.ling-gloss-label` — label (`\lbl`)
- `.ling-gloss-body` — content wrapper
- `.ling-gloss-elements` — aligned grid container
- `.ling-gloss-element` — a token group
- `.ling-gloss-level-a`, `.ling-gloss-level-b`, `.ling-gloss-level-c`, `.ling-gloss-level-x`
- `.ling-gloss-preamble` — `\ex`
- `.ling-gloss-translation` — `\ft`
- `.ling-gloss-source` — `\src`

> **Image placeholder:** CSS class diagram screenshot.

### 9.2 Style class hooks (`\set *style`)
`\set` options attach user classes as `.ling-style-<class>`.

Example:

```css
.ling-style-big { font-size: 1.2em; }
.ling-style-muted { color: var(--text-muted); }
```

```gloss
\set glastyle big
\set ftstyle muted
\gla the cat sleep-s
\glb DEF cat sleep-PRS.3SG
\ft The cat sleeps.
```

### 9.3 Token & cell hooks (ngloss)
- Token classes: `.ling-tok-<class>`
- Cell classes: `.ling-cell-<class>`

Example:

```css
.ling-tok-agent { background: var(--background-secondary); }
.ling-cell-pos-verb { font-weight: 600; }
```

### 9.4 Design option classes
- `.ling-opt-compact` (on wrapper)
- `.ling-opt-center` (on wrapper)
- `.ling-opt-tokenbox` (on token)

### 9.5 Built-in style overrides
You can apply these built-in styles via `\set`:

- `glastyle cjk` — removes italics for CJK characters.
- `srcstyle right` — right-aligns the source.
- `srcstyle line` — places source on a new line.
- `srcstyle alt` — uses square brackets for source.

---

## 10) Installation

### 10.1 Community plugins
Install via **Settings → Community plugins → Browse** and search for **Interlinear Glossing Plus**.

### 10.2 Manual install (prebuilt release)
1. Create a folder named `ling-gloss-plus`.
2. Download `main.js`, `manifest.json`, and `styles.css` from the latest release.
3. Copy them into `<Vault Folder>/.obsidian/plugins/ling-gloss-plus`.
4. Reload plugins or restart Obsidian.
5. Enable **Interlinear Glossing Plus**.

### 10.3 Manual install (build from source)
1. Clone this repo.
2. Run `npm install`.
3. Run `npm run build` to generate `main.js`.
4. Copy `manifest.json`, `styles.css`, and `main.js` into `<Vault Folder>/.obsidian/plugins/ling-gloss-plus`.
5. Reload plugins or restart Obsidian.

---

## 11) Additional examples (allowed languages)

### Hebrew
```gloss
\gla ha-kelev yašen
\glb DEF-dog sleep.PRS
\ft The dog sleeps.
```

### Dutch
```gloss
\gla de kat slaap-t
\glb DEF cat sleep-PRS.3SG
\ft The cat sleeps.
```

### Russian
```gloss
\gla kot spi-t
\glb cat sleep-PRS.3SG
\ft The cat sleeps.
```

> **Image placeholder:** Add a multi-language comparison screenshot.
