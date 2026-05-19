# NEXT SESSION PLAN — Smart Contact Platform

> **Para Claude en la próxima sesión** (importante para contexto completo):
>
> 1. Lee ESTE archivo completo.
> 1a. Lee la entry **Session 41** entera en [`SESSION-LOG.md`](./SESSION-LOG.md) —
>    Eje 7 (audit periódico 6-ejes) + Eje 6 (case-study 4 entries) +
>    bootstrap Eje 4 punto 2b (Code Connect mapping doc nuevo). 1 commit
>    `dc7f063` con 3 fixes P1: `--sc-text-muted` no existía (cay a inherit
>    secondary) + a11y aria-label combinaba estado al focus target +
>    `:where()` para fix specificity Angular emulated encapsulation.
>    Figma render `/admin/agentes/crear` vivo en file `khNq9dJKNi13pNllrqm6dx`
>    node 130:6404 con 6 instances Kit Pro + 24 Variables bindings.
> 1aa. Lee también [`packages/design-system/docs/code-connect-mapping.md`](../packages/design-system/docs/code-connect-mapping.md)
>    nuevo S41 — Angular↔Figma mapping operativo con 6 components + Variables semánticas.
> 1b. Lee la entry **Session 40** entera en [`SESSION-LOG.md`](./SESSION-LOG.md) —
>    Sesión corta dirigida, 3 commits. Eje 1 Memory polish ejecutado:
>    §10 #15 iconografía pictograma única canal+state (revierte sparring
>    S37) + §10 #16 chrome AED en tabla `/conversaciones`. Backlog #32
>    nuevo: extracción partial `.table-card`/`.table` cuando llegue 5º
>    consumer.
> 1c. Lee la entry **Session 39** entera en [`SESSION-LOG.md`](./SESSION-LOG.md) —
>    **Sesión maratón ~18 commits**. 6 bloques: rescate Netlify post-S35
>    (npm ci + pin npm + husky), modal v11→v26 Memory, mock dispatch +
>    sticky toast + filas shimmer, MockSampleSwitcher 7 escenarios,
>    Templates predefinidos categorías, ds-docs tracker con memoryUses +
>    whereToSeeMemory, bug NG0950 cazado y arreglado (página blanca
>    Memory), audit 6-ejes plataforma. Estado al cerrar: todo verde
>    end-to-end, Memory `/conversaciones` con dispatch mock funcional.
> 2. Lee la entry **Session 38** entera en [`SESSION-LOG.md`](./SESSION-LOG.md) —
>    Memory migration CERRADA funcionalmente (mock). 11 commits temáticos
>    cubriendo: Player Modal, Bulk Action Bar + Bulk Transcription Modal v11,
>    Bloque 0 deuda visual, Type/Category filter buttons, "Marcar como leídas",
>    Rules listado completo + drag-drop + kebab + delete + constructor 3 tipos
>    + draft + detección conflictos, Entities listado + form Create/Edit,
>    Categories listado + form Create/Edit, HUB AED extendido con cards IA
>    Memory (decisión B materializada). Inventory §10 = 14 entries totales
>    de diferidos + §11 NUEVA con inconsistencias entre docs Memory.
> 2b. Lee la entry **Session 37** entera —
>    ConversationsView iter 2 (Estado + sticky + hover) + iter 3
>    (ConversationFilters top-bar 6 cols, estrena sc-multi-select +
>    sc-datepicker). Deuda bundle #31 anotada.
> 2b. Lee la entry **Session 36** entera — iter 1 ConversationsView (tabla
>    densa 9 columnas + 15 mock + signal store, patrón AED reusado).
> 2c. Lee la entry **Session 35** entera — backup React + rename apps/aed →
>    apps/supervisor + scaffolding Memory feature module + inventario.
> 3. Lee la entry Session 34 para contexto previo (.btn global eliminado +
>    2 refactors Figma 1:1 + regla pragmática consolidada).
> 4. Lee [`docs/memory-migration-inventory.md`](./memory-migration-inventory.md)
>    — **inventario operativo** de Memory React → Angular. Vivo hasta migración
>    completa. **Documento clave** para Fase 5.
> 5. Lee [`packages/design-system/docs/migration-safety.md`](../packages/design-system/docs/migration-safety.md)
>    — **filosofía SCDS** + reglas blindaje + matriz qué tocar/qué no + pro tips
>    devs futuros.
> 6. Lee [`packages/design-system/docs/inconsistencies-backlog.md`](../packages/design-system/docs/inconsistencies-backlog.md)
>    — **fuente única de deuda/gaps** del DS.
> 7. Lee [`.impeccable.md`](../.impeccable.md) — design context + regla CRITICAL:
>    polish requests NUNCA tocan componentes ni tokens.
> 8. Memoria personal en `~/.claude/projects/-Users-rafareses-dev-smart-contact-platform/memory/MEMORY.md`
>    — feedback acumulado. Atención particular a las memorias estructurales:
>    - `feedback_migration_safety.md` — 3 reglas blindaje migración.
>    - `feedback_minimal_customization.md` — política customización mínima sobre PrimeNG.
>    - `feedback_track_inconsistencies.md` — toda inconsistencia detectada → backlog.
>    - `feedback_figma_link_workflow.md` — links Figma SC → anotar inmediatamente en docs.
>    - `project_memory_aed_shared_shell.md` — Memory y AED conviven en el mismo Supervisor app.
>    - **NUEVA S39** `feedback_verify_react_version_before_touch.md` — verificar versión React prototipo antes de polish Memory.
>    - **NUEVA S39** `feedback_ng0950_transitive_pitfall.md` — nunca `let x = this.signal()` fuera de effect/computed en constructor.
>    - **NUEVA S39** `reference_netlify_auto_deploy_setup.md` — operativa completa Netlify SC (site IDs, npm ci, NPM_VERSION pin, trampas CLI).
>    - **NUEVA S39** `feedback_pre_commit_hook_critical.md` — husky+lint-staged es OBLIGATORIO en monorepo sin PR.
>    - **NUEVA S39** `feedback_pedir_logs_no_adivinar.md` — sin log raw todo fix es adivinanza; pedir log dashboard cuando API no expone.
> 9. Si vas a tocar Figma vía MCP: file key `khNq9dJKNi13pNllrqm6dx`. Los links que Rafa pasa son ROOT canvas, no nodes puntuales — extraer toda la info del mismo JSON.
> 10. Checklist anti-divergencia formalizado en [`customs-catalog.md §0`](../packages/design-system/docs/customs-catalog.md) — 4 preguntas obligatorias antes de tocar componentes.
> 11. **Acceso al prototipo React**: `~/dev/Memory/legacy-react/`. Para correr
>    local: `cd ~/dev/Memory/legacy-react && pnpm install && pnpm dev` →
>    http://localhost:5173. Snapshot inmutable en tag `v0-prototype-react-pre-scds`.
>
> **Para Rafa**: cuando abras Claude di literalmente: *"lee
> `docs/NEXT-SESSION-PLAN.md` y arranca"*. Toma desde aquí.

---

## Estado al cerrar (Session 41, 2026-05-19) — Audit + Figma render + bootstrap Code Connect

**1 commit a `main` + render Figma vivo + 3 docs**. Eje 7 (audit) +
Eje 6 (case-study) + bootstrap Eje 4 punto 2b ejecutados:

1. **Audit 6-ejes** post S39+S40 — findings en chat (memoria no-audit-docs).
   3 P1 corregidos en `dc7f063`: token roto `--sc-text-muted` → `subtle`,
   a11y aria-label estado + button, `:where()` para specificity Angular.
