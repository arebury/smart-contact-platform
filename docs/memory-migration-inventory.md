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

## 9. Decisiones pendientes

- ¿Memory main view se llama "Conversaciones" o "Memory" en el sidebar? (Hoy es "Conversaciones" — mantener si encaja conceptualmente. Decidir caso por caso si Marta lo pide.)
- Nombre del wrapper `<sc-data-table>` si Memory lo activa: ¿`sc-data-table`, `sc-table-densa`, `sc-grid`? Decisión cuando trigger real.
