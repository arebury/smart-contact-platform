# Memory — Architectural Decisions

> Decisiones grandes que afectan al diseño del módulo Memory dentro del Supervisor.
>
> **Source of truth**: este doc. Roadmap operativo de migración en
> [`docs/memory-migration-inventory.md`](../../../../docs/memory-migration-inventory.md).
> Apuntes pedagógicos en [`docs/case-study-notes.md`](../../../../docs/case-study-notes.md).
>
> Formato: 1 entry por decisión. Newest first. Cada entry tiene: contexto,
> opciones consideradas, decisión, razón, consecuencias.

---

## DM-7 · 2026-05-20 (S46) — `<sc-audio-player>` wrapper SCDS · declinado

**Contexto**: tras cocinar `<sc-memory-multi-recording-player>` (§10 #2), surgía la pregunta de extraer el transport play/pause/seek a un wrapper SCDS reusable.

**Opciones**:
- (a) Cocinar `<sc-audio-player>` ahora.
- (b) Declinar; esperar trigger real (2º consumer externo a Memory o Figma spec del equipo de diseño).

**Decisión**: **(b) declinar**.

**Razón**: tres bloqueos simultáneos —
- Sin Figma spec del Kit Pro SC. Cocinar pure-sc sin spec va contra `feedback_figma_link_before_component`.
- No hay 2 consumers reales: solo Memory usa transport (single en player modal + multi-rec); el bar/scrub difiere entre ambos (single global vs active-segment overlay), solo se solaparían los 3 botones back10/play/fwd10.
- Los 3 botones son demasiado simples para abstraer a SCDS component. Si llega 3ª duplicación, partial SCSS, no SCDS.

**Re-abrir si**: consumer externo a Memory (audio preview en AED, recording playback en otra feature) **O** Figma spec del equipo de diseño.

---

## DM-6 · 2026-05-20 (S46) — Click en row Memory `/conversaciones` → selección (no edit)

**Contexto**: audit S44 detectó que el click en row de Memory `<sc-memory-conversation-table>` dispara `selectionToggled.emit()` (marca el checkbox), mientras que en AED list-pages el click en row abre el form-edit. Usuario que viene de AED esperaría click→edit.

**Opciones**:
- (a) Mantener Memory click→select (status icon abre el player).
- (b) Alinear con AED: click→player, checkbox solo para selección.
- (c) Doble-click→player + single-click→select.

**Decisión**: **(a) mantener click→select**.

**Razón**: AED y Memory tienen modelos mentales distintos pese a compartir shell —
- AED `/admin/*` edita entidades → click→form-edit es affordance estándar (GitHub, Linear).
- Memory `/conversaciones` revisa datos + bulk-process → click→select es affordance estándar (Gmail, Outlook).
- El bulk flow (transcribir/marcar leídas/analizar IA) es el caso de uso jugoso de Memory. 1 click selecciona, fricción mínima.
- El status-icon como botón dedicado para abrir el player ya cumple su rol con affordance visual obvia.

**Mitigación opcional** si user test con el equipo de diseño valida que la inconsistencia molesta: tooltip on row-hover "Click para seleccionar · Click en icono de estado para abrir conversación". Coste en docs/tooltip, no en cambiar la mecánica.

---

## DM-5 · 2026-05-19 (S40) — Iconografía cluster Estado: pictograma única vs cluster

**Contexto**: la tabla Memory tenía cluster de 3-5 Lucide icons separados para representar el estado (recording / transcription / analysis / failed). Audit S40 detectó divergencia con el prototipo React que usa pictograma única (`<StatusIcons>` con paths custom).

**Decisión**: pictograma única `<sc-memory-status-icon>` con 6 SVG inline (paths exactos del React) + `resolveStatus()` con lógica precedence analyzing > processing > hasAnalysis > hasTranscription > hasRecording.

**Razón**: el cluster de 3-5 icons separados (decisión sparring S37) era ruido visual; pictograma única comunica el estado en un solo glance.

**Revierte**: decisión S37 de 3-5 lucides separados.

---

## DM-4 · 2026-05-18 (S38) — Fusión Repository Hub → AED Repositorios Hub

**Contexto**: el prototipo React tenía un `<Repository>` page como hub de configuración Memory (Reglas / Categorías IA / Entidades IA). AED ya tiene su propio `/admin/repositorios` HUB.

**Opciones**:
- (a) Mantener Memory Repository como hub separado.
- (b) Fusionar: las cards IA Memory pasan a `/admin/repositorios` (HUB AED).

**Decisión**: **(b) fusionar** ("Decisión B").

**Razón**: Memory y AED comparten shell — sidebar / topbar / auth. Tener 2 hubs paralelos para conceptos "repositorio" rompía el modelo mental. Las cards "Reglas IA" / "Entidades IA" / "Clasificación IA" del `RepositoriosHubPageComponent` AED apuntan a las rutas Memory (`/conversaciones/reglas`, `/entidades`, `/categorias`).

**Consecuencia**: el RuleBuilder de Memory tiene enlaces "Ver repositorio" → `/admin/repositorios` en nueva pestaña.

---

## DM-3 · 2026-05-18 (S37) — Filtros `ConversationFilters` viven en Memory, no SCDS

**Contexto**: la top-bar de filtros de `/conversaciones` (services / date / origin / destination / groups / agents) es compleja (6 cols responsive, multi-select con search, datepicker). Surgía la pregunta de extraerla a SCDS.

**Decisión**: filtros complejos viven dentro de Memory, NO se extraen a SCDS shared.

**Razón**: política SCDS ≥2 consumers reales antes de promover. AED no tiene filtros equivalentes. Si el día de mañana surge un caso similar (ej. Memory + otra feature), entonces se extrae. Hoy sería over-engineering.

---

## DM-2 · 2026-05-18 (S36) — Tabla nativa HTML vs `<p-table>` PrimeNG

**Contexto**: la tabla densa de `/conversaciones` tiene 9 columnas, sticky header, hover, selección múltiple, filtros, bulk action bar. Surgía la opción de usar `<p-table>` de PrimeNG.

**Decisión**: HTML table nativa con clase `.table sc-table-zebra` (luego cambiada a `.table-card` + `.table` en S40 #16).

**Razón**: consistencia con AED list-pages (`/admin/agents`, `/users`, `/groups`) que usan tabla nativa. `<p-table>` añade chrome propio (sort UI, paginator) que no necesitamos; reusar el patrón AED reduce surface area de aprendizaje.

---

## DM-1 · 2026-05-18 (S35) — Memory NO es app standalone; comparte shell con AED

**Contexto**: el prototipo React `Memory` vivía como app separada (`memoryplus3.netlify.app`). Al migrar, podía ir como app independiente o como feature module del Supervisor.

**Decisión**: Memory entra como **feature module** dentro de `apps/supervisor/src/app/features/memory/`. El folder se llamaba `apps/aed/` y se renombra a `apps/supervisor/` para reflejar que el shell aloja múltiples productos.

**Razón**: Memory y AED comparten sidebar, topbar, auth, theme, i18n. Tenerlas como apps separadas duplicaría infraestructura y rompería UX (login diferente, sidebar diferente).

**Consecuencia**: el shell Supervisor es agnóstico al producto; los productos viven como feature modules lazy.

---

Última actualización: 2026-05-20 (Session 46).
