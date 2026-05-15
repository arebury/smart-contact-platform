# Migration Inventory — Smart Contact Design System

> Status: ✓ done · 🚧 in progress · ⏳ pending
>
> Type: 🟦 Full PrimeNG (passthrough) · 🟣 Custom-preset (PrimeNG con overrides brand) · 🟢 Extended (wrapper SC sobre PrimeNG) · ⚪ Pure SC (sin equivalente PrimeNG)
>
> Figma parity: % visual match con el frame Figma referenciado. 100% = pixel-perfect verificado en
> Playwright. 80-99% = alineado en estructura, divergencias menores documentadas. <80% = gap
> significativo (documentar en el spec doc del componente).
>
> Esta lista cubre cada componente actual o planificado de SCDS. La fuente de verdad del API y
> código vive en `packages/design-system/components/`. El catálogo interactivo (checklist con
> localStorage para tracking personal) está en `apps/ds-docs/src/app/pages/home/home.component.ts`.

## Components

| #  | Name | Status | Type | Selector | Figma | Figma parity | Doc |
|----|------|--------|------|----------|-------|--------------|-----|
| 01 | Button | ✓ | 🟣 Custom-preset | `<p-button>` | [6738:49717](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-49717) | **100%** — Session 30 audit Nivel-2 contra los 1965 variants Figma. Padding 10.5/7 ✓ matchea preset. Brand divergences (Primary navy, Info electric-blue, Warn amber) documentadas. | `docs/components/01-button.md` |
| 02 | Modal | ✓ | 🟢 Extended | `<sc-modal>` | TODO | TBD | TODO |
| 03 | Toast | ✓ | 🟢 Extended | `<sc-toast>` | TODO | TBD | TODO |
| 04 | Photo upload | ✓ | ⚪ Pure SC | `<sc-photo-upload>` | TODO | TBD | TODO |
| 05 | Toggle switch | ✓ | ⚪ Pure SC | `<sc-toggle-switch>` | TODO | TBD | TODO |
| 06 | Tri-state checkbox | ✓ | 🟢 Extended | `<sc-tri-state-checkbox>` | [6738:22640](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-22640) | **100%** — Session 30 audit Nivel-2 contra los 60 variants Figma. Box 17.5/14/21 por size, border slate-300 1px, icon 12.25, filled bg slate-50. Checked=navy primary (era blue-700, ahora alineado a `--sc-bg-primary`). `'some'` indeterminate = SC extension. | `docs/components/09-checkbox.md` |
| 07 | Illustrated avatar | ✓ | ⚪ Pure SC | `<sc-illustrated-avatar>` | TODO | TBD | TODO |
| 08 | Section card | ✓ | ⚪ Pure SC | `<sc-section-card>` | TODO | TBD | TODO |
| 09 | Bulk action bar | ✓ | ⚪ Pure SC | `<sc-bulk-action-bar>` | TODO | TBD | TODO |
| 10 | Bulk edit menu | ✓ | ⚪ Pure SC | `<sc-bulk-edit-menu>` | TODO | TBD | TODO |
| 11 | Empty state | ✓ | ⚪ Pure SC | `<sc-empty-state>` | TODO | TBD | TODO |
| 12 | Form danger zone | ✓ | ⚪ Pure SC | `<sc-form-danger-zone>` | TODO | TBD | TODO |
| 13 | Form section nav | ✓ | ⚪ Pure SC | `<sc-form-section-nav>` | TODO | TBD | TODO |
| 14 | Confirm host | ✓ | ⚪ Pure SC | `<sc-confirm-host>` | TODO | TBD | TODO |
| 15 | Label chip | ✓ | ⚪ Pure SC | `<sc-label-chip>` | TODO | TBD | TODO |
| 16 | Color dot picker | ✓ | ⚪ Pure SC | `<sc-color-dot-picker>` | TODO | TBD | TODO |
| 17 | Inline rename cell | ✓ | ⚪ Pure SC | `<sc-inline-rename-cell>` | TODO | TBD | TODO |
| 18 | Group popover | ✓ | ⚪ Pure SC | `<sc-group-popover>` | TODO | TBD | TODO |
| 19 | Column selector | ✓ | ⚪ Pure SC | `<sc-column-selector>` | TODO | TBD | TODO |
| 20 | Command palette | ✓ | ⚪ Pure SC | `<sc-command-palette>` | TODO | TBD | TODO |
| 21 | Keyboard shortcuts | ✓ | ⚪ Pure SC | `<sc-keyboard-shortcuts>` | TODO | TBD | TODO |
| 22 | Delete entity dialog | ✓ | ⚪ Pure SC | `<sc-delete-entity-dialog>` | TODO | TBD | TODO |
| 23 | Impact preview dialog | ✓ | ⚪ Pure SC | `<sc-impact-preview-dialog>` | TODO | TBD | TODO |
| 24 | Page header | ✓ | ⚪ Pure SC | `<sc-page-header>` | TODO | TBD | TODO |
| 25 | Sticky form header | ✓ | ⚪ Pure SC | `<sc-sticky-form-header>` | TODO | TBD | TODO |
| 26 | Input (text/email/password/tel/url/search) | ✓ | 🟢 Extended | `<sc-input>` | [6738:46804](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-46804) | **100%** — Session 30 audit Nivel-2 contra los 240 variants Figma. Padding 10.5/7 (default), 8.75/5.25 (sm), 12.25/8.75 (lg) raw decimal. Variant `[filled]` añadida (slate-50 bg) | `docs/components/02-input.md` |
| 27 | Input number | ✓ | 🟢 Extended | `<sc-input-number>` | TODO | TBD — pendiente reference frame Figma | `docs/components/03-input-number.md` |
| 28 | Select / dropdown | ✓ | 🟢 Extended | `<sc-select>` | [6738:22642](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-22642) | **100%** — Session 30 audit Nivel-2 contra los 258 variants. Padding decimal 8.75/5.25 (sm), 10.5/7 (md), 12.25/8.75 (lg). Variants Filled + Invalid añadidos / verificados. | `docs/components/04-select.md` |
| 29 | Datepicker | ✓ | 🟢 Extended | `<sc-datepicker>` | [6738:20817](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-20817) | **~100%** — input chrome slate-300/6px/shadow, panel slate-200 bg white + dates 28×28 circulares, anchor-gutter 2 | `docs/components/05-datepicker.md` |
| 30 | Tabs | ✓ | 🟣 Custom-preset | `<p-tabs>` | [6738:49740](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-49740) | **100%** — Session 30 audit Nivel-2. Padding tab 14/15.75, tabpanel 12.25/15.75/15.75/15.75 overrides en `components.tabs`. Active = navy (brand divergence vs azure). | `docs/components/06-tabs.md` |
| 31 | Tooltip | ✓ | 🟦 Full PrimeNG | `[pTooltip]` | [6738:50212](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-50212) | **100%** — Session 30 audit. bg slate-700, padding 10.5/7, radius 6, max-width 175. Overrides en `components.tooltip.root`. Shadow heredado de overlay.popover. | `docs/components/07-tooltip.md` |
| 32 | MultiSelect | ✓ | 🟢 Extended | `<sc-multi-select>` | [6738:22651](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-22651) | **100%** — Session 30. Tokens `multiselect/*` idénticos a `select/*` (mismo chrome). Display `comma` o `chip`, selectionLimit, filter. | `docs/components/08-multi-select.md` |

