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
- **S38 — Memory Repository SE FUSIONA en el HUB AED Repositorios** (NO existe pantalla `/conversaciones/repositorio` separada). Razones: (1) el prototipo React `Repository.tsx` y el AED `RepositoriosHubPageComponent` ya cumplen el mismo rol conceptual ("hub de configuración"); (2) la sección "estructura sincronizada" (servicios/grupos/agentes) que el prototipo muestra read-only YA está gestionada en AED; (3) Memory queda más focalizada — sidebar → directo a `/conversaciones`. Implementación: cuando Reglas/Categorías/Entidades estén migradas (iters 9/10/11), añadir 3 cards nuevas al `RepositoriosHubPageComponent` AED + decidir destino del `DataExportImport`.

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
