# Memory Migration Inventory

> Inventario operativo del prototipo Memory React (`arebury/Memory/legacy-react/`) y mapeo a la app Supervisor Angular. Vivo hasta que la migración esté completa.

**Origen**: Session 35 (2026-05-18) — Fase 3 del plan Memory migration (Eje 3 del mapa estratégico).

---

## 1. Vistas top-level del prototipo (5)

Del `App.tsx` del prototipo (state-based, `currentView`):

| View key React | Componente raíz | Qué es | Mapeo Angular |
|---|---|---|---|
| `conversations` | `<ConversationsView>` | Tabla densa de conversaciones con filtros multi-faceted (services, dateRange, origin, destination, groups, agents, type, category, recording, duration, time-range), selección múltiple, bulk actions (transcribir / analizar IA), reproductor modal por conversación. | `/conversaciones` (raíz Memory) |
| `repository` | `<Repository>` | Hub de configuración Memory. Card hero "Reglas" + 2 cards equal "Categorías IA" / "Entidades IA" + pill row read-only de Servicios/Grupos/Agentes sincronizados. Tiene ribbon "Cómo funciona" para first-run. | `/conversaciones/repositorio` |
| `repository-rules` | `<RulesRepository>` | Gestión de reglas (Recording / Transcription / Classification). 3 builders distintos según tipo. | `/conversaciones/repositorio/reglas` |
| `repository-entities` | `<EntityManagement>` | CRUD de entidades IA (tipos a extraer: importes, fechas, productos, identificadores). | `/conversaciones/repositorio/entidades` |
| `repository-categories` | `<CategoriesManagement>` | CRUD de categorías IA (motivos de contacto). Relacionable con reglas (rule→category linking). | `/conversaciones/repositorio/categorias` |

## 2. State / contexts (3)

Providers wrap App, expuestos vía `useRules()` / `useEntities()` / `useCategories()`:

| Context | Estado | Equivalente Angular target |
|---|---|---|
| `RulesContext` | Lista de reglas + CRUD | Signal-based store (`rules.store.ts`) |
| `EntitiesContext` | Lista de entidades + CRUD | Signal-based store |
| `CategoriesContext` | Lista de categorías + CRUD + linking | Signal-based store |

Patrón AED: `state/<name>.store.ts` con signals. Reusar.

## 3. Componentes Memory-específicos a portar (~25)

> **Protocolo anti-desfase de versionado** (regla S39, memoria
> `verify-react-version-before-touch`): el prototipo React es vivo —
> el equipo lo iteran. Antes de tocar/polish un componente ya
> portado, **verificar la versión actual** en el header del archivo
> React (`~/dev/Memory/legacy-react/src/app/components/<Name>.tsx`)
> y compararla con el header del componente Angular. Si hay desfase,
> reportar el delta a Rafa antes de proceder. S39 descubrió desfase
> `BulkTranscriptionModal` Angular v11 vs React v26 (refactor mayor).
>
> En cada commit que migre o actualice un componente Memory, anotar
> la versión que implementa en el header `Component@` del archivo
> Angular y, opcionalmente, en la tabla §3 si se vuelve recurrente.

Filtros / pickers:
- `ConversationFilters`, `TypeFilterButton`/`Panel`, `CategoryFilterButton`/`Panel`, `DurationFilter`, `RecordingFilter`, `TimeRangeFilter`, `DateRangePicker`, `MultiSelectWithSearch`

Tabla y acciones:
- `ConversationTable`, `BulkTranscriptionModal`, `RetranscriptionConfirmModal`

Reproductor:
- `ConversationPlayerModal`, `MultiRecordingPlayer` (audio + transcript chat + summary + sentiment)

Repositorio hub:
- `Repository` (landing), `DataExportImport`

Reglas:
- `RulesRepository`, `RuleQuickViewPanel`, `ClassificationRuleBuilder`, `RecordingRuleBuilder`, `TranscriptionRuleBuilder`, shared builders (`ActiveToggle`, `AdditionalConditions`, `RuleBuilderLayout`, `SelectionCriteria`)

Entidades:
- `EntityManagement`, `CreateEntityModal`, `EditEntitySidepanel`, `EntityTypeSelect`

