# Next session plan — Smart Contact Platform

> 🧭 Lectura mínima al arrancar: este doc + [`DOCS-INDEX.md`](./DOCS-INDEX.md).
> Historia detallada en [`SESSION-LOG.md`](./SESSION-LOG.md) (no la repetimos aquí).

---

## Estado al cerrar (Session 52, 2026-05-21)

**Sesión densa**: 4 commits. CI cadena rojo de 11 commits ARREGLADA (lint
errors no detectados por husky → integrado `npm run lint` en pre-commit
como red estructural). Sweep AED i18n cerrado (último consumer: repos
schema refactor). Sweep nombres del equipo (52 archivos, docs + mocks +
memoria). 4 bugs UI del bulk transcription modal resueltos según legacy
React 1:1.

**Estado salud**: CI `#377` ec332d8 ✅ · Netlify aedmigration+ds-smartcontact
ready · 14/14 Playwright · i18n 1472 paths × 4 locales 0 mismatches.

## Próximas tareas (priorizadas)

### 🎯 TOP S53 (pedidos directos del user)

1. **Capturas componente por componente** — referencia visual para
   añadir a cada checklist `packages/design-system/docs/components/NN-*.md`.
   Script Playwright itera las 33 rutas `/components/<name>` del ds-docs,
   captura el componente principal (no la página entera) y guarda en
   `packages/design-system/docs/components/screenshots/<name>.png`.
   Después sweep de 33 docs md con `![<name>](./screenshots/<name>.png)`
   en el header. ~1.5h. Requiere convención CSS selector `.gallery__hero`
   o `data-testid="component-instance"` en cada gallery.

2. **/impeccable rework container filtros+toolbar+tabla** — user reportó
   gestalt extraña: el container separa visualmente la tabla del resto
   cuando deberían sentirse UN bloque conectado. Aplicar /impeccable
   como dirección de diseño moderno SaaS respetando normas (tokens
   existentes, wrappers SCDS, 0 tokens nuevos). Target: filtros + toolbar
   + tabla como UNA card continua, no 2 elementos con aire vertical
   entre ellos. Reversible si no convence.

### 🎯 Memory §10 dormidos (8 items vivos, esperan trigger)

Detalle completo en [`memory-migration-inventory.md §10`](./memory-migration-inventory.md).

| # | Item | Trigger reapertura |
|---|---|---|
| §10 #3 | `<sc-audio-player>` wrapper SCDS | Consumer EXTERNO Memory **O** Figma spec |
| §10 #4 | Modal Download GDPR (real backend) | Producción real |
| §10 #5 | Sticky toast persistente "Generando…" | Pipeline real (no mock) |
| §10 #6 | Hint "Excluye K en proceso" bulk modal | `processingIds` con dispatch real |
| §10 #7 | Hint multi-tramo bulk modal | Dispatcher por tramo (no conversación) |
| §10 #8 | Eyebrow "ACCIÓN MASIVA" header bulk modal | Refactor SCDS si >1 consumer pide eyebrow |
| §10 #9 | Toast error + chip "Solo fallidas" + filtro permanente | Dispatch backend real |
| §10 #11 | `DataExportImport` config Memory JSON | Migración bulk config Memory |
| §11 A | Filtrado filas en proceso (decisión doc canonical) | Dispatch real |

### 🎯 SCDS inconsistencies backlog (22 items abiertos)

Detalle en [`packages/design-system/docs/inconsistencies-backlog.md`](../packages/design-system/docs/inconsistencies-backlog.md).
Resumen por trigger:

**Esperan el equipo de diseño** (Figma input):
- #14 `sc-search` clear icon X vs default search
- #15 `sc-search` variants formales sm/md/lg en Kit Pro
- #37 multiselect/datepicker/inputtext/inputnumber/select variants sm/md/lg en Kit Pro
- #44 off-scale spacing 6px (24 hits) — decisión: token nuevo vs consolidar
- #45 off-scale border-radius 3px (36 hits) — idem
- #48 Icon size tokens (208 hits literal lucide) — esperar iconset Figma
- #49 box-shadow custom 5 hits divergentes
- #50 transition duration tokens (23+5 hits sin escala)

**Esperan ≥N consumers** (DD-4 promoción al SCDS):
- #2 `inline-rename-cell` — segundo consumer
- #4 `label-chip` — gap documentado
- #6 `<sc-data-table>` — gap nuevo
- #7 `<sc-select-button>` — gap
- #8 `<sc-tag>` — gap
- #32 `.table-card` + `.table` chrome partial SCDS — 5º consumer
- #33 `.page` + `.page__inner` chrome partial SCDS — 9º consumer

