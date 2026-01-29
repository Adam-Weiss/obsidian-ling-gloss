# Interlinear Glossing Samples

Use the samples below to verify the new features. Some samples expect specific settings (noted inline).

## Plain gloss (legacy behavior)

```gloss
\gla Péter-nek van egy macská-ja
\glb Peter-DAT exist INDEF cat-POSS.3SG
\ft Peter has a cat.
```

## Default syntax set to `ngloss`

Set **Default syntax** to `ngloss`, then the following ```gloss``` block should render using the `\gl` syntax:

```gloss
\gl Péter-nek [Peter-DAT]
    van [exist]
    egy [INDEF]
    macská-ja [cat-POSS.3SG]
\ft Peter has a cat.
```

## Multiple `\ft` lines

```gloss
\gla Péter-nek van egy macská-ja
\glb Peter-DAT exist INDEF cat-POSS.3SG
\ft Peter has a cat.
\ft It is sitting on the rug.
```

Switch **Translation rendering** to verify stacked vs paragraph output.

## Token/cell classes in `ngloss`

```ngloss
\gl སེམས་ཅན{agent,noun} [SENTIENT]{sem} [N]
\gl བྱེད{verb} [do] [V]{pos-verb}
\ft “Sentient beings do.”
```

Inspect the DOM for `ling-tok-agent`, `ling-tok-noun`, `ling-cell-sem`, `ling-cell-pos-verb`.

## Inline links + footnote refs (Level A, `\ex`, `\ft`)

```gloss
\ex [[Example Source|Example]] shows [[Lemma]] in context.[^a]
\gla བོད་སྐད [[Tibetan]] [^t1]
\glb Tibetan language
\ft See [[Glossary|the glossary]] for details.[^1]
```

Toggle **Inline links/footnote refs** to enable/disable parsing.

## Design toggles (compact, box tokens, center text)

Enable **Compact mode**, **Box tokens**, and **Center token text**. The gloss wrapper should receive `ling-opt-compact` + `ling-opt-center`, and each token should have `ling-opt-tokenbox`:

```gloss
\gla Péter-nek van egy macská-ja
\glb Peter-DAT exist INDEF cat-POSS.3SG
\ft Peter has a cat.
```
