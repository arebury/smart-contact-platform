# NEXT SESSION PLAN — Smart Contact Platform Foundation

> **Para Claude en la próxima sesión**: lee este archivo y ejecuta Fase 1 sin
> necesidad de re-explicación. Todo el contexto necesario está aquí o en los
> links a docs/ existentes. Estimación: 1 sesión completa.
>
> **Para Rafa**: cuando abras Claude la próxima vez, di literalmente: "lee
> `docs/NEXT-SESSION-PLAN.md` y ejecuta Fase 1". Claude tomará desde aquí.

---

## Contexto rápido (lee esto primero, Claude)

**Quién**: Rafa (no dev) + Marta (no dev) construyendo Smart Contact (SC) — una
plataforma con varios flujos. Devs son el equipo de Rafa, hacen su trabajo;
nosotros les damos un design system pre-cocinado para que no pregunten.

**Qué existe hoy**:
- Repo `arebury/aed` (GitHub) → `aedmigration.netlify.app` (Netlify).
- Angular 21 + PrimeNG + sistema `--sc-*` tokens en 7 capas + 23 componentes
  custom AED (`<aed-modal>`, etc.) + bridge `aed-preset.ts` a PrimeNG.
- 6 PRs mergeados de audit + cleanup. Estado del DS: sano, documentado.
- Page `/dev/buttons` con gallery de las 8 severidades × 11 secciones,
  consumiendo `<p-button>` con AED brand vía preset.
- Repo separado Memory 3.0 (React 18 + Radix + Tailwind + Vite). Distinto stack,
  no se migra ahora.

**Qué se decidió hoy** (esta sesión, antes de que se acaben tokens):
1. **Plataforma = Smart Contact (SC).** AED es UNA app dentro. Memory es otra.
2. **El DS se llama Smart Contact Design System (SCDS).** Vive en `packages/design-system/`.
3. **Monorepo** con apps + packages. Renombrar repo de `aed` a `smart-contact-platform`.
4. **Componentes prefijo `aed-` → `sc-`** (349 refs). Excepción: carpeta
   `features/config/aed/` se queda (es nombre de feature, no de marca).
5. **DS docs son un Angular app aparte** (`apps/ds-docs/`) deploy en Netlify
   propio. Tipo Wise. Crece componente a componente.
6. **Componente target inmediato post-foundation**: Input (text/email/password).
7. **Custom Variables collection en Figma** (Smart Contact Prime) está VACÍA.
   No hacer bootstrap todavía — primero descubrir customs componente a componente.
   Luego JSON bidireccional Figma ↔ código vía plugin Variables Importer.
8. **Workflow post-foundation**: componentes directos a main, sin PR ceremony.
   Ramas SOLO para cambios estructurales gordos.

---

## Fase 1 — Foundation (esta es tu chuleta, Claude)

Una sesión de trabajo. Una sola rama `chore/sc-monorepo`. Una sola PR.

### 1.1 Renombrar repo en GitHub
**Tú no haces esto** — Rafa lo hace en GitHub Settings → Rename. URLs auto-redirect. Netlify auto-sigue.

Pregunta a Rafa al inicio: "¿ya renombraste el repo a `smart-contact-platform`?". Si no, espera. Si sí, continúa.

### 1.2 Estructura nueva del repo