Categorías:
- `CategoriesManagement`, `CategoriesList`, `CategoriesEmpty`, `CreateCategoryPanel`, `EditCategoryPanel`, `DeleteCategoryDialog`, `CategoryRuleLinking`, `useCategoriesWithRules`

Misc:
- `Breadcrumbs`, `StatusIcons`, `MockSampleSwitcher`, `DocumentationModal`

## 4. Mapeo al sidebar Supervisor

**Slot actual disponible**: `/conversaciones` en `apps/supervisor/src/app/features/supervision/supervision.routes.ts` línea 19 — hoy `placeholder`. **Cero conflicto** con código AED.

Recomendación: **una sola entry sidebar (`/conversaciones`)**, sin sub-items. La nav interna Memory (Repository hub → cards de Reglas/Entidades/Categorías) ya hace el trabajo de sub-navegación. Añadir sub-items en sidebar global duplicaría la navegación que Memory ya tiene diseñada en Figma.

## 5. Wrappers SCDS que Memory probablemente activa

Por trigger real (memoria `minimal-customization`):

| Wrapper SCDS | Estado actual | Trigger Memory probable |
|---|---|---|
| `<sc-datepicker>` | Extended, 0 uses AED | `DateRangePicker` Memory |
| `<sc-multiselect>` | Extended, 0 uses AED | `MultiSelectWithSearch` Memory |
| `<sc-data-table>` (no existe) | Gap nuevo | `ConversationTable` (tabla densa, filtros, selección, sticky) |
| `<sc-audio-player>` (no existe) | Gap nuevo | `MultiRecordingPlayer` + `ConversationPlayerModal` |

