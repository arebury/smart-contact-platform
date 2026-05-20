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
| 02 | Modal / Dialog | ✓ | 🟢 Extended | `<sc-dialog>` | [6738:50207](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-50207) ConfirmDialog · [6738:50208](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-50208) ConfirmPopup | **100%** — Session 30 audit. Border slate-200, radius 12, padding 17.5 uniforme (top:0 en body/footer), title 17.5/600, header gap 7, footer gap 7, double-layer shadow. Body slot con stacking auto via `display: flex; gap: 16px`. SC extensions documentadas (3-slot shell, bodyless mode). | `docs/components/11-dialog.md` |
| 03 | Toast | ✓ | 🟣 Custom-preset + template | `<p-toast>` + pTemplate override en `app.component.html` | [6738:53165](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-53165) | **100%** — Session 30 audit. Width 350, radius 6, padding 10.5, icon 15.75, borders severity-200 tinted, backdrop blur 1.5, close 24.5 circular. SC extensions: action button (undo), icon-square chrome, severity=secondary→violet. | `docs/components/10-toast.md` |
| 04 | Photo upload | ✓ | ⚪ Pure SC | `<sc-photo-upload>` | n/a (pattern in-house, no Figma) | n/a | `docs/components/29-photo-upload.md` |
| 05 | Toggle switch | ✓ | 🟢 Extended | `<sc-toggleswitch>` | [6738:22645](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-22645) | **100%** — S32 refactor: ahora wrapper de `<p-toggleswitch>` (era CSS sobre input nativo). Hereda chrome + a11y PrimeNG. | `docs/components/15-toggleswitch.md` |
| 06 | Tri-state checkbox | ✓ | 🟢 Extended | `<sc-checkbox>` | [6738:22640](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-22640) | **100%** — Session 30 audit Nivel-2 contra los 60 variants Figma. Box 17.5/14/21 por size, border slate-300 1px, icon 12.25, filled bg slate-50. Checked=navy primary (era blue-700, ahora alineado a `--sc-bg-primary`). `'some'` indeterminate = SC extension. | `docs/components/09-checkbox.md` |
| 07 | Illustrated avatar | ✓ | ⚪ Pure SC | `<sc-illustrated-avatar>` | n/a (asset custom, no Figma) | n/a | `docs/components/16-illustrated-avatar.md` |
| 08 | Section card | ✓ | ⚪ Pure SC | `<sc-section-card>` | n/a (pattern in-house, no Figma) | n/a | `docs/components/13-section-card.md` |
| 09 | Bulk action bar | ✓ | ⚪ Pure SC | `<sc-bulk-action-bar>` | n/a (pattern in-house, no Figma) | n/a | `docs/components/23-bulk-action-bar.md` |
| 10 | Bulk edit menu | ✓ | ⚪ Pure SC | `<sc-bulk-edit-menu>` | n/a (pattern in-house, no Figma) | n/a | `docs/components/24-bulk-edit-menu.md` |
| 11 | Empty state | ✓ | ⚪ Pure SC | `<sc-empty-state>` | n/a (pattern in-house, no Figma) | n/a | `docs/components/12-empty-state.md` |
| 12 | Form danger zone | ✓ | ⚪ Pure SC | `<sc-form-danger-zone>` | n/a (pattern in-house, no Figma) | n/a | `docs/components/21-form-danger-zone.md` |
| 13 | Form section nav | ✓ | ⚪ Pure SC | `<sc-form-section-nav>` | n/a (pattern in-house, no Figma) | n/a | `docs/components/20-form-section-nav.md` |
| 14 | Confirm host | ✓ | 🟢 Extended | `<sc-confirm-host>` | [6738:50207](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-50207) ConfirmDialog | **100%** — S34 refactor: wrapper de `<p-confirmdialog>` (era composición sobre sc-modal). API pública del service `ConfirmHostService.request(req): Promise<boolean>` intacta. | `docs/components/33-confirm-host.md` |
| 15 | Label chip | ✓ | ⚪ Pure SC | `<sc-label-chip>` | [6738:55109](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-55109) Chip | TBD — semántica `LabelColor` propia, no se wrappea `<p-tag>` (decisión S32) | `docs/components/17-label-chip.md` |
| 16 | Color dot picker | ✓ | ⚪ Pure SC | `<sc-color-dot-picker>` | n/a (pattern in-house, no Figma) | n/a | `docs/components/18-color-dot-picker.md` |
| 17 | Inline rename cell | ✓ | ⚪ Pure SC | `<sc-inline-rename-cell>` | n/a (pattern in-house, no Figma) | n/a | `docs/components/28-inline-rename-cell.md` |
| 18 | Group popover | ✓ | 🟢 Extended | `<sc-group-popover>` | `❖ Popover` (Figma SC kit recap) | **100%** — S34 refactor: wrapper de `<p-popover>` (era panel CSS custom). Chrome via `overlay.popover` tokens. Hover-or-focus mechanics preservadas en el wrapper. | `docs/components/30-group-popover.md` |
| 19 | Column selector | ✓ | ⚪ Pure SC | `<sc-column-selector>` | n/a (pattern in-house, no Figma) | n/a | `docs/components/27-column-selector.md` |
| 20 | Command palette | ✓ | ⚪ Pure SC | `<sc-command-palette>` | n/a (pattern in-house, no Figma) | n/a | `docs/components/31-command-palette.md` |
| 21 | Keyboard shortcuts | ✓ | ⚪ Pure SC | `<sc-keyboard-shortcuts>` | n/a (pattern in-house, no Figma) | n/a | `docs/components/32-keyboard-shortcuts.md` |
| 22 | Delete entity dialog | ✓ | ⚪ Pure SC | `<sc-delete-entity-dialog>` | n/a (composición sobre sc-modal, hereda) | n/a | `docs/components/26-delete-entity-dialog.md` |
| 23 | Impact preview dialog | ✓ | ⚪ Pure SC | `<sc-impact-preview-dialog>` | n/a (composición sobre sc-modal, hereda) | n/a | `docs/components/25-impact-preview-dialog.md` |
| 24 | Page header | ✓ | ⚪ Pure SC | `<sc-page-header>` | n/a (pattern in-house, no Figma) | n/a | `docs/components/19-page-header.md` |
| 25 | Sticky form header | ✓ | ⚪ Pure SC | `<sc-sticky-form-header>` | n/a (pattern in-house, no Figma) | n/a | `docs/components/22-sticky-form-header.md` |
| 26 | Input (text/email/password/tel/url/search) | ✓ | 🟢 Extended | `<sc-inputtext>` | [6738:46804](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-46804) | **100%** — Session 30 audit Nivel-2 contra los 240 variants Figma. Padding 10.5/7 (default), 8.75/5.25 (sm), 12.25/8.75 (lg) raw decimal. Variant `[filled]` añadida (slate-50 bg) | `docs/components/02-inputtext.md` |
| 27 | Input number | ✓ | 🟢 Extended | `<sc-inputnumber>` | hereda de [6738:46804](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-46804) (sc-inputtext) | **100%** — chrome 1:1 vía sc-inputtext auditado S30. Extensiones SC (suffix unit + right-align numérico) NO modeladas en Figma kit. S34: TODO cerrado. | `docs/components/03-inputnumber.md` |
| 28 | Select / dropdown | ✓ | 🟢 Extended | `<sc-select>` | [6738:22642](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-22642) | **100%** — Session 30 audit Nivel-2 contra los 258 variants. Padding decimal 8.75/5.25 (sm), 10.5/7 (md), 12.25/8.75 (lg). Variants Filled + Invalid añadidos / verificados. | `docs/components/04-select.md` |
| 29 | Datepicker | ✓ | 🟢 Extended | `<sc-datepicker>` | [6738:20817](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-20817) | **~100%** — input chrome slate-300/6px/shadow, panel slate-200 bg white + dates 28×28 circulares, anchor-gutter 2 | `docs/components/05-datepicker.md` |
| 30 | Tabs | ✓ | 🟣 Custom-preset | `<p-tabs>` | [6738:49740](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-49740) | **100%** — Session 30 audit Nivel-2. Padding tab 14/15.75, tabpanel 12.25/15.75/15.75/15.75 overrides en `components.tabs`. Active = navy (brand divergence vs azure). | `docs/components/06-tabs.md` |
| 31 | Tooltip | ✓ | 🟦 Full PrimeNG | `[pTooltip]` | [6738:50212](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-50212) | **100%** — Session 30 audit. bg slate-700, padding 10.5/7, radius 6, max-width 175. Overrides en `components.tooltip.root`. Shadow heredado de overlay.popover. | `docs/components/07-tooltip.md` |
| 32 | MultiSelect | ✓ | 🟢 Extended | `<sc-multiselect>` | [6738:22651](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-22651) | **100%** — Session 30. Tokens `multiselect/*` idénticos a `select/*` (mismo chrome). Display `comma` o `chip`, selectionLimit, filter. | `docs/components/08-multiselect.md` |
| 33 | Search | ✓ | 🟢 Extended | `<sc-search>` | [11861:55210](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=11861-55210) | **100%** — S31 cocinado. Composición `<p-iconfield>` + `<p-inputicon>` + `pInputText` + clear button auto + opcional kbd hint `⌘K`/`/`. Figma canvas compuesto (Light + Dark + Components frame). | `docs/components/14-search.md` |
| 34 | Input group | ✓ | 🟢 Extended | `<sc-inputgroup>` | [6738:22644](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-22644) | **100%** — S33 cocinado. Wrapper minimal de `<p-inputgroup>` + `<p-inputgroup-addon>` (PrimeNG nativo). `size` matchea `sc-inputtext`. Trigger real: tag-input aed-servicio. Tokens fluyen via `formField.*` sin overrides propios. | `docs/components/34-inputgroup.md` |