Mover:
```
DE:                                  A:
src/app/core/                        apps/aed/src/app/core/
src/app/features/                    apps/aed/src/app/features/
src/app/shared/components/           packages/design-system/components/
src/app/core/tokens/                 packages/design-system/tokens/
src/app/dev/                         apps/ds-docs/src/app/
                                       (extraer dev/ a una app independiente)
src/styles/                          apps/aed/src/styles/   (excepto tokens)
src/assets/                          apps/aed/src/assets/
src/index.html                       apps/aed/src/
src/main.ts                          apps/aed/src/
angular.json                         apps/aed/angular.json   (sólo AED config)
package.json (root)                  PARTIR: dependencies AED a apps/aed/package.json
                                              workspace config en root nuevo
tsconfig*.json                       PARTIR: apps/aed/tsconfig.app.json,
                                              packages/design-system/tsconfig.json
.eslintrc.json                       apps/aed/.eslintrc.json   (config compartida en root)
.prettierrc, .prettierignore         root (compartido)
.gitignore                           root
netlify.toml                         root con multi-site config

docs/ (en root)                      DIVIDIR:
  CLAUDE.md (current)                  → packages/design-system/docs/CLAUDE.md
  DECISIONS.md                         → SPLIT:
                                          DDs sobre DS (52, 63)  → packages/design-system/docs/DECISIONS.md
                                          DDs sobre AED (54-57, 61-62) → apps/aed/docs/DECISIONS.md
  DECISIONES.md                        → idem split (PM version)
  SESSION-LOG.md                       → SPLIT por proyecto
  memory.md                            → /CLAUDE.md (raíz monorepo)
  roadmap.md                           → apps/aed/docs/ROADMAP.md
  impeccable.md                        → packages/design-system/docs/impeccable.md
  audit/ (5 docs)                      → packages/design-system/docs/audit/
  refactor-structure/                  → archive (audit cerrado NO-GO, no relevante)
  components/ (futuro)                 → packages/design-system/docs/components/
```

### 1.3 Workspace setup

**Tooling**: pnpm workspaces. Razón: ya está en Memory 3.0; lo extendemos al monorepo.

`package.json` raíz nuevo:
```json
{
  "name": "smart-contact-platform",
  "private": true,
  "scripts": {
    "dev:aed": "pnpm --filter @sc/aed dev",
    "dev:ds-docs": "pnpm --filter @sc/ds-docs dev",
    "build:all": "pnpm -r build",
    "lint:all": "pnpm -r lint",
    "format:check": "prettier --check ."
  }
}
```

`pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Cada `apps/<x>/package.json` con name `@sc/<x>` y sus deps específicas.

`packages/design-system/package.json` con name `@sc/design-system` y `peerDependencies` Angular/PrimeNG (no las redepende — las consume del app que lo usa).

### 1.4 Renombrar `aed-*` → `sc-*` (349 refs)

Una vez moved a apps/aed/, mismo trabajo del sequencing original:

- Selectores: `aed-modal` → `sc-modal`, `aed-section-card` → `sc-section-card`, etc. (ver lista en SESSION-LOG previo).
- Clases TS: `AedModalComponent` → `ScModalComponent`.
- CSS class `.aed-dark` → `.sc-dark` + cambio en `app.config.ts` darkModeSelector.
- Archivo `aed-preset.ts` → `sc-preset.ts`. Clase `AedPreset` → `ScPreset`.
- CSS vars `--aed-*` → `--sc-*` (3 detectados, todos en agent-form-page).
- NO renombrar `features/config/aed/` (carpeta feature, no marca).

Comando sugerido para auditar: `grep -rE "aed-" apps/aed/src --include='*.ts' --include='*.html' --include='*.scss'` post-rename → debería volver 0 (excluir comments si quedan).

### 1.5 Memoria persistente por proyecto

Crear estos archivos con CONTENIDO MÍNIMO ESTÁNDAR (~5-10 KB cada uno):

```
/CLAUDE.md                                    ← raíz monorepo
apps/aed/CLAUDE.md                            ← AED-specific
apps/ds-docs/CLAUDE.md                        ← ds-docs-specific
packages/design-system/CLAUDE.md              ← DS-specific
```

Plantilla de cada `CLAUDE.md`:
```markdown
# <Project> — CLAUDE memory

## ¿Qué es esto?
[2-3 frases máx.]

## No-goals
[Lista corta]

## Convenciones
[Punteado, breve]

## Estado actual
[Update cada session-end]

## Para más detalle
- docs/DECISIONS.md
- docs/SESSION-LOG.md
- docs/MIGRATION-INVENTORY.md (solo en design-system)
```

### 1.6 MIGRATION-INVENTORY.md

Auto-generar escaneando `apps/aed/src/app/shared/components/` + `apps/aed/src/app/core/` + grep `<p-*>` y `<aed-*>` en templates:

```markdown
# Migration Inventory — Smart Contact Design System

> Status legend: ✓ done · 🚧 in progress · ⏳ pending · ❓ unclassified

