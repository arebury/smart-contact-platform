# Inconsistencies Backlog — Smart Contact Design System

> **Propósito**: punto único de tracking de **deuda, gaps y inconsistencias** detectadas en auditorías del DS. Toda finding sin acción inmediata se registra aquí con severidad + fase asignada — no sorpresas, todo planificado.
>
> **NO incluye** divergencias intencionales (→ `customs-catalog.md`) ni status de componentes (→ `MIGRATION-INVENTORY.md`). Esto es deuda/gaps específicamente.

## Status & Severidad

- **Status**: 🆕 Detectada · 🚧 En curso · ✅ Resuelta · ⏸️ Diferida (con razón)
- **Severidad**: P0 (a11y crítico / breaking) · P1 (deuda clara) · P2 (mejora calidad) · P3 (cosmético / nice-to-have)

---

## Backlog activo (al cierre Session 32)

| # | Categoría | Componente / área | Descripción | Severidad | Fase | Status | Detectada |
|---|---|---|---|---|---|---|---|
| 1 | Refactor pure-sc | `bulk-edit-menu` | Usa `<select>` HTML nativos × 2. Debería usar `<sc-select>` para consistencia con resto del DS. | P1 | S32 | ✅ Resuelta | S32 |
| 2 | Refactor pure-sc | `inline-rename-cell` | ~~Debería usar `<sc-input>`~~. Revaluado S32: declinado. `<sc-input>` renderiza chrome de field (border + padding 10.5/7) que rompería la metáfora "flat cell"; el rename-cell necesita input transparent borderless para no shift visual. Justificado mantener `<input>` nativo. | P1 | — | ⏸️ Diferida (rechazado) | S32 |
| 3 | Refactor pure-sc | `toggle-switch` | CSS puro sobre `<input type="checkbox">`. Debería envolver `<p-toggleswitch>` (Figma SC node 6738:22645). | P2 | S32 | ✅ Resuelta | S32 |
| 4 | Refactor pure-sc | `label-chip` | ~~Wrappear `<p-tag>` o `<p-chip>`~~. Revaluado S32: declinado. Ningún componente PrimeNG cubre el modelo `LabelColor` (4 tokens custom per-color × N colores user-defined). `<p-tag>` es severity-style; `<p-chip>` espera icon class fijo. Forzar wrapper requeriría MÁS custom CSS (styleClass overrides) que mantener el actual. Decline justificado. | P2 | — | ⏸️ Diferida (rechazado) | S32 |
| 5 | Gap componente | SCDS | ~~Falta `<sc-input-group>` (Figma SC node 6738:22644). Wrapper de `<p-inputgroup>` para addon left/right. Bloquea migración tag-input en aed-servicio.~~ ✅ S33: wrapper cocinado (`packages/design-system/components/input-group/`). Tokens via `formField.*` sin overrides propios. Gallery ds-docs `/components/input-group` con 5 escenarios. Spec doc `34-input-group.md`. tag-input aed-servicio migrado. | P2 | S33 | ✅ Resuelta | S31 |
| 6 | Gap componente | SCDS | Falta `<sc-select-button>` (Figma SC node 6738:46433). Wrapper de `<p-selectbutton>` para chips toggle segmented. Sin caso real aún. | P3 | Futura | 🆕 Detectada | S31 |
| 7 | Gap componente | SCDS | Falta `<sc-tag>` (Figma SC node 6738:55116). Wrapper de `<p-tag>` para severity-fill labels. NO confundir con `<sc-label-chip>` (color custom per-entity). | P3 | Futura | 🆕 Detectada | S31 |
| 8 | Gap componente | SCDS | Falta `<sc-toggle-button>` (Figma SC node 6738:46435). Wrapper de `<p-togglebutton>` (button con estado pressed/unpressed). Sin caso real aún. | P3 | Futura | 🆕 Detectada | S32 |
| 9 | Deuda CSS | `sticky-form-header` | ~~8 `::ng-deep` redimensionando `<sc-photo-upload>` proyectado en slot~~. S32 verificación: la deuda histórica YA fue resuelta en sesión previa (el SCSS actual NO contiene `::ng-deep`; el consumer pasa `[size]="sm"` directamente). Specs docs 22 + 29 actualizados eliminando menciones obsoletas. | P2 | — | ✅ Resuelta (en sesión previa, doc outdated) | S32 |
| 10 | Build / bundle | AED | Bundle inicial 1.60MB excede budget 1.5MB en ~95kB. Pre-existente (no introducido por SCDS). Decidir si aumentar budget o introducir code-splitting agresivo. | P3 | Futura | 🆕 Detectada | S32 |
| 11 | Refactor SCSS | `apps/aed/src/styles/_buttons.scss` | Debería migrar a `packages/design-system/styles/_buttons.scss` siguiendo el patrón de `_sc-toast.scss`. **Condición de trigger**: aparece segundo consumer (ds-docs hoy no usa `.btn`). | P3 | Cuando llegue 2nd consumer | ⏸️ Diferida | S31 |
| 12 | Doc | SCDS | Auditoría Figma adicional pendiente: `sc-modal` 1:1 contra `❖ Dialog` Figma SC (no fetched en S31). | P3 | Próxima sesión Figma | ⏸️ Diferida | S31 |
| 13 | Doc | `sc-select` | SCSS apunta a Figma nodes `6195:7785` (Filled) y `6195:7816` (Invalid) que NO se auditaron en S31. Verificar si existen y replicar 1:1 si aplica. | P3 | Próxima sesión Figma | ⏸️ Diferida | S31 |
| 14 | Doc Figma SC | `sc-search` Main Component | Right Icon en variant "With value + clear icon" defaultea a search; cambiar a `X` clear cuando se importe icon al Kit (decisión Marta). | P3 | Marta dependent | ⏸️ Diferida | S31 |
| 15 | Doc Figma SC | `sc-search` | Variants formales del Main Component "search" (Size sm/md/lg × Filled × Disabled) como component set propio — hoy es 1 main component sin variants. | P3 | Marta dependent | ⏸️ Diferida | S31 |
| 16 | Memoria Figma TODO | MIGRATION-INVENTORY | Columna "Figma" con `TODO` en pure-sc. ✅ S32: marcados `n/a` los pattern in-house (la mayoría) + linkado toggle-switch a node 6738:22645 + linkado label-chip a node 6738:55109. Quedan TBD para verificar con Marta si hay equivalentes Figma para photo-upload, illustrated-avatar (probablemente no — son custom asset). | P3 | — | ✅ Resuelta | S32 |
| 17 | Build error ds-docs | `GalleryFooterComponent` | NG8008: Required input `slug` must be specified. Pre-existente en main (verificado con stash). Bloquea build production de ds-docs. | P1 | Próxima sesión | 🆕 Detectada | S32 |
| 18 | Stats hardcoded home ds-docs | `home.component.html` | "Spec docs: 13" hardcoded outdated post S32 + "Live galleries" mostraba `readyComponents().length` (35) en vez de count con pageRoute (12). Fix S32: ambos stats dinámicos (specDocsCount property + galleriesCount computed). | P0 visible | S32 | ✅ Resuelta | S32 (Perplexity audit) |
| 19 | Defensa CVA + signals | `input`, `select`, `multi-select`, `datepicker`, `input-number`, `search` | 6 wrappers escribían signals dentro de `writeValue()` sin `untracked()`. ✅ S32 fase 3: aplicado `untracked()` defensa en los 6 wrappers + comentario explicativo. Aísla la escritura de cualquier reactive context (signal forms futuro, effect en consumer). AOT verde. | P2 | — | ✅ Resuelta | S32 |
| 20 | Figma drift detection | `MIGRATION-INVENTORY.md` | Añadir "Figma verification log" con fecha del último audit por componente. ✅ S32 fase 4: sección añadida con 13 entries iniciales (10 de S30 + 1 de S31 + 2 de S32) + verificación global variables Figma SC. Pattern industria (Atlassian, IBM). Pattern de actualización: cada sesión que toque Figma actualiza la fecha del componente auditado. | P3 | — | ✅ Resuelta | S32 |
| 21 | Status low-usage en spec docs | `MIGRATION-INVENTORY.md` | Patrón GitHub Primer: clasificación stable / low-usage / internal / experimental. ✅ S32 fase 5: añadida sección "Lifecycle / Maturity" en MIGRATION-INVENTORY con 4 buckets clasificando los 33 componentes. Centralizado (vs frontmatter en 33 archivos que driftearían). Pattern: 5+ consumers → promover de low-usage a stable. | P3 | — | ✅ Resuelta | S32 |
| 22 | PrimeNG v22 PT directives | Wrappers Extended | ✅ Verificado S32: 0 ocurrencias de sintaxis vieja `ptXxx=` ni nueva `pXxxPT=` en wrappers. **NO somos vulnerables al rename PT v22**. Documentado como tranquilidad antes de migration. | P3 | — | ✅ Resuelta (no aplica) | S32 (Perplexity audit) |
| 23 | OnPush en wrappers | Todos los componentes SCDS | ✅ Verificado S32 (lectura Bloque B): TODOS los wrappers tienen `changeDetection: ChangeDetectionStrategy.OnPush`. NO hay inconsistencia con PrimeNG (que también usa OnPush internamente). | P3 | — | ✅ Resuelta (no aplica) | S32 (Perplexity audit) |
| 24 | CSS huérfanos post-refactor toggle-switch | `apps/aed/src` | ✅ Verificado S32 (Perplexity P2): cero `grep -rn ".toggle-switch input\|.toggle__"` en AED. Refactor toggle-switch (CSS → wrapper p-toggleswitch) NO dejó overrides huérfanos. 21 consumers safe. | P2 | — | ✅ Resuelta (verificado) | S32 (Perplexity audit) |
| 25 | Side-effects en untracked CVA | 6 wrappers CVA | ✅ Verificado S32 (Perplexity P1): los 6 wrappers (input, select, multi-select, datepicker, input-number, search) escriben SOLO `this.value` dentro del bloque untracked. Cero side-effects en otros signals que podrían quedar silenciados. Regla documentada en `migration-safety.md §6`. | P1 | — | ✅ Resuelta (verificado) | S32 (Perplexity audit) |
| 26 | Frontmatter status en spec docs | `docs/components/*.md` | ✅ S33: aplicado a 34 spec docs con `> **Type**: X · **AED uses**: N · **Figma parity**: Y` inline tras el header. Patrón Carbon/Polaris consolidado. Lifecycle section en MIGRATION-INVENTORY sigue siendo source of truth — esto es projection visible al abrir el doc. | P3 | S33 | ✅ Resuelta | S32 (Perplexity audit) |
| 27 | Branch deploys Netlify production-only | Netlify config (proceso) | Hoy: `Deploy only the production branch`. Sin deploy previews por PR → bugs solo visibles tras merge a main. Riesgo aceptable hoy (equipo 1 dev + 1 designer); cuando equipo crezca, activar PR previews. Atlassian / Carbon lo usan como gate obligatorio. | P3 | Cuando equipo crezca | 🆕 Detectada | S32 (Perplexity audit) |
| 28 | Memory CI workflow (post-activation) | Repo Memory + monorepo CI | Cuando Memory entre en desarrollo activo, el script manual `copy-scds-tokens.sh` se convierte en fuente de bugs silenciosos. Migrar a GitHub Action `workflow_dispatch` + `peter-evans/create-pull-request`. El script está ya escrito — solo envolver en workflow YAML. Trigger: > 1 cambio token/semana o > 3 consumers. | P3 | Memory active + threshold | 🆕 Detectada | S32 (Perplexity audit) |

