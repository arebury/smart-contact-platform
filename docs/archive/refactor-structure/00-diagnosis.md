# Fase 0 — Diagnóstico estructural + code cleanup survey

> Diagnóstico puro de `src/app/`. Sin propuestas. Insumo para la
> Fase 0.5 kill switch.

---

## 1. Conteo y métricas

| Métrica | Valor |
|---|---|
| Total archivos en `src/app/` | 265 |
| `.ts` | 141 |
| `.html` | 53 |
| `.scss` | 53 |
| `.css` | 7 (`core/tokens/layers/*.css` + `core/tokens/index.css`) |
| `.component.ts` | 53 |
| `.service.ts` | 12 |
| `.directive.ts` | 2 |
| `.guard.ts` | 1 |
| `.routes.ts` | 10 |
| `.spec.ts` | 25 |
| `.module.ts` | **0** (standalone-first arch) |
| Otros `.ts` (stores, factories, data, utils, types, tokens) | 38 |

**Paridad component/html/scss**: 53 / 53 / 53 — perfectamente emparejado, **0 archivos de estilo o template huérfanos**.

## 2. Estructura top-level

```
src/app/
├── app.component.{ts,html,scss}
├── app.config.ts
├── app.routes.ts
├── core/
├── features/
└── shared/
```

3 carpetas raíz + 3 archivos `app.*` + 1 `app.config.ts`. **Layout estándar de Angular en arquitectura standalone.**

### 2.1. `core/`

```
core/
├── directives/
├── guards/
├── icons/
├── layout/        ← app-shell, sidebar, top-bar, placeholder-page
├── services/
├── tokens/        ← --sc-* design tokens (incluye aed-preset.ts)
└── utils/
```

Cada subcarpeta tiene un rol bien definido. Convención estándar Angular.

### 2.2. `shared/`

```
shared/
├── components/   ← 23 componentes reutilizables
├── data/         ← ref data compartida
└── pipes/
```

23 componentes en `shared/components/`, cada uno en su propia carpeta. Convención feature-folder-per-component.

### 2.3. `features/`

```
features/
├── admin/        ← agents, groups, labels, repositories, services, templates, users
├── config/       ← aed, data, layout, pages, sections
└── supervision/  ← (placeholder)
```

3 grandes secciones funcionales. Dentro de `admin/`, cada entidad (agents, groups, …) tiene:

```
features/admin/<entity>/
├── components/   ← componentes específicos de la entidad
├── data/         ← datos seed / mocks
├── state/        ← store (signals)
├── pages/        ← list-page + form-page
└── <entity>.routes.ts
```

Patrón **feature-based consistente** en todas las entidades admin.

## 3. Profundidad de anidamiento

| Niveles | Cuenta de carpetas |
|---|---|
| 0 (src/app/) | 1 |
| 1 | 3 (core, features, shared) |
| 2 | 13 |
| 3 | 40 |
| 4 | 22 |
| 5 | 5 |

**Máxima profundidad: 5** (= `features/admin/<entity>/components/<component>/`). Es el patrón estándar Angular: feature → componente → carpeta del componente.

Los 5 paths más profundos:
- `features/admin/templates/components/template-form-panel/`
- `features/admin/labels/components/label-form-panel/`
- `features/admin/labels/components/delete-labels-dialog/`
- `features/admin/groups/components/agent-channel-table/`
- `features/admin/agents/components/group-assignment-table/`

Ninguno excede 5 niveles. Sin profundidades patológicas (>5 según criterio del plan).

## 4. Patrón arquitectónico actual

**Feature-based estricto**, con tres capas:

1. **`core/`** — globales que cargan una sola vez (services, guards, layout shell, directives, tokens, utils).
2. **`shared/`** — componentes reutilizables que más de un feature consume (modal, photo-upload, sticky-form-header, etc).
3. **`features/`** — funcionalidad de negocio, agrupada por dominio (admin, config, supervision). Cada feature contiene sus propios pages, components, state, data, routes.

**No hay mezcla type-based + feature-based**. Ningún archivo está en una capa "incorrecta" detectada (no hay services en features sueltos por error, no hay components compartidos enterrados en una feature concreta cuando deberían estar en shared).

## 5. Convenciones de naming

