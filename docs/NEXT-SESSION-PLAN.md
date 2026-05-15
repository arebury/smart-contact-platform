# NEXT SESSION PLAN — Smart Contact Platform

> **Para Claude en la próxima sesión**: lee este archivo + el último entry de
> [`SESSION-LOG.md`](./SESSION-LOG.md) y arranca por la Fase activa sin
> re-explicación.
>
> **Para Rafa**: cuando abras Claude di literalmente: *"lee
> `docs/NEXT-SESSION-PLAN.md` y arranca"*. Toma desde aquí.

---

## Estado al cerrar (Session 30, 2026-05-15)

**Hitos clave del día**:

- ✅ Fase 1 — paleta `--sc-color-gray-*` → Aura slate cerrada. Audit HTML editorial publicado
  live (`/audits/2026-05-15-palette-slate/diff.html`) + ZIP local en `~/Downloads/`.
- ✅ **Netlify ds-smartcontact desbloqueado** vía Perplexity (plugin `@netlify/angular-runtime`
  removido). Deploy live confirmado, bundle hash actualizado, audit URL devuelve HTML correcto.
- ✅ **13 componentes con spec doc completo** (`packages/design-system/docs/components/01-13`):
  Button, Modal, Toast, Photo upload (?), Toggle, Checkbox, Input, Section card, Bulk action
  bar, Bulk edit menu, Empty state, Form danger zone, Form section nav, etc.
  *(Específicamente cocinados o auditados en Session 30: Input, Input number, Select,
  Multi-select, Datepicker, Tabs, Tooltip, Button, Checkbox, Toast, Modal, Empty state,
  Section card)*.
- ✅ **11 componentes con gallery interactiva en ds-docs**: button, input, input-number,
  select, multi-select, datepicker, tabs, tooltip, toast, modal, checkbox.
- ✅ **Polish ds-docs editorial** (`/ui-ux-pro-max` Swiss Modernism): sidebar reescrito con
  las 11 rutas agrupadas + accent rail; Space Grotesk display + Inter body + JetBrains Mono
  technical; gallery rows con framing "demo" mono label; hero editorial.
- ✅ **Preset cambio global**: `formField.paddingX/Y` ahora `10.5px / 7px` raw (Figma 1:1).
  Afecta input/select/datepicker/multiselect/cualquier formField PrimeNG.

Last commit en main: `e9e809c` (galleries toast/modal/checkbox + row polish).

---

## Fase 1 (activa) — POC migrations en AED

Los componentes cocinados quieren ver uso real en AED para validar el contrato. Tres
candidatos prioritarios:

1. **`<sc-input-number>`** → migrar `aed-grupos-page` (3 inputs con `min="1"` numéricos),
   `aed-servicio-page` (2 fields de segundos), o `group-form-page` capacityValue. El
   primero es el más limpio (3 inputs juntos, contrato form ya numérico). Recipe en
   `docs/components/03-input-number.md`.
2. **`<sc-select>`** → migrar 1-2 `<select>` nativos en AED como POC. Hay 20+ candidatos en
   agent-form-page, group-form-page, config pages. El más simple: `aed-grupos-page` línea
   145 (canal del agente). Recipe en spec doc.
3. **`<sc-multi-select>`** + **`<sc-datepicker>`**: AED aún no tiene usos nativos. Defer
   hasta que aparezca caso real (futura migración de canales del agente, fecha de alta).

**Tiempo estimado por POC**: 30-45 min cada uno (depende del refactor del form contract).

---

## Fase 2 — Extract `_sc-toast.scss` partial compartido

**Problema**: las styles de `.sc-toast` están duplicadas — viven en
`apps/aed/src/app/app.component.scss` Y en
`apps/ds-docs/src/app/pages/toast/toast-gallery.component.scss`. Si una se actualiza y la
otra no, drift.

**Solución**: crear `packages/design-system/styles/_sc-toast.scss` con el bloque común
(sin `:host ::ng-deep` — eso queda en cada wrapper). Ambos consumers lo `@import`.

**Reto**: el `:host ::ng-deep` selector solo funciona dentro de componentes Angular con
view encapsulation. Hay que dejar esos selectores fuera del partial y mantenerlos en cada
consumer.

**Pasos**:

1. Crear `_sc-toast.scss` con todo el `.sc-toast` block (sin selectores `:host`).
2. Refactor AED `app.component.scss` → `@import` el partial + mantener solo `:host ::ng-deep` strips.
3. Refactor ds-docs `toast-gallery.component.scss` igual.
4. Build ambos + verificar visual idéntico.

**Tiempo estimado**: 20-30 min.

---

## Fase 3 — Customs catalog consolidation

Las brand divergences SC están documentadas individualmente en cada spec doc. Cuando
llegues a 5+, extraer a `packages/design-system/docs/customs-catalog.md`:

