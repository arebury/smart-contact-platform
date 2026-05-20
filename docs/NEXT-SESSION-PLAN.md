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

### 🎯 Pendiente top S53 — Capturas componente por componente

User pidió generar referencia visual por componente para añadir a cada
checklist `packages/design-system/docs/components/NN-*.md`. Idea:
script Playwright que itera las 33 rutas `/components/<name>` del
ds-docs, captura el componente principal (no la página entera) y
guarda en `packages/design-system/docs/components/screenshots/<name>.png`.
Después: añadir `![<name>](./screenshots/<name>.png)` al header de
cada doc.

Trabajo definido: ~1-1.5h. Requiere:
- Convención CSS selector `.gallery__hero` (o data-testid) en cada
  gallery para identificar el componente focal vs la página entera.
- Script `scripts/capture-components.mjs` que arranca ds-docs +
  Playwright + itera.
- Sweep 33 docs.

### 🎯 Pendiente top S53 — /impeccable rework container filtros+toolbar+tabla

User reportó: el container actual hace **gestalt extraña** — visualmente
separa la tabla del resto cuando deberían sentirse UN bloque conectado.

Aplicar /impeccable como dirección de diseño moderna SaaS, respetando
las normas (tokens existentes, wrappers SCDS, sin tokens nuevos). El
target es que filtros + toolbar + tabla se lean como **una sola card
continua**, no 2 elementos separados con aire vertical entre ellos.

Si la propuesta /impeccable no nos convence al revisarla, volvemos a
la anterior. Es exploración.

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

### 🎯 Eje 1 — Memory polish UX (resto del §10)

| # | Item | Tamaño | Trigger |
|---|---|---|---|
| §10 #4 | ~~Modal Download heredado SC~~ | ✅ Cerrado S47 | — |
| §10 #12 | ~~**Synonyms granulares per-value en EntityFormModal**~~ | ✅ Cerrado S48 | — |
| §10 #13 | ~~**CategoryRuleLinking interactivo bidireccional**~~ | ✅ Cerrado S49 | — |

Todo §10 vivo está cerrado o en limbo con trigger explícito (#4 producción real,
#5/#6/#7/#9 dispatch real, #8 refactor SCDS, #11 producción real). Siguiente eje
post-§10 depende de qué priorice Rafa.

### 🎯 Eje sweep — AED bulk-toolbar i18n ✅ CERRADO S51

5/6 migrados S50 + repos S51. Todos los consumers `<sc-bulk-action-bar>`
reactivos al cambio de idioma. Schema `RepoConfig` purgado de
`entityNameSpanish/Plural` (deuda hardcoded ES).

### 🎯 Eje 2 — Code Connect mapping (Figma ↔ SCDS) — DORMIDO con trigger (decisión S48)

**Estado**: pospuesto en S48 tras sparring. **NO atacar sin trigger explícito**.

Razón corta: los devs de producción que aplicarán SCDS NO tienen acceso a este repo.
Publicar Code Connect hoy generaría snippets con referencias rotas (`<sc-inputtext>`,
import `@sc/design-system/...`) en su Dev Mode Figma. Imposición unilateral de naming
+ riesgo de reverso si su naming difiere.

**Trigger reapertura** (los 3 deben ser verdad):
1. Equipo producción ha adoptado SCDS (npm package, copia, lo que sea).
2. Wrappers `<sc-*>` existen en codebase prod con mismo naming (validado, no asumido).
3. Hay al menos 1 dev prod consumiendo el DS desde Figma activamente.

**Setup completo cuando se reabra** (comandos exactos, archivo `*.figma.ts` ejemplo,
checklist, lista wrappers candidatos): ver
[`packages/design-system/docs/code-connect-mapping.md`](../packages/design-system/docs/code-connect-mapping.md)
§ "Estado dormido + setup futuro".

**Aclaración técnica vigente** (de S47, mantener para futuras sesiones):
- **Figma MCP** (operativo en mis tools) = lectura Figma → Claude. `mcp__figma__*` y
  `mcp__claude_ai_Figma__*`.
- **Figma Code Connect** = producto distinto. CLI + lib NPM `@figma/code-connect`. NO
  es plugin Figma. Para Angular usa `parser: "html"` (no `.figma.tsx`, son `.figma.ts`
  con template strings Angular). Soportado oct/2024.
- **NO confrontan**. Complementarios.

### 🎯 Eje 3 — Refactor god-components Memory (defensivo)

| # | Item | Tamaño |
|---|---|---|
| 1 | `conversation-player-modal.component.ts` (446 líneas) — split en sub-components o cleanup signal-idiomatic Angular | ~1.5h |
| 2 | `multi-recording-player.component.ts` — review patrones React 1:1 mal traducidos | ~1h |

NO crítico, ROI técnico medio. Atacar cuando alguien tenga que tocar esos componentes para feature nueva.

### 🎯 Eje 4 — PrimeOne upgrade vigilance (defensivo)

| # | Item | Cuándo |
|---|---|---|
| 1 | Vigilar nuevos minors PrimeNG (estamos 21.1.7) | cada 2-3 sesiones |
| 2 | Dry-run próximo major PrimeNG (22.x cuando salga estable) | trigger upstream release |

### 🎯 Eje 5 — Memory roadmap dormidos (esperan trigger)

Ver [`memory-migration-inventory.md §10`](./memory-migration-inventory.md). Items diferidos con trigger claro (#5/#6/#9 ya cableados S39, #4 cerrado S47, resto esperan backend real o decisión producto).

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