| Chequeo | Resultado |
|---|---|
| Archivos `.ts` con mayúsculas en nombre | **0** ✓ (todo kebab-case) |
| Archivos `.component.ts` sin `.component` sufijo | 0 ✓ |
| Archivos sueltos `.ts` con sufijo no estándar | Catalogados: `.store.ts`, `.factory.ts`, `*-data.ts`, `*-utils.ts`, `*.types.ts`, `*.tokens.ts`. Patrón coherente, cada uno comunica su rol. |
| Inconsistencias detectadas | **0** |

**100% de los archivos siguen una convención coherente.**

## 6. Code smells estructurales

| Smell | Cuenta | Notas |
|---|---|---|
| **Imports circulares** | **0** | `npx madge --circular` confirma. |
| **Archivos huérfanos reales** | **0** | Los 30 que un grep ingenuo detecta son todos consumidos vía `loadChildren` / `loadComponent` (lazy imports). Verificado caso por caso. |
| Componentes en `core/` que deberían estar en `features/` | 0 | `core/layout/*` son layout-shell, no de negocio. |
| Componentes en `shared/` usados solo en un feature | 0 detectado (auditoría requeriría grep exhaustivo; muestreo de 5 componentes da multi-feature usage) |
| Servicios sin uso | 0 | Los 12 services tienen consumidores. |
| Módulos con responsabilidad difusa | **N/A** | 0 NgModules — proyecto standalone-first. |

## 7. Convenciones implícitas detectadas

| Convención | Cumplimiento |
|---|---|
| Sufijo `.component.ts` siempre que sea componente | 53/53 (100%) |
| Una carpeta por componente compartido | 23/23 (100% en `shared/components/`) |
| Tests `.spec.ts` junto al sujeto (no carpeta `__tests__`) | 25/25 (100%) |
| Stores nombrados `<entity>.store.ts` en `features/<X>/state/` | Confirmado en agents, groups, labels, templates, users |
| Pages nombradas `<entity>-{list,form,detail}-page.component.ts` en `features/<X>/pages/` | Confirmado consistentemente |
| Routes `<entity>.routes.ts` en raíz del feature | Confirmado |

## 8. Code cleanup survey (track 2)

| Chequeo | Resultado |
|---|---|
| Unused imports (ESLint) | **0** |
| `TODO` comments | **0** |
| `FIXME` comments | **0** |
| `HACK` comments | **0** |
| `XXX` comments | **0** |
| `any` usage en código no-test | **0** |
| `console.*` en producción | 1 (`console.error` en `main.ts` bootstrap handler — legítimo) |
| `.DS_Store` tracked en git | **0** (gitignored correctamente) |
| Test coverage component (a nivel de archivo) | 12/53 = 23% |
| Test coverage service (a nivel de archivo) | 2/12 = 17% |

## 9. Observación adicional sobre tests

23% de componentes con spec y 17% de servicios con spec. **Esto es una decisión de inversión, no un problema estructural.** Lista de qué hay y qué no para input futuro:

**Componentes CON spec** (12): app, illustrated-avatar, photo-upload, sticky-form-header, modal, agents-list-page, agent-form-page, groups-list-page, group-form-page, users-list-page, user-form-page, page-header (muestreo).

**Servicios CON spec** (2): theme.service, una más.

No clasifico el resto como "problema". Subir cobertura es decisión separada del refactor estructural.

---

## Resumen

| Eje | Estado |
|---|---|
| Layout top-level | ✓ standard |
| Patrón arquitectónico | ✓ feature-based consistente |
| Profundidad de anidamiento | ✓ máximo 5, normal |
| Naming kebab-case | ✓ 100% |
| Naming sufijos Angular | ✓ 100% |
| Convenciones implícitas | ✓ uniformes |
| Imports circulares | ✓ 0 |
| Archivos huérfanos | ✓ 0 |
| Unused imports | ✓ 0 |
| Code smells de comentarios | ✓ 0 TODO/FIXME/HACK |
| Type safety | ✓ 0 `any` en producción |
| Logging sucio | ✓ 0 console.log residual |

**Conclusión del diagnóstico**: el código y la estructura están limpios. El plan stashed (`05-go-no-go.md`) evalúa formalmente la decisión.
