# Migration Inventory — Smart Contact Design System

> Status legend: ✓ done · 🚧 in progress · ⏳ pending · ❓ unclassified
>
> Esta lista cubre cada componente actual o planificado de SCDS. Se actualiza
> cada vez que se cocina un componente nuevo o se promueve uno existente
> desde AED. La fuente de verdad del API y código vive en
> `packages/design-system/components/`. La fuente de verdad del Figma se anota
> en columna "Figma" cuando exista (link de frame).

## Components

| #  | Name | Status | Type | Selector | Figma | Doc | Notes |
|----|------|--------|------|----------|-------|-----|-------|
| 01 | Button | ✓ | PrimeNG + sc-preset | `<p-button>` | TODO | `docs/components/01-button.md` (TBD) | sky→electric-blue, orange→amber overrides en sc-preset |
| 02 | Modal | ✓ | Wrapper (sc-modal envuelve p-dialog) | `<sc-modal>` | TODO | TODO | Chrome reset vía `::ng-deep .p-dialog` |
| 03 | Toast | ✓ | Wrapper (sc-toast usa p-toast) | `<sc-toast>` | TODO | TODO | Severidades success/info/warn/error/secondary |
| 04 | Photo upload | ✓ | Custom | `<sc-photo-upload>` | TODO | TODO | API `[size]='md'\|'sm'` (DD#56) |
| 05 | Toggle switch | ✓ | Custom | `<sc-toggle-switch>` | TODO | TODO | Native checkbox + label asociada |
| 06 | Tri-state checkbox | ✓ | Custom | `<sc-tri-state-checkbox>` | TODO | TODO | Estados: unchecked / indeterminate / checked |
| 07 | Illustrated avatar | ✓ | Custom | `<sc-illustrated-avatar>` | TODO | TODO | Pools: abstract / illustrated / named / special |
| 08 | Section card | ✓ | Custom | `<sc-section-card>` | TODO | TODO | Anchor para `sc-form-section-nav` scroll-spy |
| 09 | Bulk action bar | ✓ | Custom | `<sc-bulk-action-bar>` | TODO | TODO | Overlay, no layout shift (memoria) |
| 10 | Bulk edit menu | ✓ | Custom | `<sc-bulk-edit-menu>` | TODO | TODO | Combinable con bulk-action-bar |
| 11 | Empty state | ✓ | Custom | `<sc-empty-state>` | TODO | TODO | CTA opcional via slot |
| 12 | Form danger zone | ✓ | Custom | `<sc-form-danger-zone>` | TODO | TODO | Border rojo, requiere confirm |
| 13 | Form section nav | ✓ | Custom | `<sc-form-section-nav>` | TODO | TODO | Scroll-spy a `sc-section-card` |
| 14 | Confirm host | ✓ | Custom (host) | `<sc-confirm-host>` | TODO | TODO | Routea desde ConfirmHostService |
| 15 | Label chip | ✓ | Custom | `<sc-label-chip>` | TODO | TODO | Color palette de `--sc-label-*` |
| 16 | Color dot picker | ✓ | Custom | `<sc-color-dot-picker>` | TODO | TODO | Selección de color para label |
| 17 | Inline rename cell | ✓ | Custom | `<sc-inline-rename-cell>` | TODO | TODO | In-place edit de cell de tabla |
| 18 | Group popover | ✓ | Custom | `<sc-group-popover>` | TODO | TODO | Popover con miembros + acciones |
| 19 | Column selector | ✓ | Custom | `<sc-column-selector>` | TODO | TODO | Show/hide cols de tabla |
| 20 | Command palette | ✓ | Custom | `<sc-command-palette>` | TODO | TODO | ⌘K trigger global |
| 21 | Keyboard shortcuts | ✓ | Custom | `<sc-keyboard-shortcuts>` | TODO | TODO | Help overlay con bindings |
| 22 | Delete entity dialog | ✓ | Custom | `<sc-delete-entity-dialog>` | TODO | TODO | Confirm para borrar entidad |
| 23 | Impact preview dialog | ✓ | Custom | `<sc-impact-preview-dialog>` | TODO | TODO | Muestra impacto antes de mutación |
| 24 | Page header | ✓ | Custom | `<sc-page-header>` | TODO | TODO | Headers de page (lista + form) |
| 25 | Sticky form header | ✓ | Custom | `<sc-sticky-form-header>` | TODO | TODO | Sticky on scroll, redimensiona photo-upload |
| 26 | Input (text/email/password/tel/url/search) | ✓ | Wrapper (sc-input envuelve pInputText) | `<sc-input>` | [Frame 6738:46804](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-46804) | `docs/components/02-input.md` | Migra 2 de 28 candidatos en AED (user-form-page); resto migra por feature al tocarse |
| -- | Dropdown / select | ⏳ | PrimeNG target | `<p-select>` (planeado) | - | - | |
| -- | Datepicker | ⏳ | PrimeNG target | `<p-datepicker>` (planeado) | - | - | |
| -- | Tabs | ⏳ | PrimeNG target | `<p-tabs>` (planeado) | - | - | |
| -- | Tooltip | ⏳ | PrimeNG target | `[pTooltip]` (planeado) | - | - | |

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
