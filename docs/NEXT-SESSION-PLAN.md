# Next session plan — Smart Contact Platform

> 🧭 Lectura mínima al arrancar: este doc + [`DOCS-INDEX.md`](./DOCS-INDEX.md).
> Historia detallada en [`SESSION-LOG.md`](./SESSION-LOG.md) (no la repetimos aquí).

---

## Estado al cerrar (Session 48, 2026-05-20)

**2 commits a `main`**: (1) feat Memory §10 #12 Synonyms granulares per-value
EntityFormModal, (2) docs S48 (Code Connect dormido + inventory + SESSION-LOG
+ memory). Sesión corta y reflexiva tras la maratón S47.

**Lo grande de S48**: sparring con Rafa pivota Eje 2 (Code Connect mapping) →
**dormido con trigger**. Razón: devs prod no acceden a este repo; publicar
snippets `<sc-inputtext>` generaría referencias rotas en su Dev Mode Figma.
Trigger reapertura y setup futuro completos en
[`code-connect-mapping.md`](../packages/design-system/docs/code-connect-mapping.md).

Tras Code Connect, atacado §10 #12 Memory.

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

### 🎯 Eje 1 — Memory polish UX (resto del §10) 🆕 NEXT SESSION TOP S49

| # | Item | Tamaño | Trigger |
|---|---|---|---|
| §10 #4 | ~~Modal Download heredado SC~~ | ✅ Cerrado S47 | — |
| §10 #12 | ~~**Synonyms granulares per-value en EntityFormModal**~~ | ✅ Cerrado S48 | — |
| §10 #13 | **CategoryRuleLinking interactivo bidireccional** | ~3h (refactor 3-piezas) | Extender `Rule` con `categorias`, selector RuleBuilder, UI interactiva CategoryFormModal |

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
- **#44/#45 off-scale spacing/radius con tokens nuevos** — decisión Marta+Rafa (S47 forzado a tokens existentes).
- **#48 Icon size tokens** — esperando que Marta cree iconset Figma.
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
