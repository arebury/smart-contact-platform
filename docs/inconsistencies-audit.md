---
title: Auditoría de inconsistencias UI/UX
date: 2026-05-10
session: DD#54 (modal real-fix + impeccable + permisos matriz)
scope: src/app/features/admin/{agents,groups,users}, src/app/features/config/aed
---

# Auditoría de inconsistencias

Comparación de patrones a través de los tres formularios admin (agent / group / user) + la página `/admin/aed/agentes`, después de los cambios de esta sesión. Solo se listan inconsistencias **reales**, no de estilo.

---

## 1. Matriz de permisos duplicada (alta prioridad)

**Síntoma**: dos componentes pintan la misma tabla `destino × {llamada, transferencia}` con CSS independiente.

| Lugar | Clase raíz | Origen |
|---|---|---|
| `agent-form-page.component.html` / `.scss` | `.perm-matrix` | nuevo en esta sesión |
| `aed-agentes-page.component.html` / `.scss` | `.permisos-table` | preexistente |

**Divergencias concretas**:
- Anchos de columna: `.perm-matrix__th-col { width: 140px }` vs `.permisos-table__th-col { width: 30% }`
- Padding celda: `var(--sc-spacing-200)` vs `var(--sc-spacing-100) var(--sc-spacing-200)`
- Header divider: `.perm-matrix thead th` tiene `border-bottom: 1px solid var(--sc-border-default)` directo; `.permisos-table` mete el borde en `&__th-row` / `&__cell` `border-top`
- `.perm-matrix` tiene un `&__head` con icono + título uppercase; `.permisos-table` no, va envuelta por un accordion externo

**Recomendación**: extraer un componente `<aed-permission-matrix>` o, mínimo, mover los estilos a `src/styles/_forms.scss` con una sola clase canónica. Mismo razonamiento que DD#53 con `.checkbox-grid`, `.field` etc.

**Impacto si no se hace**: cuando cambien tokens de spacing o radius, los dos lugares divergirán visualmente sin que nadie lo note.

---

## 2. Toggle "on/off" — tres implementaciones distintas

**Síntoma**: hay tres formas de pintar un switch en la app:

| Implementación | Dónde se usa |
|---|---|
| `<aed-toggle-switch>` (componente compartido) | agent-form (status, recording, permisos), group-form, user-form (status), `agent-channel-table` (col Activo), `group-assignment-table` (col Activo) |
| `.toggle` SCSS local (track + thumb + `<input>` oculto) | `user-form-page.component.scss:124–169` — **declarada pero no usada en el HTML actual** |
| Checkbox crudo con `accent-color` | matriz `.perm-matrix` / `.permisos-table`, `.checkbox-grid` |

**Acción**: borrar `.toggle` muerto de `user-form-page.component.scss` (líneas 124–169) — es código zombi que confunde a quien busca el patrón canónico.

---

## 3. Checkbox de bulk-select — patrones distintos según contexto

**Síntoma**:

| Contexto | Componente |
|---|---|
| Header de columna en `agent-channel-table` (group-form) | `<aed-tri-state-checkbox>` con estados `none / some / all` |
| Header de columna en `.perm-matrix` (agent-form) | `<input type="checkbox">` nativo binario, sin estado indeterminado |
| Header de columna en `.permisos-table` (aed-agentes) | `<input type="checkbox">` nativo binario |

**Por qué importa**: el tri-state ya está construido y testeado. En la matriz de permisos podría aplicar si quieres reflejar "hay algunas filas con llamada activa pero no todas". Hoy en cuanto desmarcas una sola fila el header sigue checked (sería un bug si lo miras de cerca).

**Recomendación**: en una próxima pasada, sustituir las dos cabeceras de matriz por `aed-tri-state-checkbox` para coherencia. No bloqueante; afecta a 6 inputs en total.

---

## 4. Avatar pool inconsistente

| Tabla | Pool | Tamaño |
|---|---|---|
| `agent-channel-table` (agentes en group-form) | `pool="illustrated"` | 26px |
| `group-assignment-table` (grupos en agent-form) | `pool="abstract"` | 22px |

**Justificación**: agentes son personas → ilustración humana; grupos son colecciones → abstracto. Está bien por semántica, **pero los tamaños difieren** (26 vs 22). Igualar a 24 para que las dos tablas tengan misma altura de fila.

---

## 5. Status pill en sticky header — divergencia visual

**Síntoma**:

| Form | Animación pop al cambiar |
|---|---|
| agent-form | `@keyframes status-pop-active/inactive` definido y aplicado |
| group-form | sin animación |
| user-form | sin animación |

`user-form-page.component.scss:99–106` y `group-form-page` definen `.pill--status-active/--status-inactive` con colores hardcoded (`#1a8a4a`, `#1a6a3a`) en vez de los tokens `--sc-presence-available*` que sí usa el agent-form (`agent-form-page.component.scss:226–235`).

**Recomendación**:
1. Mover `.pill` + variantes a `_forms.scss` o un `_pills.scss` nuevo.
2. Reemplazar los hex literales por `--sc-presence-available*` para consistencia con tokens.
3. Aplicar la animación de pop en los tres forms o quitarla del agent-form — decidir uno u otro.

---

## 6. Modal de acciones — dos layouts conviven

**Síntoma**:

| Modal | Layout footer |
|---|---|
| `aed-confirm-host` (descarte de cambios) | 50/50, botones llenan footer (esta sesión) |
| `delete-entity-dialog`, `delete-labels-dialog`, `group-form` delete-dialog | flush-right (default de `<aed-modal>`) |

**Es intencional**: las acciones de "destruir" (delete) viven a la derecha; las acciones de "decidir" (descartar vs continuar) son simétricas. Pero **no está documentado**. Si alguien añade un nuevo `aed-confirm-host` flow va a heredar el 50/50 sin saberlo.

**Recomendación**: añadir una nota en `confirm-host.component.scss` arriba del `:host ::ng-deep` explicando por qué su footer es 50/50 y el del modal base no. Bajo coste, evita confusión futura.

---

## 7. i18n: claves obsoletas — ✓ limpias

`grep -rn col_offer` sobre `src/` no devuelve ninguna referencia residual. `col_channels_here` sigue en uso (renombrada a "Canales en este grupo"). Verificado, nada que hacer.

---

## 8. Anchor IDs entre forms — patrón coherente ✓

Verificado, no es inconsistencia:
- agent-form: `agent-section-{identity|groups|permissions}`
- group-form: `group-section-{identity|agents|...}`
- user-form: `user-section-{identity|sections|permissions|services}`

Bien.

---

## Resumen ejecutivo

| # | Inconsistencia | Severidad | Acción recomendada |
|---|---|---|---|
| 1 | Matriz duplicada `.perm-matrix` vs `.permisos-table` | Alta | Extraer componente o mover a `_forms.scss` |
| 2 | `.toggle` SCSS muerto en user-form | Media | Borrar líneas 124-169 |
| 3 | Tri-state vs binario en headers de matriz | Baja | Sustituir en pasada futura |
| 4 | Tamaño avatar 26 vs 22 | Baja | Igualar a 24 |
| 5 | Pill status con hex literales y sin animación en group/user | Media | Tokenizar + decidir animación |
| 6 | Modal footer 50/50 vs flush-right indocumentado | Baja | Añadir comentario explicativo |
| 7 | i18n `col_offer` huérfana | ✓ Limpio | — |

**Priorización para próxima sesión**: empezar por #1 (más visible y más impacto si tokens cambian) y #2 (5 min, código zombi).