## Tokens

Capa | Archivo | Status
-----|---------|-------
1. Primitive | `tokens/layers/01-primitive.css` | ✓
2. Semantic | `tokens/layers/02-semantic.css` | ✓
3. Palette | `tokens/layers/03-palette.css` | ✓
4. Component | `tokens/layers/04-component.css` | ✓
5. Extensions | `tokens/layers/05-extensions.css` | ✓
7. Dark | `tokens/layers/07-dark.css` | ✓ (capa 6 vivió como CSS, ahora es `sc-preset.ts`)

## Próximos pasos por componente

Workflow para CADA componente que entra a SCDS:

1. Implementar/migrar en `packages/design-system/components/<name>/`.
2. Page en `apps/ds-docs/src/app/pages/<name>/` con variants + code snippets.
3. Spec doc en `packages/design-system/docs/components/<NN>-<name>.md` (intent, API, do/don't).
4. Override en `sc-preset.ts` si hay brand divergence vs Aura.
5. Anotar en `customs-catalog.md` si aplica.
6. Update este `MIGRATION-INVENTORY.md` (status + Figma + Doc).
7. Commit directo a `main` (no PR ceremony) → Netlify auto-deploya AED + ds-docs.

Para tokens nuevos: misma cosa pero el doc es en `docs/tokens-<scope>.md` y el "page" es en `apps/ds-docs/foundations/`.