## Tokens

Capa | Archivo | Status
-----|---------|-------
1. Primitive | `tokens/layers/01-primitive.css` | ✓
2. Semantic | `tokens/layers/02-semantic.css` | ✓
3. Palette | `tokens/layers/03-palette.css` | ✓
4. Component | `tokens/layers/04-component.css` | ✓
5. Extensions | `tokens/layers/05-extensions.css` | ✓
7. Dark | `tokens/layers/07-dark.css` | ✓ (capa 6 vivió como CSS, ahora es `sc-preset.ts`)

## Figma verification log

> Fecha del último audit Figma SC vs implementación SCDS por componente.
> Pattern: cada sesión que toque Figma actualiza la fecha del componente
> auditado. Drift detection ligero (memoria `feedback_track_inconsistencies`,
> backlog #20). Pattern industria (Atlassian, IBM Carbon).
>
> Solo aplica a componentes con Figma reference real (no `n/a` pattern in-house).

| Componente | Última verificación | Sesión | Notas |
|---|---|---|---|
| `<p-button>` | 2026-05-15 | S30 | Nivel-2 contra 1965 variants, parity 100% |
| `<sc-dialog>` | 2026-05-15 | S30 | Border slate-200, radius 12, padding 17.5 |
| `<p-toast>` | 2026-05-15 | S30 | Width 350, severity-200 tinted borders |
| `<sc-checkbox>` | 2026-05-15 | S30 | 60 variants Nivel-2, navy primary |
| `<sc-inputtext>` | 2026-05-15 | S30 | 240 variants Nivel-2, padding decimal raw |
| `<p-tabs>` | 2026-05-15 | S30 | Padding tab 14/15.75 |
| `<p-tooltip>` | 2026-05-15 | S30 | bg slate-700, padding 10.5/7 |
| `<sc-multiselect>` | 2026-05-20 | S46 | Re-verificado: S30 parity 100% confirmado en uso real (Memory `/conversaciones` ConversationFilters top-bar). Variants `size: sm/md/lg` aplicadas correctamente en `sm` (height 36px) sin override custom. **Pendiente equipo de diseño**: confirmar variants formales `sm/md/lg` en Kit Pro (S30 audit Nivel-2 cubrió size default, no las 3 variants size). |
| `<sc-select>` | 2026-05-15 | S30 | 258 variants Nivel-2, Filled + Invalid |
| `<sc-datepicker>` | 2026-05-20 | S46 | Re-verificado: S30 parity 100% confirmado en uso real (Memory ConversationFilters). Variants `size: sm/md/lg` aplicadas correctamente. **Pendiente equipo de diseño**: idem multi-select. |
| `<sc-inputtext>` (re-check S46) | 2026-05-20 | S46 | Aplicado `size="sm"` en Memory filters origin/destination. Sin drift visual perceptible. Variants `sm/md/lg` ya estaban auditadas S30 (240 variants Nivel-2). |
| `<sc-search>` | 2026-05-15 | S31 | Composición aditiva canvas Light+Dark+Components |
| `<sc-toggleswitch>` | 2026-05-15 | S32 | Refactor a wrapper p-toggleswitch, Figma node 6738:22645 |
| `<sc-label-chip>` | 2026-05-15 | S32 | Figma `❖ Chip` node 6738:55109 confirmado |

**Verificación global variables Figma SC**: 2026-05-15 (S32). Subagent audit confirmó NO se han modificado variables base del kit PrimeOne. Política `audit/01-identity-recap.md §2.10` consistente. Próxima verificación recomendada: cuando el equipo de diseño haga cambios en el file, o cada 3 meses (whichever first).

## Lifecycle / Maturity

> Clasificación tipo GitHub Primer para que devs consumers sepan qué componentes
> son seguros para construir encima vs cuáles aún están bajo validación o son
> internos del shell. NO confundir con el "Status" (✓ done) — esto es ciclo de
> vida API + adopción real.
>
> Pattern: añadir/actualizar entries cuando un componente cambie de fase.
> Trigger típico: 5+ consumers para promover de `low-usage` a `stable`.

### `stable` (API estable + alto uso AED, seguro construir encima)

| Componente | AED uses | Notas |
|---|---|---|
| `<p-button>` | 38 (incluye `.btn` class) | Top usage del catálogo |
| `<sc-toggleswitch>` | 21 | Refactor S32 a wrapper p-toggleswitch |
| `<sc-inputtext>` | 21 | Migración 100% en S31+S32 |
| `<sc-select>` | 16 | Migración 100% en S31+S32 |
| `<sc-section-card>` | 12 | Patrón canónico form long |
| `<sc-search>` | 8 | Cocinado S31, migrado consumers |
| `<sc-page-header>` | 8 | Mirror visual con sticky-form-header |
| `<sc-delete-entity-dialog>` | 8 | Pattern industry |
| `<sc-inputnumber>` | 7 | Estable |
| `<sc-illustrated-avatar>` | 7 | Custom asset |
| `<sc-checkbox>` | 6 | API estable |
| `<sc-bulk-action-bar>` | 6 | Pattern Gmail/Linear |
| `<sc-sticky-form-header>` | 3 | Patrón canónico Create/Edit |
| `<sc-form-section-nav>` | 3 | Patrón canónico form long |
| `<sc-form-danger-zone>` | 3 | Pattern industry |
| `<sc-empty-state>` | 3 | Patrón canónico list pages |
| `<sc-label-chip>` | 3 | Modelo LabelColor propio |
| `<sc-dialog>` | 2 | Pattern foundation |
| `<p-toast>` | 1 (singleton) | App-level |
| `<p-tabs>` | 0 (esperando caso) | API estable |
| `<p-tooltip>` | 0+ (utility) | API estable |

### `low-usage` (API estable, pocos consumers — validar antes de generalizar)

| Componente | AED uses | Razón |
|---|---|---|
| `<sc-photo-upload>` | 2 | Solo en sticky-form-header de agent/user |
| `<sc-impact-preview-dialog>` | 2 | Solo bulk operations específicas |
| `<sc-bulk-edit-menu>` | 2 | Solo users + agents list pages |
| `<sc-column-selector>` | 3 | Solo list pages con muchas columnas |
| `<sc-inline-rename-cell>` | 3 | Solo post-duplicate flow |
| `<sc-group-popover>` | 1 | Solo agents-list-page columna grupos |
| `<sc-color-dot-picker>` | 1 | Solo label form |
| `<sc-multiselect>` | 0 | Esperando primer caso real |
| `<sc-datepicker>` | 0 | Esperando primer caso real |

### `internal` (singletons app-level, no consumidos como library)

| Componente | AED uses | Razón |
|---|---|---|
| `<sc-confirm-host>` | 1 (singleton) | Servicio + host único |
| `<sc-command-palette>` | 1 (singleton) | ⌘K overlay global |
| `<sc-keyboard-shortcuts>` | 1 (singleton) | `?` cheat sheet global |

### `experimental` — _ninguno hoy_

Reservado para componentes nuevos cuya API aún puede cambiar significativamente. Cuando se cocine un componente con esa intención, marcarlo aquí + en el spec doc.

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