**Esperan otro trigger**:
- #27 Netlify config staging cuando equipo crezca
- #28 Repo Memory + monorepo CI (Memory active threshold)
- #31 Modular theme PrimeNG — sin trigger Web Vitals
- #42 AED es.json optimization 1152 keys — P3
- #46 3 hits residuales border-radius post-N audit
- #47 12 strings sin i18n en Memory iter
- #51 i18n duplicates (115 strings) — traductor profesional

### 🎯 Eje 3 — Refactor god-components Memory (defensivo)

Sin trigger funcional. Atacar SOLO cuando alguien tenga que tocar esos
componentes para feature nueva (memoria `feedback_devaluation_existing_work`).

| # | Item | Tamaño |
|---|---|---|
| 1 | `conversation-player-modal.component.ts` (476 líneas) — split sub-components | ~1.5h |
| 2 | `multi-recording-player.component.ts` — review patrones React mal traducidos (S51 ya hizo i18n aria, resto OK) | ~1h |

### 🎯 Eje 4 — PrimeOne upgrade vigilance (defensivo)

| # | Item | Cuándo |
|---|---|---|
| 1 | Vigilar nuevos minors PrimeNG (estamos 21.1.7) | cada 2-3 sesiones |
| 2 | Dry-run próximo major PrimeNG (22.x) | trigger upstream release |

### 🎯 Eje 5 — Code Connect oficial DORMIDO con trigger

Detalle setup en [`packages/design-system/docs/code-connect-mapping.md`](../packages/design-system/docs/code-connect-mapping.md).
**NO atacar** sin 3 condiciones: (1) prod adopta SCDS, (2) wrappers `<sc-*>` existen
en codebase prod con mismo naming, (3) ≥1 dev prod consume DS desde Figma.

## Estado al cerrar S50/S51 (referencia)

S50 (`70e352d`): 6 bloques en cascada — animaciones SC partial, delta-fly,
mockdata 15→33, Download wire, toolbar inline legacy, AED i18n 5/6.

S51 (`0e65b6e` + `bb41f88` + `6d8efc2`): repos schema refactor (último
consumer i18n), multi-rec aria, sweep nombres → "equipo de diseño".

## Estado al cerrar S49 (referencia)

**1 commit a `main`** (8b8f1f4): feat S49 §10 #13 CategoryRuleLinking
bidireccional + fix 5 bugs i18n/UX + red de seguridad i18n (audit + husky).

### Estado al cerrar S47 (referencia)

**31 commits a `main` pusheados** en una sesión maratón. Sweep total de deudas
de diseño + consistencia + features Memory polish. Codebase en estado salud
máximo: 0 anti-patterns, 0 stale refs, 0 unused imports, 14/14 Playwright
cross-app verde, 4 idiomas operativos.

### Bloques completados S47