2. **Figma render `/admin/agentes/crear`** en file Kit Pro node 130:6404
   con 6 instances reales (button × 2, inputtext × 2, select × 2) + 24
   Variables bindings (`setBoundVariableForPaint`) en frames custom
   (sticky-header, sidebar, section card). Patrón reproducible
   documentado en `code-connect-mapping.md`.
3. **Docs nuevos / ampliados**:
   - `docs/case-study-notes.md` + 4 entries S41 (getComputedStyle,
     emulated encapsulation, a11y focus target, Figma bindings).
   - `packages/design-system/docs/code-connect-mapping.md` NUEVO —
     Angular↔Figma mapping operativo con 6 components + Variables SC
     semánticas + playbook "Cómo añadir nuevo componente / Variable".

### Estado salud al cerrar S41

Bundle 1.64 MB estable. CI verde. Push verde. Figma render vivo en
Playground node 130:6404. Backlog SCDS sin entries P1 abiertas hoy.

---

## Estado al cerrar (Session 40, 2026-05-19) — Polish UX Memory

**3 commits a `main`**. Eje 1 ejecutado completo:

1. **#15 Iconografía Memory status icon** (`9cfcb34`): cocinado
   `<sc-memory-status-icon>` con 6 SVG inline (paths exactos del
   prototipo React `StatusIcons.tsx`) + `resolveStatus()` con la
   misma lógica de precedencia. Paleta reducida gray/teal sec 15.21.
   Animación pulse 1100ms cuando processing/analyzing. Overlays
   failed/multi-recording preservados como badges absolutos. Revierte
   decisión sparring S37 de 3-5 lucides separados.
2. **#16 Chrome AED en tabla Memory** (`b695481`): adoptado el patrón
   `.table-card` + `.table` AED localmente al componente Memory en
   `conversation-table.component.scss`. Border + radius + overflow-
   hidden, thead bg-default uppercase tracked, tr border-bottom
   subtle, td spacing-200. Preservada densidad + sticky + shimmer.
   Zebra eliminado.
3. **Docs cierre** (pendiente al cerrar S40): §10 #15+#16 ✅ Resuelto
   S40 + backlog #32 nuevo (extracción partial table al 5º consumer)
   + SESSION-LOG + NEXT-SESSION-PLAN.

### Estado salud al cerrar S40

Sin cambios significativos vs S39 — todo verde, bundle inalterado,
CI verde, hooks activos. La tabla Memory ahora pinta como las
tablas AED list-pages y el cluster Estado es pictograma única teal/
gray con badges en esquinas.

---

## Estado al cerrar (Session 39, 2026-05-19) — Maratón ~18 commits

**6 bloques temáticos** entrelazados:
1. **Rescate Netlify post-S35**: settings UI viejos, npm 10.9.x rompía esbuild → pin 10.8.2 + `npm ci`, husky+lint-staged. Resultado: 3 builds verdes (CI primera vez desde S35, ambos sites Netlify).
2. **Memory modal v11 → v26**: refactor entero al detectar desfase con prototipo React (Figma 297:2559 "compact body"). 2 celdas hero+decision, animaciones pulse/shake, multi-rec leg-aware.
3. **Mock dispatch + sticky toast + shimmer**: store con `processingIds`/`analyzingIds` + `dispatchTranscription` async 5s+5s, sticky toast updateable, filas en proceso amber/cyan animadas. Chip "Solo fallidas" en toolbar.
4. **Memory adiciones**: Templates predefinidos en CategoryFormModal (4 plantillas) + MockSampleSwitcher (7 escenarios demo, chip amber dashed top-right) + integración processingIds en bulk modal.
5. **ds-docs tracker**: campo `memoryUses` + chip "★ En ambas apps" (cross-consumer detecta 5 piezas) + `whereToSeeMemory` análogo a AED con purple side.
6. **Bug crítico NG0950 + audit 6-ejes**: página blanca cazada (read-fuera-de-effect en constructor), 3 modals reforzados defensivamente, audit completo (anti-patrones, dead code -37 i18n, tokens, a11y, bundle, i18n consistency).

### Commits S39 (~18)

Bloque 1 (rescate Netlify): `a373419`, `2689c15`, `9e8f578`, `d781bc5`, `ea3772b`, `7e85246`, `2f406bc`, `cc1f678`.

Bloque 2-5 (Memory + ds-docs): `fcafbb7`, `ad08a02`, `e670652`, `e3dc6b0`, `7a92b9d`, `da23b2d`, `43b4e0b`, `4ce2d37`.

