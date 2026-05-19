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
| 10 | Build / bundle | AED | ~~Bundle inicial 1.60MB excede budget 1.5MB en ~95kB.~~ ✅ S33: causa raíz era falta de `"sideEffects": false` en `packages/design-system/package.json`. Esbuild trataba el barrel `@shared/components` como impreciso para tree-shaking y arrastraba los 24 componentes SCDS al initial chunk (incluyendo datepicker 213 KB + multiselect 147 KB + CDK drag-drop 109 KB que AED no usa eagerly). Fix de 1 línea → bundle 1.61 MB → 1.41 MB (-200 KB, ya bajo budget). | P3 | S33 | ✅ Resuelta | S32 |
| 11 | Refactor SCSS | `apps/supervisor/src/styles/_buttons.scss` | ~~Debería migrar a `packages/design-system/styles/_buttons.scss` siguiendo el patrón de `_sc-toast.scss`.~~ ✅ S34: reformulado y resuelto. La premisa original (mover el .scss a SCDS para que Memory lo consuma) ignoraba que la realidad de AED era 38 usos `.btn` vs 1 `<p-button>` — la doc 01-button declaraba `<p-button>` canonical pero `.btn` era el sistema de facto. Migración completa: 38 botones HTML migrados a `<p-button>` con severities (primary/secondary/danger), `_buttons.scss` eliminado, tokens `--sc-btn-*` removidos de `04-component.css` + `07-dark.css`, override `components.button.root` en sc-preset.ts (paddingX 10.5 / paddingY 7 / borderRadius 6 / gap 7) — Figma 1:1 con Smart Contact PrimeUI Kit Pro. Initial bundle 1.41 MB → 1.40 MB. Cierra el dual-system permanente. | P2 | S34 | ✅ Resuelta | S31 |
| 12 | Doc | SCDS | ~~Auditoría Figma adicional pendiente: `sc-modal` 1:1 contra `❖ Dialog` Figma SC (no fetched en S31).~~ ✅ S33: el item estaba mal categorizado. El kit Figma SC NO porta un `❖ Dialog` genérico — solo tiene `❖ ConfirmDialog` (6738:50207) que reusa el mismo dialog chrome. La auditoría real se hizo en S30 (los comments en `04-component.css` documentan cada token `--sc-modal-*` con su referencia `Figma dialog/*`). El spec doc 11-modal.md ya aclara el matching. Sin gap real. | P3 | S33 | ✅ Resuelta (audit existía S30) | S31 |
| 13 | Doc | `sc-select` | ~~SCSS apunta a Figma nodes `6195:7785` (Filled) y `6195:7816` (Invalid) que NO se auditaron en S31. Verificar si existen y replicar 1:1 si aplica.~~ ✅ S33: ambos nodes existen y se auditaron durante S31. Los valores extraídos (Filled bg slate-50, Invalid border red-400, Invalid placeholder red-600) están alineados en `select.component.scss` líneas 71-105 con comments inline. Sin gap real. | P3 | S33 | ✅ Resuelta (audit existía S31) | S31 |
| 14 | Doc Figma SC | `sc-search` Main Component | Right Icon en variant "With value + clear icon" defaultea a search; cambiar a `X` clear cuando se importe icon al Kit (decisión Marta). | P3 | Marta dependent | ⏸️ Diferida | S31 |
| 15 | Doc Figma SC | `sc-search` | Variants formales del Main Component "search" (Size sm/md/lg × Filled × Disabled) como component set propio — hoy es 1 main component sin variants. | P3 | Marta dependent | ⏸️ Diferida | S31 |
| 16 | Memoria Figma TODO | MIGRATION-INVENTORY | Columna "Figma" con `TODO` en pure-sc. ✅ S32: marcados `n/a` los pattern in-house (la mayoría) + linkado toggle-switch a node 6738:22645 + linkado label-chip a node 6738:55109. Quedan TBD para verificar con Marta si hay equivalentes Figma para photo-upload, illustrated-avatar (probablemente no — son custom asset). | P3 | — | ✅ Resuelta | S32 |
| 16b | Galleries ds-docs restantes | `apps/ds-docs/src/app/pages/*` | ✅ S33: 9 galleries nuevas cubren 14/14 pure-sc visibles. Top-5 interactivas (empty-state, label-chip, color-dot-picker, form-section-nav, form-danger-zone) + sticky-form-header interactiva + 3 documentales para shell-only components (command-palette, keyboard-shortcuts, confirm-host) — patrón Polaris "component-of-context" cuando el shell-coupling impide demo aislada. | P3 | S33 | ✅ Resuelta | S32 |
| 17 | Build error ds-docs | `GalleryFooterComponent` | ~~NG8008: Required input `slug` must be specified.~~ ✅ S34: verificado vía `npm run build:ds-docs` — build verde sin errores. El item era obsoleto (probable que migraciones HTML S33 + S34 cerraron el error indirecto). Cero acción requerida. | P1 | S34 | ✅ Resuelta (build verde) | S32 |
| 18 | Stats hardcoded home ds-docs | `home.component.html` | "Spec docs: 13" hardcoded outdated post S32 + "Live galleries" mostraba `readyComponents().length` (35) en vez de count con pageRoute (12). Fix S32: ambos stats dinámicos (specDocsCount property + galleriesCount computed). | P0 visible | S32 | ✅ Resuelta | S32 (Perplexity audit) |
| 19 | Defensa CVA + signals | `input`, `select`, `multi-select`, `datepicker`, `input-number`, `search` | 6 wrappers escribían signals dentro de `writeValue()` sin `untracked()`. ✅ S32 fase 3: aplicado `untracked()` defensa en los 6 wrappers + comentario explicativo. Aísla la escritura de cualquier reactive context (signal forms futuro, effect en consumer). AOT verde. | P2 | — | ✅ Resuelta | S32 |
| 20 | Figma drift detection | `MIGRATION-INVENTORY.md` | Añadir "Figma verification log" con fecha del último audit por componente. ✅ S32 fase 4: sección añadida con 13 entries iniciales (10 de S30 + 1 de S31 + 2 de S32) + verificación global variables Figma SC. Pattern industria (Atlassian, IBM). Pattern de actualización: cada sesión que toque Figma actualiza la fecha del componente auditado. | P3 | — | ✅ Resuelta | S32 |
| 21 | Status low-usage en spec docs | `MIGRATION-INVENTORY.md` | Patrón GitHub Primer: clasificación stable / low-usage / internal / experimental. ✅ S32 fase 5: añadida sección "Lifecycle / Maturity" en MIGRATION-INVENTORY con 4 buckets clasificando los 33 componentes. Centralizado (vs frontmatter en 33 archivos que driftearían). Pattern: 5+ consumers → promover de low-usage a stable. | P3 | — | ✅ Resuelta | S32 |
| 22 | PrimeNG v22 PT directives | Wrappers Extended | ✅ Verificado S32: 0 ocurrencias de sintaxis vieja `ptXxx=` ni nueva `pXxxPT=` en wrappers. **NO somos vulnerables al rename PT v22**. Documentado como tranquilidad antes de migration. | P3 | — | ✅ Resuelta (no aplica) | S32 (Perplexity audit) |
| 23 | OnPush en wrappers | Todos los componentes SCDS | ✅ Verificado S32 (lectura Bloque B): TODOS los wrappers tienen `changeDetection: ChangeDetectionStrategy.OnPush`. NO hay inconsistencia con PrimeNG (que también usa OnPush internamente). | P3 | — | ✅ Resuelta (no aplica) | S32 (Perplexity audit) |
| 24 | CSS huérfanos post-refactor toggle-switch | `apps/supervisor/src` | ✅ Verificado S32 (Perplexity P2): cero `grep -rn ".toggle-switch input\|.toggle__"` en AED. Refactor toggle-switch (CSS → wrapper p-toggleswitch) NO dejó overrides huérfanos. 21 consumers safe. | P2 | — | ✅ Resuelta (verificado) | S32 (Perplexity audit) |
| 25 | Side-effects en untracked CVA | 6 wrappers CVA | ✅ Verificado S32 (Perplexity P1): los 6 wrappers (input, select, multi-select, datepicker, input-number, search) escriben SOLO `this.value` dentro del bloque untracked. Cero side-effects en otros signals que podrían quedar silenciados. Regla documentada en `migration-safety.md §6`. | P1 | — | ✅ Resuelta (verificado) | S32 (Perplexity audit) |
| 26 | Frontmatter status en spec docs | `docs/components/*.md` | ✅ S33: aplicado a 34 spec docs con `> **Type**: X · **AED uses**: N · **Figma parity**: Y` inline tras el header. Patrón Carbon/Polaris consolidado. Lifecycle section en MIGRATION-INVENTORY sigue siendo source of truth — esto es projection visible al abrir el doc. | P3 | S33 | ✅ Resuelta | S32 (Perplexity audit) |
| 27 | Branch deploys Netlify production-only | Netlify config (proceso) | Hoy: `Deploy only the production branch`. Sin deploy previews por PR → bugs solo visibles tras merge a main. Riesgo aceptable hoy (equipo 1 dev + 1 designer); cuando equipo crezca, activar PR previews. Atlassian / Carbon lo usan como gate obligatorio. | P3 | Cuando equipo crezca | 🆕 Detectada | S32 (Perplexity audit) |
| 28 | Memory CI workflow (post-activation) | Repo Memory + monorepo CI | Cuando Memory entre en desarrollo activo, el script manual `copy-scds-tokens.sh` se convierte en fuente de bugs silenciosos. Migrar a GitHub Action `workflow_dispatch` + `peter-evans/create-pull-request`. El script está ya escrito — solo envolver en workflow YAML. Trigger: > 1 cambio token/semana o > 3 consumers. | P3 | Memory active + threshold | 🆕 Detectada | S32 (Perplexity audit) |
| 29 | Acople ds-docs → AED tipos | SCDS / AED | ✅ S33: `<sc-label-chip>` importaba `LabelColor` de `@features/admin/labels/data/labels-data`; `<sc-group-popover>` importaba `GroupRef` de `@shared/data/groups-ref`. Forzaba `$any()` en ds-docs y rompía la promesa de SCDS self-contained. Movidos los tipos a `label-chip/label-chip.types.ts` + `group-popover/group-popover.types.ts`. AED re-importa via `@shared/components`. Builds AED + ds-docs verde. | P2 | S33 | ✅ Resuelta | S33 |
| 30 | Bug colores inexistentes en S33 galleries | `ds-docs/.../label-chip-gallery`, `color-dot-picker-gallery` | ✅ S33: descubierto al limpiar el acople #29. Las galleries usaban `violet`, `rose`, `cyan` como `LabelColor` cuando los tokens reales son 8 (`gray red orange amber green teal blue purple`). En runtime los chips se renderizaban sin fondo. Corregido — listas reducidas a los 8 valores válidos. Origen: durante S33 escribí galleries sin verificar paleta real. Lección: cuando creo data fixtures para galleries, alinear con `--sc-*` tokens REALES (`grep` antes de listar valores). | P1 visible | S33 | ✅ Resuelta | S33 |
| 32 | Refactor SCSS shared | `.table-card` + `.table` chrome list-pages | Patrón `<div class="table-card"><table class="table">` está duplicado en 4 consumers: AED users-list, agents-list, groups-list (locales en cada SCSS) + Memory `conversation-table` (S40 #16). El chrome es idéntico (wrapper border + radius + overflow-hidden / thead bg-default uppercase tracked / tr border-bottom subtle / td spacing-200 + text-secondary). Cuando aparezca un 5º consumer, extraer a partial `_sc-list-table.scss` en `apps/supervisor/src/styles/` (junto a `_table-elements.scss`) o promover a SCDS si llega a Memory + ds-docs simultáneamente. Hoy 4 consumers ≠ trigger según regla "promover con 2+ y stable" porque AED ya lo declara local 3 veces; el riesgo es que el 5º copy-paste introduzca drift. | P3 | Futura (≥5º consumer) | 🆕 Detectada | S40 |
| 31 | Build / bundle | AED initial chunk | Bundle initial 1.42 MB → 1.65 MB tras introducir `<sc-multi-select>` + `<sc-datepicker>` en Memory iter 3 (S37). **S39 investigación 2 vueltas**: (1ª) hipótesis "common chunk extraction" entre 2 lazy entries Memory descartada — verifiqué `@defer (on idle)` en rule-builder-page, bundle inalterado. (2ª) **Causa raíz real**: las strings `p-multiselect`/`p-datepicker` en el chunk inicial NO son la clase Component — son **theme tokens** registrados por `ScPreset` (`sc-preset.ts` → `providePrimeNG({ theme })` arrastra el theme system completo de PrimeNG con strings de TODOS los componentes, los uses o no). Es nivel PrimeNG, no Angular. **Fix concreto S40+**: investigar **modular theme PrimeNG** — registrar solo los componentes que la app usa en runtime via `providePrimeNG({ theme, ripple, ... })` granular. Existe (PrimeNG docs §"Selective Module Loading") pero requiere mapping manual de los ~25 componentes que SC consume. Coste ~3-4h de mapping + verificación. **Recomendación S40**: hacer cuando Memory rollee real y se midan Web Vitals — si LCP/FID muestran problema, fix; si no, dejar (gzip 376 KB transferred es razonable). | P3 | Futura | ⏸️ Diferida con diagnóstico real S39 | S37 |

---

## Histórico — Resoluciones recientes

### Session 34 (al cierre)

- ✅ Migración `.btn` → `<p-button>` completa (#11). 38 botones AED migrados, 13 archivos TS con ButtonModule import añadido, 5 selectores `> .btn` positional huérfanos borrados, 2 redeclaraciones locales `.btn` eliminadas, `_buttons.scss` borrado, tokens `--sc-btn-*` removidos en `04-component.css` + `07-dark.css`, override `components.button.root` en sc-preset (Figma 1:1 tokens). Initial bundle 1.41 MB → 1.40 MB. agent-form-page.component.scss 13.59 kB → 12.96 kB. Visual verificado via Playwright en 7 pantallas × 2 themes.
- ✅ Bug pre-existente en `search.component.html` arreglado: HTML comment `<!-- eslint-disable -->` dentro del opening tag `<input>` bloqueaba build (Angular template parser).
- ✅ SCDS internals `sticky-form-header` (2 botones) + `bulk-edit-menu` (1 botón) migrados a `<p-button>` — escondidos del grep inicial `apps/supervisor/src` porque viven dentro de `packages/design-system/components/`. Descubiertos via verificación visual Playwright post-migración (botón "Aplicar" unstyled visible).
- ✅ Min-width 144px en `.page-header__actions p-button > .p-button` (main.scss unscoped) — rescata intención del selector dead-code `.page__actions > .btn--primary` que borré, ahora aplicado al selector correcto. Cierra shift visible 134-153px medido al navegar entre list-pages.
- ✅ Refactors Figma 1:1 P1: `sc-confirm-host` → `<p-confirmdialog>` (ConfirmHostService wrappea ConfirmationService de PrimeNG, API Promise pública intacta) + `sc-group-popover` → `<p-popover>` (chrome del panel via `overlay.popover` tokens, hover-or-focus mechanics preservadas en el wrapper). Commit 735047b.
- ✅ MIGRATION-INVENTORY: `sc-input-number` TODO Figma cerrado — el componente hereda chrome 1:1 de `sc-input` (node 6738:46804 auditado S30); extensiones SC (suffix unit + right-align numérico) NO modeladas en Figma kit (decisión explícita).
- ✅ Build error ds-docs #17 verificado verde (build production OK) — item obsoleto desde algún momento entre S33-S34, cerrado.
- 🕐 Audit Figma kit recap (node 829:36548) cross-ref vs MIGRATION-INVENTORY → 3 candidatos P2 evaluados, **0 migrados**, regla pragmática aplicada:
  - `sc-inline-rename-cell` → `<p-inplace>`: **DECLINE**. `<p-inplace>` es toggle display↔edit (click texto → edit form). `sc-inline-rename-cell` es always-edit (parent controla cuándo aparece). Conceptos opuestos. Confirma decline S32 con razón ampliada.
  - `sc-section-card` → `<p-panel>`: **DEFER**. Concepto match (header collapsible + body slot, 24 consumers). Pero `❖ Panel` del Kit Figma SC NO auditado (vive en library externa PrimeOne, no en este file). Migrar sin tokens auditados = riesgo visual silencioso en 24 lugares. Re-evaluar cuando Marta audite Panel en SC.
  - `sc-illustrated-avatar` → `<p-avatar>`: **DECLINE**. `<p-avatar>` es avatar pequeño (32-64px) foto/icon/texto. `sc-illustrated-avatar` es SVG illustration grande custom. Concepto distinto pese a nombre parecido.

**Regla pragmática consolidada S34** (para futuras decisiones de refactor a Figma 1:1):

> Refactorar SCDS a wrapper PrimeNG **solo cuando**:
> 1. El componente Figma cubre **el mismo concepto** (no solo nombre/categoría parecida).
> 2. El refactor **reduce código sin perder funcionalidad** (no fuerza UX changes en consumers para forzar el match).
> 3. Hay **tokens Figma auditados** que el refactor empieza a consumir (no migrar a defaults Aura "a ver qué pasa").
>
> Patterns in-house sin equivalente Figma (empty-state, danger-zone, sticky-form-header, command-palette, page-header) NO se refactorizan — no hay token que sincronizar. Componentes con nombre parecido pero concepto distinto (inline-rename-cell vs Inplace, illustrated-avatar vs Avatar) NO se refactorizan — fuerzan UX changes sin paridad real.

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