1. Tracker refresh + audit estructural.
2. Severity explícita 13 `<p-button>`, mock-sample-switcher cleanup, 34 spacings hardcoded → tokens.
3. **7 wrappers SCDS renombrados 1:1 con Kit Pro Figma + PrimeNG**: `inputtext`, `inputnumber`, `inputgroup`, `multiselect`, `toggleswitch`, `dialog`, `checkbox`. Tokens `--sc-modal-*` → `--sc-dialog-*` propagado.
4. **2 directives** alineadas: `scClickOutside` + `scSortable`.
5. 96 hardcoded values → tokens (62 border-radius + 34 spacings).
6. **4 idiomas i18n** (ES + EN + FR + PT) + language switcher en Configuración → Sistema.
7. **Playwright cross-app smoke** + protocolo "por inercia" documentado.
8. **Rediseño flow Duplicar** Agentes/Usuarios/Grupos (sin drafts amarillos en lista).
9. Fila roja sutil para transcripciones fallidas Memory.
10. **localStorage namespace normalization** (`sc-X-Y` kebab) con migration silenciosa segura.
11. **Modal Download GDPR Memory** (§10 #4 cerrado).
12. DD-8 SCDS DECISIONS (naming portable) + customs-catalog §2.1 ampliado (decisión toast textual).

### Estado salud cierre S47

tsc verde · build production verde · Netlify verde · husky+lint-staged activo ·
Playwright cross-app 14/14 verde. Backlog `inconsistencies-backlog.md` con
items #38–#52 todos resueltos o registrados con dependencia humana.

---

## Próximos jugosos (priorizados)

### ⏸️ NO atacar sin trigger explícito

- **Code Connect oficial publish** (Eje 2 arriba) — dormido S48. Trigger = prod adopta SCDS con naming validado + dev prod consume Figma. Detalle setup futuro en `code-connect-mapping.md`.
- **#31 modular theme PrimeNG** — el proyecto NO va a producción real con backend (decisión Rafa S47). Sin trigger Web Vitals real → trabajo en vacío.
- **§10 #3 `<sc-audio-player>` wrapper SCDS** — declinado S46 (DM-7).
- **`<sc-data-table>`, `<sc-select-button>`, `<sc-tag>`, `<sc-toggle-button>`** — gaps documentados sin caso real.
- **#44/#45 off-scale spacing/radius con tokens nuevos** — decisión el equipo (S47 forzado a tokens existentes).
- **#48 Icon size tokens** — esperando que el equipo de diseño cree iconset Figma.
- **#50 Duration tokens** — descartado conscientemente (Figma no exporta variables duration).
- **#51 i18n duplicates (107 restantes)** — esperar traductor profesional para validar contextos.
- **localStorage keys legacy migration** — ya hecha S47 con marker idempotente.

---

## Cómo arrancar S49 (post-S48)

1. Leer este doc + [`DOCS-INDEX.md`](./DOCS-INDEX.md) (5 min).
2. **Si toca Memory** (prioridad TOP post-S48) → leer [`memory-migration-inventory.md`](./memory-migration-inventory.md) §10. Items vivos: #12 Synonyms granulares, #13 CategoryRuleLinking.
3. Si toca SCDS / tokens → leer [`packages/design-system/docs/DECISIONS.md`](../packages/design-system/docs/DECISIONS.md) + [`customs-catalog.md`](../packages/design-system/docs/customs-catalog.md).
4. Si toca AED → leer [`apps/supervisor/docs/DECISIONS.md`](../apps/supervisor/docs/DECISIONS.md).
5. **Code Connect oficial está dormido** — NO atacar sin que se cumpla el trigger documentado arriba + en [`code-connect-mapping.md`](../packages/design-system/docs/code-connect-mapping.md).
6. Historia detallada por sesión: [`SESSION-LOG.md`](./SESSION-LOG.md).

---

## Reglas operativas críticas (1 line each)

1. **Polish requests NUNCA tocan componentes ni tokens** (`.impeccable.md`).
2. **Customizar lo MÍNIMO sobre PrimeNG** (DD-5).
3. **2+ consumers antes de promover componente al SCDS** (DD-4).
4. **Toda primitive nueva → entry en `customs-catalog.md`** (DD-7).
5. **Naming SCDS wrappers nuevos = matching `<p-XYZ>` literal** (DD-8 S47).
6. **Componentes y refactors menores: directo a main**. Cambios estructurales: rama + PR.
7. **Antes de tocar componente UI**: pedir link Figma Kit Pro a Rafa.
8. **PEDIR logs raw antes de adivinar fixes** (Netlify, CI).
9. **Pre-commit hook husky+lint-staged es OBLIGATORIO** en monorepo sin PR.
10. **Verificar versión React prototipo** antes de polish Memory.
11. **Dev server**: `npm run start:supervisor -- --no-hmr` (Angular 21 no enlaza puerto sin `--no-hmr` para Playwright). Playwright usa `domcontentloaded`.
12. **Playwright `npm run e2e` por inercia** tras cambios SCDS/core/i18n/renames/sweeps >20 archivos. Sin que Rafa lo pida. Detalle en [`tests/e2e/README.md`](../tests/e2e/README.md).
13. **localStorage keys** = todas `sc-X-Y` kebab. Si añades una key nueva, sigue ese patrón.

---

## Memorias estructurales relevantes (en `~/.claude/.../memory/`)

`feedback_migration_safety` · `feedback_minimal_customization` · `feedback_track_inconsistencies` · `feedback_figma_link_workflow` · `feedback_figma_link_before_component` · `project_memory_aed_shared_shell` · `feedback_verify_react_version_before_touch` · `feedback_ng0950_transitive_pitfall` · `reference_netlify_auto_deploy_setup` · `feedback_pre_commit_hook_critical` · `feedback_pedir_logs_no_adivinar` · `feedback_iter_closing_summary` · `feedback_critical_sparring_partner` · `feedback_communication_style` · `feedback_playwright_cross_app_inertia` (S47 nueva).