---

## Histórico — Resoluciones recientes

### Session 32 (al cierre)

- ✅ Fase 1 migraciones AED cerrada (5 forms residuales).
- ✅ Auditoría nivel-2 pure-sc: 0 P0/P1 reales tras sanity check (memoria `feedback_no_devaluation_existing_work`).
- ✅ 16 nuevos spec docs para pure-sc top-usage (docs 15-30).
- ✅ Backlog persistente creado (este doc).
- 🚧 4 refactors consistencia pure-sc (#1-#4) iniciados.

### Session 31

- ✅ 25 inputs/selects nativos AED migrados a SCDS.
- ✅ Componente `<sc-search>` cocinado.
- ✅ 3 bugs CSS silenciosos (sc-select/multi-select/datepicker) arreglados.
- ✅ Customs-catalog formalizado con checklist anti-divergencia.
- ✅ Auditoría Figma `❖ Search` + composición canvas SC.

### Session 30

- ✅ Auditoría 7 capas `--sc-*` validadas 1:1 contra PrimeOne 4.0.
- ✅ Bootstrap `sc-preset.ts` con bridge completo.
- ✅ 13 divergencias iniciales en `customs-catalog.md`.

---

## Limpieza

Items con status `✅ Resuelta` se mueven al histórico (sección anterior). Pasada una sesión post-resolución, se eliminan del histórico para evitar growth lineal — los detalles viven en SESSION-LOG.md y commits.

Items `⏸️ Diferida` se revisan al inicio de cada sesión: si la razón sigue válida, se mantiene; si no, se mueve a 🆕 / 🚧 con fase nueva.

---

## Convenciones

- **Severidad** se asigna pensando en mantenimiento sostenible para devs futuros, no urgencia comercial.
- **Fase** puede ser `S{NN}` (sesión concreta), `Próxima sesión`, `Futura` (sin compromiso), `Post audit tokens`, `Marta dependent` (espera input externo).
- **Categoría** estándar: `Refactor pure-sc`, `Gap componente`, `Deuda CSS`, `Doc`, `Doc Figma SC`, `Build / bundle`, `Refactor SCSS`, `Memoria Figma TODO`. Si aparece nueva, añadir aquí.
