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
> Rafa y Marta lo iteran. Antes de tocar/polish un componente ya
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
| `<sc-multi-select>` | Extended, 0 uses AED | `MultiSelectWithSearch` Memory |
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

- ¿Memory main view se llama "Conversaciones" o "Memory" en el sidebar? (Hoy es "Conversaciones" — mantener si encaja conceptualmente. Decidir caso por caso si Marta lo pide.)
- Nombre del wrapper `<sc-data-table>` si Memory lo activa: ¿`sc-data-table`, `sc-table-densa`, `sc-grid`? Decisión cuando trigger real.

## 10. Diferidos post-v1 / post-rollout

> Funcionalidades del prototipo React que NO entran en el primer rollout
> Memory en producción. Anotadas según se descartan durante la migración
> para no perderlas de vista. Cada entry debe quedar trazable a un trigger
> concreto que la reabra.

| # | Item | Origen | Versión | Trigger para reabrir |
|---|---|---|---|---|
| 1 | **Re-transcribir** desde `ConversationPlayerModal` (icono `RotateCcw` low-key + `RetranscriptionConfirmModal` destructivo) | `referencia-ui.md §2` declara "post-v1". Prototipo React lo tiene visible. | post-v1 | Cuando producto valide flujo destructivo (sobrescribe transcript + análisis derivado). Trae consigo `RetranscriptionConfirmModal`. |
| 2 | **`MultiRecordingPlayer`** para llamadas multi-tramo IVR (transport + segmented bar + leg labels en superficie unificada) | Prototipo React `MultiRecordingPlayer.tsx`. Mock tiene 1 conversation con `recordings.length > 1` (AC1023WW). | iter Memory siguiente | Cuando se priorice fidelidad multi-leg en producción. Iter 5 renderiza single-player con la primera grabación. |
| 3 | **Cocinar `<sc-audio-player>` como wrapper SCDS** | Política SCDS ≥2 consumers. Hoy solo `ConversationPlayerModal` lo necesita. | trigger 2º consumer | Cuando `MultiRecordingPlayer` (item #2) entre como segundo consumer del transport. Extraer la lógica de scrub/play/transport a wrapper. |
| 4 | **Modal "Download" heredado SC** (checkboxes Grabaciones + Grabaciones/Chats marcados por defecto + aviso "Deleted or empty conversations won't download") | `referencia-ui.md §2 línea 218`. v1 simplifica a toast `scToast.info({ title: 'Descargando audio' })`. | producción real | Cuando Memory pase a producción y el endpoint de descarga real esté operativo. Hoy el botón muestra solo toast. |
| 5 | **Sticky toast post-confirmación bulk** ("Generando transcripción…" `duration: Infinity`, `id: progress-toast` con × manual; upgrade in-place a "Generando análisis…" si toggle ON; cierre con success final) | `logica-de-conteo.md §1 "Sticky toast durante el batch"` + `coa-transcripcion-masiva.md §"Mientras se procesa"`. Iter 6b muestra toast simple de dispatch (life 3s). | iter 7+ Memory | Cuando exista pipeline real de procesamiento (no mock). Necesita mecanismo de toasts persistentes con update in-place (Sonner-like). |
| 6 | **Hint "Excluye K en proceso"** en subtitle del `BulkTranscriptionModal` | `decisiones.md §"protección contra acciones duplicadas"`. Mock no tiene estado `processingIds` todavía. | iter Memory + estado proceso | Cuando se introduzca `processingIds` en el store (al implementar dispatch real). Hoy nunca hay items en proceso → caption innecesario. |
| 7 | **Hint multi-tramo** en subtitle bulk: "Incluye N llamadas con varios tramos" / "M con tramos ya iniciados" | `logica-de-conteo.md §1 "Comunicación al supervisor"`. AC1023WW es el único mock multi-rec. | iter Memory + transcripción por tramo | Cuando el dispatcher distinga IDs de conversación vs IDs de tramo. Hoy `nTrans` cuenta conversaciones, no tramos pendientes. |
| 8 | **Eyebrow "ACCIÓN MASIVA"** en header del bulk modal | `bulk-transcription-modal.md §7 línea 167`. El `sc-modal` canonical SCDS no expone slot `eyebrow`. | refactor SCDS | Si más de 1 consumer pide eyebrow → añadir `[eyebrow]` input a `sc-modal` (no proxy con subtitle, no rompe a-11y). Entry derivada en `packages/design-system/docs/inconsistencies-backlog.md`. |
| 9 | **Toast de error con acción "Ver fallidas"** + chip rojo toolbar + filtro permanente "Solo fallidas" | `logica-de-conteo.md §1 "Cuando una transcripción falla"`. Iter 6b no procesa de verdad → no hay fallos. | iter procesamiento real | Cuando el dispatch llame backend real. Trae consigo el campo `showOnlyFailed` al store + integración con chip toolbar. |
| 10 | **Enlace "Ver repositorio" en RuleBuilder** (3 dimensiones del Alcance: Servicios / Grupos ACD / Agentes) | Spec `rule-constructor-update.md §EVIDENCIAR EL ORIGEN`. ~~Iter 9c-1: `href="javascript:void(0)"` sin acción.~~ ✅ **Resuelto iter post-vistas S38**: `routerLink="/admin/repositorios"` (HUB) en las 3 dimensiones. Apertura en nueva pestaña (`target="_blank"`). | — | Trigger: si Marta/Rafa pide enlaces granulares por dimensión (Servicios → ruta concreta servicios AED, Grupos → /admin/groups, Agentes → /admin/agents), reabrir. |
| 11 | **`DataExportImport` del prototipo Memory** — Export/Import de la configuración Memory (reglas + categorías + entidades) en JSON | `Repository.tsx` legacy React. La decisión B fusión hubs eliminó la pantalla Memory donde vivía. | producción real | Cuando se priorice migración bulk del config Memory entre instancias. Posible ubicación: card extra en HUB AED categoría "ai", o slot dentro de cada sub-página Memory. Decisión Marta/Rafa cuando aparezca trigger. |
| 12 | **Synonyms granulares por valor list en EntityFormModal** | `CreateEntityModal.tsx` React permite per-value synonyms (UI collapsable per row). Iter 10b: valores list flat, sin synonyms granulares. | trigger Marta/Rafa | Si la IA requiere matching por sinónimos por valor (ej. producto "SC Pro" reconocer "Smart Contact Pro", "plan profesional"). Hoy el array `synonyms: []` se persiste vacío. Refactor template: collapsable row + array de inputs per synonym. |
| 13 | **CategoryRuleLinking interactivo bidireccional** | `CategoryRuleLinking.tsx` (561 líneas) — permite linkar/unlinkar reglas desde la categoría. Iter 11b: sección "Reglas que la usan" READ-ONLY (lista + enlace a editar regla). | trigger Marta/Rafa + extender Rule type | Requiere: (a) extender `Rule` con `categorias: readonly string[]`, (b) selector de categorías IA en RuleBuilder (sección Análisis IA), (c) UI interactiva en CategoryFormModal para añadir/quitar reglas desde la categoría. Es refactor 3-piezas. Decisión: añadir solo cuando dispatch real necesite esta relación. |
| 14 | **Templates predefinidos en CategoryFormModal** | `CreateCategoryPanel.tsx` React tiene Dialog secundario con 4 plantillas predefinidas (Queja, Intención de baja, Competencia, Incidencia). ~~Iter 11b: sin templates.~~ ✅ **Resuelto S39 (iter 11c)**: portado al Angular `CategoryFormModal`. Botón "Empezar desde una plantilla" solo en modo Create; abre dialog secundario con 4 cards (icono + título + hint) que prellenan name + description al click. Constants `CATEGORY_TEMPLATES` en el componente con los textos largos del prototipo. | — | — |
| 15 | **Iconografía cluster Estado en `ConversationTable`** | El prototipo React tiene iconos específicos Memory para grabación / transcripción / análisis (sí/no) que aplican según el estado de la fila. ~~Hoy la tabla Angular hereda iconos genéricos del cluster status.~~ ✅ **Resuelto S40**: cocinado `<sc-memory-status-icon>` con 6 SVG inline (paths exactos de `StatusIcons.tsx` legacy-react) + `resolveStatus()` con la misma lógica de precedencia analyzing > processing > hasAnalysis > hasTranscription > hasRecording. Paleta reducida (sec 15.21 audit): gray `--sc-text-muted` para rest, teal `--sc-text-info` para in-flight/completed. Animación pulse opacity 1100ms cuando processing/analyzing. Overlays preservados: failed badge bottom-right + multi-recording count badge top-right. Revertida la decisión sparring S37 de 3-5 lucides separados. | — | — |
| 16 | **Estilo tabla `/conversaciones` ← adoptar tablas AED** | Las tablas de `/admin/agents`, `/admin/groups`, `/admin/users` están más estilizadas que la de Memory `/conversaciones` (decisión Rafa S39). ~~Aplicar el styling AED a Memory~~. ✅ **Resuelto S40**: adoptado chrome AED en `conversation-table.component.scss` localmente — `.table-card` (border + radius + overflow-hidden), thead bg-default uppercase tracked, tr border-bottom subtle (zebra eliminado), td spacing-200 + text-secondary, hover bg-default. Preservada densidad Memory + sticky header + shimmer is-processing/is-analyzing. Deuda de extracción a partial compartido SCDS anotada como entry #32 en `inconsistencies-backlog.md` (trigger: 5º consumer del patrón). | — | — |
| 17 | **Paddings .page/.page__inner Memory list-pages** | Audit visual S42 detectó: las 4 pages Memory (conversations, rules, entities, categories) usaban `<div class="page"><div class="page__inner">` sin estilos → tabla recorría el full-width del main-content en vez del max-width 1600 + padding 500/600 como AED. ✅ **Resuelto S42**: chrome scoped en las 4 pages. Duplicación cross-app anotada como entry #33 en `inconsistencies-backlog.md` (trigger 9º consumer). | — | — |
| 18 | **Mock samples Memory ampliados** | Audit visual S42 detectó: switcher tenía 7 escenarios pero faltaban 4 casuísticas críticas del COA (`/Users/rafareses/dev/memory/docs/coa-transcripcion-masiva.md`). ✅ **Resuelto S42**: switcher pasa de 7 → 11 escenarios. Nuevos: `only-failed` (estado terminal rojo + chip filter), `gdpr-expired` (filas atenuadas excluidas del bulk), `multi-tramo-parcial` (caveat operacional con tramos transcritos + pendientes), `no-recording` (estado #2 pestaña Transcripción). Estados runtime (`processingIds`/`analyzingIds`/recientemente cambiada) NO se pueden vía sample — se demuestran con el botón Procesar. | — | — |
| 19 | **UX click-row Memory vs AED** | Audit S44 detectó delta UX: en `<sc-memory-conversation-table>` el click en una row hace `selectionToggled.emit(conv.id)` (marca el checkbox) — solo el click en `<sc-memory-status-icon>` abre el player. En AED list-pages (agents/users/groups), click en row → abre form-edit; el checkbox es la única vía de selección. Inconsistencia ergonómica: usuario que viene de AED espera click→edit, en Memory obtiene click→select. COA Memory documenta "click en icono de estado abre el reproductor" pero NO especifica qué hace click-en-resto-de-row. Decisión pendiente Rafa: (a) mantener Memory click→select porque la selección masiva es el flujo dominante (transcripción/marcar como leídas/etc.), (b) cambiar a click→player para alinear con AED, o (c) hacer doble-click→player y click→select. | iter UX validation Memory | — |
| 20 | **Sticky-save rule-builder** | Audit S44: rule-builder lineal con 4-5 secciones stackeadas → save al final, sin pin. AED forms tienen `sc-sticky-form-header` (sticky TOP) pero rule-builder NO es comparable (no tiene tabs sidebar; es wizard). ✅ **Resuelto S44**: aplicado `position: sticky; bottom: 0` al `.rule-builder__foot` con soft shadow upward + z-index 5. Mantiene el wizard lineal + save siempre visible. Coherente con el patrón `sc-bulk-action-bar` overlay sticky-bottom de conversations-page. | — | — |
| 21 | **Bug `<sc-memory-mock-sample-switcher>` popover** | ~~S45 Rafa reportó 2 bugs visuales del popover de samples (11 entries post-S42)~~. ✅ **Resuelto S46**: fix dual en `mock-sample-switcher.component.scss`: (a) `.mock-sample-switcher__list` con `max-height: 70vh; overflow-y: auto; overscroll-behavior: contain` → scroll interno cuando 11 entries no caben; (b) `::ng-deep .mock-sample-switcher__popover { z-index: var(--sc-z-popover) !important }` (1080) > z-index del `sc-page-header` sticky (1030 vía `--sc-z-sticky-form-header`) → popover siempre encima del header tras scroll. Causa raíz confirmada: PrimeNG asigna z-index dinámico arrancando en ~1000 (debajo del sticky page-header). Verificado Playwright: scrollHeight 971 > clientHeight 630 + popoverZ=1080 vs pageHeaderZ=1030 + 0 console.errors. | — | — |

> Convención: cada vez que durante la migración Memory se descarte algo
> "porque es v2 / post-v1 / fuera de alcance", entry aquí inmediato con
> origen + trigger. Sin tabla viva, los descartes se evaporan.

## 11. Inconsistencias entre docs Memory pendientes de resolver

> Discrepancias entre los docs canónicos del repo Memory que detecto durante
> la migración. Cada entry necesita decisión Rafa/Marta sobre cuál doc gana.
> Mientras no se resuelva, la implementación Angular sigue la opción
> indicada en columna "Decisión Claude iter actual" como pragmática.

| # | Tema | `logica-de-conteo.md` | `decisiones.md` | Decisión Claude iter actual |
|---|---|---|---|---|
| A | Filtrado de filas "en proceso" antes del bulk modal | "Las conversaciones en proceso se deseleccionan **silenciosamente antes de abrir el modal**" (§180-189). El modal nunca las recibe. | "El BulkTranscriptionModal filtra silenciosamente las filas en proceso y las de retención vencida antes de calcular su contador grande. El modal muestra 'Incluye 8. Excluye 2 en proceso.'" (§213-226). El modal sí las recibe y las muestra como excluidas. | Sigue `logica-de-conteo.md` (excluir antes). El mock no tiene `processingIds` aún, así que el punto es teórico. Cuando se implemente dispatch real (item #6 §10), Rafa/Marta deciden cuál interpretación gana. |