`<sc-tag>` y `<sc-toggle-button>` (gaps documentados en backlog #6-8) puede que también encuentren primer trigger en Memory — anotar cuando aparezcan.

## 6. Estructura Angular target

```
apps/supervisor/src/app/features/memory/
├── memory.routes.ts              # lazy routes Memory
├── pages/
│   ├── conversations/            # ConversationsView equivalente
│   ├── repository-hub/           # Repository (landing) equivalente
│   ├── rules/                    # RulesRepository
│   ├── entities/                 # EntityManagement
│   └── categories/               # CategoriesManagement
├── components/                   # Memory-specific (filters, table, player, etc.)
│   ├── filters/
│   ├── conversation-table/
│   ├── conversation-player/
│   ├── rule-builders/
│   └── ...
├── data/                         # mock + types
├── state/                        # signal stores (rules / entities / categories)
└── memory.types.ts
```

## 7. Plan ejecutivo

1. **Fase 4** (próximo paso S35): scaffolding feature module + 1 pantalla placeholder + lazy route conectada + entry en sidebar funcionando.
2. **Fase 5** (sesiones futuras): migración feature por feature comparando con `legacy-react/` durante dev. Cocinar wrappers SCDS nuevos cuando aparezcan.
3. **Fase 6** (cuando tenga features mínimas): switch Netlify `memoryplus3.netlify.app` a alias DNS del shell Supervisor.

## 8. Decisiones cerradas

- Memory entra como feature module (no app separada).
- Sidebar AED queda actualizado (rename apps/aed → apps/supervisor ya ejecutado S35).
- 1 sola entry sidebar (`/conversaciones`); sub-nav es interna del feature Memory.
- React legacy preservado en `arebury/Memory/legacy-react/` + tag `v0-prototype-react-pre-scds`.
- **S38 — Memory Repository SE FUSIONA en el HUB AED Repositorios** (NO existe pantalla `/conversaciones/repositorio` separada). Razones: (1) el prototipo React `Repository.tsx` y el AED `RepositoriosHubPageComponent` ya cumplen el mismo rol conceptual ("hub de configuración"); (2) la sección "estructura sincronizada" (servicios/grupos/agentes) que el prototipo muestra read-only YA está gestionada en AED; (3) Memory queda más focalizada — sidebar → directo a `/conversaciones`. **Ejecutado iter "post-vistas" S38**: las 3 cards de la sección "IA" del `RepositoriosHubPageComponent` AED ahora apuntan a `/conversaciones/reglas`, `/conversaciones/entidades`, `/conversaciones/categorias` (antes placeholder `/admin/*-ia`). El enlace "Ver repositorio" de cada dimensión del Alcance en el RuleBuilder apunta a `/admin/repositorios`. `DataExportImport` del prototipo Memory queda diferido (sin ubicación todavía — anotar §10 si se decide).

## 9. Decisiones pendientes

- ¿Memory main view se llama "Conversaciones" o "Memory" en el sidebar? (Hoy es "Conversaciones" — mantener si encaja conceptualmente. Decidir caso por caso si el equipo de diseño lo pide.)
- Nombre del wrapper `<sc-data-table>` si Memory lo activa: ¿`sc-data-table`, `sc-table-densa`, `sc-grid`? Decisión cuando trigger real.

## 10. Diferidos post-v1 / post-rollout

> Funcionalidades del prototipo React que NO entran en el primer rollout
> Memory en producción. Anotadas según se descartan durante la migración
> para no perderlas de vista. Cada entry debe quedar trazable a un trigger
> concreto que la reabra.

| # | Item | Origen | Versión | Trigger para reabrir |
|---|---|---|---|---|
| 1 | ~~**Re-transcribir** desde `ConversationPlayerModal`~~ ✅ **Resuelto S46**: botón `RotateCcw` low-key en `.player-tabs__actions` (visible solo si `c.hasTranscription`) + `<sc-memory-retranscription-confirm-modal>` con type-CONFIRMAR gate (mismo patrón que `delete-entity-dialog`) + reusa `dispatchTranscription` existente (sticky toast progress + processingIds). Patrón sibling al player en `conversations-page.component.html` para evitar p-dialog anidado. Bonus: player `[isTranscribing]`/`[isAnalyzing]` ahora bindeados a `processingIds`/`analyzingIds` derivados → el tab body pinta estado procesando en vivo durante el dispatch. Verificado Playwright (open conv → click retrans → WRONG disabled → CONFIRMAR enabled → modal cierra → player muestra `player-state--processing`). | — | — |
| 2 | ~~**`MultiRecordingPlayer`** para llamadas multi-tramo IVR~~ ✅ **Resuelto S46**: cocinado `<sc-memory-multi-recording-player>` (réplica 1:1 del React `MultiRecordingPlayer.tsx`). 3 filas en surface bordered: transport (back10/play/fwd10 + tiempo cumulativo del tramo activo) + segmented bar proporcional (active leg con fill + playhead; inactivos solo visuales) + leg labels (radiogroup con flechas ←↑→↓, ancho proporcional al tramo). Integrado en `ConversationPlayerModalComponent` con switch `isMultiRecording = recordings.length > 1`. Player gestiona `selectedRecordingId`, `totalDuration` computa del tramo activo, currentTime resetea al cambiar. Verificado Playwright con AC1023WW (IVR 04:12 + COLA_PRUEBA 11:30): 2 segments + 2 labels render, click leg switch resetea time, playhead visible al play, navegación flecha izquierda funcional. MOCK ONLY (no backend audio). | — | — |
| 3 | ~~**Cocinar `<sc-audio-player>` como wrapper SCDS**~~ ⏸️ **Declinado S46 con justificación**: (a) sin Figma spec del Kit Pro SC (regla `feedback_figma_link_before_component` bloquea cocinar SCDS sin spec); (b) no hay 2 consumers reales — solo Memory usa transport (single en player modal + multi-rec); el bar/scrub difiere entre ambos (single global vs active-segment overlay), solo se solaparían los 3 botones back10/play/fwd10 que son demasiado simples para abstraer; (c) memoria `feedback_minimal_customization` lo descarta. Re-abrir si: aparece consumer EXTERNO a Memory (ej. agent profile audio, recording preview AED) **O** el equipo de diseño entrega Figma spec del audio player SCDS. Mientras tanto, si llega 3ª duplicación → partial SCSS `_sc-audio-transport.scss`, no SCDS component. | Consumer externo a Memory **O** Figma spec | — |
| 4 | ~~**Modal "Download" heredado SC**~~ ✅ **Resuelto S54**: el modal con checkboxes (Grabaciones + Chats, aviso GDPR fijo) ya existía desde S47 — `<sc-memory-download-modal>` en `features/memory/components/download-modal/`. Lo que faltaba: el handler `onDownloadConfirmed` solo emitía toast info. Ahora genera blob JSON real con metadata + transcripción + análisis filtrados por opts, crea `URL.createObjectURL` + trigger click, fichero `memory-export-{id}-{timestamp}.json`. Mock GDPR export visible: el usuario ve un fichero bajado real, no solo toast. i18n key nueva `memory.player.download_success` × 4 locales. En producción real backend, este handler llamará al endpoint con `opts` como payload y backend devolverá ZIP con audios + transcripciones. | — | — |
| 5 | ~~**Sticky toast post-confirmación bulk**~~ ✅ **Resuelto pre-S54** (verificado durante audit S54): `dispatchWithStickyToast()` en `conversations-page.ts` ya implementa el flow completo. Toast `sticky: true` + `closable: true` con `key: 'dispatch-progress'` fijo + update in-place tras transcripción → "Generando análisis…" si toggleOn → cierre por success / partial / all-failed final con severities apropiadas (success/warn/error) y `life: 3500-6000ms`. Réplica 1:1 del prototipo React `referencia-ui.md §"sticky toast durante el batch"`. | — | — |
| 6 | ~~**Hint "Excluye K en proceso"** en subtitle del `BulkTranscriptionModal`~~ ✅ **Resuelto pre-S54** (verificado audit S54): `heroDeltaHint` en `bulk-transcription-modal.component.ts` líneas 174-196 ya implementa la lógica completa. `nInProgress` derivado de `processingIds + analyzingIds` inputs del modal; cuando > 0 muestra "Excluye N en proceso." Wired desde `conversations-page` via `[processingIds]="processingIdsArray()"` + `[analyzingIds]="analyzingIdsArray()"` (líneas 56-57 template). El usuario ve el hint cuando abre el bulk modal mientras hay un dispatch previo en vuelo. | — | — |
| 7 | ~~**Hint multi-tramo** en subtitle bulk~~ ✅ **Resuelto pre-S54** (verificado audit S54): mismo `heroDeltaHint` lineas 181-189. Cuando `nMultiRec > 0 && !toggleOn` → "Incluye N llamadas con varios tramos". Cuando `nPartialMultiRec > 0` → "N con tramos ya iniciados". Funcional con sample `multi-tramo-parcial` (#18 § ya existente). | — | — |
| 8 | **Eyebrow "ACCIÓN MASIVA"** en header del bulk modal | `bulk-transcription-modal.md §7 línea 167`. El `sc-dialog` canonical SCDS no expone slot `eyebrow`. | refactor SCDS | Si más de 1 consumer pide eyebrow → añadir `[eyebrow]` input a `sc-dialog` (no proxy con subtitle, no rompe a-11y). Entry derivada en `packages/design-system/docs/inconsistencies-backlog.md`. |
| 9 | **Toast de error + chip "Solo fallidas"** | Estado mixto S54: el **chip "Solo fallidas"** YA implementado en `conversation-filters.component` (gate `failedCount() > 0`, toggle `onlyFailed` filter); el **toast de fallidos** YA emite warn/error con count de failed/success en `dispatchWithStickyToast` (líneas 261-278 conversations-page) — life 6000ms para que el usuario lea con calma; el **botón "Ver fallidas" dentro del toast** NO está implementado y se aplaza: requiere arquitectura cross-component (toast global app-shell ↔ filter local conversations-page) con CustomEvent o navegación con query param. Decisión S54: no añadir el botón, el chip rojo en toolbar ya cumple el rol "acción para revisar fallidas" con prominencia visible. Si UX research valida que falta affordance directa, reabrir con CustomEvent pattern. | UX research valida que el chip no basta | Si tests revelan que usuarios pierden los fallidos tras cerrar el toast, implementar botón "Ver fallidas" en toast con CustomEvent `sc:memory:view-failed` que active filter onlyFailed. |
| 10 | **Enlace "Ver repositorio" en RuleBuilder** (3 dimensiones del Alcance: Servicios / Grupos ACD / Agentes) | Spec `rule-constructor-update.md §EVIDENCIAR EL ORIGEN`. ~~Iter 9c-1: `href="javascript:void(0)"` sin acción.~~ ✅ **Resuelto iter post-vistas S38**: `routerLink="/admin/repositorios"` (HUB) en las 3 dimensiones. Apertura en nueva pestaña (`target="_blank"`). | — | Trigger: si el equipo pide enlaces granulares por dimensión (Servicios → ruta concreta servicios AED, Grupos → /admin/groups, Agentes → /admin/agents), reabrir. |
| 11 | **`DataExportImport` del prototipo Memory** — Export/Import de la configuración Memory (reglas + categorías + entidades) en JSON | `Repository.tsx` legacy React. La decisión B fusión hubs eliminó la pantalla Memory donde vivía. | producción real | Cuando se priorice migración bulk del config Memory entre instancias. Posible ubicación: card extra en HUB AED categoría "ai", o slot dentro de cada sub-página Memory. Decisión el equipo cuando aparezca trigger. |
| 12 | ~~**Synonyms granulares por valor list en EntityFormModal**~~ ✅ **Resuelto S48**: refactor `EntityFormModal` con tipo interno `ListValueDraft = { value, synonymsCsv, expanded }`. UI 1:1 con React legacy: card per value con input principal + trigger "Añadir sinónimos, separados por comas" (text-xs dotted underline) → click expande input synonyms con label. Persistencia: `synonymsCsv` split por comma → `EntityListValue.synonyms: string[]` al `onSave`. Edit mode reconstruye CSV de `synonyms.join(', ')` + `expanded` si `synonyms.length > 0`. Sin layout shift (expand es action explícita usuario). i18n 3 keys nuevas (es/en/fr/pt). Verificado Playwright ad-hoc: create entity list + value "Madrid" + synonyms "MAD, mad, madrid_capital" + value "Barcelona" sin synonyms + save + reopen edit → synonyms persisten correctamente y Barcelona mantiene collapsed. | — | — |
| 13 | ~~**CategoryRuleLinking interactivo bidireccional**~~ ✅ **Resuelto S49**: refactor 3-piezas. (a) `Rule.categorias?: readonly string[]` fuente de verdad + `RulesStore.rulesByCategoryId` computed + `linkCategoryToRule`/`unlinkCategoryFromRule`. (b) `<sc-multiselect>` en RuleBuilder Análisis IA cuando `type=classification + aiAnalysis ON` (reemplaza chip read-only). (c) `CategoryFormModal` interactivo 4 variantes React 1:1 (empty/no-link+rules/linked+active/linked+inactive) con `<p-select>` filtrable + lista unlink hover-reveal. Tokens reutilizados: `--sc-label-amber-*` (banner) + `--sc-label-green-*` (success) — 0 nuevos. `Category.usedInRules` y `Category.linkedRules` removidos del tipo (derivado en runtime → sin estado duplicado). 18 i18n keys × 4 locales. Verificado: tsc + build + Playwright 14/14 verde. | — | — |
| 14 | **Templates predefinidos en CategoryFormModal** | `CreateCategoryPanel.tsx` React tiene Dialog secundario con 4 plantillas predefinidas (Queja, Intención de baja, Competencia, Incidencia). ~~Iter 11b: sin templates.~~ ✅ **Resuelto S39 (iter 11c)**: portado al Angular `CategoryFormModal`. Botón "Empezar desde una plantilla" solo en modo Create; abre dialog secundario con 4 cards (icono + título + hint) que prellenan name + description al click. Constants `CATEGORY_TEMPLATES` en el componente con los textos largos del prototipo. | — | — |
| 15 | **Iconografía cluster Estado en `ConversationTable`** | El prototipo React tiene iconos específicos Memory para grabación / transcripción / análisis (sí/no) que aplican según el estado de la fila. ~~Hoy la tabla Angular hereda iconos genéricos del cluster status.~~ ✅ **Resuelto S40**: cocinado `<sc-memory-status-icon>` con 6 SVG inline (paths exactos de `StatusIcons.tsx` legacy-react) + `resolveStatus()` con la misma lógica de precedencia analyzing > processing > hasAnalysis > hasTranscription > hasRecording. Paleta reducida (sec 15.21 audit): gray `--sc-text-muted` para rest, teal `--sc-text-info` para in-flight/completed. Animación pulse opacity 1100ms cuando processing/analyzing. Overlays preservados: failed badge bottom-right + multi-recording count badge top-right. Revertida la decisión sparring S37 de 3-5 lucides separados. | — | — |
| 16 | **Estilo tabla `/conversaciones` ← adoptar tablas AED** | Las tablas de `/admin/agents`, `/admin/groups`, `/admin/users` están más estilizadas que la de Memory `/conversaciones` (decisión Rafa S39). ~~Aplicar el styling AED a Memory~~. ✅ **Resuelto S40**: adoptado chrome AED en `conversation-table.component.scss` localmente — `.table-card` (border + radius + overflow-hidden), thead bg-default uppercase tracked, tr border-bottom subtle (zebra eliminado), td spacing-200 + text-secondary, hover bg-default. Preservada densidad Memory + sticky header + shimmer is-processing/is-analyzing. Deuda de extracción a partial compartido SCDS anotada como entry #32 en `inconsistencies-backlog.md` (trigger: 5º consumer del patrón). | — | — |
| 17 | **Paddings .page/.page__inner Memory list-pages** | Audit visual S42 detectó: las 4 pages Memory (conversations, rules, entities, categories) usaban `<div class="page"><div class="page__inner">` sin estilos → tabla recorría el full-width del main-content en vez del max-width 1600 + padding 500/600 como AED. ✅ **Resuelto S42**: chrome scoped en las 4 pages. Duplicación cross-app anotada como entry #33 en `inconsistencies-backlog.md` (trigger 9º consumer). | — | — |
| 18 | **Mock samples Memory ampliados** | Audit visual S42 detectó: switcher tenía 7 escenarios pero faltaban 4 casuísticas críticas del COA (`/Users/rafareses/dev/memory/docs/coa-transcripcion-masiva.md`). ✅ **Resuelto S42**: switcher pasa de 7 → 11 escenarios. Nuevos: `only-failed` (estado terminal rojo + chip filter), `gdpr-expired` (filas atenuadas excluidas del bulk), `multi-tramo-parcial` (caveat operacional con tramos transcritos + pendientes), `no-recording` (estado #2 pestaña Transcripción). Estados runtime (`processingIds`/`analyzingIds`/recientemente cambiada) NO se pueden vía sample — se demuestran con el botón Procesar. | — | — |
| 19 | **UX click-row Memory vs AED** | ~~Audit S44 detectó delta UX~~. ✅ **Cerrado S46 con voto (a)**: mantener Memory click→select. Justificación: AED `/admin/*` y Memory `/conversaciones` tienen modelos mentales distintos pese a compartir shell — AED edita entidades (click→form-edit, patrón GitHub/Linear), Memory revisa datos + bulk-process (click→select, patrón Gmail/Outlook). No es inconsistencia gratuita; son dos affordances válidas según producto. El bulk flow (transcribir/marcar leídas/analizar IA) es el caso de uso jugoso de Memory: un click ya selecciona, fricción mínima. El `<sc-memory-status-icon>` como botón dedicado para abrir el player ya cumple su rol con affordance visual obvia. Mitigación si el equipo de diseño valida en user test que la inconsistencia molesta: tooltip on row-hover "Click para seleccionar · Click en icono de estado para abrir conversación". Lo pone en docs/tooltip, no en cambiar la mecánica. | — | — |
| 20 | **Sticky-save rule-builder** | Audit S44: rule-builder lineal con 4-5 secciones stackeadas → save al final, sin pin. AED forms tienen `sc-sticky-form-header` (sticky TOP) pero rule-builder NO es comparable (no tiene tabs sidebar; es wizard). ✅ **Resuelto S44**: aplicado `position: sticky; bottom: 0` al `.rule-builder__foot` con soft shadow upward + z-index 5. Mantiene el wizard lineal + save siempre visible. Coherente con el patrón `sc-bulk-action-bar` overlay sticky-bottom de conversations-page. | — | — |
| 21 | **Bug `<sc-memory-mock-sample-switcher>` popover** | ~~S45 Rafa reportó 2 bugs visuales del popover de samples (11 entries post-S42)~~. ✅ **Resuelto S46**: fix dual en `mock-sample-switcher.component.scss`: (a) `.mock-sample-switcher__list` con `max-height: 70vh; overflow-y: auto; overscroll-behavior: contain` → scroll interno cuando 11 entries no caben; (b) `::ng-deep .mock-sample-switcher__popover { z-index: var(--sc-z-popover) !important }` (1080) > z-index del `sc-page-header` sticky (1030 vía `--sc-z-sticky-form-header`) → popover siempre encima del header tras scroll. Causa raíz confirmada: PrimeNG asigna z-index dinámico arrancando en ~1000 (debajo del sticky page-header). Verificado Playwright: scrollHeight 971 > clientHeight 630 + popoverZ=1080 vs pageHeaderZ=1030 + 0 console.errors. | — | — |
| 22 | **Parar procesamiento IA (transcripciones / análisis)** | Decisión Rafa S54 al discutir Bloque D Undo Entity CRUD: el undo de mutaciones entity (crear/editar/eliminar agente/grupo/usuario) sí entra ahora, pero "parar el proceso de generación de transcripción y análisis" NO es factible sin backend real (el dispatch IA hoy es mock síncrono). Va a roadmap. Cuando exista pipeline real de procesamiento + abort signal, añadir botón "Parar" en el sticky toast `progress-toast` (#5) y/o en la row del estado processing/analyzing. Implementación: AbortController por job + endpoint backend que cancele queue, sin colas de espera nuevas en frontend. | Rafa S54 (briefing previo a Bloque D) | Producción real | Cuando exista pipeline IA real con endpoint de cancel/abort. Fase avanzada post-rollout IRL. Mientras tanto, el dispatch mock síncrono no necesita cancel. |
| 23 | ~~**Help popover de documentación en toolbar `/conversaciones`**~~ ⏸️ **Descartado S59** (decisión Rafa): el patrón legacy tenía sentido cuando Memory/conversaciones y AED eran *proyectos separados* con docs propias (las 4 URLs apuntaban a `github.com/arebury/Memory/blob/main/docs/*`). Con el shell Supervisor **unificado** (AED + Memory + Config en una sola app), un popover per-toolbar que enlaza a documentación de "otro proyecto" ya no aplica: la documentación es del monorepo entero y el onboarding a conceptos vive en ds-docs, no en un CTA por-superficie. Contexto audit original: Audit S58 bloque C ("buscar oro"): el React `ConversationsView.tsx:813-907` tiene un botón `HelpCircle` en el toolbar derecho que abre popover con 4 enlaces (2 tier-1 con descripción + icon accent-strong: Calculator → lógica-de-conteo, Palette → sistema-de-diseño; separator; 2 tier-2 muted: BookOpen → decisiones de diseño, ExternalLink → Validar UX en Figma). Las URLs originales apuntan a `github.com/arebury/Memory/blob/main/docs/*` (legacy repo, posiblemente roto post-monorepo). El Angular `conversations-page.component.html` NO tiene este botón. Distinto de §10 item DocumentationModal (declinado S46 — modal markdown inline, no popover de links). | ~~Trigger original: UX research / onboarding stakeholders nuevos.~~ **No se reabre como popover per-`/conversaciones`.** Único reabridor válido: que el equipo defina un sistema de **ayuda contextual transversal a TODA la app Supervisor** (feature distinto del shell, no un CTA aislado en una toolbar de superficie). | ~~P2~~ N/A (descartado) | S58 audit C → descarte S59 |

> Convención: cada vez que durante la migración Memory se descarte algo
> "porque es v2 / post-v1 / fuera de alcance", entry aquí inmediato con
> origen + trigger. Sin tabla viva, los descartes se evaporan.

## 11. Inconsistencias entre docs Memory pendientes de resolver

> Discrepancias entre los docs canónicos del repo Memory que detecto durante
> la migración. Cada entry necesita decisión el equipo sobre cuál doc gana.
> Mientras no se resuelva, la implementación Angular sigue la opción
> indicada en columna "Decisión Claude iter actual" como pragmática.

| # | Tema | `logica-de-conteo.md` | `decisiones.md` | Decisión Claude iter actual |
|---|---|---|---|---|
| A | Filtrado de filas "en proceso" antes del bulk modal | "Las conversaciones en proceso se deseleccionan **silenciosamente antes de abrir el modal**" (§180-189). El modal nunca las recibe. | "El BulkTranscriptionModal filtra silenciosamente las filas en proceso y las de retención vencida antes de calcular su contador grande. El modal muestra 'Incluye 8. Excluye 2 en proceso.'" (§213-226). El modal sí las recibe y las muestra como excluidas. | Sigue `logica-de-conteo.md` (excluir antes). El mock no tiene `processingIds` aún, así que el punto es teórico. Cuando se implemente dispatch real (item #6 §10), el equipo deciden cuál interpretación gana. |
