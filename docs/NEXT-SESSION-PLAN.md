# NEXT SESSION PLAN — Smart Contact Platform

> **Para Claude en la próxima sesión**: lee este archivo + el último entry de
> [`SESSION-LOG.md`](./SESSION-LOG.md) y arranca por la Fase activa sin
> re-explicación.
>
> **Para Rafa**: cuando abras Claude di literalmente: *"lee
> `docs/NEXT-SESSION-PLAN.md` y arranca"*. Toma desde aquí.

---

## Estado al cerrar (Session 30, 2026-05-15)

**Hitos clave del día (29 commits)**:

- ✅ Fase 1 — paleta `--sc-color-gray-*` → Aura slate cerrada.
- ✅ Fase 1 (NEXT-SESSION-PLAN previo) — **POC migrations en AED hechas**:
  `<sc-input-number>` x3 + `<sc-select>` x1 en `aed-grupos-page`.
- ✅ Fase 2 — **`_sc-toast.scss` partial extracted** a
  `packages/design-system/styles/`. AED y ds-docs ambos consumen via `@use`.
- ✅ Fase 3 — **`customs-catalog.md` creado** consolidando las 11 brand divergences SC
  vs Figma documentadas durante Session 30 (3 brand colors + 5 component extensions + 1
  overload + 2 sizes off-Figma).
- ✅ **Netlify ds-smartcontact desbloqueado** + 13 specs + 11 galleries live + ds-docs
  polish 2-pass (ui-ux-pro-max baseline + impeccable second pass: status strip, code
  block component, page transitions, sidebar number rotate, hero asymmetric mark,
  sticky meta bar, gallery footer prev/next, asymmetric Swiss padding).
- ✅ `.impeccable.md` design context con regla CRITICAL: polish requests **NUNCA**
  tocan componentes ni tokens — solo el chrome de ds-docs / app shells.

Last commit en main: `3bc4f5f` (customs-catalog).

**4 fases del plan anterior — todas completadas en una sola sesión.**

---

## Fase 1 (activa) — POC migrations en AED, segunda tanda

`<sc-input-number>` y `<sc-select>` ya validados en `aed-grupos-page`. Próxima ronda:

1. **`<sc-input-number>`** → `aed-servicio-page` (3 fields de pausas en segundos),
   `group-form-page` (capacityValue), `aed-grupos-page` resto si queda.
2. **`<sc-select>`** → `aed-grupos-page` restantes (prioridad, estrategia), `agent-form-page`
   (10+ candidatos), `group-form-page`, `user-form-page`.
3. **`<sc-input>`** → migrar los 26 inputs `<sc-input>` restantes en AED (POC ya hecho
   en Session 28 user-form-page; falta agent-form-page, group-form-page, 3 config pages).
4. **`<sc-multi-select>`** → primer caso real en AED — canales del agente
   (`agent-form-page` channel assignment). Hoy es un patrón a mano con checkboxes.

**Tiempo estimado por componente migrado**: 15-30 min según complejidad del form.

---

## Fase 2 — Extract más partials compartidos

Mismo patrón que `_sc-toast.scss`. Candidates:

- **`_sticky-form-header.scss`** — vive en `apps/aed/src/app/shared/components/...`
  pero podría compartirse con ds-docs si añadimos una gallery.
- **`_page-header.scss`** — idem.
- **`_command-palette.scss`** — chrome del Cmd+K que tiene tanto AED como ds-docs
  podría necesitar.

**Cuándo activar**: cuando aparezca un segundo consumer de cada partial. Hoy solo
AED los usa; el partial sería sobre-engineered. Diferir hasta caso real.

---

## Fase 3 — Memory consume tokens SCDS ("Camino B")

Los **4 gates ya están ✅ cumplidos** (paleta cerrada, layer 2 estable, 13 specs, customs
catalog creado). Listo para activar cuando el usuario lo pida.

**Plan concreto** (sin cambios desde sesiones anteriores):

1. Decidir mecanismo: **Camino C (script de copia)** para empezar — 1 tarde.
2. Setup en Memory: crear `src/styles/sc-tokens/` con las 7 capas copiadas + importar
   `01-primitive.css` + `02-semantic.css` desde el entry CSS.
3. Borrar de Memory cualquier `--*` que duplique un `--sc-*`.
4. Verificar build verde + pantallas no rompen.
5. (Opcional) Mapping Tailwind → `--sc-*` en `tailwind.config.ts` de Memory.
6. Documentar en SCDS `docs/consumers.md` que Memory es consumer.

**Tiempo estimado**: 2-4h.

**Importante**: las brand divergences del catálogo NO se transmiten automáticamente.
Memory hereda los tokens vía CSS variables, pero su capa de componentes (React + Radix)
decide conscientemente cuál usar. Ver final de `customs-catalog.md` para guía.

---

## Fase 4 — Más componentes nuevos

Cuando se quiera seguir el catálogo:

1. **Más migrations en AED** (Fase 1 expandida).
2. **Galleries para Pure SC** sin gallery: empty-state, section-card (TODOs spec doc).
3. **Componentes Pure SC sin spec doc** (~12): illustrated avatar, bulk action bar,
   bulk edit menu, form danger zone, etc. Por prioridad de uso en AED.
4. **Componentes nuevos cuando aparezca caso real**:
   - Autocomplete (cuando AED lo necesite)
   - TimePicker / DateRange (extensiones de Datepicker, tokens documentados)
   - SegmentedControl
   - Pagination

---

## Reglas operativas (no cambian)

1. **Polish requests NUNCA tocan componentes ni tokens** (regla CRITICAL en
   `.impeccable.md`). Solo ds-docs vehicle + app shells. Los componentes son
   interpretaciones 1:1 sacred de los tokens Figma.

2. **Figma 1:1 cuando hay MCP**: ver `feedback_figma_specs_thorough.md` en memoria.
   Extraer variables de TODAS las variantes antes de codear. Documentar divergencias
   en spec doc del componente Y en `customs-catalog.md`.

3. **Verificación obligatoria post-claim**: cuando un agente reporte "hecho", pedir 1
   verificación reproducible (curl, screenshot, hash).

4. **CLAUDE.md de cada proyecto se mantiene <10 KB**. Detalle al `docs/`.

5. **Componentes y refactors menores**: directo a `main`. Cambios estructurales gordos:
   rama + PR.

6. **Cuando dudes, pregunta**. Rafa no es dev — opciones claras con tradeoffs.

7. **Nunca clavar un repo en `~/Desktop/`, `~/Documents/` o cualquier ruta con icono ☁️**.
   Usar `~/dev/`. Ver `.notes/journal/2026-05-15-icloud-migration.md`.

8. **Spec doc nuevo cada vez que cocines un componente**. Patrón establecido:
   TL;DR / Cuándo / API / Tokens por variant / Divergencias / Migración AED /
   Página demo / Figma reference. 13 ejemplos en `docs/components/01-13`.

9. **Brand divergence nueva** → entry en `customs-catalog.md` + mention en el spec
   doc del componente afectado. Catalog es la fuente única.

10. **ds-docs vehicle** = polish ok. **packages/design-system/components/** + tokens
    + sc-preset.ts = sacred. Ver `.impeccable.md` para detalle.
