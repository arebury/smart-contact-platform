# Design tokens

`sc-tokens.css` is the **single source of truth** for every visual decision in
the application. All `--sc-*` custom properties live here, and PrimeNG `--p-*`
variables are overridden in section 4 of the same file.

## How to read the file

The file is split into four sections in this order:

| Section | What it contains |
| --- | --- |
| 1. Primitives | Raw values copied 1:1 from `design-tokens-complete.json` (color scales, typography, spacing, radius). |
| 2. Semantic | Purpose-bound aliases of primitives (`--sc-text-primary`, `--sc-bg-danger`, etc.). |
| 3. Custom | Tokens the JSON does not cover: shadows, z-index, layout sizes, motion. |
| 4. PrimeNG overrides | `--p-*` variables redirected to `--sc-*` tokens. PrimeNG components consume these automatically. |

## Rules

1. **Never declare `--p-*` variables outside section 4 of `sc-tokens.css`.**
2. Components must reference `--sc-*` tokens — never raw `#hex`, `Npx`, or
   numeric values for color, spacing, typography or radius.
3. When adding a new token: declare the primitive first, then the semantic
   alias, then any PrimeNG override. Never the other way around.
4. To change a value globally, edit the `--sc-*` declaration. The `--p-*`
   override that points to it picks up the change automatically.

## Adding a new token

```css
/* 1. Add the primitive (if not already in the JSON) */
--sc-color-magenta-500: #d946ef;

/* 2. Add a semantic alias */
--sc-bg-magenta: var(--sc-color-magenta-500);

/* 3. (Optional) Override the matching PrimeNG variable */
--p-magenta-500: var(--sc-color-magenta-500);
```

## Token naming

`--sc-<category>-<variant>-<modifier>`

- `<category>`: `color`, `text`, `bg`, `border`, `icon`, `font-size`,
  `line-height`, `font-weight`, `spacing`, `radius`, `shadow`, `z`,
  `transition`, `easing`.
- `<variant>`: scale step (`50`, `100`, …, `950`) or semantic name
  (`primary`, `danger`, `subtle`, `accent`, …).
- `<modifier>`: optional state (`hover`, `active`, `disabled`, `subtle`).

Examples: `--sc-color-blue-700`, `--sc-bg-primary-hover`,
`--sc-text-on-danger`, `--sc-radius-full`, `--sc-z-modal`.