| Divergencia | Componente | Figma | SC | Razón |
|-------------|-----------|-------|-----|-------|
| Primary color | Button, Modal, Tabs, Select focus, Checkbox checked | azure #3b82f6 | navy `--sc-color-blue-500` | Brand identity SC |
| Info color | Button[severity=info] | sky #0ea5e9 | electric-blue #1464fe | Coherencia con Message/Toast |
| Warn color | Button[severity=warn] | orange #f97316 | amber #f59e0b | Coherencia con Message/Toast |
| Toast secondary | Toast[severity=secondary] | slate (Figma) | violet (SC) | "Neutral notice" pattern |
| Toast action button | Toast | (no slot) | botón "Deshacer" inyectado via data.undoEntryId | Undo pattern |
| Toast icon-square | Toast | glyph desnudo | glyph dentro cuadrado coloreado | Peso visual |
| Modal slot stacking | Modal body | (free) | `display:flex column gap:16` por defecto | Form ergonomics |
| Checkbox 'some' (indeterminate) | Checkbox | (no variant) | mismo bg checked + barra horizontal | Bulk select pattern |

**Tiempo estimado**: 30 min.

---

## Fase 4 (futura, gates ✅ CUMPLIDOS) — Memory consume tokens SCDS ("Camino B")

Los 4 gates están cumplidos:

- [x] Paleta gray reconciliada (Session 30 Fase 1)
- [x] Layer 2 semantic estable (no renames pendientes)
- [x] ≥5-7 componentes con spec doc → **13 specs entregados**
- [x] Brand divergences documentadas (parcialmente en cada spec doc; pendiente
      consolidar a customs-catalog.md — Fase 3 arriba, no bloquea esto)

**Listo para activar cuando el usuario lo pida.** Plan concreto:

1. **Mecanismo de distribución**. Recomendado para empezar: **Camino C (script de copia)**
   — 1 tarde. Migrar a A (git submodule) o B (npm package) si las copias manuales se
   vuelven dolor.
2. **Setup en Memory** (`~/dev/memory/`):
   - Crear `src/styles/sc-tokens/` con las 7 capas copiadas.
   - Importar `01-primitive.css` + `02-semantic.css` desde el entry CSS de Memory.
   - Borrar de Memory cualquier `--*` que duplique un `--sc-*`.
   - Verificar build verde + pantallas no rompen.
3. **Mapping Tailwind → `--sc-*`** (opcional, second pass): extender `tailwind.config.ts`
   de Memory con theme override apuntando colores a `--sc-color-*`.
4. **Documentar en SCDS** que Memory es consumidor en `docs/consumers.md`.

**Tiempo estimado**: 2-4h (Camino C). 6-8h si va por submodule/npm con release pipeline.

---

## Fase 5 — Componentes restantes (por prioridad)

Cuando estés ready para más componentes nuevos:

1. **MessageService → SectionCard demo** en ds-docs (`/components/section-card` + `/components/empty-state` galleries — TODOs Session 31 de sus spec docs).
2. **Autocomplete** (`<sc-autocomplete>`) — defer hasta que AED lo necesite (hoy no lo usa).
3. **TimePicker / DateRange** — extensiones del Datepicker (tokens ya documentados en su
   spec doc; trabajo mecánico).
4. **Componentes Pure SC restantes sin spec doc** — son ~12 (illustrated avatar, bulk
   action bar, bulk edit menu, form danger zone, etc.). Por prioridad de uso en AED.

---

## Reglas operativas (no cambian)

1. **Verificación obligatoria post-claim**: cuando un agente reporte "hecho", pedir 1
   verificación reproducible (curl, screenshot, hash).

2. **Figma 1:1 cuando hay MCP**: ver `feedback_figma_specs_thorough.md` en memoria.
   Extraer variables de TODAS las variantes (estados, sizes, booleanos) antes de codear.
   Documentar divergencias en el spec doc del componente.

3. **Decisiones documentadas**: brand divergence anotada en `customs-catalog.md` (TBD,
   creará cuando rebase las 5 divergencias documentadas individualmente).

4. **CLAUDE.md de cada proyecto se mantiene <10 KB**. Detalle al `docs/`.

5. **Componentes y refactors menores**: directo a `main`. Cambios estructurales gordos:
   rama + PR.

6. **Cuando dudes, pregunta**. Rafa no es dev — opciones claras con tradeoffs.

7. **Nunca clavar un repo en `~/Desktop/`, `~/Documents/` o cualquier ruta con icono ☁️**.
   Usar `~/dev/`. Ver `.notes/journal/2026-05-15-icloud-migration.md`.

8. **Spec doc nuevo cada vez que cocines un componente**. Sigue el patrón de los 13
   actuales: TL;DR / Cuándo / API / Tokens por variant (si Figma) / Divergencias / Migración
   AED / Página demo / Figma reference.
