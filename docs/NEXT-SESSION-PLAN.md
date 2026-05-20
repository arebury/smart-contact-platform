# Next session plan — Smart Contact Platform

> 🧭 Lectura mínima al arrancar: este doc + [`DOCS-INDEX.md`](./DOCS-INDEX.md).
> Historia detallada en [`SESSION-LOG.md`](./SESSION-LOG.md) (no la repetimos aquí).

---

## Estado al cerrar (Session 47, 2026-05-20)

**17 commits a `main` pusheados** distribuidos en bloques A-P. Sweep maratón de
deudas de diseño + consistencia + naming Figma DS literal (7 wrappers SCDS renombrados)
+ border-radius tokens + directives prefix.

1. **Tracker refresh post-S46** — 11 entries `home.component.ts` actualizadas (drift cross-monorepo).
2. **Bloque A — Severity `<p-button>` explícita** en 13 botones list-pages + config aed (cierra inconsistencia post-S34, 38 explícitos vs 13 implícitos).
3. **Bloque B — mock-sample-switcher cleanup** — `::ng-deep` + 2 `!important` movidos a `main.scss` global (patrón S46).
4. **Bloque C — 34 spacing tokens** — `padding/margin/gap` hardcoded en escala (4/8/10/12/14/16/20/24/32/40 px) migrados a `var(--sc-spacing-*)`.
5. **Bloques D-F — Renames Figma DS literal 7 wrappers**: `inputtext`, `inputnumber`, `inputgroup`, `multiselect`, `toggleswitch`, `dialog`, `checkbox`. Matching Kit Pro Figma SC (`❖ ...`) y PrimeNG (`<p-...>`). Facilita Code Connect mapping futuro.
6. **Bloque G — Verificación drift** — tracker drift = 0 post-rename, build production verde ambas apps.
7. **Bloque H — Memorias `~/.claude` actualizadas** con nuevo naming SCDS.
8. **Bloque I-J — Audits defensivos**: i18n keys huérfanas (alto-ruido sin AST walker → registrado #42), NG0950 transitivo (0 candidatos), OnPush coverage 100%.
9. **Bloques K-L-M — Docs source-of-truth**: backlog `#38-#43` añadidos, tokens `--sc-modal-*` → `--sc-dialog-*` en layers, 25 archivos con stale comments actualizados, DD-8 SCDS DECISIONS, SESSION-LOG S47 entry.
10. **Bloque N — Border-radius tokens** — 62 sustituciones hardcoded → `--sc-radius-*` en 29 archivos.
11. **Bloque O — Directives `aed*` → `sc*`** — `scClickOutside` + `scSortable` (consistencia post-DD-8).
12. **Bloque P — Backlog #44-#48** — registradas deudas no atacadas (off-scale 6px/3px, hardcoded text Memory, icon sizes, edge cases). Todas P3, requieren trigger externo o decisión Marta.

Estado salud cierre S47: tsc verde, build production verde, Netlify verde, husky+lint-staged activo. 0 anti-patterns Angular. 0 stale refs post-renames. 0 aria-label missing icon-only buttons. 7 wrappers SCDS + 2 directives alineados 1:1 con Kit Pro Figma + PrimeNG / brand consistency → camino libre para Code Connect mapping (Eje 3).

---

## Próximos jugosos (priorizados)

Cuando arranque la próxima sesión, ataque sugerido por orden de valor:

### 🎯 Eje 1 — Memory polish UX (sin Marta, acotado)

| # | Item | Tamaño | Trigger |
|---|---|---|---|
| §10 #4 | Modal Download heredado SC (checkboxes Grabaciones/Chats + aviso GDPR) | ~1h | producción real backend |
| §10 #12 | Synonyms granulares per-value en EntityFormModal | ~2h | Marta/Rafa priorizan |
| §10 #13 | CategoryRuleLinking interactivo bidireccional | ~3h (refactor 3 piezas) | Rafa explícito (S39 lo aparcó) |

### 🎯 Eje 1b — Refresh tracker ds-docs `home.component.ts` (~30 min)

Los counts `aedUses` / `memoryUses` se mantienen manualmente. Posible drift acumulado desde S39 — S46 añadió usos Memory de `<sc-multiselect>`, `<sc-datepicker>`, `<sc-inputtext>`, `<sc-dialog>` que probablemente no están reflejados. Audit con `grep` automatizado por componente, comparar contra valores en `home.component.ts` y commit batch.

### 🎯 Eje 2 — Audit periódico (defensivo, ~30-60 min)

Próximo audit recomendado tras 5-6 commits feature work (hoy llevamos 13 desde último). Ejes:
- Anti-patrones Angular (NG0950 transitivo) — patrón conocido.
- Dead code (i18n keys huérfanas).
- Tokens hardcoded — ya limpio cross-monorepo S46.
- A11y básico.
- Bundle (diagnóstico real S39, NO atacar #31 sin trigger métrico).
- i18n consistency.

### 🎯 Eje 3 — Figma ↔ código (input externo Rafa+Marta)

| # | Item | Quién | Cuándo |
|---|---|---|---|
| 1 | Importar `--sc-font-family-mono` a Variables collection Figma SC | Marta vía plugin Variables Importer | cuando toque resync |
| 2 | Bootstrap Variables Custom collection (6 divergencias documentadas) | Rafa + Marta + Claude audita MCP | cuando os pongáis |
| 3 | Code Connect mapping Kit Pro ↔ SCDS (config inicial existe S41) | Claude config + Rafa valida | cuando Rafa dé luz verde |
| 4 | Audit `❖ Panel` SC → desbloquea section-card refactor | Rafa o Marta + Claude MCP | cuando os pongáis |

### 🎯 Eje 4 — PrimeOne upgrade vigilance (defensivo)

| # | Item | Cuándo |
|---|---|---|
| 1 | Vigilar nuevos minors PrimeNG (estamos 21.1.7, último 21.1.8 patch trivial verificado S39) | cada 2-3 sesiones |
| 2 | Dry-run próximo major PrimeNG (22.x cuando salga estable) | trigger upstream release |

### 🎯 Eje 5 — Memory roadmap dormidos (esperan trigger)

Ver [`memory-migration-inventory.md §10`](./memory-migration-inventory.md). Items diferidos con trigger claro (#5/#6/#9 ya cableados S39, resto esperan backend real o decisión producto).

### 🎯 Eje 6 — Case-study notes progresivo

Anotar momentos pedagógicos a medida que surjan en [`case-study-notes.md`](./case-study-notes.md). NO sweep retroactivo.

### ⏸️ NO atacar sin trigger explícito

- **#31 modular theme PrimeNG** (~3-4h): solo si Memory rollee real y Web Vitals muestren problema. Sin trigger métrico → work en vacío.
- **§10 #3 `<sc-audio-player>` wrapper SCDS**: declinado S46 (DM-7). Re-abrir si consumer EXTERNO a Memory o Figma spec de Marta.
- **`<sc-data-table>`, `<sc-select-button>`, `<sc-tag>`, `<sc-toggle-button>`**: gaps documentados sin caso real hoy.
- Refactors estructurales (`reference_structural_refactor_plan` — plan dormido por diseño).
- Nuevos componentes pure-sc "por si acaso" (memoria `minimal-customization`).

---

## Cómo arrancar

1. Leer este doc + [`DOCS-INDEX.md`](./DOCS-INDEX.md) (5 min).
2. Si vas a tocar Memory → leer [`memory-migration-inventory.md`](./memory-migration-inventory.md) §10.
3. Si vas a tocar SCDS / tokens → leer [`packages/design-system/docs/DECISIONS.md`](../packages/design-system/docs/DECISIONS.md) + [`customs-catalog.md`](../packages/design-system/docs/customs-catalog.md).
4. Si vas a tocar AED → leer [`apps/supervisor/docs/DECISIONS.md`](../apps/supervisor/docs/DECISIONS.md).
5. Para historia detallada por sesión: [`SESSION-LOG.md`](./SESSION-LOG.md).

---

## Reglas operativas críticas (1 line each)

1. **Polish requests NUNCA tocan componentes ni tokens** (`.impeccable.md`).
2. **Customizar lo MÍNIMO sobre PrimeNG** (DD-5).
3. **2+ consumers antes de promover componente al SCDS** (DD-4).
4. **Toda primitive nueva → entry en `customs-catalog.md`** (DD-7).
5. **Tokens drift → 0 fallbacks innecesarios** (sweep S46 cerrado).
6. **Componentes y refactors menores: directo a main**. Cambios estructurales: rama + PR.
7. **Antes de tocar componente UI**: pedir link Figma Kit Pro a Rafa.
8. **PEDIR logs raw antes de adivinar fixes** (Netlify, CI).
9. **Pre-commit hook husky+lint-staged es OBLIGATORIO** en monorepo sin PR.
10. **Verificar versión React prototipo** antes de polish Memory (`verify-react-version-before-touch`).
11. **Dev server**: `npm run start:supervisor -- --no-hmr` (Angular 21 no enlaza puerto sin `--no-hmr` para Playwright). Playwright usa `domcontentloaded`, no `networkidle`.

---

## Memorias estructurales relevantes (en `~/.claude/.../memory/`)

`feedback_migration_safety` · `feedback_minimal_customization` · `feedback_track_inconsistencies` · `feedback_figma_link_workflow` · `feedback_figma_link_before_component` · `project_memory_aed_shared_shell` · `feedback_verify_react_version_before_touch` · `feedback_ng0950_transitive_pitfall` · `reference_netlify_auto_deploy_setup` · `feedback_pre_commit_hook_critical` · `feedback_pedir_logs_no_adivinar` · `feedback_iter_closing_summary` · `feedback_critical_sparring_partner` · `feedback_communication_style`.