## Components (ordered by appearance frequency in apps/aed)

| # | Name | Status | Type | Figma | Doc | Notes |
|---|------|--------|------|-------|-----|-------|
| 01 | Button | ✓ | PrimeNG + bridge | TODO | docs/components/00-button.md | sky→electric-blue, orange→amber overrides |
| 02 | Modal | 🚧 | Wrapper (sc-modal envuelve p-dialog) | TODO | TODO | rename aed→sc pendiente |
| 03 | Toast | ✓ | Wrapper (sc-toast envuelve p-toast) | TODO | TODO | chrome reset via ::ng-deep |
| 04 | Photo Upload | ✓ | Custom (sc-photo-upload) | TODO | TODO | size API [size]='md'|'sm' |
| 05 | Input (text/email/etc.) | ⏳ | PrimeNG (target: <p-inputText>) | TODO | - | NEXT PRIORITY |
| 06 | Dropdown | ⏳ | PrimeNG (target: <p-select>) | - | - | |
| ... | ... | ... | ... | ... | ... | ... |
```

Lista completa salir del scan. Generar el doc completo es parte del trabajo Fase 1.

### 1.7 apps/ds-docs scaffolding

App Angular nueva, standalone-first:
- Portada `/` con grid de cards (link a cada componente).
- Routes lazy: `/foundations`, `/components/button`, `/components/input`, `/audit`.
- `/audit` con páginas:
  - `/audit/tokens` (visual: cada token con su color/valor/uso).
  - `/audit/coverage` (bridge coverage report).
  - `/audit/divergence` (--sc-* vs Aura).
- Consume `@sc/design-system` para tokens + components.
- Tema visual: card-based, hero por sección, light/dark toggle global, code snippet copy buttons.
- DEPLOY: Netlify config crea segundo site con `Base directory: apps/ds-docs/`.

**Para esta primera iteración basta scaffolding mínimo**:
- Portada con UNA card linkeando a `/components/button`.
- `/components/button` = el current `/dev/buttons` mejorado con code snippets.
- Resto de slots vacíos esperando llenarse.

### 1.8 Netlify configuración multi-site

`netlify.toml` en root del monorepo:
```toml
# Sites se configuran en Netlify UI, no aquí. Pero el toml puede
# definir builds compartidos si hay scripts comunes.
```

En Netlify UI, **2 sites desde el mismo repo `arebury/smart-contact-platform`**:

**Site 1** (existente, modificar):
- Repo: arebury/smart-contact-platform
- Base directory: `apps/aed/`
- Build command: `cd ../.. && pnpm install && pnpm --filter @sc/aed build`
- Publish directory: `apps/aed/dist/aed/browser/`  (verificar path Angular 21 build)
- URL: aedmigration.netlify.app (mantiene)

**Site 2** (nuevo):
- Mismo repo
- Base directory: `apps/ds-docs/`
- Build command: `cd ../.. && pnpm install && pnpm --filter @sc/ds-docs build`
- Publish directory: `apps/ds-docs/dist/ds-docs/browser/`
- URL: sugerido `ds-smartcontact.netlify.app` o domain custom

**Memory site**: queda como está conectado a su repo viejo. Lo migramos en Fase 3 (no en esta sesión).

### 1.9 Cierre Fase 1

Una vez todo lo de arriba listo:
- PR `chore/sc-monorepo` con todo el cambio.
- Preview URLs Netlify auto-generadas para ambas apps.
- Rafa+Marta verifican visualmente preview.
- Merge.
- A partir de ahí: componentes directos a main, sin ramas.

---

## Componentes ya disponibles para usar en apps/aed

Estos se exponen desde `packages/design-system/`. AED los consume vía import.

| Componente | Selector post-rename | API estable |
|---|---|---|
| Modal | `<sc-modal>` | sí |
| Toast | `<sc-toast>` | sí |
| Page header | `<sc-page-header>` | sí |
| Sticky form header | `<sc-sticky-form-header>` | sí |
| Photo upload | `<sc-photo-upload>` | sí, `[size]='md'|'sm'` |
| Toggle switch | `<sc-toggle-switch>` | sí |
| Tri-state checkbox | `<sc-tri-state-checkbox>` | sí |
| Illustrated avatar | `<sc-illustrated-avatar>` | sí |
| Section card | `<sc-section-card>` | sí |
| Bulk action bar | `<sc-bulk-action-bar>` | sí |
| Empty state | `<sc-empty-state>` | sí |
| Form danger zone | `<sc-form-danger-zone>` | sí |
| Confirm host | `<sc-confirm-host>` | sí |
| Label chip | `<sc-label-chip>` | sí |
| Color dot picker | `<sc-color-dot-picker>` | sí |
| Inline rename cell | `<sc-inline-rename-cell>` | sí |
| Group popover | `<sc-group-popover>` | sí |
| Bulk edit menu | `<sc-bulk-edit-menu>` | sí |
| Column selector | `<sc-column-selector>` | sí |
| Command palette | `<sc-command-palette>` | sí |
| Keyboard shortcuts | `<sc-keyboard-shortcuts>` | sí |
| Delete entity dialog | `<sc-delete-entity-dialog>` | sí |
| Impact preview dialog | `<sc-impact-preview-dialog>` | sí |
| Form section nav | `<sc-form-section-nav>` | sí |

---

## Fase 2 — Component-by-component (sesiones futuras, NO esta)

Por cada entrada de `MIGRATION-INVENTORY.md`:

1. Implementar/migrar en `packages/design-system/components/<name>/`.
2. Page en `apps/ds-docs/components/<name>` con variantes + code snippets + link Figma.
3. Spec doc en `packages/design-system/docs/components/<NN>-<name>.md`.
4. Override en `sc-preset.ts` si hay divergence.
5. Anotar custom en `customs-catalog.md` si aplica.
6. Update `MIGRATION-INVENTORY.md` status.
7. Commit directo a main → Netlify auto-deploy de ambas apps.

Primer componente target: **Input** (text/email/password). Figma URL pendiente de Rafa.

---

## Fase 3 — Memory integration (futura)

Cuando Memory 3.0 deba consumir tokens SCDS:
1. Mover código de Memory repo a `apps/memory/`.
2. Reconectar Netlify de Memory al monorepo (mantener URL).
3. Configurar Tailwind config de Memory para consumir `--sc-*` CSS variables del `packages/design-system/tokens/`.
4. Componentes React de Memory permanecen — usan `class` con tokens via Tailwind.
5. Sync de Figma Custom → CSS tokens propaga a Memory automáticamente.

---

## Reglas operativas que tu (Claude) sigues siempre

1. **Session-end protocol**: cuando Rafa diga "cerramos" o equivalente, actualizar:
   - `SESSION-LOG.md` del proyecto trabajado.
   - `DECISIONS.md` si hay decisiones nuevas.
   - `MIGRATION-INVENTORY.md` si tocó componentes.
   - Commit + push antes de despedirse.

2. **Decisiones documentadas**: cualquier brand divergence anotada en `customs-catalog.md` con razón. Cualquier choice arquitectónica en `DECISIONS.md`.

3. **CLAUDE.md de cada proyecto se mantiene <10 KB**. Detalle al `docs/`.

4. **No bootstrap Figma Custom collection** hasta tener ~5+ componentes y `customs-catalog.md` con valores claros.

5. **Ramas solo para cambios gordos** (foundation, refactors estructurales). Componentes directos a main.

6. **Cuando dudes, pregunta**. Rafa no es dev, dale opciones claras con tradeoffs.

---

## Estado al cerrar esta sesión (2026-05-14)

- ✅ PR #44 mergeado: design tokens audit + cleanup.
- ✅ PR #45 mergeado: structural audit NO-GO + docs move.
- ✅ PR #46 mergeado: button gallery + bridge overrides.
- ✅ Branch local limpio. `main` al día.
- ✅ Este `NEXT-SESSION-PLAN.md` escrito.
- ⏳ Fase 1 Foundation: pendiente próxima sesión.

Repo: `arebury/aed` (todavía con ese nombre). Renombrar a `arebury/smart-contact-platform` antes de la próxima sesión.