Bloque 6 (bugfix + audit): `7525864` (hotfix NG0950), `2366993` (defensive), `ef0327b` (inventory §10 #15+#16), `e27ccc5` (dead code), + final docs.

### Estado salud al cerrar S39

| Sistema | Estado | Commit |
|---|---|---|
| aedmigration.netlify.app | ✅ Live · Memory funcional con dispatch mock | `2366993`+ |
| ds-smartcontact.netlify.app | ✅ Live · tracker con memoryUses + cross-app | `e27ccc5` |
| CI GitHub Actions | ✅ Verde (actions/checkout+setup-node v6) | — |
| Pre-commit hook | ✅ Activo (husky+lint-staged) | — |
| Bundle initial supervisor | 1.65 MB (budget 1.8 MB) — diagnóstico real S39 | — |

---

## Roadmap S41+ (priorizado, actualizado S40)

### 🎯 Eje 1 — Memory polish UX (alto valor, accionable sin Marta)

Items derivados del trabajo S39 que tocaron pero quedaron pendientes:

| # | Item | Trigger | Tamaño |
|---|---|---|---|
| §10 #15 | ~~Iconografía cluster Estado en ConversationTable~~ ✅ Resuelto S40 (`9cfcb34`) | — | — |
| §10 #16 | ~~Estilo tabla Memory `/conversaciones` ← adoptar styling AED~~ ✅ Resuelto S40 (`b695481`) | — | — |
| §10 #1 | **Re-transcribir** desde ConversationPlayerModal (icono RotateCcw + RetranscriptionConfirmModal destructivo) | Producto valida flujo destructivo | ~1h |
| §10 #2 | MultiRecordingPlayer multi-leg en player modal | Priorizar fidelidad multi-leg | ~3h |
| §10 #3 | Cocinar `<sc-audio-player>` wrapper SCDS (cuando llegue 2º consumer) | Item #2 desbloquea esto | ~1.5h |

### 🎯 Eje 2 — Memory roadmap (decisiones bloqueadas)

Items §10 que dependen de decisión Rafa/Marta o trigger producto:

| # | Item | Bloqueado por |
|---|---|---|
| §10 #4 | Modal Download heredado SC (checkboxes + aviso GDPR) | Producción real con endpoint backend |
| §10 #5 | Sticky toast progress upgrade in-place (mock simple actual) | ✅ **Resuelto S39** (Fases 1-3 dispatch) |
| §10 #6 | Hint "Excluye K en proceso" en bulk modal subtitle | ✅ **Cableado S39** (processingIds en bulk modal) |
| §10 #7 | Hint multi-tramo subtitle bulk | Dispatcher backend real |
| §10 #8 | Eyebrow "ACCIÓN MASIVA" en bulk modal | Refactor sc-modal añadir slot eyebrow (≥2 consumers) |
| §10 #9 | Toast error "Ver fallidas" + chip toolbar + filtro permanente | ✅ **Chip + filtro S39**; toast: dispatch real backend |
| §10 #11 | DataExportImport JSON config Memory | Producción real |
| §10 #12 | Synonyms granulares per-value en EntityFormModal | Marta/Rafa priorizan |
| §10 #13 | CategoryRuleLinking interactivo bidireccional | Refactor 3-piezas (extender Rule + selector RuleBuilder + UI) |

### 🎯 Eje 3 — SCDS backlog persistente (sin trigger, dormidos)

Ver [`packages/design-system/docs/inconsistencies-backlog.md`](../packages/design-system/docs/inconsistencies-backlog.md):

| # | Item | Estado |
|---|---|---|
| #6 | `<sc-select-button>` gap | Primer filtro segmented real |
| #7 | `<sc-tag>` gap | Primer caso severity-fill |
| #8 | `<sc-toggle-button>` gap | Primer caso button pressed state |
| #14 #15 | Refinements Figma SC Search (icon X + variants formales) | Marta dependent |
| #27 | Branch deploys Netlify preview por PR | Cuando equipo crezca |
| #28 | Memory CI workflow (script tokens → action) | Memory active + threshold |
| #31 | **Bundle initial inflado por theme PrimeNG** (no es MultiSelect Component sino theme tokens) | Modular theme PrimeNG — ~3-4h S40+ |

### 🎯 Eje 4 — Figma ↔ código (input externo Rafa+Marta)

| # | Item | Quién | Cuándo |
|---|---|---|---|
| 1 | Bootstrap Variables Custom collection en Figma SC capturando las 6 divergencias (navy primary, electric-blue info, amber warn, button padding 10.5/7, tabs padding, tooltip chrome) | Rafa + Marta, Claude audita MCP | Cuando os pongáis |
| 2 | Workflow pantallas Figma ↔ código (convenciones nomenclatura, instances obligatorias) | Rafa + Marta, Claude da guidelines | Próximas 1-2 semanas |
| 2b | Figma Code Connect mapping Kit Pro ↔ SCDS | Claude config + Rafa valida | Cuando Rafa dé luz verde |
| 6 | Audit `❖ Panel` SC → desbloquea section-card refactor (P2 deferred S34) | Rafa o Marta + Claude MCP | Cuando os pongáis |

### 🎯 Eje 5 — PrimeOne upgrade vigilance (defensivo)

| # | Item | Cuándo |
|---|---|---|
| 1 | Vigilar nuevos minors PrimeNG (estamos 21.1.7, último 21.1.8 patch trivial verificado S39) | Cada 2-3 sesiones |
| 2 | Dry-run próximo major PrimeNG (22.x cuando salga estable) | Trigger upstream release |

### 🎯 Eje 6 — Case-study notes progresivo

Ver [`docs/case-study-notes.md`](./case-study-notes.md). S39 añadió 2 entries (falsos diagnósticos en cascada + CI rojo invisible). Próximos momentos pedagógicos a anotar: bug NG0950 transitivo, dispatch mock con setTimeout vs polling real, refactor v11→v26 con tokens canonical SCDS (no nuevos).

### 🎯 Eje 7 — Audit periódico

Ejes hechos S39 (sin findings nuevos accionables):
- ✅ Anti-patrones Angular (NG0950 transitivo documentado en memoria)
- ✅ Dead code (-37 i18n keys + 1 import)
- ✅ Tokens hardcoded (0 — todos eran fallbacks)
- ✅ A11y básico (0 issues)
- ⏸ Bundle (diagnóstico real S39, fix S40+ con modular theme PrimeNG)
- ✅ i18n consistency (118 duplicados todos contextuales)

Próximo audit recomendado: tras 5-6 commits de feature work.

---

## Sugerencias arranque S41

**Prioridad 1**: Si Rafa señala Memory feature → atacar §10 #1 (re-transcribir player, ~1h) o §10 #12 (synonyms granulares, sin estimar).

**Prioridad 2**: Si Rafa señala perf / bundle → atacar #31 con modular theme PrimeNG (investigación + fix ~3-4h). Sigue siendo el siguiente reto técnico jugoso.

**Prioridad 3**: Si Marta da luz verde → bootstrap Variables Custom collection en Figma SC capturando las 6 divergencias (eje 4 del mapa).

**NO atacar sin trigger explícito**:
- Reglas IA (`§10 #13` CategoryRuleLinking — Rafa explícito S39 "reglas al roadmap").
- Nuevos componentes SCDS "por si acaso" (memoria `minimal-customization`).
- Refactor estructural (memoria `reference_structural_refactor_plan` — plan dormido).
- Extracción partial `.table-card`/`.table` (backlog #32 — trigger 5º consumer).

---

## Estado al cerrar (Session 38, 2026-05-18) — Memory migration funcional CERRADA

**11 commits temáticos a `main`**. Todas las iter del plan ejecutadas:

### ConversationsView
- ✅ **Iter 5 ConversationPlayerModal**: audio simulado + tabs +
  state machine 8 estados.
- ✅ **Iter 6a Bulk selection (Audit A5)**: row click toggle selección,
  status icon = affordance abre modal, `<sc-bulk-action-bar>`.
- ✅ **Iter 6b BulkTranscriptionModal v11**: 3 columnas MECE, toggle
  locked, state machine C1-C6 (invariante verificada).
- ✅ **Bloque 0 deuda visual**: hero 40→88px (impeccable), 5 shadows
  hardcoded → tokens, 9 transitions 120→200ms, tokens inventados → reales.
- ✅ **Iter 7 TypeFilterButton**: popover 6 grupos checkboxes, dot accent.
- ✅ **Iter 8 CategoryFilter + "Marcar como leídas"** (decisión 15.46).

### Rules
- ✅ **Iter 9a Listado**: tabla 7 cols + 2 secciones (Activas/Inactivas+Borradores).
- ✅ **Iter 9b**: drag-drop CDK + p-menu kebab + delete confirm danger +
  recompactar prioridades.
- ✅ **Iter 9c-1 RuleBuilder Recording**: shell + bloques Metadatos +
  Alcance (3 dim AND con conector Y) + Grabación. Resumen prosa.
- ✅ **Iter 9c-2 Transcripción + AI + tipos Class/Trans**: 3 tipos en
  un único componente + dropdown "Nueva regla" con 3 opciones.
- ✅ **Iter 9d-1 Duplicación + Borrador sin editar**: kebab "Duplicar"
  crea copia con prefijo + flag isDraft + banner ámbar + descartar.
- ✅ **Iter 9d-2 Detección conflictos**: badge "En conflicto" rojo +
  popover con winner por priority (arriba = más prioridad).

### Entities + Categories
- ✅ **Iter 10a EntitiesPage**: 2 secciones (User + System read-only
  con lock) + delete confirm.
- ✅ **Iter 10b EntityFormModal**: Create/Edit unificado, 18 tipos,
  type=list con valores flat (synonyms granulares diferidos §10 #12).
- ✅ **Iter 11a CategoriesPage**: listado tabla 7 cols + duplicar +
  delete.
- ✅ **Iter 11b CategoryFormModal**: Create/Edit con name (min 3
  unique) + description (min 10) + group + isActive. Sección "Reglas
  que la usan" read-only (CategoryRuleLinking interactivo diferido §10 #13).

### Arquitectura
- ✅ **Decisión B fusionar hubs**: Memory Repository → HUB AED.
  Materializada en post-vistas: cards "Reglas IA"/"Entidades IA"/
  "Clasificación IA" del `RepositoriosHubPageComponent` AED ahora
  apuntan a `/conversaciones/reglas`, `/conversaciones/entidades`,
  `/conversaciones/categorias`. RuleBuilder enlaces "Ver repositorio"
  → `/admin/repositorios` en nueva pestaña.

### Estado funcional final

| Ruta | Estado |
|---|---|
| `/conversaciones` | ✅ Tabla + filtros + bulk + 2 modals + Marcar leídas |
| `/conversaciones/reglas` | ✅ Listado + drag-drop + kebab CRUD + conflictos |
| `/conversaciones/reglas/nueva?type=…` y `/:id` | ✅ Constructor 3 tipos + draft banner |
| `/conversaciones/entidades` | ✅ Listado 2 secciones + Create/Edit modal |
| `/conversaciones/categorias` | ✅ Listado + Create/Edit modal + linked rules read-only |
| `/admin/repositorios` HUB AED | ✅ Cards IA → rutas Memory reales |

**Verificación**: 49 cases Playwright across iter 5-11b. Type check
verde + lint verde en cada commit.

**Próxima sesión arranca con**: dispatch real backend cuando llegue
o las iters diferidas §10 si Marta/Rafa las priorizan. Memory frontend
mock está cerrado funcionalmente.

---

## Estado al cerrar (Session 37, 2026-05-18)

**Hitos clave de Session 37** (3 commits, continuación directa de S36):

- ✅ **Iter 2 ConversationsView — Columna Estado + sticky + hover** (commit `8d22148`):
  - Cluster icons coloreados por eje (channel + recording + transcription + analysis + failed).
  - 3 icons Lucide separados (decisión sparring vs 6 SVG custom del prototipo).
  - Sticky header al scroll, hover row suave.
- ✅ **Iter 3 ConversationsView — ConversationFilters top-bar** (commit `7f83d1f`):
  - Grid 6 cols responsive: Servicios + Fecha + Origen + Destino + Grupos ACD + Agentes.
  - **Estrena `<sc-multi-select>` y `<sc-datepicker>`** (primer uso real en monorepo, ambos 0 uses AED hasta hoy).
  - Filtrado reactivo sin botón, store con computed `filteredConversations`.
  - Deuda introducida: bundle initial +200 KB (PrimeNG modules eager). Budget bumpeado 1.5 → 1.8 MB. Entry #31 en inconsistencies-backlog para investigar con source-map-explorer.

**Próxima sesión arranca con**: Iter 4 (filtros por columna sticky-row) o Iter 5 (ConversationPlayerModal — gap nuevo `<sc-audio-player>`). Ver plan completo en `SESSION-LOG.md` entry S37 sección "Plan iteraciones restantes".

Last commit en main: `7f83d1f` (iter 3 ConversationFilters). + commit final de cierre tras este NEXT-SESSION-PLAN entry.

---

## Estado al cerrar (Session 36, 2026-05-18)

**Hitos clave de Session 36** (1 commit, continuación directa de S35):

- ✅ **Memory ConversationsView iteración 1** (commit `b3a1b30`):
  - `data/conversation.types.ts` + `data/conversations-mock.ts` (15 entries representativas).
  - `state/conversations.store.ts` signal store mínimo.
  - `components/conversation-table/`: tabla densa 9 columnas con `.table.sc-table-zebra`.
  - `pages/conversations/`: page-header + tabla, reemplaza el placeholder S35.
  - i18n keys `memory.conversations.*`.
- ✅ **Decisiones consolidadas S36**:
  - Memory mantiene HTML table nativa (no `<p-table>` PrimeNG) por consistencia con AED.
  - Filtros complejos viven dentro de Memory, NO se extraen a SCDS shared.
  - Iteraciones explícitamente minimales — cada feature en su commit.

**Próxima sesión arranca con**: Iteración 2 (columna estado + checkbox selección + sticky header). Ver plan completo en `SESSION-LOG.md` entry S36 sección "Plan iteraciones siguientes".

Last commit en main: `b3a1b30` (Memory ConversationsView iter 1). + commit final de cierre tras este NEXT-SESSION-PLAN entry.

---

## Estado al cerrar (Session 35, 2026-05-18)

**Hitos clave de Session 35** (5 commits a 2 repos):

- ✅ **Backup completo del prototipo React Memory** (commits `2195989`, `ed8bb31` en Memory repo):
  - Snapshot pre-archive con los 27 untracked files (commit explícito) + tag
    anotado `v0-prototype-react-pre-scds` + branch `prototype-react-archive`.
  - Reorg `git mv` masivo (123 archivos) a `legacy-react/` dentro del repo
    Memory. History preservada. README.md reescrito como repo legacy.
- ✅ **Rename apps/aed → apps/supervisor** (commits `be25387`, `d7e764b` en monorepo):
  - 236 archivos renombrados + 22 mods. angular.json, package.json, tsconfig,
    apps/supervisor configs, CLAUDE.md raíz + apps + docs SCDS + i18n keys
    actualizados.
  - Excepciones intencionales: `features/config/aed/` (feature, no marca),
    i18n keys "aed" (UI), prefix eslint `["sc", "aed"]`, narrativas históricas.
  - Build verde (1.42 MB initial), dev server 200, package-lock regenerado.
  - **Acción manual pendiente Rafa**: Netlify UI site `aedmigration` →
    Build command `npm install --no-audit --no-fund && npm run build:supervisor`,
    Publish dir `dist/supervisor/browser`.
- ✅ **Scaffolding Memory feature module** (commit `d02392e`):
  - `apps/supervisor/src/app/features/memory/` con `memory.routes.ts` lazy +
    1 ruta inicial (raíz → ConversationsPage placeholder con `<sc-empty-state>`).
  - `/conversaciones` route reemplaza placeholder genérico por
    `loadChildren: memoryRoutes`. Slot estaba vacío — cero conflicto AED.
  - i18n keys `memory.placeholder.title` + `memory.placeholder.body`.
- ✅ **Inventario migración** (`docs/memory-migration-inventory.md`): 5 vistas
  top-level + 25 componentes + 3 contexts + mapeo Angular target + wrappers
  SCDS probables. Vivo hasta migración completa.

Last commit en main: pendiente (commit final de cierre tras este NEXT-SESSION-PLAN entry).

### Estado factual del catálogo al cerrar S35

- **34 spec docs** sin cambios estructurales vs S34.
- **34 galleries ds-docs** sin cambios.
- **Bundle AED prod**: 1.42 MB initial — Memory feature module es lazy, no
  afecta initial budget.
- **`apps/supervisor/src/app/features/`**: ahora 4 folders (admin, config,
  supervision, **memory** NUEVO).
- **inconsistencies-backlog**: sin cambios (S35 es greenfield, no closure
  de deuda DS).

---

## Estado al cerrar (Session 34, 2026-05-18)

**Hitos clave de Session 34** (5 commits a main):

- ✅ **Dual-system `.btn` vs `<p-button>` eliminado**. 38 botones AED + 3 SCDS internals (`sticky-form-header`, `bulk-edit-menu`) migrados a `<p-button>`. `_buttons.scss` borrado (177 líneas). Tokens `--sc-btn-*` removidos en `04-component.css` + `07-dark.css` (~70 tokens). Override `components.button.root` añadido en `sc-preset.ts` (paddingX 10.5 / paddingY 7 / borderRadius 6 / gap 7 — Figma 1:1 con Kit Pro verificado via MCP node `10:124`).
- ✅ **Min-width estable** 144px en `.page-header__actions p-button > .p-button` (main.scss unscoped — `::ng-deep` no alcanza el inner DOM PrimeNG). Cierra shift visible entre list-pages (134-153px medido S34 → 144 floor).
- ✅ **Refactors Figma 1:1 P1**: `sc-confirm-host` → `<p-confirmdialog>` (API Promise pública intacta, internamente wrappea `ConfirmationService`) + `sc-group-popover` → `<p-popover>` (chrome via `overlay.popover` tokens). Ambos reclasificados ⚪ Pure SC → 🟢 Extended en MIGRATION-INVENTORY.
- ✅ **Audit Figma kit recap (node 829:36548)** cross-ref vs MIGRATION-INVENTORY → 3 candidatos P2 evaluados: **2 declined** (inline-rename-cell ≠ Inplace, illustrated-avatar ≠ Avatar — conceptos distintos pese a nombre) + **1 deferred** (section-card → Panel: Panel vive en library externa, no auditable desde Figma SC MCP). **Regla pragmática consolidada en backlog**: refactor SCDS → PrimeNG solo si (1) mismo concepto, (2) reduce código sin forzar UX, (3) tokens auditados.
- ✅ **Backlog items cerrados**: #11 (dual-system), #17 (build error ds-docs verificado verde — item obsoleto), input-number Figma TODO (hereda de sc-input).
- ✅ **Bug pre-existente arreglado de paso**: HTML comment dentro de `<input>` opening tag en `search.component.html` bloqueaba build (Angular template parser).
- ✅ **Memoria nueva** `feedback_case_study_notes.md`: anotar momentos pedagógicos del proyecto progresivamente para presentación case study.

Last commit en main: pendiente (commit final de cierre tras este NEXT-SESSION-PLAN entry).

### Estado factual del catálogo al cerrar S34

- **34 spec docs** (sin cambios estructurales vs S33; entries 14 confirm-host + 18 group-popover ahora marcadas 🟢 Extended).
- **34 galleries ds-docs** (cobertura 100%). Build production ds-docs **verde**.
- **Bundle AED prod**: 1.41 → 1.40 MB initial. agent-form-page.scss 13.59 → 12.96 kB. Visual verificado en 12 pantallas (light + dark) via Playwright.
- **Tokens removidos**: `--sc-btn-*` series completa (light + dark).
- **`_buttons.scss`** eliminado. Botones AED ahora 100% `<p-button>`.
- **inconsistencies-backlog**: 30 entries · 4 resueltas adicionales en S34 (#11, #17, P1 refactors, input-number TODO). Total resueltas: 14/30.

---

## Estado al cerrar (Session 33, 2026-05-18)

**Hitos clave de Session 33** (9 commits a main):

- ✅ **sc-input-group cocinado** + caso real tag-input aed-servicio migrado. SCDS llega a 34 componentes (era 33).
- ✅ **Tracker home redesign**: chips Tipo (custom vs PrimeNG) vs Estado (paridad Figma–código) — conceptos separados. Agrupación por 7 categorías funcionales en lugar de lista plana. Counterpropuesta exitosa a la idea inicial de "mega-página única pure-sc".
- ✅ **Cobertura galleries 100%** (34/34 componentes con página individual en ds-docs).
- ✅ **Frontmatter inline** en 34 spec docs (Type · AED uses · Figma parity).
- ✅ **Type decoupling**: `LabelColor` + `GroupRef` movidos a SCDS. AED re-importa via `@shared/components`. SCDS queda self-contained.
- ✅ **Bug introducido y corregido en la misma sesión**: galleries S33 usaban colores inexistentes (`violet`/`rose`/`cyan`). Reducido a los 8 reales (gray/red/orange/amber/green/teal/blue/purple).
- 🎯 **Perf win**: `"sideEffects": false` en `packages/design-system/package.json` → AED initial bundle 1.61 MB → 1.41 MB (-200 KB, bajo budget 1.5 MB). Diagnóstico via source-map-explorer.
- ✅ **Audits Figma cerrados como falsos positivos** (#12 `sc-modal`, #13 `sc-select` Filled/Invalid): la auditoría ya existía desde S30/S31, solo las descripciones del backlog estaban desactualizadas.
- ✅ **Lint sweep**: 71 errores (regla mal configurada post-monorepo) → 0. Prefix array `["sc", "aed"]` en el eslint config.
- ✅ **Memoria nueva** `critical-sparring-partner`: 5-step protocol para planes/opiniones complejas.

Last commit en main: `609e1e6` (chore lint).

### Estado factual del catálogo al cerrar S33

- **34 spec docs en `packages/design-system/docs/components/`** (entry 34 nueva: input-group).
- **34 galleries ds-docs** (cobertura 100%, antes 17). 5 son documentales para shell-only components (command-palette, keyboard-shortcuts, confirm-host) — el mock del servicio no aporta valor.
- **Tracker home agrupado por 7 categorías**: Formularios y entrada, Acciones, Layout, Navegación, Overlays, Tablas, Estados vacíos.
- **Bundle AED prod**: 1.41 MB initial (-200 KB vs S32). Gzip ~330 KB transfer real.
- **Customs catalog**: 13 entries (sin cambios estructurales).
- **inconsistencies-backlog**: 30 entries · 8 resueltas en S33 (incluyendo 2 falsos positivos).

---

## Estado al cerrar (Session 32, 2026-05-15)

**Hitos clave de Session 32**:

- ✅ **Fase 1 AED migraciones cerrada al 100%**: 5 forms residuales (template, label, user, group, repo) migrados a SCDS. Sin nativos restantes en formularios.
- ✅ **Auditoría nivel-2 pure-sc**: 21 componentes, 0 P0/P1 reales, 12 P2 caso a caso → todos DECLINE. Catálogo en estado muy sano (8/21 clean directamente, 13 ya documentados con comments inline).
- ✅ **19 nuevos spec docs** (15-33): cobertura 100% de pure-sc (era 2/21, ahora 21/21). Catálogo total: 33 docs.
- ✅ **`migration-safety.md`** (NUEVO): doc estructural con filosofía SCDS + 3 reglas blindaje + matriz qué tocar/qué no + 6 pro tips devs futuros. **Lectura obligatoria** para próximos contributors.
- ✅ **`inconsistencies-backlog.md`** (NUEVO): punto único tracking de deuda/gaps con severidad + fase + status. 17 entries iniciales (S30+S31+S32 histórico).
- ✅ **4 refactors consistencia** (memoria `minimal-customization`):
  - `bulk-edit-menu`: `<select>` × 2 → `<sc-select>` con pTemplate.
  - `toggle-switch`: pure-sc CSS → wrapper de `<p-toggleswitch>`. 21 consumers AED intactos.
  - `inline-rename-cell` + `label-chip`: declined con justificación documentada (rompería visual / no encaja con p-tag/p-chip).
- ✅ **4 memorias estructurales nuevas** capturando feedback Rafa: migration safety, minimal customization, track inconsistencies, figma link workflow.
- ✅ **Audit Figma SC vs PrimeOne base**: confirmado NO se han modificado variables Figma base. Política `audit/01-identity-recap.md §2.10` consistente. Riesgo migración Prime upstream: BAJO.

Last commit en main: `1c52d58` (docs scds spec docs + refactors S32).

### Estado factual del catálogo al cerrar

- **33 spec docs en `packages/design-system/docs/components/`** (era 14 al inicio S32):
  - 11 Extended (wrappers PrimeNG): input, input-number, select, multi-select, datepicker, modal, checkbox, search, **toggle-switch (nuevo Extended S32)**, label-chip*, **dialog/tooltip**.
  - 4 Custom-preset: button, toast, tabs.
  - 1 Full-PrimeNG: tooltip.
  - 17+ Pure-SC: section-card, empty-state, photo-upload, illustrated-avatar, page-header, form-section-nav, form-danger-zone, sticky-form-header, bulk-action-bar, bulk-edit-menu, impact-preview-dialog, delete-entity-dialog, column-selector, inline-rename-cell, group-popover, command-palette, keyboard-shortcuts, confirm-host, color-dot-picker.
- **AED usage por componente** (recount oficial post-S32):
  - sc-toggle-switch 21 · sc-input 21 · sc-select 16 · sc-section-card 12 ·
    sc-search 8 · sc-page-header 8 · sc-delete-entity-dialog 8 · sc-input-number 7 ·
    sc-illustrated-avatar 7 · sc-tri-state-checkbox 6 · sc-bulk-action-bar 6 ·
    sc-sticky-form-header 3 · sc-label-chip 3 · sc-inline-rename-cell 3 ·
    sc-form-section-nav 3 · sc-form-danger-zone 3 · sc-empty-state 3 ·
    sc-column-selector 3 · sc-photo-upload 2 · sc-modal 2 · sc-impact-preview-dialog 2 ·
    sc-bulk-edit-menu 2 · sc-keyboard-shortcuts 1 · sc-group-popover 1 ·
    sc-confirm-host 1 · sc-command-palette 1 · sc-color-dot-picker 1 ·
    **sc-multi-select 0 · sc-datepicker 0** (esperan primer caso real AED).
- **Backlog inconsistencies**: 17 entries — 2 ✅ resueltas S32 (bulk-edit-menu, toggle-switch refactors), 2 ⏸️ rechazadas con justificación (inline-rename-cell, label-chip), 4 gaps componente conocidos (`sc-input-group`, `sc-select-button`, `sc-tag`, `sc-toggle-button`), resto deuda histórica.
- **Customs catalog**: 13 entries (sin nuevas en S32 — los refactors son **alineación**, no divergence). §5.6 `sc-toggle-button` gap nuevo + §5.7 reseña refactors S32.
- **Figma SC**: NO se modificaron variables base. Canvas `❖ Search` (node 11861:55210) compuesto S31 sigue intacto.

---

## Fase 1 — ✅ CERRADA

Migraciones inputs/selects nativos AED → SCDS: 100% completa.
Inputs y selects que NO migran (justificados, NO en backlog):
- `inline-rename-cell` mantiene `<input>` nativo (decision visual S32).
- `bulk-edit-menu` ahora usa `<sc-select>` internamente (refactor S32).

---

## Fase 2 — Componentes nuevos por trigger real

Los **4 gaps documentados en customs-catalog §5** + **inconsistencies-backlog #5-#8**:

1. **`sc-input-group`** (Figma node 6738:22644) — wrapper de `<p-inputgroup>` para addon left/right. **Trigger**: primer caso real input+icono o input+botón en AED. Hay 1 caso pendiente (`tag-input` aed-servicio estados).
2. **`sc-select-button`** (Figma node 6738:46433) — wrapper de `<p-selectbutton>` para chips toggle segmented. **Trigger**: primer filtro segmented real en AED. Sin caso hoy.
3. **`sc-tag`** (Figma node 6738:55116) — wrapper de `<p-tag>` para etiquetas severity-fill no removibles. **Trigger**: primer caso de tag visual (severity/estado lleno color). NO confundir con `sc-label-chip` que cubre el `❖ Chip` (categorical color custom).
4. **`sc-toggle-button`** (Figma node 6738:46435) — wrapper de `<p-togglebutton>` para button con estado pressed/unpressed. **Trigger**: primer caso real en AED. Sin caso hoy.

Nuevos componentes hipotéticos (NO empezar sin caso real):
- Autocomplete, TimePicker, DateRange, Pagination, SegmentedControl.

---

## Fase 3 — Auditorías adicionales pendientes (del backlog)

Ver `packages/design-system/docs/inconsistencies-backlog.md` para listing completo. Items remaining tras S33:

### A — Item #14-#15 — Refinement Figma SC Search (Marta dependent)

- Right Icon en variant "With value + clear icon": defaultea a search; cambiar a X cuando se importe icon al Kit.
- Variants formales del Main Component (Size sm/md/lg × Filled × Disabled) como component set propio.

### B — Mapeo Memory components + usage count (Camino B, Fase 4)

Replicar el patrón `aedUses: N` para `memoryUses: N` cuando Memory consuma SCDS.

### C — Item #11 — `_buttons.scss` migrate a SCDS

Mover `apps/aed/src/styles/_buttons.scss` a `packages/design-system/styles/_buttons.scss` siguiendo el patrón de `_sc-toast.scss`. **Condición de trigger**: aparece segundo consumer (ds-docs hoy no usa `.btn`).

> Ítems resueltos / cerrados S33: #5 (sc-input-group), #10 (bundle perf -200 KB), #12/#13 (audits Figma — falsos positivos), #16 (galleries 14/14), #26 (frontmatter), #29 (type decoupling), #30 (bug colores galleries S33).

---

## Fase 4 — Memory consume tokens SCDS ("Camino B")

Los **4 gates ya están ✅ cumplidos** desde S31. Plan concreto (sin cambios):

1. Decidir mecanismo: **Camino C (script de copia)** para empezar.
2. Setup en Memory: `src/styles/sc-tokens/` con las 7 capas copiadas + importar `01-primitive.css` + `02-semantic.css`.
3. Borrar de Memory cualquier `--*` que duplique un `--sc-*`.
4. Verificar build verde + pantallas no rompen.
5. (Opcional) Mapping Tailwind → `--sc-*` en `tailwind.config.ts` de Memory.
6. Documentar en SCDS `docs/consumers.md` que Memory es consumer.

Tiempo: 2-4h. Requiere acceso al repo Memory (no está en monorepo).

---

## Reglas operativas (actualizadas Session 33)

**🆕 Nueva regla S33** (memoria `critical-sparring-partner`):

20. **Crítica constructiva por defecto en planes/decisiones complejas**. 5-step protocol: assumptions, counterpoints, reasoning, alternatives, correction. NO agree por defecto. Para tareas mecánicas (rename, mover archivo, escribir componente con API clara): aplicar criterio y ejecutar sin ceremonia.

**🆕 Nueva regla S38** (memoria `memory-roadmap-no-limbo`):

26. **Memory roadmap siempre vivo — no limbo**. Toda funcionalidad del prototipo React que se descarte/postergue durante la migración (v1/v2, post-rollout, fuera de alcance iter, "lo haremos cuando") → entry inmediato en `docs/memory-migration-inventory.md §10 Diferidos post-v1 / post-rollout` con origen + versión + trigger explícito de reapertura. Sin tabla viva, los descartes se evaporan. Análogo a `feedback_track_inconsistencies` (deuda DS) pero para producto Memory.

27. **Resumen estructurado al cierre de cada iter** (memoria `iter-closing-summary`): al cerrar cualquier bloque (iter, refactor, bug fix gordo) escribir 4 puntos breves — qué hice / qué verifiqué (con casuísticas) / qué herramientas usé / qué riesgo queda pendiente. Verificación proporcional al cambio: UI → Playwright, lógica → tsc + tests, typo → solo lint.

28. **Confirmar antes de instalar deps nuevas** (memoria `confirm-before-deps`): cualquier `npm install <paquete>` nuevo requiere confirmación Rafa con: (a) qué problema resuelve, (b) por qué no resuelve con stack actual, (c) bundle impact. No aplica a `npx <tool>` para scripts tmp que se borran después. Reverter una dep mal elegida es costoso.

---

## Reglas operativas (actualizadas Session 32)

1. **Polish requests NUNCA tocan componentes ni tokens** (CRITICAL `.impeccable.md`).

2. **🆕 Customizar lo MÍNIMO sobre PrimeNG** (memoria `minimal-customization`). Antes de crear pure-sc nuevo, 3 preguntas: ¿PrimeNG ya lo tiene? → wrapper. ¿pTemplate cubre el render? → usar slot. ¿PrimeNG NO lo tiene? → pure-sc + entry catalog.

3. **🆕 Migration safety SIEMPRE** (memoria `migration-safety`). 3 reglas: `--sc-*` único source + wrappers encapsulan + customs-catalog registra TODA divergence. Doc completa en `packages/design-system/docs/migration-safety.md`.

4. **🆕 Inconsistencias detectadas → backlog persistente** (memoria `track-inconsistencies`). Toda finding sin acción inmediata → entry en `inconsistencies-backlog.md` con severidad + fase. No postergar sin trazabilidad.

5. **🆕 Links Figma SC → anotar inmediatamente** (memoria `figma-link-workflow`). Rafa pasa links puntuales; Claude tiene acceso al file entero via MCP. Anotar en spec doc + MIGRATION-INVENTORY el mismo turno.

6. **PEDIR link Figma SC ANTES de tocar/crear/refinar componente** (memoria `figma-link-before-component`). Si Rafa no tiene a mano, esperar.

7. **Los links Figma de Rafa son root canvas, no nodes puntuales** (memoria `figma-links-full-pages`). Extraer todo del mismo JSON.

8. **Aplicar checklist anti-divergencia** (customs-catalog §0). 4 preguntas obligatorias antes de añadir prop / slot / CSS override.

9. **Figma specs exhaustivos**: extraer auto-layout, paddings (incluso decimales), tokens (boundVariables), variants (componentProperties). Memoria `figma-specs-thorough`.

10. **Verificación obligatoria post-claim**: cuando un agente reporte "hecho", pedir 1 verificación reproducible (curl, screenshot, hash, AOT verde).

11. **🆕 Audit reportes requieren sanity check** (lección S32). Trust agents para research, verify la severidad antes de aplicar. Especialmente: estilo TypeScript (`: void` explicit), `::ng-deep` documentados, JSDoc faltantes (puede que ya tenga inline comments).

12. **CLAUDE.md de cada proyecto se mantiene <10 KB**. Detalle al `docs/`.

13. **Componentes y refactors menores**: directo a `main`. Cambios estructurales gordos: rama + PR.

14. **Cuando dudes, pregunta**. Rafa no es dev — opciones claras con tradeoffs.

15. **Nunca clavar repo en `~/Desktop/`, `~/Documents/` ni rutas iCloud ☁️**. Usar `~/dev/`.

16. **Spec doc nuevo cada vez que cocines un componente**. Patrón establecido: TL;DR / Cuándo / API / Tokens por variant / Divergencias / Migración AED / Página demo / Figma reference. 33 ejemplos en `docs/components/01-33`.

17. **Brand divergence nueva** → entry en `customs-catalog.md` + mention en el spec doc del componente afectado. Catalog es la fuente única.

18. **ds-docs vehicle** = polish ok. **packages/design-system/components/** + tokens + sc-preset.ts = sacred. Ver `.impeccable.md` para detalle.

19. **Bug pattern conocido — SCSS selector dead en wrappers PrimeNG**: cuando un wrapper SCDS aplica una clase (ej. `sc-X__control`) al `<p-X>` root, PrimeNG añade su propia clase (`p-X`) al MISMO elemento. NO usar selectores descendant `.sc-X__control .p-X` — usar `.sc-X__control` directo. Y NO usar `display: block` en estos wrappers — rompe el `inline-flex` interno de PrimeNG.

---

## 🎯 Mapa estratégico vigente (actualizado S35)

Los siguientes 7 ejes constituyen el plan vivo del proyecto. Trabajar
sobre ellos progresivamente, no en una sola sesión.

| # | Eje | Quién | Cuándo |
|---|---|---|---|
| 1 | **Bootstrap Variables Custom collection en Figma SC** capturando las 6 divergencias (navy primary, electric-blue info, amber warn, button padding 10.5/7, tabs padding 14/15.75, tooltip chrome) | Rafa + Marta, Claude audita MCP | Cuando os pongáis |
| 2 | **Workflow pantallas Figma ↔ código**: convenciones nomenclatura frames, qué componentes son obligatorios usar (instances Kit Pro, no copias), cómo marcar variants | Rafa + Marta, Claude da guidelines técnicas | Próximas 1-2 semanas |
| 2b | **Figma Code Connect mapping** Kit Pro ↔ SCDS components | Claude config inicial + Rafa valida | Cuando Rafa dé luz verde |
| **3** | **Memory migración funcionalidad-por-funcionalidad (Fase 5)** — ver plan detallado abajo | Rafa con prototipo legacy-react/ + Claude implementando Angular | **Próximas sesiones dedicadas, N iteraciones** |
| 4 | Case-study-notes progresivo | Claude con visto bueno Rafa | Anotar cuando aparezca momento |
| 5 | Cocinar wrappers gap por trigger real Memory (`<sc-data-table>`, `<sc-audio-player>`, primer uso real `<sc-datepicker>` y `<sc-multi-select>`) | Claude | Trigger Memory real |
| 6 | Audit `❖ Panel` SC → desbloquea section-card refactor | Rafa o Marta + Claude MCP | Cuando os pongáis |
| 7 | PrimeOne upgrade dry-run | Claude siguiendo migration-safety.md | PrimeNG release |

### Plan detallado Memory migration Fase 5 (Eje 3) — próximas sesiones

**Cerrado en S35** (no re-abrir):
- ✅ Backup React (tag + branch + legacy-react/).
- ✅ Rename `apps/aed/` → `apps/supervisor/`.
- ✅ Scaffolding `apps/supervisor/src/app/features/memory/` con
  `ConversationsPage` placeholder activo en `/conversaciones`.
- ✅ Inventario en `docs/memory-migration-inventory.md`.

**Fase 5 — Migración funcionalidad-por-funcionalidad** (iterativa, N sesiones):

Orden sugerido (de mayor a menor superficie):

1. **`ConversationsView`** (la vista funcional más grande):
   - Componente `ConversationsPageComponent` (reemplazar placeholder actual).
   - Subcomponentes: `ConversationFilters`, `ConversationTable`,
     `TypeFilterPanel`, `CategoryFilterPanel`, `DurationFilter`,
     `RecordingFilter`, `TimeRangeFilter`, `DateRangePicker`,
     `MultiSelectWithSearch`.
   - Modales: `BulkTranscriptionModal`, `ConversationPlayerModal`,
     `MultiRecordingPlayer`, `RetranscriptionConfirmModal`.
   - Stores signals: comienza por mocks (data/), estado en signal stores
     (no contexts React).
   - **Wrappers SCDS a estrenar/cocinar**:
     - `<sc-datepicker>` primer uso real (Extended, 0 uses AED hoy).
     - `<sc-multi-select>` primer uso real (Extended, 0 uses AED hoy).
     - `<sc-data-table>` (gap nuevo, pedir Figma a Marta antes de cocinar).
     - `<sc-audio-player>` (gap nuevo).
   - **Tiempo estimado**: 1 sesión larga (4-6h) o 2 sesiones medias.

2. **`RepositoryHub`** (landing /conversaciones/repositorio):
   - Componente `RepositoryHubPageComponent` (hero card + 2 cards equal +
     pill row + how-it-works ribbon first-run).
   - `DataExportImport` componente.
   - Wrappers usados: `<sc-section-card>` (24 uses AED), `<sc-page-header>`.
   - **Tiempo**: ~2h.

3. **`RulesRepository`** (3 builders + lista):
   - `RulesPageComponent`, `RuleQuickViewPanel`.
   - 3 builders distintos: `ClassificationRuleBuilder`, `RecordingRuleBuilder`,
     `TranscriptionRuleBuilder` + shared `ActiveToggle`, `AdditionalConditions`,
     `RuleBuilderLayout`, `SelectionCriteria`.
   - Signal store `rules.store.ts`.
   - **Tiempo**: 1 sesión larga (probablemente la más compleja del proyecto).

4. **`EntityManagement` y `CategoriesManagement`**:
   - CRUD relativamente directo, patrón AED (lista + form panel + delete dialog).
   - Signal stores `entities.store.ts` y `categories.store.ts`.
   - Categorías incluye `CategoryRuleLinking` (relación con reglas).
   - **Tiempo**: 1 sesión cada uno.

**Cómo trabajar Fase 5** (per feature):
- Abrir el componente React en `~/dev/Memory/legacy-react/src/app/components/X.tsx`.
- Comparar visual + funcional contra Figma SC si existe (preguntar a Rafa por
  el link Kit Pro relevante).
- Implementar Angular con SCDS consumiendo el catálogo actual.
- Si aparece gap componente → entry en `inconsistencies-backlog.md` +
  decisión cocinar/declinar siguiendo regla pragmática refactor (3 criterios).
- Verificación visual con Playwright en al menos 3-5 puntos clave de la
  feature migrada.
- Commit + push.

**Switch Netlify memoryplus3**: cuando ConversationsView esté funcional
(no antes), configurar alias DNS `memoryplus3.netlify.app` → site
`aedmigration` (o rename del site). Habilita demo única URL.

### Acción manual pendiente Rafa (Netlify UI)

Site `aedmigration` (config Build & deploy):
- **Build command**: `npm install --no-audit --no-fund && npm run build:supervisor`
- **Publish directory**: `dist/supervisor/browser`
- (El env var override puede quedar vacío — usa default actualizado en `netlify.toml`.)

### Estado al cerrar (Session 35, 2026-05-18) — net

5 commits S35 a 2 repos:
- Memory repo: `2195989` (snapshot pre-archive), `ed8bb31` (reorg legacy-react).
- Monorepo: `be25387` (rename apps/aed→supervisor + 236 renames), `d7e764b` (netlify.toml), `d02392e` (Memory scaffolding).

Estado salud: rename ejecutado limpio, Memory feature module wireado y
verificado. Próxima sesión empieza con ConversationsView migration.

### Estado al cerrar (Session 34, 2026-05-18) — net

[Ver entry S34 en SESSION-LOG.md para detalle completo]

7 commits S34 a main: `130087a` (.btn migration), `d8a8346` (SCDS internals + page-header min-width), `735047b` (P1 refactors Figma 1:1), `6b9cab2` (backlog + MIGRATION-INVENTORY), `89d21ea` (SESSION-LOG + NEXT-SESSION-PLAN), `609bd46` (audit Fase 2 gray scale cerrada), `ffae8b3` (audit Fase 3 huecos verificados), `153b12c` (case-study-notes empezado).

Estado salud DS: cero deudas de diseño accionables internamente. Todo lo pendiente requiere input externo (Rafa+Marta sesión Figma, trigger AED/Memory real, PrimeOne release).

---

## Sugerencias arranque próxima sesión

**Prioridad 1 (lo más probable que Rafa pida)**: Fase 5 ConversationsView
migration. Ver "Plan detallado Memory migration Fase 5" arriba. Es la
continuación natural de S35.

**Backlog DS sin novedades vs S34** (todo P3, todo espera trigger externo):

| # | Item | Severidad | Trigger |
|---|---|---|---|
| 6 | `<sc-select-button>` gap | P3 | Primer filtro segmented real |
| 7 | `<sc-tag>` gap | P3 | Primer caso severity-fill |
| 8 | `<sc-toggle-button>` gap | P3 | Primer caso button pressed state |
| 14 | Refinement Figma Search (icon X clear) | P3 | Marta decision |
| 15 | Variants formales Figma Search | P3 | Marta decision |
| 27 | Branch deploys Netlify production-only | P3 | Equipo crezca |
| 28 | Memory CI workflow (post-activation) | P3 | Memory features mínimas |
| — | `sc-section-card` → `<p-panel>` | P2 deferred S34 | Audit `❖ Panel` SC (Marta) |

**Probablemente activados durante Fase 5 Memory**:
- `<sc-datepicker>` primer uso real (Extended 0 uses hoy → +1 cuando ConversationsView).
- `<sc-multi-select>` primer uso real (Extended 0 uses hoy → +1 cuando ConversationsView).
- `<sc-data-table>` (gap nuevo, no documentado en backlog hoy — añadir entry cuando se confirme el gap durante implementación ConversationsView).
- `<sc-audio-player>` (gap nuevo, idem).

**NO atacar sin requerimiento explícito**:
- Crear componentes pure-sc "por si acaso" — memoria `minimal-customization`.
- Tocar Figma SC sin que Marta lo pida.
- Refactors estructurales (memoria `reference_structural_refactor_plan` — plan dormido por diseño).

## Reglas operativas (actualizadas Session 34)

**🆕 Nueva regla S34** (memoria `case-study-notes` + regla pragmática refactor):

21. **Anotar momentos pedagógicos progresivamente** (memoria `case-study-notes`): cuando surja algo interesante (refactor con historia, sparring que cambió decisión, gotcha técnica, premisa equivocada) anotarlo para presentación case study. Filtrar señal vs morralla, no urgente, archivo dedicado (no en backlog).

22. **Regla pragmática refactor SCDS → wrapper PrimeNG** (consolidada en `inconsistencies-backlog.md` cierre S34): solo refactor si los 3 criterios se cumplen — (a) mismo concepto, (b) reduce código sin forzar UX changes en consumers, (c) tokens Figma auditados. Conceptos distintos con nombre parecido (Inplace ≠ inline-rename-cell, Avatar ≠ illustrated-avatar) NO se refactorizan. Patterns in-house sin equivalente Figma (empty-state, danger-zone, sticky-form-header, command-palette, page-header) NO se refactorizan.

23. **Verificación visual obligatoria post-migración mecánica** (lección S34): el grep no es la realidad. Tras cualquier rename/eliminate masivo, validar con Playwright al menos 5-7 pantallas (light + dark) para detectar deuda escondida (e.g. componentes SCDS internals que el grep `apps/aed/src` no toca).

24. **`<p-confirmdialog>` es el patrón canonical para confirmation dialogs SC** (S34): NO crear nuevos sc-modal manuales para confirmaciones — usar `ConfirmHostService.request(req): Promise<boolean>` que internamente wrappea PrimeNG `ConfirmationService`. Para dialogs no-confirmation (delete-entity, impact-preview), seguir usando `<sc-modal>` directamente.

25. **`<p-popover>` para overlays anchored a un trigger** (S34): si necesitas un panel float anchor-positioned, usar `<p-popover>` directamente o vía wrapper SC (como `sc-group-popover`). Beneficio: tokens `overlay.popover` 1:1 Figma + posicionamiento PrimeNG + render en `<body>` (escapa clips).
